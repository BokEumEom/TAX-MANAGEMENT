export interface EmailTemplate {
  subject: string
  html: string
  text: string
}

export interface SendEmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

// SendGrid email service
export class EmailService {
  private apiKey: string
  private fromEmail: string

  constructor() {
    this.apiKey = process.env.SENDGRID_API_KEY || ""
    this.fromEmail = process.env.SENDGRID_FROM_EMAIL || "noreply@taxmanager.com"
  }

  async sendEmail({ to, subject, html, text }: SendEmailOptions): Promise<boolean> {
    if (!this.apiKey) {
      console.error("[v0] SendGrid API key not configured")
      return false
    }

    try {
      const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          personalizations: [
            {
              to: [{ email: to }],
              subject: subject,
            },
          ],
          from: { email: this.fromEmail },
          content: [
            {
              type: "text/html",
              value: html,
            },
            ...(text ? [{ type: "text/plain", value: text }] : []),
          ],
        }),
      })

      return response.ok
    } catch (error) {
      console.error("[v0] Failed to send email:", error)
      return false
    }
  }

  // Email templates
  getTaxReminderTemplate(taxInfo: {
    taxType: string
    amount: number
    dueDate: string
    stationName: string
  }): EmailTemplate {
    const subject = `세금 납부 알림: ${taxInfo.taxType} - ${taxInfo.stationName}`

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
          <h1 style="color: white; margin: 0; font-size: 28px;">세금 납부 알림</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">세무 관리 시스템</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 25px; border-radius: 8px; margin-bottom: 25px;">
          <h2 style="color: #333; margin-top: 0;">납부 정보</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #666; font-weight: bold;">세금 유형:</td>
              <td style="padding: 8px 0; color: #333;">${taxInfo.taxType}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666; font-weight: bold;">충전소:</td>
              <td style="padding: 8px 0; color: #333;">${taxInfo.stationName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666; font-weight: bold;">납부 금액:</td>
              <td style="padding: 8px 0; color: #333; font-size: 18px; font-weight: bold;">₩${taxInfo.amount.toLocaleString()}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666; font-weight: bold;">납부 기한:</td>
              <td style="padding: 8px 0; color: #e74c3c; font-weight: bold;">${new Date(taxInfo.dueDate).toLocaleDateString("ko-KR")}</td>
            </tr>
          </table>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/taxes" 
             style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
            세금 관리 페이지로 이동
          </a>
        </div>
        
        <div style="border-top: 1px solid #eee; padding-top: 20px; text-align: center; color: #666; font-size: 14px;">
          <p>이 이메일은 세무 관리 시스템에서 자동으로 발송되었습니다.</p>
          <p>문의사항이 있으시면 관리자에게 연락해주세요.</p>
        </div>
      </div>
    `

    const text = `
세금 납부 알림

납부 정보:
- 세금 유형: ${taxInfo.taxType}
- 충전소: ${taxInfo.stationName}
- 납부 금액: ₩${taxInfo.amount.toLocaleString()}
- 납부 기한: ${new Date(taxInfo.dueDate).toLocaleDateString("ko-KR")}

세금 관리 페이지: ${process.env.NEXT_PUBLIC_APP_URL}/dashboard/taxes

이 이메일은 세무 관리 시스템에서 자동으로 발송되었습니다.
    `

    return { subject, html, text }
  }

  getOverdueReminderTemplate(taxInfo: {
    taxType: string
    amount: number
    dueDate: string
    stationName: string
    daysPastDue: number
  }): EmailTemplate {
    const subject = `🚨 연체 알림: ${taxInfo.taxType} - ${taxInfo.stationName}`

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
          <h1 style="color: white; margin: 0; font-size: 28px;">⚠️ 연체 알림</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">즉시 납부가 필요합니다</p>
        </div>
        
        <div style="background: #fff5f5; border: 2px solid #fed7d7; padding: 25px; border-radius: 8px; margin-bottom: 25px;">
          <h2 style="color: #e53e3e; margin-top: 0;">연체 정보</h2>
          <p style="color: #e53e3e; font-weight: bold; font-size: 16px;">
            납부 기한이 ${taxInfo.daysPastDue}일 지났습니다.
          </p>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #666; font-weight: bold;">세금 유형:</td>
              <td style="padding: 8px 0; color: #333;">${taxInfo.taxType}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666; font-weight: bold;">충전소:</td>
              <td style="padding: 8px 0; color: #333;">${taxInfo.stationName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666; font-weight: bold;">납부 금액:</td>
              <td style="padding: 8px 0; color: #333; font-size: 18px; font-weight: bold;">₩${taxInfo.amount.toLocaleString()}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666; font-weight: bold;">원래 납부 기한:</td>
              <td style="padding: 8px 0; color: #e74c3c; font-weight: bold;">${new Date(taxInfo.dueDate).toLocaleDateString("ko-KR")}</td>
            </tr>
          </table>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/taxes" 
             style="background: #e74c3c; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
            즉시 납부하기
          </a>
        </div>
        
        <div style="border-top: 1px solid #eee; padding-top: 20px; text-align: center; color: #666; font-size: 14px;">
          <p>연체료가 부과될 수 있으니 즉시 납부해주세요.</p>
          <p>문의사항이 있으시면 관리자에게 연락해주세요.</p>
        </div>
      </div>
    `

    const text = `
🚨 연체 알림

납부 기한이 ${taxInfo.daysPastDue}일 지났습니다.

연체 정보:
- 세금 유형: ${taxInfo.taxType}
- 충전소: ${taxInfo.stationName}
- 납부 금액: ₩${taxInfo.amount.toLocaleString()}
- 원래 납부 기한: ${new Date(taxInfo.dueDate).toLocaleDateString("ko-KR")}

즉시 납부하기: ${process.env.NEXT_PUBLIC_APP_URL}/dashboard/taxes

연체료가 부과될 수 있으니 즉시 납부해주세요.
    `

    return { subject, html, text }
  }
}

export const emailService = new EmailService()
