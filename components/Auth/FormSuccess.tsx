import { CheckCircle2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface FormSuccessProps {
  message?: string
}

export const FormSuccess = ({ message }: FormSuccessProps) => {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          className="bg-emerald-500/15 p-3 rounded-lg flex items-center gap-x-2.5 text-sm text-emerald-500 border border-emerald-500/20 shadow-sm"
          initial={{ opacity: 0, y: -10, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.98 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          role="status"
        >
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <p className="leading-snug">{message}</p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}