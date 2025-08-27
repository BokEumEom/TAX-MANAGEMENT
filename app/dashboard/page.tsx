import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch user's charge stations
  const { data: chargeStations } = await supabase.from("charge_stations").select("*").eq("owner_id", user.id)

  // Fetch upcoming taxes
  const { data: upcomingTaxes } = await supabase
    .from("taxes")
    .select(`
      *,
      charge_stations(name),
      tax_types(name, rate)
    `)
    .in("charge_station_id", chargeStations?.map((cs) => cs.id) || [])
    .eq("status", "pending")
    .gte("due_date", new Date().toISOString().split("T")[0])
    .order("due_date", { ascending: true })
    .limit(5)

  // Fetch overdue taxes
  const { data: overdueTaxes } = await supabase
    .from("taxes")
    .select(`
      *,
      charge_stations(name),
      tax_types(name)
    `)
    .in("charge_station_id", chargeStations?.map((cs) => cs.id) || [])
    .eq("status", "pending")
    .lt("due_date", new Date().toISOString().split("T")[0])

  // Calculate statistics
  const totalStations = chargeStations?.length || 0
  const totalUpcoming = upcomingTaxes?.length || 0
  const totalOverdue = overdueTaxes?.length || 0
  const totalAmount = upcomingTaxes?.reduce((sum, tax) => sum + Number(tax.amount), 0) || 0

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">세무 관리 대시보드</h1>
            <p className="text-gray-400 mt-2">충전소 세무 현황을 한눈에 확인하세요</p>
          </div>
          <div className="flex gap-3">
            <Button asChild className="bg-yellow-500 hover:bg-yellow-600 text-black border-0">
              <Link href="/dashboard/taxes/new">세금 등록</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-800 bg-transparent"
            >
              <Link href="/dashboard/stations">충전소 관리</Link>
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gray-800 border-gray-700 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-400">총 충전소</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{totalStations}</div>
              <p className="text-xs text-gray-500 mt-1">운영 중인 충전소</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-400">예정된 납부</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-400">{totalUpcoming}</div>
              <p className="text-xs text-gray-500 mt-1">이번 달 납부 예정</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-400">연체된 납부</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-400">{totalOverdue}</div>
              <p className="text-xs text-gray-500 mt-1">즉시 처리 필요</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-400">예정 납부액</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">{totalAmount.toLocaleString("ko-KR")}원</div>
              <p className="text-xs text-gray-500 mt-1">이번 달 총 납부 예정액</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Upcoming Taxes */}
          <Card className="bg-gray-800 border-gray-700 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-white">다가오는 납부 일정</CardTitle>
              <CardDescription className="text-gray-400">가까운 납부 일정을 확인하세요</CardDescription>
            </CardHeader>
            <CardContent>
              {upcomingTaxes && upcomingTaxes.length > 0 ? (
                <div className="space-y-4">
                  {upcomingTaxes.map((tax) => (
                    <div
                      key={tax.id}
                      className="flex items-center justify-between p-4 bg-gray-700 rounded-lg border border-gray-600"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-white">{tax.tax_types?.name}</h4>
                          <Badge variant="outline" className="text-xs border-gray-600 text-gray-300">
                            {tax.charge_stations?.name}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-400">
                          납부일: {new Date(tax.due_date).toLocaleDateString("ko-KR")}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-white">{Number(tax.amount).toLocaleString("ko-KR")}원</p>
                        <Badge
                          variant={
                            new Date(tax.due_date) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                              ? "destructive"
                              : "secondary"
                          }
                          className="text-xs"
                        >
                          {Math.ceil((new Date(tax.due_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))}
                          일 남음
                        </Badge>
                      </div>
                    </div>
                  ))}
                  <Button
                    asChild
                    variant="outline"
                    className="w-full mt-4 bg-transparent border-gray-600 text-gray-300 hover:bg-gray-700"
                  >
                    <Link href="/dashboard/taxes">모든 세금 보기</Link>
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-400">예정된 납부가 없습니다</p>
                  <Button asChild className="mt-4 bg-yellow-500 hover:bg-yellow-600 text-black" size="sm">
                    <Link href="/dashboard/taxes/new">세금 등록하기</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Overdue Taxes */}
          <Card className="bg-gray-800 border-gray-700 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-white">연체된 납부</CardTitle>
              <CardDescription className="text-gray-400">즉시 처리가 필요한 항목들</CardDescription>
            </CardHeader>
            <CardContent>
              {overdueTaxes && overdueTaxes.length > 0 ? (
                <div className="space-y-4">
                  {overdueTaxes.slice(0, 5).map((tax) => (
                    <div
                      key={tax.id}
                      className="flex items-center justify-between p-4 bg-red-900/20 border border-red-800 rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-white">{tax.tax_types?.name}</h4>
                          <Badge variant="outline" className="text-xs border-gray-600 text-gray-300">
                            {tax.charge_stations?.name}
                          </Badge>
                        </div>
                        <p className="text-sm text-red-400">
                          납부일: {new Date(tax.due_date).toLocaleDateString("ko-KR")}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-white">{Number(tax.amount).toLocaleString("ko-KR")}원</p>
                        <Badge variant="destructive" className="text-xs">
                          {Math.abs(
                            Math.ceil(
                              (new Date(tax.due_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
                            ),
                          )}
                          일 연체
                        </Badge>
                      </div>
                    </div>
                  ))}
                  <Button asChild variant="destructive" className="w-full mt-4">
                    <Link href="/dashboard/taxes?filter=overdue">연체 항목 처리하기</Link>
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-gray-400">연체된 납부가 없습니다</p>
                  <p className="text-sm text-green-400 mt-1">모든 세금이 정상적으로 관리되고 있습니다</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
