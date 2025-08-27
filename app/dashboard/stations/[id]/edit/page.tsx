"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"

interface Props {
  params: Promise<{ id: string }>
}

interface Station {
  id: string
  name: string
  location: string
  status: string
}

export default function EditStationPage({ params }: Props) {
  const [station, setStation] = useState<Station | null>(null)
  const [name, setName] = useState("")
  const [location, setLocation] = useState("")
  const [status, setStatus] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchStation = async () => {
      const { id } = await params
      const supabase = createClient()

      const { data, error } = await supabase.from("charge_stations").select("*").eq("id", id).single()

      if (error) {
        setError("충전소 정보를 불러올 수 없습니다")
        return
      }

      if (data) {
        setStation(data)
        setName(data.name)
        setLocation(data.location)
        setStatus(data.status)
      }
    }

    fetchStation()
  }, [params])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!station) return

    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()

      const { error } = await supabase
        .from("charge_stations")
        .update({
          name,
          location,
          status,
          updated_at: new Date().toISOString(),
        })
        .eq("id", station.id)

      if (error) throw error

      router.push(`/dashboard/stations/${station.id}`)
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "충전소 수정 중 오류가 발생했습니다")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!station) return
    if (!confirm("정말로 이 충전소를 삭제하시겠습니까? 관련된 모든 세금 정보도 함께 삭제됩니다.")) return

    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()

      const { error } = await supabase.from("charge_stations").delete().eq("id", station.id)

      if (error) throw error

      router.push("/dashboard/stations")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "충전소 삭제 중 오류가 발생했습니다")
    } finally {
      setIsLoading(false)
    }
  }

  if (!station) {
    return (
      <div className="min-h-screen bg-gray-900 p-6">
        <div className="text-center">
          <p className="text-gray-400">충전소 정보를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">충전소 편집</h1>
          <p className="text-gray-400 mt-2">충전소 정보를 수정하세요</p>
        </div>

        <Card className="bg-gray-800/50 backdrop-blur border-gray-700 shadow-xl">
          <CardHeader>
            <CardTitle className="text-white">충전소 정보 수정</CardTitle>
            <CardDescription className="text-gray-400">변경할 정보를 입력하세요</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-300">
                  충전소명 *
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-blue-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location" className="text-gray-300">
                  위치 *
                </Label>
                <Input
                  id="location"
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                  className="bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-blue-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status" className="text-gray-300">
                  운영 상태
                </Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="bg-gray-700/50 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="active" className="text-white hover:bg-gray-700">
                      운영중
                    </SelectItem>
                    <SelectItem value="inactive" className="text-white hover:bg-gray-700">
                      비활성
                    </SelectItem>
                    <SelectItem value="maintenance" className="text-white hover:bg-gray-700">
                      점검중
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {error && (
                <div className="p-3 bg-red-900/20 border border-red-800 rounded-lg">
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white" disabled={isLoading}>
                  {isLoading ? "수정 중..." : "변경사항 저장"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={isLoading}
                  className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
                >
                  취소
                </Button>
              </div>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-700">
              <div className="bg-red-900/20 border border-red-800 rounded-lg p-4">
                <h3 className="font-medium text-red-400 mb-2">위험 구역</h3>
                <p className="text-sm text-red-300 mb-4">
                  충전소를 삭제하면 관련된 모든 세금 정보도 함께 삭제됩니다. 이 작업은 되돌릴 수 없습니다.
                </p>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={isLoading}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  충전소 삭제
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
