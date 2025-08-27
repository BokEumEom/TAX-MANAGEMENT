"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type { ApiResponse } from "@/lib/types"

export async function createChargeStation(formData: FormData): Promise<ApiResponse<null>> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: { message: "Unauthorized" } }
    }

    const name = formData.get("name") as string
    const location = formData.get("location") as string
    const status = formData.get("status") as "active" | "inactive" | "maintenance"

    const { error } = await supabase.from("charge_stations").insert({
      name,
      location,
      status,
      user_id: user.id,
    })

    if (error) {
      return { success: false, error: { message: error.message } }
    }

    revalidatePath("/dashboard/stations")
    return { success: true }
  } catch (error) {
    return { success: false, error: { message: "Failed to create charge station" } }
  }
}

export async function updateChargeStation(stationId: string, formData: FormData): Promise<ApiResponse<null>> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: { message: "Unauthorized" } }
    }

    const name = formData.get("name") as string
    const location = formData.get("location") as string
    const status = formData.get("status") as "active" | "inactive" | "maintenance"

    const { error } = await supabase
      .from("charge_stations")
      .update({
        name,
        location,
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", stationId)
      .eq("user_id", user.id)

    if (error) {
      return { success: false, error: { message: error.message } }
    }

    revalidatePath("/dashboard/stations")
    return { success: true }
  } catch (error) {
    return { success: false, error: { message: "Failed to update charge station" } }
  }
}

export async function deleteChargeStation(stationId: string): Promise<ApiResponse<null>> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: { message: "Unauthorized" } }
    }

    const { error } = await supabase.from("charge_stations").delete().eq("id", stationId).eq("user_id", user.id)

    if (error) {
      return { success: false, error: { message: error.message } }
    }

    revalidatePath("/dashboard/stations")
    return { success: true }
  } catch (error) {
    return { success: false, error: { message: "Failed to delete charge station" } }
  }
}
