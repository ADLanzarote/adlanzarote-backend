-- Script SQL para crear la tabla comentarios_biblicos
-- Ejecutar en la base de datos: adlanzarote

CREATE TABLE IF NOT EXISTS comentarios_biblicos (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  nombre      VARCHAR(150)  NOT NULL COMMENT 'Nombre del autor del comentario',
  libro       VARCHAR(80)   NOT NULL COMMENT 'Nombre del libro bíblico',
  capitulo    INT           NOT NULL COMMENT 'Número del capítulo',
  versiculo   INT           NOT NULL COMMENT 'Número del versículo',
  comentario  TEXT          NOT NULL COMMENT 'Texto del comentario bíblico',
  id_usuario  INT           NULL COMMENT 'FK a tabla usuarios',
  created_at  TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE SET NULL,
  INDEX idx_libro (libro),
  INDEX idx_capitulo (capitulo),
  INDEX idx_usuario (id_usuario)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
