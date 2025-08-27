import { requireAdmin } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Link from "next/link"

export default async function TaxTypesManagementPage() {
  await requireAdmin()
  const supabase = await createClient()

  // Fetch all tax types with usage count
  const { data: taxTypes } = await supabase
    .from("tax_types")
    .select(`
      *,
      taxes(count)
    `)
    .order("name", { ascending: true })

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">세금 유형 관리</h1>
          <p className="text-slate-600 mt-2">시스템에서 사용되는 세금 유형을 관리하세요</p>
        </div>
        <Button asChild>
          <Link href="/admin/tax-types/new">새 세금 유형 추가</Link>
        </Button>
      </div>

      <Card className="bg-white/80 backdrop-blur border-0 shadow-lg">
        <CardHeader>
          <CardTitle>세금 유형 목록</CardTitle>
          <CardDescription>시스템에 등록된 모든 세금 유형</CardDescription>
        </CardHeader>
        <CardContent>
          {taxTypes && taxTypes.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>세금 유형</TableHead>
                  <TableHead>설명</TableHead>
                  <TableHead>세율</TableHead>
                  <TableHead>사용 횟수</TableHead>
                  <TableHead>등록일</TableHead>
                  <TableHead>작업</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {taxTypes.map((taxType) => (
                  <TableRow key={taxType.id}>
                    <TableCell className="font-medium">{taxType.name}</TableCell>
                    <TableCell className="max-w-xs truncate">{taxType.description || "설명 없음"}</TableCell>
                    <TableCell className="font-semibold">
                      {taxType.rate ? `${(taxType.rate * 100).toFixed(2)}%` : "미설정"}
                    </TableCell>
                    <TableCell>{taxType.taxes?.[0]?.count || 0}회</TableCell>
                    <TableCell className="text-sm text-slate-500">
                      {new Date(taxType.created_at).toLocaleDateString("ko-KR")}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/admin/tax-types/${taxType.id}/edit`}>편집</Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <p className="text-slate-500">등록된 세금 유형이 없습니다</p>
              <Button asChild className="mt-4">
                <Link href="/admin/tax-types/new">첫 세금 유형 추가하기</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
