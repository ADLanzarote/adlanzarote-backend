# Usar imagen oficial de Node.js LTS
FROM node:20-alpine

# Crear directorio de trabajo
WORKDIR /app

# Copiar package.json primero (para cache de capas)
COPY package*.json ./

# Instalar dependencias
RUN npm ci --only=production

# Copiar el resto del código
COPY . .

# Exponer puerto
EXPOSE 3001

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001/health || exit 1

# Comando de inicio
CMD ["npm", "start"]
