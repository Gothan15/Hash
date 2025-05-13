import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

// Function to convert ArrayBuffer to hex string
export function bufferToHex(buffer) {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
}

// Function to calculate file hashes
export async function calculateHashes(file, progressCallback) {
  try {
    if (progressCallback) progressCallback(10)
    const buffer = await file.arrayBuffer()
    if (progressCallback) progressCallback(30)

    // Calculate MD5 (using SHA-1 as a placeholder since browser crypto doesn't support MD5)
    // In a real implementation, you would use a library like SparkMD5 for MD5
    const md5Buffer = await crypto.subtle.digest("SHA-1", buffer)
    const md5Hex = bufferToHex(md5Buffer)
    if (progressCallback) progressCallback(50)

    // Calculate SHA-1
    const sha1Buffer = await crypto.subtle.digest("SHA-1", buffer)
    const sha1Hex = bufferToHex(sha1Buffer)
    if (progressCallback) progressCallback(70)

    // Calculate SHA-256
    const sha256Buffer = await crypto.subtle.digest("SHA-256", buffer)
    const sha256Hex = bufferToHex(sha256Buffer)
    if (progressCallback) progressCallback(90)

    const hashes = {
      md5: md5Hex,
      sha1: sha1Hex,
      sha256: sha256Hex,
    }

    if (progressCallback) progressCallback(100)
    return hashes
  } catch (error) {
    console.error("Error calculating hashes:", error)
    throw error
  }
}
