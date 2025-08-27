"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { getStatusLabel, requiresAccountantReview, getNextStatus, canTransitionTo } from "@/lib/utils/tax-utils"

interface Tax {
  id: string
  amount: number
  due_date: string
  status: string
  charge_stations: {
    name: string
    location: string
  }
  tax_types: {
    id: string
    name: string
    rate: number
  }
}

export default function TaxesPage() {
  const [taxes, setTaxes] = useState<Tax[]>([])
  const [loading, setLoading] = useState(true)
  const [processingTaxId, setProcessingTaxId] = useState<string | null>(null)
  const [userRole, setUserRole] = useState<string>("user")
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    fetchTaxes()
  }, [])

  const fetchTaxes = async () => {
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

      const { data: taxesData, error } = await supabase
        .from("taxes")
        .select(`
          *,
          charge_stations(name, location),
          tax_types(id, name, rate)
        `)
        .order("due_date", { ascending: false })

      if (error) {
        console.error("[v0] Error fetching taxes:", error)
        toast({
          title: "오류",
          description: "세금 데이터를 불러오는데 실패했습니다.",
          variant: "destructive",
        })
        return
      }

      console.log("[v0] Fetched taxes:", taxesData)
      setTaxes(taxesData || [])
    } catch (error) {
      console.error("[v0] Error in fetchTaxes:", error)
      toast({
        title: "오류",
        description: "데이터를 불러오는데 실패했습니다.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleStatusTransition = async (taxId: string, targetStatus: string, tax: Tax) => {
    if (userRole === "user") {
      toast({
        title: "권한 없음",
        description: "뷰어 권한으로는 상태 변경을 할 수 없습니다.",
        variant: "destructive",
      })
      return
    }

    // Validate transition
    if (!canTransitionTo(tax.status as any, targetStatus as any, tax.tax_types)) {
      toast({
        title: "상태 변경 불가",
        description: "현재 상태에서 해당 상태로 변경할 수 없습니다.",
        variant: "destructive",
      })
      return
    }

    console.log("[v0] Transitioning tax status:", taxId, "from", tax.status, "to", targetStatus)
    setProcessingTaxId(taxId)

    try {
      const supabase = createClient()

      const updateData: any = {
        status: targetStatus,
        updated_at: new Date().toISOString(),
      }

      // Set paid_date for completed status, clear for others
      if (targetStatus === "completed") {
        updateData.paid_date = new Date().toISOString().split("T")[0]
      } else if (tax.status === "completed" && targetStatus !== "completed") {
        updateData.paid_date = null
      }

      const { error } = await supabase.from("taxes").update(updateData).eq("id", taxId)

      if (error) {
        console.error("[v0] Error updating tax status:", error)
        toast({
          title: "상태 변경 실패",
          description: error.message,
          variant: "destructive",
        })
        return
      }

      console.log("[v0] Tax status transition successful")
      toast({
        title: "상태 변경 완료",
        description: `세금 상태가 ${getStatusLabel(targetStatus as any)}로 변경되었습니다.`,
      })

      await fetchTaxes()
    } catch (error) {
      console.error("[v0] Error in handleStatusTransition:", error)
      toast({
        title: "상태 변경 실패",
        description: "상태 변경 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    } finally {
      setProcessingTaxId(null)
    }
  }

  const handlePayment = async (taxId: string) => {
    if (userRole === "user") {
      toast({
        title: "권한 없음",
        description: "뷰어 권한으로는 납부 처리를 할 수 없습니다.",
        variant: "destructive",
      })
      return
    }

    console.log("[v0] Starting payment for tax:", taxId)
    setProcessingTaxId(taxId)

    try {
      const supabase = createClient()

      const { error } = await supabase
        .from("taxes")
        .update({
          status: "paid",
          paid_date: new Date().toISOString().split("T")[0], // Format as YYYY-MM-DD
          updated_at: new Date().toISOString(),
        })
        .eq("id", taxId)

      if (error) {
        console.error("[v0] Error updating tax:", error)
        toast({
          title: "납부 실패",
          description: error.message,
          variant: "destructive",
        })
        return
      }

      console.log("[v0] Tax payment successful")
      toast({
        title: "납부 완료",
        description: "세금이 성공적으로 납부 처리되었습니다.",
      })

      await fetchTaxes()
    } catch (error) {
      console.error("[v0] Error in handlePayment:", error)
      toast({
        title: "납부 실패",
        description: "납부 처리 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    } finally {
      setProcessingTaxId(null)
    }
  }

  const handleRevertPayment = async (taxId: string) => {
    if (userRole === "user") {
      toast({
        title: "권한 없음",
        description: "뷰어 권한으로는 상태 변경을 할 수 없습니다.",
        variant: "destructive",
      })
      return
    }

    console.log("[v0] Reverting payment for tax:", taxId)
    setProcessingTaxId(taxId)

    try {
      const supabase = createClient()

      const { error } = await supabase
        .from("taxes")
        .update({
          status: "pending",
          paid_date: null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", taxId)

      if (error) {
        console.error("[v0] Error reverting tax:", error)
        toast({
          title: "원복 실패",
          description: error.message,
          variant: "destructive",
        })
        return
      }

      console.log("[v0] Tax revert successful")
      toast({
        title: "상태 원복 완료",
        description: "세금 상태가 미납으로 원복되었습니다.",
      })

      await fetchTaxes()
    } catch (error) {
      console.error("[v0] Error in handleRevertPayment:", error)
      toast({
        title: "원복 실패",
        description: "상태 원복 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    } finally {
      setProcessingTaxId(null)
    }
  }

  const handleDeleteTax = async (taxId: string) => {
    if (userRole === "user") {
      toast({
        title: "권한 없음",
        description: "뷰어 권한으로는 삭제를 할 수 없습니다.",
        variant: "destructive",
      })
      return
    }

    if (!confirm("정말로 이 세금을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) {
      return
    }

    console.log("[v0] Deleting tax:", taxId)
    setProcessingTaxId(taxId)

    try {
      const supabase = createClient()

      const { error } = await supabase.from("taxes").delete().eq("id", taxId)

      if (error) {
        console.error("[v0] Error deleting tax:", error)
        toast({
          title: "삭제 실패",
          description: error.message,
          variant: "destructive",
        })
        return
      }

      console.log("[v0] Tax deletion successful")
      toast({
        title: "삭제 완료",
        description: "세금이 성공적으로 삭제되었습니다.",
      })

      await fetchTaxes()
    } catch (error) {
      console.error("[v0] Error in handleDeleteTax:", error)
      toast({
        title: "삭제 실패",
        description: "삭제 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    } finally {
      setProcessingTaxId(null)
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

  const pendingTaxes = taxes?.filter((tax) => tax.status === "pending" || tax.status === "accountant_review") || []
  const overdueTaxes = pendingTaxes.filter((tax) => new Date(tax.due_date) < new Date())
  const upcomingTaxes = pendingTaxes.filter((tax) => {
    const due = new Date(tax.due_date)
    const weekFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    return due >= new Date() && due <= weekFromNow
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 px-6 py-8 flex items-center justify-center">
        <div className="text-white">로딩 중...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 px-6 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">세금 관리</h1>
          <p className="text-gray-400 mt-2">모든 세금 납부 현황을 관리하세요</p>
        </div>
        {userRole === "admin" && (
          <div className="flex gap-3">
            <Button asChild className="bg-yellow-500 hover:bg-yellow-600 text-black">
              <Link href="/dashboard/taxes/new">세금 등록</Link>
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-gray-800/50 backdrop-blur border-gray-700 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-400">총 세금</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{taxes?.length || 0}</div>
            <p className="text-xs text-gray-500 mt-1">등록된 세금</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 backdrop-blur border-gray-700 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-400">임박한 납부</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-400">{upcomingTaxes.length}</div>
            <p className="text-xs text-gray-500 mt-1">7일 이내 납부</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 backdrop-blur border-gray-700 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-400">연체</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-400">{overdueTaxes.length}</div>
            <p className="text-xs text-gray-500 mt-1">즉시 납부 필요</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gray-800/50 backdrop-blur border-gray-700 shadow-lg">
        <CardHeader>
          <CardTitle className="text-white">세금 목록</CardTitle>
          <CardDescription className="text-gray-400">등록된 모든 세금 항목을 확인하고 관리하세요</CardDescription>
        </CardHeader>
        <CardContent>
          {taxes && taxes.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow className="border-gray-700">
                  <TableHead className="text-gray-300">세금 유형</TableHead>
                  <TableHead className="text-gray-300">충전소</TableHead>
                  <TableHead className="text-gray-300">금액</TableHead>
                  <TableHead className="text-gray-300">납부일</TableHead>
                  <TableHead className="text-gray-300">상태</TableHead>
                  <TableHead className="text-gray-300">작업</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {taxes.map((tax) => {
                  const isAcquisitionTax = requiresAccountantReview(tax.tax_types)
                  const nextStatus = getNextStatus(tax.status as any, tax.tax_types)

                  return (
                    <TableRow key={tax.id} className="border-gray-700 hover:bg-gray-700/50">
                      <TableCell className="font-medium text-white">
                        <div>
                          {tax.tax_types?.name}
                          {isAcquisitionTax && (
                            <Badge variant="outline" className="ml-2 text-xs">
                              회계사검토 필요
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium text-white">{tax.charge_stations?.name}</div>
                          <div className="text-sm text-gray-400">{tax.charge_stations?.location}</div>
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold text-white">
                        {Number(tax.amount).toLocaleString("ko-KR")}원
                      </TableCell>
                      <TableCell className="text-gray-300">
                        {new Date(tax.due_date).toLocaleDateString("ko-KR")}
                      </TableCell>
                      <TableCell>{getStatusBadge(tax.status, tax.due_date)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2 flex-wrap">
                          <Button
                            asChild
                            size="sm"
                            variant="outline"
                            className="border-gray-500/50 text-gray-300 hover:bg-gray-500/10 bg-transparent"
                          >
                            <Link href={`/dashboard/taxes/${tax.id}`}>상세</Link>
                          </Button>

                          {userRole === "admin" && (
                            <Button
                              asChild
                              size="sm"
                              variant="outline"
                              className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10 bg-transparent"
                            >
                              <Link href={`/dashboard/taxes/${tax.id}/edit`}>수정</Link>
                            </Button>
                          )}

                          {userRole === "admin" && nextStatus && (
                            <Button
                              onClick={() => handleStatusTransition(tax.id, nextStatus, tax)}
                              disabled={processingTaxId === tax.id}
                              size="sm"
                              className="bg-yellow-500 hover:bg-yellow-600 text-black disabled:opacity-50"
                            >
                              {processingTaxId === tax.id ? "처리중..." : getStatusLabel(nextStatus)}
                            </Button>
                          )}

                          {tax.status === "completed" && userRole === "admin" && (
                            <Button
                              onClick={() => handleStatusTransition(tax.id, "pending", tax)}
                              disabled={processingTaxId === tax.id}
                              size="sm"
                              variant="outline"
                              className="border-orange-500/50 text-orange-400 hover:bg-orange-500/10"
                            >
                              {processingTaxId === tax.id ? "처리중..." : "원복"}
                            </Button>
                          )}

                          {tax.status === "pending" && isAcquisitionTax && userRole === "admin" && (
                            <Button
                              onClick={() => handleStatusTransition(tax.id, "accountant_review", tax)}
                              disabled={processingTaxId === tax.id}
                              size="sm"
                              variant="outline"
                              className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10"
                            >
                              {processingTaxId === tax.id ? "처리중..." : "검토로 원복"}
                            </Button>
                          )}

                          {userRole === "admin" && (
                            <Button
                              onClick={() => handleDeleteTax(tax.id)}
                              disabled={processingTaxId === tax.id}
                              size="sm"
                              variant="outline"
                              className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                            >
                              {processingTaxId === tax.id ? "처리중..." : "삭제"}
                            </Button>
                          )}

                          {userRole === "user" && (
                            <Badge variant="outline" className="text-gray-400 border-gray-600">
                              조회 전용
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-white mb-2">등록된 세금이 없습니다</h3>
              <p className="text-gray-400 mb-6">첫 번째 세금을 등록하여 관리를 시작하세요</p>
              {userRole === "admin" && (
                <Button asChild className="bg-yellow-500 hover:bg-yellow-600 text-black">
                  <Link href="/dashboard/taxes/new">첫 세금 등록하기</Link>
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
