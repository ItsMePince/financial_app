# Stage 1: Build React App
FROM node:20 AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build   # CRA = build ไปที่ build/ , Vite = dist/

# Stage 2: Run with Nginx
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html   
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
