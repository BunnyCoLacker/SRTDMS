import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const { login, blockedMessage } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    const res = await login(email, password);
    setSubmitting(false);
    if (!res.success) {
      setError(res.message);
      return;
    }
    navigate("/", { replace: true });
  };

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-4xl grid md:grid-cols-5 rounded-2xl overflow-hidden shadow-card border border-ledger-900/5 bg-white">
        {/* Signature side panel: a store ledger stub */}
        <div className="hidden md:flex md:col-span-2 flex-col justify-between bg-ledger-800 text-paper p-8 relative">
          <div className="absolute inset-y-0 right-0 w-2 bg-stitch opacity-40" />
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-gold-300 font-semibold">Sari-Sari Store</p>
            <h1 className="font-display text-3xl mt-3 leading-tight">
              Utang<br />Ledger
            </h1>
          </div>
          <div className="space-y-4 text-sm text-ledger-100/90">
            <div className="border-t border-ledger-100/15 pt-4">
              <p className="text-gold-300 font-semibold mb-1">01 — Record</p>
              <p>Log every borrowed item, quantity, and date the moment it leaves the shelf.</p>
            </div>
            <div className="border-t border-ledger-100/15 pt-4">
              <p className="text-gold-300 font-semibold mb-1">02 — Track</p>
              <p>See who's overdue at a glance, from the day the debt started.</p>
            </div>
            <div className="border-t border-ledger-100/15 pt-4">
              <p className="text-gold-300 font-semibold mb-1">03 — Collect</p>
              <p>Accept full or partial payments and watch balances update instantly.</p>
            </div>
          </div>
        </div>

        {/* Form side */}
        <div className="md:col-span-3 p-8 sm:p-10">
          <div className="md:hidden mb-6">
            <p className="text-xs uppercase tracking-[0.2em] text-gold-600 font-semibold">Sari-Sari Store</p>
            <h1 className="font-display text-2xl text-ledger-800">Utang Ledger</h1>
          </div>
          <h2 className="font-display text-2xl text-ink mb-1">Welcome back</h2>
          <p className="text-sm text-muted mb-6">Sign in to open your storage.</p>

          {blockedMessage && (
            <div className="mb-5 rounded-lg border border-rust/30 bg-rust/5 px-4 py-3 text-sm text-rust">
              <p className="font-semibold mb-0.5">No active storage assigned</p>
              <p>{blockedMessage}</p>
            </div>
          )}

          {error && !blockedMessage && (
            <div className="mb-5 rounded-lg border border-rust/30 bg-rust/5 px-4 py-3 text-sm text-rust">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label" htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                required
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@store.com"
              />
            </div>
            <div>
              <label className="label" htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                required
                className="input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <button type="submit" disabled={submitting} className="btn-primary w-full mt-2">
              {submitting ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <p className="text-xs text-muted mt-6">
            Store owner accounts need an active storage assigned by the admin before they can sign in.
          </p>
        </div>
      </div>
    </div>
  );
}
