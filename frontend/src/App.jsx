import { useState } from "react"
import PdfUploader from "./components/PdfUploader"
import ChatBox from "./components/ChatBox"

function App() {
  const [uploadedFiles, setUploadedFiles] = useState([])
  const [messages, setMessages] = useState([])
  const [question, setQuestion] = useState("")

  const handleUploadSuccess = (successFiles) => {
    const filenames = successFiles.map((f) => f.filename)
    setUploadedFiles((prev) => [...new Set([...prev, ...filenames])])
  }

  const handleClearAll = () => {
    setUploadedFiles([])
    setMessages([])
  }

  const handleRemoveFile = (filename) => {
    setUploadedFiles((prev) => prev.filter((f) => f !== filename))
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 py-12 px-4">
      <div className="max-w-2xl mx-auto mb-10 text-center animate-fade-in">
        <div className="inline-flex items-center gap-2 bg-slate-800/60 border border-slate-700 rounded-full px-4 py-1.5 mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs text-slate-400 font-medium">RAG-powered document assistant</span>
        </div>

        <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-blue-100 to-slate-300 bg-clip-text text-transparent">
          Multi-PDF RAG Assistant
        </h1>
        <p className="text-slate-400 mt-3">
          Upload PDFs and ask questions with exact source citations
        </p>
      </div>

      <PdfUploader
        uploadedFiles={uploadedFiles}
        onUploadSuccess={handleUploadSuccess}
        onClearAll={handleClearAll}
        onRemoveFile={handleRemoveFile}
      />

      <ChatBox
        messages={messages}
        setMessages={setMessages}
        question={question}
        setQuestion={setQuestion}
      />

      <p className="text-center text-slate-600 text-xs mt-8">
        Built with FastAPI, FAISS & Groq LLaMA
      </p>
    </div>
  )
}

export default App