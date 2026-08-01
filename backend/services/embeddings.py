from sentence_transformers import SentenceTransformer
from config import EMBEDDING_MODEL_NAME

model = SentenceTransformer(EMBEDDING_MODEL_NAME)


def get_embeddings(texts: list):
    return model.encode(texts)