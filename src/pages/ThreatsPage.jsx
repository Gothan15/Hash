import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"

export default function ThreatsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Reportes de Amenazas</CardTitle>
        <CardDescription>Ver reportes detallados de análisis de amenazas</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-center items-center py-8">
          <p>Panel de reportes de amenazas próximamente</p>
        </div>
      </CardContent>
    </Card>
  )
}
