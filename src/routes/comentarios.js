const express = require('express');
const router = express.Router();
const db = require('../config/db');
const auth = require('../middleware/auth');

// Todos los endpoints requieren autenticación
router.use(auth([]));

// GET /comentarios?libro=&capitulo=&versiculo=
router.get('/', async (req, res) => {
  try {
    const { libro, capitulo, versiculo, page = 1, limit = 50 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    let where = [];
    let params = [];

    if (libro) { where.push('libro = ?'); params.push(libro); }
    if (capitulo) { where.push('capitulo = ?'); params.push(parseInt(capitulo)); }
    if (versiculo) { where.push('versiculo = ?'); params.push(parseInt(versiculo)); }

    const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const [rows] = await db.query(
      `SELECT cb.*, u.nombre AS autor FROM comentarios_biblicos cb
       LEFT JOIN usuarios u ON cb.id_usuario = u.id
       ${whereClause}
       ORDER BY cb.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );

    const [[{ total }]] = await db.query(
      `SELECT COUNT(*) AS total FROM comentarios_biblicos ${whereClause}`,
      params
    );

    res.json({ data: rows, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    console.error('[GET /comentarios]', err);
    res.status(500).json({ error: 'Error al obtener comentarios' });
  }
});

// POST /comentarios
router.post('/', async (req, res) => {
  const { nombre, libro, capitulo, versiculo, comentario } = req.body;

  if (!nombre || !libro || !capitulo || !versiculo || !comentario) {
    return res.status(400).json({ error: 'Todos los campos son requeridos' });
  }

  if (!Number.isInteger(parseInt(capitulo)) || !Number.isInteger(parseInt(versiculo))) {
    return res.status(400).json({ error: 'Capítulo y versículo deben ser números enteros' });
  }

  try {
    const [result] = await db.query(
      `INSERT INTO comentarios_biblicos (nombre, libro, capitulo, versiculo, comentario, id_usuario)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [nombre, libro, parseInt(capitulo), parseInt(versiculo), comentario, req.user.id]
    );
    const [rows] = await db.query(
      'SELECT * FROM comentarios_biblicos WHERE id = ?', [result.insertId]
    );
    res.status(201).json({ message: 'Comentario enviado correctamente', data: rows[0] });
  } catch (err) {
    console.error('[POST /comentarios]', err);
    res.status(500).json({ error: 'Error al guardar comentario' });
  }
});

// DELETE /comentarios/:id — solo admin
router.delete('/:id', auth(['admin']), async (req, res) => {
  try {
    await db.query('DELETE FROM comentarios_biblicos WHERE id = ?', [req.params.id]);
    res.json({ message: 'Comentario eliminado' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar comentario' });
  }
});

module.exports = router;
