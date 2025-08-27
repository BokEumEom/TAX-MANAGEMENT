"use client"

interface PageLoaderProps {
  message?: string
  progress?: number
  showProgress?: boolean
}

export function PageLoader({ message, progress, showProgress }: PageLoaderProps) {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="w-8 h-8 animate-spin rounded-full border-2 border-gray-600 border-t-white"></div>
    </div>
  )
}
