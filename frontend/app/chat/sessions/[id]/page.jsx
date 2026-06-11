"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { chatService } from "@/services/chatService";

function fmt(n) {
    return "Rp" + Number(n || 0).toLocaleString("id-ID");
}

function ChatBubble({ role, content, products, createdAt }) {
    const isBot = role === "assistant" || role === "bot";
    return (
        <div style={{ display: "flex", justifyContent: isBot ? "flex-start" : "flex-end", marginBottom: "16px" }}>
            <div style={{ display: "flex", gap: "10px", maxWidth: "80%" }}>
                {isBot && (
                    <div style={{ width: "32px", height: "32px", borderRadius: "10px", background: "#1A3C34", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", flexShrink: 0, marginTop: "4px" }}>
                        🤖
                    </div>
                )}
                <div style={{ display: "flex", flexDirection: "column", alignItems: isBot ? "flex-start" : "flex-end" }}>
                    <div style={{
                        padding: "12px 16px", borderRadius: "16px", fontSize: "14px", lineHeight: "1.5",
                        background: isBot ? "#fff" : "#1A3C34",
                        color: isBot ? "#1A1A1A" : "#fff",
                        border: isBot ? "1px solid #EBEBEB" : "none",
                        boxShadow: isBot ? "0 2px 4px rgba(0,0,0,0.02)" : "none",
                        borderBottomLeftRadius: isBot ? "2px" : "16px",
                        borderBottomRightRadius: isBot ? "16px" : "2px",
                    }}>
                        {content}
                    </div>

                    {products && products.length > 0 && (
                        <div style={{ display: "flex", gap: "10px", marginTop: "10px", overflowX: "auto", paddingBottom: "5px", width: "100%" }}>
                            {products.map((p, idx) => (
                                <div key={idx} style={{
                                    flexShrink: 0, width: "140px", background: "#fff", borderRadius: "12px", border: "1px solid #EBEBEB", overflow: "hidden"
                                }}>
                                    <div style={{ height: "80px", background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px" }}>📦</div>
                                    <div style={{ padding: "8px" }}>
                                        <p style={{ margin: 0, fontSize: "11px", fontWeight: 700, color: "#1A1A1A", overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{p.name || p.product_name}</p>
                                        <p style={{ margin: "4px 0 0", fontSize: "12px", fontWeight: 800, color: "#1A3C34" }}>{fmt(p.price || p.product_price)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <span style={{ fontSize: "10px", color: "#94a3b8", marginTop: "4px" }}>
                        {new Date(createdAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                </div>
            </div>
        </div>
    );
}

export default function ChatDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [input, setInput] = useState("");
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        const loadMessages = async () => {
            setLoading(true);
            try {
                const data = await chatService.getSessionMessages(id);
                setMessages(data);
            } catch (err) {
                console.error(err);
                // Mock data for static UI
                setMessages([
                    { role: "assistant", content: "Halo! Ada yang bisa saya bantu cari hari ini?", createdAt: new Date(Date.now() - 3600000).toISOString() },
                    { role: "user", content: "Saya cari sepatu lari warna hitam budget 500rb", createdAt: new Date(Date.now() - 3500000).toISOString() },
                    {
                        role: "assistant",
                        content: "Tentu, ini beberapa rekomendasi sepatu lari hitam di bawah 500rb yang tersedia di toko kami:",
                        products: [
                            { name: "Sepatu Lari Pro 1", price: 450000 },
                            { name: "Runner X Black", price: 399000 }
                        ],
                        createdAt: new Date(Date.now() - 3400000).toISOString()
                    },
                    { role: "user", content: "Apakah stok ukuran 42 masih ada?", createdAt: new Date(Date.now() - 60000).toISOString() },
                ]);
            } finally {
                setLoading(false);
            }
        };
        if (id) loadMessages();
    }, [id]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const onSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || sending) return;

        const userMsg = { role: "user", content: input, createdAt: new Date().toISOString() };
        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setSending(true);

        try {
            const res = await chatService.sendMessage({
                message: input,
                session_id: id,
                history: messages.map(m => ({ role: m.role, content: m.content }))
            });
            const botMsg = {
                role: "assistant",
                content: res.reply,
                products: res.suggested_products,
                createdAt: new Date().toISOString()
            };
            setMessages(prev => [...prev, botMsg]);
        } catch (err) {
            console.error(err);
            // Simulate bot response for static UI
            setTimeout(() => {
                setMessages(prev => [...prev, {
                    role: "assistant",
                    content: "Maaf, sistem AI sedang offline. Ini adalah balasan simulasi.",
                    createdAt: new Date().toISOString()
                }]);
            }, 1000);
        } finally {
            setSending(false);
        }
    };

    return (
        <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: "#f8f9fa", fontFamily: "'DM Sans', sans-serif" }}>
            <Navbar />

            <main style={{ flex: 1, maxWidth: "800px", width: "100%", margin: "0 auto", display: "flex", flexDirection: "column", overflow: "hidden", background: "#fff", borderLeft: "1px solid #EBEBEB", borderRight: "1px solid #EBEBEB" }}>

                {/* Header Sesi */}
                <div style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: "12px" }}>
                    <Link href="/chat/sessions" style={{ textDecoration: "none", color: "#1A3C34", display: "flex", alignItems: "center" }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6" /></svg>
                    </Link>
                    <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: "#F0FBF8", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>🤖</div>
                    <div style={{ flex: 1 }}>
                        <h2 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "#1A1A1A" }}>AI Shopping Assistant</h2>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#4ade80" }} />
                            <span style={{ fontSize: "12px", color: "#64748b" }}>Online</span>
                        </div>
                    </div>
                </div>

                {/* Chat Messages Area */}
                <div style={{ flex: 1, overflowY: "auto", padding: "24px 20px", background: "#fcfcfc" }}>
                    {messages.map((m, idx) => (
                        <ChatBubble key={idx} {...m} />
                    ))}
                    {sending && (
                        <div style={{ display: "flex", gap: "10px", marginBottom: "16px" }}>
                            <div style={{ width: "32px", height: "32px", borderRadius: "10px", background: "#1A3C34", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px" }}>🤖</div>
                            <div style={{ padding: "12px 16px", borderRadius: "16px", background: "#fff", border: "1px solid #EBEBEB", display: "flex", gap: "4px" }}>
                                <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#1A3C34", animation: "pulse 1s infinite" }} />
                                <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#1A3C34", animation: "pulse 1s infinite 0.2s" }} />
                                <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#1A3C34", animation: "pulse 1s infinite 0.4s" }} />
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div style={{ padding: "20px", borderTop: "1px solid #f1f5f9" }}>
                    <form onSubmit={onSend} style={{ display: "flex", gap: "12px" }}>
                        <input
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            placeholder="Tanyakan sesuatu..."
                            style={{
                                flex: 1, padding: "12px 18px", borderRadius: "12px", border: "1.5px solid #E5E7EB",
                                outline: "none", fontSize: "14px", transition: "border-color 0.2s"
                            }}
                            onFocus={e => e.target.style.borderColor = "#1A3C34"}
                            onBlur={e => e.target.style.borderColor = "#E5E7EB"}
                        />
                        <Button type="submit" disabled={!input.trim() || sending}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
                        </Button>
                    </form>
                </div>

            </main>
        </div>
    );
}
