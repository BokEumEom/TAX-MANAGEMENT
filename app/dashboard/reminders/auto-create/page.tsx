"use client"

import Link from "next/link"
import type React from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"

interface Tax {
  id: string
  amount: number
  due_date: string
  tax_types: { name: string }
  charge_stations: { name: string }
}

export default function AutoCreateRemindersPage() {
  const [taxes, setTaxes] = useState<Tax[]>([])
  const [selectedTaxes, setSelectedTaxes] = useState<string[]>([])
  const [daysBefore, setDaysBefore] = useState("3")
  const [reminderTime, setReminderTime] = useState("09:00")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchTaxes = async () => {
      const supabase = createClient()

      // Fetch pending taxes that don't have reminders yet
      const { data } = await supabase
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

      if (data) {
        // Filter out taxes that already have reminders
        const { data: existingReminders } = await supabase
          .from("reminders")
          .select("tax_id")
          .in(
            "tax_id",
            data.map((t) => t.id),
          )

        const existingTaxIds = new Set(existingReminders?.map((r) => r.tax_id) || [])
        const availableTaxes = data.filter((tax) => !existingTaxIds.has(tax.id))

        setTaxes(availableTaxes as Tax[])
      }
    }

    fetchTaxes()
  }, [])

  const handleTaxToggle = (taxId: string, checked: boolean) => {
    if (checked) {
      setSelectedTaxes([...selectedTaxes, taxId])
    } else {
      setSelectedTaxes(selectedTaxes.filter((id) => id !== taxId))
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedTaxes(taxes.map((tax) => tax.id))
    } else {
      setSelectedTaxes([])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedTaxes.length === 0) {
      setError("최소 하나의 세금을 선택해주세요")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error("로그인이 필요합니다")
      }

      const reminders = selectedTaxes.map((taxId) => {
        const tax = taxes.find((t) => t.id === taxId)!
        const dueDate = new Date(tax.due_date)
        const reminderDate = new Date(dueDate.getTime() - Number.parseInt(daysBefore) * 24 * 60 * 60 * 1000)
        const reminderDateTime = new Date(`${reminderDate.toISOString().split("T")[0]}T${reminderTime}:00`)

        return {
          user_id: user.id,
          tax_id: taxId,
          title: `${tax.tax_types.name} 납부 알림`,
          message: `${tax.charge_stations.name}의 ${tax.tax_types.name} 납부일이 ${daysBefore}일 후입니다. 납부 금액: ${tax.amount.toLocaleString("ko-KR")}원`,
          reminder_date: reminderDateTime.toISOString(),
          status: "active",
        }
      })

      const { error } = await supabase.from("reminders").insert(reminders)

      if (error) throw error

      router.push("/dashboard/reminders")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "알림 생성 중 오류가 발생했습니다")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white">자동 알림 생성</h1>
            <p className="text-gray-400 mt-2">미납 세금에 대한 알림을 자동으로 생성하세요</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Settings */}
            <div className="lg:col-span-1">
              <Card className="bg-gray-800/50 backdrop-blur border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">알림 설정</CardTitle>
                  <CardDescription className="text-gray-400">알림 생성 옵션을 설정하세요</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="daysBefore" className="text-gray-300">
                      납부일 며칠 전 알림
                    </Label>
                    <Select value={daysBefore} onValueChange={setDaysBefore}>
                      <SelectTrigger className="bg-gray-700/50 border-gray-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        <SelectItem value="1">1일 전</SelectItem>
                        <SelectItem value="3">3일 전</SelectItem>
                        <SelectItem value="7">7일 전</SelectItem>
                        <SelectItem value="14">14일 전</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reminderTime" className="text-gray-300">
                      알림 시간
                    </Label>
                    <Select value={reminderTime} onValueChange={setReminderTime}>
                      <SelectTrigger className="bg-gray-700/50 border-gray-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        <SelectItem value="09:00">오전 9시</SelectItem>
                        <SelectItem value="12:00">오후 12시</SelectItem>
                        <SelectItem value="15:00">오후 3시</SelectItem>
                        <SelectItem value="18:00">오후 6시</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="pt-4">
                    <p className="text-sm text-gray-400">
                      선택된 세금: <span className="font-semibold text-white">{selectedTaxes.length}개</span>
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tax Selection */}
            <div className="lg:col-span-2">
              <Card className="bg-gray-800/50 backdrop-blur border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-white">
                    알림 생성 대상 세금
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="selectAll"
                        checked={selectedTaxes.length === taxes.length && taxes.length > 0}
                        onCheckedChange={handleSelectAll}
                        className="border-gray-600 data-[state=checked]:bg-blue-600"
                      />
                      <Label htmlFor="selectAll" className="text-sm font-normal text-gray-300">
                        전체 선택
                      </Label>
                    </div>
                  </CardTitle>
                  <CardDescription className="text-gray-400">알림을 생성할 세금을 선택하세요</CardDescription>
                </CardHeader>
                <CardContent>
                  {taxes.length > 0 ? (
                    <div className="space-y-4">
                      {taxes.map((tax) => (
                        <div key={tax.id} className="flex items-center space-x-3 p-4 bg-gray-700/50 rounded-lg">
                          <Checkbox
                            id={tax.id}
                            checked={selectedTaxes.includes(tax.id)}
                            onCheckedChange={(checked) => handleTaxToggle(tax.id, checked as boolean)}
                            className="border-gray-600 data-[state=checked]:bg-blue-600"
                          />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-medium text-white">{tax.tax_types.name}</h4>
                                <p className="text-sm text-gray-400">{tax.charge_stations.name}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold text-white">{tax.amount.toLocaleString("ko-KR")}원</p>
                                <p className="text-sm text-gray-400">
                                  납부일: {new Date(tax.due_date).toLocaleDateString("ko-KR")}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}

                      {error && (
                        <div className="p-3 bg-red-900/50 border border-red-700 rounded-lg">
                          <p className="text-sm text-red-300">{error}</p>
                        </div>
                      )}

                      <div className="flex gap-4 pt-4">
                        <Button
                          onClick={handleSubmit}
                          className="flex-1 bg-blue-600 hover:bg-blue-700"
                          disabled={isLoading || selectedTaxes.length === 0}
                        >
                          {isLoading ? "생성 중..." : `${selectedTaxes.length}개 알림 생성`}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => router.back()}
                          disabled={isLoading}
                          className="bg-gray-800/50 border-gray-700 text-gray-300 hover:bg-gray-700"
                        >
                          취소
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-12 h-12 bg-green-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-white mb-2">알림 생성 가능한 세금이 없습니다</h3>
                      <p className="text-gray-400 mb-4">모든 미납 세금에 대한 알림이 이미 설정되어 있습니다</p>
                      <Button
                        asChild
                        variant="outline"
                        className="bg-gray-800/50 border-gray-700 text-gray-300 hover:bg-gray-700"
                      >
                        <Link href="/dashboard/reminders">알림 목록으로 돌아가기</Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
