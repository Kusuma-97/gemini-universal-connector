import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { email, password, name, initials } = await req.json();
    if (!email || !password || !name) {
      return new Response(JSON.stringify({ error: "All fields required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!
    );

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name, initials: initials || name.slice(0, 2).toUpperCase() } },
    });

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const user = data.user;
    const ini = initials || name.slice(0, 2).toUpperCase();

    return new Response(JSON.stringify({
      status: "ok",
      user: {
        id: user?.id,
        email,
        name,
        initials: ini,
        avatar: "gradient",
        signedIn: true,
        access_token: data.session?.access_token,
        refresh_token: data.session?.refresh_token,
      },
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("signup error:", e);
    return new Response(JSON.stringify({ error: "Server error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
