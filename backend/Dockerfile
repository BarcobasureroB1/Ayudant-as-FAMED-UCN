# --- Etapa 1: Build ---
FROM node:20 AS builder

WORKDIR /app

# Copiamos los archivos de dependencias primero (para aprovechar cache)
COPY package*.json ./

# Instalamos TODO (incluyendo devDependencies para poder compilar)
RUN npm install

# Copiamos el resto del código
COPY . .

# Compilamos el proyecto (usa el tsconfig.json del proyecto)
RUN npm run build

# --- Etapa 2: Runtime ---
FROM node:20

WORKDIR /app

# Copiamos solo lo necesario para ejecutar
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist

# Instalamos solo dependencias necesarias en producción
RUN npm install --legacy-peer-deps

EXPOSE 3000

CMD ["npm", "run", "start:prod"]