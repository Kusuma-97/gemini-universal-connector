import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const text = body.text;
    const difficulty = body.difficulty || "medium";
    const numQuestions = body.numQuestions || body.num_questions || 5;
    const focusTopic = body.focusTopic || body.focus_topic || "";
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const dNote =
      difficulty === "easy" ? "simple recall, obvious distractors"
      : difficulty === "hard" ? "inference required, subtle distractors"
      : "moderate, plausible distractors";

    let prompt: string;
    if (text.startsWith("__DIRECT__")) {
      const topic = text.slice(10);
      const focus = focusTopic || topic;
      prompt = `Create ${numQuestions} MCQ quiz questions about ${focus}.
Difficulty: ${difficulty} (${dNote}).
Each question: 4 options, correct index (0-3), 1-sentence explanation.
Vary correct index. Cover distinct subtopics.
Return ONLY a JSON array (no markdown, no extra text):
[{"question":"","options":["","","",""],"correct":0,"explanation":""}]`;
    } else {
      prompt = `Create ${numQuestions} MCQ questions from this content.
Difficulty: ${difficulty} (${dNote}).${focusTopic ? ` Focus on: ${focusTopic}.` : ""}
Rules: answerable from content · 4 options · vary correct index · 1-sentence explanation · no repetition.
Return a JSON array ONLY (no markdown, no extra text):
[{"question":"","options":["","","",""],"correct":0,"explanation":""}]

CONTENT:
${text.slice(0, 30000)}`;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are a quiz generator. Return only valid JSON arrays. No markdown fences." },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (response.status === 429) {
      return new Response(JSON.stringify({ error: "Rate limited — please wait and try again." }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (response.status === 402) {
      return new Response(JSON.stringify({ error: "Credits exhausted — add funds in Settings > Workspace > Usage." }), {
        status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!response.ok) {
      const t = await response.text();
      console.error("AI error:", response.status, t);
      throw new Error("AI request failed");
    }

    const data = await response.json();
    let raw = data.choices?.[0]?.message?.content ?? "";
    raw = raw.replace(/^```(?:json)?\s*/g, "").replace(/\s*```\s*$/g, "").trim();

    let quiz;
    try {
      quiz = JSON.parse(raw);
    } catch {
      const m = raw.match(/\[[\s\S]*\]/);
      if (m) quiz = JSON.parse(m[0]);
      else throw new Error("Failed to parse quiz JSON");
    }

    return new Response(JSON.stringify({ quiz }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("quiz error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
