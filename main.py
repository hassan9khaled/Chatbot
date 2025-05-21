from fastapi import FastAPI, Request, WebSocket, WebSocketDisconnect
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from core.agent import CodeAgent
from config import settings


app = FastAPI(title="ai_assistant", version="0.1.0")

app.mount("/static", StaticFiles(directory=settings.static_dir), name="static")
templates = Jinja2Templates(directory=settings.templates_dir)

agent = CodeAgent()


@app.get("/")
async def get_root(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    conversation_history = []

    try:
        while True:
            user_message = await websocket.receive_text()
            response_data = await agent.process_message(
                user_message, conversation_history
            )
            await websocket.send_json(response_data)
    except WebSocketDisconnect:
        print("Client disconnected")