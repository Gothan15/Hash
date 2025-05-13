import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import Uploader from "../components/uploader"

export default function UploadPage() {
  const navigate = useNavigate()

  const handleFileProcessed = (fileData) => {
    // After processing, navigate to results page
    navigate("/results", { state: { newFile: fileData } })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Subir y Analizar Archivo</CardTitle>
        <CardDescription>Sube un archivo para analizarlo con Segurmatica y VirusTotal</CardDescription>
      </CardHeader>
      <CardContent>
        <Uploader onProcessed={handleFileProcessed} />
      </CardContent>
    </Card>
  )
}
