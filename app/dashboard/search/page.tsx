import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface SearchResult {
  type: "tax" | "station"
  id: string
  title: string
  subtitle: string
  status?: string
  amount?: number
  date?: string
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string }
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const query = searchParams.q?.trim()
  const results: SearchResult[] = []

  if (query && query.length > 0) {
    console.log("[v0] Searching for:", query)

    // Search taxes by tax type name
    const { data: taxesByType, error: taxTypeError } = await supabase
      .from("taxes")
      .select(`
        id,
        amount,
        due_date,
        status,
        paid_date,
        tax_types (name),
        charge_stations (name)
      `)
      .ilike("tax_types.name", `%${query}%`)

    // Search taxes by charge station name
    const { data: taxesByStation, error: taxStationError } = await supabase
      .from("taxes")
      .select(`
        id,
        amount,
        due_date,
        status,
        paid_date,
        tax_types (name),
        charge_stations (name)
      `)
      .ilike("charge_stations.name", `%${query}%`)

    // Search taxes by amount (convert to text for search)
    const { data: taxesByAmount, error: taxAmountError } = await supabase
      .from("taxes")
      .select(`
        id,
        amount,
        due_date,
        status,
        paid_date,
        tax_types (name),
        charge_stations (name)
      `)
      .textSearch("amount", query)

    // Combine all tax results and remove duplicates
    const allTaxes = [...(taxesByType || []), ...(taxesByStation || []), ...(taxesByAmount || [])]

    // Remove duplicates by id
    const uniqueTaxes = allTaxes.filter((tax, index, self) => index === self.findIndex((t) => t.id === tax.id))

    if (taxTypeError || taxStationError || taxAmountError) {
      console.error("[v0] Tax search error:", taxTypeError || taxStationError || taxAmountError)
    } else {
      console.log("[v0] Found taxes:", uniqueTaxes.length)
      results.push(
        ...uniqueTaxes.map((tax) => ({
          type: "tax" as const,
          id: tax.id,
          title: `${tax.tax_types?.name || "세금"} - ${tax.charge_stations?.name || "충전소"}`,
          subtitle: `금액: ${tax.amount?.toLocaleString()}원`,
          status: tax.status,
          amount: tax.amount,
          date: tax.due_date,
        })),
      )
    }

    // Search stations by name
    const { data: stationsByName, error: stationNameError } = await supabase
      .from("charge_stations")
      .select("id, name, location, status, created_at")
      .ilike("name", `%${query}%`)

    // Search stations by location
    const { data: stationsByLocation, error: stationLocationError } = await supabase
      .from("charge_stations")
      .select("id, name, location, status, created_at")
      .ilike("location", `%${query}%`)

    // Combine station results and remove duplicates
    const allStations = [...(stationsByName || []), ...(stationsByLocation || [])]

    const uniqueStations = allStations.filter(
      (station, index, self) => index === self.findIndex((s) => s.id === station.id),
    )

    if (stationNameError || stationLocationError) {
      console.error("[v0] Station search error:", stationNameError || stationLocationError)
    } else {
      console.log("[v0] Found stations:", uniqueStations.length)
      results.push(
        ...uniqueStations.map((station) => ({
          type: "station" as const,
          id: station.id,
          title: station.name,
          subtitle: `위치: ${station.location}`,
          status: station.status,
          date: station.created_at,
        })),
      )
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "pending":
        return "bg-orange-500/20 text-orange-400 border-orange-500/30"
      case "overdue":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      case "active":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "inactive":
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  const getStatusLabel = (type: string, status: string) => {
    if (type === "tax") {
      switch (status) {
        case "paid":
          return "납부완료"
        case "pending":
          return "납부예정"
        case "overdue":
          return "연체"
        default:
          return status
      }
    } else {
      switch (status) {
        case "active":
          return "운영중"
        case "inactive":
          return "점검중"
        default:
          return status
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">검색 결과</h1>
          {query ? (
            <p className="text-gray-400">
              "{query}"에 대한 검색 결과 {results.length}개
            </p>
          ) : (
            <p className="text-gray-400">검색어를 입력해주세요.</p>
          )}
        </div>

        {query && results.length === 0 && (
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-8 text-center">
            <svg className="w-12 h-12 text-gray-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <h3 className="text-lg font-medium text-white mb-2">검색 결과가 없습니다</h3>
            <p className="text-gray-400">다른 검색어로 시도해보세요.</p>
          </div>
        )}

        {results.length > 0 && (
          <div className="space-y-4">
            {results.map((result) => (
              <div
                key={`${result.type}-${result.id}`}
                className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6 hover:bg-gray-800/70 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full border ${
                          result.type === "tax"
                            ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                            : "bg-purple-500/20 text-purple-400 border-purple-500/30"
                        }`}
                      >
                        {result.type === "tax" ? "세금" : "충전소"}
                      </span>
                      {result.status && (
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(result.status)}`}
                        >
                          {getStatusLabel(result.type, result.status)}
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-medium text-white mb-1">{result.title}</h3>
                    <p className="text-gray-400 text-sm">{result.subtitle}</p>
                    {result.date && (
                      <p className="text-gray-500 text-xs mt-2">
                        {result.type === "tax" ? "납부기한" : "등록일"}:{" "}
                        {new Date(result.date).toLocaleDateString("ko-KR")}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="border-gray-600 text-gray-300 hover:bg-gray-700 bg-transparent"
                    >
                      <Link href={`/dashboard/${result.type === "tax" ? "taxes" : "stations"}/${result.id}`}>
                        상세보기
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8">
          <Button asChild variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700 bg-transparent">
            <Link href="/dashboard">대시보드로 돌아가기</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
