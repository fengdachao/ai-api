#!/bin/bash
# 生产环境启动脚本（使用多worker）

# 创建日志目录
mkdir -p logs

# 检查.env文件
if [ ! -f .env ]; then
    echo "错误: .env 文件不存在"
    echo "请复制 .env.example 到 .env 并配置相关参数"
    exit 1
fi

# 读取配置
source .env

# 使用uvicorn启动（多worker）
echo "正在启动 Cursor API 代理服务器 (生产模式)..."
uvicorn main:app \
    --host ${SERVER_HOST:-0.0.0.0} \
    --port ${SERVER_PORT:-8000} \
    --workers ${SERVER_WORKERS:-4} \
    --log-level ${LOG_LEVEL:-info}
