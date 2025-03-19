/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { useState, useEffect } from "react"
import { CheckCircle2, XCircle } from "lucide-react"

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

  const getStrengthPercentage = () => {
    const { hasMinLength, hasUppercase, hasNumber, hasSpecialChar } = checks
    const totalChecks = Object.values(checks).filter(Boolean).length
    return (totalChecks / 4) * 100
  }

  const getStrengthColor = () => {
    const percentage = getStrengthPercentage()
    if (percentage <= 25) return "bg-red-500"
    if (percentage <= 50) return "bg-orange-500"
    if (percentage <= 75) return "bg-yellow-500"
    return "bg-green-500"
  }

  const getStrengthText = () => {
    const percentage = getStrengthPercentage()
    if (percentage <= 25) return "Weak"
    if (percentage <= 50) return "Fair"
    if (percentage <= 75) return "Good"
    return "Strong"
  }

  return (
    <div className="mt-2 space-y-2">
      <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full ${getStrengthColor()} transition-all duration-300 ease-in-out`}
          style={{ width: `${getStrengthPercentage()}%` }}
        />
      </div>

      <div className="text-xs text-gray-500">
        Password strength: <span className="font-medium">{getStrengthText()}</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs">
        <div className="flex items-center gap-1">
          {checks.hasMinLength ? (
            <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
          ) : (
            <XCircle className="h-3.5 w-3.5 text-red-500" />
          )}
          <span>At least 8 characters</span>
        </div>

        <div className="flex items-center gap-1">
          {checks.hasUppercase ? (
            <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
          ) : (
            <XCircle className="h-3.5 w-3.5 text-red-500" />
          )}
          <span>Uppercase letter</span>
        </div>

        <div className="flex items-center gap-1">
          {checks.hasNumber ? (
            <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
          ) : (
            <XCircle className="h-3.5 w-3.5 text-red-500" />
          )}
          <span>Number</span>
        </div>

        <div className="flex items-center gap-1">
          {checks.hasSpecialChar ? (
            <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
          ) : (
            <XCircle className="h-3.5 w-3.5 text-red-500" />
          )}
          <span>Special character</span>
        </div>
      </div>
    </div>
  )
}

