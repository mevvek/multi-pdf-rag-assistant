import { useState, useRef } from "react"

const API_BASE = "http://127.0.0.1:8000"

function PdfUploader({ uploadedFiles, onUploadSuccess, onClearAll, onRemoveFile }) {
  const [files, setFiles] = useState([])
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isClearing, setIsClearing] = useState(false)
  const [removingFile, setRemovingFile] = useState(null)
  const [uploadResults, setUploadResults] = useState([])
  const fileInputRef = useRef(null)

  const handleFileSelect = (selectedFiles) => {
    const pdfFiles = Array.from(selectedFiles).filter(
      (file) => file.type === "application/pdf"
    )
    setFiles((prev) => [...prev, ...pdfFiles])
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    handleFileSelect(e.dataTransfer.files)
  }

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleUpload = async () => {
    if (files.length === 0) return

    setIsUploading(true)
    setUploadResults([])

    const formData = new FormData()
    files.forEach((file) => {
      formData.append("files", file)
    })

    try {
      const response = await fetch(`${API_BASE}/upload`, {
        method: "POST",
        body: formData,
      })

      const data = await response.json()
      setUploadResults(data.data)

      const successFiles = data.data.filter((f) => f.status === "success")
      if (successFiles.length > 0 && onUploadSuccess) {
        onUploadSuccess(successFiles)
      }

      setFiles([])
    } catch (error) {
      setUploadResults([
        { filename: "Upload failed", status: "failed", error: "Could not connect to server" },
      ])
    } finally {
      setIsUploading(false)
    }
  }

  const handleClearAll = async () => {
    setIsClearing(true)
    try {
      await fetch(`${API_BASE}/clear`, { method: "DELETE" })
      setUploadResults([])
      if (onClearAll) onClearAll()
    } catch (error) {
      console.error("Failed to clear documents", error)
    } finally {
      setIsClearing(false)
    }
  }

  const handleRemoveSingle = async (filename) => {
    setRemovingFile(filename)
    try {
      await fetch(`${API_BASE}/remove/${encodeURIComponent(filename)}`, {
        method: "DELETE",
      })
      if (onRemoveFile) onRemoveFile(filename)
    } catch (error) {
      console.error("Failed to remove file", error)
    } finally {
      setRemovingFile(null)
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current.click()}
        className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all duration-200 ${
          isDragging
            ? "border-blue-400 bg-blue-950/30 scale-[1.01]"
            : "border-slate-600 hover:border-slate-500 hover:bg-slate-800/30"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          multiple
          className="hidden"
          onChange={(e) => handleFileSelect(e.target.files)}
        />
        <div className={`text-4xl mb-3 transition-transform duration-200 ${isDragging ? "scale-110" : ""}`}>
          📄
        </div>
        <p className="text-slate-300 text-lg font-medium">
          Drag and drop PDFs here, or click to browse
        </p>
        <p className="text-slate-500 text-sm mt-1">
          You can select multiple files
        </p>
      </div>

      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          {files.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between bg-slate-800 rounded-lg px-4 py-2 animate-message-in"
            >
              <span className="text-slate-200 text-sm truncate">{file.name}</span>
              <button
                onClick={() => removeFile(index)}
                className="text-slate-400 hover:text-red-400 text-sm ml-3 transition-colors"
              >
                Remove
              </button>
            </div>
          ))}

          <button
            onClick={handleUpload}
            disabled={isUploading}
            className="w-full bg-blue-600 hover:bg-blue-500 active:scale-[0.99] disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-lg transition-all"
          >
            {isUploading ? "Uploading..." : `Upload ${files.length} file(s)`}
          </button>
        </div>
      )}

      {uploadResults.length > 0 && (
        <div className="mt-4 space-y-2">
          {uploadResults.map((result, index) => (
            <div
              key={index}
              className={`rounded-lg px-4 py-2 text-sm animate-message-in ${
                result.status === "success"
                  ? "bg-green-950/40 text-green-300"
                  : "bg-red-950/40 text-red-300"
              }`}
            >
              {result.status === "success"
                ? `${result.filename} — processed successfully (${result.num_chunks} chunks)`
                : `${result.filename} — ${result.error}`}
            </div>
          ))}
        </div>
      )}

      {uploadedFiles && uploadedFiles.length > 0 && (
        <div className="mt-5">
          <p className="text-xs text-slate-500 mb-2 uppercase tracking-wide">
            Active documents
          </p>
          <div className="space-y-2">
            {uploadedFiles.map((filename, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-slate-800/70 border border-slate-700 rounded-lg px-4 py-2 animate-message-in hover:border-slate-600 transition-colors"
              >
                <span className="text-slate-200 text-sm truncate flex items-center gap-2">
                  📄 {filename}
                </span>
                <button
                  onClick={() => handleRemoveSingle(filename)}
                  disabled={removingFile === filename}
                  className="text-slate-400 hover:text-red-400 text-sm disabled:opacity-50 transition-colors"
                >
                  {removingFile === filename ? "Removing..." : "✕"}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {uploadedFiles && uploadedFiles.length > 0 && (
        <div className="mt-4 flex justify-end">
          <button
            onClick={handleClearAll}
            disabled={isClearing}
            className="flex items-center gap-1.5 text-xs font-medium text-red-400 bg-red-950/30 hover:bg-red-950/50 border border-red-900/50 px-3 py-1.5 rounded-lg disabled:opacity-50 transition-colors"
          >
            🗑️ {isClearing ? "Clearing..." : "Clear all documents"}
          </button>
        </div>
      )}
    </div>
  )
}

export default PdfUploader