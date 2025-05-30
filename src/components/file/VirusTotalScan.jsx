"use client"

import { useState, useEffect } from "react"
import { Button } from "../ui/button"
import { Loader2, ShieldAlert, ShieldCheck, ShieldQuestion } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "../ui/alert"
import { Progress } from "../ui/progress"
import { parseVirusTotalResult } from "../../services/virustotalParse"

export default function VirusTotalScan({ hash, onResult, onError }) {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [scanStatus, setScanStatus] = useState(null)
  const [progress, setProgress] = useState(0)

  const fetchVirusTotalResult = async () => {
    if (!hash) return

    setLoading(true)
    setResult(null)
    setError(null)
    setScanStatus(null)
    setProgress(0)

    try {
      // Simulate progress while waiting for API response
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 300)

      // Call the VirusTotal API endpoint
      const response = await fetch(`https://172.22.67.71:4000/api/file-info/${hash}`)

      clearInterval(progressInterval)
      setProgress(100)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || response.statusText)
      }

      const vtData = await response.json()
      const parsed = parseVirusTotalResult(vtData)
      setResult(parsed)

      // Determine scan status based on parsed result
      if (parsed.stats) {
        if (parsed.stats.malicioso > 0) {
          setScanStatus("malicious")
        } else if (parsed.stats.sospechoso > 0) {
          setScanStatus("suspicious")
        } else {
          setScanStatus("clean")
        }
      }

      onResult(parsed)
    } catch (err) {
      const errorMsg = `Error fetching VirusTotal results: ${err.message}`
      setError(errorMsg)
      onError(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (hash) {
      fetchVirusTotalResult()
    }
  }, [hash])

  const renderScanStatus = () => {
    if (loading) {
      return (
        <div className="space-y-2">
          <Alert>
            <Loader2 className="h-4 w-4 animate-spin" />
            <AlertTitle>Verificando</AlertTitle>
            <AlertDescription>Obteniendo resultados de VirusTotal...</AlertDescription>
          </Alert>
          <Progress value={progress} />
        </div>
      )
    }

    if (error) {
      return (
        <Alert variant="destructive">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )
    }

    if (result) {
      if (result.error) {
        return (
          <Alert variant="destructive">
            <ShieldAlert className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{result.error}</AlertDescription>
          </Alert>
        )
      }
      const stats = result.stats
      if (stats) {
        if (stats.malicioso > 0) {
          return (
            <Alert variant="destructive">
              <ShieldAlert className="h-4 w-4" />
              <AlertTitle>Malicioso</AlertTitle>
              <AlertDescription>Detectado como malicioso por {stats.malicioso} motores.</AlertDescription>
            </Alert>
          )
        }
        if (stats.sospechoso > 0) {
          return (
            <Alert className="border-yellow-500 text-yellow-700">
              <ShieldQuestion className="h-4 w-4" />
              <AlertTitle>Sospechoso</AlertTitle>
              <AlertDescription>Marcado como sospechoso por {stats.sospechoso} motores.</AlertDescription>
            </Alert>
          )
        }
        return (
          <Alert className="border-green-500 text-green-700">
            <ShieldCheck className="h-4 w-4" />
            <AlertTitle>Limpio</AlertTitle>
            <AlertDescription>El archivo es considerado limpio por {stats.limpio} motores.</AlertDescription>
          </Alert>
        )
      }
    }
    return null
  }

  const renderEngineResults = () => {
    if (!result || !result.stats) return null
    const stats = result.stats
    return (
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span>Limpio: {stats.limpio}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <span>Malicioso: {stats.malicioso}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <span>Sospechoso: {stats.sospechoso}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-gray-300"></div>
          <span>No detectado: {stats.noDetectado}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {renderScanStatus()}

      {result && renderEngineResults()}

      {!loading && (
        <Button variant="outline" size="sm" onClick={fetchVirusTotalResult} className="w-full">
          Refrescar resultados
        </Button>
      )}
    </div>
  )
}
