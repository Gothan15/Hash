"use client";

import { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import ResultsTable from "../components/file/ResultsTable copy";
import { Loader2 } from "lucide-react";
import { getAllFiles } from "../services/firestore";

export default function ResultsPage() {
  const [processedFiles, setProcessedFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();

  const loadFiles = useCallback(async () => {
    try {
      setIsLoading(true);
      const files = await getAllFiles();
      setProcessedFiles(files);
    } catch (error) {
      console.error("Error loading files:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  // Si tenemos un nuevo archivo de la página de upload, lo agregamos
  useEffect(() => {
    const state = location.state;
    if (state?.newFile) {
      const newFile = state.newFile;
      setProcessedFiles((prevFiles) => {
        // Si ya existe el archivo, actualizarlo
        const existingIndex = prevFiles.findIndex(
          (file) => file.id === newFile.id
        );
        if (existingIndex >= 0) {
          const updatedFiles = [...prevFiles];
          updatedFiles[existingIndex] = newFile;
          return updatedFiles;
        }
        // Si no, agregar al inicio
        return [newFile, ...prevFiles];
      });

      // Limpiar el estado del location
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  return (
    <div className="w-full px-4 sm:px-6">
      <Card className="w-full shadow-lg rounded-lg overflow-hidden m-4 ">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-gray-100">
            Resultados del Análisis
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            Visualiza y gestiona tus archivos analizados
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Cargando archivos...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <ResultsTable data={processedFiles} onDataChange={loadFiles} />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
