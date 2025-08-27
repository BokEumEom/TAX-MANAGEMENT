"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"

export default function NewStationPage() {
  const [name, setName] = useState("")
  const [location, setLocation] = useState("")
  const [status, setStatus] = useState("active")
  const [description, setDescription] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log("[v0] Initializing Supabase client for new station page")
        const supabase = createClient()

        if (!supabase) {
          throw new Error("Supabase 클라이언트를 초기화할 수 없습니다")
        }

        console.log("[v0] Getting current user")
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser()

        if (userError) {
          console.error("[v0] User authentication error:", userError)
          throw new Error(`인증 오류: ${userError.message}`)
        }

        if (!user) {
          console.log("[v0] No user found, redirecting to login")
          router.push("/auth/login")
          return
        }

        console.log("[v0] User authenticated successfully:", user.id)
        setUser(user)
      } catch (error) {
        console.error("[v0] Initialization error:", error)
        setError(error instanceof Error ? error.message : "초기화 중 오류가 발생했습니다")
      } finally {
        setIsInitialized(true)
      }
    }

    initializeAuth()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      setError("로그인이 필요합니다")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      console.log("[v0] Creating new station with data:", { name, location, status })
      const supabase = createClient()

      const { error: insertError } = await supabase.from("charge_stations").insert({
        name,
        location,
        status,
        owner_id: user.id,
      })

      if (insertError) {
        console.error("[v0] Insert error:", insertError)
        throw new Error(`충전소 등록 실패: ${insertError.message}`)
      }

      console.log("[v0] Station created successfully, redirecting")
      router.push("/dashboard/stations")
    } catch (error: unknown) {
      console.error("[v0] Submit error:", error)
      setError(error instanceof Error ? error.message : "충전소 등록 중 오류가 발생했습니다")
    } finally {
      setIsLoading(false)
    }
  }

  if (!isInitialized) {
    return (
      <div className="bg-gray-900 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">초기화 중...</p>
        </div>
      </div>
    )
  }

  if (error && !user) {
    return (
      <div className="bg-gray-900 min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="p-4 bg-red-900/50 border border-red-700 rounded-lg mb-4">
            <p className="text-red-300">{error}</p>
          </div>
          <Button onClick={() => router.push("/auth/login")} className="bg-blue-600 hover:bg-blue-700 text-white">
            로그인 페이지로 이동
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-900 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white">새 충전소 등록</h1>
            <p className="text-gray-400 mt-2">새로운 충전소를 등록하여 세무 관리를 시작하세요</p>
          </div>

          <Card className="bg-gray-800/50 backdrop-blur border-gray-700 shadow-lg">
            <CardHeader>
              <CardTitle className="text-white">충전소 정보</CardTitle>
              <CardDescription className="text-gray-400">충전소의 기본 정보를 입력하세요</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-gray-200">
                    충전소명 *
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="예: 강남역 급속충전소"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location" className="text-gray-200">
                    위치 *
                  </Label>
                  <Input
                    id="location"
                    type="text"
                    placeholder="예: 서울시 강남구 강남대로 123"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    required
                    className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status" className="text-gray-200">
                    운영 상태
                  </Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-700 border-gray-600">
                      <SelectItem value="active" className="text-white hover:bg-gray-600">
                        운영중
                      </SelectItem>
                      <SelectItem value="inactive" className="text-white hover:bg-gray-600">
                        비활성
                      </SelectItem>
                      <SelectItem value="maintenance" className="text-white hover:bg-gray-600">
                        점검중
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-gray-200">
                    설명 (선택사항)
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="충전소에 대한 추가 정보를 입력하세요"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
                  />
                </div>

                {error && (
                  <div className="p-3 bg-red-900/50 border border-red-700 rounded-lg">
                    <p className="text-sm text-red-300">{error}</p>
                  </div>
                )}

                <div className="flex gap-4 pt-4">
                  <Button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                    disabled={isLoading || !user}
                  >
                    {isLoading ? "등록 중..." : "충전소 등록"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    disabled={isLoading}
                    className="border-gray-600 text-gray-300 hover:bg-gray-700"
                  >
                    취소
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
