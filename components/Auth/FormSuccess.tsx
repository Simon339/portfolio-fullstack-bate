import { CheckCircle2 } from "lucide-react"
import { motion } from "framer-motion"

interface FormSuccessProps {
  message?: string
}

export const FormSuccess = ({ message }: FormSuccessProps) => {
  if (!message) return null

  return (
    <motion.div
      className="bg-emerald-500/15 p-3 rounded-md flex items-center gap-x-2 text-sm text-emerald-500"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <CheckCircle2 className="h-4 w-4" />
      <p>{message}</p>
    </motion.div>
  )
}