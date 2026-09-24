import { beforeAll, afterAll, afterEach } from 'vitest'
import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'

/**
 * Panggil di awal file test yang butuh database sungguhan (in-memory).
 * File test yang cuma menguji fungsi murni (tanpa DB) tidak perlu memanggil ini sama sekali.
 */
export function useTestDatabase() {
  let mongod: MongoMemoryServer

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create()
    await mongoose.connect(mongod.getUri())
  })

  afterEach(async () => {
    const collections = mongoose.connection.collections
    for (const key of Object.keys(collections)) {
      await collections[key].deleteMany({})
    }
  })

  afterAll(async () => {
    await mongoose.disconnect()
    await mongod.stop()
  })
}
