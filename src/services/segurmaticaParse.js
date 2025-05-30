// Función para parsear y estructurar la respuesta de Segurmatica Antivirus
export function parseSegurmaticaResult(rawText) {
  // Si no hay texto, devolver un objeto de error
  if (!rawText) {
    return { error: "No hay datos de escaneo disponibles" };
  }

  try {
    const result = {
      resumen: {
        fechaEscaneo: null,
        versionMotor: null,
        licencia: null,
        proteccionTiempoReal: null,
      },
      resultados: {
        //totalArchivos: 0,
        infestados: 0,
        sospechosos: 0,
        limpios: 0,
        descontaminados: 0,
        enCuarentena: 0,
      },
      detecciones: [],
    }; // Usar fecha actual en lugar de extraerla del resultado
    const ahora = new Date();

    // Formatear la fecha en formato DD/MM/YYYY HH:MM:SS AM/PM similar al original
    const opciones = {
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    };
    const mes = (ahora.getMonth() + 1).toString().padStart(2, "0");
    const dia = ahora.getDate().toString().padStart(2, "0");
    const anio = ahora.getFullYear();
    const hora = ahora.toLocaleTimeString("en-US", opciones);

    result.resumen.fechaEscaneo = `${mes}/${dia}/${anio} ${hora}`;
    // Guardar también un timestamp ISO para facilitar manipulación de fechas
    result.resumen.timestampEscaneo = ahora.toISOString();

    // Extraer versión del motor
    const versionMatch = rawText.match(/Vers[ií]on del motor:\s*([0-9.]+)/i);
    if (versionMatch) {
      result.resumen.versionMotor = versionMatch[1];
    }

    // Extraer estado de licencia
    const licenciaMatch = rawText.match(/Licencia:\s*([^\r\n]+)/i);
    if (licenciaMatch) {
      result.resumen.licencia = licenciaMatch[1].trim();
    }

    // Extraer estado de protección en tiempo real
    const proteccionMatch = rawText.match(
      /Protecci[óo]n en tiempo real:\s*([^\r\n]+)/i
    );
    if (proteccionMatch) {
      result.resumen.proteccionTiempoReal = proteccionMatch[1].trim();
    }

    // Extraer resultados del escaneo
    const totalArchivosMatch = rawText.match(
      /Total de archivos revisados:\s*(\d+)/i
    );
    if (totalArchivosMatch) {
      result.resultados.totalArchivos = parseInt(totalArchivosMatch[1], 10);
    }

    const infestadosMatch = rawText.match(/Infestados:\s*(\d+)/i);
    if (infestadosMatch) {
      result.resultados.infestados = parseInt(infestadosMatch[1], 10);
    }

    const sospechososMatch = rawText.match(/Sospechoso(?:s)?:\s*(\d+)/i);
    if (sospechososMatch) {
      result.resultados.sospechosos = parseInt(sospechososMatch[1], 10);
    }

    const limpiosMatch = rawText.match(/Limpios:\s*(\d+)/i);
    if (limpiosMatch) {
      result.resultados.limpios = parseInt(limpiosMatch[1], 10);
    }

    const descontaminadosMatch = rawText.match(/Descontaminados:\s*(\d+)/i);
    if (descontaminadosMatch) {
      result.resultados.descontaminados = parseInt(descontaminadosMatch[1], 10);
    }

    const cuarentenaMatch = rawText.match(/(?:En )?[Cc]uarentena:\s*(\d+)/i);
    if (cuarentenaMatch) {
      result.resultados.enCuarentena = parseInt(cuarentenaMatch[1], 10);
    }

    // Extraer detecciones de malware
    // En Segurmatica normalmente aparecen listados en formato "Motor\tDetección"
    const deteccionesRegex = /Segurmática\s+Antivirus\s+([^\r\n]+)/gi;
    let deteccion;
    while ((deteccion = deteccionesRegex.exec(rawText)) !== null) {
      result.detecciones.push({
        motor: "Segurmatica Antivirus",
        malware: deteccion[1].trim(),
      });
    } // Si hay infestados pero no se encontraron detecciones específicas,
    // buscar el nombre del malware en el texto
    if (result.detecciones.length === 0 && result.resultados.infestados > 0) {
      const malwareMatch = rawText.match(
        /Prueba\s+([^\n]+?)\s+Infestado\s+Desea descontaminar/i
      );
      result.detecciones.push({
        motor: "Segurmatica Antivirus",
        malware: malwareMatch ? malwareMatch[1] : "Amenaza detectada",
      });
    }

    // Determinar el estado general del escaneo
    let status = "unknown";
    if (result.resultados.infestados > 0) {
      status = "Infestado";
    } else if (result.resultados.sospechosos > 0) {
      status = "Sospechoso";
    } else if (
      result.resultados.infestados === 0 &&
      result.resultados.sospechosos === 0
    ) {
      status = "Limpio";
    }

    result.status = status;
    result.rawText = rawText; // Mantener el texto original para referencia

    return result;
  } catch (error) {
    console.error("Error al parsear resultado de Segurmatica:", error);
    return {
      error: "Error al procesar los resultados del escaneo",
      rawText: rawText,
    };
  }
}
