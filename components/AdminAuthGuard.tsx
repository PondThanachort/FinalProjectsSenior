"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;

    const checkAuth = async () => {
      try {
        const res = await fetch("/api/auth/me", {
          credentials: "include",
          cache: "no-store",
        });

        if (!res.ok) {
          router.replace("/login");
          return;
        }
      } catch (error) {
        console.error("Admin auth check failed", error);
        router.replace("/login");
        return;
      } finally {
        if (active) setReady(true);
      }
    };

    checkAuth();

    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        checkAuth();
      }
    };

    window.addEventListener("pageshow", onPageShow);
    return () => {
      active = false;
      window.removeEventListener("pageshow", onPageShow);
    };
  }, [router]);

  if (!ready) {
    return null;
  }

  return <>{children}</>;
}
