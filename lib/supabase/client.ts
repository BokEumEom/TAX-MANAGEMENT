import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("[v0] Missing Supabase environment variables:", {
      url: !!supabaseUrl,
      key: !!supabaseAnonKey,
    })
    throw new Error("Supabase configuration is missing. Please check your environment variables.")
  }

  console.log("[v0] Creating Supabase client with URL:", supabaseUrl.substring(0, 20) + "...")

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
