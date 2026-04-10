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

    const difficultyGuide = {
      easy: "Test basic recall and recognition. Distractors should be clearly wrong to someone who read the material. Questions should focus on definitions, key facts, and straightforward concepts.",
      medium: "Test understanding and application. Distractors should be plausible but distinguishable with good comprehension. Include some 'why' and 'how' questions alongside 'what' questions.",
      hard: "Test analysis, inference, and deep understanding. Distractors should be very plausible — common misconceptions or partial truths. Require connecting multiple concepts or applying knowledge to new scenarios."
    }[difficulty] || "";

    const systemPrompt = `You are an expert quiz creator and educator. Your job is to create high-quality, accurate multiple-choice questions that genuinely test understanding.

STRICT RULES:
1. Every question MUST have exactly ONE unambiguously correct answer
2. Every correct answer MUST be factually accurate and verifiable
3. All 4 options must be plausible and grammatically consistent
4. The correct answer index (0-3) MUST be randomly distributed — do NOT favor index 0 or any pattern
5. Explanations must clearly state WHY the correct answer is right and briefly why others are wrong
6. No trick questions, no "all of the above", no "none of the above"
7. Each question must test a distinct concept — no repetition
8. Return ONLY a valid JSON array — no markdown fences, no commentary

JSON format: [{"question":"...","options":["A","B","C","D"],"correct":0,"explanation":"..."}]`;

    let prompt: string;
    if (text.startsWith("__DIRECT__")) {
      const topic = text.slice(10).trim();
      const focus = focusTopic || topic;
      prompt = `Create ${numQuestions} multiple-choice quiz questions about "${focus}".

Difficulty level: ${difficulty}
${difficultyGuide}

Requirements:
- Questions must be factually accurate and based on well-established knowledge
- Cover ${numQuestions} distinct subtopics/aspects of "${focus}"
- Each question should have exactly 4 options with one clearly correct answer
- Distribute correct answer positions randomly across 0, 1, 2, 3
- Write a concise explanation for each answer

Return ONLY the JSON array.`;
    } else {
      prompt = `Create ${numQuestions} multiple-choice questions based STRICTLY on the following content.${focusTopic ? ` Focus particularly on: ${focusTopic}.` : ""}

Difficulty level: ${difficulty}
${difficultyGuide}

Requirements:
- Every answer MUST be directly supported by the provided content
- Do NOT introduce external information not present in the content
- Cover different sections/aspects of the content
- Each question should have exactly 4 options with one clearly correct answer
- Distribute correct answer positions randomly across 0, 1, 2, 3
- Explanations should reference the relevant part of the content

CONTENT:
${text.slice(0, 30000)}

Return ONLY the JSON array.`;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
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
    // Strip markdown fences if present
    raw = raw.replace(/^```(?:json)?\s*/g, "").replace(/\s*```\s*$/g, "").trim();

    let quiz;
    try {
      quiz = JSON.parse(raw);
    } catch {
      const m = raw.match(/\[[\s\S]*\]/);
      if (m) quiz = JSON.parse(m[0]);
      else throw new Error("Failed to parse quiz JSON");
    }

    // Validate quiz structure
    if (!Array.isArray(quiz)) throw new Error("Quiz is not an array");
    quiz = quiz.filter(q =>
      q.question && Array.isArray(q.options) && q.options.length === 4 &&
      typeof q.correct === "number" && q.correct >= 0 && q.correct <= 3 &&
      q.explanation
    );
    if (quiz.length === 0) throw new Error("No valid questions generated");

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
