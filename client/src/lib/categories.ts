// Harus sama persis dengan server/src/constants/categories.ts
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
