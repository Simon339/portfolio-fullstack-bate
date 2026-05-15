import { XCircle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface FormErrorProps {
  message?: string;
}

export const FormError = ({ message }: FormErrorProps) => {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          className="bg-destructive/15 p-3 rounded-lg flex items-center gap-x-2.5 text-sm text-destructive border border-destructive/20 shadow-sm"
          initial={{ opacity: 0, y: -10, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.98 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          role="alert"
        >
          <XCircle className="h-4 w-4 shrink-0" />
          <p className="leading-snug">{message}</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
};