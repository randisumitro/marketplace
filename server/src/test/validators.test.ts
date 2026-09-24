import { describe, it, expect } from 'vitest'
import { validatePassword } from '../utils/passwordValidator.js'
import { parseUserAgent } from '../utils/parseUserAgent.js'

describe('validatePassword', () => {
  it('menolak password lebih pendek dari 8 karakter', () => {
    expect(validatePassword('Ab1').valid).toBe(false)
  })

  it('menolak password tanpa huruf besar', () => {
    expect(validatePassword('password123').valid).toBe(false)
  })

  it('menolak password tanpa huruf kecil', () => {
    expect(validatePassword('PASSWORD123').valid).toBe(false)
  })

  it('menolak password tanpa angka', () => {
    expect(validatePassword('PasswordSaja').valid).toBe(false)
  })

  it('menerima password yang memenuhi semua syarat', () => {
    expect(validatePassword('Password123').valid).toBe(true)
  })
})

describe('parseUserAgent', () => {
  it('mendeteksi Chrome di Windows', () => {
    const ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36'
    expect(parseUserAgent(ua)).toBe('Chrome di Windows')
  })

  it('mendeteksi Safari di macOS', () => {
    const ua = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15'
    expect(parseUserAgent(ua)).toBe('Safari di macOS')
  })

  it('mendeteksi Edge (bukan tertukar dengan Chrome)', () => {
    const ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36 Edg/120.0'
    expect(parseUserAgent(ua)).toBe('Edge di Windows')
  })

  it('mengembalikan label default kalau user-agent kosong', () => {
    expect(parseUserAgent(undefined)).toBe('Perangkat tidak dikenal')
  })
})
