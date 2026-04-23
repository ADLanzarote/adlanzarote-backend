const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

// POST /auth/login
router.post('/login', async (req, res) => {
  const email = req.body.email || req.body.usuario;
  const password = req.body.password || req.body.contrasena;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email/Usuario y contraseña son requeridos' });
  }

  try {
    const [rows] = await db.query(
      'SELECT * FROM usuarios WHERE email = ? LIMIT 1',
      [email]
    );

    if (rows.length === 0) {
      console.log('Login failed: User not found:', email);
      return res.status(401).json({ error: 'Credenciales inválidas (Error 1)' });
    }

    const user = rows[0];

    // Soporte para contrasena en texto plano o bcrypt
    let passwordOk = false;
    if (user.contrasena && user.contrasena.startsWith('$2')) {
      passwordOk = await bcrypt.compare(password, user.contrasena);
    } else {
      passwordOk = password === user.contrasena;
    }

    if (!passwordOk) {
      console.log('Login failed: Incorrect password for:', email);
      return res.status(401).json({ error: 'Credenciales inválidas (Error 2)' });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        nivel: user.nivel,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        nivel: user.nivel,
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
