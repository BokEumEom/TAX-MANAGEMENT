import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Link from "next/link"
import { sendTaxReminder, sendOverdueReminders } from "@/lib/actions/email-actions"

export default async function RemindersPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch user's reminders with related tax and station info
  const { data: reminders } = await supabase
    .from("reminders")
    .select(`
      *,
      taxes(
        amount,
        due_date,
        tax_types(name),
        charge_stations(name)
      )
    `)
    .eq("user_id", user.id)
    .order("reminder_date", { ascending: true })

  const getStatusBadge = (status: string, reminderDate: string) => {
    const now = new Date()
    const reminder = new Date(reminderDate)

    switch (status) {
      case "sent":
        return <Badge className="bg-blue-100 text-blue-800">전송됨</Badge>
      case "dismissed":
        return <Badge variant="secondary">해제됨</Badge>
      case "active":
        if (reminder <= now) {
          return <Badge className="bg-red-100 text-red-800">알림 시간</Badge>
        } else {
          return <Badge className="bg-green-100 text-green-800">대기중</Badge>
        }
      default:
        return <Badge variant="outline">알 수 없음</Badge>
    }
  }

  const getPriorityBadge = (reminderDate: string, dueDate?: string) => {
    if (!dueDate) return null

    const reminder = new Date(reminderDate)
    const due = new Date(dueDate)
    const daysDiff = Math.ceil((due.getTime() - reminder.getTime()) / (1000 * 60 * 60 * 24))

    if (daysDiff <= 1) {
      return (
        <Badge variant="destructive" className="text-xs">
          긴급
        </Badge>
      )
    } else if (daysDiff <= 7) {
      return <Badge className="bg-yellow-100 text-yellow-800 text-xs">중요</Badge>
    } else {
      return (
        <Badge variant="outline" className="text-xs">
          일반
        </Badge>
      )
    }
  }

  // Statistics
  const totalReminders = reminders?.length || 0
  const activeReminders = reminders?.filter((r) => r.status === "active").length || 0
  const overdueReminders =
    reminders?.filter((r) => r.status === "active" && new Date(r.reminder_date) <= new Date()).length || 0

  return (
    <div className="min-h-screen bg-gray-900 px-6 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">알림 관리</h1>
          <p className="text-gray-400 mt-2">세금 납부 알림을 설정하고 관리하세요</p>
        </div>
        <div className="flex gap-3">
          <form action={sendOverdueReminders}>
            <Button
              type="submit"
              variant="outline"
              className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white bg-transparent"
            >
              연체 알림 전송
            </Button>
          </form>
          <Button asChild className="bg-yellow-500 hover:bg-yellow-600 text-black">
            <Link href="/dashboard/reminders/auto-create">자동 알림 생성</Link>
          </Button>
          <Button asChild className="bg-yellow-500 hover:bg-yellow-600 text-black">
            <Link href="/dashboard/reminders/new">새 알림 생성</Link>
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-gray-800/50 backdrop-blur border-gray-700 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-400">총 알림</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{totalReminders}</div>
            <p className="text-xs text-gray-500 mt-1">등록된 알림</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 backdrop-blur border-gray-700 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-400">활성 알림</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">{activeReminders}</div>
            <p className="text-xs text-gray-500 mt-1">대기 중인 알림</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 backdrop-blur border-gray-700 shadow-lg">
          <CardHeader>
            <CardTitle className="text-white">알림 대상</CardTitle>
            <CardDescription className="text-gray-400">즉시 알림 필요</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-400">{overdueReminders}</div>
            <p className="text-xs text-gray-500 mt-1">알림 대상</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gray-800/50 backdrop-blur border-gray-700 shadow-lg">
        <CardHeader>
          <CardTitle className="text-white">알림 목록</CardTitle>
          <CardDescription className="text-gray-400">설정된 모든 알림을 확인하고 관리하세요</CardDescription>
        </CardHeader>
        <CardContent>
          {reminders && reminders.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow className="border-gray-700">
                  <TableHead className="text-gray-300">제목</TableHead>
                  <TableHead className="text-gray-300">관련 세금</TableHead>
                  <TableHead className="text-gray-300">알림 일시</TableHead>
                  <TableHead className="text-gray-300">우선순위</TableHead>
                  <TableHead className="text-gray-300">상태</TableHead>
                  <TableHead className="text-gray-300">작업</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reminders.map((reminder) => (
                  <TableRow key={reminder.id} className="border-gray-700 hover:bg-gray-700/50">
                    <TableCell>
                      <div>
                        <div className="font-medium text-white">{reminder.title}</div>
                        {reminder.message && (
                          <div className="text-sm text-gray-400 truncate max-w-xs">{reminder.message}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {reminder.taxes ? (
                        <div>
                          <div className="font-medium text-white">{reminder.taxes.tax_types?.name}</div>
                          <div className="text-sm text-gray-400">{reminder.taxes.charge_stations?.name}</div>
                        </div>
                      ) : (
                        <span className="text-gray-400">일반 알림</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium text-white">
                          {new Date(reminder.reminder_date).toLocaleDateString("ko-KR")}
                        </div>
                        <div className="text-sm text-gray-400">
                          {new Date(reminder.reminder_date).toLocaleTimeString("ko-KR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getPriorityBadge(reminder.reminder_date, reminder.taxes?.due_date)}</TableCell>
                    <TableCell>{getStatusBadge(reminder.status, reminder.reminder_date)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          asChild
                          variant="outline"
                          size="sm"
                          className="border-gray-600 text-gray-300 hover:bg-gray-700 bg-transparent"
                        >
                          <Link href={`/dashboard/reminders/${reminder.id}`}>상세</Link>
                        </Button>
                        {reminder.tax_id && reminder.status === "active" && (
                          <form action={sendTaxReminder.bind(null, reminder.tax_id)}>
                            <Button
                              type="submit"
                              variant="outline"
                              size="sm"
                              className="bg-yellow-500 hover:bg-yellow-600 text-black border-yellow-500"
                            >
                              이메일 전송
                            </Button>
                          </form>
                        )}
                        {reminder.status === "active" && (
                          <Button
                            asChild
                            variant="outline"
                            size="sm"
                            className="border-gray-600 text-gray-300 hover:bg-gray-700 bg-transparent"
                          >
                            <Link href={`/dashboard/reminders/${reminder.id}/edit`}>편집</Link>
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
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-5 5v-5zM4.5 12H12m0 0l-3-3m3 3l-3 3"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-white mb-2">설정된 알림이 없습니다</h3>
              <p className="text-gray-400 mb-6">첫 번째 알림을 생성하여 세금 납부를 놓치지 마세요</p>
              <div className="flex gap-3 justify-center">
                <Button asChild className="bg-yellow-500 hover:bg-yellow-600 text-black">
                  <Link href="/dashboard/reminders/new">수동 알림 생성</Link>
                </Button>
                <Button asChild className="bg-yellow-500 hover:bg-yellow-600 text-black">
                  <Link href="/dashboard/reminders/auto-create">자동 알림 생성</Link>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
