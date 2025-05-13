import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"

export default function SettingsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuración</CardTitle>
        <CardDescription>Configura los ajustes de la aplicación</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-center items-center py-8">
          <p>Página de configuración próximamente</p>
        </div>
      </CardContent>
    </Card>
  )
}
