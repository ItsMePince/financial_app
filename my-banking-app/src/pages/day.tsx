// src/pages/Day.tsx
// @ts-nocheck
import React, { useMemo, useState, useEffect } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";
import { useSearchParams, useNavigate } from "react-router-dom";
import "./day.css";

import type { LucideIcon } from "lucide-react";
import {
  Bus,
  Utensils,
  Gift,
  Car,
  Plus,
  Circle,
  CalendarDays,
  ArrowLeft,    // ⟵ ใช้ทำปุ่มกลับ
} from "lucide-react";

import BottomNav from "./buttomnav";

/* ---------------- Backend DTO ---------------- */
type ExpenseDTO = {
  id: number;
  type: "EXPENSE" | "INCOME";
  category: string;
  amount: number;          // บวกจาก backend
  note?: string | null;
  place?: string | null;
  date: string;            // "yyyy-MM-dd"
  paymentMethod?: string | null;
  iconKey?: string | null;
};

/* ---------------- View Types ---------------- */
export type DayItem = {
  id: string;               // key: type::category
  category: string;
  type: "EXPENSE" | "INCOME";
  amount: number;           // เป็นบวก (รวม abs)
  color: string;            // รายรับ=เขียว / รายจ่าย=แดง
};

const COLOR_INCOME = "#10B981"; // เขียว
const COLOR_EXPENSE = "#EF4444"; // แดง

/* หมวด -> ไอคอน (fallback ถ้าไม่เจอ iconKey) */
const iconMap: Record<string, LucideIcon> = {
  "ค่าเดินทาง": Bus,
  "อาหาร": Utensils,
  "ของขวัญ": Gift,
  "ค่าน้ำมัน": Car,
  "อื่นๆ": Plus,
};

const API_BASE =
  (import.meta as any)?.env?.VITE_API_BASE ||
  (import.meta as any)?.env?.REACT_APP_API_BASE ||
  "http://localhost:8081";

/* ---------------- Date helpers ---------------- */
const iso = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
};
const thDate = (d: Date) => {
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yy = d.getFullYear() + 543;
  return `${dd}/${mm}/${yy}`;
};

export default function Day() {
  const navigate = useNavigate();
  const [sp, setSp] = useSearchParams();
  const urlDate = sp.get("date");
  const init = urlDate ? new Date(urlDate) : new Date();
  const [anchor, setAnchor] = useState<Date>(init);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [raw, setRaw] = useState<ExpenseDTO[]>([]);

  // sync state -> URL ?date=
  useEffect(() => {
    setSp((prev) => {
      const n = new URLSearchParams(prev);
      n.set("date", iso(anchor));
      return n;
    }, { replace: true });
  }, [anchor, setSp]);

  // โหลดรายการของ "วันนั้น" จาก backend
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);

        const dayISO = iso(anchor);
        const res = await fetch(
          `${API_BASE}/api/expenses/range?start=${dayISO}&end=${dayISO}`,
          { headers: { Accept: "application/json" }, credentials: "include" }
        );
        if (!res.ok) throw new Error(`โหลดรายการไม่สำเร็จ (${res.status})`);
        const data: ExpenseDTO[] = await res.json();
        if (!alive) return;
        setRaw(data);
      } catch (e: any) {
        if (!alive) return;
        setError(e?.message || "เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [anchor]);

  // รวมเป็น (type::category) -> มูลค่า abs และใส่สีตามชนิด
  const items = useMemo<DayItem[]>(() => {
    const map = new Map<string, { category: string; type: "EXPENSE" | "INCOME"; amount: number }>();
    for (const e of raw) {
      const type = e.type;
      const absVal = Math.abs(Number(e.amount));
      const category = e.category || "อื่นๆ";
      const key = `${type}::${category}`;
      const prev = map.get(key) || { category, type, amount: 0 };
      map.set(key, { category, type, amount: prev.amount + absVal });
    }
    const arr: DayItem[] = Array.from(map.entries()).map(([key, v]) => ({
      id: key,
      category: v.category,
      type: v.type,
      amount: v.amount,
      color: v.type === "INCOME" ? COLOR_INCOME : COLOR_EXPENSE,
    }));
    // เรียงลง: มาก → น้อย
    arr.sort((a, b) => b.amount - a.amount);
    return arr;
  }, [raw]);

  // เตรียมข้อมูล donut + เปอร์เซ็นต์
  const { series, total } = useMemo(() => {
    const sum = items.reduce((s, v) => s + v.amount, 0);
    const safe = sum === 0 ? 1 : sum;
    const s = items.map((v) => ({
      id: v.id,
      name: v.category,
      value: v.amount,
      color: v.color,
      pct: Math.round((v.amount / safe) * 100),
    }));
    return { series: s, total: sum };
  }, [items]);

  const prevDay = () =>
    setAnchor(new Date(anchor.getFullYear(), anchor.getMonth(), anchor.getDate() - 1));
  const nextDay = () =>
    setAnchor(new Date(anchor.getFullYear(), anchor.getMonth(), anchor.getDate() + 1));

  // กลับหน้า month (หรือย้อนหน้าเดิมถ้ามี history)
  const goBackToMonth = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate("/month");
  };

  // วาด label บนวงโดนัท (ตำแหน่งกลาง ring)
  const RAD = Math.PI / 180;
  const donutLabel = (props: any) => {
    const { cx, cy, midAngle, innerRadius, outerRadius, percent } = props;
    const r = innerRadius + (outerRadius - innerRadius) * 0.7;
    const x = cx + r * Math.cos(-midAngle * RAD);
    const y = cy + r * Math.sin(-midAngle * RAD);
    const val = Math.round((percent || 0) * 100);
    if (!val) return null;
    return (
      <text
        x={x}
        y={y}
        fill="#111827"
        fontSize={12}
        fontWeight={700}
        textAnchor="middle"
        dominantBaseline="central"
      >
        {val}%
      </text>
    );
  };

  if (loading) {
    return (
      <div className="day-wrap">
        <section className="day-card"><div>กำลังโหลดข้อมูล…</div></section>
        <BottomNav />
      </div>
    );
  }
  if (error) {
    return (
      <div className="day-wrap">
        <section className="day-card"><div className="error">{error}</div></section>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="day-wrap">
      {/* Summary card */}
      <section className="day-card">
        {/* แถวหัวการ์ด: ซ้าย=ปุ่มกลับ, กลาง=ชื่อหัวข้อ, ขวา=ช่องว่างเพื่อให้ศูนย์กลางจริง */}
        <div className="card-head">
          <button
            className="back-link"
            onClick={goBackToMonth}
            aria-label="กลับหน้าสรุปรายเดือน"
            title="กลับหน้าสรุปรายเดือน"
          >
            <ArrowLeft size={22} />
            <span>กลับ</span>
          </button>

          <h2 className="card-title">สรุปรายวัน</h2>

          {/* ช่องว่างไว้บาลานซ์ grid ให้หัวข้ออยู่กึ่งกลางจริง */}
          <div />
        </div>

        {/* ตัวสลับวัน + วันที่ */}
        <div className="switcher">
          <button className="nav-btn" onClick={prevDay} aria-label="ก่อนหน้า">‹</button>
          <div className="date-chip">
            <CalendarDays size={16} /> {thDate(anchor)}
          </div>
          <button className="nav-btn" onClick={nextDay} aria-label="ถัดไป">›</button>
        </div>

        <div className="donut-box">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={series}
                dataKey="value"
                nameKey="name"
                innerRadius={80}
                outerRadius={120}
                paddingAngle={2}
                stroke="#fff"
                strokeWidth={2}
                label={donutLabel}
                labelLine={false}
              >
                {series.map((s) => (
                  <Cell key={s.id} fill={s.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(v: number, _n, p: any) => [
                  `฿${Number(v).toLocaleString()}`,
                  p?.payload?.name ?? "",
                ]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Header of list */}
      <div className="list-head">
        <div />
        <div>ประเภท</div>
        <div>เปอร์เซ็นต์</div>
        <div>จำนวนเงิน</div>
      </div>

      {/* List */}
      <section className="list">
        {items.length === 0 ? (
          <div className="empty">วันนี้ยังไม่มีรายการ</div>
        ) : (
          items.map((it) => {
            const Icon = iconMap[it.category] ?? Circle;
            return (
              <div className="item" key={it.id}>
                <div
                  className="icon-bubble"
                  style={{ background: it.color }}
                  title={it.type === "INCOME" ? "รายรับ" : "รายจ่าย"}
                >
                  <Icon size={18} color="#fff" strokeWidth={2} />
                </div>
                <div className="name">{it.category}</div>
                <div className="percent">
                  {total ? Math.round((it.amount / total) * 100) : 0} %
                </div>
                <div className="amount">{it.amount.toLocaleString()} ฿</div>
              </div>
            );
          })
        )}
      </section>

      <BottomNav />
    </div>
  );
}
