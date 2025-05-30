"use client";

import React, { useEffect } from "react";
import { useState, useRef } from "react";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
} from "../ui/table";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Label } from "../ui/label";
import { Checkbox } from "../ui/checkbox";
import {
  Pencil,
  Trash2,
  FileText,
  Search,
  X,
  RefreshCw,
  Check,
  CheckSquare,
  Download,
  UploadCloud,
} from "lucide-react";
import { Badge } from "../ui/badge";
import * as LucideIcons from "lucide-react";
import { getFileTypeIcon } from "../../utils/file-classifier";
import {
  updateFile,
  deleteFile,
  deleteMultipleFiles,
  saveFileData,
} from "../../services/firestore";
import { parseVirusTotalResult } from "../../services/virustotalParse";
import { parseSegurmaticaResult } from "../../services/segurmaticaParse";

export default function ResultsTable({ data, onDataChange }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isMultiDeleteDialogOpen, setIsMultiDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [editReportNumber, setEditReportNumber] = useState("");
  const [editComment, setEditComment] = useState("");
  const [sortColumn, setSortColumn] = useState(() => {
    return localStorage.getItem("sortColumn") || null;
  });
  const [sortDirection, setSortDirection] = useState(() => {
    return localStorage.getItem("sortDirection") || "asc";
  });
  const [progressMap, setProgressMap] = useState({});
  const progressTimers = useRef({});
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  useEffect(() => {
    localStorage.setItem("sortColumn", sortColumn || "");
    localStorage.setItem("sortDirection", sortDirection);
  }, [sortColumn, sortDirection]);

  // Filtrado de búsqueda
  const filteredData = data.filter(
    (file) =>
      file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (file.reportNumber &&
        file.reportNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (file.comment &&
        file.comment.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (file.type && file.type.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Resetea página cuando cambia filtro o datos
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, data]);

  // Reset selection when data changes
  useEffect(() => {
    setSelectedItems(new Set());
  }, [data]);

  // Ordenamiento
  const handleSort = (column) => {
    if (column === sortColumn) {
      const newDirection = sortDirection === "asc" ? "desc" : "asc";
      setSortDirection(newDirection);
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const sortedData = React.useMemo(() => {
    if (!sortColumn) return filteredData;
    return [...filteredData].sort((a, b) => {
      let aValue = a[sortColumn];
      let bValue = b[sortColumn];
      if (aValue === undefined || aValue === null) aValue = "";
      if (bValue === undefined || bValue === null) bValue = "";
      if (typeof aValue === "string") aValue = aValue.toLowerCase();
      if (typeof bValue === "string") bValue = bValue.toLowerCase();
      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortColumn, sortDirection]);

  // Paginación
  const totalPages = Math.ceil(sortedData.length / PAGE_SIZE);
  const paginatedData = React.useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return sortedData.slice(startIndex, startIndex + PAGE_SIZE);
  }, [sortedData, currentPage]);

  // Manejo de selección
  const isAllCurrentPageSelected =
    paginatedData.length > 0 &&
    paginatedData.every((item) => selectedItems.has(item.id));

  const hasSelection = selectedItems.size > 0;

  const toggleSelectAll = () => {
    if (isAllCurrentPageSelected) {
      // Deselect all items on current page
      const newSelected = new Set(selectedItems);
      paginatedData.forEach((item) => {
        newSelected.delete(item.id);
      });
      setSelectedItems(newSelected);
    } else {
      // Select all items on current page
      const newSelected = new Set(selectedItems);
      paginatedData.forEach((item) => {
        newSelected.add(item.id);
      });
      setSelectedItems(newSelected);
    }
  };

  const toggleSelectItem = (id) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedItems(newSelected);
  };

  // Acciones
  const handleViewDetails = (file) => {
    setSelectedFile(file);
    setIsDetailsDialogOpen(true);
  };

  const handleEdit = (file) => {
    setSelectedFile(file);
    setEditReportNumber(file.reportNumber || "");
    setEditComment(file.comment || "");
    setIsEditDialogOpen(true);
  };

  const handleDelete = (file) => {
    setSelectedFile(file);
    setIsDeleteDialogOpen(true);
  };

  const handleMultiDeleteClick = () => {
    if (selectedItems.size > 0) {
      setIsMultiDeleteDialogOpen(true);
    }
  };

  const handleRescan = async (file) => {
    // Iniciar barra de progreso
    setProgressMap((prev) => ({ ...prev, [file.id]: 0 }));
    let progress = 0;
    clearInterval(progressTimers.current[file.id]);
    progressTimers.current[file.id] = setInterval(() => {
      progress += Math.random() * 15 + 5;
      setProgressMap((prev) => ({
        ...prev,
        [file.id]: Math.min(progress, 95),
      }));
      if (progress >= 95) {
        clearInterval(progressTimers.current[file.id]);
      }
    }, 200);

    try {
      // Crear el nuevo objeto de archivo con la misma información pero fecha actual
      const newFileData = {
        name: file.name,
        date: new Date(), // Nueva fecha de reescaneo
        type: file.type,
        size: file.size,
        hashes: file.hashes,
        reportNumber: file.reportNumber,
        comment: file.comment,
        originalScanDate: file.date, // Guardamos la fecha del escaneo original
        scanResult: null, // Se actualizará después del escaneo
        virusTotalResult: null, // Se actualizará después del escaneo
      };

      // Crear formData para el archivo
      const formData = new FormData();
      const blob = new Blob([file], { type: file.type });
      formData.append("file", blob, file.name);

      // Escanear con Segurmatica
      const segResponse = await fetch(
        "https://172.22.67.71:3001/scan-segurmatica",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!segResponse.ok) {
        throw new Error("Error al escanear con Segurmatica");
      }

      const segData = await segResponse.json();
      const scanResult = segData.stdout || JSON.stringify(segData);
      newFileData.scanResult = scanResult;

      // Obtener resultados de VirusTotal
      const vtResponse = await fetch(
        `https://172.22.67.71:4000/api/file-info/${file.hashes.sha256}`
      );
      if (vtResponse.ok) {
        const vtData = await vtResponse.json();
        const parsedVTResult = parseVirusTotalResult(vtData);
        newFileData.virusTotalResult = parsedVTResult;
      }

      // Guardar el nuevo análisis en Firestore
      await saveFileData(newFileData);

      // Terminar barra de progreso
      clearInterval(progressTimers.current[file.id]);
      setProgressMap((prev) => ({ ...prev, [file.id]: 100 }));

      // Limpiar barra de progreso después de un segundo
      setTimeout(
        () =>
          setProgressMap((prev) => {
            const copy = { ...prev };
            delete copy[file.id];
            return copy;
          }),
        1000
      );

      // Refrescar datos
      if (onDataChange) onDataChange();
    } catch (error) {
      console.error("Error durante el reescaneo:", error);
      clearInterval(progressTimers.current[file.id]);
      setProgressMap((prev) => {
        const copy = { ...prev };
        delete copy[file.id];
        return copy;
      });
    }
  };

  const confirmDelete = async () => {
    if (selectedFile) {
      try {
        await deleteFile(selectedFile.id);
        setIsDeleteDialogOpen(false);
        onDataChange && onDataChange();
      } catch (error) {
        console.error("Error al eliminar el archivo:", error);
        // Opcionalmente, mostrar un mensaje de error al usuario aquí
      }
    }
  };

  const confirmMultiDelete = async () => {
    if (selectedItems.size > 0) {
      try {
        // Implementar función para eliminar múltiples archivos
        await deleteMultipleFiles([...selectedItems]);
        setIsMultiDeleteDialogOpen(false);
        setSelectedItems(new Set());
        onDataChange && onDataChange();
      } catch (error) {
        console.error("Error al eliminar archivos:", error);
        // Opcionalmente, mostrar un mensaje de error al usuario aquí
      }
    }
  };

  const confirmEdit = async () => {
    if (selectedFile) {
      const updated = {
        ...selectedFile,
        reportNumber: editReportNumber,
        comment: editComment,
      };
      try {
        await updateFile(selectedFile.id, updated);
        setIsEditDialogOpen(false);
        onDataChange && onDataChange();
      } catch (error) {
        console.error("Error al actualizar el archivo:", error);
        // Opcionalmente, mostrar un mensaje de error al usuario aquí
      }
    }
  };

  const getScanStatusDisplay = (scanResult) => {
    if (!scanResult) return "-";
    // Usamos el parse si viene como string
    const result =
      typeof scanResult === "object" && scanResult !== null && scanResult.status
        ? scanResult
        : parseSegurmaticaResult(scanResult);

    if (result && result.status) {
      if (result.status === "Infestado") {
        return <Badge variant="destructive">Malicioso</Badge>;
      } else if (result.status === "Sospecho") {
        return (
          <Badge
            variant="outline"
            className="bg-yellow-50 text-yellow-700 hover:bg-yellow-50"
          >
            Sospechoso
          </Badge>
        );
      } else if (result.status === "Limpio") {
        return (
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 hover:bg-green-50"
          >
            Limpio
          </Badge>
        );
      }
    }
    return "-";
  };

  const getVirusTotalStatusDisplay = (vtResult) => {
    if (!vtResult) return "-";
    let result = vtResult;

    // Si vtResult es un string, usar la función de parseo importada
    if (typeof vtResult === "string") {
      result = parseVirusTotalResult(vtResult);
      // Si el parseo falla o no devuelve un objeto esperado, retornar "-"
      if (!result || typeof result !== "object") {
        // Si parseVirusTotalResult puede devolver el string original en caso de error de parseo,
        // y queremos mostrar ese string, podríamos ajustar esta lógica.
        // Por ahora, asumimos que devuelve null o un objeto no válido si no puede parsear.
        console.warn(
          "Error al parsear resultado de VirusTotal o formato inesperado:",
          vtResult
        );
        return "-";
      }
    }

    // Asegurarse de que result sea un objeto y tenga la propiedad stats
    if (result && typeof result === "object" && result.stats) {
      const { malicioso, sospechoso, limpio } = result.stats;
      if (malicioso > 0) {
        return <Badge variant="destructive">Malicioso ({malicioso})</Badge>;
      } else if (sospechoso > 0) {
        return (
          <Badge
            variant="outline"
            className="bg-yellow-50 text-yellow-700 hover:bg-yellow-50"
          >
            Sospechoso ({sospechoso})
          </Badge>
        );
      } else if (limpio >= 0) {
        return (
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 hover:bg-green-50"
          >
            Limpio ({limpio})
          </Badge>
        );
      }
    }
    return "-";
  };

  const getFileTypeIconComponent = (fileType) => {
    if (!fileType) return LucideIcons.FileIcon;
    const iconName = getFileTypeIcon(fileType);
    return LucideIcons[iconName] || LucideIcons.FileIcon;
  };

  const formatFileSize = (size) => {
    if (!size && size !== 0) return "-";
    const units = ["B", "KB", "MB", "GB", "TB"];
    let unitIndex = 0;
    let s = size;
    while (s >= 1024 && unitIndex < units.length - 1) {
      s /= 1024;
      unitIndex++;
    }
    return `${s.toFixed(2)} ${units[unitIndex]}`;
  };

  const formatDate = (date) => {
    if (!date) return "-";
    // Manejar Timestamp de Firestore
    if (date.seconds) {
      return new Date(date.seconds * 1000).toLocaleString();
    }
    return date instanceof Date
      ? date.toLocaleString()
      : new Date(date).toLocaleString();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar archivos..."
            className="pl-10 pr-3 h-10"
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

        {/* Barra de herramientas para acciones */}
        <div className="flex gap-2 shrink-0">
          {hasSelection ? (
            <>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleMultiDeleteClick}
                className="flex items-center gap-1"
              >
                <Trash2 className="h-4 w-4" />
                <span className="hidden md:inline">Eliminar</span>
                <span className="inline md:hidden">({selectedItems.size})</span>
                <span className="hidden md:inline">
                  ({selectedItems.size} seleccionados)
                </span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedItems(new Set())}
              >
                <X className="h-4 w-4 mr-1" />
                <span>Cancelar</span>
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                title="Reanalizar selección"
                disabled={data.length === 0}
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Reanalizar</span>
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="overflow-x-auto rounded-md border">
        <Table className="w-full">
          <TableHeader>
            <TableRow className=" text-gray-900 dark:text-gray-100">
              <TableHead className="w-10 p-3 text-center">
                <Checkbox
                  checked={isAllCurrentPageSelected && paginatedData.length > 0}
                  indeterminate={
                    (hasSelection &&
                    !isAllCurrentPageSelected &&
                    paginatedData.some((item) => selectedItems.has(item.id)))
                      ? true
                      : undefined
                  }
                  onCheckedChange={toggleSelectAll}
                  disabled={paginatedData.length === 0}
                  aria-label="Seleccionar todo"
                />
              </TableHead>
              <TableHead className="py-4 px-6">
                <Button variant="ghost" onClick={() => handleSort("name")}>
                  Nombre{" "}
                  {sortColumn === "name" &&
                    (sortDirection === "asc" ? "▲" : "▼")}
                </Button>
              </TableHead>
              <TableHead className="hidden sm:table-cell py-4 px-6">
                <Button variant="ghost" onClick={() => handleSort("type")}>
                  Tipo{" "}
                  {sortColumn === "type" &&
                    (sortDirection === "asc" ? "▲" : "▼")}
                </Button>
              </TableHead>
              <TableHead className="hidden lg:table-cell py-4 px-6">
                SHA-256
              </TableHead>
              <TableHead className="hidden sm:table-cell py-4 px-6">
                <Button variant="ghost" onClick={() => handleSort("size")}>
                  Tamaño{" "}
                  {sortColumn === "size" &&
                    (sortDirection === "asc" ? "▲" : "▼")}
                </Button>
              </TableHead>
              <TableHead className="hidden sm:table-cell py-4 px-6">
                <Button variant="ghost" onClick={() => handleSort("date")}>
                  Fecha{" "}
                  {sortColumn === "date" &&
                    (sortDirection === "asc" ? "▲" : "▼")}
                </Button>
              </TableHead>
              <TableHead className="hidden md:table-cell py-4 px-6">
                Segurmatica
              </TableHead>
              <TableHead className="hidden md:table-cell py-4 px-6">
                VirusTotal
              </TableHead>
              <TableHead className="hidden lg:table-cell py-4 px-6">
                <Button
                  variant="ghost"
                  onClick={() => handleSort("reportNumber")}
                >
                  Reporte #{" "}
                  {sortColumn === "reportNumber" &&
                    (sortDirection === "asc" ? "▲" : "▼")}
                </Button>
              </TableHead>
              <TableHead className="hidden lg:table-cell py-4 px-6">
                <Button variant="ghost" onClick={() => handleSort("comment")}>
                  Comentario{" "}
                  {sortColumn === "comment" &&
                    (sortDirection === "asc" ? "▲" : "▼")}
                </Button>
              </TableHead>
              <TableHead className="py-4 px-6 text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length === 0 ? (
              <TableRow>
                <TableCell className="text-center py-4" colSpan={11}>
                  No se encontraron archivos
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((file) => {
                const FileTypeIcon = getFileTypeIconComponent(file.type);
                const isSelected = selectedItems.has(file.id);
                return (
                  <TableRow
                    key={file.id}
                    className={`group hover:bg-muted/50 ${
                      isSelected ? "bg-primary/10" : "bg-background"
                    }`}
                  >
                    <TableCell className="p-3 text-center">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleSelectItem(file.id)}
                        aria-label={`Seleccionar ${file.name}`}
                      />
                    </TableCell>
                    <TableCell className="font-medium py-4 px-6">
                      <div className="flex items-center gap-2">
                        <FileTypeIcon className="h-4 w-4 text-muted-foreground" />
                        <span>{file.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell py-4 px-6">
                      <Badge variant="outline" className="font-mono text-xs">
                        {file.type || "Unknown"}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell py-4 px-6">
                      {file.hashes?.sha256 || "-"}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell py-4 px-6">
                      {formatFileSize(file.size)}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell py-4 px-6">
                      {formatDate(file.date)}
                    </TableCell>
                    <TableCell className="hidden md:table-cell py-4 px-6">
                      {getScanStatusDisplay(file.scanResult)}
                    </TableCell>
                    <TableCell className="hidden md:table-cell py-4 px-6">
                      {getVirusTotalStatusDisplay(file.virusTotalResult)}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell py-4 px-6">
                      {file.reportNumber || "-"}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell py-4 px-6">
                      {file.comment || "-"}
                    </TableCell>
                    <TableCell className="py-4 px-6 text-right">
                      <div
                        className={`flex justify-end items-center gap-2 ${
                          isSelected
                            ? "opacity-100"
                            : "opacity-0 group-hover:opacity-100"
                        } transition-opacity`}
                      >
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleViewDetails(file)}
                          title="Ver detalles"
                        >
                          <FileText className="h-4 w-4" />
                          <span className="sr-only">Ver detalles</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(file)}
                          title="Editar"
                        >
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">Editar</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(file)}
                          title="Eliminar"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Eliminar</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          title="Reanalizar"
                          disabled={progressMap[file.id] !== undefined}
                          onClick={() => handleRescan(file)}
                        >
                          <LucideIcons.RefreshCw
                            className={
                              progressMap[file.id] !== undefined
                                ? "animate-spin h-4 w-4"
                                : "h-4 w-4"
                            }
                          />
                          <span className="sr-only">Reanalizar</span>
                        </Button>
                        {progressMap[file.id] !== undefined && (
                          <div className="relative w-24 h-2 bg-gray-200 rounded overflow-hidden ml-2">
                            <div
                              className="absolute left-0 top-0 h-full bg-primary transition-all"
                              style={{ width: `${progressMap[file.id]}%` }}
                            />
                          </div>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex flex-wrap justify-center items-center gap-2 py-4">
          <Button
            variant="ghost"
            size="sm"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            {"<"}
          </Button>
          {Array.from({ length: totalPages }, (_, i) => (
            <Button
              key={i + 1}
              variant={currentPage === i + 1 ? "default" : "outline"}
              size="sm"
              onClick={() => setCurrentPage(i + 1)}
              style={{ minWidth: 32 }}
            >
              {i + 1}
            </Button>
          ))}
          <Button
            variant="ghost"
            size="sm"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            {">"}
          </Button>
        </div>
      )}

      {/* Status bar with selection info */}
      {hasSelection && (
        <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded-md text-sm text-primary flex items-center justify-between">
          <div>
            <CheckSquare className="h-4 w-4 inline-block mr-2" />
            <span>
              {selectedItems.size}{" "}
              {selectedItems.size === 1
                ? "archivo seleccionado"
                : "archivos seleccionados"}
            </span>
          </div>
        </div>
      )}

      {/* Diálogo de confirmación de eliminación individual */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Eliminación</DialogTitle>
            <DialogDescription>
              ¿Estás seguro que deseas eliminar el archivo "{selectedFile?.name}
              "? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de confirmación de eliminación múltiple */}
      <Dialog
        open={isMultiDeleteDialogOpen}
        onOpenChange={setIsMultiDeleteDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Eliminación Múltiple</DialogTitle>
            <DialogDescription>
              ¿Estás seguro que deseas eliminar {selectedItems.size}{" "}
              {selectedItems.size === 1 ? "archivo" : "archivos"}? Esta acción
              no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsMultiDeleteDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmMultiDelete}>
              Eliminar {selectedItems.size}{" "}
              {selectedItems.size === 1 ? "archivo" : "archivos"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de edición */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar información del archivo</DialogTitle>
            <DialogDescription>
              Actualiza el número de reporte y comentario para "
              {selectedFile?.name}".
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-report-number">Número de reporte</Label>
              <Input
                id="edit-report-number"
                value={editReportNumber}
                onChange={(e) => {
                  const value = e.target.value.toUpperCase();
                  if (/^[A-Z]{0,3}(-?[0-9]{0,5})?$/.test(value)) {
                    setEditReportNumber(value);
                  }
                }}
                placeholder="REP-12345"
              />
              <p className="text-xs text-muted-foreground">
                Formato: 3 letras, guion, 5 números
              </p>
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
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button onClick={confirmEdit}>Guardar cambios</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de detalles del archivo */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Detalles del archivo</DialogTitle>
            <DialogDescription>
              Información detallada para "{selectedFile?.name}".
            </DialogDescription>
          </DialogHeader>
          {selectedFile && (
            <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium mb-1">
                    Nombre de archivo
                  </h3>
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
                  <h3 className="text-sm font-medium mb-1">
                    Número de reporte
                  </h3>
                  <p className="text-sm">{selectedFile.reportNumber || "-"}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium mb-1">Comentario</h3>
                  <p className="text-sm">{selectedFile.comment || "-"}</p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-1">Hashes del archivo</h3>
                <div className="bg-muted p-2 rounded-md text-xs font-mono">
                  <p>
                    <strong>MD5:</strong> {selectedFile.hashes?.md5 || "-"}
                  </p>
                  <p>
                    <strong>SHA-1:</strong> {selectedFile.hashes?.sha1 || "-"}
                  </p>
                  <p>
                    <strong>SHA-256:</strong>{" "}
                    {selectedFile.hashes?.sha256 || "-"}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-1">
                  Resultado de escaneo Segurmatica
                </h3>
                <div className="bg-muted p-2 rounded-md text-xs font-mono whitespace-pre-wrap">
                  {(() => {
                    const scan = selectedFile.scanResult;
                    if (!scan) return "No hay resultado de escaneo disponible";
                    let parsed = scan;
                    if (typeof scan === "string") {
                      try {
                        parsed = parseSegurmaticaResult(scan);
                      } catch {
                        return <pre>{scan}</pre>;
                      }
                    }
                    if (
                      typeof parsed === "object" &&
                      parsed !== null &&
                      parsed.resumen
                    ) {
                      return (
                        <div className="space-y-1">
                          <div>
                            <strong>Resumen:</strong>
                            <ul className="list-disc ml-5 font-mono">
                              <li>
                                Fecha de escaneo:{" "}
                                <span className="font-normal">
                                  {parsed.resumen.fechaEscaneo || "-"}
                                </span>
                              </li>
                            </ul>
                          </div>
                          <div>
                            <strong>Resultados:</strong>
                            <ul className="list-disc ml-5 font-mono">
                              <li>
                                Total archivos:{" "}
                                <span className="font-normal">
                                  {parsed.resultados.totalArchivos}
                                </span>
                              </li>
                              <li>
                                Infestados:{" "}
                                <span className="font-normal">
                                  {parsed.resultados.infestados}
                                </span>
                              </li>
                              <li>
                                Sospechosos:{" "}
                                <span className="font-normal">
                                  {parsed.resultados.sospechosos}
                                </span>
                              </li>
                              <li>
                                Limpios:{" "}
                                <span className="font-normal">
                                  {parsed.resultados.limpios}
                                </span>
                              </li>
                              <li>
                                Descontaminados:{" "}
                                <span className="font-normal">
                                  {parsed.resultados.descontaminados}
                                </span>
                              </li>
                              <li>
                                En cuarentena:{" "}
                                <span className="font-normal">
                                  {parsed.resultados.enCuarentena}
                                </span>
                              </li>
                            </ul>
                          </div>
                          {parsed.detecciones &&
                            parsed.detecciones.length > 0 && (
                              <div>
                                <strong>Detecciones:</strong>
                                <ul className="list-disc ml-5 font-mono">
                                  {parsed.detecciones.map((det, idx) => (
                                    <li key={idx}>
                                      <span className="font-semibold">
                                        {det.motor}:
                                      </span>{" "}
                                      <span className="text-red-700">
                                        {det.malware}
                                      </span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          <div>
                            <strong>Estado:</strong>{" "}
                            <span className="font-normal">{parsed.status}</span>
                          </div>
                        </div>
                      );
                    }
                    // Si no es objeto, mostrar JSON o texto plano
                    return (
                      <pre className="whitespace-pre-wrap">
                        {typeof scan === "string"
                          ? scan
                          : JSON.stringify(scan, null, 2)}
                      </pre>
                    );
                  })()}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-1">
                  Análisis de VirusTotal
                </h3>
                <div className="bg-muted p-2 rounded-md text-xs whitespace-pre-wrap">
                  {selectedFile.virusTotalResult &&
                  Array.isArray(
                    selectedFile.virusTotalResult.malwareDetections
                  ) ? (
                    <div className="space-y-2">
                      <div>
                        <strong>Resumen:</strong>
                        <ul className="list-disc ml-5 font-mono">
                          <li>
                            Fecha de escaneo:{" "}
                            <span className="font-normal">
                              {selectedFile.virusTotalResult.scanDate || "-"}
                            </span>
                          </li>
                          <li>
                            Total motores:{" "}
                            <span className="font-normal">
                              {selectedFile.virusTotalResult.totalEngines ||
                                "-"}
                            </span>
                          </li>
                          <li>
                            Malicioso:{" "}
                            <span className="font-normal">
                              {selectedFile.virusTotalResult.stats?.malicioso ||
                                0}
                            </span>
                          </li>
                          <li>
                            Sospechoso:{" "}
                            <span className="font-normal">
                              {selectedFile.virusTotalResult.stats
                                ?.sospechoso || 0}
                            </span>
                          </li>
                          <li>
                            Limpio:{" "}
                            <span className="font-normal">
                              {selectedFile.virusTotalResult.stats?.limpio || 0}
                            </span>
                          </li>
                        </ul>
                      </div>
                      {selectedFile.virusTotalResult.malwareDetections.length >
                      0 ? (
                        <div>
                          <strong>Detecciones de malware:</strong>
                          <ul className="list-disc ml-5 font-mono">
                            {selectedFile.virusTotalResult.malwareDetections.map(
                              (det, idx) => (
                                <li key={idx} className="break-all">
                                  <span className="font-semibold">
                                    {det.engine}:
                                  </span>{" "}
                                  <span className="text-red-700">
                                    {det.malware}
                                  </span>
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                      ) : (
                        <div>No se detectó malware por los motores.</div>
                      )}
                      <div>
                        <a
                          href={selectedFile.virusTotalResult.permalink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 underline"
                        >
                          Ver en VirusTotal
                        </a>
                      </div>
                    </div>
                  ) : selectedFile.virusTotalResult ? (
                    <pre className="font-mono">
                      {JSON.stringify(selectedFile.virusTotalResult, null, 2)}
                    </pre>
                  ) : (
                    "No hay resultado de VirusTotal disponible"
                  )}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsDetailsDialogOpen(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
