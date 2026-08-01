from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import upload, chat

app = FastAPI(title="Multi-PDF RAG Assistant")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload.router)
app.include_router(chat.router)


@app.get("/")
def read_root():
    return {"message": "Multi-PDF RAG Assistant API is running."}