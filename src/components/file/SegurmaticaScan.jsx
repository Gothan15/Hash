"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "../ui/button";
import {
  Loader2,
  ShieldAlert,
  ShieldCheck,
  ShieldQuestion,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { parseSegurmaticaResult } from "../../services/segurmaticaParse";

export default function SegurmaticaScan({ file, onResult, onError }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [scanStatus, setScanStatus] = useState(null);

  const scanFile = useCallback(async () => {
    if (!file) return;

    setLoading(true);
    setResult(null);
    setError(null);
    setScanStatus(null);

    try {
      // Crear datos de formulario para la carga de archivos
      const formData = new FormData();
      formData.append("file", file);

      // Llamar al endpoint de la API de Segurmatica
      const response = await fetch("http://localhost:3001/scan-segurmatica", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || response.statusText);
      }

      const scanData = await response.json();
      const scanText = scanData.stdout || JSON.stringify(scanData);

      // Usar el parser para estructurar el resultado
      const parsedResult = parseSegurmaticaResult(scanText);
      setResult(parsedResult);
      setScanStatus(parsedResult.status || "unknown");
      onResult(parsedResult);
    } catch (err) {
      const errorMsg = `Error al escanear con Segurmatica: ${err.message}`;
      setError(errorMsg);
      onError(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [file, onResult, onError]);

  useEffect(() => {
    if (file) {
      scanFile();
    }
  }, [file, scanFile]);

  const renderScanStatus = () => {
    if (loading) {
      return (
        <Alert>
          <Loader2 className="h-4 w-4 animate-spin" />
          <AlertTitle>Escaneando</AlertTitle>
          <AlertDescription>
            Analizando archivo con Segurmatica...
          </AlertDescription>
        </Alert>
      );
    }

    if (error) {
      return (
        <Alert variant="destructive">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      );
    }

    if (result) {
      if (scanStatus === "Limpio") {
        return (
          <Alert className="border-green-500 text-green-700">
            <ShieldCheck className="h-4 w-4" />
            <AlertTitle>Limpio</AlertTitle>
            <AlertDescription>
              No se detectaron amenazas en este archivo.
            </AlertDescription>
          </Alert>
        );
      }

      if (scanStatus === "Infestado") {
        return (
          <Alert variant="destructive">
            <ShieldAlert className="h-4 w-4" />
            <AlertTitle>¡Infectado!</AlertTitle>
            <AlertDescription>
              Se detectó malware en este archivo.
            </AlertDescription>
          </Alert>
        );
      }

      if (scanStatus === "Sospechoso") {
        return (
          <Alert className="border-yellow-500 text-yellow-700">
            <ShieldQuestion className="h-4 w-4" />
            <AlertTitle>Sospechoso</AlertTitle>
            <AlertDescription>
              Este archivo contiene elementos sospechosos.
            </AlertDescription>
          </Alert>
        );
      }

      if (scanStatus === "unknown") {
        return (
          <Alert className="border-gray-500 text-gray-700">
            <ShieldQuestion className="h-4 w-4" />
            <AlertTitle>Estado desconocido</AlertTitle>
            <AlertDescription>
              No se pudo determinar el estado del archivo.
            </AlertDescription>
          </Alert>
        );
      }
    }

    return null;
  };

  return (
    <div className="space-y-4">
      {renderScanStatus()}

      {/* {result && (
        <div className="text-xs font-mono bg-muted p-3 rounded-md overflow-auto max-h-40">
          <pre>{result}</pre>
        </div>
      )} */}

      {!loading && (
        <Button
          variant="outline"
          size="sm"
          onClick={scanFile}
          className="w-full"
        >
          Volver a escanear
        </Button>
      )}
    </div>
  );
}
