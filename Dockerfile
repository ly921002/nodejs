# syntax=docker/dockerfile:1

FROM node:20-slim

# ===== 基础环境 =====
ENV NODE_ENV=production
WORKDIR /app

# 避免 tzdata / apt 交互
ENV DEBIAN_FRONTEND=noninteractive

# ===== 仅安装必要依赖 =====
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    curl \
    unzip \
 && rm -rf /var/lib/apt/lists/*

# ===== 先拷贝 package 文件（利用缓存）=====
COPY package*.json ./
RUN npm ci --omit=dev

# ===== 拷贝源码 =====
COPY . .

# ===== 默认端口（HTTP 服务）=====
EXPOSE 3000

# ===== 启动 =====
CMD ["node", "index.js"]
