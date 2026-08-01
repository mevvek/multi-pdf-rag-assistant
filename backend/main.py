from fastapi import FastAPI, UploadFile, File
from typing import List
import pdfplumber
import os

app = FastAPI()

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

CHUNK_SIZE = 500      # characters per chunk
CHUNK_OVERLAP = 50    # overlap between chunks


def chunk_text(text: str, chunk_size: int = CHUNK_SIZE, overlap: int = CHUNK_OVERLAP):
    chunks = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        chunk = text[start:end]
        chunks.append(chunk)
        start += chunk_size - overlap
    return chunks


def extract_text_from_pdf(file_path: str) -> str:
    text = ""
    with pdfplumber.open(file_path) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
    return text


@app.get("/")
def read_root():
    return {"message": "Multi-PDF RAG Assistant API is running."}


@app.post("/upload")
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

            all_data.append({
                "filename": file.filename,
                "status": "success",
                "num_chunks": len(chunks),
                "chunks": chunks
            })
        except Exception as e:
            all_data.append({
                "filename": file.filename,
                "status": "failed",
                "error": "Unable to read this PDF. It may be password-protected or corrupted."
            })

    return {"files_processed": len(files), "data": all_data}