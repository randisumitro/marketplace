import { Schema, model } from 'mongoose'

const sessionSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    device: { type: String, required: true },
    ipAddress: { type: String, default: null },
    lastActiveAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
)

export const Session = model('Session', sessionSchema)
