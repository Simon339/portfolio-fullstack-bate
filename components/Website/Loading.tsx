import { Loader2 } from 'lucide-react'
import React from 'react'

const Loading = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
        <h2 className="mt-4 text-xl font-semibold text-foreground">Loading...</h2>
        <p className="mt-2 text-sm text-muted-foreground">Please wait while we fetch your data.</p>
      </div>
    </div>
  )
}

export default Loading