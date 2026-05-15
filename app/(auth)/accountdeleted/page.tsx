"use client"

import type React from "react"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Check, Trash2, ShieldAlert, AlertTriangle, CheckCircle2, XCircle, Loader2 } from "lucide-react"
import { authClient } from "@/hooks/getcurrectuser"

type Status = "idle" | "loading" | "success" | "error"

const DeleteAccountPage = () => {
  return (
    <Suspense fallback={<DeleteAccountSkeleton />}>
      <DeleteAccount />
    </Suspense>
  )
}

// Skeleton loader for Suspense fallback
const DeleteAccountSkeleton = () => (
  <div className="min-h-screen flex items-start justify-center">
    <div className="w-full max-w-xl mt-16">
      <div className="bg-white rounded-xl border border-[#acc2ef] shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-50">
            <Trash2 className="h-5 w-5 text-red-600" aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="h-6 bg-gray-200 rounded w-32 animate-pulse" />
            <div className="h-4 bg-gray-100 rounded w-64 mt-2 animate-pulse" />
          </div>
        </div>
        <div className="p-6 space-y-6">
          <div className="space-y-3">
            <div className="h-4 bg-gray-100 rounded w-full animate-pulse" />
            <div className="h-4 bg-gray-100 rounded w-11/12 animate-pulse" />
            <div className="h-4 bg-gray-100 rounded w-10/12 animate-pulse" />
          </div>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        </div>
      </div>
    </div>
  </div>
)

const DeleteAccount = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  const [inputValue, setInputValue] = useState("")
  const [acknowledged, setAcknowledged] = useState(false)
  const [status, setStatus] = useState<Status>("idle")
  const [message, setMessage] = useState<string>("")
  const [isDeleting, setIsDeleting] = useState(false)

  const isDeleteConfirmed = inputValue === "IWANTTODELETE" && acknowledged
  const isLoading = status === "loading" || isDeleting

  // Validate token on mount
  useEffect(() => {
    console.log("Token from URL:", token)
    if (!token) {
      console.log("No token found in URL")
      setStatus("error")
      setMessage(
        "We couldn't find a valid confirmation token in your link. Please request a new deletion link from your email."
      )
    }
  }, [token])

  const handleDelete = async () => {
    console.log("handleDelete called", { token, isDeleteConfirmed, isDeleting })
    
    if (!token) {
      console.error("No token available")
      setStatus("error")
      setMessage("No confirmation token found. Please request a new deletion link.")
      return
    }
    
    if (!isDeleteConfirmed) {
      console.error("Delete not confirmed", { inputValue, acknowledged })
      setStatus("error")
      setMessage("Please type IWANTTODELETE and check the acknowledgment box.")
      return
    }
    
    if (isDeleting) {
      console.log("Already deleting, skipping...")
      return
    }

    setIsDeleting(true)
    setStatus("loading")

    try {
      console.log("Attempting to delete user with token:", token)
      
      const response = await authClient.deleteUser({
    token});
      
      console.log("Delete user response:", response)
      
      if (response.error) {
        throw new Error(response.error.message || "Failed to verify deletion token")
      }
      
      setStatus("success")
      setMessage("Your account has been successfully deleted.")

      setTimeout(() => {
        router.push("/")
      }, 3000)
      
    } catch (err: any) {
      console.error("Delete account error:", err)
      setStatus("error")
      setMessage(err.message || "An error occurred during verification.")
      setIsDeleting(false)
    }
  }

  const resetForm = () => {
    console.log("Resetting form...")
    setStatus("idle")
    setMessage("")
    setInputValue("")
    setAcknowledged(false)
    setIsDeleting(false)
  }

  console.log("Rendering DeleteAccount", { status, isDeleteConfirmed, isLoading })

  return (
    <div className="min-h-screen flex items-start justify-center">
      <div className="w-full max-w-xl mt-16">
        {/* Breadcrumb / eyebrow */}
        <div className="mb-4 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-gray-400">
          <span>Settings</span>
          <span aria-hidden="true">/</span>
          <span className="text-gray-600">Account</span>
        </div>

        {/* Success state */}
        {status === "success" ? (
          <div className="bg-white rounded-xl border border-[#acc2ef] shadow-sm overflow-hidden">
            <div className="p-8 flex flex-col items-center text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-50 text-green-600 ring-1 ring-inset ring-green-100">
                <CheckCircle2 className="h-7 w-7" aria-hidden="true" />
              </div>
              <h1 className="mt-5 text-lg font-semibold text-gray-900">
                Account deleted
              </h1>
              <p className="mt-2 text-sm text-gray-600 leading-relaxed max-w-sm">
                {message ||
                  "Your account and all associated data have been permanently removed. We're sorry to see you go."}
              </p>

              <button
                type="button"
                onClick={() => router.push("/")}
                className="mt-6 w-full sm:w-auto px-5 py-2.5 rounded-md font-medium text-sm text-white bg-[#4f6fc4] hover:bg-[#4263b8] focus:outline-none focus:ring-2 focus:ring-[#acc2ef] focus:ring-offset-2 transition-colors"
              >
                Return home
              </button>
            </div>
          </div>
        ) : status === "error" ? (
          /* Error state */
          <div className="bg-white rounded-xl border border-[#acc2ef] shadow-sm overflow-hidden">
            <div className="p-8 flex flex-col items-center text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600 ring-1 ring-inset ring-red-100">
                <XCircle className="h-7 w-7" aria-hidden="true" />
              </div>
              <h1 className="mt-5 text-lg font-semibold text-gray-900">
                We couldn't delete your account
              </h1>
              <p className="mt-2 text-sm text-gray-600 leading-relaxed max-w-sm">
                {message ||
                  "Something went wrong while processing your request. Please try again."}
              </p>

              <div
                role="alert"
                className="mt-6 w-full flex gap-3 rounded-lg border border-red-200 bg-red-50/70 p-4 text-sm text-red-800 text-left"
              >
                <AlertTriangle
                  className="h-5 w-5 shrink-0 text-red-600"
                  aria-hidden="true"
                />
                <p className="leading-relaxed">
                  If this problem keeps happening, please contact{" "}
                  <a
                    href="mailto:simonmalapane018@protonmail.com"
                    className="font-medium text-blue-600 underline-offset-2 hover:underline"
                  >
                    simonmalapane018@protonmail.com
                  </a>{" "}
                  for help.
                </p>
              </div>

              <div className="mt-6 flex flex-col-reverse sm:flex-row gap-3 w-full">
                <button
                  type="button"
                  onClick={() => router.push("/")}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-md font-medium text-sm text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 focus:ring-offset-1 transition-colors"
                >
                  Back to home
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="w-full sm:flex-1 px-4 py-2.5 rounded-md font-medium text-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Idle / loading (form) state */
          <div className="bg-white rounded-xl border border-[#acc2ef] shadow-sm overflow-hidden">
            {/* Header / Title */}
            <div className="px-6 py-5 border-b border-gray-100 flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600 ring-1 ring-inset ring-red-100">
                <Trash2 className="h-5 w-5" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg font-semibold text-gray-900 leading-tight">
                  Delete account
                </h1>
                <p className="mt-0.5 text-sm text-gray-500">
                  Permanently remove your account and all associated data.
                </p>
              </div>
            </div>

            {/* Content - Removed form, using div instead */}
            <div className="p-6 space-y-6">
              {/* Warning Message */}
              <div className="text-gray-600 space-y-3 text-sm leading-relaxed">
                <p>
                  We're sorry to see you go. Once your account is deleted, all of your content will be permanently removed, including your profile, stories, publications, notes, and responses.
                </p>
                <p>
                  Deleting your account will remove all of your information from our database. If you're unsure, we recommend deactivating your account or contacting support at{" "}
                  <a
                    href="mailto:simonmalapane018@protonmail.com"
                    className="font-medium text-blue-600 underline-offset-2 hover:underline"
                  >
                    simonmalapane018@protonmail.com
                  </a>
                  {" instead. "}
                  <span className="font-semibold">
                    This action cannot be undone.
                  </span>
                </p>
              </div>

              {/* Missing token banner */}
              {!token && (
                <div
                  role="alert"
                  className="flex gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"
                >
                  <AlertTriangle
                    className="h-5 w-5 shrink-0 text-amber-600"
                    aria-hidden="true"
                  />
                  <p className="leading-relaxed">
                    No confirmation token detected in the URL. Please open this
                    page from the deletion link we sent to your email.
                  </p>
                </div>
              )}

              {/* Acknowledge checkbox */}
              <label
                htmlFor="acknowledge"
                className="flex items-start gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3 cursor-pointer transition-colors hover:bg-gray-100/70"
              >
                <span className="relative mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center">
                  <input
                    id="acknowledge"
                    type="checkbox"
                    checked={acknowledged}
                    onChange={(e) => setAcknowledged(e.target.checked)}
                    disabled={isLoading}
                    className="peer h-4 w-4 cursor-pointer appearance-none rounded border border-gray-300 bg-white checked:border-[#acc2ef] checked:bg-[#acc2ef] focus:outline-none focus:ring-2 focus:ring-[#acc2ef] focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-60"
                  />
                  <Check
                    className="pointer-events-none absolute h-3 w-3 text-white opacity-0 peer-checked:opacity-100"
                    strokeWidth={3}
                    aria-hidden="true"
                  />
                </span>
                <span className="text-sm text-gray-700 leading-snug">
                  I understand that this action is permanent and that all my
                  data will be erased.
                </span>
              </label>

              {/* Instruction + Input */}
              <div className="space-y-2">
                <label
                  htmlFor="delete-confirmation"
                  className="block text-sm font-medium text-gray-700"
                >
                  {"To confirm this, type "}
                  <span className="inline-flex items-center font-mono text-[0.8rem] bg-gray-100 text-gray-900 px-1.5 py-0.5 rounded border border-gray-200">
                    IWANTTODELETE
                  </span>
                </label>

                <div className="relative">
                  <input
                    id="delete-confirmation"
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="IWANTTODELETE"
                    autoComplete="off"
                    disabled={isLoading}
                    aria-describedby="delete-helper"
                    className={`w-full px-3 py-2.5 bg-gray-50 border rounded-md text-gray-900 placeholder-gray-400 font-mono tracking-wider transition-colors focus:outline-none focus:ring-2 focus:bg-white disabled:cursor-not-allowed disabled:opacity-60 ${
                      inputValue === "IWANTTODELETE"
                        ? "border-green-400 focus:ring-green-200 focus:border-green-400"
                        : "border-[#acc2ef] focus:ring-[#acc2ef]/40 focus:border-[#acc2ef]"
                    }`}
                  />

                  {inputValue === "IWANTTODELETE" && (
                    <Check
                      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-600"
                      strokeWidth={3}
                      aria-hidden="true"
                    />
                  )}
                </div>

                <p
                  id="delete-helper"
                  className="text-xs text-gray-500 flex items-center gap-1.5"
                >
                  <ShieldAlert className="h-3.5 w-3.5" aria-hidden="true" />
                  Case-sensitive. Type exactly as shown.
                </p>
              </div>

              {/* Actions */}
              <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => router.push("/")}
                  disabled={isLoading}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-md font-medium text-sm text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 focus:ring-offset-1 transition-colors disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={!isDeleteConfirmed || isLoading}
                  className={`w-full py-2.5 px-4 rounded-md font-medium text-sm transition-colors inline-flex items-center justify-center gap-2 ${
                    isDeleteConfirmed && !isLoading
                      ? "bg-red-600 text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 cursor-pointer"
                      : "bg-gray-200 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  {isLoading ? (
                    <>
                      <Loader2
                        className="h-4 w-4 animate-spin"
                        aria-hidden="true"
                      />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                      Delete account
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footnote */}
        <p className="text-xs text-gray-400 text-center mt-4">
          This action cannot be undone.
        </p>
      </div>
    </div>
  )
}

export default DeleteAccountPage