interface PasswordCheckResult {
  valid: boolean
  error?: string
}

export function validatePassword(password: string): PasswordCheckResult {
  if (!password || password.length < 8) {
    return { valid: false, error: 'Password minimal 8 karakter' }
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, error: 'Password harus mengandung huruf kecil' }
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, error: 'Password harus mengandung huruf besar' }
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, error: 'Password harus mengandung angka' }
  }
  return { valid: true }
}
