# Этап сборки
FROM node:18-alpine AS builder

# Явно создаем рабочую директорию
RUN mkdir -p /app && chown node:node /app
WORKDIR /app
USER node

# Копируем зависимости
COPY --chown=node:node package*.json ./
RUN npm ci

# Копируем исходный код
COPY --chown=node:node . .

# Собираем приложение
RUN npm run build -- --configuration=production

# Этап запуска
FROM nginx:alpine

# Создаем директорию для nginx
RUN mkdir -p /usr/share/nginx/html

# Копируем собранное приложение
COPY --from=builder /app/dist/bi /usr/share/nginx/html

# Копируем конфигурационный файл
COPY src/assets/config.json /usr/share/nginx/html/assets/

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
