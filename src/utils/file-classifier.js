// Importing the file type classifier
import { classifyFileByMagic } from "./file-type-magic"

/**
 * Classifies a file and returns its type
 * @param {File} file - The file to classify
 * @returns {Promise<string>} - The detected file type
 */
export async function classifyFile(file) {
  try {
    const fileType = await classifyFileByMagic(file)
    return fileType
  } catch (error) {
    console.error("Error classifying file:", error)
    return "UNKNOWN"
  }
}

/**
 * Gets an icon based on file type
 * @param {string} fileType - The file type
 * @returns {string} - Icon name from Lucide icons
 */
export function getFileTypeIcon(fileType) {
  const typeMap = {
    TEXTO: "FileText",
    PE: "FileCode",
    EXE: "FileCode",
    DLL: "FileCode",
    SYS: "FileCode",
    ELF: "FileCode",
    DEX: "FileCode",
    PDF: "FilePdf",
    JPEG: "FileImage",
    PNG: "FileImage",
    GIF: "FileImage",
    BMP: "FileImage",
    TIFF: "FileImage",
    ZIP: "FileArchive",
    RAR: "FileArchive",
    "7Z": "FileArchive",
    MP3: "FileAudio",
    MP4: "FileVideo",
    MOV: "FileVideo",
    AVI: "FileVideo",
    WEBM: "FileVideo",
    OGG: "FileAudio",
    WAV: "FileAudio",
    FLAC: "FileAudio",
    ISO: "FileArchive",
    APK: "FileArchive",
    CLASS: "FileCode",
    MACHO: "FileCode",
    GZ: "FileArchive",
    BZ2: "FileArchive",
    TAR: "FileArchive",
    DOC: "FileText",
    XLS: "FileSpreadsheet",
    PPT: "FilePresentation",
    DOCX: "FileText",
    XLSX: "FileSpreadsheet",
    PPTX: "FilePresentation",
    ODT: "FileText",
    ODS: "FileSpreadsheet",
    ODP: "FilePresentation",
    EPUB: "FileText",
    DESCONOCIDO: "File",
    UNKNOWN: "File",
  }

  return typeMap[fileType] || "File"
}
