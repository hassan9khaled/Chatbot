# AI Assistant with Code Execution

A web-based AI assistant that can execute Python code, built with FastAPI, WebSockets, and Ollama's LLM.

## Features

- 💬 Real-time chat interface with WebSocket communication
- 🐍 Safe Python code execution with syntax highlighting
- 📋 Copy code blocks to clipboard
- 💾 Save code snippets to files
- ⏱️ Processing time indicators
- 📱 Responsive design
- ✨ Markdown formatting support

## Technologies

- **Backend**: Python, FastAPI, WebSockets
- **Frontend**: HTML5, CSS3, JavaScript
- **AI**: Ollama (Gemma 3B model)
- **Styling**: Modern CSS with variables

## Prerequisites

- Python 3.8+
- Ollama installed and running ([installation guide](https://ollama.ai))
- Node.js (optional, for development)

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/ai-assistant.git
   cd ai-assistant
   ```

2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Ensure Ollama is running with the Gemma 3B model:
   ```bash
   ollama pull gemma3:1b
   ollama run gemma3:1b
   ```

5. Run the application:
   ```bash
   uvicorn ai_assistant.main:app --host 0.0.0.0 --port 8000
   ```

6. Open `http://localhost:8000` in your browser.

## Project Structure

```
ai-assistant/
├── ai_assistant/
│   ├── config.py        # Configuration settings
│   ├── core/           # Core functionality
│   │   ├── agent.py
│   │   ├── code_executor.py
│   │   └── llm.py
│   ├── main.py         # FastAPI application
│   ├── static/         # Static files
│   └── templates/      # HTML templates
├── .gitignore
├── LICENSE
├── README.md
└── requirements.txt
```

## Development

- Format code: `black .`
- Lint: `flake8 .`
- Add tests in `tests/` directory

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.