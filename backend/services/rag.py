import os
from dotenv import load_dotenv
from groq import Groq

from services.vector_store import get_all_filenames

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))


def generate_answer(query: str, relevant_chunks: list):
    all_files = get_all_filenames()

    if not all_files:
        return {
            "answer": "No documents have been uploaded yet. Please upload a PDF first.",
            "sources": []
        }

    context = ""
    sources = set()

    for chunk in relevant_chunks:
        context += f"\n[From: {chunk['filename']}]\n{chunk['text']}\n"
        sources.add(chunk["filename"])

    file_list_str = ", ".join(all_files)

    prompt = f"""You are a helpful assistant that answers questions about uploaded PDF documents.

Currently uploaded documents: {file_list_str}

Use the context below (extracted from the documents) to answer the question in detail.
If the question is about which documents are available, or general questions about the documents themselves, answer using the list of uploaded documents above.
If the question asks about specific content and the context does not contain the answer, say you don't have that information in the uploaded documents.

Context:
{context}

Question: {query}

Answer:"""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "user", "content": prompt}
        ],
        temperature=0.3
    )

    answer = response.choices[0].message.content

    return {
        "answer": answer,
        "sources": list(sources)
    }