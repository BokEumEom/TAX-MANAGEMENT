import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface Props {
  params: Promise<{ id: string }>
}

export default async function ReminderDetailPage({ params }: Props) {
  const { id } = await params

  if (id === "new") {
    redirect("/dashboard/reminders/new")
  }

  if (id === "auto-create") {
    redirect("/dashboard/reminders/auto-create")
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch reminder details
  const { data: reminder } = await supabase
    .from("reminders")
    .select(`
      *,
      taxes(
        id,
        amount,
        due_date,
        status,
        tax_types(name, rate),
        charge_stations(name, location)
      )
    `)
    .eq("id", id)
    .eq("user_id", user.id)
    .single()

  if (!reminder) {
    notFound()
  }

  const getStatusBadge = (status: string, reminderDate: string) => {
    const now = new Date()
    const reminder = new Date(reminderDate)

    switch (status) {
      case "sent":
        return <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">전송됨</Badge>
      case "dismissed":
        return <Badge className="bg-gray-500/20 text-gray-300 border-gray-500/30">해제됨</Badge>
      case "active":
        if (reminder <= now) {
          return <Badge className="bg-red-500/20 text-red-300 border-red-500/30">알림 시간</Badge>
        } else {
          return <Badge className="bg-green-500/20 text-green-300 border-green-500/30">대기중</Badge>
        }
      default:
        return <Badge className="bg-gray-500/20 text-gray-300 border-gray-500/30">알 수 없음</Badge>
    }
  }

  const handleDismiss = async () => {
    "use server"
    const supabase = await createClient()
    await supabase.from("reminders").update({ status: "dismissed" }).eq("id", id)
    redirect("/dashboard/reminders")
  }

  const handleMarkAsSent = async () => {
    "use server"
    const supabase = await createClient()
    await supabase.from("reminders").update({ status: "sent" }).eq("id", id)
    redirect("/dashboard/reminders")
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white">{reminder.title}</h1>
              <p className="text-gray-400 mt-2">알림 상세 정보</p>
            </div>
            <div className="flex gap-3">
              {reminder.status === "active" && (
                <>
                  <form action={handleMarkAsSent}>
                    <Button
                      type="submit"
                      variant="outline"
                      className="bg-gray-800/50 border-gray-700 text-gray-300 hover:bg-gray-700"
                    >
                      전송됨으로 표시
                    </Button>
                  </form>
                  <form action={handleDismiss}>
                    <Button
                      type="submit"
                      variant="outline"
                      className="bg-gray-800/50 border-gray-700 text-gray-300 hover:bg-gray-700"
                    >
                      알림 해제
                    </Button>
                  </form>
                  <Button asChild className="bg-blue-600 hover:bg-blue-700">
                    <Link href={`/dashboard/reminders/${reminder.id}/edit`}>편집</Link>
                  </Button>
                </>
              )}
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Reminder Information */}
            <div className="lg:col-span-2">
              <Card className="bg-gray-800/50 backdrop-blur border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-white">
                    알림 정보
                    {getStatusBadge(reminder.status, reminder.reminder_date)}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h4 className="font-medium text-white mb-2">제목</h4>
                    <p className="text-gray-300">{reminder.title}</p>
                  </div>

                  {reminder.message && (
                    <div>
                      <h4 className="font-medium text-white mb-2">메시지</h4>
                      <div className="p-4 bg-gray-700/50 rounded-lg">
                        <p className="text-gray-300 whitespace-pre-wrap">{reminder.message}</p>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-white mb-2">알림 일시</h4>
                      <p className="text-gray-300">
                        {new Date(reminder.reminder_date).toLocaleDateString("ko-KR", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          weekday: "long",
                        })}
                      </p>
                      <p className="text-gray-400 text-sm">
                        {new Date(reminder.reminder_date).toLocaleTimeString("ko-KR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>

                    <div>
                      <h4 className="font-medium text-white mb-2">생성일</h4>
                      <p className="text-gray-300">{new Date(reminder.created_at).toLocaleDateString("ko-KR")}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Related Tax Information */}
            <div className="lg:col-span-1">
              {reminder.taxes ? (
                <Card className="bg-gray-800/50 backdrop-blur border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">관련 세금 정보</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-medium text-white mb-1">세금 유형</h4>
                      <p className="text-gray-300">{reminder.taxes.tax_types?.name}</p>
                    </div>

                    <div>
                      <h4 className="font-medium text-white mb-1">충전소</h4>
                      <p className="text-gray-300">{reminder.taxes.charge_stations?.name}</p>
                      <p className="text-sm text-gray-400">{reminder.taxes.charge_stations?.location}</p>
                    </div>

                    <div>
                      <h4 className="font-medium text-white mb-1">납부 금액</h4>
                      <p className="text-lg font-semibold text-white">
                        {reminder.taxes.amount.toLocaleString("ko-KR")}원
                      </p>
                    </div>

                    <div>
                      <h4 className="font-medium text-white mb-1">납부 기한</h4>
                      <p className="text-gray-300">{new Date(reminder.taxes.due_date).toLocaleDateString("ko-KR")}</p>
                      <p className="text-sm text-gray-400">
                        {Math.ceil(
                          (new Date(reminder.taxes.due_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
                        )}
                        일 남음
                      </p>
                    </div>

                    <div className="pt-4">
                      <Button asChild className="w-full bg-yellow-500 hover:bg-yellow-600 text-black" size="sm">
                        <Link href={`/dashboard/taxes/${reminder.taxes.id}`}>세금 상세 보기</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="bg-gray-800/50 backdrop-blur border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">일반 알림</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-300">이 알림은 특정 세금과 연결되지 않은 일반 알림입니다.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
