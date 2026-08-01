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
    query_embedding = get_embeddings([query])
    query_embedding = np.array(query_embedding).astype("float32")

    distances, indices = index.search(query_embedding, top_k)

    results = []
    for idx in indices[0]:
        if idx < len(chunk_metadata):
            results.append(chunk_metadata[idx])

    return results