"use server"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export async function getReminderForEdit(id: string, userId: string) {
  const supabase = await createClient()

  const { data: reminder } = await supabase
    .from("reminders")
    .select(`
      *,
      taxes(
        id,
        amount,
        due_date,
        tax_types(name),
        charge_stations(name)
      )
    `)
    .eq("id", id)
    .eq("user_id", userId)
    .single()

  return reminder
}

export async function getAvailableTaxes() {
  const supabase = await createClient()

  const { data: taxes } = await supabase
    .from("taxes")
    .select(`
      id,
      amount,
      due_date,
      tax_types(name),
      charge_stations(name)
    `)
    .order("due_date", { ascending: true })

  return taxes
}

export async function getCurrentUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return user
}

export async function updateReminder(id: string, formData: FormData) {
  const supabase = await createClient()
  const title = formData.get("title") as string
  const message = formData.get("message") as string
  const reminderDate = formData.get("reminder_date") as string
  const taxId = formData.get("tax_id") as string

  const updateData: any = {
    title,
    message,
    reminder_date: reminderDate,
  }

  if (taxId && taxId !== "none") {
    updateData.tax_id = taxId
  } else {
    updateData.tax_id = null
  }

  const { error } = await supabase.from("reminders").update(updateData).eq("id", id)

  if (error) {
    console.error("Error updating reminder:", error)
    return
  }

  redirect("/dashboard/reminders")
}

export async function deleteReminder(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from("reminders").delete().eq("id", id)

  if (error) {
    console.error("Error deleting reminder:", error)
    return
  }

  redirect("/dashboard/reminders")
}
