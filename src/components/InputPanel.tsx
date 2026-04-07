import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, FileText, BookOpen } from "lucide-react";
import type { QuizSettings, InputMethod } from "@/lib/types";

interface Props {
  onGenerateQuiz: (text: string, method: InputMethod, settings: QuizSettings) => void;
  onGenerateSummary: (text: string) => void;
  isLoading: boolean;
}

const InputPanel = ({ onGenerateQuiz, onGenerateSummary, isLoading }: Props) => {
  const [text, setText] = useState("");
  const [topic, setTopic] = useState("");
  const [method, setMethod] = useState<InputMethod>("text");
  const [settings, setSettings] = useState<QuizSettings>({
    difficulty: "medium",
    numQuestions: 5,
    focusTopic: "",
  });

  const currentText = method === "text" ? text : `__DIRECT__${topic}`;
  const canSubmit = method === "text" ? text.trim().length > 20 : topic.trim().length > 2;

  return (
    <Card className="p-6 shadow-card">
      <Tabs value={method} onValueChange={(v) => setMethod(v as InputMethod)}>
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="text" className="gap-2"><FileText className="h-4 w-4" /> Paste Text</TabsTrigger>
          <TabsTrigger value="topic" className="gap-2"><BookOpen className="h-4 w-4" /> Enter Topic</TabsTrigger>
        </TabsList>

        <TabsContent value="text">
          <Textarea
            placeholder="Paste your study material, notes, article, or transcript here..."
            className="min-h-[180px] resize-y"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <p className="text-xs text-muted-foreground mt-2">{text.length} characters</p>
        </TabsContent>

        <TabsContent value="topic">
          <Input
            placeholder='e.g. "Photosynthesis", "World War II", "React hooks"'
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />
          <p className="text-xs text-muted-foreground mt-2">We'll generate questions about this topic using AI</p>
        </TabsContent>
      </Tabs>

      {/* Settings */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
        <div>
          <label className="text-sm font-medium mb-1.5 block">Difficulty</label>
          <Select value={settings.difficulty} onValueChange={(v) => setSettings((s) => ({ ...s, difficulty: v as QuizSettings["difficulty"] }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="easy">Easy</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="hard">Hard</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm font-medium mb-1.5 block">Questions</label>
          <Select value={String(settings.numQuestions)} onValueChange={(v) => setSettings((s) => ({ ...s, numQuestions: Number(v) }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {[3, 5, 8, 10, 15].map((n) => (
                <SelectItem key={n} value={String(n)}>{n} questions</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm font-medium mb-1.5 block">Focus (optional)</label>
          <Input
            placeholder="Specific subtopic..."
            value={settings.focusTopic}
            onChange={(e) => setSettings((s) => ({ ...s, focusTopic: e.target.value }))}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3 mt-6">
        <Button
          onClick={() => onGenerateQuiz(currentText, method, settings)}
          disabled={!canSubmit || isLoading}
          className="gradient-primary border-0 gap-2 font-semibold"
        >
          <Sparkles className="h-4 w-4" />
          Generate Quiz
        </Button>
        {method === "text" && (
          <Button
            variant="outline"
            onClick={() => onGenerateSummary(text)}
            disabled={!canSubmit || isLoading}
            className="gap-2"
          >
            <FileText className="h-4 w-4" />
            Summarize
          </Button>
        )}
      </div>
    </Card>
  );
};

export default InputPanel;
