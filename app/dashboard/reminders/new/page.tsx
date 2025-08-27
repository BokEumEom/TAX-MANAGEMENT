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

interface Tax {
  id: string
  amount: number
  due_date: string
  tax_types: { name: string }
  charge_stations: { name: string }
}

export default function NewReminderPage() {
  const [taxes, setTaxes] = useState<Tax[]>([])
  const [selectedTax, setSelectedTax] = useState("default")
  const [title, setTitle] = useState("")
  const [message, setMessage] = useState("")
  const [reminderDate, setReminderDate] = useState("")
  const [reminderTime, setReminderTime] = useState("09:00")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchTaxes = async () => {
      try {
        console.log("[v0] Fetching taxes...")
        const supabase = createClient()

        const { data, error } = await supabase
          .from("taxes")
          .select(`
            id,
            amount,
            due_date,
            tax_types(name),
            charge_stations(name)
          `)
          .eq("status", "pending")
          .gte("due_date", new Date().toISOString().split("T")[0])
          .order("due_date", { ascending: true })

        if (error) {
          console.error("[v0] Error fetching taxes:", error)
          setError(`세금 데이터를 불러오는 중 오류가 발생했습니다: ${error.message}`)
          return
        }

        console.log("[v0] Fetched taxes:", data?.length || 0)
        if (data) setTaxes(data as Tax[])
      } catch (error) {
        console.error("[v0] Network error fetching taxes:", error)
        setError("네트워크 오류가 발생했습니다. 인터넷 연결을 확인해주세요.")
      }
    }

    fetchTaxes()
  }, [])

  const handleTaxChange = (taxId: string) => {
    setSelectedTax(taxId)
    const tax = taxes.find((t) => t.id === taxId)
    if (tax) {
      setTitle(`${tax.tax_types.name} 납부 알림`)
      setMessage(
        `${tax.charge_stations.name}의 ${tax.tax_types.name} 납부일이 다가왔습니다. 납부 금액: ${tax.amount.toLocaleString("ko-KR")}원`,
      )
      // Set reminder date to 3 days before due date
      const dueDate = new Date(tax.due_date)
      const reminderDate = new Date(dueDate.getTime() - 3 * 24 * 60 * 60 * 1000)
      setReminderDate(reminderDate.toISOString().split("T")[0])
    } else {
      setTitle("")
      setMessage("")
      setReminderDate("")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      console.log("[v0] Creating reminder...")
      const supabase = createClient()

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError) {
        console.error("[v0] Auth error:", authError)
        throw new Error(`인증 오류: ${authError.message}`)
      }

      if (!user) {
        throw new Error("로그인이 필요합니다")
      }

      console.log("[v0] User authenticated:", user.id)

      const reminderDateTime = new Date(`${reminderDate}T${reminderTime}:00`)

      const { error: insertError } = await supabase.from("reminders").insert({
        user_id: user.id,
        tax_id: selectedTax === "default" ? null : selectedTax,
        title,
        message: message || null,
        reminder_date: reminderDateTime.toISOString(),
        status: "active",
      })

      if (insertError) {
        console.error("[v0] Insert error:", insertError)
        throw new Error(`알림 생성 오류: ${insertError.message}`)
      }

      console.log("[v0] Reminder created successfully")
      router.push("/dashboard/reminders")
    } catch (error: unknown) {
      console.error("[v0] Submit error:", error)
      setError(error instanceof Error ? error.message : "알림 생성 중 오류가 발생했습니다")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white">새 알림 생성</h1>
            <p className="text-gray-400 mt-2">새로운 알림을 설정하여 중요한 일정을 놓치지 마세요</p>
          </div>

          <Card className="bg-gray-800/50 backdrop-blur border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">알림 정보</CardTitle>
              <CardDescription className="text-gray-400">알림의 상세 정보를 입력하세요</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="tax" className="text-white">
                    관련 세금 (선택사항)
                  </Label>
                  <Select value={selectedTax} onValueChange={handleTaxChange} disabled={isLoading}>
                    <SelectTrigger className="bg-gray-700/50 border-gray-600 text-white">
                      <SelectValue placeholder="세금을 선택하면 자동으로 알림 내용이 설정됩니다" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="default" className="text-white hover:bg-gray-700">
                        일반 알림
                      </SelectItem>
                      {taxes.map((tax) => (
                        <SelectItem key={tax.id} value={tax.id} className="text-white hover:bg-gray-700">
                          {tax.charge_stations.name} - {tax.tax_types.name} (
                          {new Date(tax.due_date).toLocaleDateString("ko-KR")})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* ... existing form fields ... */}
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-white">
                    알림 제목 *
                  </Label>
                  <Input
                    id="title"
                    type="text"
                    placeholder="예: 부가가치세 납부 알림"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400"
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message" className="text-white">
                    알림 메시지
                  </Label>
                  <Textarea
                    id="message"
                    placeholder="알림에 포함될 상세 메시지를 입력하세요"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400"
                    rows={3}
                    disabled={isLoading}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="reminderDate" className="text-white">
                      알림 날짜 *
                    </Label>
                    <Input
                      id="reminderDate"
                      type="date"
                      value={reminderDate}
                      onChange={(e) => setReminderDate(e.target.value)}
                      className="bg-gray-700/50 border-gray-600 text-white"
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reminderTime" className="text-white">
                      알림 시간 *
                    </Label>
                    <Input
                      id="reminderTime"
                      type="time"
                      value={reminderTime}
                      onChange={(e) => setReminderTime(e.target.value)}
                      className="bg-gray-700/50 border-gray-600 text-white"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {error && (
                  <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                    <p className="text-sm text-red-300">{error}</p>
                  </div>
                )}

                <div className="flex gap-4 pt-4">
                  <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
                    {isLoading ? "생성 중..." : "알림 생성"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    disabled={isLoading}
                    className="bg-gray-700/50 border-gray-600 text-gray-300 hover:bg-gray-600"
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
