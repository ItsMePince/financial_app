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
import { useSearchParams } from "react-router-dom";
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
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import BottomNav from "./buttomnav";

/* ---------------- Types ---------------- */
export type DayItem = {
  id: string;
  category: string;   // อาหาร / ค่าเดินทาง / ของขวัญ / อื่นๆ ...
  amount: number;     // เป็นบวก (จำนวนเงิน)
  color?: string;     // สีหมวด (optional)
};
export type ItemsByDate = Record<string, DayItem[]>;

/* -------- DEMO DATA (แทนด้วย data จริงได้) -------- */
const demoItemsByDate: ItemsByDate = {
  "2025-08-15": [
    { id: "b1", category: "ค่าเดินทาง", amount: 800, color: "#3B82F6" }, // ~50%
    { id: "b2", category: "อาหาร", amount: 320, color: "#9CA3AF" },       // ~20%
    { id: "b3", category: "ค่าอาหาร", amount: 200, color: "#06B6D4" },   // ~13%
    { id: "b4", category: "ค่าของขวัญ", amount: 200, color: "#10B981" },   // ~13%
    { id: "b5", category: "อื่นๆ", amount: 112, color: "#22C55E" },        // ~7%
  ],
  "2025-08-14": [
    { id: "a1", category: "อาหาร", amount: 180, color: "#9CA3AF" },
    { id: "a2", category: "ค่าเดินทาง", amount: 120, color: "#3B82F6" },
    { id: "a3", category: "อื่นๆ", amount: 60,  color: "#22C55E" },
  ],
};

const palette = ["#3B82F6","#06B6D4","#10B981","#F59E0B","#EF4444","#9CA3AF","#22C55E"];

const iconMap: Record<string, LucideIcon> = {
  "ค่าเดินทาง": Bus,
  "อาหาร": Utensils,
  "ของขวัญ": Gift,
  "ค่าน้ำมัน": Car,
  "อื่นๆ": Plus,
};

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

export default function Day({
  itemsByDate = demoItemsByDate,   // ปลั๊กข้อมูลจริงเข้ามาแทน demo ได้ทันที
}: {
  itemsByDate?: ItemsByDate;
}) {
  const [sp, setSp] = useSearchParams();
  const urlDate = sp.get("date");
  const init = urlDate ? new Date(urlDate) : new Date("2025-08-14");
  const [anchor, setAnchor] = useState<Date>(init);

  // sync state -> URL ?date=
  useEffect(() => {
    setSp((prev) => {
      const n = new URLSearchParams(prev);
      n.set("date", iso(anchor));
      return n;
    }, { replace: true });
  }, [anchor, setSp]);

  // รายการของวันนั้น
  const items = useMemo<DayItem[]>(() => {
    const list = itemsByDate[iso(anchor)] ?? [];
    return [...list].sort((a, b) => b.amount - a.amount);
  }, [itemsByDate, anchor]);

  // เตรียมข้อมูล donut + เปอร์เซ็นต์
  const { series, total } = useMemo(() => {
    const sum = items.reduce((s, v) => s + v.amount, 0);
    const safe = sum === 0 ? 1 : sum;
    const s = items.map((v, i) => ({
      id: v.id,
      name: v.category,
      value: v.amount,
      color: v.color ?? palette[i % palette.length],
      pct: Math.round((v.amount / safe) * 100),
    }));
    return { series: s, total: sum };
  }, [items]);

  const prevDay = () =>
    setAnchor(new Date(anchor.getFullYear(), anchor.getMonth(), anchor.getDate() - 1));
  const nextDay = () =>
    setAnchor(new Date(anchor.getFullYear(), anchor.getMonth(), anchor.getDate() + 1));

  // วาด label บนวงโดนัท (ตำแหน่งกลาง ring)
  const RAD = Math.PI / 180;
  const donutLabel = (props: any) => {
    const { cx, cy, midAngle, innerRadius, outerRadius, percent } = props;
    const r = innerRadius + (outerRadius - innerRadius) * 0.7; // ปรับความใกล้ขอบ: 0.7 → 0.75 ได้
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

  return (
    <div className="day-wrap">
      {/* Header */}
      

      {/* Summary card */}
      <section className="day-card">
        <div className="card-head">
          <span className="card-title">สรุปรายวัน</span>
          <div className="switcher">
            <button className="nav-btn" onClick={prevDay} aria-label="ก่อนหน้า">‹</button>
            <div className="date-chip">
              <CalendarDays size={16} /> {thDate(anchor)}
            </div>
            <button className="nav-btn" onClick={nextDay} aria-label="ถัดไป">›</button>
          </div>
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

      {/* หัวแถวของลิสต์ */}
      <div className="list-head">
        <div />
        <div>ประเภท</div>
        <div>เปอร์เซ็นต์</div>
        <div>จำนวนเงิน</div>
      </div>

      {/* ลิสต์ */}
      <section className="list">
        {items.length === 0 ? (
          <div className="empty">วันนี้ยังไม่มีรายการ</div>
        ) : (
          items.map((it, i) => {
            const Icon = iconMap[it.category] ?? Circle;
            return (
              <div className="item" key={it.id}>
                <div className="icon-bubble" style={{ background: it.color ?? palette[i % palette.length] }}>
                  <Icon size={18} color="#fff" strokeWidth={2} />
                </div>
                <div className="name">{it.category}</div>
                <div className="percent">{total ? Math.round((it.amount / total) * 100) : 0} %</div>
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
