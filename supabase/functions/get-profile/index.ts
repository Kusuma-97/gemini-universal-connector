import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const body = await req.json();
    const user_id = body.user_id;
    // Return the user data back — in demo mode, localStorage is the source of truth
    // We echo back whatever the client sent so syncProfile doesn't wipe local data
    return new Response(JSON.stringify({
      status: "ok",
      user: {
        id: user_id,
        name: body.name || undefined,
        email: body.email || undefined,
        initials: body.initials || undefined,
        avatar: body.avatar || undefined,
        bio: body.bio || undefined,
        signedIn: true,
      },
      history: body.history || []
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: "Server error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
