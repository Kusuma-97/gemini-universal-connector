import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

interface Props {
  summary: string;
  onBack: () => void;
}

const SummaryView = ({ summary, onBack }: Props) => (
  <Card className="p-6 shadow-card">
    <h2 className="text-xl font-bold mb-4">Summary</h2>
    <div className="prose prose-sm max-w-none text-foreground whitespace-pre-wrap">
      {summary}
    </div>
    <Button variant="outline" onClick={onBack} className="mt-6 gap-2">
      <ArrowLeft className="h-4 w-4" /> Back
    </Button>
  </Card>
);

export default SummaryView;
