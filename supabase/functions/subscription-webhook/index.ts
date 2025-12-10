import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[SUBSCRIPTION-WEBHOOK] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    if (!stripeKey) throw new Error('STRIPE_SECRET_KEY is not set');
    if (!webhookSecret) throw new Error('STRIPE_WEBHOOK_SECRET is not set');

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the raw body and signature
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    if (!signature) {
      logStep('ERROR', { message: 'Missing stripe-signature header' });
      return new Response(
        JSON.stringify({ error: 'Missing stripe-signature header' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify the webhook signature
    let event: Stripe.Event;
    try {
      event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
      logStep('Webhook verified', { type: event.type });
    } catch (err) {
      logStep('ERROR', { message: 'Webhook signature verification failed', error: err instanceof Error ? err.message : String(err) });
      return new Response(
        JSON.stringify({ error: 'Webhook signature verification failed' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const eventType = event.type;
    const eventData = event.data.object as any;

    logStep('Processing event', { type: eventType, objectId: eventData.id });

    // Get user ID from metadata or customer lookup
    let userId = eventData.metadata?.user_id;

    if (!userId && eventData.customer) {
      const { data: existingSub } = await supabase
        .from('subscriptions')
        .select('user_id')
        .eq('stripe_customer_id', eventData.customer)
        .maybeSingle();

      userId = existingSub?.user_id;
      logStep('User lookup by customer', { customerId: eventData.customer, userId });
    }

    if (!userId) {
      logStep('ERROR', { message: 'No user_id found for webhook event' });
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Handle different webhook events
    switch (eventType) {
      case 'checkout.session.completed': {
        if (eventData.payment_status === 'paid') {
          const plan = determinePlanFromAmount(eventData.amount_total || 0);
          const subscriptionPlan = mapPlanToSubscriptionPlan(plan);
          
          await supabase
            .from('subscriptions')
            .upsert({
              user_id: userId,
              plan: plan,
              subscription_plan: subscriptionPlan,
              status: 'active',
              stripe_customer_id: eventData.customer,
              stripe_subscription_id: eventData.subscription,
              updated_at: new Date().toISOString()
            }, { onConflict: 'user_id' });

          await supabase
            .from('profiles')
            .update({ plan: plan })
            .eq('id', userId);

          // Set initial credit balance based on plan
          const creditBalance = getCreditBalanceForPlan(subscriptionPlan);
          await supabase
            .from('credit_balances')
            .upsert({
              user_id: userId,
              current_credits: creditBalance,
              updated_at: new Date().toISOString()
            }, { onConflict: 'user_id' });

          logStep('Subscription activated', { userId, plan, subscriptionPlan, credits: creditBalance });
        }
        break;
      }

      case 'customer.subscription.updated': {
        const newStatus = mapStripeStatus(eventData.status || '');
        
        await supabase
          .from('subscriptions')
          .update({
            status: newStatus,
            current_period_start: eventData.current_period_start 
              ? new Date(eventData.current_period_start * 1000).toISOString()
              : null,
            current_period_end: eventData.current_period_end 
              ? new Date(eventData.current_period_end * 1000).toISOString()
              : null,
            cancel_at_period_end: eventData.cancel_at_period_end || false,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId);

        logStep('Subscription updated', { userId, status: newStatus });
        break;
      }

      case 'customer.subscription.deleted': {
        await supabase
          .from('subscriptions')
          .update({
            status: 'canceled',
            plan: 'free',
            subscription_plan: 'free',
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId);

        await supabase
          .from('profiles')
          .update({ plan: 'free' })
          .eq('id', userId);

        // Trigger domain deactivation
        await supabase.rpc('deactivate_expired_domains');
        
        // Handle subscription downgrade (cap credits, deactivate domains)
        await supabase.rpc('handle_subscription_downgrade', { user_uuid: userId });

        logStep('Subscription canceled', { userId });
        break;
      }

      case 'invoice.payment_failed': {
        await supabase
          .from('subscriptions')
          .update({
            status: 'past_due',
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId);

        logStep('Payment failed', { userId });
        break;
      }

      case 'invoice.payment_succeeded': {
        await supabase
          .from('subscriptions')
          .update({
            status: 'active',
            current_period_end: eventData.lines?.data?.[0]?.period?.end 
              ? new Date(eventData.lines.data[0].period.end * 1000).toISOString()
              : null,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId);

        // Reactivate custom domains if they were deactivated
        const { data: userDomains } = await supabase
          .from('custom_domains')
          .select('id')
          .eq('user_id', userId)
          .eq('is_active', false)
          .eq('deactivation_reason', 'subscription_expired');

        if (userDomains && userDomains.length > 0) {
          await supabase
            .from('custom_domains')
            .update({
              is_active: true,
              deactivation_reason: null,
              updated_at: new Date().toISOString()
            })
            .eq('user_id', userId)
            .eq('deactivation_reason', 'subscription_expired');

          logStep('Domains reactivated', { userId, count: userDomains.length });
        }

        logStep('Payment succeeded', { userId });
        break;
      }

      default:
        logStep('Unhandled event type', { type: eventType });
    }

    return new Response(
      JSON.stringify({ received: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep('ERROR', { message: errorMessage });
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Determine plan from payment amount (in cents)
function determinePlanFromAmount(amount: number): string {
  // Prices in cents (EUR)
  if (amount >= 225000) return 'pro_extreme';  // 2250€
  if (amount >= 20000) return 'pro_ultra';     // 200€
  if (amount >= 10000) return 'pro_max';       // 100€
  if (amount >= 5000) return 'pro_plus';       // 50€
  if (amount >= 2500) return 'pro';            // 25€
  return 'pro';
}

// Map plan string to subscription_plan enum
function mapPlanToSubscriptionPlan(plan: string): string {
  const planMap: Record<string, string> = {
    'pro': 'pro',
    'pro_plus': 'pro_plus',
    'pro_max': 'pro_max',
    'pro_ultra': 'pro_ultra',
    'pro_extreme': 'pro_extreme',
    'free': 'free'
  };
  return planMap[plan] || 'pro';
}

// Get credit balance for plan
function getCreditBalanceForPlan(plan: string): number {
  const creditMap: Record<string, number> = {
    'free': 5,
    'pro': 100,
    'pro_plus': 200,
    'pro_max': 400,
    'pro_ultra': 800,
    'pro_extreme': 10000
  };
  return creditMap[plan] || 100;
}

// Map Stripe status to our status
function mapStripeStatus(stripeStatus: string): string {
  const statusMap: Record<string, string> = {
    'active': 'active',
    'past_due': 'past_due',
    'canceled': 'canceled',
    'unpaid': 'past_due',
    'incomplete': 'past_due',
    'incomplete_expired': 'expired',
    'trialing': 'active',
  };
  return statusMap[stripeStatus] || 'active';
}
