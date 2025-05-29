# Первый этап — билдим frontend
FROM node:18-alpine AS builder

WORKDIR /app

# Копируем только package.json и package-lock.json для оптимизации слоёв
COPY package*.json ./
RUN npm install

# Копируем весь исходный код
COPY . .

# Собираем production-сборку
RUN npm run build

# Второй этап — nginx, только статика!
FROM nginx:alpine

# Копируем собранный проект из builder-этапа
COPY --from=builder /app/dist /usr/share/nginx/html

# Копируем свой nginx-конфиг, если нужно
COPY default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
