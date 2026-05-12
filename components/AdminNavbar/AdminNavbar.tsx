"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import "./AdminNavbar.css";

// ── Types ──────────────────────────────────────────────────────────────────────
type Role = "admin" | "staff";

type User = {
  name:   string;
  role:   Role;
  avatar: string;
};

interface NavItem {
  label:    string;
  href:     string;
  icon:     React.ReactNode;
  adminOnly?: boolean;
  children?: { label: string; href: string }[];
}

const DEFAULT_USER: User = {
  name: "ผู้ใช้งาน",
  role: "staff",
  avatar: "ส",
};

const normalizeRole = (value: unknown): Role => {
  return value === "admin" || value === 1 || value === "1" ? "admin" : "staff";
};

function getStoredUser(): User {
  if (typeof window === "undefined") return DEFAULT_USER;

  const stored = localStorage.getItem("user");
  if (!stored) return DEFAULT_USER;

  try {
    const parsed = JSON.parse(stored) as { firstName?: string; lastName?: string; role?: unknown };
    const name = `${parsed.firstName || ""} ${parsed.lastName || ""}`.trim() || DEFAULT_USER.name;
    const role = normalizeRole(parsed.role);
    const avatar = name
      .split(" ")
      .filter(Boolean)
      .map((part: string) => part[0])
      .slice(0, 2)
      .join("") || DEFAULT_USER.avatar;

    return { name, role, avatar };
  } catch {
    return DEFAULT_USER;
  }
}

// ── Nav items ──────────────────────────────────────────────────────────────────
const NAV_ITEMS: NavItem[] = [
  {
    label: "ใบเสนอราคา",
    href:  "/quotation/create",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
        <polyline points="10 9 9 9 8 9"/>
      </svg>
    ),
  },
  {
    label: "จัดการโครงการ",
    href:  "/projects",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
        <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
      </svg>
    ),
  },
  {
    label: "จัดเก็บภาพผลงาน",
    href:  "/portfolio",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
        <circle cx="8.5" cy="8.5" r="1.5"/>
        <polyline points="21 15 16 10 5 21"/>
      </svg>
    ),
  },
  {
    label: "จัดการวัสดุอุปกรณ์",
    href:  "/materials",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
        <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
        <line x1="12" y1="22.08" x2="12" y2="12"/>
      </svg>
    ),
  },
  {
    label: "จัดการสั่งซื้อวัสดุ",
    href:  "/purchase",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
      </svg>
    ),
  },
  {
    label: "เบิก–คืนวัสดุ",
    href:  "/borrows",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <polyline points="17 1 21 5 17 9"/>
        <path d="M3 11V9a4 4 0 0 1 4-4h14"/>
        <polyline points="7 23 3 19 7 15"/>
        <path d="M21 13v2a4 4 0 0 1-4 4H3"/>
      </svg>
    ),
  },
  {
    label: "รายรับ–รายจ่าย",
    href:  "/finances",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <line x1="12" y1="1" x2="12" y2="23"/>
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
      </svg>
    ),
  },
  {
    label: "ผู้ใช้งาน",
    href:  "/users",
    adminOnly: true,
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="8" r="3"/>
        <path d="M6 21v-1a5 5 0 0 1 10 0v1"/>
      </svg>
    ),
  },
  // ── Admin only ──
  {
    label:     "รายงาน",
    href:      "/reports",
    adminOnly: true,
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <line x1="18" y1="20" x2="18" y2="10"/>
        <line x1="12" y1="20" x2="12" y2="4"/>
        <line x1="6"  y1="20" x2="6"  y2="14"/>
      </svg>
    ),
    children: [
      { label: "รายงานผลงานโครงการ",       href: "/reports/projects" },
      { label: "รายงานรายรับ–รายจ่าย",     href: "/reports/finance"  },
      { label: "รายงานเบิก–คืนวัสดุ",      href: "/reports/borrow"   },
    ],
  },
];

// ── Component ──────────────────────────────────────────────────────────────────
export default function AdminNavbar({ role: initialRole = DEFAULT_USER.role }: { role?: Role }) {
  const router          = useRouter();
  const pathname        = usePathname();
  const [mobileOpen,    setMobileOpen]    = useState(false);
  const [openDropdown,  setOpenDropdown]  = useState<string | null>(null);
  const [,              setProfileOpen]   = useState(false);
  const [user, setUser] = useState<User>(() => getStoredUser());

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    if (typeof window !== "undefined") {
      localStorage.removeItem("user");
    }
    router.replace("/login");
  };

  useEffect(() => {
    const loadUser = async () => {
      try {
        const res = await fetch("/api/auth/me", { credentials: "include" });
        if (!res.ok) return;
        const data = await res.json();

        if (data.user) {
          const name = `${data.user.firstName || ""} ${data.user.lastName || ""}`.trim() || DEFAULT_USER.name;
          const role = normalizeRole(data.user.role);
          const avatar = name
            .split(" ")
            .filter(Boolean)
            .map((part: string) => part[0])
            .slice(0, 2)
            .join("") || DEFAULT_USER.avatar;

          setUser({ name, role, avatar });
        }
      } catch (error) {
        console.error("Fetch user failed", error);
      }
    };

    loadUser();
  }, []);

  const role = user.role || initialRole;
  const visibleItems = NAV_ITEMS.filter(item => !item.adminOnly || role === "admin");

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  const toggleDropdown = (label: string) =>
    setOpenDropdown(prev => prev === label ? null : label);

  return (
    <>
      {/* ════ DESKTOP SIDEBAR ════ */}
      <aside className="admin-sidebar">
        {/* Logo */}
        <Link href="/quotation/create" className="nav-logo">
          <img src="/logo.jpg" alt="Suwan logo" className="nav-logo-img" />
          <div className="nav-logo-text">
            <div className="nav-logo-name">Suwan</div>
            <div className="nav-logo-sub">Interior & Renovation</div>
          </div>
        </Link>

        {/* User / Role */}
        <div className="role-badge">
          <div className="role-avatar">{user.avatar}</div>
          <div style={{ flex:1, overflow:"hidden" }}>
            <div className="role-name">{user.name}</div>
          </div>
          <span className={`role-label ${role === "admin" ? "role-admin" : "role-staff"}`}>
            {role === "admin" ? "Admin" : "Staff"}
          </span>
        </div>

        {/* Menu */}
        <div className="nav-section-label">เมนูหลัก</div>
        <nav className="nav-items">
          {visibleItems.map(item => (
            <div key={item.label} className="nav-item-wrap">
              {item.children ? (
                <>
                  <button
                    className={`nav-item${isActive(item.href) ? " active" : ""}`}
                    onClick={() => toggleDropdown(item.label)}
                  >
                    <span className="nav-item-icon">{item.icon}</span>
                    <span className="nav-item-label">{item.label}</span>
                    <svg className={`nav-chevron${openDropdown === item.label ? " open" : ""}`}
                         width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="6 9 12 15 18 9"/>
                    </svg>
                  </button>
                  <div className={`nav-dropdown${openDropdown === item.label ? " open" : ""}`}>
                    {item.children.map(child => (
                      <Link key={child.href} href={child.href}
                            className={`nav-sub-item${pathname === child.href ? " active" : ""}`}
                            onClick={() => setMobileOpen(false)}>
                        {child.label}
                      </Link>
                    ))}
                  </div>
                </>
              ) : (
                <Link href={item.href}
                      className={`nav-item${isActive(item.href) ? " active" : ""}`}
                      onClick={() => setMobileOpen(false)}>
                  <span className="nav-item-icon">{item.icon}</span>
                  <span className="nav-item-label">{item.label}</span>
                </Link>
              )}
            </div>
          ))}

          {/* Divider + admin-only report shortcut */}
          {role === "admin" && (
            <>
              <div className="nav-divider"/>
              <div className="nav-section-label" style={{ paddingTop:8 }}>รายงาน (Admin)</div>
            </>
          )}
        </nav>

        {/* Bottom */}
        <div className="nav-bottom">
          {/* <Link href="/settings" className="nav-bottom-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
            ตั้งค่า
          </Link> */}
          <button type="button" className="nav-bottom-btn logout" onClick={handleLogout}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            ออกจากระบบ
          </button>
        </div>
      </aside>

      {/* ════ MOBILE TOPBAR ════ */}
      <header className="admin-topbar">
        <button className={`ham-btn${mobileOpen ? " open" : ""}`} onClick={() => setMobileOpen(o => !o)}>
          <span/><span/><span/>
        </button>
        <Link href="/projects" style={{ display:"flex", alignItems:"center", gap:8, textDecoration:"none" }}>
          <img src="/logo.jpg" alt="Suwan logo" className="nav-logo-img" />
          <span style={{ fontFamily:"'Noto Serif Thai',serif", fontSize:14, fontWeight:700, color:"#fff" }}>Suwan</span>
        </Link>
        <div className="role-avatar" style={{ cursor:"pointer" }} onClick={() => setProfileOpen(o => !o)}>
          {user.avatar}
        </div>
      </header>

      {/* Mobile drawer */}
      <div className={`mobile-overlay${mobileOpen ? " open" : ""}`} onClick={() => setMobileOpen(false)}/>
      <div className={`mobile-drawer${mobileOpen ? " open" : ""}`}>
        {/* User */}
        <div style={{ padding:"16px 16px 12px", borderBottom:"1px solid rgba(255,255,255,0.07)" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div className="role-avatar">{user.avatar}</div>
            <div>
              <div style={{ fontSize:13, fontWeight:700, color:"#fff" }}>{user.name}</div>
              <span className={`role-label ${role==="admin"?"role-admin":"role-staff"}`} style={{ marginLeft:0 }}>
                {role === "admin" ? "Admin" : "Staff"}
              </span>
            </div>
          </div>
        </div>

        {/* Menu items */}
        <nav style={{ padding:"8px 10px" }}>
          {visibleItems.map(item => (
            <div key={item.label} className="nav-item-wrap">
              {item.children ? (
                <>
                  <button
                    className={`nav-item${isActive(item.href) ? " active" : ""}`}
                    onClick={() => toggleDropdown(item.label + "_mobile")}
                  >
                    <span className="nav-item-icon">{item.icon}</span>
                    <span className="nav-item-label">{item.label}</span>
                    <svg className={`nav-chevron${openDropdown === item.label+"_mobile" ? " open" : ""}`}
                         width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="6 9 12 15 18 9"/>
                    </svg>
                  </button>
                  <div className={`nav-dropdown${openDropdown === item.label+"_mobile" ? " open" : ""}`}>
                    {item.children.map(child => (
                      <Link key={child.href} href={child.href}
                            className={`nav-sub-item${pathname === child.href ? " active" : ""}`}
                            onClick={() => setMobileOpen(false)}>
                        {child.label}
                      </Link>
                    ))}
                  </div>
                </>
              ) : (
                <Link href={item.href}
                      className={`nav-item${isActive(item.href) ? " active" : ""}`}
                      onClick={() => setMobileOpen(false)}>
                  <span className="nav-item-icon">{item.icon}</span>
                  <span className="nav-item-label">{item.label}</span>
                </Link>
              )}
            </div>
          ))}
        </nav>

        {/* Bottom */}
        <div style={{ padding:"8px 10px", borderTop:"1px solid rgba(255,255,255,0.07)", marginTop:"auto" }}>
          {/* <Link href="/settings" className="nav-bottom-btn" onClick={() => setMobileOpen(false)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="12" cy="12" r="3"/>
            </svg>
            ตั้งค่า
          </Link> */}
          <button type="button" className="nav-bottom-btn logout" onClick={handleLogout}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            ออกจากระบบ
          </button>
        </div>
      </div>
    </>
  );
}
