import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Loader2 } from "lucide-react";
import { getAllFiles } from "../services/firestore";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "../components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../components/ui/dialog";
import { Badge } from "../components/ui/badge";

function formatDate(date) {
  if (!date) return "-";
  if (date.seconds) {
    return new Date(date.seconds * 1000).toLocaleString();
  }
  return date instanceof Date
    ? date.toLocaleString()
    : new Date(date).toLocaleString();
}

function getScanStatusDisplay(scanResult) {
  if (!scanResult) return "-";

  // Verificar que scanResult sea un string
  if (typeof scanResult !== "string") {
    console.warn("scanResult no es un string:", scanResult);
    return "-";
  }

  let infestados = 0;
  let sospechosos = 0;
  const infestadosMatch = scanResult.match(/Infestados:\s*(\d+)/);
  const sospechososMatch = scanResult.match(/Sospechoso:\s*(\d+)/);
  if (infestadosMatch) infestados = parseInt(infestadosMatch[1], 10);
  if (sospechososMatch) sospechosos = parseInt(sospechososMatch[1], 10);
  if (infestados > 0) {
    return <Badge variant="destructive">Malicioso</Badge>;
  } else if (sospechosos > 0) {
    return (
      <Badge
        variant="outline"
        className="bg-yellow-50 text-yellow-700 hover:bg-yellow-50"
      >
        Sospechoso
      </Badge>
    );
  } else if (infestados === 0 && sospechosos === 0) {
    return (
      <Badge
        variant="outline"
        className="bg-green-50 text-green-700 hover:bg-green-50"
      >
        Limpio
      </Badge>
    );
  }
  return "-";
}

function getVirusTotalStatusDisplay(vtResult) {
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
}

export default function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogItems, setDialogItems] = useState([]);
  const [dialogHash, setDialogHash] = useState("");
  // Estado para ordenamiento
  const [sortConfig, setSortConfig] = useState(() => {
    // Leer de localStorage si existe
    const saved = localStorage.getItem("historySortConfig");
    return saved ? JSON.parse(saved) : { key: "createdAt", direction: "desc" };
  });

  // Guardar sortConfig en localStorage cuando cambie
  useEffect(() => {
    localStorage.setItem("historySortConfig", JSON.stringify(sortConfig));
  }, [sortConfig]);

  useEffect(() => {
    async function fetchHistory() {
      setIsLoading(true);
      try {
        const files = await getAllFiles();
        setHistory(files);
      } catch (error) {
        setHistory([]);
      } finally {
        setIsLoading(false);
      }
    }
    fetchHistory();
  }, []);

  // Agrupar por hash
  const grouped = history.reduce((acc, item) => {
    const hash = item.hashes?.sha256 || "-";
    if (!acc[hash]) acc[hash] = [];
    acc[hash].push(item);
    return acc;
  }, {});

  const hashes = Object.keys(grouped);

  // Ordenar items dentro de cada hash
  function sortItems(items) {
    const { key, direction } = sortConfig;
    return [...items].sort((a, b) => {
      let aValue = a[key];
      let bValue = b[key];
      if (key === "createdAt") {
        aValue = aValue?.seconds
          ? aValue.seconds
          : new Date(aValue).getTime() / 1000;
        bValue = bValue?.seconds
          ? bValue.seconds
          : new Date(bValue).getTime() / 1000;
      } else if (key === "name") {
        aValue = aValue || "";
        bValue = bValue || "";
      }
      if (aValue < bValue) return direction === "asc" ? -1 : 1;
      if (aValue > bValue) return direction === "asc" ? 1 : -1;
      return 0;
    });
  }

  // Cambiar orden
  function handleSort(key) {
    setSortConfig((prev) => {
      if (prev.key === key) {
        // Cambia dirección
        return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
      }
      return { key, direction: "asc" };
    });
  }

  return (
    <Card className="w-full mx-auto overflow-x-auto">
      <CardHeader>
        <CardTitle>Historial de Análisis</CardTitle>
        <CardDescription>
          Consulta el historial de todos los archivos analizados por su hash
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0 sm:p-6">
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Cargando historial...</span>
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <Table className="min-w-[600px] text-xs md:text-sm">
              <TableHeader>
                <TableRow>
                  <TableHead className="break-all max-w-[180px] md:max-w-none">
                    Hash (SHA-256)
                  </TableHead>
                  {/* <TableHead>Cantidad de análisis</TableHead>
                  <TableHead>Acciones</TableHead> */}
                </TableRow>
              </TableHeader>
              <TableBody>
                {hashes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center">
                      No hay historial disponible
                    </TableCell>
                  </TableRow>
                ) : (
                  hashes.map((hash) => {
                    const items = grouped[hash];
                    if (items.length > 10) {
                      // Mostrar botón para dialog
                      return (
                        <TableRow key={hash}>
                          <TableCell className="font-mono text-xs break-all max-w-[180px] md:max-w-none">
                            {hash}
                          </TableCell>
                          <TableCell>{items.length}</TableCell>
                          <TableCell>
                            <button
                              className="underline text-blue-600"
                              onClick={() => {
                                setDialogItems(items);
                                setDialogHash(hash);
                                setDialogOpen(true);
                              }}
                            >
                              Ver historial
                            </button>
                          </TableCell>
                        </TableRow>
                      );
                    }
                    return (
                      <TableRow key={hash}>
                        <TableCell colSpan={3} className="p-0 border-0">
                          <Accordion type="single" collapsible>
                            <AccordionItem value={hash}>
                              <AccordionTrigger>
                                <div className="flex flex-col w-full">
                                  <span className="font-mono text-xs break-all max-w-[180px] md:max-w-none">
                                    {hash}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {items.length} análisis
                                  </span>
                                </div>
                              </AccordionTrigger>
                              <AccordionContent>
                                <div className="overflow-x-auto w-full">
                                  <Table className="min-w-[500px] text-xs md:text-sm">
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead className="cursor-pointer select-none">
                                          Nombre{" "}
                                          {sortConfig.key === "name"
                                            ? sortConfig.direction === "asc"
                                              ? "▲"
                                              : "▼"
                                            : null}
                                        </TableHead>
                                        <TableHead className="cursor-pointer select-none">
                                          Fecha{" "}
                                          {sortConfig.key === "createdAt"
                                            ? sortConfig.direction === "asc"
                                              ? "▲"
                                              : "▼"
                                            : null}
                                        </TableHead>
                                        <TableHead>Segurmatica</TableHead>
                                        <TableHead>VirusTotal</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {sortItems(items).map((item, idx) => (
                                        <TableRow key={item.createdAt + idx}>
                                          <TableCell className="break-all max-w-[120px] md:max-w-none">
                                            {item.name || "-"}
                                          </TableCell>
                                          <TableCell>
                                            {formatDate(item.createdAt)}
                                          </TableCell>
                                          <TableCell>
                                            {getScanStatusDisplay(
                                              item.scanResult
                                            )}
                                          </TableCell>
                                          <TableCell>
                                            {getVirusTotalStatusDisplay(
                                              item.virusTotalResult
                                            )}
                                          </TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          </Accordion>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogContent className="max-w-2xl w-full p-2 sm:p-6">
                <DialogHeader>
                  <DialogTitle>Historial para hash</DialogTitle>
                  <DialogDescription className="font-mono text-xs break-all">
                    {dialogHash}
                  </DialogDescription>
                </DialogHeader>
                <div className="overflow-x-auto max-h-[60vh] w-full">
                  <Table className="min-w-[500px] text-xs md:text-sm">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="cursor-pointer select-none">
                          Nombre{" "}
                          {sortConfig.key === "name"
                            ? sortConfig.direction === "asc"
                              ? "▲"
                              : "▼"
                            : null}
                        </TableHead>
                        <TableHead className="cursor-pointer select-none">
                          Fecha{" "}
                          {sortConfig.key === "createdAt"
                            ? sortConfig.direction === "asc"
                              ? "▲"
                              : "▼"
                            : null}
                        </TableHead>
                        <TableHead>Segurmatica</TableHead>
                        <TableHead>VirusTotal</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortItems(dialogItems).map((item, idx) => (
                        <TableRow key={item.createdAt + idx}>
                          <TableCell className="break-all max-w-[120px] md:max-w-none">
                            {item.name || "-"}
                          </TableCell>
                          <TableCell>{formatDate(item.createdAt)}</TableCell>
                          <TableCell>
                            {getScanStatusDisplay(item.scanResult)}
                          </TableCell>
                          <TableCell>
                            {getVirusTotalStatusDisplay(item.virusTotalResult)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <DialogFooter>
                  <button
                    className="btn w-full sm:w-auto"
                    onClick={() => setDialogOpen(false)}
                  >
                    Cerrar
                  </button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
