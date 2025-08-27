import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Link from "next/link"

export default async function StationsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: userData } = await supabase.from("users").select("role").eq("id", user.id).single()

  const isAdmin = userData?.role === "admin"

  // Fetch all company charge stations with tax count
  const { data: stations } = await supabase
    .from("charge_stations")
    .select(`
      *,
      taxes(count)
    `)
    .order("created_at", { ascending: false })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">운영중</Badge>
      case "inactive":
        return <Badge variant="secondary">비활성</Badge>
      case "maintenance":
        return <Badge className="bg-yellow-100 text-yellow-800">점검중</Badge>
      default:
        return <Badge variant="outline">알 수 없음</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 px-6 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">충전소 관리</h1>
          <p className="text-gray-400 mt-2">등록된 충전소를 관리하고 새로운 충전소를 추가하세요</p>
          {!isAdmin && (
            <Badge variant="outline" className="mt-2 border-gray-600 text-gray-400">
              조회 전용
            </Badge>
          )}
        </div>
        {isAdmin && (
          <Button asChild className="bg-yellow-500 hover:bg-yellow-600 text-black">
            <Link href="/dashboard/stations/new">새 충전소 등록</Link>
          </Button>
        )}
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-gray-800/50 backdrop-blur border-gray-700 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-400">총 충전소</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stations?.length || 0}</div>
            <p className="text-xs text-gray-500 mt-1">등록된 충전소</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 backdrop-blur border-gray-700 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-400">운영중</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">
              {stations?.filter((s) => s.status === "active").length || 0}
            </div>
            <p className="text-xs text-gray-500 mt-1">정상 운영 중</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 backdrop-blur border-gray-700 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-400">점검중</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-400">
              {stations?.filter((s) => s.status === "maintenance").length || 0}
            </div>
            <p className="text-xs text-gray-500 mt-1">점검 및 정비</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gray-800/50 backdrop-blur border-gray-700 shadow-lg">
        <CardHeader>
          <CardTitle className="text-white">충전소 목록</CardTitle>
          <CardDescription className="text-gray-400">등록된 모든 충전소를 확인하고 관리하세요</CardDescription>
        </CardHeader>
        <CardContent>
          {stations && stations.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow className="border-gray-700">
                  <TableHead className="text-gray-300">충전소명</TableHead>
                  <TableHead className="text-gray-300">위치</TableHead>
                  <TableHead className="text-gray-300">상태</TableHead>
                  <TableHead className="text-gray-300">등록 세금</TableHead>
                  <TableHead className="text-gray-300">등록일</TableHead>
                  <TableHead className="text-gray-300">작업</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stations.map((station) => (
                  <TableRow key={station.id} className="border-gray-700 hover:bg-gray-700/50">
                    <TableCell className="font-medium text-white">{station.name}</TableCell>
                    <TableCell className="text-gray-300">{station.location}</TableCell>
                    <TableCell>{getStatusBadge(station.status)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-gray-600 text-gray-300">
                        {station.taxes?.[0]?.count || 0}개
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-300">
                      {new Date(station.created_at).toLocaleDateString("ko-KR")}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          asChild
                          size="sm"
                          className="bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 hover:bg-yellow-500/30 hover:text-yellow-300 transition-all duration-200"
                        >
                          <Link href={`/dashboard/stations/${station.id}`}>상세</Link>
                        </Button>
                        {isAdmin && (
                          <Button
                            asChild
                            size="sm"
                            className="bg-orange-600/20 text-orange-400 border border-orange-500/30 hover:bg-orange-600/30 hover:text-orange-300 transition-all duration-200"
                          >
                            <Link href={`/dashboard/stations/${station.id}/edit`}>편집</Link>
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-white mb-2">등록된 충전소가 없습니다</h3>
              <p className="text-gray-400 mb-6">첫 번째 충전소를 등록하여 관리를 시작하세요</p>
              {isAdmin && (
                <Button asChild className="bg-yellow-500 hover:bg-yellow-600 text-black">
                  <Link href="/dashboard/stations/new">첫 충전소 등록하기</Link>
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
