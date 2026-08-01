from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field, field_validator

from services.vector_store import search_similar_chunks
from services.rag import generate_answer
from config import logger

router = APIRouter()


class ChatRequest(BaseModel):
    question: str = Field(..., min_length=1, max_length=1000)

    @field_validator("question")
    @classmethod
    def question_must_not_be_blank(cls, v):
        if not v.strip():
            raise ValueError("Question cannot be empty or only whitespace")
        return v.strip()


@router.post("/chat")
async def chat(request: ChatRequest):
    try:
        relevant_chunks = search_similar_chunks(request.question, top_k=3)
        result = generate_answer(request.question, relevant_chunks)
        return result
    except Exception as e:
        logger.error(f"Chat endpoint failed: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="Something went wrong while generating the answer. Please try again."
        )