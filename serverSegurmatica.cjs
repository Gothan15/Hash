// Backend Express para escaneo con Segurmatica Antivirus
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { spawn } = require("child_process");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());

// Asegurar que existe la carpeta 'uploads' para almacenar archivos temporales
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Configuración de multer para guardar archivos temporalmente
const upload = multer({ dest: uploadDir });

// Endpoint para escanear archivo con Segurmatica
app.post("/scan-segurmatica", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No se recibió ningún archivo" });
  }
  const filePath = req.file.path;

  // Ruta al ejecutable .exe del "antivirus"
  const scannerPath =
    "C:/Program Files (x86)/SEGURMATICA/Segurmatica Antivirus 2/segavcmd.exe";
  const args = ["--scan-now", "--files", filePath];
  try {
    // Usar stdio: 'pipe' para poder escribir en stdin y leer de stdout/stderr
    const proc = spawn(scannerPath, args, { stdio: ["pipe", "pipe", "pipe"] });

    let stdoutData = "";
    let stderrData = "";

    // Función para responder automáticamente a los diálogos
    const respondToPrompts = (output) => {
      // Si detectamos patrones que indican que se está preguntando por descontaminar
      // o aplicar la misma acción, respondemos con "N" + Enter
      if (
        output.includes("descontaminar") ||
        output.includes("desea aplicar la misma accion") ||
        output.includes("S/N")
      ) {
        console.log('Detectado diálogo, respondiendo "N"');
        proc.stdin.write("N\n");
      }
    };

    proc.stdout.on("data", (data) => {
      const chunk = data.toString();
      stdoutData += chunk;
      respondToPrompts(chunk);
    });

    proc.stderr.on("data", (data) => {
      const chunk = data.toString();
      stderrData += chunk;
      respondToPrompts(chunk);
    });

    // Enviar "N" + Enter automáticamente varias veces después de un tiempo prudencial
    // para responder a posibles diálogos que no se capturan correctamente
    setTimeout(() => {
      try {
        if (!proc.killed) {
          console.log('Enviando respuestas automáticas "N" por seguridad');
          proc.stdin.write("N\n");
          setTimeout(() => proc.stdin.write("N\n"), 500);
        }
      } catch (e) {
        console.log("Error al enviar respuesta automática:", e);
      }
    }, 2000);

    proc.on("error", (error) => {
      console.error("Error al ejecutar el escáner:", error);
      res.status(500).json({ error: error.message });
    });

    proc.on("close", (code) => {
      // No eliminar archivo temporal
      // fs.unlink(filePath, (err) => {
      //   if (err) {
      //     console.error('Error al eliminar archivo temporal:', err);
      //   }
      // });

      res.json({
        exitCode: code,
        stdout: stdoutData,
        stderr: stderrData,
      });
    });
  } catch (err) {
    console.error("Excepción al ejecutar el escáner:", err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor backend escuchando en http://localhost:${PORT}`);
});
