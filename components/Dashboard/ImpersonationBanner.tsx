
'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { LogOut, Shield, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { authClient } from '@/hooks/getcurrectuser'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export const ImpersonationBanner = () => {
  const [isImpersonating, setIsImpersonating] = useState(false)
  const [impersonatedUserId, setImpersonatedUserId] = useState<string | null>(null)
  const [isExiting, setIsExiting] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkImpersonation = () => {
      const impersonating = sessionStorage.getItem('isImpersonating') === 'true'
      const userId = sessionStorage.getItem('impersonatedUserId')
      
      setIsImpersonating(impersonating)
      setImpersonatedUserId(userId)
    }

    checkImpersonation()
    
    window.addEventListener('storage', checkImpersonation)
    return () => window.removeEventListener('storage', checkImpersonation)
  }, [])

  const handleStopImpersonating = async () => {
    setIsExiting(true)
    
    try {
      const { data, error } = await authClient.admin.stopImpersonating()
      
      if (error) {
        throw new Error(error.message || 'Failed to stop impersonation')
      }
      
      sessionStorage.removeItem('isImpersonating')
      sessionStorage.removeItem('impersonatedUserId')
      
      toast.success('Stopped impersonating user')
      
      router.push('/dashboard/users')
      router.refresh()
      
    } catch (error) {
      console.error('Error stopping impersonation:', error)
      toast.error('Failed to stop impersonation')
      setIsExiting(false)
    }
  }

  if (!isImpersonating) return null

  return (
    <>
      {/* Ambient glow effect */}
      <div 
        className={cn(
          "fixed bottom-4 right-4 z-40 w-80 h-20 rounded-2xl blur-2xl transition-opacity duration-500",
          "bg-gradient-to-r from-amber-500/30 via-orange-500/20 to-red-500/30",
          isExiting ? "opacity-0" : "opacity-100"
        )}
        aria-hidden="true"
      />
      
      {/* Main banner */}
      <div 
        className={cn(
          "fixed bottom-4 right-4 z-50 transition-all duration-500 ease-out",
          isExiting 
            ? "opacity-0 translate-y-4 scale-95" 
            : "opacity-100 translate-y-0 scale-100"
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div 
          className={cn(
            "relative overflow-hidden rounded-2xl border transition-all duration-300",
            "bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-800",
            "border-amber-500/20 shadow-2xl shadow-amber-900/20",
            isHovered && "border-amber-500/40 shadow-amber-900/30"
          )}
        >
          {/* Animated border gradient */}
          <div 
            className="absolute inset-0 rounded-2xl opacity-50"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(245, 158, 11, 0.1), transparent)',
              animation: 'shimmer 3s infinite',
            }}
          />
          
          {/* Top accent line */}
          <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
          
          {/* Content */}
          <div className="relative px-5 py-4 flex items-center gap-4">
            {/* Icon with pulse */}
            <div className="relative flex-shrink-0">
              <div className="absolute inset-0 rounded-xl bg-amber-500/20 animate-pulse" />
              <div 
                className={cn(
                  "relative flex items-center justify-center w-11 h-11 rounded-xl transition-all duration-300",
                  "bg-gradient-to-br from-amber-500/20 to-orange-600/20",
                  "border border-amber-500/30",
                  isHovered && "from-amber-500/30 to-orange-600/30 border-amber-500/50"
                )}
              >
                <Shield 
                  className={cn(
                    "w-5 h-5 text-amber-400 transition-transform duration-300",
                    isHovered && "scale-110"
                  )} 
                />
              </div>
            </div>
            
            {/* Text content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  Active
                </span>
              </div>
              <p className="mt-1 text-sm font-medium text-zinc-100">
                Impersonating user
              </p>
              <p className="text-xs text-zinc-500 font-mono tracking-tight truncate">
                {impersonatedUserId?.slice(0, 12)}...
              </p>
            </div>
            
            {/* Exit button */}
            <Button 
              onClick={handleStopImpersonating}
              disabled={isExiting}
              size="sm"
              className={cn(
                "relative overflow-hidden group transition-all duration-300",
                "bg-gradient-to-r from-amber-600 to-orange-600",
                "hover:from-amber-500 hover:to-orange-500",
                "text-white font-medium shadow-lg shadow-amber-900/30",
                "border-0 rounded-xl px-4 h-9",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              <span className="relative z-10 flex items-center gap-1.5">
                <LogOut className={cn(
                  "w-3.5 h-3.5 transition-transform duration-300",
                  "group-hover:-translate-x-0.5"
                )} />
                <span className="text-xs">Exit</span>
              </span>
              
              {/* Button shine effect */}
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
                }}
              />
            </Button>
          </div>
          
          {/* Bottom warning stripe */}
          <div className="h-1 bg-gradient-to-r from-amber-600 via-orange-500 to-amber-600" />
        </div>
      </div>
      
      {/* Keyframes for shimmer animation */}
      <style jsx global>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </>
  )
}
