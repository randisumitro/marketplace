import { Resend } from 'resend'
import { env, isEmailConfigured } from '../config/env.js'

let resendClient: Resend | null = null
function getClient() {
  if (!resendClient) resendClient = new Resend(env.resend.apiKey)
  return resendClient
}

interface SendEmailInput {
  to: string
  subject: string
  html: string
}

/**
 * Mengirim email lewat Resend. TIDAK PERNAH melempar error — kegagalan email
 * (atau belum dikonfigurasi sama sekali) dicatat di log server saja, supaya alur
 * utama (registrasi, checkout, dst) tidak pernah gagal gara-gara email tidak terkirim.
 */
export async function sendEmail({ to, subject, html }: SendEmailInput): Promise<void> {
  if (!isEmailConfigured) {
    console.warn(`✉️  Email belum dikonfigurasi (RESEND_API_KEY kosong) — email ke ${to} dilewati: "${subject}"`)
    return
  }

  try {
    await getClient().emails.send({ from: env.resend.fromEmail, to, subject, html })
  } catch (error) {
    console.error('❌ Gagal mengirim email:', error)
  }
}

function emailShell(bodyHtml: string): string {
  return `
    <div style="font-family: -apple-system, Segoe UI, Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; color: #14161A;">
      <p style="font-size: 20px; font-weight: 600; margin: 0 0 24px;">OneShop</p>
      ${bodyHtml}
      <p style="margin-top: 32px; font-size: 12px; color: #8a8a8a;">Email ini dikirim otomatis oleh OneShop. Jangan balas email ini.</p>
    </div>
  `
}

export function passwordResetEmail(resetUrl: string): string {
  return emailShell(`
    <p style="font-size: 15px; line-height: 1.6;">Kami menerima permintaan reset password untuk akun OneShop kamu.</p>
    <p style="margin: 24px 0;">
      <a href="${resetUrl}" style="background: #0E6B4C; color: white; padding: 12px 24px; border-radius: 999px; text-decoration: none; font-size: 14px; font-weight: 600;">Reset Password</a>
    </p>
    <p style="font-size: 13px; line-height: 1.6; color: #555;">Link ini berlaku 1 jam. Kalau kamu tidak meminta reset password, abaikan saja email ini.</p>
  `)
}

export function notificationEmail(title: string, message: string, link: string): string {
  return emailShell(`
    <p style="font-size: 16px; font-weight: 600; margin: 0 0 8px;">${title}</p>
    <p style="font-size: 15px; line-height: 1.6; color: #333;">${message}</p>
    <p style="margin: 24px 0;">
      <a href="${link}" style="color: #0E6B4C; font-size: 14px; font-weight: 600;">Lihat di OneShop →</a>
    </p>
  `)
}
