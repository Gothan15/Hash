import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"

export default function DatabasePage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Base de Datos</CardTitle>
        <CardDescription>Administra tu base de datos de análisis de archivos</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-center items-center py-8">
          <p>Gestión de base de datos próximamente</p>
        </div>
      </CardContent>
    </Card>
  )
}
