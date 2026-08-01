from fastapi import APIRouter, UploadFile, File
from typing import List
import os

from config import UPLOAD_DIR
from services.parser import extract_text_from_pdf
from services.chunker import chunk_text
from services.vector_store import add_chunks_to_index, clear_index, remove_file_from_index

router = APIRouter()


@router.post("/upload")
async def upload_pdfs(files: List[UploadFile] = File(...)):
    all_data = []

    for file in files:
        file_path = os.path.join(UPLOAD_DIR, file.filename)

        with open(file_path, "wb") as f:
            content = await file.read()
            f.write(content)

        try:
            text = extract_text_from_pdf(file_path)
            chunks = chunk_text(text)
            add_chunks_to_index(file.filename, chunks)

            all_data.append({
                "filename": file.filename,
                "status": "success",
                "num_chunks": len(chunks)
            })
        except Exception as e:
            all_data.append({
                "filename": file.filename,
                "status": "failed",
                "error": "Unable to read this PDF. It may be password-protected or corrupted."
            })

    return {"files_processed": len(files), "data": all_data}


@router.delete("/clear")
async def clear_all_documents():
    clear_index()
    return {"message": "All documents cleared successfully"}


@router.delete("/remove/{filename}")
async def remove_document(filename: str):
    remove_file_from_index(filename)
    return {"message": f"{filename} removed successfully"}