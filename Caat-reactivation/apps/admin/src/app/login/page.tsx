"use client";
import { useState } from "react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    // For now, just redirect (auth will be implemented in production)
    setSent(true);
    setTimeout(() => { window.location.href = "/"; }, 1000);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-96">
        <h1 className="text-xl font-bold text-slate-900 mb-1">CAAT Reactivation</h1>
        <p className="text-sm text-slate-500 mb-6">Accedi al pannello admin</p>
        {sent ? (
          <p className="text-green-600 text-sm">✓ Accesso effettuato. Reindirizzamento...</p>
        ) : (
          <form onSubmit={handleLogin}>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="La tua email" required
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm mb-3" />
            <button type="submit" className="w-full py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
              Accedi
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
