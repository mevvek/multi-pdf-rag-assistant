import faiss
import numpy as np

from config import EMBEDDING_DIM
from services.embeddings import get_embeddings

index = faiss.IndexFlatL2(EMBEDDING_DIM)
chunk_metadata = []


def add_chunks_to_index(filename: str, chunks: list):
    if not chunks:
        return

    embeddings = get_embeddings(chunks)
    embeddings = np.array(embeddings).astype("float32")
    index.add(embeddings)

    for chunk in chunks:
        chunk_metadata.append({
            "filename": filename,
            "text": chunk
        })


def search_similar_chunks(query: str, top_k: int = 3):
    if index.ntotal == 0:
        return []

    query_embedding = get_embeddings([query])
    query_embedding = np.array(query_embedding).astype("float32")

    distances, indices = index.search(query_embedding, top_k)

    results = []
    for idx in indices[0]:
        if 0 <= idx < len(chunk_metadata):
            results.append(chunk_metadata[idx])

    return results

def clear_index():
    global index, chunk_metadata
    index = faiss.IndexFlatL2(EMBEDDING_DIM)
    chunk_metadata = []

def remove_file_from_index(filename: str):
    global index, chunk_metadata

    remaining_chunks = [item for item in chunk_metadata if item["filename"] != filename]

    new_index = faiss.IndexFlatL2(EMBEDDING_DIM)
    new_metadata = []

    if remaining_chunks:
        texts = [item["text"] for item in remaining_chunks]
        embeddings = get_embeddings(texts)
        embeddings = np.array(embeddings).astype("float32")
        new_index.add(embeddings)
        new_metadata = remaining_chunks

    index = new_index
    chunk_metadata = new_metadata

def get_all_filenames():
    return list(set(item["filename"] for item in chunk_metadata))