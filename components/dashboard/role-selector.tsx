"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import Link from "next/link"

interface RoleSelectorProps {
  currentRole: string
  userId: string
  userEmail: string
  onSignOut: () => void
  isAdmin: boolean
}

export function RoleSelector({ currentRole, userId, userEmail, onSignOut, isAdmin }: RoleSelectorProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const updateRole = async (newRole: string) => {
    if (newRole === currentRole) return

    setIsLoading(true)
    try {
      console.log("[v0] Updating user role:", { userId, currentRole, newRole })

      const supabase = createClient()
      const { error } = await supabase.from("users").update({ role: newRole }).eq("id", userId)

      if (error) {
        console.error("[v0] Role update error:", error)
        toast.error("권한 변경에 실패했습니다.")
        return
      }

      console.log("[v0] Role updated successfully")
      toast.success(`권한이 ${newRole === "admin" ? "관리자" : "뷰어"}로 변경되었습니다.`)
      router.refresh()
    } catch (error) {
      console.error("[v0] Role update exception:", error)
      toast.error("권한 변경 중 오류가 발생했습니다.")
    } finally {
      setIsLoading(false)
    }
  }

  const getRoleLabel = (role: string) => {
    return role === "admin" ? "관리자" : "뷰어"
  }

  const getRoleIcon = (role: string) => {
    if (role === "admin") {
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
          />
        </svg>
      )
    }
    return (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
        />
      </svg>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={isLoading}
          className="border-gray-600 text-gray-300 hover:bg-gray-700 bg-transparent flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
          {userEmail}
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700 w-48">
        {/* User Info */}
        <div className="px-3 py-2 text-sm text-gray-400 border-b border-gray-700">
          <div className="font-medium text-gray-300">{userEmail}</div>
          <div className="text-xs">{getRoleLabel(currentRole)}</div>
        </div>

        {/* Role Selection */}
        <div className="px-3 py-1 text-xs text-gray-500 uppercase tracking-wider">권한 변경</div>
        <DropdownMenuItem
          onClick={() => updateRole("admin")}
          className="text-gray-300 hover:bg-gray-700 hover:text-white cursor-pointer flex items-center gap-2"
        >
          {getRoleIcon("admin")}
          관리자
          {currentRole === "admin" && (
            <svg className="w-3 h-3 ml-auto text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => updateRole("user")}
          className="text-gray-300 hover:bg-gray-700 hover:text-white cursor-pointer flex items-center gap-2"
        >
          {getRoleIcon("user")}
          뷰어
          {currentRole === "user" && (
            <svg className="w-3 h-3 ml-auto text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-gray-700" />

        {/* Admin Panel Access */}
        {isAdmin && (
          <DropdownMenuItem asChild>
            <Link
              href="/admin"
              className="text-gray-300 hover:bg-gray-700 hover:text-white cursor-pointer flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              관리자 패널
            </Link>
          </DropdownMenuItem>
        )}

        {/* Logout */}
        <DropdownMenuItem
          onClick={onSignOut}
          className="text-gray-300 hover:bg-gray-700 hover:text-white cursor-pointer flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          로그아웃
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
