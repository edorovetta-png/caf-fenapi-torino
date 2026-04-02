"use client";
import { useState } from "react";

export default function Login() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [ok, setOk] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (password === "CAAT2026") {
      setError(false);
      setOk(true);
      localStorage.setItem("caat_auth", "true");
      setTimeout(() => { window.location.href = "/"; }, 500);
    } else {
      setError(true);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-96">
        <h1 className="text-xl font-bold text-slate-900 mb-1">CAAT Reactivation</h1>
        <p className="text-sm text-slate-500 mb-6">Accedi al pannello admin</p>
        {ok ? (
          <p className="text-green-600 text-sm">Accesso effettuato. Reindirizzamento...</p>
        ) : (
          <form onSubmit={handleLogin}>
            <input type="password" value={password} onChange={(e) => { setPassword(e.target.value); setError(false); }}
              placeholder="Password" required autoFocus
              className={`w-full px-4 py-2.5 border rounded-lg text-sm mb-3 ${error ? "border-red-400" : "border-slate-200"}`} />
            {error && <p className="text-red-500 text-xs mb-3">Password errata</p>}
            <button type="submit" className="w-full py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
              Accedi
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
