from fastapi import APIRouter
from pydantic import BaseModel

from services.vector_store import search_similar_chunks
from services.rag import generate_answer

router = APIRouter()


class ChatRequest(BaseModel):
    question: str


@router.post("/chat")
async def chat(request: ChatRequest):
    relevant_chunks = search_similar_chunks(request.question, top_k=3)
    result = generate_answer(request.question, relevant_chunks)
    return result