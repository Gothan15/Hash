import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"

export default function StatisticsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Estadísticas</CardTitle>
        <CardDescription>Visualiza estadísticas y tendencias del análisis de archivos</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-center items-center py-8">
          <p>Panel de estadísticas próximamente</p>
        </div>
      </CardContent>
    </Card>
  )
}
