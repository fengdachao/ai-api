# 快速开始指南 🚀

## 5分钟部署指南

### 步骤1：克隆/下载项目

```bash
# 如果使用git
git clone <your-repo-url>
cd cursor-api-proxy

# 或直接解压下载的文件
cd cursor-api-proxy
```

### 步骤2：安装依赖

```bash
pip install -r requirements.txt
```

### 步骤3：配置环境变量

```bash
# 复制配置文件
cp .env.example .env

# 编辑配置文件，至少需要设置 CURSOR_API_KEY
nano .env
```

**最小配置示例：**
```bash
CURSOR_API_KEY=sk-your-actual-cursor-api-key-here
```

### 步骤4：启动服务

```bash
python main.py
```

或使用启动脚本：
```bash
chmod +x start.sh
./start.sh
```

### 步骤5：开始使用

打开浏览器访问：
```
http://localhost:8000
```

🎉 **完成！** 现在您可以开始使用AI聊天界面了。

---

## 局域网访问设置

### 1. 查看服务器IP

**Linux/Mac:**
```bash
ifconfig | grep "inet "
# 或
ip addr show
```

**Windows:**
```bash
ipconfig
```

找到类似 `192.168.x.x` 的局域网IP地址。

### 2. 确保防火墙允许访问

**Linux (UFW):**
```bash
sudo ufw allow 8000/tcp
```

**Windows:**
- 控制面板 → Windows防火墙 → 高级设置
- 入站规则 → 新建规则 → 端口 → TCP 8000

### 3. 局域网其他设备访问

在同一局域网的任何设备上，打开浏览器访问：
```
http://your-server-ip:8000
```

例如：`http://192.168.1.100:8000`

---

## 常见问题解决

### ❌ 问题1：启动失败 - 端口被占用

**错误信息：** `Address already in use`

**解决方案：**
```bash
# 查找占用8000端口的进程
lsof -i :8000
# 或
netstat -tuln | grep 8000

# 修改端口（在.env中）
SERVER_PORT=8001
```

### ❌ 问题2：API调用失败

**错误信息：** `聊天请求错误` 或 `502 Bad Gateway`

**解决方案：**
1. 检查 CURSOR_API_KEY 是否正确
2. 检查网络连接
3. 查看日志：`tail -f logs/proxy.log`

### ❌ 问题3：Web界面无法访问

**解决方案：**
1. 确认服务器已启动：`curl http://localhost:8000/health`
2. 检查防火墙设置
3. 确认 `static/` 目录存在且包含文件

### ❌ 问题4：模型调用失败

**可能原因：**
- 模型ID不正确
- API密钥权限不足
- 模型暂时不可用

**解决方案：**
1. 使用推荐的模型ID（见README模型列表）
2. 检查API密钥权限
3. 查看日志获取详细错误信息

---

## 高级配置

### Docker部署

```bash
# 构建镜像
docker build -t cursor-api-proxy .

# 运行容器
docker run -d \
  -p 8000:8000 \
  -e CURSOR_API_KEY=your-key-here \
  -v $(pwd)/logs:/app/logs \
  --name cursor-proxy \
  cursor-api-proxy
```

或使用Docker Compose：

```bash
# 创建.env文件后
docker-compose up -d
```

### 启用认证

在 `.env` 中设置：

```bash
ENABLE_AUTH=true
AUTH_TOKEN=your-secret-token-here
```

前端访问时会提示输入认证token（如果Web界面支持），或在API请求中添加：

```bash
curl -H "Authorization: Bearer your-secret-token-here" \
  http://localhost:8000/chat
```

### 调整性能

**增加Worker数量（生产环境）：**
```bash
SERVER_WORKERS=8  # 根据CPU核心数调整
./start_prod.sh
```

**调整速率限制：**
```bash
RATE_LIMIT=120  # 每分钟120次请求
```

---

## 下一步

- 📖 阅读完整文档：[README.md](README.md)
- 🔧 查看配置选项：[.env.example](.env.example)
- 📊 访问API文档：http://localhost:8000/docs
- 💬 使用Web聊天：http://localhost:8000

**享受使用AI的乐趣！** 🎉
