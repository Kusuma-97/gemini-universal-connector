export interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

export interface QuizSettings {
  difficulty: "easy" | "medium" | "hard";
  numQuestions: number;
  focusTopic: string;
}

export type InputMethod = "text" | "topic";

export type AppView = "input" | "loading" | "quiz" | "results" | "summary";
