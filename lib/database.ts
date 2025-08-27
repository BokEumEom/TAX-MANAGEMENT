import { createClient } from "@/lib/supabase/server"
import type { User, ChargeStation, Tax, TaxType, Reminder, ApiResponse } from "./types"

export async function getUser(): Promise<ApiResponse<User | null>> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError) {
      return { success: false, error: { message: authError.message } }
    }

    if (!user) {
      return { success: true, data: null }
    }

    const { data: userData, error } = await supabase.from("users").select("*").eq("id", user.id).single()

    if (error) {
      return { success: false, error: { message: error.message } }
    }

    return { success: true, data: userData }
  } catch (error) {
    return { success: false, error: { message: "Failed to fetch user" } }
  }
}

export async function getChargeStations(userId: string): Promise<ApiResponse<ChargeStation[]>> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("charge_stations")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) {
      return { success: false, error: { message: error.message } }
    }

    return { success: true, data: data || [] }
  } catch (error) {
    return { success: false, error: { message: "Failed to fetch charge stations" } }
  }
}

export async function getTaxes(userId: string): Promise<ApiResponse<Tax[]>> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("taxes")
      .select(`
        *,
        charge_station:charge_stations(*),
        tax_type:tax_types(*)
      `)
      .eq("charge_stations.user_id", userId)
      .order("due_date", { ascending: true })

    if (error) {
      return { success: false, error: { message: error.message } }
    }

    return { success: true, data: data || [] }
  } catch (error) {
    return { success: false, error: { message: "Failed to fetch taxes" } }
  }
}

export async function getReminders(userId: string): Promise<ApiResponse<Reminder[]>> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("reminders")
      .select(`
        *,
        tax:taxes(
          *,
          charge_station:charge_stations(*),
          tax_type:tax_types(*)
        )
      `)
      .eq("user_id", userId)
      .order("reminder_date", { ascending: true })

    if (error) {
      return { success: false, error: { message: error.message } }
    }

    return { success: true, data: data || [] }
  } catch (error) {
    return { success: false, error: { message: "Failed to fetch reminders" } }
  }
}

export async function getTaxTypes(): Promise<ApiResponse<TaxType[]>> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.from("tax_types").select("*").order("name", { ascending: true })

    if (error) {
      return { success: false, error: { message: error.message } }
    }

    return { success: true, data: data || [] }
  } catch (error) {
    return { success: false, error: { message: "Failed to fetch tax types" } }
  }
}
