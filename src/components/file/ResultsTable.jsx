"use client"

import { useState } from "react"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "../ui/table"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog"
import { Label } from "../ui/label"
import { Pencil, Trash2, FileText, Search, X } from "lucide-react"
import { Badge } from "../ui/badge"
import * as LucideIcons from "lucide-react"
import { getFileTypeIcon } from "../../utils/file-classifier"
import { updateFile, deleteFile } from "../../services/firestore"

export default function ResultsTable({ data, onDataChange }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedFile, setSelectedFile] = useState(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)
  const [editReportNumber, setEditReportNumber] = useState("")
  const [editComment, setEditComment] = useState("")

  const filteredData = data.filter(
    (file) =>
      file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (file.reportNumber && file.reportNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (file.comment && file.comment.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (file.type && file.type.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  const handleEdit = (file) => {
    setSelectedFile(file)
    setEditReportNumber(file.reportNumber || "")
    setEditComment(file.comment || "")
    setIsEditDialogOpen(true)
  }

  const handleDelete = (file) => {
    setSelectedFile(file)
    setIsDeleteDialogOpen(true)
  }

  const handleViewDetails = (file) => {
    setSelectedFile(file)
    setIsDetailsDialogOpen(true)
  }

  const confirmDelete = async () => {
    try {
      await deleteFile(selectedFile.id)
      setIsDeleteDialogOpen(false)
      setSelectedFile(null)

      // Refresh data
      if (onDataChange) onDataChange()
    } catch (error) {
      console.error("Error deleting file:", error)
      // Aquí podrías mostrar un mensaje de error al usuario
    }
  }

  const confirmEdit = async () => {
    try {
      await updateFile(selectedFile.id, {
        reportNumber: editReportNumber,
        comment: editComment
      })
      setIsEditDialogOpen(false)
      setSelectedFile(null)

      // Refresh data
      if (onDataChange) onDataChange()
    } catch (error) {
      console.error("Error updating file:", error)
      // Aquí podrías mostrar un mensaje de error al usuario
    }
  }

  const getScanStatusDisplay = (scanResult) => {
    if (!scanResult) return "-"

    let infestados = 0
    let sospechosos = 0
    const infestadosMatch = scanResult.match(/Infestados:\s*(\d+)/)
    const sospechososMatch = scanResult.match(/Sospechoso:\s*(\d+)/)
    if (infestadosMatch) infestados = parseInt(infestadosMatch[1], 10)
    if (sospechososMatch) sospechosos = parseInt(sospechososMatch[1], 10)

    if (infestados > 0) {
      return <Badge variant="destructive">Malicioso</Badge>
    } else if (sospechosos > 0) {
      return (
        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 hover:bg-yellow-50">
          Sospechoso
        </Badge>
      )
    } else if (infestados === 0 && sospechosos === 0) {
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">
          Limpio
        </Badge>
      )
    }
    return "-"
  }

  const getVirusTotalStatusDisplay = (vtResult) => {
    if (!vtResult) return "-";

    let result = vtResult;
    if (typeof vtResult === "string") {
      try {
        result = JSON.parse(vtResult);
      } catch {
        return "-";
      }
    }

    if (result.stats) {
      const { malicioso, sospechoso, limpio } = result.stats;
      if (malicioso > 0) {
        return <Badge variant="destructive">Malicioso ({malicioso})</Badge>;
      } else if (sospechoso > 0) {
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 hover:bg-yellow-50">
            Sospechoso ({sospechoso})
          </Badge>
        );
      } else if (limpio > 0 || limpio == 0) {
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">
            Limpio ({limpio})
          </Badge>
        );
      }
    }

    return "-";
  };

  const getFileTypeIconComponent = (fileType) => {
    if (!fileType) return LucideIcons.FileIcon
    const iconName = getFileTypeIcon(fileType)
    return LucideIcons[iconName] || LucideIcons.FileIcon
  }

  const formatFileSize = (bytes) => {
    if (!bytes) return "-"
    const units = ["B", "KB", "MB", "GB", "TB"]
    let size = bytes
    let unitIndex = 0

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024
      unitIndex++
    }

    return `${size.toFixed(2)} ${units[unitIndex]}`
  }

  const formatDate = (date) => {
    if (!date) return "-"

    // Handle Firestore Timestamp objects
    if (date.seconds) {
      return new Date(date.seconds * 1000).toLocaleString()
    }

    // Handle Date objects and strings
    return date instanceof Date ? date.toLocaleString() : new Date(date).toLocaleString()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar archivos..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-9 w-9"
              onClick={() => setSearchTerm("")}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Limpiar búsqueda</span>
            </Button>
          )}
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableCaption className="pb-3">
            {filteredData.length === 0 ? "No se encontraron archivos" : `Mostrando ${filteredData.length} de ${data.length} archivos`}
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>SHA-256</TableHead>
              <TableHead>Tamaño</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Segurmatica</TableHead>
              <TableHead>VirusTotal</TableHead>
              <TableHead>Reporte #</TableHead>
              <TableHead>Comentario</TableHead>
              <TableHead className="w-[100px]">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length === 0 ? (
              <TableRow>
                
              </TableRow>
            ) : (
              filteredData.map((file) => {
                const FileTypeIcon = getFileTypeIconComponent(file.type)
                return (
                  <TableRow key={file.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <FileTypeIcon className="h-4 w-4 text-muted-foreground" />
                        <span>{file.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono text-xs">
                        {file.type || "Unknown"}
                      </Badge>
                    </TableCell>
                    <TableCell>{file.hashes?.sha256 || "-"}</TableCell>
                    <TableCell>{formatFileSize(file.size)}</TableCell>
                    <TableCell>{formatDate(file.date)}</TableCell>
                    <TableCell>{getScanStatusDisplay(file.scanResult)}</TableCell>
                    <TableCell>{getVirusTotalStatusDisplay(file.virusTotalResult)}</TableCell>
                    <TableCell>{file.reportNumber || "-"}</TableCell>
                    <TableCell>{file.comment || "-"}</TableCell>
                    
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleViewDetails(file)}
                          title="Ver detalles"
                        >
                          <FileText className="h-4 w-4" />
                          <span className="sr-only">Ver detalles</span>
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(file)} title="Editar">
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">Editar</span>
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(file)} title="Eliminar">
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Eliminar</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Eliminación</DialogTitle>
            <DialogDescription>
              ¿Estás seguro que deseas eliminar el archivo "{selectedFile?.name}"? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar información del archivo</DialogTitle>
            <DialogDescription>Actualiza el número de reporte y comentario para "{selectedFile?.name}".</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-report-number">Número de reporte</Label>
              <Input
                id="edit-report-number"
                value={editReportNumber}
                onChange={(e) => {
                  const value = e.target.value.toUpperCase()
                  if (/^[A-Z]{0,3}(-?[0-9]{0,5})?$/.test(value)) {
                    setEditReportNumber(value)
                  }
                }}
                placeholder="REP-12345"
              />
              <p className="text-xs text-muted-foreground">Formato: 3 letras, guion, 5 números</p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-comment">Comentario</Label>
              <Input
                id="edit-comment"
                value={editComment}
                onChange={(e) => setEditComment(e.target.value)}
                placeholder="Añade un comentario sobre este archivo"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={confirmEdit}>Guardar cambios</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* File Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Detalles del archivo</DialogTitle>
            <DialogDescription>Información detallada para "{selectedFile?.name}".</DialogDescription>
          </DialogHeader>
          {selectedFile && (
            <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium mb-1">Nombre de archivo</h3>
                  <p className="text-sm">{selectedFile.name}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium mb-1">Fecha</h3>
                  <p className="text-sm">{formatDate(selectedFile.date)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium mb-1">Tipo</h3>
                  <p className="text-sm">{selectedFile.type}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium mb-1">Tamaño</h3>
                  <p className="text-sm">{formatFileSize(selectedFile.size)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium mb-1">Número de reporte</h3>
                  <p className="text-sm">{selectedFile.reportNumber || "-"}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium mb-1">Comentario</h3>
                  <p className="text-sm">{selectedFile.comment || "-"}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium mb-1">SHA-256</h3>
                  <p className="text-sm">{selectedFile.hashes?.sha256 || "-"}</p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-1">Hashes del archivo</h3>
                <div className="bg-muted p-2 rounded-md text-xs font-mono">
                  <p>
                    <strong>MD5:</strong> {selectedFile.hashes?.md5}
                  </p>
                  <p>
                    <strong>SHA-1:</strong> {selectedFile.hashes?.sha1}
                  </p>
                  <p>
                    <strong>SHA-256:</strong> {selectedFile.hashes?.sha256}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-1">Resultado de escaneo Segurmatica</h3>
                <div className="bg-muted p-2 rounded-md text-xs font-mono whitespace-pre-wrap">
                  {selectedFile.scanResult || "No hay resultado de escaneo disponible"}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-1">Análisis de VirusTotal</h3>
                <div className="bg-muted p-2 rounded-md text-xs whitespace-pre-wrap">
                  {selectedFile.virusTotalResult && Array.isArray(selectedFile.virusTotalResult.malwareDetections) ? (
                    <div className="space-y-2">
                      <div>
                        <strong>Resumen:</strong>
                        <ul className="list-disc ml-5 font-mono">
                          <li>Fecha de escaneo: <span className="font-normal">{selectedFile.virusTotalResult.scanDate || "-"}</span></li>
                          <li>Total motores: <span className="font-normal">{selectedFile.virusTotalResult.totalEngines || "-"}</span></li>
                          <li>Malicioso: <span className="font-normal">{selectedFile.virusTotalResult.stats?.malicioso || 0}</span></li>
                          <li>Sospechoso: <span className="font-normal">{selectedFile.virusTotalResult.stats?.sospechoso || 0}</span></li>
                          <li>Limpio: <span className="font-normal">{selectedFile.virusTotalResult.stats?.limpio || 0}</span></li>
                        </ul>
                      </div>
                      {selectedFile.virusTotalResult.malwareDetections.length > 0 ? (
                        <div>
                          <strong>Detecciones de malware:</strong>
                          <ul className="list-disc ml-5 font-mono">
                            {selectedFile.virusTotalResult.malwareDetections.map((det, idx) => (
                              <li key={idx} className="break-all">
                                <span className="font-semibold ">{det.engine}:</span> <span className="text-red-700">{det.malware}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : (
                        <div>No se detectó malware por los motores.</div>
                      )}
                      <div>
                        <a href={selectedFile.virusTotalResult.permalink} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Ver en VirusTotal</a>
                      </div>
                    </div>
                  ) : (
                    selectedFile.virusTotalResult
                      ? <pre className="font-mono">{JSON.stringify(selectedFile.virusTotalResult, null, 2)}</pre>
                      : "No hay resultado de VirusTotal disponible"
                  )}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsDetailsDialogOpen(false)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
