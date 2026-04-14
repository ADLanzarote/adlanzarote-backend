-- Script de migración completo para Railway/MySQL en la nube
-- Ejecutar en la consola SQL de tu base de datos

-- Crear tabla de comentarios bíblicos
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

-- Insertar datos de ejemplo (opcional)
-- INSERT INTO comentarios_biblicos (nombre, libro, capitulo, versiculo, comentario, id_usuario) 
-- VALUES ('Pastor Juan', 'Juan', 3, 16, 'Dios amó al mundo de tal manera...', 1);
