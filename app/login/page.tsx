"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import "./login.css";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ username: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError(""); // ล้าง error เมื่อพิมพ์ใหม่
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.username || !form.password) {
      setError("กรุณากรอกชื่อผู้ใช้และรหัสผ่าน");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        setError(data.error || "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
        return;
      }

      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      }

      if (typeof window !== "undefined") {
        window.location.replace(data.redirectTo || "/projects");
      } else {
        router.replace(data.redirectTo || "/projects");
      }
    } catch (err) {
      console.error(err);
      setError("เกิดข้อผิดพลาดระหว่างเข้าสู่ระบบ");
      setLoading(false);
    }
  };

  return (
    <>
      <div className="login-page">

        {/* ── LEFT PANEL ── */}
        <div className="left-panel">
          <div className="bg-grid"/>
          <div className="bg-glow"/>
          <div className="bg-glow-2"/>
          <div className="shape shape-1"/>
          <div className="shape shape-2"/>
          <div className="shape shape-3"/>

          {/* Logo */}
          <Link href="/" className="left-logo">
            <img src="/logo.jpg" alt="Suwan logo" className="nav-logo-img" />
            <div>
              <div className="logo-text-main">Suwan</div>
              <div className="logo-text-sub">Interior & Renovation</div>
            </div>
          </Link>

          {/* Center content */}
          <div className="left-center">
            <div className="left-tag">ระบบจัดการ</div>
            <h1 className="left-title">
              ยินดีต้อนรับ<br/>
              กลับมา<em> อีกครั้ง</em>
            </h1>
            <p className="left-desc">
              เข้าสู่ระบบเพื่อจัดการโครงการ อัปเดตผลงาน
              และติดตามความคืบหน้าของทุกโครงการในที่เดียว
            </p>
            <div className="feature-list">
              {[
                ["✦", "จัดการโครงการและผลงานทั้งหมด"],
                ["✦", "อัปเดตรูปภาพและข้อมูลได้ทันที"],
                ["✦", "ติดตามคำขอและการติดต่อจากลูกค้า"],
              ].map(([icon, text], i) => (
                <div className="feature-item" key={i}>
                  <div className="feature-dot">{icon}</div>
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Testimonial
          <div className="testimonial-card">
            <div className="testimonial-stars">★★★★★</div>
            <p className="testimonial-text">
              "ระบบใช้งานง่ายมาก อัปเดตโครงการได้รวดเร็ว
              ลูกค้าสามารถเห็นผลงานล่าสุดได้ตลอดเวลา"
            </p>
            <div className="testimonial-author">
              <div className="author-avatar">ส</div>
              <div>
                <div className="author-name">ทีมงาน Cloud Design</div>
                <div className="author-role">Interior Designer</div>
              </div>
            </div>
          </div> */}
        </div>

        {/* ── RIGHT PANEL (FORM) ── */}
        <div className="right-panel">
          <Link href="/" className="back-link">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="19" y1="12" x2="5" y2="12"/>
              <polyline points="12 19 5 12 12 5"/>
            </svg>
            กลับหน้าแรก
          </Link>

          <div className="form-wrap">
            <h2 className="form-headline">เข้าสู่ระบบ</h2>
            <p className="form-subheadline">
              กรอกอีเมลและรหัสผ่านของคุณเพื่อเข้าใช้งาน
            </p>

            <form onSubmit={handleSubmit}>

              {/* Error */}
              {error && (
                <div className="error-msg">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  {error}
                </div>
              )}

              {/* Username */}
              <div className="field-group">
                <label className="field-label" htmlFor="username">ชื่อผู้ใช้</label>
                <div className="field-input-wrap">
                  <span className="field-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                      <polyline points="22,6 12,13 2,6"/>
                    </svg>
                  </span>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    className={`field-input${error ? " error" : ""}`}
                    placeholder="username"
                    value={form.username}
                    onChange={handleChange}
                    autoComplete="username"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="field-group">
                <label className="field-label" htmlFor="password">รหัสผ่าน</label>
                <div className="field-input-wrap">
                  <span className="field-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                  </span>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    className={`field-input${error ? " error" : ""}`}
                    placeholder="••••••••"
                    value={form.password}
                    onChange={handleChange}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="toggle-pw"
                    onClick={() => setShowPassword(p => !p)}
                    aria-label={showPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
                  >
                    {showPassword ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                        <line x1="1" y1="1" x2="23" y2="23"/>
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? (
                  <>
                    <div className="spinner"/>
                    กำลังเข้าสู่ระบบ...
                  </>
                ) : (
                  <>
                    เข้าสู่ระบบ
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="5" y1="12" x2="19" y2="12"/>
                      <polyline points="12 5 19 12 12 19"/>
                    </svg>
                  </>
                )}
              </button>
            </form>

          </div>
        </div>

      </div>
    </>
  );
}
