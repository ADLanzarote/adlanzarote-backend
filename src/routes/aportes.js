const express = require('express');
const router = express.Router();
const db = require('../config/db');
const auth = require('../middleware/auth');

const ROLES_APORTES = ['admin', 'tesorero'];

// GET /aportes
router.get('/', auth(ROLES_APORTES), async (req, res) => {
  try {
    const { desde, hasta, page = 1, limit = 50 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    let where = [];
    let params = [];

    if (desde) { where.push('fecha >= ?'); params.push(desde); }
    if (hasta) { where.push('fecha <= ?'); params.push(hasta); }

    const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const [rows] = await db.query(
      `SELECT * FROM aportes ${whereClause} ORDER BY fecha DESC LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );

    const [[{ total }]] = await db.query(
      `SELECT COUNT(*) AS total FROM aportes ${whereClause}`, params
    );

    const [[{ suma }]] = await db.query(
      `SELECT COALESCE(SUM(monto),0) AS suma FROM aportes ${whereClause}`, params
    );

    res.json({ data: rows, total, suma, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    console.error('[GET /aportes]', err);
    res.status(500).json({ error: 'Error al obtener aportes' });
  }
});

// GET /aportes/:id
router.get('/:id', auth(ROLES_APORTES), async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM aportes WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Aporte no encontrado' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener aporte' });
  }
});

// POST /aportes
router.post('/', auth(ROLES_APORTES), async (req, res) => {
  const { fecha, monto, descripcion, categoria, miembro, forma_pago } = req.body;

  if (!fecha || monto === undefined) {
    return res.status(400).json({ error: 'Fecha y monto son requeridos' });
  }

  try {
    const [result] = await db.query(
      `INSERT INTO aportes (fecha, monto, descripcion, categoria, miembro, forma_pago, id_usuario)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [fecha, parseFloat(monto), descripcion || null, categoria || null, miembro || null, forma_pago || null, req.user.id]
    );
    const [rows] = await db.query('SELECT * FROM aportes WHERE id = ?', [result.insertId]);
    res.status(201).json({ message: 'Aporte creado', data: rows[0] });
  } catch (err) {
    console.error('[POST /aportes]', err);
    res.status(500).json({ error: 'Error al crear aporte' });
  }
});

// PUT /aportes/:id
router.put('/:id', auth(ROLES_APORTES), async (req, res) => {
  const { fecha, monto, descripcion, categoria, miembro, forma_pago } = req.body;

  try {
    const [existing] = await db.query('SELECT id FROM aportes WHERE id = ?', [req.params.id]);
    if (!existing.length) return res.status(404).json({ error: 'Aporte no encontrado' });

    await db.query(
      `UPDATE aportes SET fecha=?, monto=?, descripcion=?, categoria=?, miembro=?, forma_pago=?
       WHERE id=?`,
      [fecha, parseFloat(monto), descripcion || null, categoria || null, miembro || null, forma_pago || null, req.params.id]
    );
    const [rows] = await db.query('SELECT * FROM aportes WHERE id = ?', [req.params.id]);
    res.json({ message: 'Aporte actualizado', data: rows[0] });
  } catch (err) {
    console.error('[PUT /aportes]', err);
    res.status(500).json({ error: 'Error al actualizar aporte' });
  }
});

// DELETE /aportes/:id — solo admin
router.delete('/:id', auth(['admin']), async (req, res) => {
  try {
    const [existing] = await db.query('SELECT id FROM aportes WHERE id = ?', [req.params.id]);
    if (!existing.length) return res.status(404).json({ error: 'Aporte no encontrado' });

    await db.query('DELETE FROM aportes WHERE id = ?', [req.params.id]);
    res.json({ message: 'Aporte eliminado' });
  } catch (err) {
    console.error('[DELETE /aportes]', err);
    res.status(500).json({ error: 'Error al eliminar aporte' });
  }
});

module.exports = router;
