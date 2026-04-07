import { supabase } from "@/integrations/supabase/client";
import type { QuizQuestion, QuizSettings } from "./types";

export async function generateQuiz(
  text: string,
  settings: QuizSettings
): Promise<QuizQuestion[]> {
  const { data, error } = await supabase.functions.invoke("generate-quiz", {
    body: {
      text,
      difficulty: settings.difficulty,
      numQuestions: settings.numQuestions,
      focusTopic: settings.focusTopic,
    },
  });

  if (error) throw new Error(error.message || "Failed to generate quiz");
  if (data?.error) throw new Error(data.error);
  return data.quiz;
}

export async function generateSummary(text: string): Promise<string> {
  const { data, error } = await supabase.functions.invoke("generate-summary", {
    body: { text },
  });

  if (error) throw new Error(error.message || "Failed to generate summary");
  if (data?.error) throw new Error(data.error);
  return data.summary;
}
