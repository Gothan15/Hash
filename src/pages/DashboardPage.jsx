import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import FileUploader from "../components/file/FileUploader";

export default function DashboardPage() {
  const navigate = useNavigate();

  const handleFileProcessed = (fileData) => {
    // After processing, navigate to results page
    navigate("/results", { state: { newFile: fileData } });
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Subir y Analizar Archivo</CardTitle>
        <CardDescription>
          Sube un archivo para analizarlo con Segurmatica y VirusTotal
        </CardDescription>
      </CardHeader>
      <CardContent>
        <FileUploader onProcessed={handleFileProcessed} />
      </CardContent>
    </Card>
  );
}
