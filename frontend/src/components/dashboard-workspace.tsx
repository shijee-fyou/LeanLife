"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { CalendarDayStatus, CalendarMonthStatus, DailyLogDetail, WorkspaceData } from "@/lib/types";

// ─── Diet Plans data ────────────────────────────────────────────────────────
interface DietPlan {
  id: string;
  name: string;
  summary: string;
  satiety: number;
  adherence: number;
  trainingFit: number;
  carbLevel: string;
  tags: string[];
  calorieRatio: { protein: number; fat: number; carbs: number };
  mealRhythm: string;
  focus: string[];
  trackingSignals: string[];
  responseLogic: { lowEnergy: string; highHunger: string; lowAdherence: string };
}

const dietPlans: DietPlan[] = [
  {
    id: "balanced-deficit",
    name: "均衡热量缺口",
    summary: "适合大多数减脂用户，围绕蛋白质充足、总热量可控、食物选择灵活来提升长期依从性。",
    satiety: 4,
    adherence: 5,
    trainingFit: 4,
    carbLevel: "中",
    tags: ["入门友好", "长期坚持", "适应社交"],
    calorieRatio: { protein: 0.3, fat: 0.28, carbs: 0.42 },
    mealRhythm: "3 餐 + 1 次加餐弹性安排",
    focus: ["优先达到蛋白目标", "每餐保留主食", "外食时先控油脂和酱料"],
    trackingSignals: ["体重周均值", "腰围", "饥饿感", "训练表现", "热量缺口执行度"],
    responseLogic: {
      lowEnergy: "如果连续低能量，先补足训练日前后的碳水，而不是直接继续降热量。",
      highHunger: "若饥饿感高，增加蔬菜体积和蛋白质分配，减少液体热量。",
      lowAdherence: "若执行度差，优先降低复杂度，使用更稳定的固定餐模板。",
    },
  },
  {
    id: "high-protein",
    name: "高蛋白减脂",
    summary: "提高蛋白质摄入，帮助保留瘦体重并增强饱腹感，适合训练人群和容易饿的用户。",
    satiety: 5,
    adherence: 4,
    trainingFit: 5,
    carbLevel: "中",
    tags: ["控饿", "保肌", "力量训练"],
    calorieRatio: { protein: 0.35, fat: 0.25, carbs: 0.4 },
    mealRhythm: "3 餐均匀高蛋白，训练后优先补蛋白和碳水",
    focus: ["每餐 30g 以上蛋白", "训练后补充优质蛋白", "晚餐避免只吃碳水"],
    trackingSignals: ["训练恢复", "饱腹感", "体重变化", "腰围", "蛋白达标率"],
    responseLogic: {
      lowEnergy: "若训练疲劳明显，优先把碳水往训练前后集中，而不是削减蛋白。",
      highHunger: "若仍经常饥饿，说明蛋白分配不均匀，可把早餐和下午加餐补起来。",
      lowAdherence: "若蛋白目标过难达成，先锁定 2 个固定高蛋白主食组合。",
    },
  },
  {
    id: "mediterranean",
    name: "地中海式减脂",
    summary: "强调蔬果、橄榄油、鱼类与全谷物，对心血管友好，适合追求健康质量的用户。",
    satiety: 4,
    adherence: 4,
    trainingFit: 4,
    carbLevel: "中",
    tags: ["健康导向", "高质量食物", "家庭饮食"],
    calorieRatio: { protein: 0.28, fat: 0.32, carbs: 0.4 },
    mealRhythm: "2 到 3 餐稳定进食，强调天然食材质量",
    focus: ["用橄榄油和坚果替代反式脂肪", "主食优先全谷物", "每日至少 500g 蔬果"],
    trackingSignals: ["腰围", "能量感", "饮食规律性", "执行舒适度", "膳食纤维"],
    responseLogic: {
      lowEnergy: "若能量偏低，检查是否主食摄入太保守，适当增加全谷物比例。",
      highHunger: "若饥饿感高，先看纤维和蛋白是否不足，再考虑增加餐次。",
      lowAdherence: "若执行困难，可先把饮食质量优化，再逐步拉开热量缺口。",
    },
  },
  {
    id: "low-carb",
    name: "低碳减脂",
    summary: "减少碳水以帮助部分用户降低食欲波动与水重波动，更适合爱吃肉蛋奶和精制主食依赖者。",
    satiety: 4,
    adherence: 3,
    trainingFit: 3,
    carbLevel: "低",
    tags: ["控糖波动", "水重管理", "适合晚间食欲强"],
    calorieRatio: { protein: 0.34, fat: 0.4, carbs: 0.26 },
    mealRhythm: "2 到 3 餐，减少精制主食，碳水集中在白天或训练前后",
    focus: ["去掉高糖零食和液体糖", "主食控量但不极端断碳", "优先原型食物"],
    trackingSignals: ["饥饿波动", "体重初期变化", "训练状态", "便秘风险", "碳水超标次数"],
    responseLogic: {
      lowEnergy: "若训练发空，说明碳水过低，可在训练日前后增加定量主食。",
      highHunger: "若晚间暴食冲动仍强，检查白天是否吃得过少或蛋白不足。",
      lowAdherence: "若坚持困难，先从晚餐低碳开始，而不是全天低碳。",
    },
  },
  {
    id: "if",
    name: "轻断食（16:8）",
    summary: "通过缩短进食窗口降低总摄入，适合时间管理强、早餐欲望不高的用户。",
    satiety: 3,
    adherence: 3,
    trainingFit: 3,
    carbLevel: "中",
    tags: ["时间型策略", "办公族", "外食友好"],
    calorieRatio: { protein: 0.32, fat: 0.28, carbs: 0.4 },
    mealRhythm: "8 小时进食窗口内完成 2 到 3 餐",
    focus: ["固定进食窗口", "开窗首餐优先蛋白质", "避免因空腹过久导致晚间补偿"],
    trackingSignals: ["能量稳定度", "晚间饥饿感", "执行度", "体重", "进食窗口完成度"],
    responseLogic: {
      lowEnergy: "若上午或训练时段明显乏力，说明窗口不适合当前作息，应调整时段。",
      highHunger: "若晚间饥饿很强，优先增加开窗首餐体积和蛋白，而不是继续拖到更晚。",
      lowAdherence: "若经常破窗，说明当前生活节奏不匹配，可切回均衡缺口策略。",
    },
  },
  {
    id: "volumetrics",
    name: "高体积低密度饮食",
    summary: "通过蔬菜、菌菇、汤类和高纤维食材增加餐盘体积，让减脂阶段更有满足感。",
    satiety: 5,
    adherence: 4,
    trainingFit: 4,
    carbLevel: "中高",
    tags: ["大份量", "高纤维", "适合饥饿感高"],
    calorieRatio: { protein: 0.3, fat: 0.24, carbs: 0.46 },
    mealRhythm: "每餐先铺体积食物，再补主蛋白和定量主食",
    focus: ["餐前汤和蔬菜先行", "高纤维替代精制零食", "防止低热量但高饥饿"],
    trackingSignals: ["饥饿感", "饱腹持续性", "执行舒适度", "腰围", "膳食纤维"],
    responseLogic: {
      lowEnergy: "若能量不足，说明碳水密度太低，可保留固定主食份额。",
      highHunger: "若仍常饿，说明蛋白和脂肪支撑不够，不只是体积不够。",
      lowAdherence: "若准备成本太高，可建立 3 套固定高体积餐模板轮换。",
    },
  },
];

// ─── Trend metrics config ────────────────────────────────────────────────────
const TREND_METRICS = {
  weight: { label: "体重", unit: "kg", color: "#ff784f", description: "记录体重变化趋势，以周均值判断是否在减脂通道内。" },
  waist: { label: "腰围", unit: "cm", color: "#245c4d", description: "腰围对内脏脂肪更敏感，比体重更能反映减脂质量。" },
  energy: { label: "能量感", unit: "/5", color: "#f2a93b", description: "主观能量感反映身体对饮食和训练的适应程度。" },
  adherence: { label: "执行度", unit: "/5", color: "#67b26f", description: "记录每天的饮食执行质量，找到依从性瓶颈。" },
};
type TrendMetricKey = keyof typeof TREND_METRICS;

// ─── Calculation helpers ─────────────────────────────────────────────────────
function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function buildSmoothPath(plotted: { x: number; y: number }[]): string {
  if (!plotted.length) return "";
  if (plotted.length === 1) return `M ${plotted[0].x} ${plotted[0].y}`;
  if (plotted.length === 2) return `M ${plotted[0].x} ${plotted[0].y} L ${plotted[1].x} ${plotted[1].y}`;
  let path = `M ${plotted[0].x} ${plotted[0].y}`;
  for (let i = 0; i < plotted.length - 1; i++) {
    const cur = plotted[i], next = plotted[i + 1];
    const prev = plotted[i - 1] ?? cur, afterNext = plotted[i + 2] ?? next;
    const cp1x = cur.x + (next.x - prev.x) / 6;
    const cp1y = cur.y + (next.y - prev.y) / 6;
    const cp2x = next.x - (afterNext.x - cur.x) / 6;
    const cp2y = next.y - (afterNext.y - cur.y) / 6;
    path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${next.x} ${next.y}`;
  }
  return path;
}

interface TrendPoint { date: string; value: number }
function buildTrendPath(points: TrendPoint[], w: number, h: number, pad: number) {
  if (!points.length) return { line: "", area: "", plotted: [] as ({ date: string; value: number; x: number; y: number })[] };
  const values = points.map((p) => p.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = Math.max(max - min, 1);
  const uw = w - pad * 2, uh = h - pad * 2;
  const plotted = points.map((p, i) => ({
    ...p,
    x: pad + (points.length === 1 ? uw / 2 : (uw / (points.length - 1)) * i),
    y: pad + uh - ((p.value - min) / range) * uh,
  }));
  const line = buildSmoothPath(plotted);
  const area = `${line} L ${plotted[plotted.length - 1].x} ${h - pad} L ${plotted[0].x} ${h - pad} Z`;
  return { line, area, plotted };
}

const MEAL_SLOT_LABELS: Record<string, string> = {
  breakfast: "早餐",
  lunch: "午餐",
  dinner: "晚餐",
  snack: "加餐",
  firstMeal: "开窗餐",
  mainMeal: "主餐",
  closeWindowSnack: "收窗餐",
};

// ─── API helpers ─────────────────────────────────────────────────────────────
async function apiWorkspace<TBody>(path: string, body?: TBody, method = "POST"): Promise<WorkspaceData> {
  const res = await fetch(path, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    let msg = `request failed (${res.status})`;
    try {
      const errData = await res.json() as { error?: { message?: string } };
      if (errData?.error?.message) msg = errData.error.message;
    } catch { /* non-JSON body, keep default */ }
    throw new Error(msg);
  }
  return ((await res.json()) as { data: WorkspaceData }).data;
}

async function fetchLogForDate(date: string): Promise<DailyLogDetail | null> {
  const res = await fetch("/api/workspace/log-for-date", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ date }),
  });
  if (!res.ok) return null;
  return ((await res.json()) as { data: DailyLogDetail | null }).data;
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

// ─── Props ───────────────────────────────────────────────────────────────────
interface Props {
  initialData: WorkspaceData;
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function ScoreBar({ value, max = 5, color = "var(--secondary)" }: { value: number; max?: number; color?: string }) {
  const pct = Math.round((value / max) * 100);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ flex: 1, height: 6, borderRadius: 999, background: "var(--line)", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 999, transition: "width 0.4s" }} />
      </div>
      <span style={{ fontSize: "0.8rem", color: "var(--muted)", fontWeight: 700, minWidth: 18 }}>{value}</span>
    </div>
  );
}

function NutritionProgressBar({ label, actual, target, unit }: { label: string; actual: number; target: number; unit: string }) {
  const pct = target > 0 ? Math.min(100, Math.round((actual / target) * 100)) : 0;
  const over = actual > target * 1.1;
  const good = pct >= 75 && !over;
  const fillColor = over ? "var(--danger)" : good ? "var(--secondary)" : "var(--primary)";
  return (
    <div style={{ display: "grid", gap: 4 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem" }}>
        <span style={{ fontWeight: 700 }}>{label}</span>
        <span style={{ color: over ? "var(--danger)" : "var(--muted)" }}>{actual} / {target} {unit}</span>
      </div>
      <div className="nutrition-progress">
        <span style={{ width: `${pct}%`, background: fillColor }} />
      </div>
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────
export function DashboardWorkspace({ initialData }: Props) {
  const router = useRouter();
  const [workspace, setWorkspace] = useState(initialData);
  const [statusText, setStatusText] = useState<string | null>(null);
  const [statusType, setStatusType] = useState<"pending" | "success" | "error">("pending");
  const [isPending, startTransition] = useTransition();

  // Date navigation
  const [viewDate, setViewDate] = useState(todayStr());
  const [viewLog, setViewLog] = useState<DailyLogDetail | null>(null);
  const [logLoading, setLogLoading] = useState(false);

  // Calendar
  const [calMonth, setCalMonth] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [monthStatus, setMonthStatus] = useState<CalendarMonthStatus | null>(null);

  // Trend
  const [trendMetric, setTrendMetric] = useState<TrendMetricKey>("weight");
  const [trendData, setTrendData] = useState<Record<string, TrendPoint[]>>({});

  // Plans
  const recommendedPlanId = workspace.assessment.recommendedPlan.code;
  const [activePlanId, setActivePlanId] = useState(recommendedPlanId);
  const [expandedPlanId, setExpandedPlanId] = useState(recommendedPlanId);
  const activePlan = dietPlans.find((p) => p.id === activePlanId) ?? dietPlans[0];

  // Nutrition workspace modal
  const [workspaceOpen, setWorkspaceOpen] = useState(false);
  const [foodQuery, setFoodQuery] = useState("");
  const [foodCategory, setFoodCategory] = useState("全部");
  const [selectedFoodId, setSelectedFoodId] = useState(initialData.foods[0]?.id ?? "");
  const [foodAmount, setFoodAmount] = useState("100");
  const [foodUnit, setFoodUnit] = useState(initialData.foods[0]?.defaultUnit ?? "g");
  const [mealSlot, setMealSlot] = useState("breakfast");

  // Assessment form (14 fields)
  const [aForm, setAForm] = useState({
    sex: "male",
    age: "28",
    height: String(workspace.profile.heightCm ?? 172),
    weight: String(workspace.dailyLog.bodyMetrics?.weightKg ?? 70),
    waist: String(workspace.dailyLog.bodyMetrics?.waistCm ?? 80),
    neck: "38",
    hip: "98",
    activity: "1.55",
    trainingDays: String(workspace.profile.trainingDaysPerWeek ?? 4),
    sleepHours: "7.2",
    stress: "2",
    water: "2.3",
    mealRhythm: "mixed",
    goalPace: "0.18",
  });

  // Tracking form
  const [trackForm, setTrackForm] = useState({
    weight: String(workspace.dailyLog.bodyMetrics?.weightKg ?? ""),
    waist: String(workspace.dailyLog.bodyMetrics?.waistCm ?? ""),
    hydration: String(workspace.dailyLog.bodyMetrics?.hydrationMl ?? ""),
    energy: 3,
    adherence: 3, // stored as 1 / 3 / 5
    note: "",
  });

  // Scroll progress for story nav
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeSection, setActiveSection] = useState("scene-intake");

  // Refs for scroll detection

  useEffect(() => {
    const onScroll = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      if (total > 0) setScrollProgress(Math.round((window.scrollY / total) * 100));

      const ids = ["scene-intake", "scene-metrics", "scene-plans", "scene-tracker"];
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 140) setActiveSection(id);
        }
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Reveal animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("is-visible"); }),
      { threshold: 0.07, rootMargin: "0px 0px -40px 0px" }
    );
    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const resultPayload = workspace.assessment.resultPayload as {
    estimatedBmr?: number;
    estimatedTdee?: number;
    estimatedBodyFatPercent?: number | null;
  };

  // Compute metabolic readiness score from backend data
  const metabolicReadiness = useMemo(() => {
    const bmr = resultPayload.estimatedBmr ?? 1600;
    const tdee = resultPayload.estimatedTdee ?? 2200;
    const bf = resultPayload.estimatedBodyFatPercent;
    const bfScore = 100 - clamp(bf ?? 24, 8, 40);
    const activityRatio = tdee / bmr;
    const activityScore = clamp((activityRatio - 1) * 100, 20, 80);
    return Math.round((bfScore + activityScore + 72) / 3);
  }, [resultPayload]);

  // Food catalog helpers
  const foodCategories = useMemo(
    () => ["全部", ...Array.from(new Set(workspace.foods.map((f) => f.category)))],
    [workspace.foods]
  );

  const filteredFoods = useMemo(() => {
    const q = foodQuery.trim().toLowerCase();
    return workspace.foods.filter((f) => {
      const inCat = foodCategory === "全部" || f.category === foodCategory;
      const inQ = !q || f.name.toLowerCase().includes(q) || f.category.toLowerCase().includes(q);
      return inCat && inQ;
    });
  }, [workspace.foods, foodCategory, foodQuery]);

  const selectedFood = workspace.foods.find((f) => f.id === selectedFoodId) ?? workspace.foods[0];

  // Sync unit when food changes
  useEffect(() => {
    if (selectedFood) {
      setFoodUnit(selectedFood.defaultUnit);
      setFoodAmount(
        selectedFood.measureBase === "ml" ? "250"
          : selectedFood.defaultUnit === "piece" ? "1"
          : "100"
      );
    }
  }, [selectedFoodId]); // eslint-disable-line react-hooks/exhaustive-deps

  const isToday = viewDate === todayStr();
  const activeLog = isToday ? workspace.dailyLog : viewLog;

  // Build trend data from current workspace (today's data)
  useEffect(() => {
    const log = workspace.dailyLog;
    const date = log.logDate;
    if (!date) return;
    setTrendData((prev) => {
      const updated = { ...prev };
      if (log.bodyMetrics?.weightKg) {
        updated.weight = [{ date, value: log.bodyMetrics.weightKg }, ...(prev.weight?.filter(p => p.date !== date) ?? [])].sort((a, b) => a.date.localeCompare(b.date));
      }
      if (log.bodyMetrics?.waistCm) {
        updated.waist = [{ date, value: log.bodyMetrics.waistCm }, ...(prev.waist?.filter(p => p.date !== date) ?? [])].sort((a, b) => a.date.localeCompare(b.date));
      }
      if (log.energyScore) {
        updated.energy = [{ date, value: log.energyScore }, ...(prev.energy?.filter(p => p.date !== date) ?? [])].sort((a, b) => a.date.localeCompare(b.date));
      }
      if (log.adherenceScore) {
        updated.adherence = [{ date, value: log.adherenceScore }, ...(prev.adherence?.filter(p => p.date !== date) ?? [])].sort((a, b) => a.date.localeCompare(b.date));
      }
      return updated;
    });
  }, [workspace.dailyLog]);

  // Prefetch last 13 days of logs to populate trend charts on mount
  useEffect(() => {
    const prefetch = async () => {
      const today = new Date();
      const dates: string[] = [];
      for (let i = 1; i <= 13; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        dates.push(d.toISOString().slice(0, 10));
      }
      const results = await Promise.allSettled(dates.map((date) => fetchLogForDate(date)));
      setTrendData((prev) => {
        const updated: Record<string, TrendPoint[]> = {};
        for (const key of Object.keys(prev)) updated[key] = [...prev[key]];
        results.forEach((result, idx) => {
          if (result.status !== "fulfilled" || !result.value) return;
          const log = result.value;
          const date = dates[idx];
          if (log.bodyMetrics?.weightKg) {
            updated.weight = [...(updated.weight ?? []).filter(p => p.date !== date), { date, value: log.bodyMetrics!.weightKg! }];
          }
          if (log.bodyMetrics?.waistCm) {
            updated.waist = [...(updated.waist ?? []).filter(p => p.date !== date), { date, value: log.bodyMetrics!.waistCm! }];
          }
          if (log.energyScore) {
            updated.energy = [...(updated.energy ?? []).filter(p => p.date !== date), { date, value: log.energyScore! }];
          }
          if (log.adherenceScore) {
            updated.adherence = [...(updated.adherence ?? []).filter(p => p.date !== date), { date, value: log.adherenceScore! }];
          }
        });
        for (const key of Object.keys(updated)) {
          updated[key] = updated[key].sort((a, b) => a.date.localeCompare(b.date));
        }
        return updated;
      });
    };
    void prefetch();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch calendar month status whenever the viewed month or today's log changes
  useEffect(() => {
    const year = calMonth.getFullYear();
    const month = calMonth.getMonth() + 1;
    const todayLocal = todayStr();

    // Build today's status directly from workspace (always accurate, no API lag)
    const log = workspace.dailyLog;
    const todayLive: CalendarDayStatus | null =
      (log.foods.length > 0 || log.bodyMetrics?.weightKg != null)
        ? {
            date: todayLocal,
            hasWeight: log.bodyMetrics?.weightKg != null,
            foodCount: log.foods.length,
            totalCalories: log.nutrition?.calories ?? 0,
            caloriesPct:
              workspace.assessment.targetCalories > 0 && (log.nutrition?.calories ?? 0) > 0
                ? Math.round(((log.nutrition?.calories ?? 0) / workspace.assessment.targetCalories) * 100)
                : null,
            adherenceScore: log.adherenceScore ?? null,
            energyScore: log.energyScore ?? null,
          }
        : null;

    void fetch(`/api/workspace/calendar-status?year=${year}&month=${month}`)
      .then((r) => r.ok ? r.json() : null)
      .then((json: { data: CalendarMonthStatus } | null) => {
        if (json?.data) {
          // Merge live today data (overrides API data for today)
          const days = todayLive
            ? [...json.data.days.filter((d) => d.date !== todayLocal), todayLive].sort((a, b) => a.date.localeCompare(b.date))
            : json.data.days;
          setMonthStatus({ ...json.data, days });
        } else if (todayLive) {
          // API failed but we still have today's local data
          setMonthStatus((prev) => prev
            ? { ...prev, days: [...prev.days.filter((d) => d.date !== todayLocal), todayLive].sort((a, b) => a.date.localeCompare(b.date)) }
            : { year, month, days: [todayLive], currentStreak: 1, longestStreak: 1, loggedDays: 1 }
          );
        }
      })
      .catch(() => {
        if (todayLive) {
          setMonthStatus((prev) => prev
            ? { ...prev, days: [...prev.days.filter((d) => d.date !== todayLocal), todayLive].sort((a, b) => a.date.localeCompare(b.date)) }
            : { year, month, days: [todayLive], currentStreak: 1, longestStreak: 1, loggedDays: 1 }
          );
        }
      });
  }, [calMonth, workspace.dailyLog.foods.length, workspace.dailyLog.bodyMetrics?.weightKg, workspace.dailyLog.nutrition?.calories]); // eslint-disable-line react-hooks/exhaustive-deps

  // Mutations
  function runMutation<T>(
    label: string,
    path: string,
    body?: T,
    opts?: { method?: string; onSuccess?: () => void }
  ) {
    setStatusText(`${label}处理中…`);
    setStatusType("pending");
    startTransition(async () => {
      try {
        const next = await apiWorkspace(path, body, opts?.method ?? "POST");
        setWorkspace(next);
        setStatusType("success");
        setStatusText(`✓ ${label}已同步`);
        setTimeout(() => setStatusText(null), 2500);
        opts?.onSuccess?.();
      } catch (err) {
        setStatusType("error");
        setStatusText(err instanceof Error ? err.message : `${label}失败`);
        setTimeout(() => setStatusText(null), 4000);
      }
    });
  }

  async function navigateDate(date: string) {
    if (date > todayStr()) return;
    setViewDate(date);
    if (date === todayStr()) { setViewLog(null); return; }
    setLogLoading(true);
    const log = await fetchLogForDate(date);
    setViewLog(log);
    setLogLoading(false);
  }

  function handleLogout() {
    fetch("/api/auth/logout", { method: "POST" }).then(() => {
      router.push("/login");
      router.refresh();
    });
  }

  // Calendar helpers
  const calendarDays = useMemo(() => {
    const year = calMonth.getFullYear(), month = calMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const offset = firstDay === 0 ? 6 : firstDay - 1;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: (number | null)[] = [];
    for (let i = 0; i < offset; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    return cells;
  }, [calMonth]);

  const daysInCalMonth = new Date(calMonth.getFullYear(), calMonth.getMonth() + 1, 0).getDate();

  const dayStatusMap = useMemo(() => {
    const map: Record<string, CalendarDayStatus> = {};
    for (const d of monthStatus?.days ?? []) map[d.date] = d;
    return map;
  }, [monthStatus]);

  const calMonthAvgCalPct = useMemo(() => {
    const withPct = (monthStatus?.days ?? []).filter((d) => d.caloriesPct != null);
    if (!withPct.length) return null;
    return Math.round(withPct.reduce((s, d) => s + d.caloriesPct!, 0) / withPct.length);
  }, [monthStatus]);

  const calMonthTitle = `${calMonth.getFullYear()} 年 ${calMonth.getMonth() + 1} 月`;

  const targets = workspace.assessment.targets;
  const nutrition = activeLog?.nutrition;
  const macroRows = [
    { label: "热量", actual: nutrition?.calories ?? 0, target: workspace.assessment.targetCalories, unit: "kcal" },
    { label: "蛋白质", actual: nutrition?.protein ?? 0, target: targets.protein, unit: "g" },
    { label: "脂肪", actual: nutrition?.fat ?? 0, target: targets.fat, unit: "g" },
    { label: "碳水", actual: nutrition?.carbs ?? 0, target: targets.carbs, unit: "g" },
    { label: "膳食纤维", actual: nutrition?.fiber ?? 0, target: targets.fiber, unit: "g" },
  ];

  const currentTrendPoints = trendData[trendMetric] ?? [];
  const trendChart = buildTrendPath(currentTrendPoints, 720, 240, 24);
  const latestTrendVal = currentTrendPoints[currentTrendPoints.length - 1];
  const firstTrendVal = currentTrendPoints[0];
  const trendDelta = latestTrendVal && firstTrendVal ? latestTrendVal.value - firstTrendVal.value : null;
  const trendMeta = TREND_METRICS[trendMetric];

  // Scroll to section
  const scrollTo = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  return (
    <div className="app-shell">
      {/* ── Story Nav ── */}
      <nav className="story-nav" aria-label="页面章节导航">
        {(["scene-intake", "scene-metrics", "scene-plans", "scene-tracker"] as const).map((id, i) => {
          const labels = ["评估", "结果", "方案", "执行"];
          return (
            <button
              key={id}
              type="button"
              className={`story-nav-link${activeSection === id ? " active" : ""}`}
              onClick={() => scrollTo(id)}
            >
              <span>0{i + 1}</span>
              <strong>{labels[i]}</strong>
            </button>
          );
        })}
        <div className="story-nav-progress" style={{ "--story-progress": `${scrollProgress}%` } as React.CSSProperties}>
          <div className="story-nav-progress-bar" />
        </div>
      </nav>

      {/* ── Status toast ── */}
      {statusText && (
        <div style={{
          position: "fixed", bottom: 24, right: 24, zIndex: 100,
          padding: "12px 20px", borderRadius: 999,
          background: statusType === "success"
            ? "rgba(28, 80, 65, 0.94)"
            : statusType === "error"
            ? "rgba(170, 32, 48, 0.92)"
            : "rgba(30, 28, 24, 0.86)",
          color: "white",
          backdropFilter: "blur(14px)", fontWeight: 700, fontSize: "0.9rem",
          boxShadow: statusType === "success"
            ? "0 14px 30px rgba(36,92,77,0.24)"
            : statusType === "error"
            ? "0 14px 30px rgba(180,38,55,0.24)"
            : "0 14px 30px rgba(0,0,0,0.2)",
          animation: "softSwitchIn 240ms ease both",
        }}>
          {statusText}
        </div>
      )}

      {/* ── Hero ── */}
      <header className="hero reveal">
        <div className="hero-copy">
          <p className="eyebrow">Diet Intelligence Studio</p>
          <h1>把减脂饮食，从"少吃点"升级成可计算、可追踪、可感知的系统。</h1>
          <p className="hero-text">
            内置主流减脂饮食方案库，结合身体数据和生活习惯生成营养建议，并通过日历与情绪化视觉反馈追踪身体反应。
          </p>
          <div className="hero-badges">
            <span>饮食方案库</span>
            <span>身体指标评估</span>
            <span>日历追踪系统</span>
          </div>
        </div>
        <div className="hero-panel card frosted">
          <p className="panel-label">今日聚焦</p>
          <div className="score-ring" style={{ "--score-fill": `${(metabolicReadiness / 100 * 360).toFixed(1)}deg` } as React.CSSProperties}>
            <div>
              <strong>{metabolicReadiness}</strong>
              <span>代谢准备度</span>
            </div>
          </div>
          <p className="panel-note">
            用体脂率、腰围、活动量与恢复质量，比单看 BMI 更接近真实减脂状态。
          </p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 8 }}>
            <span className="tag is-accent" style={{ fontSize: "0.85rem" }}>
              {workspace.profile.displayName ?? workspace.session.user.email}
            </span>
            <button
              type="button"
              onClick={handleLogout}
              className="ghost-btn"
              style={{ fontSize: "0.85rem", padding: "8px 14px" }}
            >
              退出
            </button>
          </div>
        </div>
      </header>

      <main className="dashboard">
        {/* ── Story Block 1 ── */}
        <section className="story-block reveal">
          <div className="story-copy">
            <p className="section-kicker">Why It Feels Different</p>
            <h2>不是在填一张表，而是在进入一个会理解身体反应的减脂系统。</h2>
            <p className="section-note">
              每一段内容都被重新组织成"理解问题、给出策略、承接执行"的连续叙事，让用户在滚动中自然进入下一步。
            </p>
          </div>
          <div className="story-visual ambient-panel">
            <div className="ambient-glow ambient-glow-a" />
            <div className="ambient-glow ambient-glow-b" />
            <div className="floating-stat">
              <span>代谢准备度</span>
              <strong>{metabolicReadiness}</strong>
            </div>
            <div className="floating-caption">从评估到方案到执行反馈，形成完整闭环。</div>
          </div>
        </section>

        {/* ── Section 1: Assessment ── */}
        <section id="scene-intake" className="section-band stage-band reveal" data-scene="评估">
          <div className="section-intro sticky-intro">
            <div>
              <p className="section-kicker">Step 1</p>
              <h2>身体数据与生活习惯评估</h2>
            </div>
            <p className="section-note">采用 BMR、TDEE、围度估算体脂、生活习惯修正和减脂节奏建议。</p>
          </div>

          <div className="stage-content">
            <div className="card section-card cinematic-panel">
              <div className="scene-glass-banner">
                <span>Body Signal Intake</span>
                <strong>先建立身体画像，再进入策略层。</strong>
              </div>
              <form
                className="grid-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  runMutation("评估重算", "/api/workspace/assessment", {
                    assessmentDate: new Date().toISOString().slice(0, 10),
                    bodyInputs: {
                      weightKg: Number(aForm.weight),
                      waistCm: Number(aForm.waist),
                      ...(Number(aForm.neck) > 0 ? { neckCm: Number(aForm.neck) } : {}),
                      ...(Number(aForm.hip) > 0 ? { hipCm: Number(aForm.hip) } : {}),
                      trainingDaysPerWeek: Number(aForm.trainingDays),
                      bodyInputsPayload: {
                        heightCm: Number(aForm.height),
                        sex: aForm.sex,
                        age: Number(aForm.age),
                        activityMultiplier: Number(aForm.activity),
                        mealRhythm: aForm.mealRhythm,
                        goalPace: Number(aForm.goalPace),
                        stress: aForm.stress,
                        water: Number(aForm.water),
                        sleepHours: Number(aForm.sleepHours),
                      },
                    },
                    note: "dashboard full assessment",
                  });
                }}
              >
                <label>
                  性别
                  <select value={aForm.sex} onChange={(e) => setAForm((c) => ({ ...c, sex: e.target.value }))}>
                    <option value="male">男</option>
                    <option value="female">女</option>
                  </select>
                </label>
                <label>
                  年龄
                  <input type="number" min={16} max={80} value={aForm.age} onChange={(e) => setAForm((c) => ({ ...c, age: e.target.value }))} />
                </label>
                <label>
                  身高（cm）
                  <input type="number" min={120} max={230} value={aForm.height} onChange={(e) => setAForm((c) => ({ ...c, height: e.target.value }))} />
                </label>
                <label>
                  体重（kg）
                  <input type="number" min={35} max={250} step={0.1} value={aForm.weight} onChange={(e) => setAForm((c) => ({ ...c, weight: e.target.value }))} />
                </label>
                <label>
                  腰围（cm）
                  <input type="number" min={45} max={180} step={0.1} value={aForm.waist} onChange={(e) => setAForm((c) => ({ ...c, waist: e.target.value }))} />
                </label>
                <label>
                  颈围（cm）
                  <input type="number" min={20} max={70} step={0.1} value={aForm.neck} onChange={(e) => setAForm((c) => ({ ...c, neck: e.target.value }))} />
                </label>
                <label>
                  臀围（cm，女性必填）
                  <input type="number" min={50} max={180} step={0.1} value={aForm.hip} onChange={(e) => setAForm((c) => ({ ...c, hip: e.target.value }))} />
                </label>
                <label>
                  日常活动
                  <select value={aForm.activity} onChange={(e) => setAForm((c) => ({ ...c, activity: e.target.value }))}>
                    <option value="1.2">久坐</option>
                    <option value="1.375">轻度活动</option>
                    <option value="1.55">中度活动</option>
                    <option value="1.725">高活动</option>
                    <option value="1.9">高强度训练</option>
                  </select>
                </label>
                <label>
                  训练频率（每周）
                  <input type="number" min={0} max={14} value={aForm.trainingDays} onChange={(e) => setAForm((c) => ({ ...c, trainingDays: e.target.value }))} />
                </label>
                <label>
                  睡眠时长（h）
                  <input type="number" min={3} max={12} step={0.1} value={aForm.sleepHours} onChange={(e) => setAForm((c) => ({ ...c, sleepHours: e.target.value }))} />
                </label>
                <label>
                  压力水平
                  <select value={aForm.stress} onChange={(e) => setAForm((c) => ({ ...c, stress: e.target.value }))}>
                    <option value="1">低</option>
                    <option value="2">中</option>
                    <option value="3">高</option>
                  </select>
                </label>
                <label>
                  饮水（L）
                  <input type="number" min={0.5} max={8} step={0.1} value={aForm.water} onChange={(e) => setAForm((c) => ({ ...c, water: e.target.value }))} />
                </label>
                <label>
                  饮食规律性
                  <select value={aForm.mealRhythm} onChange={(e) => setAForm((c) => ({ ...c, mealRhythm: e.target.value }))}>
                    <option value="stable">规律</option>
                    <option value="mixed">一般</option>
                    <option value="chaotic">不规律</option>
                  </select>
                </label>
                <label>
                  减脂节奏
                  <select value={aForm.goalPace} onChange={(e) => setAForm((c) => ({ ...c, goalPace: e.target.value }))}>
                    <option value="0.12">温和</option>
                    <option value="0.18">标准</option>
                    <option value="0.24">积极</option>
                  </select>
                </label>
                <button type="submit" className="primary-btn" disabled={isPending}>
                  {isPending ? "计算中…" : "生成饮食建议"}
                </button>
              </form>
            </div>
          </div>
        </section>

        {/* ── Story Block 2 ── */}
        <section className="story-block story-block-reverse reveal">
          <div className="story-visual story-visual-stack">
            <div className="story-card story-card-primary">
              <p className="section-kicker">Adaptive Logic</p>
              <h3>同一个用户，不同状态下，策略应该真的不同。</h3>
              <p>训练频率、睡眠、压力、饮食规律性会重新塑造推荐方案，而不是只给一个静态答案。</p>
            </div>
            <div className="story-card story-card-secondary">
              <span>睡眠不足</span>
              <span>训练压力高</span>
              <span>碳水时机调整</span>
            </div>
          </div>
          <div className="story-copy">
            <p className="section-kicker">Decision Layer</p>
            <h2>减脂策略不只是"选一种饮食法"，而是要和当下的身体状态发生联系。</h2>
            <p className="section-note">
              所以结果区和方案库现在被拆成两个连续的展示层。先看到身体评估，再进入策略选择，减少信息挤压。
            </p>
          </div>
        </section>

        {/* ── Section 2: Metrics ── */}
        <section id="scene-metrics" className="section-band stage-band reveal" data-scene="结果">
          <div className="section-intro sticky-intro">
            <div>
              <p className="section-kicker">Step 2</p>
              <h2>智能评估结果</h2>
            </div>
            <p className="section-note">把结果区改成横向信息卡片流，阅读更接近产品展陈，而不是数据表格堆叠。</p>
          </div>
          <div className="stage-content">
            <article className="card section-card cinematic-panel">
              <div className="scene-glass-banner">
                <span>Decision Readout</span>
                <strong>把复杂指标折成可读的状态卡片。</strong>
              </div>
              <div className="section-title">
                <div>
                  <p className="section-kicker">Metrics</p>
                  <h2>身体评估与当前策略</h2>
                </div>
              </div>
              <div className="scroll-fade">
              <div className="snap-strip metrics-strip">
                <div className="metric-card">
                  <span>代谢准备度</span>
                  <strong style={{ color: "var(--primary)" }}>{metabolicReadiness}</strong>
                  <p>综合体脂、活动与习惯的核心评分</p>
                </div>
                {resultPayload.estimatedBmr && (
                  <div className="metric-card">
                    <span>基础代谢 BMR</span>
                    <strong>{resultPayload.estimatedBmr}</strong>
                    <p>静息状态下每日最低能量 kcal</p>
                  </div>
                )}
                {resultPayload.estimatedTdee && (
                  <div className="metric-card">
                    <span>修正 TDEE</span>
                    <strong>{resultPayload.estimatedTdee}</strong>
                    <p>含活动量后实际消耗 kcal</p>
                  </div>
                )}
                <div className="metric-card">
                  <span>目标热量</span>
                  <strong style={{ color: "var(--primary)" }}>{workspace.assessment.targetCalories}</strong>
                  <p>每日热量目标 kcal</p>
                </div>
                {resultPayload.estimatedBodyFatPercent != null && (
                  <div className="metric-card">
                    <span>体脂率估算</span>
                    <strong>{(resultPayload.estimatedBodyFatPercent as number).toFixed(1)}%</strong>
                    <p>围度法，供参考</p>
                  </div>
                )}
                <div className="metric-card">
                  <span>宏量目标</span>
                  <strong style={{ fontSize: "1.1rem" }}>蛋{targets.protein} / 脂{targets.fat} / 碳{targets.carbs}</strong>
                  <p>蛋白 / 脂肪 / 碳水 (g)</p>
                </div>
              </div>
              </div>
              <div className="recommendation-card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", flexWrap: "wrap", gap: 12, marginBottom: 10 }}>
                  <div>
                    <p className="eyebrow" style={{ color: "rgba(255,255,255,0.7)", marginBottom: 6 }}>推荐方案</p>
                    <strong style={{ fontSize: "1.25rem", color: "white" }}>{workspace.assessment.recommendedPlan.name}</strong>
                  </div>
                  <span className="tag" style={{ background: "rgba(255,255,255,0.18)", color: "white", border: "1px solid rgba(255,255,255,0.24)" }}>
                    执行评分 {workspace.assessment.recommendedPlan.executionScore}/100
                  </span>
                </div>
                <p>{workspace.assessment.recommendedPlan.summary}</p>
                <div style={{ marginTop: 12, height: 6, background: "rgba(255,255,255,0.18)", borderRadius: 999, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${workspace.assessment.recommendedPlan.executionScore}%`, background: "rgba(255,255,255,0.72)", borderRadius: 999 }} />
                </div>
              </div>
            </article>
          </div>
        </section>

        {/* ── Section 3: Plans ── */}
        <section id="scene-plans" className="section-band stage-band reveal" data-scene="方案">
          <div className="section-intro sticky-intro">
            <div>
              <p className="section-kicker">Step 3</p>
              <h2>主流减脂饮食方案库</h2>
            </div>
            <p className="section-note">选中某个方案后，它会接管营养分配、执行重点与后续追踪逻辑。</p>
          </div>
          <div className="stage-content">
            <article className="card section-card cinematic-panel">
              <div className="scene-glass-banner">
                <span>Protocol Gallery</span>
                <strong>选中的策略会真正接管后续营养和追踪逻辑。</strong>
              </div>
              <div className="section-title">
                <div>
                  <p className="section-kicker">Plans</p>
                  <h2>主流减脂饮食方案库</h2>
                </div>
                <p className="section-note">选中某个方案后，它会正式接管营养分配、执行重点与后续追踪逻辑。</p>
              </div>
              <div className="plan-showcase">
                {/* Active plan panel */}
                <div className={`active-plan-panel plan-showcase-panel${activePlanId !== recommendedPlanId ? " is-previewing" : ""}`}>
                  <div className="active-plan-shell">
                    <div className="active-plan-eyebrow">
                      <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--primary)", display: "inline-block" }} />
                      {activePlanId === recommendedPlanId ? "系统推荐" : "已选方案"}
                    </div>
                    <div className="active-plan-header">
                      <div className="diet-card-heading">
                        <h3 style={{ margin: "0 0 6px" }}>{activePlan.name}</h3>
                        <p>{activePlan.summary}</p>
                      </div>
                      <div className="active-plan-state">
                        {activePlanId === recommendedPlanId && (
                          <span className="recommendation-badge">推荐</span>
                        )}
                      </div>
                    </div>
                    <div className="active-plan-compare">
                      <div className="active-plan-track">
                        <span>进餐节律</span>
                        <strong>{activePlan.mealRhythm}</strong>
                      </div>
                      <div className="active-plan-track">
                        <span>碳水水平</span>
                        <strong>{activePlan.carbLevel}</strong>
                      </div>
                    </div>
                    <div className="active-plan-grid">
                      {activePlan.focus.map((f, i) => (
                        <div key={i} className="active-plan-metric" style={{ "--enter-index": i } as React.CSSProperties}>
                          <strong>{f}</strong>
                        </div>
                      ))}
                    </div>
                    <div style={{ marginTop: 16, display: "grid", gap: 8 }}>
                      <p className="section-kicker" style={{ marginBottom: 6 }}>追踪信号</p>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                        {activePlan.trackingSignals.map((s, i) => (
                          <span key={i} className="tag is-accent" style={{ fontSize: "0.82rem" }}>{s}</span>
                        ))}
                      </div>
                    </div>
                    <div className="active-plan-actions">
                      {activePlanId !== recommendedPlanId && (
                        <button
                          type="button"
                          className="mini-btn is-prominent"
                          onClick={() => setActivePlanId(activePlanId)}
                        >
                          启用此方案
                        </button>
                      )}
                      <button
                        type="button"
                        className="mini-btn"
                        onClick={() => setActivePlanId(recommendedPlanId)}
                      >
                        回到推荐方案
                      </button>
                    </div>
                  </div>
                </div>

                {/* Diet card library */}
                <div className="plan-showcase-rail">
                  {dietPlans.map((plan, index) => {
                    const isFeatured = plan.id === recommendedPlanId;
                    const isActive = plan.id === activePlanId;
                    const isExpanded = plan.id === expandedPlanId;
                    return (
                      <div
                        key={plan.id}
                        className={`diet-card card${isFeatured ? " is-featured" : ""}${isActive ? " is-active" : ""}${!isExpanded ? " is-collapsed" : ""}`}
                        style={{ "--enter-index": index } as React.CSSProperties}
                        onClick={() => {
                          setExpandedPlanId(isExpanded ? "" : plan.id);
                          setActivePlanId(plan.id);
                        }}
                      >
                        <div className="diet-card-top">
                          <div className="diet-card-heading">
                            <div className="diet-meta">
                              <span>{plan.carbLevel}碳</span>
                              {plan.tags.slice(0, 2).map((t, i) => <span key={i}>{t}</span>)}
                            </div>
                            <h3>{plan.name}</h3>
                            <p>{plan.summary}</p>
                          </div>
                          <div className="diet-card-status">
                            <span className="diet-order">0{index + 1}</span>
                            {isFeatured && <span className="recommendation-badge">推荐</span>}
                          </div>
                        </div>

                        <div className="diet-card-compact-actions">
                          <div className="diet-card-compact-summary">
                            <span>{plan.mealRhythm}</span>
                            <span>{plan.tags.join(" · ")}</span>
                          </div>
                          <button
                            type="button"
                            className="mini-btn"
                            onClick={(e) => { e.stopPropagation(); setExpandedPlanId(plan.id); }}
                          >
                            展开详情
                          </button>
                        </div>

                        <div className="diet-card-body">
                          <div style={{ display: "grid", gap: 8 }}>
                            <p className="section-kicker" style={{ marginBottom: 4 }}>执行重点</p>
                            {plan.focus.map((f, i) => (
                              <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                                <span style={{ color: "var(--primary)", fontWeight: 800, marginTop: 2 }}>·</span>
                                <span style={{ color: "var(--muted)" }}>{f}</span>
                              </div>
                            ))}
                          </div>
                          <div className="diet-runtime">
                            <div className="diet-runtime-item">
                              <strong>饱腹感</strong>
                              <ScoreBar value={plan.satiety} color="var(--primary)" />
                            </div>
                            <div className="diet-runtime-item">
                              <strong>依从性</strong>
                              <ScoreBar value={plan.adherence} color="var(--secondary)" />
                            </div>
                            <div className="diet-runtime-item">
                              <strong>训练适配</strong>
                              <ScoreBar value={plan.trainingFit} color="var(--highlight)" />
                            </div>
                            <div className="diet-runtime-item">
                              <strong>进餐节律</strong>
                              <span style={{ fontSize: "0.85rem", color: "var(--muted)" }}>{plan.mealRhythm}</span>
                            </div>
                          </div>
                          <div style={{ background: "rgba(255,255,255,0.62)", borderRadius: 16, padding: "14px 16px", display: "grid", gap: 10 }}>
                            <p className="section-kicker" style={{ marginBottom: 2 }}>身体信号响应逻辑</p>
                            <p style={{ margin: 0, color: "var(--muted)", fontSize: "0.88rem" }}>
                              <strong style={{ color: "var(--text)" }}>能量低：</strong>{plan.responseLogic.lowEnergy}
                            </p>
                            <p style={{ margin: 0, color: "var(--muted)", fontSize: "0.88rem" }}>
                              <strong style={{ color: "var(--text)" }}>饥饿感高：</strong>{plan.responseLogic.highHunger}
                            </p>
                          </div>
                          <div className="diet-footer">
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                              {plan.trackingSignals.map((s, i) => (
                                <span key={i} className="tag is-accent" style={{ fontSize: "0.8rem" }}>{s}</span>
                              ))}
                            </div>
                            <button
                              type="button"
                              className={`mini-btn${isActive ? " is-active" : " is-prominent"}`}
                              onClick={(e) => { e.stopPropagation(); setActivePlanId(plan.id); }}
                            >
                              {isActive ? "当前方案" : "选择此方案"}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </article>
          </div>
        </section>

        {/* ── Story Block 3 ── */}
        <section className="story-block reveal">
          <div className="story-copy">
            <p className="section-kicker">Execution Layer</p>
            <h2>执行阶段更像一条轨道，而不是一个杂乱的后台页面。</h2>
            <p className="section-note">
              日历被固定成主要视觉锚点，记录、食物、建议餐单和洞察通过横向面板承接。
            </p>
          </div>
          <div className="story-visual story-timeline">
            <div className="timeline-line" />
            {[
              { title: "评估", desc: "理解身体状态" },
              { title: "选方案", desc: "启动饮食协议" },
              { title: "记饮食", desc: "记录热量与营养" },
              { title: "看反馈", desc: "持续微调执行" },
            ].map((item, i) => (
              <div key={i} className="timeline-node">
                <strong>{item.title}</strong>
                <span>{item.desc}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── Section 4: Tracker ── */}
        <section id="scene-tracker" className="section-band stage-band reveal" data-scene="执行">
          <div className="section-intro sticky-intro">
            <div>
              <p className="section-kicker">Step 4</p>
              <h2>身体反馈与饮食执行轨道</h2>
            </div>
            <p className="section-note">分层卡片轨道：先看日历，再横向浏览食物、餐单和追踪洞察。</p>
          </div>

          <div className="stage-content">
            <article className="card section-card cinematic-panel tracker-card">
              <div className="scene-glass-banner">
                <span>Execution Track</span>
                <strong>把记录、热量和反馈并成一条连续轨道。</strong>
              </div>
              <div className="tracker-stage">
                {/* Calendar */}
                <div className="calendar-panel">
                  <div className="calendar-toolbar">
                    <button
                      type="button"
                      className="ghost-btn"
                      onClick={() => setCalMonth(new Date(calMonth.getFullYear(), calMonth.getMonth() - 1, 1))}
                    >
                      ←
                    </button>
                    <div className="calendar-title-block">
                      <h3>{calMonthTitle}</h3>
                    </div>
                    <button
                      type="button"
                      className="ghost-btn"
                      onClick={() => setCalMonth(new Date(calMonth.getFullYear(), calMonth.getMonth() + 1, 1))}
                    >
                      →
                    </button>
                  </div>

                  {/* Month stats row */}
                  <div className="calendar-stats-row">
                    {(monthStatus?.currentStreak ?? 0) > 0 && (
                      <span className="cal-stat-badge cal-stat-streak">
                        🔥 连续 {monthStatus!.currentStreak} 天
                      </span>
                    )}
                    {monthStatus && (
                      <span className="cal-stat-badge">
                        {monthStatus.loggedDays} / {daysInCalMonth} 天打卡
                      </span>
                    )}
                    {calMonthAvgCalPct != null && (
                      <span className="cal-stat-badge">
                        均 {calMonthAvgCalPct}% 热量达标
                      </span>
                    )}
                  </div>

                  <div className="weekday-row">
                    {["一", "二", "三", "四", "五", "六", "日"].map((d) => (
                      <span key={d}>{d}</span>
                    ))}
                  </div>
                  <div className="calendar-grid">
                    {calendarDays.map((day, idx) => {
                      if (day === null) return <div key={`e${idx}`} className="day-cell is-empty" />;
                      const dateStr = `${calMonth.getFullYear()}-${String(calMonth.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                      const isToday2 = dateStr === todayStr();
                      const isSelected = dateStr === viewDate;
                      const st = dayStatusMap[dateStr];
                      const hasBoth = st?.hasWeight && st.foodCount > 0;
                      const isOver = st?.caloriesPct != null && st.caloriesPct > 110;
                      const heatClass = hasBoth
                        ? " dc-full"
                        : st?.hasWeight
                        ? " dc-weight"
                        : st && st.foodCount > 0
                        ? " dc-food"
                        : "";
                      return (
                        <div
                          key={day}
                          className={`day-cell${isToday2 ? " is-today" : ""}${isSelected ? " is-selected" : ""}${heatClass}${isOver ? " dc-over" : ""}`}
                          onClick={() => void navigateDate(dateStr)}
                        >
                          <span className="day-num" style={{ fontWeight: isToday2 ? 800 : 600 }}>{day}</span>
                          {st && (st.hasWeight || st.foodCount > 0) && (
                            <div className="day-cell-bottom">
                              <div className="day-indicators">
                                {st.hasWeight && <div className="day-dot day-dot--weight" title="已记录体重" />}
                                {st.foodCount > 0 && <div className="day-dot day-dot--food" title={`${st.foodCount} 条食物`} />}
                              </div>
                              {st.caloriesPct != null && (
                                <div className="day-calorie-bar">
                                  <div
                                    className={`day-calorie-bar-fill${isOver ? " over" : ""}`}
                                    style={{ width: `${Math.min(100, st.caloriesPct)}%` }}
                                  />
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Trend panel */}
                <section className="trend-panel">
                  <div className="trend-panel-header">
                    <div>
                      <p className="section-kicker">Tracking Curve</p>
                      <h3>身体数据变化追踪</h3>
                    </div>
                    <div className="trend-metric-tabs">
                      {(Object.keys(TREND_METRICS) as TrendMetricKey[]).map((key, i) => (
                        <button
                          key={key}
                          type="button"
                          className={`trend-metric-tab${trendMetric === key ? " is-active" : ""}`}
                          style={{ "--enter-index": i } as React.CSSProperties}
                          onClick={() => setTrendMetric(key)}
                        >
                          {TREND_METRICS[key].label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="trend-panel-body">
                    <div className="trend-chart-shell">
                      <div className="trend-primary-stat">
                        <p className="trend-kicker">当前查看</p>
                        <strong>{trendMeta.label}</strong>
                        <div className="trend-primary-value">
                          {latestTrendVal ? `${latestTrendVal.value.toFixed(1)}${trendMeta.unit}` : "--"}
                        </div>
                        <p className="trend-primary-note">
                          {latestTrendVal
                            ? `${latestTrendVal.date} · ${trendDelta !== null
                                ? trendDelta > 0
                                  ? `较起点 +${Math.abs(trendDelta).toFixed(1)}${trendMeta.unit}`
                                  : `较起点 -${Math.abs(trendDelta).toFixed(1)}${trendMeta.unit}`
                                : "暂无变化"}`
                            : "先在日志中记录数据，这里会生成趋势曲线。"}
                        </p>
                        <span className="trend-primary-caption" style={{ fontSize: "0.84rem", color: "var(--muted)" }}>
                          {trendMeta.description}
                        </span>
                      </div>
                      <div className="trend-chart-card">
                        {currentTrendPoints.length === 0 ? (
                          <div className="trend-empty-state">
                            <strong>还没有形成曲线</strong>
                            <p>先在日志里记录体重、腰围或主观状态，我们会把它们连成可视化变化趋势。</p>
                          </div>
                        ) : (
                          <div className="trend-chart-frame">
                            <div className="trend-plot">
                              <svg className="trend-svg" viewBox="0 0 720 240" role="img" aria-label={`${trendMeta.label}趋势图`}>
                                <defs>
                                  <linearGradient id="trendGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                                    <stop offset="0%" stopColor={trendMeta.color} stopOpacity={0.24} />
                                    <stop offset="100%" stopColor={trendMeta.color} stopOpacity={0.02} />
                                  </linearGradient>
                                </defs>
                                <path className="trend-area" d={trendChart.area} fill="url(#trendGrad)" />
                                <path className="trend-line" d={trendChart.line} stroke={trendMeta.color} />
                              </svg>
                              <div className="trend-grid-lines">
                                <span /><span /><span />
                              </div>
                            </div>
                            <div className="trend-axis">
                              {trendChart.plotted.map((p) => (
                                <span key={p.date} className="trend-axis-label" style={{ left: `${(p.x / 720) * 100}%` }}>
                                  {p.date.slice(5)}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="trend-mini-cards">
                      {(Object.keys(TREND_METRICS) as TrendMetricKey[]).map((key, i) => {
                        const pts = trendData[key] ?? [];
                        const last = pts[pts.length - 1];
                        const first2 = pts[0];
                        const delta2 = last && first2 ? last.value - first2.value : null;
                        const m = TREND_METRICS[key];
                        return (
                          <button
                            key={key}
                            type="button"
                            className={`trend-mini-card${trendMetric === key ? " is-active" : ""}`}
                            style={{ "--enter-index": i } as React.CSSProperties}
                            onClick={() => setTrendMetric(key)}
                          >
                            <span className="trend-mini-label">{m.label}</span>
                            <strong>{last ? `${last.value.toFixed(1)}${m.unit}` : "--"}</strong>
                            <span className="trend-mini-delta">
                              {last && delta2 !== null
                                ? delta2 > 0
                                  ? `较起点 +${Math.abs(delta2).toFixed(1)}${m.unit}`
                                  : delta2 < 0
                                    ? `较起点 -${Math.abs(delta2).toFixed(1)}${m.unit}`
                                    : "基本持平"
                                : "暂无记录"}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </section>

                {/* Workflow snap-strip */}
                <div className="scroll-fade">
                <div className="snap-strip workflow-strip">
                  {/* Daily log form */}
                  <form
                    className="log-form snap-panel"
                    onSubmit={(e) => {
                      e.preventDefault();
                      runMutation("追踪更新", "/api/workspace/daily-log", {
                        logDate: workspace.dailyLog.logDate,
                        input: {
                          assessmentId: workspace.assessment.id,
                          activePlanCode: workspace.assessment.recommendedPlan.code,
                          activePlanVersion: workspace.assessment.recommendedPlan.version,
                          energyScore: trackForm.energy,
                          adherenceScore: trackForm.adherence,
                          bodyMetrics: {
                            weightKg: trackForm.weight ? Number(trackForm.weight) : undefined,
                            waistCm: trackForm.waist ? Number(trackForm.waist) : undefined,
                            hydrationMl: trackForm.hydration ? Number(trackForm.hydration) : undefined,
                          },
                          note: trackForm.note || undefined,
                        },
                      });
                    }}
                  >
                    <h3>{isToday ? "记录今日反馈" : viewDate}</h3>

                    {logLoading ? (
                      <p className="muted" style={{ color: "var(--muted)" }}>加载中…</p>
                    ) : !isToday && !viewLog ? (
                      <p style={{ color: "var(--muted)" }}>{viewDate} 暂无记录。</p>
                    ) : (
                      <>
                        {!isToday && (
                          <>
                            <div className="metric-card">
                              <span>体重</span>
                              <strong>{viewLog?.bodyMetrics?.weightKg ?? "--"} kg</strong>
                            </div>
                            <div className="metric-card">
                              <span>腰围</span>
                              <strong>{viewLog?.bodyMetrics?.waistCm ?? "--"} cm</strong>
                            </div>
                          </>
                        )}
                        {isToday && (
                          <>
                            <label>
                              日期
                              <input type="date" value={workspace.dailyLog.logDate} readOnly style={{ background: "rgba(255,255,255,0.6)" }} />
                            </label>
                            <label>
                              体重（kg）
                              <input
                                type="number" step={0.1} placeholder="例：70.5"
                                value={trackForm.weight}
                                onChange={(e) => setTrackForm((c) => ({ ...c, weight: e.target.value }))}
                              />
                            </label>
                            <label>
                              腰围（cm）
                              <input
                                type="number" step={0.1} placeholder="例：82"
                                value={trackForm.waist}
                                onChange={(e) => setTrackForm((c) => ({ ...c, waist: e.target.value }))}
                              />
                            </label>
                            <div className="score-field">
                              <span className="score-field-label">今日能量</span>
                              <div className="emoji-selector">
                                {([
                                  { val: 1, emoji: "😴", label: "很疲惫" },
                                  { val: 2, emoji: "😔", label: "疲惫" },
                                  { val: 3, emoji: "😊", label: "一般" },
                                  { val: 4, emoji: "💪", label: "不错" },
                                  { val: 5, emoji: "🔥", label: "满血" },
                                ] as { val: number; emoji: string; label: string }[]).map(({ val, emoji, label }) => (
                                  <button
                                    key={val}
                                    type="button"
                                    className={`emoji-btn${trackForm.energy === val ? " active" : ""}`}
                                    onClick={() => setTrackForm((c) => ({ ...c, energy: val }))}
                                    title={label}
                                  >
                                    <span className="emoji-btn-icon">{emoji}</span>
                                    <span className="emoji-btn-label">{label}</span>
                                  </button>
                                ))}
                              </div>
                            </div>
                            <div className="score-field">
                              <span className="score-field-label">饮食执行</span>
                              <div className="adherence-selector">
                                {([
                                  { val: 1, icon: "❌", label: "没坚持" },
                                  { val: 3, icon: "🌗", label: "部分完成" },
                                  { val: 5, icon: "✅", label: "完全执行" },
                                ] as { val: number; icon: string; label: string }[]).map(({ val, icon, label }) => (
                                  <button
                                    key={val}
                                    type="button"
                                    className={`adherence-btn${trackForm.adherence === val ? " active" : ""}`}
                                    onClick={() => setTrackForm((c) => ({ ...c, adherence: val }))}
                                  >
                                    {icon} {label}
                                  </button>
                                ))}
                              </div>
                            </div>
                            <label>
                              备注
                              <textarea
                                rows={3} placeholder="比如：晚餐外食、训练腿部、睡眠不足"
                                value={trackForm.note}
                                onChange={(e) => setTrackForm((c) => ({ ...c, note: e.target.value }))}
                              />
                            </label>
                            <button type="submit" className="primary-btn" disabled={isPending}>
                              {isPending ? "保存中…" : "保存当日记录"}
                            </button>
                          </>
                        )}
                      </>
                    )}

                    {/* Date navigation */}
                    <div style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: "center", marginTop: 8 }}>
                      <button
                        type="button" className="ghost-btn" style={{ padding: "6px 12px" }}
                        onClick={() => {
                          const d = new Date(viewDate);
                          d.setDate(d.getDate() - 1);
                          void navigateDate(d.toISOString().slice(0, 10));
                        }}
                      >←</button>
                      <span style={{ fontWeight: 700, fontSize: "0.88rem", minWidth: 80, textAlign: "center" }}>
                        {isToday ? "今天" : viewDate}
                      </span>
                      <button
                        type="button" className="ghost-btn" style={{ padding: "6px 12px" }}
                        disabled={isToday}
                        onClick={() => {
                          const d = new Date(viewDate);
                          d.setDate(d.getDate() + 1);
                          void navigateDate(d.toISOString().slice(0, 10));
                        }}
                      >→</button>
                    </div>
                  </form>

                  {/* Nutrition preview panel */}
                  <section className="nutrition-panel snap-panel nutrition-preview-panel">
                    <div className="section-title">
                      <div>
                        <p className="section-kicker">Step 5</p>
                        <h3>食物营养与热量计算</h3>
                      </div>
                      <p className="section-note">把高密度饮食记录拆成独立工作台，主页面只保留当天摘要和入口。</p>
                    </div>

                    <div className="nutrition-context-bar">
                      <div>
                        <span className="nutrition-context-label">当前记录日期</span>
                        <strong>{isToday ? "今天" : viewDate}</strong>
                      </div>
                      <div>
                        <span className="nutrition-context-label">当前执行方案</span>
                        <strong>{activePlan.name}</strong>
                      </div>
                      <div>
                        <span className="nutrition-context-label">当日状态</span>
                        <strong>{activeLog?.nutrition?.calories ? `已摄入 ${activeLog.nutrition.calories} kcal` : "未开始记录"}</strong>
                      </div>
                    </div>

                    <div className="nutrition-preview-stats">
                      <div className="nutrition-preview-card">
                        <span className="nutrition-context-label">热量</span>
                        <strong>{activeLog?.nutrition?.calories ?? 0}</strong>
                        <span style={{ color: "var(--muted)", fontSize: "0.82rem" }}>/ {workspace.assessment.targetCalories} kcal</span>
                      </div>
                      <div className="nutrition-preview-card">
                        <span className="nutrition-context-label">蛋白质</span>
                        <strong>{activeLog?.nutrition?.protein ?? 0}g</strong>
                        <span style={{ color: "var(--muted)", fontSize: "0.82rem" }}>/ {targets.protein}g</span>
                      </div>
                      <div className="nutrition-preview-card">
                        <span className="nutrition-context-label">营养评分</span>
                        <strong>{activeLog?.nutrition?.nutritionScore ?? "--"}</strong>
                        <span style={{ color: "var(--muted)", fontSize: "0.82rem" }}>/ 100</span>
                      </div>
                    </div>

                    <div style={{ display: "grid", gap: 10 }}>
                      {macroRows.map((row) => (
                        <NutritionProgressBar key={row.label} {...row} />
                      ))}
                    </div>

                    <div className="nutrition-preview-actions">
                      <button
                        type="button"
                        className="primary-btn"
                        onClick={() => setWorkspaceOpen(true)}
                      >
                        打开饮食记录页
                      </button>
                      <span className="ghost-note">在独立页面里录入食物和管理当日饮食。</span>
                    </div>
                  </section>

                  {/* Insights panel */}
                  <div className="insights-panel snap-panel">
                    <h3>追踪洞察</h3>
                    <div className="snap-strip compact-strip" style={{ gridAutoFlow: "row", gridAutoColumns: "1fr", overflow: "visible" }}>
                      {activeLog?.analysis?.gapRecommendations?.length ? (
                        activeLog.analysis.gapRecommendations.map((item) => (
                          <div key={item.foodId} className="insight-chip metric-card" style={{ minHeight: "auto" }}>
                            <strong style={{ fontSize: "1rem" }}>{item.foodName}</strong>
                            <span>{item.amountText}</span>
                            <span>{item.reasons.join(" / ")}</span>
                          </div>
                        ))
                      ) : (
                        <>
                          <div className="insight-chip metric-card" style={{ minHeight: "auto" }}>
                            <strong style={{ fontSize: "0.95rem" }}>优先蛋白达标</strong>
                            <p style={{ fontSize: "0.84rem" }}>每餐保证 {Math.round(targets.protein / 3)}g+ 蛋白质，鸡胸肉、豆腐、蛋白是好选择。</p>
                          </div>
                          <div className="insight-chip metric-card" style={{ minHeight: "auto" }}>
                            <strong style={{ fontSize: "0.95rem" }}>膳食纤维支撑饱腹</strong>
                            <p style={{ fontSize: "0.84rem" }}>每天至少 {targets.fiber}g 纤维，蔬菜和燕麦是高效来源。</p>
                          </div>
                          <div className="insight-chip metric-card" style={{ minHeight: "auto" }}>
                            <strong style={{ fontSize: "0.95rem" }}>{activePlan.name} 信号追踪</strong>
                            <p style={{ fontSize: "0.84rem" }}>{activePlan.trackingSignals.slice(0, 3).join("、")}是本方案的关键观察点。</p>
                          </div>
                        </>
                      )}
                      {activeLog?.analysis?.overLimitWarnings?.map((w, i) => (
                        <div key={i} style={{
                          padding: "12px 14px", borderRadius: 18,
                          background: "rgba(227,93,106,0.1)", color: "var(--danger)",
                          fontWeight: 700, fontSize: "0.88rem",
                        }}>
                          {w}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                </div>
              </div>
            </article>
          </div>
        </section>
      </main>

      {/* ── Nutrition Workspace Modal ── */}
      <div className={`workspace-overlay${workspaceOpen ? " is-open" : ""}`} aria-hidden={!workspaceOpen}>
        <div className="workspace-backdrop" onClick={() => setWorkspaceOpen(false)} />
        <section className="workspace-sheet">
          <div className="workspace-shell">
            <header className="workspace-header">
              <div>
                <p className="section-kicker">Nutrition Workspace</p>
                <h2>饮食记录工作台</h2>
                <p className="section-note">围绕当前日期进行食物录入和营养对比。</p>
              </div>
              <button
                type="button"
                className="ghost-btn"
                onClick={() => setWorkspaceOpen(false)}
              >
                返回主页面
              </button>
            </header>

            <div className="nutrition-context-bar workspace-context">
              <div>
                <span className="nutrition-context-label">当前记录日期</span>
                <strong>{isToday ? "今天" : viewDate}</strong>
              </div>
              <div>
                <span className="nutrition-context-label">当前执行方案</span>
                <strong>{activePlan.name}</strong>
              </div>
              <div>
                <span className="nutrition-context-label">当日状态</span>
                <strong>{activeLog?.nutrition?.calories ? `已摄入 ${activeLog.nutrition.calories} kcal` : "未开始记录"}</strong>
              </div>
            </div>

            <div className="workspace-grid">
              {/* Entry panel */}
              <section className="workspace-panel workspace-panel-wide">
                <div className="workspace-panel-header">
                  <div>
                    <p className="section-kicker">Entry</p>
                    <h3>添加食物</h3>
                  </div>
                </div>
                <form
                  className="food-entry-form"
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!selectedFood) return;
                    runMutation(
                      "食物记录",
                      "/api/workspace/food-entry",
                      {
                        logDate: workspace.dailyLog.logDate,
                        input: {
                          foodId: selectedFood.id,
                          mealSlot,
                          unitKey: foodUnit,
                          amount: Number(foodAmount),
                        },
                      },
                      { onSuccess: () => setWorkspaceOpen(false) }
                    );
                  }}
                >
                  <div className="food-search-composer">
                    <label className="food-search-field">
                      食物搜索
                      <input
                        type="search"
                        placeholder="搜索鸡蛋、米饭、酸奶、咖啡…"
                        value={foodQuery}
                        onChange={(e) => setFoodQuery(e.target.value)}
                      />
                    </label>
                    <div className="food-category-chips">
                      {foodCategories.map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          className={`food-category-chip${foodCategory === cat ? " is-active" : ""}`}
                          onClick={() => setFoodCategory(cat)}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                    <label className="meal-select-inline">
                      餐次
                      <select value={mealSlot} onChange={(e) => setMealSlot(e.target.value)}>
                        <option value="breakfast">早餐</option>
                        <option value="lunch">午餐</option>
                        <option value="dinner">晚餐</option>
                        <option value="snack">加餐</option>
                      </select>
                    </label>
                  </div>

                  <div className="food-quick-picks">
                    {filteredFoods.length === 0 ? (
                      <div className="food-empty-state">
                        <p style={{ margin: 0, color: "var(--muted)" }}>未找到匹配的食物</p>
                      </div>
                    ) : (
                      filteredFoods.map((food, i) => (
                        <button
                          key={food.id}
                          type="button"
                          className={`food-quick-card${selectedFoodId === food.id ? " is-selected" : ""}`}
                          style={{ "--enter-index": i } as React.CSSProperties}
                          onClick={() => setSelectedFoodId(food.id)}
                        >
                          <div className="food-quick-card-top">
                            <span className="food-quick-card-name">{food.name}</span>
                            <span className="food-quick-card-category">{food.category}</span>
                          </div>
                          <div className="food-quick-card-meta">
                            <span>{food.nutritionPer100.calories} kcal / 100{food.measureBase}</span>
                            <span>蛋{food.nutritionPer100.protein}g · 脂{food.nutritionPer100.fat}g · 碳{food.nutritionPer100.carbs}g</span>
                          </div>
                        </button>
                      ))
                    )}
                  </div>

                  <label className="amount-field">
                    份量
                    <input
                      type="number" min={0.1} max={1500} step={0.1}
                      value={foodAmount}
                      onChange={(e) => setFoodAmount(e.target.value)}
                    />
                  </label>

                  <label className="unit-picker-field">
                    单位
                    <div className="unit-option-chips">
                      {(selectedFood?.unitOptions ?? []).map((u) => (
                        <button
                          key={u.key}
                          type="button"
                          className={`unit-option-chip${foodUnit === u.key ? " is-active" : ""}`}
                          onClick={() => setFoodUnit(u.key)}
                        >
                          {u.label}
                        </button>
                      ))}
                    </div>
                  </label>

                  {selectedFood && (() => {
                    const unit = selectedFood.unitOptions.find((u) => u.key === foodUnit);
                    const baseGrams = unit ? unit.metricAmount * Number(foodAmount) : Number(foodAmount);
                    const scale = baseGrams / 100;
                    const n = selectedFood.nutritionPer100;
                    const cal = Math.round(n.calories * scale);
                    const pro = (n.protein * scale).toFixed(1);
                    const fat = (n.fat * scale).toFixed(1);
                    const carb = (n.carbs * scale).toFixed(1);
                    return (
                      <div className="food-entry-preview">
                        <span className="food-entry-preview-name">{selectedFood.name} · {baseGrams}{selectedFood.measureBase}</span>
                        <span className="food-entry-preview-kcal">{cal} kcal</span>
                        <span>蛋白 {pro}g</span>
                        <span>脂肪 {fat}g</span>
                        <span>碳水 {carb}g</span>
                      </div>
                    );
                  })()}

                  <button
                    type="submit"
                    className="entry-submit-btn"
                    disabled={isPending || !selectedFood}
                  >
                    {isPending ? "记录中…" : "添加到当日记录"}
                  </button>
                </form>
              </section>

              {/* Nutrition summary */}
              <section className="workspace-panel">
                <div className="workspace-panel-header">
                  <div>
                    <p className="section-kicker">Summary</p>
                    <h3>营养汇总</h3>
                  </div>
                </div>
                <div className="nutrition-summary workspace-grid-cards">
                  {[
                    { label: "热量", value: activeLog?.nutrition?.calories ?? 0, target: workspace.assessment.targetCalories, unit: "kcal" },
                    { label: "蛋白质", value: activeLog?.nutrition?.protein ?? 0, target: targets.protein, unit: "g" },
                    { label: "脂肪", value: activeLog?.nutrition?.fat ?? 0, target: targets.fat, unit: "g" },
                    { label: "碳水", value: activeLog?.nutrition?.carbs ?? 0, target: targets.carbs, unit: "g" },
                    { label: "膳食纤维", value: activeLog?.nutrition?.fiber ?? 0, target: targets.fiber, unit: "g" },
                  ].map((item, i) => {
                    const pct = item.target > 0 ? Math.min(100, Math.round((item.value / item.target) * 100)) : 0;
                    return (
                      <div key={item.label} className="nutrition-card" style={{ "--enter-index": i } as React.CSSProperties}>
                        <span style={{ color: "var(--muted)", fontSize: "0.82rem", fontWeight: 700 }}>{item.label}</span>
                        <strong>{item.value}</strong>
                        <span style={{ color: "var(--muted)", fontSize: "0.82rem" }}>/ {item.target} {item.unit}</span>
                        <div className="nutrition-progress">
                          <span style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
                {activeLog?.analysis?.overLimitWarnings?.length ? (
                  <div style={{ display: "grid", gap: 8 }}>
                    {activeLog.analysis.overLimitWarnings.map((w, i) => (
                      <div key={i} style={{ padding: "10px 14px", borderRadius: 14, background: "rgba(227,93,106,0.1)", color: "var(--danger)", fontWeight: 700, fontSize: "0.88rem" }}>
                        {w}
                      </div>
                    ))}
                  </div>
                ) : null}
              </section>

              {/* Food list */}
              <section className="workspace-panel">
                <div className="workspace-panel-header">
                  <div>
                    <p className="section-kicker">Food Log</p>
                    <h3>当日食物记录</h3>
                  </div>
                </div>
                <div className="workspace-stack">
                  {(activeLog?.foods ?? []).length === 0 ? (
                    <div className="food-empty-state">
                      <p style={{ margin: 0, color: "var(--muted)" }}>今天还没有记录食物，点击上方「添加食物」开始记录。</p>
                    </div>
                  ) : (
                    (activeLog?.foods ?? []).map((item) => (
                      <div key={item.id} className="food-row">
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <strong style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.foodName}</strong>
                          <p className="food-row-meta">{MEAL_SLOT_LABELS[item.mealSlot ?? ""] ?? item.mealSlot ?? ""}</p>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <strong style={{ display: "block" }}>{item.amount}{item.unitKey}</strong>
                          <p className="food-row-meta">{item.calories} kcal</p>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <span style={{ color: "var(--muted)", fontSize: "0.82rem" }}>蛋白</span>
                          <strong style={{ display: "block" }}>{(item as { protein?: number }).protein ?? "--"}g</strong>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <span style={{ color: "var(--muted)", fontSize: "0.82rem" }}>碳水</span>
                          <strong style={{ display: "block" }}>{(item as { carbs?: number }).carbs ?? "--"}g</strong>
                        </div>
                        <button
                          type="button"
                          className="food-row-delete"
                          title="删除此记录"
                          disabled={isPending}
                          onClick={() => runMutation(
                            "删除食物",
                            "/api/workspace/food-entry",
                            { logDate: activeLog?.logDate ?? workspace.dailyLog.logDate, entryId: item.id },
                            { method: "DELETE" }
                          )}
                        >
                          ×
                        </button>
                      </div>
                    ))
                  )}
                  {activeLog?.analysis?.gapRecommendations?.length ? (
                    <div style={{ marginTop: 8 }}>
                      <p className="section-kicker" style={{ marginBottom: 10 }}>补缺口建议</p>
                      {activeLog.analysis.gapRecommendations.map((item) => (
                        <div key={item.foodId} style={{
                          display: "flex", justifyContent: "space-between", alignItems: "center",
                          gap: 10, padding: "10px 14px", borderRadius: 14,
                          background: "rgba(255,248,239,0.9)", border: "1px solid rgba(255,214,107,0.18)",
                          marginBottom: 8,
                        }}>
                          <div>
                            <strong style={{ display: "block" }}>{item.foodName}</strong>
                            <span style={{ color: "var(--muted)", fontSize: "0.82rem" }}>{item.amountText}</span>
                          </div>
                          <span style={{ color: "var(--secondary)", fontSize: "0.82rem", fontWeight: 700 }}>
                            {item.reasons.join(" / ")}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              </section>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
