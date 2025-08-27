import { redirect, notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import {
  updateReminder,
  deleteReminder,
  getReminderForEdit,
  getAvailableTaxes,
  getCurrentUser,
} from "@/lib/actions/reminder-actions"

interface Props {
  params: Promise<{ id: string }>
}

export default async function ReminderEditPage({ params }: Props) {
  const { id } = await params

  const user = await getCurrentUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch reminder details
  const reminder = await getReminderForEdit(id, user.id)

  if (!reminder) {
    notFound()
  }

  // Fetch available taxes for selection
  const taxes = await getAvailableTaxes()

  const handleUpdate = updateReminder.bind(null, id)
  const handleDelete = deleteReminder.bind(null, id)

  return (
    <div className="min-h-screen bg-gray-900 px-6 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">알림 편집</h1>
            <p className="text-gray-400 mt-2">알림 정보를 수정하세요</p>
          </div>
          <Button asChild variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700 bg-transparent">
            <Link href="/dashboard/reminders">목록으로</Link>
          </Button>
        </div>

        <Card className="bg-gray-800/50 backdrop-blur border-gray-700 shadow-lg">
          <CardHeader>
            <CardTitle className="text-white">알림 정보 수정</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={handleUpdate} className="space-y-6">
              <div>
                <Label htmlFor="title" className="text-gray-300">
                  제목 *
                </Label>
                <Input
                  id="title"
                  name="title"
                  defaultValue={reminder.title}
                  required
                  className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
                  placeholder="알림 제목을 입력하세요"
                />
              </div>

              <div>
                <Label htmlFor="message" className="text-gray-300">
                  메시지
                </Label>
                <Textarea
                  id="message"
                  name="message"
                  defaultValue={reminder.message || ""}
                  rows={4}
                  className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
                  placeholder="알림 메시지를 입력하세요"
                />
              </div>

              <div>
                <Label htmlFor="reminder_date" className="text-gray-300">
                  알림 일시 *
                </Label>
                <Input
                  id="reminder_date"
                  name="reminder_date"
                  type="datetime-local"
                  defaultValue={new Date(reminder.reminder_date).toISOString().slice(0, 16)}
                  required
                  className="bg-gray-700/50 border-gray-600 text-white focus:border-blue-500"
                />
              </div>

              <div>
                <Label htmlFor="tax_id" className="text-gray-300">
                  관련 세금
                </Label>
                <Select name="tax_id" defaultValue={reminder.tax_id || "none"}>
                  <SelectTrigger className="bg-gray-700/50 border-gray-600 text-white focus:border-blue-500">
                    <SelectValue placeholder="세금을 선택하세요" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    <SelectItem value="none" className="text-white hover:bg-gray-700">
                      일반 알림 (세금 연결 없음)
                    </SelectItem>
                    {taxes?.map((tax) => (
                      <SelectItem key={tax.id} value={tax.id} className="text-white hover:bg-gray-700">
                        {tax.tax_types?.name} - {tax.charge_stations?.name} ({tax.amount.toLocaleString()}원)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-3 pt-6">
                <Button type="submit" className="bg-yellow-500 hover:bg-yellow-600 text-black">
                  변경사항 저장
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-gray-700 bg-transparent"
                >
                  <Link href="/dashboard/reminders">취소</Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="bg-red-900/20 backdrop-blur border-red-800 shadow-lg mt-8">
          <CardHeader>
            <CardTitle className="text-red-400">위험 구역</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300 mb-4">
              알림을 삭제하면 모든 관련 데이터가 영구적으로 삭제됩니다. 이 작업은 되돌릴 수 없습니다.
            </p>
            <form action={handleDelete}>
              <Button type="submit" variant="destructive" className="bg-red-600 hover:bg-red-700 text-white">
                알림 삭제
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
