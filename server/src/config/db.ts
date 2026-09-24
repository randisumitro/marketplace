import mongoose from 'mongoose'
import { env } from './env.js'

export async function connectDB(): Promise<void> {
  mongoose.set('strictQuery', true)

  try {
    await mongoose.connect(env.mongodbUri)
    const { host, name } = mongoose.connection
    console.log(`✅ MongoDB terhubung — host: ${host}, database: ${name}`)
  } catch (error) {
    console.error('❌ Gagal konek ke MongoDB:', error)
    process.exit(1)
  }

  mongoose.connection.on('disconnected', () => {
    console.warn('⚠️  MongoDB terputus')
  })
}
