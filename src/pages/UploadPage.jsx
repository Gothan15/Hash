import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import Uploader from "../components/uploader"
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "../components/ui/resizable"

export default function UploadPage() {
  const navigate = useNavigate()

  const handleFileProcessed = (fileData) => {
    // After processing, navigate to results page
    navigate("/results", { state: { newFile: fileData } })
  }

  return (
    <ResizablePanelGroup direction="horizontal" className="w-full h-[80vh]">
      <ResizablePanel defaultSize={100} minSize={30} className="flex flex-col">
        <Card className="w-full h-full max-w-none mx-0">
          <CardHeader>
            <CardTitle>Subir y Analizar Archivo</CardTitle>
            <CardDescription>Sube un archivo para analizarlo con Segurmatica y VirusTotal</CardDescription>
          </CardHeader>
          <CardContent className="h-full">
            <Uploader onProcessed={handleFileProcessed} />
          </CardContent>
        </Card>
      </ResizablePanel>
      <ResizableHandle withHandle />
    </ResizablePanelGroup>
  )
}
