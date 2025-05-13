// Función para parsear y simplificar la respuesta de VirusTotal
export function parseVirusTotalResult(raw) {
  let data = raw
  if (typeof raw === "string") {
    try {
      data = JSON.parse(raw)
    } catch {
      return { error: "Respuesta inválida de VirusTotal" }
    }
  }

  if (!data || !data.data || !data.data.attributes) {
    return { error: "Sin datos de análisis" }
  }

  const attr = data.data.attributes
  const stats = attr.last_analysis_stats || {}
  const scanDate = attr.last_analysis_date
    ? new Date(attr.last_analysis_date * 1000).toLocaleString()
    : null
  const fileName = attr.meaningful_name || attr.names?.[0] || "(desconocido)"
  const sha256 = attr.sha256 || data.data.id
  const permalink = attr.permalink || `https://www.virustotal.com/gui/file/${sha256}`
  const engines = attr.last_analysis_results || {}

  // Extraer tipos de malware detectados por los motores
  const malwareDetections = []
  for (const [engine, result] of Object.entries(engines)) {
    if (result.category === "malicious" && result.result) {
      malwareDetections.push({
        engine,
        malware: result.result
      })
    }
  }

  return {
    fileName,
    sha256,
    scanDate,
    stats: {
      limpio: stats.harmless || 0,
      malicioso: stats.malicious || 0,
      sospechoso: stats.suspicious || 0,
      noDetectado: stats.undetected || 0,
      timeout: stats.timeout || 0,
    },
    totalEngines: Object.values(stats).reduce((a, b) => a + b, 0),
    engines,
    malwareDetections, // Nuevo campo con los motores y tipos de malware detectados
    permalink,
  }
}
