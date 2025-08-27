"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import type { ApiResponse } from "@/lib/types"

export async function createTax(formData: FormData): Promise<ApiResponse<null>> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: { message: "Unauthorized" } }
    }

    const chargeStationId = formData.get("charge_station_id") as string
    const taxTypeId = formData.get("tax_type_id") as string
    const amount = Number.parseFloat(formData.get("amount") as string)
    const dueDate = formData.get("due_date") as string
    const description = formData.get("description") as string

    const { error } = await supabase.from("taxes").insert({
      charge_station_id: chargeStationId,
      tax_type_id: taxTypeId,
      amount,
      due_date: dueDate,
      description,
      status: "pending",
    })

    if (error) {
      return { success: false, error: { message: error.message } }
    }

    revalidatePath("/dashboard/taxes")
    return { success: true }
  } catch (error) {
    return { success: false, error: { message: "Failed to create tax" } }
  }
}

export async function updateTaxStatus(
  taxId: string,
  status: "pending" | "paid" | "overdue",
): Promise<ApiResponse<null>> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: { message: "Unauthorized" } }
    }

    const { error } = await supabase
      .from("taxes")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", taxId)

    if (error) {
      return { success: false, error: { message: error.message } }
    }

    revalidatePath("/dashboard/taxes")
    return { success: true }
  } catch (error) {
    return { success: false, error: { message: "Failed to update tax status" } }
  }
}

export async function deleteTax(taxId: string): Promise<ApiResponse<null>> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: { message: "Unauthorized" } }
    }

    const { error } = await supabase.from("taxes").delete().eq("id", taxId)

    if (error) {
      return { success: false, error: { message: error.message } }
    }

    revalidatePath("/dashboard/taxes")
    return { success: true }
  } catch (error) {
    return { success: false, error: { message: "Failed to delete tax" } }
  }
}

export async function markTaxAsPaid(taxId: string) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      redirect("/auth/login")
    }

    const { error } = await supabase
      .from("taxes")
      .update({
        status: "paid",
        updated_at: new Date().toISOString(),
        paid_date: new Date().toISOString().split("T")[0], // Format as YYYY-MM-DD for date column
      })
      .eq("id", taxId)

    if (error) {
      throw new Error(error.message)
    }

    revalidatePath("/dashboard/taxes")
    revalidatePath("/dashboard")
    revalidatePath("/dashboard/calendar")
    revalidatePath("/dashboard/statistics")
  } catch (error) {
    console.error("Failed to mark tax as paid:", error)
    throw error
  }
}
