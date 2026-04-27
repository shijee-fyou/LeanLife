"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") ?? "/app/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: { message: string } };
      if (!res.ok) {
        setError(data.error?.message ?? "登录失败，请重试。");
        return;
      }
      router.push(from);
      router.refresh();
    } catch {
      setError("网络错误，请检查连接后重试。");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app-shell" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: "24px 0" }}>
      <div style={{ width: "min(440px, 100%)", display: "grid", gap: 24 }}>
        {/* Brand */}
        <div style={{ textAlign: "center" }}>
          <Link href="/" style={{ display: "inline-block", fontWeight: 900, fontSize: "1.5rem", letterSpacing: "-0.02em" }}>
            Lean<span style={{ color: "var(--primary)" }}>Life</span>
          </Link>
        </div>

        <div className="card" style={{ padding: "36px 32px", display: "grid", gap: 24 }}>
          <div style={{ display: "grid", gap: 6 }}>
            <p className="eyebrow" style={{ marginBottom: 4 }}>欢迎回来</p>
            <h1 style={{ margin: 0, fontSize: "1.75rem", lineHeight: 1.15 }}>登录账户</h1>
            <p style={{ margin: 0, color: "var(--muted)", fontSize: "0.9rem" }}>
              还没有账户？{" "}
              <Link href="/register" style={{ color: "var(--primary)", fontWeight: 700 }}>
                免费注册
              </Link>
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: "grid", gap: 14 }}>
            <label>
              邮箱
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                autoComplete="email"
              />
            </label>

            <label>
              密码
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="至少 8 位"
                autoComplete="current-password"
              />
            </label>

            {error && (
              <div style={{ padding: "10px 14px", borderRadius: "var(--radius-sm)", background: "rgba(227,93,106,0.1)", color: "var(--danger)", fontWeight: 600, fontSize: "0.88rem" }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="primary-btn"
              style={{ width: "100%", marginTop: 4, padding: "14px", borderRadius: "var(--radius-sm)" }}
            >
              {loading ? "登录中…" : "登录"}
            </button>
          </form>
        </div>

        <p style={{ textAlign: "center", color: "var(--muted)", fontSize: "0.82rem", margin: 0 }}>
          使用即表示同意服务条款与隐私政策
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
