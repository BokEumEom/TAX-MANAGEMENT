import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Suspense } from "react"

interface TaxEvent {
  id: string
  tax_type: {
    name: string
  }
  amount: number
  due_date: string
  status: string
  charge_station: {
    name: string
  }
}

interface CalendarPageProps {
  searchParams: { year?: string; month?: string }
}

const koreanHolidays2025 = [
  "2025-01-01", // 신정
  "2025-01-28", // 설날 연휴
  "2025-01-29", // 설날
  "2025-01-30", // 설날 연휴
  "2025-03-01", // 삼일절
  "2025-05-05", // 어린이날
  "2025-05-06", // 어린이날 대체공휴일
  "2025-06-06", // 현충일
  "2025-08-15", // 광복절
  "2025-09-06", // 추석 연휴
  "2025-09-07", // 추석 연휴
  "2025-09-08", // 추석
  "2025-09-09", // 추석 연휴
  "2025-10-03", // 개천절
  "2025-10-09", // 한글날
  "2025-12-25", // 크리스마스
]

function isWeekendOrHoliday(year: number, month: number, day: number): boolean {
  const date = new Date(year, month, day)
  const dayOfWeek = date.getDay()
  const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`

  // Check if it's weekend (Sunday = 0, Saturday = 6)
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6

  // Check if it's Korean holiday
  const isHoliday = koreanHolidays2025.includes(dateStr)

  return isWeekend || isHoliday
}

async function CalendarContent({ year, month }: { year: number; month: number }) {
  const supabase = await createClient()

  const { data: taxes, error } = await supabase
    .from("taxes")
    .select(`
      id,
      amount,
      due_date,
      status,
      charge_stations (
        name
      ),
      tax_types (
        name
      )
    `)
    .gte("due_date", `${year}-${String(month + 1).padStart(2, "0")}-01`)
    .lt("due_date", `${year}-${String(month + 2).padStart(2, "0")}-01`)
    .order("due_date", { ascending: true })

  if (error) {
    console.error("Error fetching taxes:", error)
    return <div className="text-red-400">데이터를 불러오는 중 오류가 발생했습니다.</div>
  }

  const taxEvents: TaxEvent[] =
    taxes?.map((tax) => ({
      ...tax,
      tax_type: tax.tax_types || { name: "기타" },
      charge_station: tax.charge_stations as any,
    })) || []

  const today = new Date()
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month
  const todayDate = today.getDate()

  const firstDayOfMonth = new Date(year, month, 1)
  const lastDayOfMonth = new Date(year, month + 1, 0)
  const firstDayWeekday = firstDayOfMonth.getDay()
  const daysInMonth = lastDayOfMonth.getDate()

  const monthNames = ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"]
  const weekDays = ["일", "월", "화", "수", "목", "금", "토"]

  const calendarDays = []

  for (let i = 0; i < firstDayWeekday; i++) {
    calendarDays.push(null)
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    const dayEvents = taxEvents.filter((event) => event.due_date === dateStr)
    calendarDays.push({ day, events: dayEvents })
  }

  const prevMonth = month === 0 ? 11 : month - 1
  const prevYear = month === 0 ? year - 1 : year
  const nextMonth = month === 11 ? 0 : month + 1
  const nextYear = month === 11 ? year + 1 : year

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">세무 일정 캘린더</h1>
            <p className="text-gray-400">납부 일정을 한눈에 확인하세요</p>
          </div>
          <div className="flex gap-3">
            <Button asChild className="bg-yellow-500 hover:bg-yellow-600 text-black">
              <Link href="/dashboard/taxes/new">세금 등록</Link>
            </Button>
          </div>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-white">
              {year}년 {monthNames[month]}
            </h2>
            <div className="flex gap-2">
              <Button
                asChild
                variant="outline"
                size="sm"
                className="bg-yellow-500 hover:bg-yellow-600 text-black border-yellow-500"
              >
                <Link href={`/dashboard/calendar?year=${prevYear}&month=${prevMonth + 1}`}>이전</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="sm"
                className="bg-yellow-500 hover:bg-yellow-600 text-black border-yellow-500"
              >
                <Link href={`/dashboard/calendar?year=${nextYear}&month=${nextMonth + 1}`}>다음</Link>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map((day, index) => (
              <div
                key={day}
                className={`p-3 text-center text-sm font-medium ${
                  index === 0 || index === 6 ? "text-red-400" : "text-gray-400"
                }`}
              >
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((dayData, index) => (
              <div
                key={index}
                className={`min-h-[120px] p-2 border border-gray-700 rounded-lg ${
                  dayData ? "bg-gray-800/30 hover:bg-gray-700/30" : "bg-gray-900/20"
                } transition-colors ${
                  dayData && isCurrentMonth && dayData.day === todayDate ? "border-yellow-400 border-4" : ""
                }`}
              >
                {dayData && (
                  <>
                    <div
                      className={`text-sm mb-2 ${
                        isCurrentMonth && dayData.day === todayDate
                          ? "text-white font-bold"
                          : isWeekendOrHoliday(year, month, dayData.day)
                            ? "text-red-400 font-medium"
                            : "text-white font-medium"
                      }`}
                    >
                      {dayData.day}
                    </div>
                    <div className="space-y-1">
                      {dayData.events.slice(0, 3).map((event) => (
                        <div
                          key={event.id}
                          className={`text-xs p-1 rounded text-white truncate ${
                            event.status === "paid"
                              ? "bg-green-600/80"
                              : event.status === "overdue"
                                ? "bg-red-600/80"
                                : "bg-orange-600/80"
                          }`}
                          title={`${event.charge_station.name} - ${event.tax_type.name}: ${event.amount.toLocaleString()}원`}
                        >
                          {event.tax_type.name}
                        </div>
                      ))}
                      {dayData.events.length > 3 && (
                        <div className="text-xs text-gray-400 text-center">+{dayData.events.length - 3}개 더</div>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
          <h3 className="text-xl font-semibold text-white mb-4">이번 달 납부 일정</h3>
          {taxEvents.length === 0 ? (
            <p className="text-gray-400 text-center py-8">이번 달에 예정된 납부 일정이 없습니다.</p>
          ) : (
            <div className="space-y-3">
              {taxEvents.slice(0, 10).map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-700"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        event.status === "paid"
                          ? "bg-green-500"
                          : event.status === "overdue"
                            ? "bg-red-500"
                            : "bg-orange-500"
                      }`}
                    />
                    <div>
                      <div className="font-medium text-white">{event.tax_type.name}</div>
                      <div className="text-sm text-gray-400">{event.charge_station.name}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-white">{event.amount.toLocaleString()}원</div>
                    <div className="text-sm text-gray-400">{event.due_date}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-600 rounded"></div>
            <span className="text-gray-300">납부 완료</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-orange-600 rounded"></div>
            <span className="text-gray-300">납부 예정</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-600 rounded"></div>
            <span className="text-gray-300">연체</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="animate-pulse">
          <div className="bg-gray-800/50 rounded-xl p-6">
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: 35 }).map((_, i) => (
                <div key={i} className="h-[120px] bg-gray-700 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default async function CalendarPage({ searchParams }: CalendarPageProps) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const now = new Date()
  const year = searchParams.year ? Number.parseInt(searchParams.year) : now.getFullYear()
  const month = searchParams.month ? Number.parseInt(searchParams.month) - 1 : now.getMonth()

  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <CalendarContent year={year} month={month} />
    </Suspense>
  )
}
