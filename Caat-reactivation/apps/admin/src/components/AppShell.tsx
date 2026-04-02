"use client";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Sidebar from "./Sidebar";
import TokenBanner from "./TokenBanner";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isLogin = pathname === "/login";
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const ok = localStorage.getItem("caat_auth") === "true";
    setAuthed(ok);
    setChecking(false);
    if (!ok && !isLogin) {
      router.replace("/login");
    }
  }, [pathname, isLogin, router]);

  if (isLogin) {
    return <>{children}</>;
  }

  if (checking || !authed) {
    return null;
  }

  return (
    <div className="flex min-h-full bg-slate-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-auto">
        <TokenBanner />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
