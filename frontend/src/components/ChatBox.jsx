import { useRef, useEffect } from "react"

const API_BASE = "http://127.0.0.1:8000"

function ChatBox({ messages, setMessages, question, setQuestion }) {
  const messagesEndRef = useRef(null)
  const isLoading = messages.length > 0 && messages[messages.length - 1].role === "loading"

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSend = async () => {
    const trimmed = question.trim()
    if (!trimmed || isLoading) return

    setMessages((prev) => [...prev, { role: "user", text: trimmed }, { role: "loading" }])
    setQuestion("")

    try {
      const response = await fetch(`${API_BASE}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: trimmed }),
      })

      const data = await response.json()

      setMessages((prev) => [
        ...prev.slice(0, -1),
        { role: "assistant", text: data.answer, sources: data.sources || [] },
      ])
    } catch (error) {
      setMessages((prev) => [
        ...prev.slice(0, -1),
        {
          role: "assistant",
          text: "Something went wrong while connecting to the server. Please try again.",
          sources: [],
        },
      ])
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto mt-8 flex flex-col h-[500px] bg-slate-800/50 rounded-xl border border-slate-700 shadow-xl shadow-black/20">
      <div className="flex-1 overflow-y-auto p-4 space-y-4 chat-scroll">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="text-3xl mb-2 opacity-60">💬</div>
            <p className="text-slate-500 text-sm">
              Ask a question about your uploaded documents
            </p>
          </div>
        )}

        {messages.map((msg, index) => {
          if (msg.role === "loading") {
            return (
              <div key={index} className="flex justify-start animate-message-in">
                <div className="bg-slate-700 rounded-2xl rounded-bl-sm px-4 py-3">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                  </div>
                </div>
              </div>
            )
          }

          return (
            <div
              key={index}
              className={`flex animate-message-in ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm transition-transform hover:-translate-y-0.5 ${
                  msg.role === "user"
                    ? "bg-blue-600 text-white rounded-br-sm"
                    : "bg-slate-700 text-slate-100 rounded-bl-sm"
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.text}</p>

                {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-slate-600 flex flex-wrap gap-1.5">
                    {msg.sources.map((src, i) => (
                      <span
                        key={i}
                        className="text-xs bg-slate-800 text-blue-300 px-2 py-1 rounded-md"
                      >
                        📄 {src}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )
        })}

        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 border-t border-slate-700 flex gap-2">
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask a question..."
          rows={1}
          className="flex-1 bg-slate-900 text-slate-100 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-slate-900/80 placeholder:text-slate-500 transition-all"
        />
        <button
          onClick={handleSend}
          disabled={isLoading || !question.trim()}
          className="bg-blue-600 hover:bg-blue-500 active:scale-95 disabled:bg-slate-700 disabled:cursor-not-allowed text-white px-4 rounded-lg text-sm font-medium transition-all"
        >
          Send
        </button>
      </div>
    </div>
  )
}

export default ChatBox