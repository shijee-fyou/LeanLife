"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RegisterPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password !== confirm) {
      setError("两次密码不一致。");
      return;
    }
    if (password.length < 8) {
      setError("密码至少需要 8 位。");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: { message: string } };
      if (!res.ok) {
        setError(data.error?.message ?? "注册失败，请重试。");
        return;
      }
      router.push("/app/dashboard");
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
            <p className="eyebrow" style={{ marginBottom: 4 }}>开始使用</p>
            <h1 style={{ margin: 0, fontSize: "1.75rem", lineHeight: 1.15 }}>创建账户</h1>
            <p style={{ margin: 0, color: "var(--muted)", fontSize: "0.9rem" }}>
              已有账户？{" "}
              <Link href="/login" style={{ color: "var(--primary)", fontWeight: 700 }}>
                直接登录
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
                autoComplete="new-password"
              />
            </label>

            <label>
              确认密码
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                placeholder="再次输入密码"
                autoComplete="new-password"
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
              {loading ? "注册中…" : "创建账户"}
            </button>
          </form>
        </div>

        <p style={{ textAlign: "center", color: "var(--muted)", fontSize: "0.82rem", margin: 0 }}>
          免费使用 · 无需信用卡 · 随时可以删除账户
        </p>
      </div>
    </div>
  );
}
