import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Trophy, RotateCcw, ArrowLeft } from "lucide-react";

interface Props {
  score: number;
  total: number;
  onRestart: () => void;
  onBack: () => void;
}

const ResultsView = ({ score, total, onRestart, onBack }: Props) => {
  const pct = Math.round((score / total) * 100);
  const emoji = pct >= 90 ? "🏆" : pct >= 70 ? "🎉" : pct >= 50 ? "👍" : "📚";
  const message =
    pct >= 90 ? "Outstanding!" : pct >= 70 ? "Great job!" : pct >= 50 ? "Not bad!" : "Keep studying!";

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}>
      <Card className="p-8 shadow-elevated text-center max-w-md mx-auto">
        <div className="text-6xl mb-4">{emoji}</div>
        <h2 className="text-2xl font-bold mb-2">{message}</h2>
        <p className="text-muted-foreground mb-6">
          You scored <span className="font-bold text-foreground">{score}</span> out of{" "}
          <span className="font-bold text-foreground">{total}</span> ({pct}%)
        </p>

        {/* Score ring */}
        <div className="relative w-32 h-32 mx-auto mb-6">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${pct * 2.64} 264`}
              className="transition-all duration-1000"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-bold">{pct}%</span>
          </div>
        </div>

        <div className="flex gap-3 justify-center">
          <Button onClick={onRestart} className="gradient-primary border-0 gap-2">
            <RotateCcw className="h-4 w-4" /> Try Again
          </Button>
          <Button variant="outline" onClick={onBack} className="gap-2">
            <ArrowLeft className="h-4 w-4" /> New Quiz
          </Button>
        </div>
      </Card>
    </motion.div>
  );
};

export default ResultsView;
