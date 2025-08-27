"use client"

import { LoadingSpinner } from "./loading-spinner"

interface InlineLoaderProps {
  message?: string
  progress?: number
  showProgress?: boolean
  variant?: "spinner" | "progress" | "both"
  size?: "sm" | "md" | "lg"
}

export function InlineLoader({
  message,
  progress = 0,
  showProgress = false,
  variant = "spinner",
  size = "md",
}: InlineLoaderProps) {
  const sizeClasses = {
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
  }

  return (
    <div
      className={`flex items-center justify-center ${sizeClasses[size]} bg-gray-800/50 rounded-lg border border-gray-700`}
    >
      <LoadingSpinner size={size} />
    </div>
  )
}
