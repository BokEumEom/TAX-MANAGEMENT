"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

interface Tax {
  id: string
  amount: number
  due_date: string
  paid_date?: string
  status: string
  description?: string
  created_at: string
  updated_at: string
  charge_stations: {
    name: string
    location: string
  }
  tax_types: {
    name: string
    rate: number
  }
}

export default function TaxDetailPage() {
  const [tax, setTax] = useState<Tax | null>(null)
  const [loading, setLoading] = useState(true)
  const [userRole, setUserRole] = useState<string>("user")
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()

  useEffect(() => {
    fetchTaxDetail()
  }, [])

  const fetchTaxDetail = async () => {
    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/auth/login")
        return
      }

      const { data: userProfile } = await supabase.from("users").select("role").eq("id", user.id).single()
      setUserRole(userProfile?.role || "user")

      const { data: taxData, error } = await supabase
        .from("taxes")
        .select(`
          *,
          charge_stations(name, location),
          tax_types(name, rate)
        `)
        .eq("id", params.id)
        .single()

      if (error || !taxData) {
        console.error("[v0] Error fetching tax detail:", error)
        toast({
          title: "오류",
          description: "세금 정보를 불러올 수 없습니다.",
          variant: "destructive",
        })
        router.push("/dashboard/taxes")
        return
      }

      setTax(taxData)
    } catch (error) {
      console.error("[v0] Error in fetchTaxDetail:", error)
      toast({
        title: "오류",
        description: "데이터를 불러오는데 실패했습니다.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string, dueDate: string) => {
    const today = new Date()
    const due = new Date(dueDate)

    if (status === "completed" || status === "paid") {
      return <Badge className="bg-green-100 text-green-800">납부완료</Badge>
    } else if (status === "accountant_review") {
      return <Badge className="bg-blue-100 text-blue-800">회계사검토</Badge>
    } else if (status === "cancelled") {
      return <Badge variant="secondary">취소됨</Badge>
    } else if (due < today) {
      return <Badge variant="destructive">연체</Badge>
    } else if (due <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)) {
      return <Badge className="bg-yellow-100 text-yellow-800">임박</Badge>
    } else {
      return <Badge variant="outline">대기중</Badge>
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
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">세금 상세</h1>
            <p className="text-gray-400 mt-2">세금 정보를 확인하세요</p>
          </div>
          <div className="flex gap-3">
            <Button asChild variant="outline" className="border-gray-600 text-gray-300 bg-transparent">
              <Link href="/dashboard/taxes">목록으로</Link>
            </Button>
            {userRole === "admin" && (
              <Button asChild className="bg-yellow-500 hover:bg-yellow-600 text-black">
                <Link href={`/dashboard/taxes/${tax.id}/edit`}>수정</Link>
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-gray-800/50 backdrop-blur border-gray-700 shadow-lg">
            <CardHeader>
              <CardTitle className="text-white">기본 정보</CardTitle>
              <CardDescription className="text-gray-400">세금의 기본 정보입니다</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-400">세금 유형</label>
                <p className="text-white font-semibold">{tax.tax_types?.name}</p>
                <p className="text-sm text-gray-400">세율: {tax.tax_types?.rate}%</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-400">충전소</label>
                <p className="text-white font-semibold">{tax.charge_stations?.name}</p>
                <p className="text-sm text-gray-400">{tax.charge_stations?.location}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-400">금액</label>
                <p className="text-white font-semibold text-lg">{Number(tax.amount).toLocaleString("ko-KR")}원</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-400">상태</label>
                <div className="mt-1">{getStatusBadge(tax.status, tax.due_date)}</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 backdrop-blur border-gray-700 shadow-lg">
            <CardHeader>
              <CardTitle className="text-white">일정 정보</CardTitle>
              <CardDescription className="text-gray-400">세금 관련 중요 일정입니다</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-400">납부 기한</label>
                <p className="text-white font-semibold">
                  {new Date(tax.due_date).toLocaleDateString("ko-KR", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    weekday: "short",
                  })}
                </p>
              </div>

              {tax.paid_date && (
                <div>
                  <label className="text-sm font-medium text-gray-400">납부 완료일</label>
                  <p className="text-white font-semibold">
                    {new Date(tax.paid_date).toLocaleDateString("ko-KR", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      weekday: "short",
                    })}
                  </p>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-gray-400">등록일</label>
                <p className="text-white">
                  {new Date(tax.created_at).toLocaleDateString("ko-KR", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-400">최종 수정일</label>
                <p className="text-white">
                  {new Date(tax.updated_at).toLocaleDateString("ko-KR", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </CardContent>
          </Card>

          {tax.description && (
            <Card className="bg-gray-800/50 backdrop-blur border-gray-700 shadow-lg lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-white">메모</CardTitle>
                <CardDescription className="text-gray-400">추가 정보 및 메모</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-white whitespace-pre-wrap">{tax.description}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
