import { describe, it, expect } from 'vitest'
import request from 'supertest'
import { createApp } from '../app.js'
import { useTestDatabase } from './dbSetup.js'

useTestDatabase()
const app = createApp()

describe('Auth', () => {
  it('mendaftarkan user baru dan mengembalikan token', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Budi Santoso',
      email: 'budi@example.com',
      password: 'Password123',
    })
    expect(res.status).toBe(201)
    expect(res.body.success).toBe(true)
    expect(res.body.token).toBeTruthy()
    expect(res.body.data.email).toBe('budi@example.com')
    expect(res.body.data.role).toBe('customer')
  })

  it('menolak password yang lemah', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Budi Santoso',
      email: 'budi2@example.com',
      password: 'weak',
    })
    expect(res.status).toBe(400)
    expect(res.body.success).toBe(false)
  })

  it('menolak email yang sudah terdaftar', async () => {
    await request(app).post('/api/auth/register').send({
      name: 'Budi Santoso',
      email: 'dup@example.com',
      password: 'Password123',
    })
    const res = await request(app).post('/api/auth/register').send({
      name: 'Budi Lain',
      email: 'dup@example.com',
      password: 'Password123',
    })
    expect(res.status).toBe(409)
  })

  it('berhasil login dengan kredensial benar', async () => {
    await request(app).post('/api/auth/register').send({
      name: 'Citra',
      email: 'citra@example.com',
      password: 'Password123',
    })
    const res = await request(app).post('/api/auth/login').send({
      email: 'citra@example.com',
      password: 'Password123',
    })
    expect(res.status).toBe(200)
    expect(res.body.token).toBeTruthy()
  })

  it('menolak login dengan password salah', async () => {
    await request(app).post('/api/auth/register').send({
      name: 'Dedi',
      email: 'dedi@example.com',
      password: 'Password123',
    })
    const res = await request(app).post('/api/auth/login').send({
      email: 'dedi@example.com',
      password: 'SalahPassword1',
    })
    expect(res.status).toBe(401)
  })

  it('menolak /me tanpa token', async () => {
    const res = await request(app).get('/api/auth/me')
    expect(res.status).toBe(401)
  })

  it('mengembalikan data user dengan token yang valid', async () => {
    const register = await request(app).post('/api/auth/register').send({
      name: 'Eka',
      email: 'eka@example.com',
      password: 'Password123',
    })
    const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${register.body.token}`)
    expect(res.status).toBe(200)
    expect(res.body.data.email).toBe('eka@example.com')
  })

  it('menolak request setelah sesi dicabut (logout)', async () => {
    const register = await request(app).post('/api/auth/register').send({
      name: 'Fajar',
      email: 'fajar@example.com',
      password: 'Password123',
    })
    const token = register.body.token as string

    await request(app).post('/api/auth/logout').set('Authorization', `Bearer ${token}`)

    const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(401)
  })

  const WINDOWS_CHROME_UA =
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36'
  const MAC_SAFARI_UA =
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15'

  it('login dari perangkat yang benar-benar berbeda menghasilkan sesi terpisah', async () => {
    await request(app).post('/api/auth/register').set('User-Agent', WINDOWS_CHROME_UA).send({
      name: 'Gita',
      email: 'gita@example.com',
      password: 'Password123',
    })
    const loginMac = await request(app)
      .post('/api/auth/login')
      .set('User-Agent', MAC_SAFARI_UA)
      .send({ email: 'gita@example.com', password: 'Password123' })

    const sessions = await request(app).get('/api/auth/sessions').set('Authorization', `Bearer ${loginMac.body.token}`)
    expect(sessions.status).toBe(200)
    // Register (Windows/Chrome) + login (Mac/Safari) = dua perangkat berbeda = dua sesi
    expect(sessions.body.data.length).toBe(2)
    expect(sessions.body.data.some((s: { device: string }) => s.device === 'Chrome di Windows')).toBe(true)
    expect(sessions.body.data.some((s: { device: string }) => s.device === 'Safari di macOS')).toBe(true)
  })

  it('login berulang dari perangkat yang SAMA tidak menambah sesi baru (dedup)', async () => {
    await request(app).post('/api/auth/register').set('User-Agent', WINDOWS_CHROME_UA).send({
      name: 'Hana',
      email: 'hana@example.com',
      password: 'Password123',
    })
    await request(app)
      .post('/api/auth/login')
      .set('User-Agent', WINDOWS_CHROME_UA)
      .send({ email: 'hana@example.com', password: 'Password123' })
    const loginKetiga = await request(app)
      .post('/api/auth/login')
      .set('User-Agent', WINDOWS_CHROME_UA)
      .send({ email: 'hana@example.com', password: 'Password123' })

    const sessions = await request(app).get('/api/auth/sessions').set('Authorization', `Bearer ${loginKetiga.body.token}`)
    expect(sessions.status).toBe(200)
    // Register + 2x login, semuanya dari perangkat yang sama = tetap 1 sesi, bukan 3
    expect(sessions.body.data.length).toBe(1)
  })
})
