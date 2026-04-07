import { Brain } from "lucide-react";

const Header = () => (
  <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
    <div className="container max-w-5xl mx-auto flex items-center gap-3 py-4 px-4">
      <div className="gradient-hero p-2 rounded-lg">
        <Brain className="h-6 w-6 text-primary-foreground" />
      </div>
      <div>
        <h1 className="text-xl font-bold tracking-tight">QuizForge</h1>
        <p className="text-xs text-muted-foreground">AI-powered quiz generator</p>
      </div>
    </div>
  </header>
);

export default Header;
