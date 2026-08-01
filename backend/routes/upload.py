from fastapi import APIRouter, UploadFile, File, HTTPException
from typing import List
import os

from config import UPLOAD_DIR, logger
from services.parser import extract_text_from_pdf
from services.chunker import chunk_text
from services.vector_store import add_chunks_to_index, clear_index, remove_file_from_index

router = APIRouter()

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB per file
PDF_SIGNATURE = b"%PDF-"


@router.post("/upload")
async def upload_pdfs(files: List[UploadFile] = File(...)):
    all_data = []

    for file in files:
        content = await file.read()

        if not content.startswith(PDF_SIGNATURE):
            all_data.append({
                "filename": file.filename,
                "status": "failed",
                "error": "This file is not a valid PDF."
            })
            continue

        if len(content) > MAX_FILE_SIZE:
            all_data.append({
                "filename": file.filename,
                "status": "failed",
                "error": "File exceeds the 10 MB size limit."
            })
            continue

        safe_filename = os.path.basename(file.filename)
        file_path = os.path.join(UPLOAD_DIR, safe_filename)

        with open(file_path, "wb") as f:
            f.write(content)

        try:
            text = extract_text_from_pdf(file_path)
            chunks = chunk_text(text)
            add_chunks_to_index(safe_filename, chunks)

            all_data.append({
                "filename": safe_filename,
                "status": "success",
                "num_chunks": len(chunks)
            })
        except Exception as e:
            logger.error(f"Failed to process {safe_filename}: {str(e)}", exc_info=True)
            all_data.append({
                "filename": safe_filename,
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
    safe_filename = os.path.basename(filename)
    remove_file_from_index(safe_filename)
    return {"message": f"{safe_filename} removed successfully"}