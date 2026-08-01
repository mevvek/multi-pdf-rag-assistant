from fastapi import FastAPI
from routes import upload, chat

app = FastAPI(title="Multi-PDF RAG Assistant")

app.include_router(upload.router)
app.include_router(chat.router)


@app.get("/")
def read_root():
    return {"message": "Multi-PDF RAG Assistant API is running."}