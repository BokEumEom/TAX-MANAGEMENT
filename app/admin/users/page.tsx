import { requireAdmin } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Link from "next/link"

export default async function UsersManagementPage() {
  await requireAdmin()
  const supabase = await createClient()

  // Fetch all users with their charge stations count
  const { data: users } = await supabase
    .from("users")
    .select(`
      *,
      charge_stations(count)
    `)
    .order("created_at", { ascending: false })

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return <Badge variant="destructive">관리자</Badge>
      case "manager":
        return <Badge className="bg-blue-100 text-blue-800">매니저</Badge>
      case "user":
        return <Badge variant="secondary">사용자</Badge>
      default:
        return <Badge variant="outline">알 수 없음</Badge>
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">사용자 관리</h1>
          <p className="text-slate-600 mt-2">시스템의 모든 사용자를 관리하세요</p>
        </div>
        <Button asChild>
          <Link href="/admin/users/new">새 사용자 추가</Link>
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-white/80 backdrop-blur border-0 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">총 사용자</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800">{users?.length || 0}</div>
            <p className="text-xs text-slate-500 mt-1">등록된 사용자</p>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur border-0 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">관리자</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {users?.filter((u) => u.role === "admin").length || 0}
            </div>
            <p className="text-xs text-slate-500 mt-1">관리자 권한</p>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur border-0 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">일반 사용자</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {users?.filter((u) => u.role === "user").length || 0}
            </div>
            <p className="text-xs text-slate-500 mt-1">일반 사용자</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white/80 backdrop-blur border-0 shadow-lg">
        <CardHeader>
          <CardTitle>사용자 목록</CardTitle>
          <CardDescription>시스템에 등록된 모든 사용자</CardDescription>
        </CardHeader>
        <CardContent>
          {users && users.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>사용자</TableHead>
                  <TableHead>이메일</TableHead>
                  <TableHead>권한</TableHead>
                  <TableHead>충전소</TableHead>
                  <TableHead>가입일</TableHead>
                  <TableHead>작업</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{user.name || "이름 없음"}</p>
                        <p className="text-sm text-slate-500">ID: {user.id.slice(0, 8)}...</p>
                      </div>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{user.charge_stations?.[0]?.count || 0}개</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-slate-500">
                      {new Date(user.created_at).toLocaleDateString("ko-KR")}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/admin/users/${user.id}`}>상세</Link>
                        </Button>
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/admin/users/${user.id}/edit`}>편집</Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <p className="text-slate-500">등록된 사용자가 없습니다</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
