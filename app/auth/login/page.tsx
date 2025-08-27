"use client"

import type React from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [currentCurrency, setCurrentCurrency] = useState(0)
  const router = useRouter()

  const currencies = ["$", "€", "¥", "₩", "£", "₹", "₽", "¢", "₦", "₪"]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentCurrency((prev) => (prev + 1) % currencies.length)
    }, 1500) // increased from 800ms to 1500ms for slower animation
    return () => clearInterval(interval)
  }, [currencies.length])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)
    setSuccessMessage(null)

    if (!email.endsWith("@watercharging.com")) {
      setError("watercharging.com 계정만 로그인할 수 있습니다")
      setIsLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        if (error.message.includes("Email not confirmed")) {
          setSuccessMessage("인증 이메일이 발송되었습니다. 이메일을 확인하여 계정을 인증해주세요.")
        } else {
          throw error
        }
      } else {
        router.push("/dashboard")
      }
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "로그인 중 오류가 발생했습니다")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
      <div className="w-full max-w-md">
        <Card className="border border-gray-800 shadow-xl bg-gray-800/50 backdrop-blur">
          <CardHeader className="text-center pb-8">
            <div className="mx-auto w-24 h-24 flex items-center justify-center mb-4">
              <span
                className="text-6xl font-bold text-white transition-all duration-300 ease-in-out transform"
                key={currentCurrency}
                style={{
                  animation: "fadeInScale 0.8s ease-in-out",
                }}
              >
                {currencies[currentCurrency]}
              </span>
            </div>
            <CardTitle className="text-2xl font-bold text-white">TMS</CardTitle>
            <CardDescription className="text-gray-400">계정에 로그인하여 세무 일정을 관리하세요</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-300 font-medium">
                  이메일
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="example@watercharging.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-300 font-medium">
                  비밀번호
                </Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              {error && (
                <div className="p-3 bg-red-900/50 border border-red-800 rounded-lg">
                  <p className="text-sm text-red-300">{error}</p>
                </div>
              )}
              {successMessage && (
                <div className="p-3 bg-green-900/50 border border-green-800 rounded-lg">
                  <p className="text-sm text-green-300">{successMessage}</p>
                </div>
              )}
              <Button
                type="submit"
                className="w-full h-12 bg-yellow-500 hover:bg-yellow-600 text-black font-medium"
                disabled={isLoading}
              >
                {isLoading ? "로그인 중..." : "로그인"}
              </Button>
            </form>
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-400">
                계정이 없으신가요?{" "}
                <Link
                  href="/auth/signup"
                  className="text-yellow-400 hover:text-yellow-300 font-medium underline underline-offset-4"
                >
                  회원가입
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
      <style jsx>{`
        @keyframes fadeInScale {
          0% {
            opacity: 0;
            transform: scale(0.8) rotate(-10deg);
          }
          50% {
            opacity: 1;
            transform: scale(1.1) rotate(5deg);
          }
          100% {
            opacity: 1;
            transform: scale(1) rotate(0deg);
          }
        }
      `}</style>
    </div>
  )
}
