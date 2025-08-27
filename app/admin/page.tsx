import { requireAdmin } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default async function AdminDashboardPage() {
  await requireAdmin()
  const supabase = await createClient()

  // Fetch system statistics
  const [
    { count: totalUsers },
    { count: totalStations },
    { count: totalTaxes },
    { count: pendingTaxes },
    { count: overdueTaxes },
    { count: activeReminders },
  ] = await Promise.all([
    supabase.from("users").select("*", { count: "exact", head: true }),
    supabase.from("charge_stations").select("*", { count: "exact", head: true }),
    supabase.from("taxes").select("*", { count: "exact", head: true }),
    supabase.from("taxes").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase
      .from("taxes")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending")
      .lt("due_date", new Date().toISOString().split("T")[0]),
    supabase.from("reminders").select("*", { count: "exact", head: true }).eq("status", "active"),
  ])

  // Fetch recent activities (audit logs)
  const { data: recentLogs } = await supabase
    .from("audit_logs")
    .select(`
      *,
      users(name, email)
    `)
    .order("created_at", { ascending: false })
    .limit(10)

  // Fetch recent users
  const { data: recentUsers } = await supabase
    .from("users")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5)

  // Calculate total pending amount
  const { data: pendingTaxData } = await supabase.from("taxes").select("amount").eq("status", "pending")

  const totalPendingAmount = pendingTaxData?.reduce((sum, tax) => sum + Number(tax.amount), 0) || 0

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">관리자 대시보드</h1>
        <p className="text-muted-foreground mt-2">시스템 전체 현황을 확인하고 관리하세요</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">총 사용자</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{totalUsers || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">등록된 사용자</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">총 충전소</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{totalStations || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">등록된 충전소</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">미납 세금</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{pendingTaxes || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">처리 대기 중</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">활성 알림</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-chart-2">{activeReminders || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">설정된 알림</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground">세무 현황</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">총 세금 항목</span>
              <span className="font-semibold text-foreground">{totalTaxes || 0}개</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">미납 항목</span>
              <span className="font-semibold text-destructive">{pendingTaxes || 0}개</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">연체 항목</span>
              <span className="font-semibold text-destructive">{overdueTaxes || 0}개</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">미납 총액</span>
              <span className="font-semibold text-destructive">{totalPendingAmount.toLocaleString("ko-KR")}원</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground">최근 가입 사용자</CardTitle>
          </CardHeader>
          <CardContent>
            {recentUsers && recentUsers.length > 0 ? (
              <div className="space-y-3">
                {recentUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">{user.name || user.email}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant={user.role === "admin" ? "destructive" : "secondary"}>{user.role}</Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(user.created_at).toLocaleDateString("ko-KR")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">최근 가입한 사용자가 없습니다</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground">최근 활동</CardTitle>
          <CardDescription className="text-muted-foreground">시스템에서 발생한 최근 활동 내역</CardDescription>
        </CardHeader>
        <CardContent>
          {recentLogs && recentLogs.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow className="border-border">
                  <TableHead className="text-muted-foreground">사용자</TableHead>
                  <TableHead className="text-muted-foreground">작업</TableHead>
                  <TableHead className="text-muted-foreground">테이블</TableHead>
                  <TableHead className="text-muted-foreground">시간</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentLogs.map((log) => (
                  <TableRow key={log.id} className="border-border">
                    <TableCell>
                      <div>
                        <p className="font-medium text-foreground">{log.users?.name || "시스템"}</p>
                        <p className="text-sm text-muted-foreground">{log.users?.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{log.action}</Badge>
                    </TableCell>
                    <TableCell className="text-foreground">{log.table_name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(log.created_at).toLocaleString("ko-KR")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">최근 활동이 없습니다</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
