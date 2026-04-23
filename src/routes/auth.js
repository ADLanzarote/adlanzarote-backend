const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
require('dotenv').config();

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const email = req.body.email || req.body.usuario;
    const contrasena = req.body.contrasena || req.body.password;

    if (!email || !contrasena) {
      return res.status(400).json({ error: 'Email/Usuario y contraseña requeridos' });
    }

    const [rows] = await pool.query(
      `SELECT u.*, m.nombre_completo, m.id_iglesia, i.nombre_iglesia
       FROM usuarios u
       LEFT JOIN miembros m ON u.id_miembro = m.id
       LEFT JOIN iglesias i ON m.id_iglesia = i.id
       WHERE u.email = ?`,
      [email]
    );

    if (rows.length === 0) {
      console.log('Fallo Login: Usuario no encontrado en BD para el email:', email);
      return res.status(401).json({ error: 'Credenciales inválidas (Error 1: Email no existe)' });
    }

    const user = rows[0];
    const valid = await bcrypt.compare(contrasena, user.contrasena);
    
    if (!valid) {
      console.log('Fallo Login: Contraseña incorrecta para el usuario:', email);
      return res.status(401).json({ error: 'Credenciales inválidas (Error 2: Contraseña incorrecta)' });
    }

    const payload = {
      id: user.id,
      email: user.email,
      nivel: user.nivel,
      nombre: user.nombre_completo || user.email,
      id_miembro: user.id_miembro,
      id_iglesia: user.id_iglesia || null,
      nombre_iglesia: user.nombre_iglesia || null
    };

    const token = jwt.sign(
      payload, 
      process.env.JWT_SECRET, 
      { expiresIn: process.env.JWT_EXPIRES_IN || process.env.JWT_EXPIRES || '8h' }
    );

    res.json({ token, user: payload });
  } catch (err) {
    console.error('[auth/login]', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/auth/me
router.get('/me', require('../middleware/auth')([]), (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
