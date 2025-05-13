// Clasificador de tipo de archivo por firma mágica (hexadecimal)
// Soporta: TEXTO, PE, ELF, DEX, PDF, JPEG, PNG, DESCONOCIDO

import JSZip from "jszip"

/**
 * Lee los primeros bytes de un archivo y determina su tipo real por firma mágica.
 * @param {File|Blob} file - Archivo a analizar
 * @returns {Promise<string>} - Tipo de archivo detectado
 */
export async function classifyFileByMagic(file) {
  // Lee los primeros 16 bytes (suficiente para la mayoría de firmas)
  const headerSize = 16
  const buffer = await file.slice(0, headerSize).arrayBuffer()
  const bytes = new Uint8Array(buffer)

  // Firmas mágicas conocidas
  const signatures = [
    { type: "PE", hex: ["4d5a"] }, // MZ (Windows PE: EXE, DLL)
    { type: "ELF", hex: ["7f454c46"] }, // \x7FELF
    { type: "DEX", hex: ["6465780a30333500"] }, // 'dex\n035\0'
    { type: "PDF", hex: ["25504446"] }, // %PDF
    { type: "JPEG", hex: ["ffd8ff"] }, // JPEG
    { type: "PNG", hex: ["89504e470d0a1a0a"] }, // PNG
    { type: "GIF", hex: ["474946383761", "474946383961"] }, // GIF87a, GIF89a
    { type: "BMP", hex: ["424d"] }, // BM
    { type: "TIFF", hex: ["49492a00", "4d4d002a"] }, // II*\0, MM\0*
    { type: "ZIP", hex: ["504b0304", "504b0506", "504b0708"] }, // ZIP, DOCX, XLSX, PPTX, ODT, ODS, ODP, EPUB, JAR, APK
    { type: "RAR", hex: ["526172211a0700", "526172211a070100"] }, // RAR
    { type: "7Z", hex: ["377abcaf271c"] }, // 7z
    { type: "MP3", hex: ["494433"] }, // ID3 (MP3)
    { type: "MP4", hex: ["0000001866747970", "0000002066747970", "66747970"] }, // MP4/MOV/QuickTime
    { type: "MOV", hex: ["00000014667479707174"] }, // MOV
    { type: "AVI", hex: ["52494646"] }, // RIFF....AVI
    { type: "WEBM", hex: ["1a45dfa3"] }, // WebM, Matroska
    { type: "OGG", hex: ["4f676753"] }, // Ogg
    { type: "WAV", hex: ["52494646"] }, // RIFF....WAVE (verificar subtipo)
    { type: "FLAC", hex: ["664c6143"] }, // fLaC
    { type: "ISO", hex: ["4344303031"] }, // CD001 (ISO9660)
    { type: "APK", hex: ["504b0304"] }, // APK (igual que ZIP)
    { type: "CLASS", hex: ["cafebabe"] }, // Java class
    {
      type: "MACHO",
      hex: ["feedface", "feedfacf", "cafebabe", "cefaedfe", "cffaedfe", "cafed00d"],
    }, // Mach-O
    { type: "GZ", hex: ["1f8b08"] }, // GZIP
    { type: "BZ2", hex: ["425a68"] }, // BZh
    { type: "TAR", hex: ["7573746172"] }, // ustar
    { type: "DOC", hex: ["d0cf11e0a1b11ae1"] }, // DOC, XLS, PPT (OLE2)
    { type: "XLS", hex: ["d0cf11e0a1b11ae1"] }, // igual que DOC
    { type: "PPT", hex: ["d0cf11e0a1b11ae1"] }, // igual que DOC
    { type: "DOCX", hex: ["504b0304"] }, // igual que ZIP
    { type: "XLSX", hex: ["504b0304"] }, // igual que ZIP
    { type: "PPTX", hex: ["504b0304"] }, // igual que ZIP
    { type: "ODT", hex: ["504b0304"] }, // igual que ZIP
    { type: "ODS", hex: ["504b0304"] }, // igual que ZIP
    { type: "ODP", hex: ["504b0304"] }, // igual que ZIP
    { type: "EPUB", hex: ["504b0304"] }, // igual que ZIP
  ]

  // Convierte los bytes leídos a string hexadecimal
  const hexHeader = [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("")

  // Busca coincidencia de firma
  for (const sig of signatures) {
    for (const h of sig.hex) {
      if (hexHeader.startsWith(h)) {
        // Diferenciación avanzada para PE (EXE, DLL, SYS, etc.)
        if (sig.type === "PE") {
          // Leer más bytes para analizar la cabecera PE
          const peHeaderSize = 4096 // suficiente para la mayoría de casos
          const peBuffer = await file.slice(0, peHeaderSize).arrayBuffer()
          const peBytes = new Uint8Array(peBuffer)
          // Offset a la cabecera PE (en 0x3C, little endian)
          const peOffset = peBytes[0x3c] | (peBytes[0x3d] << 8) | (peBytes[0x3e] << 16) | (peBytes[0x3f] << 24)
          // Verifica que haya suficiente buffer
          if (peOffset + 6 + 18 < peBytes.length) {
            // Debe haber 'PE\0\0' en el offset
            if (
              peBytes[peOffset] === 0x50 &&
              peBytes[peOffset + 1] === 0x45 &&
              peBytes[peOffset + 2] === 0x00 &&
              peBytes[peOffset + 3] === 0x00
            ) {
              // IMAGE_FILE_HEADER está justo después de 'PE\0\0'
              const characteristicsOffset = peOffset + 22
              const characteristics = peBytes[characteristicsOffset] | (peBytes[characteristicsOffset + 1] << 8)
              // 0x2000 = IMAGE_FILE_DLL
              if (characteristics & 0x2000) return "DLL"
              // 0x0002 = IMAGE_FILE_EXECUTABLE_IMAGE
              if (characteristics & 0x0002) return "EXE"
              // 0x1000 = SYSTEM (SYS)
              if (characteristics & 0x1000) return "SYS"
              return "PE"
            }
          }
          return "PE"
        }
        // Si es ZIP, analizar el contenido para diferenciar Office, ODF, EPUB, APK, JAR, etc.
        if (sig.type === "ZIP") {
          const zipBuffer = await file.arrayBuffer()
          const zip = await JSZip.loadAsync(zipBuffer)
          const files = Object.keys(zip.files)
          // Office Open XML
          if (files.some((f) => f.startsWith("word/"))) return "DOCX"
          if (files.some((f) => f.startsWith("xl/"))) return "XLSX"
          if (files.some((f) => f.startsWith("ppt/"))) return "PPTX"
          // ODF
          if (files.includes("mimetype")) {
            const mimetype = await zip.file("mimetype").async("string")
            if (mimetype === "application/vnd.oasis.opendocument.text") return "ODT"
            if (mimetype === "application/vnd.oasis.opendocument.spreadsheet") return "ODS"
            if (mimetype === "application/vnd.oasis.opendocument.presentation") return "ODP"
            if (mimetype === "application/epub+zip") return "EPUB"
          }
          // APK
          if (files.includes("AndroidManifest.xml")) return "APK"
          // JAR
          if (files.includes("META-INF/MANIFEST.MF")) return "JAR"
          // EPUB (algunos no tienen mimetype al inicio)
          if (files.includes("META-INF/container.xml")) return "EPUB"
          return "ZIP"
        }
        return sig.type
      }
    }
  }

  // Heurística para texto plano: todos los bytes son imprimibles o saltos de línea/tab
  if ([...bytes].every((b) => (b >= 32 && b <= 126) || b === 9 || b === 10 || b === 13)) {
    return "TEXTO"
  }

  return "DESCONOCIDO"
}
