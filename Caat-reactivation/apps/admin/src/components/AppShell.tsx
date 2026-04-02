"use client";
import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import TokenBanner from "./TokenBanner";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLogin = pathname === "/login";

  if (isLogin) {
    return <>{children}</>;
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
