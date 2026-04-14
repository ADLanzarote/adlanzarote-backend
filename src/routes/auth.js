const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

// POST /auth/login
router.post('/login', async (req, res) => {
  const { usuario, password } = req.body;

  if (!usuario || !password) {
    return res.status(400).json({ error: 'Usuario y contraseña son requeridos' });
  }

  try {
    const [rows] = await db.query(
      'SELECT * FROM usuarios WHERE usuario = ? OR email = ? LIMIT 1',
      [usuario, usuario]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const user = rows[0];

    // Soporte para password en texto plano o bcrypt
    let passwordOk = false;
    if (user.password && user.password.startsWith('$2')) {
      passwordOk = await bcrypt.compare(password, user.password);
    } else {
      passwordOk = password === user.password;
    }

    if (!passwordOk) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const token = jwt.sign(
      {
        id: user.id,
        nombre: user.nombre || user.usuario,
        usuario: user.usuario,
        nivel: user.nivel,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        nombre: user.nombre || user.usuario,
        usuario: user.usuario,
        nivel: user.nivel,
        email: user.email || null,
      },
    });
  } catch (err) {
    console.error('[auth/login]', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /auth/me — verificar token vigente
router.get('/me', require('../middleware/auth')([]), (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
