import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
};

interface WebhookEvent {
  type: string;
  data: {
    object: {
      id: string;
      customer: string;
      status?: string;
      current_period_end?: number;
      current_period_start?: number;
      cancel_at_period_end?: boolean;
      metadata?: {
        user_id?: string;
      };
      subscription?: string;
      amount_total?: number;
      payment_status?: string;
    };
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse the webhook payload
    const payload: WebhookEvent = await req.json();
    const eventType = payload.type;
    const eventData = payload.data.object;

    console.log(`Webhook received: ${eventType}`);
    console.log('Event data:', JSON.stringify(eventData, null, 2));

    // Get user ID from metadata or customer lookup
    let userId = eventData.metadata?.user_id;

    if (!userId && eventData.customer) {
      // Lookup user by Stripe customer ID
      const { data: existingSub } = await supabase
        .from('subscriptions')
        .select('user_id')
        .eq('stripe_customer_id', eventData.customer)
        .maybeSingle();

      userId = existingSub?.user_id;
    }

    if (!userId) {
      console.error('No user_id found for webhook event');
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Handle different webhook events
    switch (eventType) {
      // Checkout completed - New subscription
      case 'checkout.session.completed': {
        if (eventData.payment_status === 'paid') {
          const plan = determinePlanFromAmount(eventData.amount_total || 0);
          
          await supabase
            .from('subscriptions')
            .upsert({
              user_id: userId,
              plan: plan,
              status: 'active',
              stripe_customer_id: eventData.customer,
              stripe_subscription_id: eventData.subscription,
              updated_at: new Date().toISOString()
            }, { onConflict: 'user_id' });

          // Also update profile plan
          await supabase
            .from('profiles')
            .update({ plan: plan })
            .eq('id', userId);

          console.log(`Subscription activated for user ${userId}: ${plan}`);
        }
        break;
      }

      // Subscription updated (plan change, renewal, etc.)
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

        console.log(`Subscription updated for user ${userId}: status=${newStatus}`);
        break;
      }

      // Subscription canceled
      case 'customer.subscription.deleted': {
        await supabase
          .from('subscriptions')
          .update({
            status: 'canceled',
            plan: 'free',
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId);

        // Update profile plan
        await supabase
          .from('profiles')
          .update({ plan: 'free' })
          .eq('id', userId);

        // Trigger domain deactivation
        await supabase.rpc('deactivate_expired_domains');

        console.log(`Subscription canceled for user ${userId}`);
        break;
      }

      // Payment failed
      case 'invoice.payment_failed': {
        await supabase
          .from('subscriptions')
          .update({
            status: 'past_due',
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId);

        console.log(`Payment failed for user ${userId}`);
        break;
      }

      // Invoice paid (renewal)
      case 'invoice.payment_succeeded': {
        await supabase
          .from('subscriptions')
          .update({
            status: 'active',
            current_period_end: eventData.current_period_end 
              ? new Date(eventData.current_period_end * 1000).toISOString()
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

          console.log(`Reactivated ${userDomains.length} domains for user ${userId}`);
        }

        console.log(`Payment succeeded for user ${userId}`);
        break;
      }

      default:
        console.log(`Unhandled event type: ${eventType}`);
    }

    return new Response(
      JSON.stringify({ received: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Webhook processing failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Helper to determine plan from payment amount (in cents)
function determinePlanFromAmount(amount: number): string {
  // Adjust these values based on your actual pricing
  if (amount >= 9900) return 'agency'; // 99€
  if (amount >= 3900) return 'pro';    // 39€
  return 'pro'; // Default to pro
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
