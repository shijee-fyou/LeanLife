import Link from "next/link";

export default function HomePage() {
  return (
    <div className="app-shell">
      {/* ── Top nav ── */}
      <nav style={{
        position: "sticky", top: 18, zIndex: 30,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        gap: 12, padding: "10px 20px", marginBottom: 24,
        borderRadius: 999,
        background: "rgba(255,251,245,0.72)",
        backdropFilter: "blur(18px)",
        border: "1px solid rgba(255,255,255,0.82)",
        boxShadow: "0 12px 32px rgba(87,54,16,0.1)",
      }}>
        <span style={{ fontWeight: 900, fontSize: "1.1rem", letterSpacing: "-0.02em" }}>
          Lean<span style={{ color: "var(--primary)" }}>Life</span>
        </span>
        <div style={{ display: "flex", gap: 10 }}>
          <Link href="/login" className="ghost-btn">登录</Link>
          <Link href="/register" className="primary-btn" style={{ display: "inline-flex", alignItems: "center", textDecoration: "none" }}>
            免费开始
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <header className="hero" style={{ marginBottom: 32 }}>
        <div className="hero-copy">
          <p className="eyebrow">Diet Intelligence Studio</p>
          <h1>把减脂饮食，从"少吃点"升级成可计算、可追踪、可感知的系统。</h1>
          <p className="hero-text">
            内置主流减脂饮食方案库，结合身体数据和生活习惯生成营养建议，并通过日历与情绪化视觉反馈追踪身体反应。
          </p>
          <div className="hero-badges" style={{ marginBottom: 24 }}>
            <span>饮食方案库</span>
            <span>身体指标评估</span>
            <span>日历追踪系统</span>
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Link href="/register" className="primary-btn" style={{ display: "inline-flex", alignItems: "center", textDecoration: "none", fontSize: "1rem" }}>
              免费创建账户 →
            </Link>
            <Link href="/login" className="ghost-btn" style={{ display: "inline-flex", alignItems: "center", textDecoration: "none" }}>
              已有账户，直接登录
            </Link>
          </div>
        </div>
        <div className="card frosted">
          <p className="panel-label">今日聚焦</p>
          <div className="score-ring" style={{ "--score-fill": "280.8deg" } as React.CSSProperties}>
            <div>
              <strong>78</strong>
              <span>代谢准备度</span>
            </div>
          </div>
          <p className="panel-note">
            用体脂率、腰围、活动量与恢复质量，比单看 BMI 更接近真实减脂状态。
          </p>
        </div>
      </header>

      {/* ── Features ── */}
      <main style={{ display: "grid", gap: "var(--section-gap)" }}>
        <section className="story-block">
          <div className="story-copy">
            <p className="section-kicker">Why It Feels Different</p>
            <h2>不是在填一张表，而是在进入一个会理解身体反应的减脂系统。</h2>
            <p className="section-note">
              每一段内容都被重新组织成"理解问题、给出策略、承接执行"的连续叙事。
            </p>
          </div>
          <div className="story-visual ambient-panel">
            <div className="ambient-glow ambient-glow-a" />
            <div className="ambient-glow ambient-glow-b" />
            <div className="floating-stat">
              <span>代谢准备度</span>
              <strong>78</strong>
            </div>
            <div className="floating-caption">从评估到方案到执行反馈，形成完整闭环。</div>
          </div>
        </section>

        <section className="story-block story-block-reverse">
          <div className="story-visual story-visual-stack">
            <div className="story-card story-card-primary">
              <p className="section-kicker">6 种主流方案</p>
              <h3>均衡缺口、高蛋白、地中海、低碳、轻断食、高体积饮食。</h3>
              <p>每种方案都有完整的营养比例、执行重点和身体信号响应逻辑。</p>
            </div>
            <div className="story-card story-card-secondary">
              <span>个性化推荐</span>
              <span>营养追踪</span>
              <span>趋势分析</span>
            </div>
          </div>
          <div className="story-copy">
            <p className="section-kicker">Plan Library</p>
            <h2>减脂策略不只是"选一种饮食法"。</h2>
            <p className="section-note">
              训练频率、睡眠、压力、饮食规律性会重新塑造推荐方案，而不是只给一个静态答案。
            </p>
          </div>
        </section>

        {/* CTA */}
        <section style={{ padding: "48px 0", textAlign: "center", display: "grid", gap: 20, justifyItems: "center" }}>
          <p className="eyebrow">开始使用</p>
          <h2 style={{ fontSize: "clamp(1.8rem, 3.5vw, 3rem)", lineHeight: 1.1, maxWidth: "14ch", margin: 0, letterSpacing: "-0.03em" }}>
            把减脂从感觉升级成数据。
          </h2>
          <p style={{ color: "var(--muted)", maxWidth: "44ch", lineHeight: 1.7, margin: 0 }}>
            填写 14 个身体与习惯数据，立即获得个性化减脂方案，并通过每日追踪持续优化。
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center", marginTop: 8 }}>
            <Link href="/register" className="primary-btn" style={{ display: "inline-flex", alignItems: "center", textDecoration: "none", fontSize: "1.05rem", padding: "16px 28px" }}>
              免费创建账户 →
            </Link>
            <Link href="/login" className="ghost-btn" style={{ display: "inline-flex", alignItems: "center", textDecoration: "none", padding: "16px 24px" }}>
              已有账户，登录
            </Link>
          </div>
          <p style={{ color: "var(--muted)", fontSize: "0.82rem" }}>免费使用 · 无需信用卡</p>
        </section>
      </main>
    </div>
  );
}
