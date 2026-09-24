import 'dotenv/config'

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 4000),
  mongodbUri: required('MONGODB_URI', 'mongodb://localhost:27017/oneshop'),
  jwtSecret: process.env.NODE_ENV === 'production' ? required('JWT_SECRET') : (process.env.JWT_SECRET ?? 'dev-only-secret-change-me'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  clientOrigin: process.env.CLIENT_ORIGIN ?? 'http://localhost:5173',
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME ?? '',
    apiKey: process.env.CLOUDINARY_API_KEY ?? '',
    apiSecret: process.env.CLOUDINARY_API_SECRET ?? '',
  },
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID ?? '',
  },
  resend: {
    apiKey: process.env.RESEND_API_KEY ?? '',
    // onboarding@resend.dev jalan langsung tanpa verifikasi domain (cukup untuk dev/testing).
    // Untuk production sungguhan, ganti dengan alamat di domain yang sudah diverifikasi di Resend.
    fromEmail: process.env.RESEND_FROM_EMAIL ?? 'OneShop <onboarding@resend.dev>',
  },
  midtrans: {
    serverKey: process.env.MIDTRANS_SERVER_KEY ?? '',
    clientKey: process.env.MIDTRANS_CLIENT_KEY ?? '',
    isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
  },
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID ?? '',
    authToken: process.env.TWILIO_AUTH_TOKEN ?? '',
    verifyServiceSid: process.env.TWILIO_VERIFY_SERVICE_SID ?? '',
  },
}

export const isCloudinaryConfigured = Boolean(
  env.cloudinary.cloudName && env.cloudinary.apiKey && env.cloudinary.apiSecret,
)

export const isEmailConfigured = Boolean(env.resend.apiKey)
export const isGoogleConfigured = Boolean(env.google.clientId)
export const isMidtransConfigured = Boolean(env.midtrans.serverKey && env.midtrans.clientKey)
export const isTwilioConfigured = Boolean(
  env.twilio.accountSid && env.twilio.authToken && env.twilio.verifyServiceSid,
)

export const isProduction = env.nodeEnv === 'production'
