"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Message = {
  role: "user" | "assistant";
  text: string;
};

function formatBoldText(text: string) {
  const parts = text.split(/(\*\*.*?\*\*)/g);

  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      const boldText = part.slice(2, -2);
      return <strong key={index}>{boldText}</strong>;
    }
    return <span key={index}>{part}</span>;
  });
}

function renderFormattedText(text: string) {
  return text.split("\n").map((line, index) => (
    <div key={index} style={{ marginBottom: line.trim() === "" ? 10 : 0 }}>
      {formatBoldText(line)}
    </div>
  ));
}

export default function SimpleChat() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const suggestions = useMemo(
    () => [
      "Hoeveel vakantiedagen heb ik?",
      "Ik heb een vraag over ziekte of verlof",
    ],
    []
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, loading]);

  const resetConversation = () => {
    setMessages([]);
    setInput("");
    setLoading(false);
  };

  const sendMessage = async (text?: string) => {
    const messageToSend = (text ?? input).trim();
    if (!messageToSend || loading) return;

    const userMessage: Message = { role: "user", text: messageToSend };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/agent-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: messageToSend,
          messages: [...messages, userMessage],
        }),
      });

      const data = await res.json();

      if (!data?.answer) {
        throw new Error("Leeg antwoord");
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: data.answer || "Geen antwoord ontvangen.",
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text:
            "Het lukt nu even niet om je vraag te beantwoorden. Probeer het zo nog eens. Blijft het probleem? Neem dan contact op met het Service Center via 0345 851 963.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const renderSendButton = () => (
    <button
      type="button"
      onClick={() => sendMessage()}
      onMouseEnter={(e) => {
        if (!loading) e.currentTarget.style.background = "#0e7fa4";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "#1195bf";
      }}
      disabled={loading}
      style={{
        width: 48,
        height: 48,
        borderRadius: 14,
        border: "none",
        background: "#1195bf",
        color: "#ffffff",
        cursor: loading ? "default" : "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "background 0.2s ease",
        flexShrink: 0,
        opacity: loading ? 0.7 : 1,
      }}
    >
      <span
        style={{
          fontSize: 22,
          fontWeight: 900,
          lineHeight: 1,
          transform: "translateY(1px)",
        }}
      >
        ➔
      </span>
    </button>
  );

  const renderInput = () => (
    <div
      style={{
        border: "1px solid #e5e5e5",
        borderRadius: 18,
        padding: "10px 14px",
        display: "flex",
        alignItems: "center",
        gap: 10,
        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        background: "#fff",
      }}
    >
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Stel hier je vraag over de cao NN-Group..."
        style={{
          flex: 1,
          border: "none",
          outline: "none",
          fontSize: 16,
          color: "#333",
          padding: "12px 0",
          background: "transparent",
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
          }
        }}
      />

      {renderSendButton()}
    </div>
  );

  return (
    <div
      style={{
        maxWidth: 900,
        margin: "32px auto",
        borderRadius: 20,
        overflow: "hidden",
        border: "1px solid #e5e5e5",
        background: "#ffffff",
        boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          background: "#1195bf",
          color: "#ffffff",
          padding: "18px 22px",
          fontWeight: 700,
          fontSize: 20,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
        }}
      >
        <span>💬 Chat over de cao NN-Group</span>

        {messages.length > 0 && (
          <button
            type="button"
            onClick={resetConversation}
            style={{
              background: "rgba(255,255,255,0.16)",
              color: "#ffffff",
              border: "1px solid rgba(255,255,255,0.25)",
              borderRadius: 10,
              padding: "8px 12px",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Nieuw gesprek
          </button>
        )}
      </div>

      <div
        style={{
          minHeight: 520,
          maxHeight: 620,
          overflowY: "auto",
          padding: "28px 28px 20px",
          background: "#ffffff",
          display: "flex",
          flexDirection: "column",
          justifyContent: messages.length === 0 ? "flex-end" : "flex-start",
        }}
      >
        {messages.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent:
                    msg.role === "user" ? "flex-end" : "flex-start",
                  marginBottom: 16,
                }}
              >
                <div
                  style={{
                    background: msg.role === "user" ? "#eaf4fb" : "#f3f3f3",
                    color: "#222",
                    padding: "16px 18px",
                    borderRadius: 14,
                    maxWidth: "78%",
                    lineHeight: 1.55,
                    fontSize: 16,
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {renderFormattedText(msg.text)}
                </div>
              </div>
            ))}

            {loading && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-start",
                  marginBottom: 16,
                }}
              >
                <div
                  style={{
                    background: "#f3f3f3",
                    padding: "16px 18px",
                    borderRadius: 14,
                    maxWidth: "78%",
                    minWidth: 320,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                    }}
                  >
                    <div
                      style={{
                        position: "relative",
                        width: 56,
                        height: 56,
                        flexShrink: 0,
                      }}
                    >
                      <div
                        style={{
                          position: "absolute",
                          inset: 0,
                          borderRadius: "50%",
                          border: "4px solid #d8eaf1",
                          borderTopColor: "#1195bf",
                          animation: "spinLoader 1.2s linear infinite",
                          boxSizing: "border-box",
                        }}
                      />

                      <div
                        style={{
                          position: "absolute",
                          inset: 10,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          borderRadius: "50%",
                          background: "#ffffff",
                        }}
                      >
                        <img
                          src="https://www.unie.nl/wp-content/uploads/U-van-De-Unie-RGB-SVG.svg"
                          alt="De Unie"
                          style={{
                            width: 22,
                            height: 22,
                            objectFit: "contain",
                          }}
                        />
                      </div>
                    </div>

                    <div
                      style={{
                        fontSize: 14,
                        color: "#5a5a5a",
                        lineHeight: 1.5,
                      }}
                    >
                      Even geduld. Ik zoek het juiste antwoord in de cao.
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}

        {messages.length === 0 && (
          <div
            style={{
              padding: "20px",
            }}
          >
            <h2
              style={{
                fontSize: 24,
                lineHeight: 1.3,
                margin: 0,
                marginBottom: 26,
                color: "#2b2b2b",
              }}
            >
              Hoi, ik ben Una! Waarmee kan ik je helpen?
            </h2>

            <div style={{ marginBottom: 28 }}>
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => sendMessage(s)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    width: "100%",
                    background: "transparent",
                    border: "none",
                    padding: "10px 0",
                    cursor: "pointer",
                    color: "#666",
                    fontSize: 16,
                    textAlign: "left",
                  }}
                >
                  <span
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: "50%",
                      border: "1.5px solid #8f8f8f",
                      color: "#8f8f8f",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 12,
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    ?
                  </span>
                  <span>{s}</span>
                </button>
              ))}
            </div>

            {renderInput()}
          </div>
        )}

        {messages.length > 0 && (
          <div
            style={{
              marginTop: "auto",
              borderTop: "1px solid #efefef",
              paddingTop: 16,
            }}
          >
            {renderInput()}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes spinLoader {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
