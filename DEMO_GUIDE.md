# 演示指南 🎬

## Web界面演示流程

### 场景1：首次使用

1. **启动服务器**
   ```bash
   python main.py
   ```
   
2. **打开浏览器**
   - 访问: `http://localhost:8000`
   - 看到欢迎界面，显示三个特性卡片

3. **检查服务状态**
   - 左下角状态指示器应显示 🟢 "服务正常"

4. **选择AI模型**
   - 左侧边栏 → 模型选择
   - 选择 "GPT-4" 或 "Claude 3.5 Sonnet"

5. **开始对话**
   - 底部输入框输入: "你好，请介绍一下你自己"
   - 按Enter发送
   - 观察：
     - 发送按钮变为禁用状态
     - 出现打字动画（三个点跳动）
     - AI回复以Markdown格式显示

---

### 场景2：代码对话

1. **请求代码示例**
   ```
   用户输入: "写一个Python快速排序算法"
   ```

2. **查看效果**
   - AI回复包含代码块
   - 代码自动语法高亮
   - 代码块右上角有"复制代码"按钮

3. **复制代码**
   - 点击"复制代码"按钮
   - 按钮文字变为"已复制!"
   - 2秒后恢复

---

### 场景3：多轮对话

1. **继续上一个话题**
   ```
   用户: "写一个Python快速排序算法"
   AI: [返回代码]
   
   用户: "请解释一下时间复杂度"
   AI: [解释复杂度]
   
   用户: "有没有更简洁的写法？"
   AI: [提供优化版本]
   ```

2. **观察历史**
   - 所有对话保持在界面上
   - 可以滚动查看历史消息
   - 自动保存到浏览器本地

---

### 场景4：对话历史管理

1. **查看历史列表**
   - 左侧边栏 → 历史对话
   - 显示对话标题（首条用户消息前50字）
   - 显示对话时间

2. **切换对话**
   - 点击历史记录项
   - 加载该对话的所有消息
   - 可以继续该对话

3. **新建对话**
   - 点击左上角 ➕ 按钮
   - 当前对话自动保存
   - 显示新对话欢迎界面

4. **删除对话**
   - 鼠标悬停在历史记录上
   - 出现"删除"按钮
   - 点击删除，确认后移除

---

### 场景5：主题切换

1. **切换到深色主题**
   - 点击左下角"主题切换"按钮
   - 界面平滑过渡到深色模式
   - 所有元素颜色自动适配

2. **刷新页面**
   - 主题设置被保存
   - 重新打开仍是深色主题

3. **切换回浅色主题**
   - 再次点击主题切换
   - 恢复浅色模式

---

### 场景6：移动端体验

1. **调整浏览器窗口**
   - 缩小窗口到手机尺寸
   - 或在手机浏览器打开

2. **观察变化**
   - 侧边栏自动隐藏
   - 顶部出现汉堡菜单 ☰
   - 聊天区域占满屏幕

3. **使用菜单**
   - 点击汉堡菜单
   - 侧边栏滑入
   - 点击对话或空白处关闭

---

## API调用演示

### 场景7：命令行调用

1. **健康检查**
   ```bash
   curl http://localhost:8000/health
   ```
   
   预期输出:
   ```json
   {
     "status": "healthy",
     "cursor_api_configured": true
   }
   ```

2. **获取模型列表**
   ```bash
   curl http://localhost:8000/models
   ```
   
   预期输出:
   ```json
   {
     "models": [
       {
         "id": "gpt-4",
         "name": "GPT-4",
         "provider": "OpenAI",
         "description": "最强大的GPT-4模型"
       },
       ...
     ]
   }
   ```

3. **发送聊天请求**
   ```bash
   curl -X POST http://localhost:8000/chat \
     -H "Content-Type: application/json" \
     -d '{
       "model": "gpt-4",
       "messages": [
         {"role": "user", "content": "你好"}
       ]
     }'
   ```

4. **使用不同模型**
   ```bash
   curl -X POST http://localhost:8000/chat \
     -H "Content-Type: application/json" \
     -d '{
       "model": "claude-3-5-sonnet-20241022",
       "messages": [
         {"role": "user", "content": "介绍一下Claude"}
       ]
     }'
   ```

---

### 场景8：Python脚本调用

创建测试脚本 `test_chat.py`:

```python
import requests
import json

def chat(message, model="gpt-4"):
    url = "http://localhost:8000/chat"
    data = {
        "model": model,
        "messages": [
            {"role": "user", "content": message}
        ]
    }
    
    response = requests.post(url, json=data)
    result = response.json()
    
    return result["choices"][0]["message"]["content"]

# 测试
print("GPT-4说:", chat("你好", "gpt-4"))
print("\nClaude说:", chat("你好", "claude-3-5-sonnet-20241022"))
```

运行:
```bash
python test_chat.py
```

---

### 场景9：使用内置测试脚本

```bash
# 测试本地服务器
python test_proxy.py

# 测试局域网服务器
python test_proxy.py http://192.168.1.100:8000

# 测试启用认证的服务器
python test_proxy.py http://192.168.1.100:8000 your-auth-token
```

---

## 局域网演示

### 场景10：多设备访问

1. **服务器端（电脑A）**
   ```bash
   # 启动服务
   python main.py
   
   # 查看IP地址
   ifconfig | grep "inet "
   # 假设得到: 192.168.1.100
   ```

2. **客户端1（电脑B）**
   ```
   浏览器访问: http://192.168.1.100:8000
   选择模型: GPT-4
   发送消息: "电脑B测试"
   ```

3. **客户端2（手机）**
   ```
   浏览器访问: http://192.168.1.100:8000
   选择模型: Claude 3.5 Sonnet
   发送消息: "手机测试"
   ```

4. **观察效果**
   - 所有设备独立使用
   - 各自的对话历史
   - 各自的主题设置
   - 共享同一个API服务

---

## 错误处理演示

### 场景11：无效的API密钥

1. **修改配置**
   ```bash
   # 在.env中设置无效密钥
   CURSOR_API_KEY=invalid-key
   ```

2. **重启服务器**
   ```bash
   python main.py
   ```

3. **发送消息**
   - Web界面会显示错误提示
   - 错误信息: "❌ 错误: [具体错误信息]"
   - 日志中记录详细错误

### 场景12：网络超时

1. **观察超时处理**
   - 发送复杂请求可能超时
   - 显示: "❌ 错误: 请求超时"
   - 建议用户重试

### 场景13：速率限制

1. **快速发送多条消息**
   - 超过限制（默认60次/分钟）
   - 返回429错误
   - 提示用户稍后重试

---

## 性能测试

### 场景14：并发请求

使用 Apache Bench 测试:

```bash
# 安装ab
sudo apt-get install apache2-utils

# 测试健康检查端点
ab -n 1000 -c 10 http://localhost:8000/health

# 查看结果
# Requests per second: [查看QPS]
# Time per request: [查看延迟]
```

### 场景15：长对话测试

1. **发送长文本**
   ```
   用户: [粘贴一整篇文章]
   AI: [处理并返回分析]
   ```

2. **多轮深度对话**
   - 连续10轮以上对话
   - 观察响应时间
   - 检查内存使用

---

## 日志监控演示

### 场景16：实时日志

1. **开启日志监控**
   ```bash
   tail -f logs/proxy.log
   ```

2. **发送请求**
   - 在Web界面发送消息
   - 观察日志输出:
   ```
   2025-10-01 12:00:00 | INFO | 聊天请求: model=gpt-4 来自: 127.0.0.1
   2025-10-01 12:00:02 | INFO | 聊天响应: 200
   ```

3. **查看错误日志**
   ```bash
   grep ERROR logs/proxy.log
   ```

---

## Docker演示

### 场景17：Docker部署

1. **构建镜像**
   ```bash
   docker build -t cursor-api-proxy .
   ```

2. **运行容器**
   ```bash
   docker run -d \
     -p 8000:8000 \
     -e CURSOR_API_KEY=your-key \
     -v $(pwd)/logs:/app/logs \
     --name cursor-proxy \
     cursor-api-proxy
   ```

3. **查看日志**
   ```bash
   docker logs -f cursor-proxy
   ```

4. **停止容器**
   ```bash
   docker stop cursor-proxy
   docker rm cursor-proxy
   ```

---

## 故障排查演示

### 场景18：端口被占用

```bash
# 模拟错误
python main.py &  # 启动第一个实例
python main.py    # 尝试启动第二个 - 失败

# 解决
# 方法1: 修改端口
export SERVER_PORT=8001
python main.py

# 方法2: 停止占用进程
lsof -i :8000
kill [PID]
```

---

## 最佳实践演示

### 场景19：生产环境部署

1. **启用认证**
   ```bash
   # .env
   ENABLE_AUTH=true
   AUTH_TOKEN=super-secret-token-2025
   ```

2. **使用多Worker**
   ```bash
   ./start_prod.sh
   ```

3. **配置Nginx反向代理**
   ```nginx
   server {
       listen 80;
       server_name cursor-ai.local;
       
       location / {
           proxy_pass http://localhost:8000;
       }
   }
   ```

4. **设置systemd服务**
   ```bash
   sudo systemctl enable cursor-proxy
   sudo systemctl start cursor-proxy
   ```

---

## 总结

通过以上场景，您可以：
- ✅ 完整测试所有功能
- ✅ 验证性能表现
- ✅ 了解错误处理
- ✅ 掌握部署流程
- ✅ 学习最佳实践

**现在开始您的演示吧！** 🎉
