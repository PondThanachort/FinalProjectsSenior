// app/(admin)/layout.tsx
// Layout ครอบทุกหน้า admin — ใส่ Navbar ที่นี่ที่เดียว

import AdminAuthGuard from "@/components/AdminAuthGuard";
import AdminNavbar from "@/components/AdminNavbar/AdminNavbar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthGuard>
      {/* Sidebar / Topbar */}
      <AdminNavbar />

      {/* Main content — เว้นพื้นที่ให้ sidebar */}
      <main className="admin-content">
        {children}
      </main>
    </AdminAuthGuard>
  );
}