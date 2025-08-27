"use server"

import { createClient } from "@/lib/supabase/server"
import { emailService } from "@/lib/email"
import { revalidatePath } from "next/cache"

export async function sendTaxReminder(taxId: string) {
  try {
    const supabase = await createClient()

    // Get tax information with related data
    const { data: tax, error: taxError } = await supabase
      .from("taxes")
      .select(`
        *,
        tax_types(name),
        charge_stations(name),
        users(email, name)
      `)
      .eq("id", taxId)
      .single()

    if (taxError || !tax) {
      return { success: false, error: "세금 정보를 찾을 수 없습니다." }
    }

    if (!tax.users?.email) {
      return { success: false, error: "사용자 이메일이 없습니다." }
    }

    // Prepare email template
    const template = emailService.getTaxReminderTemplate({
      taxType: tax.tax_types?.name || "알 수 없음",
      amount: tax.amount,
      dueDate: tax.due_date,
      stationName: tax.charge_stations?.name || "알 수 없음",
    })

    // Send email
    const emailSent = await emailService.sendEmail({
      to: tax.users.email,
      subject: template.subject,
      html: template.html,
      text: template.text,
    })

    if (!emailSent) {
      return { success: false, error: "이메일 전송에 실패했습니다." }
    }

    // Create reminder record
    const { error: reminderError } = await supabase.from("reminders").insert({
      user_id: tax.user_id,
      tax_id: taxId,
      title: `세금 납부 알림: ${tax.tax_types?.name}`,
      message: `${tax.charge_stations?.name}의 ${tax.tax_types?.name} 납부 알림이 이메일로 전송되었습니다.`,
      reminder_date: new Date().toISOString(),
      status: "sent",
      type: "email",
    })

    if (reminderError) {
      console.error("[v0] Failed to create reminder record:", reminderError)
    }

    revalidatePath("/dashboard/reminders")
    return { success: true, message: "이메일 알림이 성공적으로 전송되었습니다." }
  } catch (error) {
    console.error("[v0] Error sending tax reminder:", error)
    return { success: false, error: "알림 전송 중 오류가 발생했습니다." }
  }
}

export async function sendOverdueReminders() {
  try {
    const supabase = await createClient()

    // Get overdue taxes
    const { data: overdueTaxes, error } = await supabase
      .from("taxes")
      .select(`
        *,
        tax_types(name),
        charge_stations(name),
        users(email, name)
      `)
      .eq("status", "pending")
      .lt("due_date", new Date().toISOString())

    if (error || !overdueTaxes) {
      return { success: false, error: "연체 세금 정보를 가져올 수 없습니다." }
    }

    let successCount = 0
    let failCount = 0

    for (const tax of overdueTaxes) {
      if (!tax.users?.email) {
        failCount++
        continue
      }

      const daysPastDue = Math.ceil((new Date().getTime() - new Date(tax.due_date).getTime()) / (1000 * 60 * 60 * 24))

      const template = emailService.getOverdueReminderTemplate({
        taxType: tax.tax_types?.name || "알 수 없음",
        amount: tax.amount,
        dueDate: tax.due_date,
        stationName: tax.charge_stations?.name || "알 수 없음",
        daysPastDue,
      })

      const emailSent = await emailService.sendEmail({
        to: tax.users.email,
        subject: template.subject,
        html: template.html,
        text: template.text,
      })

      if (emailSent) {
        successCount++

        // Create reminder record
        await supabase.from("reminders").insert({
          user_id: tax.user_id,
          tax_id: tax.id,
          title: `연체 알림: ${tax.tax_types?.name}`,
          message: `${tax.charge_stations?.name}의 ${tax.tax_types?.name} 연체 알림이 이메일로 전송되었습니다. (${daysPastDue}일 연체)`,
          reminder_date: new Date().toISOString(),
          status: "sent",
          type: "email",
        })
      } else {
        failCount++
      }
    }

    revalidatePath("/dashboard/reminders")
    return {
      success: true,
      message: `연체 알림 전송 완료: 성공 ${successCount}건, 실패 ${failCount}건`,
    }
  } catch (error) {
    console.error("[v0] Error sending overdue reminders:", error)
    return { success: false, error: "연체 알림 전송 중 오류가 발생했습니다." }
  }
}

export async function sendBulkTaxReminders(taxIds: string[]) {
  try {
    let successCount = 0
    let failCount = 0

    for (const taxId of taxIds) {
      const result = await sendTaxReminder(taxId)
      if (result.success) {
        successCount++
      } else {
        failCount++
      }
    }

    return {
      success: true,
      message: `일괄 알림 전송 완료: 성공 ${successCount}건, 실패 ${failCount}건`,
    }
  } catch (error) {
    console.error("[v0] Error sending bulk reminders:", error)
    return { success: false, error: "일괄 알림 전송 중 오류가 발생했습니다." }
  }
}
