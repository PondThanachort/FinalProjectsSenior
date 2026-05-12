// components/home/ProjectCard.tsx
"use client";

import { useState } from "react";

// Type for project data
type Project = {
  id: number;
  name: string;
  desc: string;
  location: string;
  year: string;
  area: string;
  tags: string[];
  g: string;
  image?: string;
};

export default function ProjectCard({ p, onClick }: { p: Project; onClick?: () => void }) {
  const [hov, setHov] = useState(false);

  return (
    <div
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={(event) => {
        if (!onClick) return;
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onClick();
        }
      }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: "#fff",
        borderRadius: 16,
        overflow: "hidden",
        boxShadow: hov ? "0 16px 48px rgba(0,0,0,0.13)" : "0 2px 16px rgba(0,0,0,0.07)",
        transform: hov ? "translateY(-6px)" : "translateY(0)",
        transition: "all 0.35s cubic-bezier(.25,.46,.45,.94)",
        cursor: "pointer",
      }}
    >
      {/* ── Image area ── */}
      <div style={{ height: 220, background: p.image ? 'transparent' : p.g, position: "relative", overflow: "hidden" }}>
        {p.image ? (
          <img src={p.image} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <svg
            viewBox="0 0 480 220"
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="xMidYMid slice"
          >
            {p.id % 3 === 1 && (
              <>
                <rect x="120" y="20" width="240" height="180" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="1"/>
                <rect x="145" y="45" width="70"  height="50"  fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.22)" strokeWidth="0.5"/>
                <rect x="265" y="45" width="70"  height="50"  fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.22)" strokeWidth="0.5"/>
                <rect x="195" y="130" width="90" height="70"  fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5"/>
              </>
            )}
            {p.id % 3 === 2 && (
              <>
                <polygon points="240,15 130,195 350,195" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="1"/>
                <polygon points="240,65 168,178 312,178" fill="none" stroke="rgba(255,255,255,0.09)" strokeWidth="0.5"/>
                <rect x="212" y="140" width="56" height="55" fill="rgba(255,255,255,0.08)"/>
              </>
            )}
            {p.id % 3 === 0 && (
              <>
                <rect x="80"  y="40"  width="130" height="160" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1"/>
                <rect x="270" y="60"  width="130" height="140" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1"/>
                <rect x="100" y="120" width="36"  height="80"  fill="rgba(255,255,255,0.09)"/>
                <rect x="155" y="100" width="36"  height="100" fill="rgba(255,255,255,0.09)"/>
                <rect x="290" y="110" width="36"  height="90"  fill="rgba(255,255,255,0.09)"/>
              </>
            )}
            <rect x="0" y="0" width="480" height="220" fill="rgba(0,0,0,0.08)"/>
          </svg>
        )}

        {/* Hover overlay */}
        <div style={{
          position: "absolute", inset: 0,
          background: hov ? "rgba(0,0,0,0.18)" : "transparent",
          transition: "background 0.3s",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          {hov && (
            <span style={{
              background: "rgba(255,255,255,0.92)", color: "#1a1a1a",
              padding: "8px 20px", borderRadius: 50,
              fontSize: 13, fontWeight: 600,
              fontFamily: "'Noto Sans Thai',sans-serif",
            }}>
              ดูรายละเอียด →
            </span>
          )}
        </div>
      </div>

      {/* ── Card body ── */}
      <div style={{ padding: "22px 24px 20px" }}>
        <h3 style={{ fontFamily: "'Noto Sans Thai','Sarabun',sans-serif", fontSize: 17, fontWeight: 700, color: "#1a1a1a", marginBottom: 7, lineHeight: 1.4 }}>
          {p.name}
        </h3>
        <p style={{ fontFamily: "'Noto Sans Thai','Sarabun',sans-serif", fontSize: 13, color: "#6b7280", lineHeight: 1.7, marginBottom: 14 }}>
          {p.desc}
        </p>

        {/* Meta */}
        <div style={{ display: "flex", gap: 16, marginBottom: 14, fontSize: 12, color: "#9ca3af", fontFamily: "'Noto Sans Thai',sans-serif", flexWrap: "wrap" }}>
          {[["📍", p.location], ["📅", p.year], ["📐", p.area]].map(([icon, val], i) => (
            <span key={i} style={{ display: "flex", alignItems: "center", gap: 4 }}>{icon} {val}</span>
          ))}
        </div>

        {/* Tags */}
        <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
          {p.tags.map((t, i) => (
            <span key={i} style={{
              padding: "4px 12px", border: "1px solid #e5e7eb", borderRadius: 6,
              fontSize: 12, color: "#374151", background: "#f9fafb", fontWeight: 500,
              fontFamily: "'Noto Sans Thai',sans-serif",
            }}>
              {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
