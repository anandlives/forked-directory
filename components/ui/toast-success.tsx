"use client"

import { useEffect, useState } from "react"
import { CheckCircle, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface ToastSuccessProps {
  title: string
  description?: string
  duration?: number
  onClose?: () => void
}

export function ToastSuccess({ title, description, duration = 3000, onClose }: ToastSuccessProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      if (onClose) onClose()
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  return (
    <div
      className={cn(
        "fixed bottom-4 right-4 z-50 flex items-start gap-4 rounded-lg border border-green-100 bg-white p-4 shadow-lg transition-all duration-300",
        isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
      )}
    >
      <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0" />
      <div className="flex-1">
        <h3 className="font-medium text-gray-900">{title}</h3>
        {description && <p className="mt-1 text-sm text-gray-600">{description}</p>}
      </div>
      <button
        onClick={() => {
          setIsVisible(false)
          if (onClose) onClose()
        }}
        className="flex-shrink-0 rounded-full p-1 hover:bg-gray-100"
      >
        <X className="h-4 w-4 text-gray-500" />
      </button>
    </div>
  )
}
