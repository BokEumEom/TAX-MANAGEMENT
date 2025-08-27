"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

interface Tax {
  id: string
  amount: number
  due_date: string
  status: string
  charge_station_id: string
  tax_type_id: string
  description?: string
}

interface ChargeStation {
  id: string
  name: string
  location: string
}

interface TaxType {
  id: string
  name: string
  rate: number
}

export default function EditTaxPage() {
  const [tax, setTax] = useState<Tax | null>(null)
  const [chargeStations, setChargeStations] = useState<ChargeStation[]>([])
  const [taxTypes, setTaxTypes] = useState<TaxType[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/auth/login")
        return
      }

      // Check user role
      const { data: userProfile } = await supabase.from("users").select("role").eq("id", user.id).single()
      if (userProfile?.role !== "admin") {
        toast({
          title: "접근 권한 없음",
          description: "관리자만 세금을 수정할 수 있습니다.",
          variant: "destructive",
        })
        router.push("/dashboard/taxes")
        return
      }

      // Fetch tax data
      const { data: taxData, error: taxError } = await supabase.from("taxes").select("*").eq("id", params.id).single()

      if (taxError || !taxData) {
        toast({
          title: "오류",
          description: "세금 정보를 불러올 수 없습니다.",
          variant: "destructive",
        })
        router.push("/dashboard/taxes")
        return
      }

      setTax(taxData)

      // Fetch charge stations and tax types
      const [{ data: stationsData }, { data: typesData }] = await Promise.all([
        supabase.from("charge_stations").select("*").order("name"),
        supabase.from("tax_types").select("*").order("name"),
      ])

      setChargeStations(stationsData || [])
      setTaxTypes(typesData || [])
    } catch (error) {
      console.error("[v0] Error fetching data:", error)
      toast({
        title: "오류",
        description: "데이터를 불러오는데 실패했습니다.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!tax) return

    setSaving(true)

    try {
      const supabase = createClient()

      const { error } = await supabase
        .from("taxes")
        .update({
          amount: tax.amount,
          due_date: tax.due_date,
          charge_station_id: tax.charge_station_id,
          tax_type_id: tax.tax_type_id,
          description: tax.description,
          updated_at: new Date().toISOString(),
        })
        .eq("id", tax.id)

      if (error) {
        toast({
          title: "수정 실패",
          description: error.message,
          variant: "destructive",
        })
        return
      }

      toast({
        title: "수정 완료",
        description: "세금 정보가 성공적으로 수정되었습니다.",
      })

      router.push("/dashboard/taxes")
    } catch (error) {
      console.error("[v0] Error updating tax:", error)
      toast({
        title: "수정 실패",
        description: "수정 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 px-6 py-8 flex items-center justify-center">
        <div className="text-white">로딩 중...</div>
      </div>
    )
  }

  if (!tax) {
    return (
      <div className="min-h-screen bg-gray-900 px-6 py-8 flex items-center justify-center">
        <div className="text-white">세금 정보를 찾을 수 없습니다.</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 px-6 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">세금 수정</h1>
          <p className="text-gray-400 mt-2">세금 정보를 수정하세요</p>
        </div>

        <Card className="bg-gray-800/50 backdrop-blur border-gray-700 shadow-lg">
          <CardHeader>
            <CardTitle className="text-white">세금 정보 수정</CardTitle>
            <CardDescription className="text-gray-400">필요한 정보를 수정하고 저장하세요</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="tax_type" className="text-gray-300">
                  세금 유형
                </Label>
                <Select value={tax.tax_type_id} onValueChange={(value) => setTax({ ...tax, tax_type_id: value })}>
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                    <SelectValue placeholder="세금 유형을 선택하세요" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-700 border-gray-600">
                    {taxTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id} className="text-white hover:bg-gray-600">
                        {type.name} ({type.rate}%)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="charge_station" className="text-gray-300">
                  충전소
                </Label>
                <Select
                  value={tax.charge_station_id}
                  onValueChange={(value) => setTax({ ...tax, charge_station_id: value })}
                >
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                    <SelectValue placeholder="충전소를 선택하세요" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-700 border-gray-600">
                    {chargeStations.map((station) => (
                      <SelectItem key={station.id} value={station.id} className="text-white hover:bg-gray-600">
                        {station.name} - {station.location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount" className="text-gray-300">
                  금액 (원)
                </Label>
                <Input
                  id="amount"
                  type="number"
                  value={tax.amount}
                  onChange={(e) => setTax({ ...tax, amount: Number(e.target.value) })}
                  className="bg-gray-700 border-gray-600 text-white"
                  placeholder="세금 금액을 입력하세요"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="due_date" className="text-gray-300">
                  납부 기한
                </Label>
                <Input
                  id="due_date"
                  type="date"
                  value={tax.due_date}
                  onChange={(e) => setTax({ ...tax, due_date: e.target.value })}
                  className="bg-gray-700 border-gray-600 text-white"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-gray-300">
                  메모 (선택사항)
                </Label>
                <Input
                  id="description"
                  value={tax.description || ""}
                  onChange={(e) => setTax({ ...tax, description: e.target.value })}
                  className="bg-gray-700 border-gray-600 text-white"
                  placeholder="추가 메모나 특이사항을 입력하세요"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={saving}
                  className="bg-yellow-500 hover:bg-yellow-600 text-black disabled:opacity-50"
                >
                  {saving ? "저장 중..." : "변경사항 저장"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  asChild
                  className="border-gray-600 text-gray-300 bg-transparent"
                >
                  <Link href="/dashboard/taxes">취소</Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
