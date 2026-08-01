import os
from dotenv import load_dotenv
from groq import Groq

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))


def generate_answer(query: str, relevant_chunks: list):
    if not relevant_chunks:
        return {
            "answer": "I could not find relevant information in the uploaded documents.",
            "sources": []
        }

    context = ""
    sources = set()

    for chunk in relevant_chunks:
        context += f"\n[From: {chunk['filename']}]\n{chunk['text']}\n"
        sources.add(chunk["filename"])

    prompt = f"""You are a helpful assistant that answers questions based only on the provided context.
Use the context below to answer the question. If the answer is not in the context, say you don't know.

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