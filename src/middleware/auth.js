const jwt = require('jsonwebtoken');

const authMiddleware = (rolesPermitidos = []) => {
  return (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token no proporcionado' });
    }

    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;

      if (rolesPermitidos.length > 0 && !rolesPermitidos.includes(decoded.nivel)) {
        return res.status(403).json({ error: 'Acceso denegado: permisos insuficientes' });
      }

      next();
    } catch (err) {
      return res.status(401).json({ error: 'Token inválido o expirado' });
    }
  };
};

module.exports = authMiddleware;
