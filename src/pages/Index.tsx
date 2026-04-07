import { useState, useCallback } from "react";
import Header from "@/components/Header";
import InputPanel from "@/components/InputPanel";
import QuizView from "@/components/QuizView";
import ResultsView from "@/components/ResultsView";
import SummaryView from "@/components/SummaryView";
import LoadingState from "@/components/LoadingState";
import FeedbackDialog from "@/components/FeedbackDialog";
import { generateQuiz, generateSummary } from "@/lib/ai";
import { toast } from "sonner";
import type { QuizQuestion, QuizSettings, InputMethod, AppView } from "@/lib/types";

const Index = () => {
  const [view, setView] = useState<AppView>("input");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [summary, setSummary] = useState("");
  const [score, setScore] = useState({ score: 0, total: 0 });
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerateQuiz = useCallback(async (text: string, _method: InputMethod, settings: QuizSettings) => {
    setIsLoading(true);
    setView("loading");
    try {
      const q = await generateQuiz(text, settings);
      setQuestions(q);
      setView("quiz");
    } catch (e: any) {
      toast.error(e.message || "Failed to generate quiz");
      setView("input");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleGenerateSummary = useCallback(async (text: string) => {
    setIsLoading(true);
    setView("loading");
    try {
      const s = await generateSummary(text);
      setSummary(s);
      setView("summary");
    } catch (e: any) {
      toast.error(e.message || "Failed to generate summary");
      setView("input");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleFinish = (s: number, t: number) => {
    setScore({ score: s, total: t });
    setView("results");
  };

  const reset = () => setView("input");

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container max-w-3xl mx-auto py-8 px-4">
        {view === "input" && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold tracking-tight mb-2">Generate a Quiz Instantly</h2>
              <p className="text-muted-foreground">Paste any text or enter a topic — AI creates quiz questions for you</p>
            </div>
            <InputPanel
              onGenerateQuiz={handleGenerateQuiz}
              onGenerateSummary={handleGenerateSummary}
              isLoading={isLoading}
            />
            <div className="flex justify-center">
              <FeedbackDialog />
            </div>
          </div>
        )}
        {view === "loading" && <LoadingState />}
        {view === "quiz" && (
          <QuizView questions={questions} onFinish={handleFinish} onRestart={reset} />
        )}
        {view === "results" && (
          <ResultsView score={score.score} total={score.total} onRestart={() => setView("quiz")} onBack={reset} />
        )}
        {view === "summary" && <SummaryView summary={summary} onBack={reset} />}
      </main>
    </div>
  );
};

export default Index;
