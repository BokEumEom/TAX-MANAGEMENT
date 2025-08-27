import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export async function requireAuth() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  return user
}

export async function requireAdmin() {
  const user = await requireAuth()
  const supabase = await createClient()

  const { data: userProfile } = await supabase.from("users").select("role").eq("id", user.id).single()

  if (!userProfile || userProfile.role !== "admin") {
    redirect("/dashboard")
  }

  return user
}

export async function getUserRole(userId: string) {
  const supabase = await createClient()
  const { data: userProfile } = await supabase.from("users").select("role").eq("id", userId).single()
  return userProfile?.role || "user"
}

export async function isViewer(userId: string) {
  const role = await getUserRole(userId)
  return role === "user"
}

export async function canEdit(userId: string) {
  const role = await getUserRole(userId)
  return role === "admin"
}
