import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

interface Props {
  message?: string;
}

const LoadingState = ({ message = "Generating with AI..." }: Props) => (
  <div className="flex flex-col items-center justify-center py-20 gap-4">
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
    >
      <Loader2 className="h-10 w-10 text-primary" />
    </motion.div>
    <p className="text-muted-foreground font-medium">{message}</p>
  </div>
);

export default LoadingState;
