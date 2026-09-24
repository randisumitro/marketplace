/**
 * Perbaikan sekali-jalan untuk bug: index unik pada storeSlug/phone/googleId di koleksi
 * users kemungkinan dibuat sebelum opsi `sparse: true` ditambahkan ke skema, jadi index
 * yang SUNGGUHAN di database masih menganggap SEMUA dokumen (termasuk yang field-nya
 * kosong) harus unik satu sama lain — makanya akun kedua yang belum punya toko/HP/Google
 * gagal dibuat dengan error "E11000 duplicate key ... dup key: { storeSlug: null }".
 *
 * Jalankan SEKALI dari folder server: npx tsx scripts/fix-sparse-indexes.ts
 */
import mongoose from 'mongoose'
import { env } from '../src/config/env.js'

async function main() {
  console.log('Menghubungkan ke database...')
  await mongoose.connect(env.mongodbUri)
  const db = mongoose.connection.db
  if (!db) throw new Error('Koneksi database tidak tersedia')
  const users = db.collection('users')

  // 1. Hapus index lama kalau ternyata bukan sparse (index versi lama)
  // Koleksi users bisa saja belum pernah dibuat sama sekali (database baru/kosong) — itu
  // bukan masalah, cuma berarti tidak ada apa-apa yang perlu diperbaiki di sini.
  let existingIndexes: Awaited<ReturnType<typeof users.indexes>> = []
  try {
    existingIndexes = await users.indexes()
  } catch (err) {
    if (err instanceof Error && 'codeName' in err && err.codeName === 'NamespaceNotFound') {
      console.log('Koleksi "users" belum ada (database masih kosong) — tidak ada yang perlu diperbaiki.')
      console.log('Index yang benar akan otomatis terbuat begitu ada akun pertama yang mendaftar.')
      await mongoose.disconnect()
      return
    }
    throw err
  }

  for (const indexName of ['storeSlug_1', 'phone_1', 'googleId_1']) {
    const found = existingIndexes.find((idx) => idx.name === indexName)
    if (found && !found.sparse) {
      console.log(`Menghapus index lama yang belum sparse: ${indexName}`)
      await users.dropIndex(indexName)
    } else if (found) {
      console.log(`Index ${indexName} sudah sparse, tidak perlu diubah`)
    } else {
      console.log(`Index ${indexName} belum ada — akan dibuat otomatis saat server jalan`)
    }
  }

  // 2. Bersihkan dokumen lama yang terlanjur punya nilai null eksplisit (bukan benar-benar kosong)
  for (const field of ['storeSlug', 'phone', 'googleId']) {
    const result = await users.updateMany({ [field]: null }, { $unset: { [field]: '' } })
    console.log(`Field "${field}": ${result.modifiedCount} dokumen dibersihkan dari nilai null eksplisit`)
  }

  console.log('\nSelesai! Jalankan ulang "npm run dev" — index yang benar (sparse) akan otomatis dibuat ulang.')
  await mongoose.disconnect()
}

main().catch((err) => {
  console.error('Gagal menjalankan perbaikan:', err)
  process.exit(1)
})
