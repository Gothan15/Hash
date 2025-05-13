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
const uploadDir = path.join(__dirname, 'uploads');
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
  const scannerPath = 'C:/Program Files (x86)/SEGURMATICA/Segurmatica Antivirus 2/segavcmd.exe';
  const args = ['--scan-now', '--files', filePath];

  try {
    const proc = spawn(scannerPath, args);

    let stdoutData = '';
    let stderrData = '';

    proc.stdout.on('data', (data) => {
      stdoutData += data.toString();
    });

    proc.stderr.on('data', (data) => {
      stderrData += data.toString();
    });

    proc.on('error', (error) => {
      console.error('Error al ejecutar el escáner:', error);
      res.status(500).json({ error: error.message });
    });

    proc.on('close', (code) => {
      // Eliminar archivo temporal
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error('Error al eliminar archivo temporal:', err);
        }
      });

      res.json({
        exitCode: code,
        stdout: stdoutData,
        stderr: stderrData
      });
    });
  } catch (err) {
    console.error('Excepción al ejecutar el escáner:', err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor backend escuchando en http://localhost:${PORT}`);
});
