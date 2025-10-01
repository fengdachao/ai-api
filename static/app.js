// 应用状态
const AppState = {
    currentModel: 'gpt-4',
    messages: [],
    isLoading: false,
    conversationHistory: [],
    currentConversationId: null,
};

// DOM元素
const elements = {
    chatMessages: document.getElementById('chatMessages'),
    messageInput: document.getElementById('messageInput'),
    sendBtn: document.getElementById('sendBtn'),
    modelSelect: document.getElementById('modelSelect'),
    currentModelBadge: document.getElementById('currentModelBadge'),
    newChatBtn: document.getElementById('newChatBtn'),
    themeToggle: document.getElementById('themeToggle'),
    statusDot: document.getElementById('statusDot'),
    statusText: document.getElementById('statusText'),
    historyList: document.getElementById('historyList'),
    mobileMenuToggle: document.getElementById('mobileMenuToggle'),
    sidebar: document.getElementById('sidebar'),
};

// 工具函数
const utils = {
    // 格式化时间
    formatTime(date = new Date()) {
        return date.toLocaleTimeString('zh-CN', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    },

    // 生成唯一ID
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },

    // 从LocalStorage加载数据
    loadFromStorage(key, defaultValue = null) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : defaultValue;
        } catch (e) {
            console.error('Failed to load from storage:', e);
            return defaultValue;
        }
    },

    // 保存到LocalStorage
    saveToStorage(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
            console.error('Failed to save to storage:', e);
        }
    },

    // Markdown渲染配置
    setupMarked() {
        marked.setOptions({
            breaks: true,
            gfm: true,
            highlight: function(code, lang) {
                if (lang && hljs.getLanguage(lang)) {
                    try {
                        return hljs.highlight(code, { language: lang }).value;
                    } catch (e) {
                        console.error('Highlight error:', e);
                    }
                }
                return hljs.highlightAuto(code).value;
            }
        });
    }
};

// API调用
const api = {
    // 检查服务状态
    async checkHealth() {
        try {
            const response = await fetch('/health');
            const data = await response.json();
            return data.status === 'healthy';
        } catch (e) {
            console.error('Health check failed:', e);
            return false;
        }
    },

    // 获取模型列表
    async getModels() {
        try {
            const response = await fetch('/models');
            const data = await response.json();
            return data.models || [];
        } catch (e) {
            console.error('Failed to get models:', e);
            return [];
        }
    },

    // 发送聊天消息
    async sendMessage(messages, model) {
        const response = await fetch('/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: model,
                messages: messages,
                stream: false
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || '请求失败');
        }

        return await response.json();
    }
};

// UI更新函数
const ui = {
    // 更新状态指示器
    updateStatus(isOnline) {
        elements.statusDot.className = 'status-dot ' + (isOnline ? 'online' : 'offline');
        elements.statusText.textContent = isOnline ? '服务正常' : '服务离线';
    },

    // 清空聊天界面
    clearChat() {
        const welcomeScreen = elements.chatMessages.querySelector('.welcome-screen');
        if (welcomeScreen) {
            welcomeScreen.remove();
        }
    },

    // 添加消息到界面
    addMessage(role, content, time = new Date()) {
        this.clearChat();

        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${role}`;
        
        const avatar = role === 'user' ? '👤' : '🤖';
        const roleName = role === 'user' ? '用户' : 'AI助手';
        
        // 如果是assistant的消息，使用Markdown渲染
        const renderedContent = role === 'assistant' 
            ? marked.parse(content)
            : `<p>${content.replace(/\n/g, '<br>')}</p>`;
        
        messageDiv.innerHTML = `
            <div class="message-avatar">${avatar}</div>
            <div class="message-content">
                <div class="message-header">
                    <span class="message-role">${roleName}</span>
                    <span class="message-time">${utils.formatTime(time)}</span>
                </div>
                <div class="message-text">${renderedContent}</div>
                ${role === 'assistant' ? `
                    <div class="message-actions">
                        <button class="btn-action copy-btn" onclick="ui.copyMessage(this)">复制</button>
                    </div>
                ` : ''}
            </div>
        `;
        
        elements.chatMessages.appendChild(messageDiv);
        this.scrollToBottom();

        // 高亮代码块
        messageDiv.querySelectorAll('pre code').forEach((block) => {
            hljs.highlightElement(block);
            this.addCopyButtonToCode(block.parentElement);
        });
    },

    // 为代码块添加复制按钮
    addCopyButtonToCode(preElement) {
        const button = document.createElement('button');
        button.className = 'btn-action';
        button.textContent = '复制代码';
        button.style.position = 'absolute';
        button.style.top = '8px';
        button.style.right = '8px';
        button.onclick = () => {
            const code = preElement.querySelector('code').textContent;
            navigator.clipboard.writeText(code).then(() => {
                button.textContent = '已复制!';
                setTimeout(() => button.textContent = '复制代码', 2000);
            });
        };
        preElement.style.position = 'relative';
        preElement.appendChild(button);
    },

    // 复制消息
    copyMessage(button) {
        const messageText = button.closest('.message-content').querySelector('.message-text');
        const text = messageText.textContent;
        navigator.clipboard.writeText(text).then(() => {
            button.textContent = '已复制!';
            setTimeout(() => button.textContent = '复制', 2000);
        });
    },

    // 显示加载动画
    showLoading() {
        this.clearChat();
        
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'message assistant';
        loadingDiv.id = 'loading-message';
        loadingDiv.innerHTML = `
            <div class="message-avatar">🤖</div>
            <div class="message-content">
                <div class="message-header">
                    <span class="message-role">AI助手</span>
                    <span class="message-time">${utils.formatTime()}</span>
                </div>
                <div class="typing-indicator">
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                </div>
            </div>
        `;
        
        elements.chatMessages.appendChild(loadingDiv);
        this.scrollToBottom();
    },

    // 移除加载动画
    hideLoading() {
        const loading = document.getElementById('loading-message');
        if (loading) loading.remove();
    },

    // 滚动到底部
    scrollToBottom() {
        elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
    },

    // 显示错误消息
    showError(message) {
        this.hideLoading();
        this.addMessage('assistant', `❌ 错误: ${message}`);
    },

    // 更新历史记录列表
    updateHistoryList() {
        const history = AppState.conversationHistory;
        
        if (history.length === 0) {
            elements.historyList.innerHTML = '<p class="empty-hint">暂无历史记录</p>';
            return;
        }
        
        elements.historyList.innerHTML = history.map(conv => `
            <div class="history-item" onclick="app.loadConversation('${conv.id}')">
                <div class="history-item-title">${conv.title}</div>
                <div class="history-item-time">${new Date(conv.timestamp).toLocaleString('zh-CN')}</div>
                <button class="history-item-delete" onclick="event.stopPropagation(); app.deleteConversation('${conv.id}')">删除</button>
            </div>
        `).join('');
    },

    // 自动调整输入框高度
    autoResizeTextarea() {
        elements.messageInput.style.height = 'auto';
        elements.messageInput.style.height = elements.messageInput.scrollHeight + 'px';
    }
};

// 应用主逻辑
const app = {
    // 初始化
    async init() {
        utils.setupMarked();
        this.loadSettings();
        this.bindEvents();
        await this.loadModels();
        await this.checkStatus();
        
        // 定期检查服务状态
        setInterval(() => this.checkStatus(), 30000);
    },

    // 加载设置
    loadSettings() {
        // 加载主题
        const theme = utils.loadFromStorage('theme', 'light');
        document.documentElement.setAttribute('data-theme', theme);
        
        // 加载对话历史
        AppState.conversationHistory = utils.loadFromStorage('conversationHistory', []);
        ui.updateHistoryList();
        
        // 加载当前模型
        const savedModel = utils.loadFromStorage('currentModel', 'gpt-4');
        AppState.currentModel = savedModel;
        elements.modelSelect.value = savedModel;
        elements.currentModelBadge.textContent = savedModel.toUpperCase();
    },

    // 绑定事件
    bindEvents() {
        // 发送消息
        elements.sendBtn.addEventListener('click', () => this.sendMessage());
        
        // 输入框回车发送
        elements.messageInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        
        // 自动调整输入框高度
        elements.messageInput.addEventListener('input', () => {
            ui.autoResizeTextarea();
        });
        
        // 模型选择
        elements.modelSelect.addEventListener('change', (e) => {
            AppState.currentModel = e.target.value;
            elements.currentModelBadge.textContent = e.target.value.toUpperCase();
            utils.saveToStorage('currentModel', e.target.value);
        });
        
        // 新对话
        elements.newChatBtn.addEventListener('click', () => this.startNewChat());
        
        // 主题切换
        elements.themeToggle.addEventListener('click', () => this.toggleTheme());
        
        // 移动端菜单
        elements.mobileMenuToggle.addEventListener('click', () => {
            elements.sidebar.classList.toggle('active');
        });
    },

    // 加载模型列表
    async loadModels() {
        const models = await api.getModels();
        if (models.length > 0) {
            elements.modelSelect.innerHTML = models.map(m => 
                `<option value="${m.id}">${m.name} - ${m.description}</option>`
            ).join('');
            
            // 恢复选中的模型
            elements.modelSelect.value = AppState.currentModel;
        }
    },

    // 检查服务状态
    async checkStatus() {
        const isOnline = await api.checkHealth();
        ui.updateStatus(isOnline);
    },

    // 发送消息
    async sendMessage() {
        const content = elements.messageInput.value.trim();
        if (!content || AppState.isLoading) return;
        
        // 添加用户消息
        AppState.messages.push({
            role: 'user',
            content: content
        });
        
        ui.addMessage('user', content);
        elements.messageInput.value = '';
        ui.autoResizeTextarea();
        
        // 显示加载
        AppState.isLoading = true;
        elements.sendBtn.disabled = true;
        ui.showLoading();
        
        try {
            // 调用API
            const response = await api.sendMessage(
                AppState.messages,
                AppState.currentModel
            );
            
            // 添加AI回复
            const assistantMessage = response.choices[0].message.content;
            AppState.messages.push({
                role: 'assistant',
                content: assistantMessage
            });
            
            ui.hideLoading();
            ui.addMessage('assistant', assistantMessage);
            
            // 保存对话
            this.saveCurrentConversation();
            
        } catch (error) {
            console.error('Send message error:', error);
            ui.showError(error.message || '发送消息失败，请稍后重试');
        } finally {
            AppState.isLoading = false;
            elements.sendBtn.disabled = false;
            elements.messageInput.focus();
        }
    },

    // 开始新对话
    startNewChat() {
        if (AppState.messages.length > 0) {
            this.saveCurrentConversation();
        }
        
        AppState.messages = [];
        AppState.currentConversationId = null;
        elements.chatMessages.innerHTML = `
            <div class="welcome-screen">
                <div class="welcome-icon">🤖</div>
                <h2>新的对话</h2>
                <p>开始一个全新的AI对话</p>
            </div>
        `;
    },

    // 保存当前对话
    saveCurrentConversation() {
        if (AppState.messages.length === 0) return;
        
        const firstUserMessage = AppState.messages.find(m => m.role === 'user');
        const title = firstUserMessage 
            ? firstUserMessage.content.substring(0, 50) + (firstUserMessage.content.length > 50 ? '...' : '')
            : '未命名对话';
        
        const conversation = {
            id: AppState.currentConversationId || utils.generateId(),
            title: title,
            messages: AppState.messages,
            model: AppState.currentModel,
            timestamp: Date.now()
        };
        
        // 更新或添加对话
        const index = AppState.conversationHistory.findIndex(c => c.id === conversation.id);
        if (index >= 0) {
            AppState.conversationHistory[index] = conversation;
        } else {
            AppState.conversationHistory.unshift(conversation);
        }
        
        // 限制历史记录数量
        if (AppState.conversationHistory.length > 50) {
            AppState.conversationHistory = AppState.conversationHistory.slice(0, 50);
        }
        
        AppState.currentConversationId = conversation.id;
        utils.saveToStorage('conversationHistory', AppState.conversationHistory);
        ui.updateHistoryList();
    },

    // 加载对话
    loadConversation(id) {
        const conversation = AppState.conversationHistory.find(c => c.id === id);
        if (!conversation) return;
        
        AppState.currentConversationId = id;
        AppState.messages = [...conversation.messages];
        AppState.currentModel = conversation.model;
        
        elements.modelSelect.value = conversation.model;
        elements.currentModelBadge.textContent = conversation.model.toUpperCase();
        
        // 重新渲染消息
        elements.chatMessages.innerHTML = '';
        conversation.messages.forEach(msg => {
            ui.addMessage(msg.role, msg.content);
        });
        
        // 关闭移动端菜单
        elements.sidebar.classList.remove('active');
    },

    // 删除对话
    deleteConversation(id) {
        if (!confirm('确定要删除这个对话吗？')) return;
        
        AppState.conversationHistory = AppState.conversationHistory.filter(c => c.id !== id);
        utils.saveToStorage('conversationHistory', AppState.conversationHistory);
        ui.updateHistoryList();
        
        if (AppState.currentConversationId === id) {
            this.startNewChat();
        }
    },

    // 切换主题
    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        utils.saveToStorage('theme', newTheme);
    }
};

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    app.init();
});
