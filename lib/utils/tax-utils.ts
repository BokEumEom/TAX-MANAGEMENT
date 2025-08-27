import type { Tax, TaxType } from "@/lib/types"

export function getStatusLabel(status: Tax["status"]): string {
  switch (status) {
    case "pending":
      return "납부예정"
    case "completed":
      return "납부완료"
    case "overdue":
      return "연체"
    case "accountant_review":
      return "회계사검토"
    default:
      return status
  }
}

export function getStatusColor(status: Tax["status"]): string {
  switch (status) {
    case "pending":
      return "text-yellow-400 bg-yellow-400/10"
    case "completed":
      return "text-green-400 bg-green-400/10"
    case "overdue":
      return "text-red-400 bg-red-400/10"
    case "accountant_review":
      return "text-blue-400 bg-blue-400/10"
    default:
      return "text-gray-400 bg-gray-400/10"
  }
}

export function requiresAccountantReview(taxType: TaxType): boolean {
  // 취득세일 경우에만 회계사검토 필요
  return taxType.name.includes("취득세") || taxType.name.toLowerCase().includes("acquisition")
}

export function getAvailableStatuses(taxType: TaxType): Tax["status"][] {
  const baseStatuses: Tax["status"][] = ["pending", "completed", "overdue"]

  if (requiresAccountantReview(taxType)) {
    return [...baseStatuses, "accountant_review"]
  }

  return baseStatuses
}

export function getNextStatus(currentStatus: Tax["status"], taxType: TaxType): Tax["status"] | null {
  if (requiresAccountantReview(taxType)) {
    // 취득세 워크플로우: 회계사 검토 → 납부 예정 → 납부 완료
    switch (currentStatus) {
      case "accountant_review":
        return "pending"
      case "pending":
        return "completed"
      case "completed":
        return null // 최종 상태
      default:
        return "accountant_review" // 초기 상태
    }
  } else {
    // 재산세, 기타세 워크플로우: 납부 예정 → 납부 완료
    switch (currentStatus) {
      case "pending":
        return "completed"
      case "completed":
        return null // 최종 상태
      default:
        return "pending" // 초기 상태
    }
  }
}

export function getInitialStatus(taxType: TaxType): Tax["status"] {
  return requiresAccountantReview(taxType) ? "accountant_review" : "pending"
}

export function canTransitionTo(currentStatus: Tax["status"], targetStatus: Tax["status"], taxType: TaxType): boolean {
  if (requiresAccountantReview(taxType)) {
    // 취득세 워크플로우 검증
    switch (currentStatus) {
      case "accountant_review":
        return targetStatus === "pending"
      case "pending":
        return targetStatus === "completed" || targetStatus === "accountant_review"
      case "completed":
        return targetStatus === "pending" // 원복 가능
      default:
        return targetStatus === "accountant_review"
    }
  } else {
    // 재산세, 기타세 워크플로우 검증
    switch (currentStatus) {
      case "pending":
        return targetStatus === "completed"
      case "completed":
        return targetStatus === "pending" // 원복 가능
      default:
        return targetStatus === "pending"
    }
  }
}
