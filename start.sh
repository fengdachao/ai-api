#!/bin/bash
# 启动脚本

# 创建日志目录
mkdir -p logs

# 检查.env文件
if [ ! -f .env ]; then
    echo "错误: .env 文件不存在"
    echo "请复制 .env.example 到 .env 并配置相关参数"
    exit 1
fi

# 启动服务器
echo "正在启动 Cursor API 代理服务器..."
python3 main.py
