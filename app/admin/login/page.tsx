"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await signIn("credentials", { email, password, redirect: false });
    if (res?.ok) {
      router.push("/admin");
    } else {
      setError("Invalid credentials.");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg px-4">
      <div className="w-full max-w-sm">
        <h1 className="font-display text-4xl tracking-wider text-text-primary mb-8 text-center">
          ADMIN
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-surface border border-border rounded-lg px-4 py-3 font-body text-text-primary placeholder:text-text-muted focus:outline-none focus:border-tier-great"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-surface border border-border rounded-lg px-4 py-3 font-body text-text-primary placeholder:text-text-muted focus:outline-none focus:border-tier-great"
          />
          {error && <p className="text-xs text-tier-skip">{error}</p>}
          <button
            type="submit"
            className="w-full bg-tier-great text-bg font-display tracking-wider py-3 rounded-lg hover:opacity-90 transition-opacity"
          >
            SIGN IN
          </button>
        </form>
      </div>
    </div>
  );
}
