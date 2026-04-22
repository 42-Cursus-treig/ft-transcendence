# --- ÉTAPE 1 : Build ---
FROM node:22-slim AS builder

WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci
COPY . .
RUN npm run build

# --- ÉTAPE 2 : Production ---
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html

RUN echo 'server { \
    listen 80; \
    listen [::]:80; \
    \
    location / { \
        root /usr/share/nginx/html; \
        index index.html; \
        try_files $uri $uri/ /index.html; \
    } \
    \
    location /api/ { \
        proxy_pass https://fttranscendence-production-9267.up.railway.app/api/; \
        proxy_set_header Host fttranscendence-production-9267.up.railway.app; \
        proxy_ssl_server_name on; \
    } \
    \
    location /api/remote/ws { \
        proxy_pass https://fttranscendence-production-9267.up.railway.app/api/remote/ws; \
        proxy_http_version 1.1; \
        proxy_set_header Upgrade $http_upgrade; \
        proxy_set_header Connection "upgrade"; \
        proxy_set_header Host fttranscendence-production-9267.up.railway.app; \
        proxy_ssl_server_name on; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]