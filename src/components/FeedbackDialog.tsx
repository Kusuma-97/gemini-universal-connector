import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Star } from "lucide-react";
import { toast } from "sonner";

const FeedbackDialog = () => {
  const [stars, setStars] = useState(0);
  const [comments, setComments] = useState("");
  const [open, setOpen] = useState(false);

  const handleSubmit = () => {
    const existing = JSON.parse(localStorage.getItem("quizforge_feedback") || "[]");
    existing.push({ stars, comments, date: new Date().toISOString() });
    localStorage.setItem("quizforge_feedback", JSON.stringify(existing));
    toast.success("Thanks for your feedback!");
    setStars(0);
    setComments("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <MessageSquare className="h-4 w-4" /> Feedback
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Rate your experience</DialogTitle>
        </DialogHeader>
        <div className="flex gap-1 justify-center py-3">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} onClick={() => setStars(n)} className="p-1 hover:scale-110 transition-transform">
              <Star className={`h-8 w-8 ${n <= stars ? "fill-warning text-warning" : "text-muted-foreground"}`} />
            </button>
          ))}
        </div>
        <Textarea placeholder="Any comments?" value={comments} onChange={(e) => setComments(e.target.value)} />
        <Button onClick={handleSubmit} disabled={stars === 0} className="gradient-primary border-0 mt-2">
          Submit
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default FeedbackDialog;
