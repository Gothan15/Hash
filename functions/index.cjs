/**
 * Import function triggers from sus respectivos submódulos:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * Ver lista completa de triggers soportados en https://firebase.google.com/docs/functions
 */

// Cloud Function de Firebase para analizar archivos con VirusTotal
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const axios = require("axios");
const FormData = require("form-data");
const BusBoy = require("busboy");
const cors = require("cors")({ origin: true });

admin.initializeApp();
require("dotenv").config();
// Configuración de VirusTotal
const VT_API_KEY = process.env.VT_API_KEY;

// Cloud Function para obtener información de archivo desde VirusTotal por hash
exports.fetchFileInfo = functions.https.onRequest(async (req, res) => {
  cors(req, res, async () => {
    if (req.method !== "GET") {
      return res.status(405).send("Método no permitido");
    }
    const hash = req.query.hash || req.params.hash;
    const include = req.query.include || "";
    if (!hash) {
      return res.status(400).json({ error: "Falta el parámetro hash" });
    }
    if (!VT_API_KEY) {
      return res
        .status(500)
        .json({ error: "API key de VirusTotal no configurada" });
    }
    try {
      const url = new URL(`https://www.virustotal.com/api/v3/files/${hash}`);
      if (include) url.searchParams.append("include", include);

      const response = await axios.get(url.toString(), {
        headers: { "x-apikey": VT_API_KEY },
      });
      res.status(200).json(response.data);
    } catch (error) {
      res.status(error.response?.status || 500).json({
        error:
          error.response?.data?.error?.message ||
          "Error al consultar VirusTotal",
        details: error.message,
        responseData: error.response?.data,
      });
    }
  });
});
