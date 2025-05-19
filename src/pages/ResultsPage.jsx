"use client"

import { useState, useEffect, useCallback } from "react"
import { useLocation } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import ResultsTable from "../components/file/ResultsTable"
import { Loader2 } from "lucide-react"
import { getAllFiles } from "../services/firestore"

export default function ResultsPage() {
  const [processedFiles, setProcessedFiles] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const location = useLocation()

  const loadFiles = useCallback(async () => {
    try {
      setIsLoading(true)
      const files = await getAllFiles()
      setProcessedFiles(files)
    } catch (error) {
      console.error("Error loading files:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadFiles()
  }, [loadFiles])

  // If we have a new file from the upload page, add it to our list
  useEffect(() => {
    const state = location.state
    if (state?.newFile) {
      const newFile = state.newFile
      setProcessedFiles((prevFiles) => {
        // Check if file already exists
        const existingIndex = prevFiles.findIndex(file => file.id === newFile.id)
        if (existingIndex >= 0) {
          // Update existing file
          const updatedFiles = [...prevFiles]
          updatedFiles[existingIndex] = newFile
          return updatedFiles
        }
        // Add new file to beginning
        return [newFile, ...prevFiles]
      })

      // Clear the location state
      window.history.replaceState({}, document.title)
    }
  }, [location.state]) // Only depend on location.state

  return (
    <div className="px-1 sm:px-0 w-full overflow-x-auto ">
      <Card className="w-full max-w-auto overflow-x-auto">
        <CardHeader>
          <CardTitle>Resultados del Análisis</CardTitle>
          <CardDescription>Visualiza y gestiona tus archivos analizados</CardDescription>
        </CardHeader>
        <CardContent className="p-0 sm:p-6">
          {isLoading ? (
            <div className="flex justify-center items-center py-8 ">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Cargando archivos...</span>
            </div>
          ) : (
            <div className="overflow-x-auto w-full">
              <ResultsTable data={processedFiles} onDataChange={loadFiles} />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
