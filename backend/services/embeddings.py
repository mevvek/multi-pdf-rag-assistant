import os
import requests
from dotenv import load_dotenv

load_dotenv()

HF_API_TOKEN = os.getenv("HF_API_TOKEN")
HF_API_URL = "https://router.huggingface.co/hf-inference/models/sentence-transformers/all-MiniLM-L6-v2/pipeline/feature-extraction"

headers = {"Authorization": f"Bearer {HF_API_TOKEN}"}


def get_embeddings(texts: list):
    response = requests.post(
        HF_API_URL,
        headers=headers,
        json={"inputs": texts, "options": {"wait_for_model": True}}
    )
    response.raise_for_status()
    return response.json()