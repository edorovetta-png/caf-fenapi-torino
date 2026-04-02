"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const nav = [
  { href: "/", label: "Dashboard", icon: "📊" },
  { href: "/simulatore", label: "Simulatore", icon: "💬" },
  { href: "/clienti", label: "Clienti", icon: "👥" },
  { href: "/import", label: "Import Dati", icon: "📥" },
  { href: "/regole", label: "Regole", icon: "📋" },
  { href: "/conversazioni", label: "Conversazioni", icon: "🗨️" },
  { href: "/consumo", label: "Consumo", icon: "💰" },
  { href: "/impostazioni", label: "Impostazioni", icon: "⚙️" },
];

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-56 bg-slate-900 text-slate-300 min-h-screen flex flex-col">
      <div className="p-5 border-b border-slate-700">
        <h1 className="text-white font-bold text-lg tracking-tight">CAAT Reactivation</h1>
        <p className="text-xs text-slate-500 mt-0.5">Admin Panel</p>
      </div>
      <nav className="flex-1 py-3">
        {nav.map((item) => {
          const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-5 py-2.5 text-sm transition-colors ${
                active
                  ? "bg-slate-800 text-white border-r-2 border-blue-400"
                  : "hover:bg-slate-800/50 hover:text-white"
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-slate-700">
        <button
          onClick={() => { localStorage.removeItem("caat_auth"); window.location.href = "/login"; }}
          className="text-xs text-slate-500 hover:text-white transition-colors"
        >
          Esci
        </button>
      </div>
    </aside>
  );
}
