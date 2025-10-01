# Dockerfile for Cursor API Proxy
FROM python:3.11-slim

# 设置工作目录
WORKDIR /app

# 安装依赖
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 复制应用文件
COPY main.py .
COPY config.py .

# 创建日志目录
RUN mkdir -p logs

# 暴露端口
EXPOSE 8000

# 环境变量
ENV SERVER_HOST=0.0.0.0
ENV SERVER_PORT=8000
ENV LOG_LEVEL=INFO

# 启动命令
CMD ["python", "main.py"]
