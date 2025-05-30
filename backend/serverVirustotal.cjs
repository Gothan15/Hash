require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(
  cors({ origin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173' })
);
app.use(express.json());

const PORT = process.env.PORT || 4000;
const VT_API_KEY = process.env.VT_API_KEY;
const VT_BASE_URL = 'https://www.virustotal.com/api/v3';

if (!VT_API_KEY) {
  console.error('❌ Define VT_API_KEY en .env');
  process.exit(1);
}

app.get('/api/file-info/:hash', async (req, res) => {
  const { hash } = req.params;
  const { include } = req.query;

  try {
    const url = new URL(`${VT_BASE_URL}/files/${hash}`);
    if (include) url.searchParams.append('include', include);

    const response = await axios.get(url.toString(), {
      headers: { 'x-apikey': VT_API_KEY }
    });

    return res.json(response.data);
  } catch (err) {
    console.error('Error al llamar a VirusTotal:', err.response?.data || err.message);
    const status = err.response?.status || 500;
    const message = err.response?.data?.error?.message || 'Error interno del servidor';
    return res.status(status).json({ error: message });
  }
});

// app.listen(PORT, () =>
//   console.log(`✅ Backend escuchando en http://localhost:${PORT}`)
const https = require('https');
const fs = require('fs');
const path = require('path');
// Configuración HTTPS
const sslOptions = {
  key: fs.readFileSync(path.resolve(__dirname, 'cert/172.22.67.71+1-key.pem')),
  cert: fs.readFileSync(path.resolve(__dirname, 'cert/172.22.67.71+1.pem')),
};

https.createServer(sslOptions, app).listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Backend escuchando en https://172.22.67.71:${PORT}`);
});
;