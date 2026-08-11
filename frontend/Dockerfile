# Stage 1: build the frontend
FROM node:latest AS build
WORKDIR /app

COPY package*.json ./
COPY index.html ./
COPY tsconfig.json ./
COPY tsconfig.app.json ./
COPY tsconfig.node.json ./
COPY vite.config.ts ./
COPY ./src ./src
COPY ./public ./public

RUN npm install
RUN npm run build

# Stage 2: serve with nginx
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
