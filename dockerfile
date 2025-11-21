# ---------------- BUILD REACT (VITE) ----------------
FROM node:18-alpine AS build
WORKDIR /app

# Copy package.json + package-lock/pnpm-lock...
COPY package*.json ./

# Cài dependency
RUN npm install

# Copy toàn bộ source vào container
COPY . .

# Build dự án
RUN npm run build

# ---------------- SERVE WITH NGINX ----------------
FROM nginx:alpine

# Copy file build (dist) sang thư mục nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Tắt cache để tránh lỗi router SPA
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
