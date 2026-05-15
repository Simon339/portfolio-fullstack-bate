"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { CheckCircle, XCircle } from "lucide-react"

interface PasswordStrengthIndicatorProps {
  password: string
}

export function PasswordStrengthIndicator({ password }: PasswordStrengthIndicatorProps) {
  const [checks, setChecks] = useState({
    hasMinLength: false,
    hasUppercase: false,
    hasNumber: false,
    hasSpecialChar: false,
  })

  useEffect(() => {
    setChecks({
      hasMinLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecialChar: /[^A-Za-z0-9]/.test(password),
    })
  }, [password])

  const getStrengthData = () => {
    const totalChecks = Object.values(checks).filter(Boolean).length
    const configs = {
      0: { text: "Very Weak", color: "bg-red-500", width: "w-1/5" },
      1: { text: "Weak", color: "bg-red-400", width: "w-2/5" },
      2: { text: "Fair", color: "bg-yellow-500", width: "w-3/5" },
      3: { text: "Good", color: "bg-emerald-400", width: "w-4/5" },
      4: { text: "Strong", color: "bg-emerald-500", width: "w-full" },
    }
    return configs[totalChecks as keyof typeof configs] || configs[4]
  }

  if (!password) return null

  const strengthData = getStrengthData()

  return (
    <motion.div
      className="mt-2 space-y-2 text-xs"
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-center justify-between">
        <span className="text-gray-600 font-medium">Password strength</span>
        <span className={`font-semibold ${strengthData.color.replace('bg-', 'text-')}`}>
          {strengthData.text}
        </span>
      </div>

      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          className={`h-full ${strengthData.color} rounded-full`}
          initial={{ width: 0 }}
          animate={{ width: strengthData.width === 'w-full' ? '100%' : 
            strengthData.width === 'w-4/5' ? '80%' :
            strengthData.width === 'w-3/5' ? '60%' :
            strengthData.width === 'w-2/5' ? '40%' : '20%' }}
          transition={{ duration: 0.3 }}
        />
      </div>

      <div className="grid grid-cols-2 gap-1.5 pt-1">
        {[
          { label: "At least 8 characters", met: checks.hasMinLength },
          { label: "Uppercase letter", met: checks.hasUppercase },
          { label: "Number", met: checks.hasNumber },
          { label: "Special character", met: checks.hasSpecialChar },
        ].map((check, index) => (
          <motion.div
            key={check.label}
            className="flex items-center gap-1.5"
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            {check.met ? (
              <CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
            ) : (
              <XCircle className="h-3.5 w-3.5 text-gray-300 shrink-0" />
            )}
            <span className={check.met ? "text-gray-700" : "text-gray-400"}>
              {check.label}
            </span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}