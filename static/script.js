class ChatUI {
    constructor() {
        this.chatMessages = document.getElementById('chat-messages');
        this.userInput = document.getElementById('user-input');
        this.sendButton = document.getElementById('send-button');
        this.isProcessing = false;
        this.socket = new WebSocket(`ws://${window.location.host}/ws`);
        this.setupEventListeners();
        this.addMessage("Hello! I'm your AI assistant. How can I help you today?", false);
    }

    setupEventListeners() {
        this.userInput.addEventListener('input', () => {
            this.userInput.style.height = 'auto';
            this.userInput.style.height = `${Math.min(this.userInput.scrollHeight, 150)}px`;
        });

        this.sendButton.addEventListener('click', () => this.sendMessage());
        this.userInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        this.socket.onmessage = (event) => {
            this.removeTypingIndicator();
            const response = JSON.parse(event.data);
            this.addMessage(response, false);
            this.isProcessing = false;
        };

        this.socket.onclose = () => {
            this.removeTypingIndicator();
            this.addMessage("Connection lost. Please refresh the page.", false);
            this.isProcessing = false;
        };
    }

    escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    showToast(message) {
        const toast = document.createElement('div');
        toast.classList.add('toast');
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => toast.classList.add('show'), 10);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => document.body.removeChild(toast), 300);
        }, 3000);
    }

    copyToClipboard(text) {
        navigator.clipboard.writeText(text)
            .then(() => this.showToast("Code copied to clipboard!"))
            .catch(err => {
                console.error('Failed to copy: ', err);
                this.showToast("Failed to copy code");
            });
    }

    saveToFile(content, filename) {
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        this.showToast(`File saved as ${filename}`);
    }

    showTypingIndicator() {
        const indicatorDiv = document.createElement('div');
        indicatorDiv.classList.add('message');
        indicatorDiv.id = 'typing-indicator';

        const avatar = document.createElement('div');
        avatar.classList.add('message-avatar');
        avatar.textContent = '🤖';

        const contentDiv = document.createElement('div');
        contentDiv.classList.add('message-content');

        const typingDiv = document.createElement('div');
        typingDiv.classList.add('typing-indicator');
        typingDiv.innerHTML = `
            <p>Thinking</p>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
        `;

        contentDiv.appendChild(typingDiv);
        indicatorDiv.appendChild(avatar);
        indicatorDiv.appendChild(contentDiv);
        this.chatMessages.appendChild(indicatorDiv);
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }

    removeTypingIndicator() {
        const indicator = document.getElementById('typing-indicator');
        if (indicator) {
            indicator.remove();
        }
    }

    addMessage(content, isUser) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message');
        if (isUser) messageDiv.classList.add('user-message');

        const contentDiv = document.createElement('div');
        contentDiv.classList.add('message-content');
        
        const avatar = document.createElement('div');
        avatar.classList.add('message-avatar');
        avatar.textContent = isUser ? '👤' : '🤖';

        const textDiv = document.createElement('div');
        textDiv.classList.add('message-text');

        if (typeof content === 'string') {
            let formattedContent = content
                .replace(/```python\n([^`]+)```/gs, '<pre>$1</pre>')
                .replace(/```\n([^`]+)```/gs, '<pre>$1</pre>')
                .replace(/`([^`]+)`/g, '<code>$1</code>')
                .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                .replace(/\*(.+?)\*/g, '<em>$1</em>')
                .replace(/\n\n/g, '</p><p>')
                .replace(/\n/g, '<br>');

            textDiv.innerHTML = `<p>${formattedContent}</p>`;
        } else {
            let formattedContent = content.content
                .replace(/```python\n([^`]+)```/gs, (match, code) => {
                    return `<div class="code-block-wrapper"><pre>${this.escapeHtml(code)}</pre></div>`;
                })
                .replace(/```\n([^`]+)```/gs, (match, code) => {
                    return `<div class="code-block-wrapper"><pre>${this.escapeHtml(code)}</pre></div>`;
                })
                .replace(/`([^`]+)`/g, '<code>$1</code>')
                .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                .replace(/\*(.+?)\*/g, '<em>$1</em>')
                .replace(/\n\n/g, '</p><p>')
                .replace(/\n/g, '<br>');

            textDiv.innerHTML = `<p>${formattedContent}</p>`;

            if (content.processing_time) {
                const timeDiv = document.createElement('div');
                timeDiv.classList.add('processing-time');
                timeDiv.textContent = `Processed in ${content.processing_time}`;
                textDiv.appendChild(timeDiv);
            }

            if (content.execution_result) {
                const resultDiv = document.createElement('div');
                resultDiv.classList.add('execution-result');
                resultDiv.innerHTML = `<strong>Code execution result:</strong><pre>${this.escapeHtml(content.execution_result)}</pre>`;
                textDiv.appendChild(resultDiv);
            }

            if (content.code_blocks && content.code_blocks.length > 0) {
                setTimeout(() => {
                    const codeBlocks = textDiv.querySelectorAll('pre');
                    codeBlocks.forEach((block, index) => {
                        const code = content.code_blocks[index];
                        if (code) {
                            const actionsDiv = document.createElement('div');
                            actionsDiv.classList.add('code-block-actions');

                            const copyBtn = document.createElement('button');
                            copyBtn.classList.add('code-action-btn');
                            copyBtn.title = "Copy to clipboard";
                            copyBtn.innerHTML = '<i class="far fa-copy"></i>';
                            copyBtn.addEventListener('click', () => this.copyToClipboard(code));

                            const saveBtn = document.createElement('button');
                            saveBtn.classList.add('code-action-btn');
                            saveBtn.title = "Save to file";
                            saveBtn.innerHTML = '<i class="far fa-save"></i>';
                            saveBtn.addEventListener('click', () => this.saveToFile(code, `code_${Date.now()}.py`));

                            actionsDiv.appendChild(copyBtn);
                            actionsDiv.appendChild(saveBtn);
                            block.appendChild(actionsDiv);
                        }
                    });
                }, 0);
            }
        }

        contentDiv.appendChild(textDiv);
        messageDiv.appendChild(avatar);
        messageDiv.appendChild(contentDiv);
        this.chatMessages.appendChild(messageDiv);
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }

    async sendMessage() {
        const message = this.userInput.value.trim();
        if (message && !this.isProcessing) {
            this.isProcessing = true;
            this.userInput.value = '';
            this.userInput.style.height = 'auto';

            this.addMessage(message, true);
            this.showTypingIndicator();

            try {
                this.socket.send(message);
            } catch (error) {
                console.error('WebSocket error:', error);
                this.removeTypingIndicator();
                this.addMessage("Connection error. Please try again.", false);
                this.isProcessing = false;
            }
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new ChatUI();
});