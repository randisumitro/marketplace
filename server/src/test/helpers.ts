let counter = 0

/**
 * Nomor HP unik untuk kebutuhan test — dijamin selalu >= 10 digit dan tidak pernah
 * sama antar pemanggilan, walau dipanggil berkali-kali dalam satu file test.
 */
export function uniquePhone(): string {
  counter += 1
  return `0812${String(Date.now()).slice(-6)}${String(counter).padStart(4, '0')}`
}
