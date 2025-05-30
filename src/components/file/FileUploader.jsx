"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Progress } from "../ui/progress"
import { Card, CardContent } from "../ui/card"
import { UploadCloud, X, AlertCircle, CheckCircle2 } from "lucide-react"
import { Separator } from "../ui/separator"
import { Alert, AlertDescription, AlertTitle } from "../ui/alert"
import SegurmaticaScan from "./SegurmaticaScan"
import VirusTotalScan from "./VirusTotalScan"
import { calculateHashes } from "../../utils/file-utils"
import { classifyFile, getFileTypeIcon } from "../../utils/file-classifier"
import { checkFileExists, saveFileData } from "../../services/firestore"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip"
import { Switch } from "../ui/switch"
import * as LucideIcons from "lucide-react"

export default function FileUploader({ onProcessed }) {
  const [uniqueFileId, setUniqueFileId] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null)
  const [reportNumber, setReportNumber] = useState("")
  const [comment, setComment] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState(null)
  const [segurmaticaResult, setSegurmaticaResult] = useState(null)
  const [virusTotalResult, setVirusTotalResult] = useState(null)
  const [fileHashes, setFileHashes] = useState(null)
  const [progress, setProgress] = useState(0)
  const [fileType, setFileType] = useState(null)
  const [existingFile, setExistingFile] = useState(null)
  const [isCheckingHash, setIsCheckingHash] = useState(false)
  const [checkHashEnabled, setCheckHashEnabled] = useState(true)

  const handleFileChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setSelectedFile(file)
      resetState()
      // NO calcular hashes aquí automáticamente
      // Classify file type
      const detectedType = await classifyFile(file)
      setFileType(detectedType)
    }
  }

  const handleDrop = async (e) => {
    e.preventDefault()
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      setSelectedFile(file)
      resetState()
      // NO calcular hashes aquí automáticamente
      // Classify file type
      const detectedType = await classifyFile(file)
      setFileType(detectedType)
    }
  }

  const resetState = () => {
    setSegurmaticaResult(null)
    setVirusTotalResult(null)
    setFileHashes(null)
    setFileType(null)
    setError(null)
    setProgress(0)
    setExistingFile(null)
    setIsCheckingHash(false)
    setUniqueFileId(null);
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  const handleRemoveFile = () => {
    setSelectedFile(null)
    resetState()
  }

  const computeFileHashes = async (file) => {
    try {
      setProgress(10)
      const hashes = await calculateHashes(file, (progressValue) => {
        setProgress(progressValue)
      })
      setFileHashes(hashes)
      setProgress(100)
      return hashes
    } catch (error) {
      setError("Error al calcular los hashes del archivo: " + error.message)
      throw error
    }
  }

  const checkExistingFile = async (hash) => {
    try {
      setIsCheckingHash(true)
      const { exists, data } = await checkFileExists(hash)

      if (exists) {
        setExistingFile(data)
        return true
      }

      return false
    } catch (error) {
      console.error("Error al verificar la existencia del archivo:", error)
      return false
    } finally {
      setIsCheckingHash(false)
    }
  }

  const handleProcessFile = async () => {
    if (!selectedFile) return;
    if (!fileHashes || !fileHashes.sha256) {
      setError("Debes calcular los hashes antes de procesar el archivo.");
      return;
    }
    setIsProcessing(true);
    setError(null);
    try {
      // Calculate hashes if not already done
      const hashes = fileHashes || (await computeFileHashes(selectedFile))

      // Create file data object
      const fileData = {
        name: selectedFile.name,
        date: new Date(),
        type: fileType || selectedFile.type || "Desconocido",
        size: selectedFile.size,
        hashes: hashes,
        reportNumber: reportNumber.trim() || null,
        comment: comment.trim() || null,
        scanResult: segurmaticaResult,
        virusTotalResult: virusTotalResult,
      }

      // Save to Firestore
      const fileId = await saveFileData(fileData)

      // Update the ID in the file data
      fileData.id = fileId

      // Call the onProcessed callback with the file data
      onProcessed(fileData)

      // Reset form
      setReportNumber("")
      setComment("")
      setSelectedFile(null)
      resetState()
    } catch (err) {
      setError(`Error al procesar el archivo: ${err.message}`)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleSegurmaticaResult = (result) => {
    setSegurmaticaResult(result)
  }

  const handleVirusTotalResult = (result) => {
    setVirusTotalResult(result)
  }

  // Check for existing file when hashes are calculated
  useEffect(() => {
    if (fileHashes && fileHashes.sha256 && checkHashEnabled) {
      checkExistingFile(fileHashes.sha256)
    }
  }, [fileHashes, checkHashEnabled])

  // Get the appropriate icon component based on file type
  const getFileIconComponent = () => {
    if (!fileType) return LucideIcons.File
    const iconName = getFileTypeIcon(fileType)
    return LucideIcons[iconName] || LucideIcons.File
  }

  const FileTypeIcon = getFileIconComponent()

  // Memoizar el objeto fileWithHashes para evitar recrearlo en cada render y provocar bucles
  const fileWithHashes = useMemo(() => {
    if (selectedFile && fileHashes) {
      try {
        const f = new File([selectedFile], selectedFile.name, { type: selectedFile.type });
        f.hashes = fileHashes;
        return f;
      } catch (e) {
        const fallback = selectedFile;
        fallback.hashes = fileHashes;
        return fallback;
      }
    }
    return selectedFile;
  }, [selectedFile, fileHashes]);

  return (
    <div className="space-y-6">
      {/* File Upload Area */}
      {!selectedFile ? (
        <div
          className="border-2 border-dashed rounded-lg p-10 text-center cursor-pointer hover:bg-muted/50 transition-colors"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => document.getElementById("file-upload")?.click()}
        >
          <UploadCloud className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">Arrastra y suelta tu archivo aquí</h3>
          <p className="text-sm text-muted-foreground mb-4">o haz clic para buscar tus archivos</p>
          <Input id="file-upload" type="file" className="hidden" onChange={handleFileChange} />
          <Button variant="outline">Seleccionar archivo</Button>
        </div>
      ) : (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded-md">
                  <FileTypeIcon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium truncate max-w-[200px] sm:max-w-[300px] md:max-w-[400px]">
                      {selectedFile.name}
                    </p>
                    {fileType && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-1 text-xs font-medium">
                              {fileType}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Tipo de archivo detectado</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={handleRemoveFile} className="text-muted-foreground">
                <X className="h-4 w-4" />
              </Button>
            </div>

            {progress > 0 && progress < 100 && <Progress value={progress} className="mt-4" />}

            {/* Existing file alert */}
            {existingFile && (
              <Alert className="mt-4 border-amber-500">
                <AlertCircle className="h-4 w-4 text-amber-500" />
                <AlertTitle className="text-amber-500">Archivo ya analizado</AlertTitle>
                <AlertDescription>
                  Este archivo ya fue analizado el{" "}
                  {existingFile.createdAt instanceof Date 
                    ? existingFile.createdAt.toLocaleString()
                    : new Date().toLocaleString()}. Puedes ver el análisis existente
                  en la pestaña de resultados.
                </AlertDescription>
              </Alert>
            )}

            {/* Calculate hashes button y switch de verificación */}
            {!fileHashes && !existingFile && (
              <>
                <div className="flex items-center gap-2 mt-4">
                  <Switch
                    id="check-hash-switch"
                    checked={checkHashEnabled}
                    onCheckedChange={setCheckHashEnabled}
                  />
                  <Label htmlFor="check-hash-switch" className="cursor-pointer select-none">
                    Verificar si el archivo ya existe antes de analizar
                  </Label>
                </div>
                <Button
                  className="mt-4 w-full"
                  onClick={() => computeFileHashes(selectedFile)}
                  disabled={(progress > 0 && progress < 100) || isCheckingHash}
                >
                  {isCheckingHash ? (
                    <>
                      <LucideIcons.Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verificando archivo...
                    </>
                  ) : (
                    "Calcular hashes del archivo"
                  )}
                </Button>
              </>
            )}

            {/* Display hashes if available */}
            {fileHashes && (
              <div className="mt-4 text-sm">
                <p>
                  <strong>MD5:</strong> {fileHashes.md5}
                </p>
                <p>
                  <strong>SHA-1:</strong> {fileHashes.sha1}
                </p>
                <p>
                  <strong>SHA-256:</strong> {fileHashes.sha256}
                </p>
              </div>
            )}

            {/* Segurmatica Scan */}
            {fileHashes && !existingFile && (
              <>
                <Separator className="my-4" />
                <div className="mb-4">
                  <h3 className="text-sm font-medium mb-2">Escaneo con Segurmatica</h3>
                  <SegurmaticaScan
                    file={fileWithHashes}
                    onResult={handleSegurmaticaResult}
                    onError={(err) => setError(err)}
                  />
                </div>
              </>
            )}

            {/* VirusTotal Scan */}
            {fileHashes && fileHashes.sha256 && !existingFile && (
              <>
                <Separator className="my-4" />
                <div className="mb-4">
                  <h3 className="text-sm font-medium mb-2">Análisis de VirusTotal</h3>
                  <VirusTotalScan
                    hash={fileHashes.sha256}
                    onResult={handleVirusTotalResult}
                    onError={(err) => setError(err)}
                  />
                </div>
              </>
            )}

            {/* Report Number and Comment */}
            {segurmaticaResult && !existingFile && (
              <>
                <Separator className="my-4" />
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="report-number">Número de reporte (opcional)</Label>
                    <Input
                      id="report-number"
                      value={reportNumber}
                      onChange={(e) => {
                        const value = e.target.value.toUpperCase()
                        if (/^[A-Z]{0,3}(-?[0-9]{0,5})?$/.test(value)) {
                          setReportNumber(value)
                        }
                      }}
                      placeholder="REP-12345"
                      className="mt-1"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Formato: 3 letras, guion, 5 números</p>
                  </div>

                  <div>
                    <Label htmlFor="comment">Comentario (opcional)</Label>
                    <Input
                      id="comment"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Agrega un comentario sobre este archivo"
                      className="mt-1"
                    />
                  </div>

                  <Button className="w-full" onClick={handleProcessFile} disabled={isProcessing || !segurmaticaResult}>
                    {isProcessing ? "Procesando..." : "Procesar archivo"}
                  </Button>
                </div>
              </>
            )}

            {/* View existing file button */}
            {existingFile && (
              <Button
                className="mt-4 w-full"
                variant="outline"
                onClick={() => {
                  onProcessed(existingFile)
                  setSelectedFile(null)
                  resetState()
                }}
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Ver análisis existente
              </Button>
            )}

            {/* Error message */}
            {error && <div className="mt-4 p-3 bg-destructive/10 text-destructive rounded-md text-sm">{error}</div>}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
