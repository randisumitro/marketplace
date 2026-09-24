import { cloudinary } from '../config/cloudinary.js'
import { isCloudinaryConfigured } from '../config/env.js'

export class ImageUploadError extends Error {}

export function uploadImageBuffer(buffer: Buffer): Promise<string> {
  if (!isCloudinaryConfigured) {
    return Promise.reject(
      new ImageUploadError(
        'Upload gambar belum aktif — kredensial Cloudinary belum diisi di server/.env (lihat README).',
      ),
    )
  }

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'oneshop/products', resource_type: 'image' },
      (error, result) => {
        if (error || !result) {
          reject(new ImageUploadError(error?.message ?? 'Gagal mengunggah gambar'))
          return
        }
        resolve(result.secure_url)
      },
    )
    stream.end(buffer)
  })
}

export async function uploadImageBuffers(buffers: Buffer[]): Promise<string[]> {
  return Promise.all(buffers.map(uploadImageBuffer))
}
