"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { chatService } from "@/services/chatService";

const SELLER_MENUS = [
    { label: "Semua Chat", href: "/chat/sessions" },
];

function fmtDate(iso) {
    if (!iso) return "";
    const d = new Date(iso);
    const now = new Date();
    if (d.toDateString() === now.toDateString()) {
        return d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
    }
    return d.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
}

export default function ChatSessionsPage() {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadSessions = async () => {
        setLoading(true);
        setError("");
        try {
            const data = await chatService.getSessions();
            setSessions(data);
        } catch (err) {
            console.error(err);
            setError("Gagal memuat riwayat chat. Menampilkan simulasi UI.");
            // Mock data for static UI
            setSessions([
                { id: 1, title: "Tanya Sepatu Lari", last_message: "Apakah stok ukuran 42 masih ada?", updated_at: new Date().toISOString(), message_count: 5 },
                { id: 2, title: "Cari Laptop Gaming", last_message: "Rekomendasi budget 15 jutaan dong", updated_at: new Date(Date.now() - 86400000).toISOString(), message_count: 12 },
                { id: 3, title: "Baju Kemeja Pria", last_message: "Terima kasih infonya!", updated_at: new Date(Date.now() - 172800000).toISOString(), message_count: 3 },
            ]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadSessions();
    }, []);

    return (
        <div style={{ minHeight: "100vh", background: "#f8f9fa", fontFamily: "'DM Sans', sans-serif" }}>
            <Navbar />

            <main style={{ maxWidth: "700px", margin: "0 auto", padding: "40px 24px" }}>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                    <div>
                        <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#1A1A1A", margin: 0 }}>Pesan</h1>
                        <p style={{ fontSize: "14px", color: "#666", marginTop: "4px" }}>Kelola percakapan Anda dengan AI Shopping Assistant.</p>
                    </div>
                    <Link href="/chat">
                        <Button>+ Chat Baru</Button>
                    </Link>
                </div>

                {error && (
                    <div style={{ marginBottom: "20px", padding: "12px 16px", borderRadius: "12px", background: "#FEF2F2", border: "1px solid #FECACA", color: "#B91C1C", fontSize: "13px" }}>
                        {error}
                    </div>
                )}

                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {loading && sessions.length === 0 ? (
                        [1, 2, 3].map(i => (
                            <div key={i} style={{ height: "80px", background: "#fff", borderRadius: "16px", border: "1px solid #EBEBEB", animation: "pulse 1.5s infinite" }} />
                        ))
                    ) : sessions.length === 0 ? (
                        <Card style={{ padding: "60px 20px", textAlign: "center" }}>
                            <p style={{ fontSize: "48px", margin: "0 0 16px" }}>💬</p>
                            <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#1A1A1A" }}>Belum Ada Percakapan</h2>
                            <p style={{ fontSize: "14px", color: "#666", marginTop: "8px" }}>Mulai chat dengan AI untuk mencari produk impian Anda.</p>
                            <Link href="/chat" style={{ marginTop: "24px", display: "inline-block" }}>
                                <Button>Mulai Chat</Button>
                            </Link>
                        </Card>
                    ) : (
                        sessions.map(session => (
                            <Link key={session.id} href={`/chat/sessions/${session.id}`} style={{ textDecoration: "none" }}>
                                <div
                                    style={{
                                        background: "#fff", padding: "16px 20px", borderRadius: "16px", border: "1px solid #EBEBEB",
                                        display: "flex", alignItems: "center", gap: "16px", transition: "all 0.2s", cursor: "pointer"
                                    }}
                                    onMouseEnter={e => {
                                        e.currentTarget.style.borderColor = "#1A3C34";
                                        e.currentTarget.style.boxShadow = "0 4px 12px rgba(26,60,52,0.05)";
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.borderColor = "#EBEBEB";
                                        e.currentTarget.style.boxShadow = "none";
                                    }}
                                >
                                    <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: "#F0FBF8", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px", flexShrink: 0 }}>
                                        🤖
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                            <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "#1A1A1A", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                {session.title || "Percakapan Baru"}
                                            </h3>
                                            <span style={{ fontSize: "11px", color: "#94a3b8" }}>{fmtDate(session.updated_at)}</span>
                                        </div>
                                        <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#64748b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                            {session.last_message || "Belum ada pesan"}
                                        </p>
                                    </div>
                                    <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: 700, color: "#475569" }}>
                                        {session.message_count}
                                    </div>
                                </div>
                            </Link>
                        ))
                    )}
                </div>
            </main>
        </div>
    );
}
