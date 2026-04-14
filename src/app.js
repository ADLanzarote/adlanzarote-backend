require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Rutas
app.use('/auth', require('./routes/auth'));
app.use('/comentarios', require('./routes/comentarios'));
app.use('/aportes', require('./routes/aportes'));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'ADLanzarote API', version: '1.0.0' });
});

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`[API] Servidor corriendo en http://localhost:${PORT}`);
});
