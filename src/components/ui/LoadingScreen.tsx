import { motion } from "framer-motion";
import { Leaf } from "lucide-react";

export default function LoadingScreen({ message = "Analyzing" }: { message?: string }) {
  return (
    <div className="fixed inset-0 bg-background flex flex-col items-center justify-center z-50">
      <motion.div
        animate={{ 
          scale: [1, 1.2, 1],
          rotate: [0, 10, -10, 0]
        }}
        transition={{ 
          duration: 2, 
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="text-primary"
      >
        <Leaf size={64} />
      </motion.div>
      <motion.h2 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-6 text-xl font-medium text-foreground tracking-widest uppercase"
      >
        {message}
      </motion.h2>
    </div>
  );
}

