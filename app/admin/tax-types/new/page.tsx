"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function NewTaxTypePage() {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [rate, setRate] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()

      const { error } = await supabase.from("tax_types").insert({
        name,
        description: description || null,
        rate: rate ? Number.parseFloat(rate) / 100 : null, // Convert percentage to decimal
      })

      if (error) throw error

      router.push("/admin/tax-types")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "세금 유형 생성 중 오류가 발생했습니다")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800">새 세금 유형 추가</h1>
          <p className="text-slate-600 mt-2">새로운 세금 유형을 시스템에 추가하세요</p>
        </div>

        <Card className="bg-white/80 backdrop-blur border-0 shadow-lg">
          <CardHeader>
            <CardTitle>세금 유형 정보</CardTitle>
            <CardDescription>세금 유형의 상세 정보를 입력하세요</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">세금 유형명 *</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="예: 부가가치세"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">설명</Label>
                <Textarea
                  id="description"
                  placeholder="세금 유형에 대한 설명을 입력하세요"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="rate">세율 (%)</Label>
                <Input
                  id="rate"
                  type="number"
                  placeholder="예: 10"
                  value={rate}
                  onChange={(e) => setRate(e.target.value)}
                  min="0"
                  max="100"
                  step="0.01"
                />
                <p className="text-sm text-slate-500">세율을 퍼센트로 입력하세요 (예: 10% → 10)</p>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <Button type="submit" className="flex-1" disabled={isLoading}>
                  {isLoading ? "생성 중..." : "세금 유형 생성"}
                </Button>
                <Button type="button" variant="outline" onClick={() => router.back()} disabled={isLoading}>
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
