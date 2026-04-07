import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, ArrowRight, RotateCcw } from "lucide-react";
import type { QuizQuestion } from "@/lib/types";

interface Props {
  questions: QuizQuestion[];
  onFinish: (score: number, total: number) => void;
  onRestart: () => void;
}

const QuizView = ({ questions, onFinish, onRestart }: Props) => {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);

  const q = questions[current];
  const isCorrect = selected === q.correct;
  const isLast = current === questions.length - 1;

  const handleSelect = (idx: number) => {
    if (answered) return;
    setSelected(idx);
    setAnswered(true);
    if (idx === q.correct) setScore((s) => s + 1);
  };

  const handleNext = () => {
    if (isLast) {
      onFinish(score, questions.length);
    } else {
      setCurrent((c) => c + 1);
      setSelected(null);
      setAnswered(false);
    }
  };

  const optionLetters = ["A", "B", "C", "D"];

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="flex items-center justify-between">
        <Badge variant="secondary" className="text-sm">
          Question {current + 1} of {questions.length}
        </Badge>
        <Badge variant="outline" className="text-sm">
          Score: {score}/{current + (answered ? 1 : 0)}
        </Badge>
      </div>
      <div className="w-full bg-muted rounded-full h-2">
        <div
          className="gradient-primary h-2 rounded-full transition-all duration-500"
          style={{ width: `${((current + (answered ? 1 : 0)) / questions.length) * 100}%` }}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="p-6 shadow-card">
            <h3 className="text-lg font-semibold mb-5">{q.question}</h3>

            <div className="grid gap-3">
              {q.options.map((opt, idx) => {
                let variant = "outline" as const;
                let extraClass = "justify-start text-left h-auto py-3 px-4 ";
                if (answered && idx === q.correct) {
                  extraClass += "border-success bg-success/10 ";
                } else if (answered && idx === selected && !isCorrect) {
                  extraClass += "border-destructive bg-destructive/10 ";
                } else if (!answered) {
                  extraClass += "hover:border-primary hover:bg-primary/5 ";
                }

                return (
                  <Button
                    key={idx}
                    variant={variant}
                    className={extraClass}
                    onClick={() => handleSelect(idx)}
                    disabled={answered}
                  >
                    <span className="font-semibold mr-3 text-muted-foreground">{optionLetters[idx]}</span>
                    {opt}
                    {answered && idx === q.correct && <CheckCircle2 className="ml-auto h-5 w-5 text-success shrink-0" />}
                    {answered && idx === selected && !isCorrect && idx !== q.correct && <XCircle className="ml-auto h-5 w-5 text-destructive shrink-0" />}
                  </Button>
                );
              })}
            </div>

            {answered && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-5"
              >
                <div className={`p-4 rounded-lg text-sm ${isCorrect ? "bg-success/10 border border-success/30" : "bg-destructive/10 border border-destructive/30"}`}>
                  <p className="font-medium mb-1">{isCorrect ? "✅ Correct!" : "❌ Incorrect"}</p>
                  <p className="text-muted-foreground">{q.explanation}</p>
                </div>

                <div className="flex gap-3 mt-4">
                  <Button onClick={handleNext} className="gradient-primary border-0 gap-2">
                    {isLast ? "See Results" : "Next Question"}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" onClick={onRestart} className="gap-2">
                    <RotateCcw className="h-4 w-4" /> Start Over
                  </Button>
                </div>
              </motion.div>
            )}
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default QuizView;
