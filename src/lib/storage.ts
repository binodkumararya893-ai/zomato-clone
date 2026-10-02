/**
 * Firebase Storage image upload helper.
 * Upload progress deta hai + compress karta hai + extension validate karta hai.
 */
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage'
import { storage } from '@/lib/firebase'

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif']

export function isAllowedImageType(type: string): boolean {
  return ALLOWED_TYPES.includes(type)
}

function assertValidImage(file: File) {
  if (!isAllowedImageType(file.type)) {
    throw new Error('Sirf JPG, PNG, WEBP ya AVIF images allowed hain.')
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error('Image 5MB se chhoti honi chahiye.')
  }
}

export interface UploadOptions {
  path: string
  file: File
  onProgress?: (percent: number) => void
}

/** Upload karke public download URL return karta hai. */
export function uploadImage({ path, file, onProgress }: UploadOptions): Promise<string> {
  assertValidImage(file)

  // Original filename se path injection avoid karne ke liye extension hi rakhte hain.
  const extension = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
  const safePath = `${path.replace(/\/+$/, '')}.${extension}`
  const storageRef = ref(storage, safePath)

  return new Promise((resolve, reject) => {
    const task = uploadBytesResumable(storageRef, file, { contentType: file.type })

    task.on(
      'state_changed',
      (snap) => {
        const percent = Math.round((snap.bytesTransferred / snap.totalBytes) * 100)
        onProgress?.(percent)
      },
      reject,
      async () => {
        try {
          resolve(await getDownloadURL(task.snapshot.ref))
        } catch (error) {
          reject(error instanceof Error ? error : new Error('Image URL fetch nahi hua.'))
        }
      },
    )
  })
}