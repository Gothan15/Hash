/**
 * Fetches file information from VirusTotal API
 * @param {string} hash - The file hash (SHA-256, SHA-1, or MD5)
 * @returns {Promise<Object>} - The VirusTotal analysis result
 */
export async function fetchFileInfo(hash) {
  try {
    const response = await fetch(`http://localhost:4000/api/file-info/${hash}`)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || response.statusText)
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching VirusTotal data:", error)
    throw error
  }
}
