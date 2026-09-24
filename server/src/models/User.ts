import { Schema, model, type InferSchemaType } from 'mongoose'

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: false }, // null for OAuth-only accounts
    // PENTING: tidak pakai default: null di sini. Index unique+sparse di bawah cuma
    // mengecualikan dokumen yang field-nya BENAR-BENAR TIDAK ADA — kalau field-nya ada
    // tapi nilainya null, tetap dianggap "ada" dan wajib unik, jadi dua akun tanpa
    // Google/toko/HP akan bentrok satu sama lain kalau defaultnya null.
    googleId: { type: String },
    role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
    phone: { type: String, trim: true },
    isPhoneVerified: { type: Boolean, default: false },
    // Field toko — hanya terisi untuk role 'admin' (pemilik toko)
    storeName: { type: String, default: null },
    storeSlug: { type: String },
    storeDescription: { type: String, default: '' },
    isVerified: { type: Boolean, default: false },
    wishlist: { type: [Schema.Types.ObjectId], ref: 'Product', default: [] },
    resetPasswordTokenHash: { type: String, default: null },
    resetPasswordExpires: { type: Date, default: null },
  },
  { timestamps: true },
)

userSchema.index({ phone: 1 }, { unique: true, sparse: true })
userSchema.index({ storeSlug: 1 }, { unique: true, sparse: true })
userSchema.index({ googleId: 1 }, { unique: true, sparse: true })

export type UserDocument = InferSchemaType<typeof userSchema>
export const User = model('User', userSchema)
