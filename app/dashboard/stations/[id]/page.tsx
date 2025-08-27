import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Link from "next/link"

interface Props {
  params: Promise<{ id: string }>
}

export default async function StationDetailPage({ params }: Props) {
  const { id } = await params

  if (id === "new") {
    redirect("/dashboard/stations/new")
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch station details
  const { data: station } = await supabase
    .from("charge_stations")
    .select("*")
    .eq("id", id)
    .eq("owner_id", user.id)
    .single()

  if (!station) {
    notFound()
  }

  // Fetch taxes for this station
  const { data: taxes } = await supabase
    .from("taxes")
    .select(`
      *,
      tax_types(name, rate)
    `)
    .eq("charge_station_id", id)
    .order("due_date", { ascending: false })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">운영중</Badge>
      case "inactive":
        return <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">비활성</Badge>
      case "maintenance":
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">점검중</Badge>
      default:
        return <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">알 수 없음</Badge>
    }
  }

  const getTaxStatusBadge = (status: string, dueDate: string) => {
    const today = new Date()
    const due = new Date(dueDate)

    if (status === "paid") {
      return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">납부완료</Badge>
    } else if (status === "cancelled") {
      return <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">취소됨</Badge>
    } else if (due < today) {
      return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">연체</Badge>
    } else if (due <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)) {
      return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">임박</Badge>
    } else {
      return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">대기중</Badge>
    }
  }

  const totalTaxes = taxes?.length || 0
  const pendingTaxes = taxes?.filter((t) => t.status === "pending").length || 0
  const totalAmount =
    taxes?.filter((t) => t.status === "pending").reduce((sum, tax) => sum + Number(tax.amount), 0) || 0

  return (
    <div className="min-h-screen bg-gray-900 px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">{station.name}</h1>
          <p className="text-gray-400 mt-2">충전소 상세 정보 및 세무 현황</p>
        </div>
        <div className="flex gap-3">
          <Button asChild className="bg-gray-800/50 text-white border-gray-700 hover:bg-gray-700/50">
            <Link href={`/dashboard/stations/${station.id}/edit`}>편집</Link>
          </Button>
          <Button asChild className="bg-blue-600/80 hover:bg-blue-600 text-white">
            <Link href={`/dashboard/taxes/new?station=${station.id}`}>세금 등록</Link>
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Station Information */}
        <div className="lg:col-span-1">
          <Card className="bg-gray-800/50 backdrop-blur border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-white">
                충전소 정보
                {getStatusBadge(station.status)}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium text-white mb-1">충전소명</h4>
                <p className="text-gray-300">{station.name}</p>
              </div>
              <div>
                <h4 className="font-medium text-white mb-1">위치</h4>
                <p className="text-gray-300">{station.location}</p>
              </div>
              <div>
                <h4 className="font-medium text-white mb-1">등록일</h4>
                <p className="text-gray-300">{new Date(station.created_at).toLocaleDateString("ko-KR")}</p>
              </div>
              <div>
                <h4 className="font-medium text-white mb-1">최종 수정일</h4>
                <p className="text-gray-300">{new Date(station.updated_at).toLocaleDateString("ko-KR")}</p>
              </div>
            </CardContent>
          </Card>

          {/* Tax Statistics */}
          <Card className="bg-gray-800/50 backdrop-blur border-gray-700 mt-6">
            <CardHeader>
              <CardTitle className="text-white">세무 현황</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">총 세금 항목</span>
                <span className="font-semibold text-white">{totalTaxes}개</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">미납 항목</span>
                <span className="font-semibold text-red-400">{pendingTaxes}개</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">미납 총액</span>
                <span className="font-semibold text-red-400">{totalAmount.toLocaleString("ko-KR")}원</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tax History */}
        <div className="lg:col-span-2">
          <Card className="bg-gray-800/50 backdrop-blur border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">세금 내역</CardTitle>
              <CardDescription className="text-gray-400">이 충전소에 등록된 모든 세금 항목</CardDescription>
            </CardHeader>
            <CardContent>
              {taxes && taxes.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-700">
                      <TableHead className="text-gray-300">세금 유형</TableHead>
                      <TableHead className="text-gray-300">금액</TableHead>
                      <TableHead className="text-gray-300">납부일</TableHead>
                      <TableHead className="text-gray-300">상태</TableHead>
                      <TableHead className="text-gray-300">작업</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {taxes.map((tax) => (
                      <TableRow key={tax.id} className="border-gray-700 hover:bg-gray-700/30">
                        <TableCell className="font-medium text-white">{tax.tax_types?.name}</TableCell>
                        <TableCell className="font-semibold text-white">
                          {Number(tax.amount).toLocaleString("ko-KR")}원
                        </TableCell>
                        <TableCell className="text-gray-300">
                          {new Date(tax.due_date).toLocaleDateString("ko-KR")}
                        </TableCell>
                        <TableCell>{getTaxStatusBadge(tax.status, tax.due_date)}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              asChild
                              size="sm"
                              className="bg-blue-600/20 text-blue-400 border-blue-500/30 hover:bg-blue-600/30"
                            >
                              <Link href={`/dashboard/taxes/${tax.id}`}>상세</Link>
                            </Button>
                            {tax.status === "pending" && (
                              <Button asChild size="sm" className="bg-green-600/80 hover:bg-green-600 text-white">
                                <Link href={`/dashboard/taxes/${tax.id}/pay`}>납부</Link>
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <p className="text-gray-400 mb-4">등록된 세금이 없습니다</p>
                  <Button asChild className="bg-blue-600/80 hover:bg-blue-600 text-white">
                    <Link href={`/dashboard/taxes/new?station=${station.id}`}>첫 세금 등록하기</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
