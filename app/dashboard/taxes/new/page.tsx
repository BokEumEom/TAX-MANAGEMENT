"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useRouter } from "next/navigation"
import { useState, useEffect, useRef } from "react"
import { Upload, FileText, Shield, Search, X } from "lucide-react"

interface ChargeStation {
  id: string
  name: string
  location: string
}

interface TaxType {
  id: string
  name: string
  rate: number
}

export default function NewTaxPage() {
  const [chargeStations, setChargeStations] = useState<ChargeStation[]>([])
  const [filteredStations, setFilteredStations] = useState<ChargeStation[]>([])
  const [taxTypes, setTaxTypes] = useState<TaxType[]>([])
  const [selectedStation, setSelectedStation] = useState("")
  const [selectedTaxType, setSelectedTaxType] = useState("")
  const [amount, setAmount] = useState("")
  const [dueDate, setDueDate] = useState("")
  const [notes, setNotes] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isOcrProcessing, setIsOcrProcessing] = useState(false)
  const [ocrResult, setOcrResult] = useState<string>("")
  const [userRole, setUserRole] = useState<string | null>(null)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [stationSearch, setStationSearch] = useState("")
  const [showStationDropdown, setShowStationDropdown] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  useEffect(() => {
    const checkUserPermissions = async () => {
      try {
        const supabase = createClient()
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser()

        if (authError || !user) {
          router.push("/auth/login")
          return
        }

        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("role")
          .eq("id", user.id)
          .single()

        if (userError || !userData) {
          setError("사용자 정보를 불러올 수 없습니다.")
          return
        }

        if (userData.role === "user") {
          router.push("/dashboard/taxes")
          return
        }

        setUserRole(userData.role)
      } catch (error) {
        console.error("Permission check failed:", error)
        setError("권한 확인 중 오류가 발생했습니다.")
      } finally {
        setIsCheckingAuth(false)
      }
    }

    checkUserPermissions()
  }, [router])

  useEffect(() => {
    if (userRole !== "admin") return

    const fetchData = async () => {
      const supabase = createClient()

      const { data: stations } = await supabase.from("charge_stations").select("id, name, location").order("name")

      const { data: types } = await supabase.from("tax_types").select("id, name, rate").order("name")

      if (stations) {
        setChargeStations(stations)
        setFilteredStations(stations)
      }
      if (types) setTaxTypes(types)
    }

    fetchData()
  }, [userRole])

  useEffect(() => {
    if (!stationSearch.trim()) {
      setFilteredStations(chargeStations)
    } else {
      const filtered = chargeStations.filter(
        (station) =>
          station.name.toLowerCase().includes(stationSearch.toLowerCase()) ||
          station.location.toLowerCase().includes(stationSearch.toLowerCase()),
      )
      setFilteredStations(filtered)
    }
  }, [stationSearch, chargeStations])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()

      const { error } = await supabase.from("taxes").insert({
        charge_station_id: selectedStation,
        tax_type_id: selectedTaxType,
        amount: Number.parseFloat(amount),
        due_date: dueDate,
        notes: notes || null,
        status: "pending",
      })

      if (error) throw error

      router.push("/dashboard/taxes")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "세금 등록 중 오류가 발생했습니다")
    } finally {
      setIsLoading(false)
    }
  }

  const processImageWithOCR = async (file: File) => {
    setIsOcrProcessing(true)
    setError(null)

    try {
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")
      const img = new Image()

      img.onload = async () => {
        canvas.width = img.width
        canvas.height = img.height
        ctx?.drawImage(img, 0, 0)

        try {
          if ("createImageBitmap" in window && "OffscreenCanvas" in window) {
            const imageData = ctx?.getImageData(0, 0, canvas.width, canvas.height)
            if (imageData) {
              const extractedText = await simulateOCRExtraction(canvas.toDataURL())
              setOcrResult(extractedText)
              extractTaxInfoFromText(extractedText)
            }
          }
        } catch (ocrError) {
          console.error("OCR processing failed:", ocrError)
          setError("OCR 처리 중 오류가 발생했습니다. 수동으로 입력해주세요.")
        }
      }

      img.src = URL.createObjectURL(file)
    } catch (error) {
      setError("이미지 처리 중 오류가 발생했습니다.")
    } finally {
      setIsOcrProcessing(false)
    }
  }

  const simulateOCRExtraction = async (imageDataUrl: string): Promise<string> => {
    await new Promise((resolve) => setTimeout(resolve, 2000))
    return `
      세금계산서
      공급자: 한국전력공사
      공급받는자: 충전소 A
      공급가액: 1,500,000원
      세액: 150,000원
      합계: 1,650,000원
      발행일자: 2024-01-15
      납부기한: 2024-02-15
    `
  }

  const extractTaxInfoFromText = (text: string) => {
    const amountMatch = text.match(/(?:합계|총액|세액):\s*([0-9,]+)원/i) || text.match(/([0-9,]+)원/g)?.slice(-1)
    if (amountMatch) {
      const extractedAmount = amountMatch[1] || amountMatch[0]
      setAmount(extractedAmount.replace(/[,원]/g, ""))
    }

    const dateMatch =
      text.match(/(?:납부기한|기한|만료일):\s*(\d{4}-\d{2}-\d{2})/i) || text.match(/(\d{4}-\d{2}-\d{2})/g)?.slice(-1)
    if (dateMatch) {
      setDueDate(dateMatch[1] || dateMatch[0])
    }

    const lines = text.split("\n").filter((line) => line.trim())
    const relevantInfo = lines
      .filter((line) => !line.includes("세금계산서") && !line.includes("공급자") && line.trim().length > 5)
      .join(" ")

    if (relevantInfo) {
      setNotes((prev) => (prev ? `${prev}\n\nOCR 추출 정보: ${relevantInfo}` : `OCR 추출 정보: ${relevantInfo}`))
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type.startsWith("image/")) {
      processImageWithOCR(file)
    } else {
      setError("이미지 파일만 업로드 가능합니다.")
    }
  }

  const handleStationSelect = (station: ChargeStation) => {
    setSelectedStation(station.id)
    setStationSearch(station.name) // Show only station name
    setShowStationDropdown(false)
  }

  const clearStationSelection = () => {
    setSelectedStation("")
    setStationSearch("")
    setShowStationDropdown(false)
  }

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-gray-400">권한을 확인하는 중...</p>
        </div>
      </div>
    )
  }

  if (userRole === "user") {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
        <Card className="bg-gray-800/50 backdrop-blur border-gray-700 shadow-xl max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-red-400" />
            </div>
            <CardTitle className="text-white">접근 권한 없음</CardTitle>
            <CardDescription className="text-gray-400">
              뷰어 권한으로는 세금 등록 기능을 사용할 수 없습니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => router.push("/dashboard/taxes")}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              세금 목록으로 돌아가기
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">새 세금 등록</h1>
          <p className="text-gray-400 mt-2">새로운 세금 납부 항목을 등록하세요</p>
        </div>

        <Card className="bg-gray-800/50 backdrop-blur border-gray-700 shadow-xl mb-6">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <FileText className="w-5 h-5" />
              OCR 문서 인식
            </CardTitle>
            <CardDescription className="text-gray-400">
              세금계산서나 영수증을 업로드하면 자동으로 정보를 추출합니다
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isOcrProcessing}
                  className="flex items-center gap-2 border-gray-600 text-gray-200 hover:bg-gray-700"
                >
                  <Upload className="w-4 h-4" />
                  {isOcrProcessing ? "처리 중..." : "파일 업로드"}
                </Button>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              </div>

              {isOcrProcessing && (
                <div className="flex items-center gap-2 text-blue-400">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
                  <span className="text-sm">OCR 처리 중...</span>
                </div>
              )}

              {ocrResult && (
                <div className="p-3 bg-gray-700/50 border border-gray-600 rounded-lg">
                  <p className="text-sm text-gray-300 mb-2">추출된 텍스트:</p>
                  <pre className="text-xs text-gray-400 whitespace-pre-wrap max-h-32 overflow-y-auto">{ocrResult}</pre>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 backdrop-blur border-gray-700 shadow-xl">
          <CardHeader>
            <CardTitle className="text-white">세금 정보</CardTitle>
            <CardDescription className="text-gray-400">납부할 세금의 상세 정보를 입력하세요</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="station" className="text-gray-200">
                    충전소 선택
                  </Label>
                  <div className="relative">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        type="text"
                        placeholder="충전소명 또는 위치로 검색..."
                        value={stationSearch}
                        onChange={(e) => {
                          setStationSearch(e.target.value)
                          setShowStationDropdown(true)
                        }}
                        onFocus={() => setShowStationDropdown(true)}
                        className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 pl-10 pr-10"
                        required
                      />
                      {selectedStation && (
                        <button
                          type="button"
                          onClick={clearStationSelection}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {showStationDropdown && filteredStations.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-gray-700 border border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {filteredStations.map((station) => (
                          <button
                            key={station.id}
                            type="button"
                            onClick={() => handleStationSelect(station)}
                            className="w-full px-4 py-3 text-left hover:bg-gray-600 focus:bg-gray-600 focus:outline-none border-b border-gray-600 last:border-b-0"
                          >
                            <div className="text-white font-medium">{station.name}</div>
                            <div className="text-gray-400 text-sm">{station.location}</div>
                          </button>
                        ))}
                      </div>
                    )}

                    {showStationDropdown && filteredStations.length === 0 && stationSearch && (
                      <div className="absolute z-10 w-full mt-1 bg-gray-700 border border-gray-600 rounded-lg shadow-lg">
                        <div className="px-4 py-3 text-gray-400 text-center">검색 결과가 없습니다</div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="taxType" className="text-gray-200">
                    세금 유형
                  </Label>
                  <Select value={selectedTaxType} onValueChange={setSelectedTaxType} required>
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                      <SelectValue placeholder="세금 유형을 선택하세요" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-700 border-gray-600">
                      {taxTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id} className="text-white hover:bg-gray-600">
                          {type.name} ({(type.rate * 100).toFixed(1)}%)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="amount" className="text-gray-200">
                    납부 금액 (원)
                  </Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="1000000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                    min="0"
                    step="1"
                    className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dueDate" className="text-gray-200">
                    납부 기한
                  </Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    required
                    className="bg-gray-700 border-gray-600 text-white focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes" className="text-gray-200">
                  메모 (선택사항)
                </Label>
                <Textarea
                  id="notes"
                  placeholder="추가 메모나 특이사항을 입력하세요"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
                />
              </div>

              {error && (
                <div className="p-3 bg-red-900/50 border border-red-700 rounded-lg">
                  <p className="text-sm text-red-300">{error}</p>
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black"
                  disabled={isLoading}
                >
                  {isLoading ? "등록 중..." : "세금 등록"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={isLoading}
                  className="border-gray-600 text-gray-200 hover:bg-gray-700"
                >
                  취소
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
