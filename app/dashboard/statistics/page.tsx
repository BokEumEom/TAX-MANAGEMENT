"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { ProgressLoader } from "@/components/ui/progress-loader"
import { CalendarIcon } from "lucide-react"

export default function StatisticsPage() {
  const [loading, setLoading] = useState(true)
  const [taxes, setTaxes] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)
  const [dateFilter, setDateFilter] = useState({
    startDate: new Date(new Date().getFullYear(), 0, 1).toISOString().split("T")[0], // 올해 1월 1일
    endDate: new Date().toISOString().split("T")[0], // 오늘
  })
  const [filteredTaxes, setFilteredTaxes] = useState<any[]>([])

  useEffect(() => {
    async function fetchData() {
      try {
        const supabase = createClient()

        const { data, error } = await supabase.from("taxes").select(`
          *,
          charge_stations(name),
          tax_types(name)
        `)

        if (error) {
          setError("데이터를 불러오는 중 오류가 발생했습니다.")
          console.error("Error fetching taxes:", error)
        } else {
          setTaxes(data || [])
        }
      } catch (err) {
        setError("데이터를 불러오는 중 오류가 발생했습니다.")
        console.error("Error:", err)
      } finally {
        setTimeout(() => setLoading(false), 1500)
      }
    }

    fetchData()
  }, [])

  useEffect(() => {
    if (taxes.length > 0) {
      const filtered = taxes.filter((tax) => {
        const taxDate = new Date(tax.due_date)
        const startDate = new Date(dateFilter.startDate)
        const endDate = new Date(dateFilter.endDate)
        return taxDate >= startDate && taxDate <= endDate
      })
      setFilteredTaxes(filtered)
    }
  }, [taxes, dateFilter])

  const setDatePreset = (preset: string) => {
    const today = new Date()
    let startDate = new Date()

    switch (preset) {
      case "thisMonth":
        startDate = new Date(today.getFullYear(), today.getMonth(), 1)
        break
      case "lastMonth":
        startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1)
        setDateFilter({
          startDate: startDate.toISOString().split("T")[0],
          endDate: new Date(today.getFullYear(), today.getMonth(), 0).toISOString().split("T")[0],
        })
        return
      case "thisYear":
        startDate = new Date(today.getFullYear(), 0, 1)
        break
      case "lastYear":
        startDate = new Date(today.getFullYear() - 1, 0, 1)
        setDateFilter({
          startDate: startDate.toISOString().split("T")[0],
          endDate: new Date(today.getFullYear() - 1, 11, 31).toISOString().split("T")[0],
        })
        return
      case "last3Months":
        startDate = new Date(today.getFullYear(), today.getMonth() - 3, 1)
        break
      case "last6Months":
        startDate = new Date(today.getFullYear(), today.getMonth() - 6, 1)
        break
    }

    setDateFilter({
      startDate: startDate.toISOString().split("T")[0],
      endDate: today.toISOString().split("T")[0],
    })
  }

  if (loading) {
    return <ProgressLoader message="통계 데이터를 분석하는 중..." duration={1500} />
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-red-500 text-center">
          <p className="text-xl mb-2">⚠️ 오류 발생</p>
          <p>{error}</p>
        </div>
      </div>
    )
  }

  const totalTaxes = filteredTaxes?.length || 0
  const paidTaxes = filteredTaxes?.filter((tax) => tax.status === "paid").length || 0
  const overdueTaxes = filteredTaxes?.filter((tax) => tax.status === "overdue").length || 0
  const pendingTaxes = filteredTaxes?.filter((tax) => tax.status === "pending").length || 0
  const paymentRate = totalTaxes > 0 ? ((paidTaxes / totalTaxes) * 100).toFixed(1) : "0"
  const totalAmount = filteredTaxes?.reduce((sum, tax) => sum + (tax.amount || 0), 0) || 0

  const monthlyStats = Array.from({ length: 6 }, (_, i) => {
    const month = new Date()
    month.setMonth(month.getMonth() - (5 - i))
    const monthName = `${month.getMonth() + 1}월`

    const monthTaxes =
      filteredTaxes?.filter((tax) => {
        const taxDate = new Date(tax.due_date)
        return taxDate.getMonth() === month.getMonth() && taxDate.getFullYear() === month.getFullYear()
      }) || []

    return {
      month: monthName,
      납부완료: monthTaxes.filter((tax) => tax.status === "paid").length,
      미납: monthTaxes.filter((tax) => tax.status === "pending").length,
      연체: monthTaxes.filter((tax) => tax.status === "overdue").length,
    }
  })

  const taxTypeStats =
    filteredTaxes?.reduce(
      (acc, tax) => {
        const typeName = tax.tax_types?.name || "기타"
        acc[typeName] = (acc[typeName] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    ) || {}

  const taxTypeData = Object.entries(taxTypeStats).map(([name, value], index) => ({
    name,
    value,
    color: ["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6"][index % 5],
  }))

  const stationStats =
    filteredTaxes?.reduce(
      (acc, tax) => {
        const stationName = tax.charge_stations?.name || "알 수 없음"
        if (!acc[stationName]) {
          acc[stationName] = { total: 0, paid: 0, totalAmount: 0 }
        }
        acc[stationName].total += 1
        acc[stationName].totalAmount += tax.amount || 0
        if (tax.status === "paid") {
          acc[stationName].paid += 1
        }
        return acc
      },
      {} as Record<string, { total: number; paid: number; totalAmount: number }>,
    ) || {}

  const stationPerformance = Object.entries(stationStats)
    .map(([station, stats]) => ({
      station,
      납부율: stats.total > 0 ? Math.round((stats.paid / stats.total) * 100) : 0,
      총세금: stats.totalAmount,
    }))
    .sort((a, b) => b.납부율 - a.납부율)

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">세무 통계</h1>
          <p className="text-gray-400">세무 관리 현황을 한눈에 확인하세요</p>
        </div>

        {/* Date Filter Section */}
        <Card className="bg-gray-800/50 border-gray-700 mb-8">
          <CardHeader className="pb-4">
            <CardTitle className="text-white flex items-center gap-2">
              <CalendarIcon className="w-5 h-5" />
              날짜 필터
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">시작 날짜</label>
                <input
                  type="date"
                  value={dateFilter.startDate}
                  onChange={(e) => setDateFilter((prev) => ({ ...prev, startDate: e.target.value }))}
                  className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">종료 날짜</label>
                <input
                  type="date"
                  value={dateFilter.endDate}
                  onChange={(e) => setDateFilter((prev) => ({ ...prev, endDate: e.target.value }))}
                  className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-300">빠른 선택</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDatePreset("thisMonth")}
                  className="bg-gray-700/30 border-gray-600 text-gray-200 hover:bg-gray-600/50 hover:text-white transition-all"
                >
                  이번 달
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDatePreset("lastMonth")}
                  className="bg-gray-700/30 border-gray-600 text-gray-200 hover:bg-gray-600/50 hover:text-white transition-all"
                >
                  지난 달
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDatePreset("last3Months")}
                  className="bg-gray-700/30 border-gray-600 text-gray-200 hover:bg-gray-600/50 hover:text-white transition-all"
                >
                  최근 3개월
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDatePreset("last6Months")}
                  className="bg-gray-700/30 border-gray-600 text-gray-200 hover:bg-gray-600/50 hover:text-white transition-all"
                >
                  최근 6개월
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDatePreset("thisYear")}
                  className="bg-gray-700/30 border-gray-600 text-gray-200 hover:bg-gray-600/50 hover:text-white transition-all"
                >
                  올해
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDatePreset("lastYear")}
                  className="bg-gray-700/30 border-gray-600 text-gray-200 hover:bg-gray-600/50 hover:text-white transition-all"
                >
                  작년
                </Button>
              </div>
            </div>

            <div className="bg-gray-700/20 rounded-lg p-3 border border-gray-600/50">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-300">
                  선택된 기간:{" "}
                  <span className="text-white font-medium">
                    {new Date(dateFilter.startDate).toLocaleDateString("ko-KR")} ~{" "}
                    {new Date(dateFilter.endDate).toLocaleDateString("ko-KR")}
                  </span>
                </span>
                <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded-md font-medium">
                  {totalTaxes}건의 데이터
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">총 세금 건수</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{totalTaxes.toLocaleString()}</div>
              <p className="text-xs text-gray-400 mt-1">전체 등록된 세금</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">납부 완료율</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{paymentRate}%</div>
              <p className="text-xs text-green-400 mt-1">{paidTaxes}건 납부 완료</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">총 납부 금액</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">₩{(totalAmount / 1000000).toFixed(1)}M</div>
              <p className="text-xs text-gray-400 mt-1">총 세금 금액</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">연체 건수</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{overdueTaxes}</div>
              <p className="text-xs text-red-400 mt-1">즉시 처리 필요</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Monthly Trends */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">월별 납부 현황</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyStats}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1f2937",
                      border: "1px solid #374151",
                      borderRadius: "8px",
                      color: "#fff",
                    }}
                  />
                  <Bar dataKey="납부완료" fill="#10b981" />
                  <Bar dataKey="미납" fill="#f59e0b" />
                  <Bar dataKey="연체" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Tax Type Distribution */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">세금 유형별 분포</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={taxTypeData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {taxTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1f2937",
                      border: "1px solid #374151",
                      borderRadius: "8px",
                      color: "#fff",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Station Performance */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">충전소별 성과</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">충전소</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">납부율</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">총 세금</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">성과</th>
                  </tr>
                </thead>
                <tbody>
                  {stationPerformance.map((station, index) => (
                    <tr key={index} className="border-b border-gray-700/50">
                      <td className="py-3 px-4 text-white font-medium">{station.station}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-gray-700 rounded-full h-2">
                            <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${station.납부율}%` }} />
                          </div>
                          <span className="text-white text-sm">{station.납부율}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-white">₩{(station.총세금 / 1000000).toFixed(1)}M</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            station.납부율 >= 90
                              ? "bg-green-900/50 text-green-400"
                              : station.납부율 >= 85
                                ? "bg-yellow-900/50 text-yellow-400"
                                : "bg-red-900/50 text-red-400"
                          }`}
                        >
                          {station.납부율 >= 90 ? "우수" : station.납부율 >= 85 ? "보통" : "개선필요"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
