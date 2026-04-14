-- Script para crear tabla usuarios si no existe (Railway)
-- Adapta según tu estructura actual

CREATE TABLE IF NOT EXISTS usuarios (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  nombre      VARCHAR(150)  NOT NULL,
  usuario     VARCHAR(80)   NOT NULL UNIQUE,
  email       VARCHAR(150)  NULL,
  password    VARCHAR(255)  NOT NULL,
  nivel       ENUM('admin', 'tesorero', 'diacono', 'miembro') DEFAULT 'miembro',
  activo      TINYINT(1)    DEFAULT 1,
  created_at  TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_usuario (usuario),
  INDEX idx_nivel (nivel)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Crear tabla aportes si no existe
CREATE TABLE IF NOT EXISTS aportes (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  fecha       DATE          NOT NULL,
  monto       DECIMAL(10,2) NOT NULL,
  descripcion VARCHAR(255)  NULL,
  categoria   VARCHAR(50)   NULL,
  miembro     VARCHAR(100)  NULL,
  forma_pago  VARCHAR(50)   NULL,
  id_usuario  INT           NULL,
  created_at  TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE SET NULL,
  INDEX idx_fecha (fecha),
  INDEX idx_usuario (id_usuario)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
