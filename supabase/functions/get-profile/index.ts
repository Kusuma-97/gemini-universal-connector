import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const body = await req.json();
    const { access_token } = body;

    if (!access_token) {
      // Guest mode — echo back client data
      return new Response(JSON.stringify({
        status: "ok",
        user: body.user || null,
        history: body.history || [],
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: `Bearer ${access_token}` } } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ status: "ok", user: null, history: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    // Get quiz history
    const { data: results } = await supabase
      .from("quiz_results")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50);

    const meta = user.user_metadata || {};
    const name = profile?.display_name || meta.name || user.email?.split("@")[0] || "User";
    const initials = meta.initials || name.slice(0, 2).toUpperCase();

    return new Response(JSON.stringify({
      status: "ok",
      user: {
        id: user.id,
        name,
        email: user.email,
        initials,
        avatar: profile?.avatar_url || "gradient",
        bio: profile?.bio || "",
        signedIn: true,
      },
      history: (results || []).map((r: any) => ({
        date: r.created_at,
        score: r.score_pct,
        total: r.num_questions,
        difficulty: r.difficulty,
        source: r.source_type,
        topic: r.topic,
      })),
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("get-profile error:", e);
    return new Response(JSON.stringify({ error: "Server error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
