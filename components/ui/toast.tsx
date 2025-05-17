"use client"

import { useToast } from "@/hooks/use-toast"
import { X } from "lucide-react"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

export function ToastContainer() {
  const { toasts, removeToast } = useToast()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="fixed bottom-0 right-0 z-50 p-4 space-y-4">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            "rounded-lg border shadow-lg p-4 flex items-start max-w-md transition-all transform translate-y-0 opacity-100",
            "animate-in slide-in-from-bottom-5 fade-in duration-300",
            "hover:shadow-xl",
            toast.variant === "destructive" ? "bg-red-50 border-red-200 text-red-900" : "bg-white border-gray-200",
          )}
        >
          <div className="flex-1">
            <h3 className="font-medium mb-1">{toast.title}</h3>
            {toast.description && <p className="text-sm">{toast.description}</p>}
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className={cn(
              "ml-4 p-1 rounded-full",
              toast.variant === "destructive" ? "hover:bg-red-200" : "hover:bg-gray-200",
            )}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  )
}
