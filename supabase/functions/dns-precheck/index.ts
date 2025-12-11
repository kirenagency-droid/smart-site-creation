import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DnsPreCheckRequest {
  domain: string;
}

interface DnsPreCheckResponse {
  valid: boolean;
  hasNameservers: boolean;
  currentARecord: string | null;
  currentCNAME: string | null;
  message: string;
  details: {
    nsRecords: string[];
    aRecord: string | null;
    cnameRecord: string | null;
  };
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { domain }: DnsPreCheckRequest = await req.json();

    if (!domain) {
      return new Response(
        JSON.stringify({ valid: false, message: 'Domaine requis' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Clean domain input
    const cleanDomain = domain
      .trim()
      .toLowerCase()
      .replace(/^(https?:\/\/)?(www\.)?/, '')
      .replace(/\/+$/, '');

    console.log(`🔍 Pre-checking DNS for: ${cleanDomain}`);

    let nsRecords: string[] = [];
    let currentARecord: string | null = null;
    let currentCNAME: string | null = null;

    // Check NS records (validates domain exists)
    try {
      const nsResponse = await fetch(`https://dns.google/resolve?name=${cleanDomain}&type=NS`);
      const nsData = await nsResponse.json();
      console.log('NS response:', nsData);
      nsRecords = nsData.Answer?.filter((r: { type: number }) => r.type === 2).map((r: { data: string }) => r.data.replace(/\.$/, '')) || [];
    } catch (e) {
      console.error('NS check failed:', e);
    }

    // Check current A record
    try {
      const aResponse = await fetch(`https://dns.google/resolve?name=${cleanDomain}&type=A`);
      const aData = await aResponse.json();
      console.log('A record response:', aData);
      currentARecord = aData.Answer?.find((r: { type: number }) => r.type === 1)?.data || null;
    } catch (e) {
      console.error('A record check failed:', e);
    }

    // Check current CNAME for www
    try {
      const cnameResponse = await fetch(`https://dns.google/resolve?name=www.${cleanDomain}&type=CNAME`);
      const cnameData = await cnameResponse.json();
      console.log('CNAME response:', cnameData);
      currentCNAME = cnameData.Answer?.find((r: { type: number }) => r.type === 5)?.data?.replace(/\.$/, '') || null;
    } catch (e) {
      console.error('CNAME check failed:', e);
    }

    const hasNS = nsRecords.length > 0;
    const isValid = hasNS;

    let message: string;
    if (!hasNS) {
      message = "Ce domaine n'existe pas ou n'a pas de nameservers configurés. Vérifiez l'orthographe.";
    } else if (currentARecord === '76.76.21.21') {
      message = '✅ Domaine déjà configuré correctement pour Creali !';
    } else if (currentARecord) {
      message = `Domaine valide. A record actuel: ${currentARecord} (à changer vers 76.76.21.21)`;
    } else {
      message = 'Domaine valide. Aucun A record configuré - prêt pour la configuration.';
    }

    const response: DnsPreCheckResponse = {
      valid: isValid,
      hasNameservers: hasNS,
      currentARecord,
      currentCNAME,
      message,
      details: {
        nsRecords,
        aRecord: currentARecord,
        cnameRecord: currentCNAME
      }
    };

    console.log(`Pre-check result for ${cleanDomain}:`, response);

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('DNS pre-check error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Pre-check failed';
    return new Response(
      JSON.stringify({ valid: false, message: `Erreur: ${errorMessage}` }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
