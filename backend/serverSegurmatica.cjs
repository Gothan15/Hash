require('dotenv').config();
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { spawn } = require("child_process");
const https = require('https');

const app = express();
const PORT = process.env.PORT || 3001;
const SCANNER_PATH = process.env.SCANNER_PATH || "C:/Program Files (x86)/SEGURMATICA/Segurmatica Antivirus 2/segavcmd.exe";

// Validación de variables de entorno
if (!fs.existsSync(SCANNER_PATH)) {
  console.error('❌ No se encuentra el ejecutable de Segurmatica en la ruta especificada');
  process.exit(1);
}

app.use(
  cors({ origin: process.env.FRONTEND_ORIGIN })
);
app.use(express.json());

// Directorio base para cuarentena
const quarantineBaseDir = path.join(__dirname, "Cuarentena");
if (!fs.existsSync(quarantineBaseDir)) {
  fs.mkdirSync(quarantineBaseDir, { recursive: true });
}

// Función para obtener la ruta de cuarentena según el hash/nombre
function getQuarantinePath(hexName) {
  // hexName debe tener al menos 12 caracteres para 3 niveles (4+4+4)
  const p1 = hexName.slice(0, 4);
  const p2 = hexName.slice(4, 8);
  const p3 = hexName.slice(8, 12);
  return path.join(quarantineBaseDir, p1, p2, p3);
}

// Configuración de multer para guardar archivos en la estructura de cuarentena
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Se espera que el frontend envíe el hash en el nombre del archivo o en un campo extra
    let hexName = null;
    if (file.originalname && /^[a-fA-F0-9]{12,}/.test(file.originalname)) {
      hexName = file.originalname.match(/^([a-fA-F0-9]{12,})/)[1];
    } else if (req.body && req.body.hexName && /^[a-fA-F0-9]{12,}/.test(req.body.hexName)) {
      hexName = req.body.hexName;
    }
    if (!hexName) {
      return cb(new Error("No se recibió hash válido para el archivo (deben ser 12 caracteres hexadecimales al inicio del nombre o en el campo hexName)"), null);
    }
    req._hexName = hexName; // Guardar para filename
    const quarantinePath = getQuarantinePath(hexName);
    fs.mkdirSync(quarantinePath, { recursive: true });
    cb(null, quarantinePath);
  },
  filename: (req, file, cb) => {
    // Guardar solo los primeros 10 caracteres hexadecimales como nombre
    const hexName = req._hexName;
    if (!hexName) {
      return cb(new Error("No se recibió hash válido para el archivo (filename)"), null);
    }
    // Mantener la extensión si existe
    const ext = path.extname(file.originalname);
    cb(null, hexName.slice(0, 10) + ext);
  },
});
const upload = multer({ storage });

// Agrega función de logging
function logToFile(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  fs.appendFileSync(path.join(__dirname, 'scan.log'), logMessage);
  console.log(logMessage.trim());
}

// Función para ejecutar el escaneo con respuestas automáticas
function scanWithSegurmatica(filePath) {
  return new Promise((resolve, reject) => {
    logToFile(`🔍 Iniciando escaneo para archivo: ${path.basename(filePath)}`);
    const args = ["--scan-now", "--files", filePath];

    const proc = spawn(SCANNER_PATH, args, { stdio: ["pipe", "pipe", "pipe"] });
    let stdout = "";
    let stderr = "";

    // Responder 'N' a cualquier prompt que aparezca
    const respondNo = (chunk) => {
      const text = chunk.toString();
      if (/S\/?N|descontaminar|aplicar la misma acción/i.test(text)) {
        proc.stdin.write("N\n");
      }
    };

    proc.stdout.on("data", (data) => {
      stdout += data;
      logToFile(`📝 Salida de Segurmatica: ${data.toString().trim()}`);
      respondNo(data);
    });
    proc.stderr.on("data", (data) => {
      stderr += data;
      logToFile(`⚠️ Error de Segurmatica: ${data.toString().trim()}`);
      respondNo(data);
    });

    // Refuerzo por si falta prompt
    const reinforce = setTimeout(() => {
      if (!proc.killed) {
        proc.stdin.write("N\nN\n");
      }
    }, 2000);

    proc.on("error", (err) => {
      clearTimeout(reinforce);
      logToFile(`❌ Error en proceso de escaneo: ${err.message}`);
      reject(err);
    });

    proc.on("close", (code) => {
      clearTimeout(reinforce);
      logToFile(`✅ Escaneo completado con código: ${code}`);
      resolve({ code, stdout, stderr });
    });
  });
}

// Endpoint para subir y escanear archivo
app.post("/scan-segurmatica", upload.single("file"), async (req, res) => {
  if (!req.file) {
    logToFile('❌ Error: No se recibió ningún archivo');
    return res.status(400).json({ error: "No se recibió ningún archivo." });
  }

  logToFile(`📥 Archivo recibido: ${req.file.originalname} (${req.file.size} bytes)`);

  try {
    const result = await scanWithSegurmatica(req.file.path);
    logToFile(`📤 Enviando resultados para: ${req.file.originalname}`);
    res.json({
      exitCode: result.code,
      stdout: result.stdout,
      stderr: result.stderr,
      filename: path.basename(req.file.path),
    });
  } catch (err) {
    logToFile(`❌ Error en el escaneo de ${req.file.originalname}: ${err.message}`);
    console.error("Error en el escaneo:", err);
    res.status(500).json({ error: err.message });
  }
});

// Configuración HTTPS
const sslOptions = {
  key: fs.readFileSync(path.resolve(__dirname, 'cert/172.22.67.71+1-key.pem')),
  cert: fs.readFileSync(path.resolve(__dirname, 'cert/172.22.67.71+1.pem')),
};

https.createServer(sslOptions, app).listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Backend escuchando en https://172.22.67.71:${PORT}`);
});
