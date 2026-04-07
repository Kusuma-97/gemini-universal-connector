import type { QuizQuestion, QuizSettings } from "./types";

const AI_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

async function callAI(systemPrompt: string, userPrompt: string): Promise<string> {
  const apiKey = import.meta.env.VITE_LOVABLE_API_KEY;
  if (!apiKey) throw new Error("VITE_LOVABLE_API_KEY not configured");

  const res = await fetch(AI_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    }),
  });

  if (res.status === 429) throw new Error("Rate limited — please wait a moment and try again.");
  if (res.status === 402) throw new Error("Credits exhausted — please add funds in Settings > Workspace > Usage.");
  if (!res.ok) throw new Error(`AI request failed: ${res.status}`);

  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "";
}

export async function generateQuiz(
  text: string,
  settings: QuizSettings
): Promise<QuizQuestion[]> {
  const { difficulty, numQuestions, focusTopic } = settings;
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

  const raw = await callAI("You are a quiz generator. Return only valid JSON arrays.", prompt);
  const cleaned = raw.replace(/^```(?:json)?\s*/g, "").replace(/\s*```\s*$/g, "").trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    const m = cleaned.match(/\[[\s\S]*\]/);
    if (m) return JSON.parse(m[0]);
    throw new Error("Failed to parse quiz response");
  }
}

export async function generateSummary(text: string): Promise<string> {
  return callAI(
    "You are an educational summarizer. Create clear, student-friendly summaries focusing on key concepts.",
    `Summarize the following educational content clearly for a student. Focus on key concepts. Avoid unnecessary detail.\n\nContent:\n${text.slice(0, 30000)}`
  );
}
