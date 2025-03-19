/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { useState, useEffect } from "react"
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

  const getStrengthText = () => {
    const totalChecks = Object.values(checks).filter(Boolean).length
    if (totalChecks <= 1) return "Weak"
    if (totalChecks === 2) return "Fair"
    if (totalChecks === 3) return "Good"
    return "Strong"
  }

  // Don't render anything if password is empty
  if (!password) return null

  return (
    <div className="mt-1 space-y-1 text-xs">
      <div className="text-gray-500">
        Password strength: <span className="font-medium">{getStrengthText()}</span>
      </div>

      <div className="grid grid-cols-2 gap-1">
        <div className="flex items-center gap-1">
          {checks.hasMinLength ? (
            <CheckCircle className="h-3 w-3 text-green-500" />
          ) : (
            <XCircle className="h-3 w-3 text-red-500" />
          )}
          <span>At least 8 characters</span>
        </div>

        <div className="flex items-center gap-1">
          {checks.hasUppercase ? (
            <CheckCircle className="h-3 w-3 text-green-500" />
          ) : (
            <XCircle className="h-3 w-3 text-red-500" />
          )}
          <span>Uppercase letter</span>
        </div>

        <div className="flex items-center gap-1">
          {checks.hasNumber ? (
            <CheckCircle className="h-3 w-3 text-green-500" />
          ) : (
            <XCircle className="h-3 w-3 text-red-500" />
          )}
          <span>Number</span>
        </div>

        <div className="flex items-center gap-1">
          {checks.hasSpecialChar ? (
            <CheckCircle className="h-3 w-3 text-green-500" />
          ) : (
            <XCircle className="h-3 w-3 text-red-500" />
          )}
          <span>Special character</span>
        </div>
      </div>
    </div>
  )
}

