/** Ubah nomor HP format lokal Indonesia (08xxxxxxxxxx) jadi E.164 (+628xxxxxxxxxx) untuk Twilio. */
export function toE164Indonesia(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.startsWith('62')) return `+${digits}`
  if (digits.startsWith('0')) return `+62${digits.slice(1)}`
  // Nomor tanpa awalan 0 atau 62 (mis. diketik "8956013584493" langsung) — tetap anggap
  // nomor Indonesia, bukan asal ditempel "+" di depan digit apa adanya.
  return `+62${digits}`
}
