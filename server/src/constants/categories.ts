// Daftar kategori kanonis — harus sama persis dengan client/src/lib/categories.ts
export const CATEGORIES = [
  'Fashion & Pakaian',
  'Elektronik',
  'Kecantikan & Perawatan',
  'Rumah & Dekorasi',
  'Hobi & Olahraga',
  'Makanan & Minuman',
  'Kesehatan',
] as const

export type Category = (typeof CATEGORIES)[number]
