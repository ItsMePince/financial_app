// src/pages/Day.tsx
import React, { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";
import "./day.css";

import type { LucideIcon } from "lucide-react";
import {
  Bus,
  Utensils,
  Gift,
  Car,
  Plus,
  Circle,          // fallback icon
  ReceiptText,     // bottom nav
  Home,
  LineChart,
  CalendarDays,    // date chip
  ChevronLeft,     // prev day
  ChevronRight,    // next day
} from "lucide-react";
import BottomNav from './buttomnav';
// แมปชื่อหมวด → ไอคอน (เพิ่ม/แก้ได้ตามต้องการ)
const iconMap: Record<string, LucideIcon> = {
  "ค่าเดินทาง": Bus,
  "อาหาร": Utensils,
  "ของขวัญ": Gift,
  "ค่าน้ำมัน": Car,
  "อื่นๆ": Plus,
};

/** 1 รายการใช้จ่ายในวันนั้น */
export type DayItem = {
  id: string;
  category: string;   // เช่น อาหาร / ค่าเดินทาง / ของขวัญ / อื่นๆ
  amount: number;     // เป็นบวก (จำนวนเงิน)
  icon?: string;      // (ไม่ใช้แล้ว แต่คงไว้ให้เข้ากับ data เดิม)
  color?: string;     // สีประจำหมวด (ไม่ใส่ก็จะมี fallback)
};

/** โครงสร้างข้อมูลหลายวัน: key = YYYY-MM-DD */
export type ItemsByDate = Record<string, DayItem[]>;

/* ------------ DEMO DATA หลายวัน (เปลี่ยนเป็น data จริงได้) ------------- */
const demoItemsByDate: ItemsByDate = {
  "2025-08-13": [
    { id: "a1", category: "อาหาร", amount: 180, icon: "🍜", color: "#4F86F7" },
    { id: "a2", category: "ค่าเดินทาง", amount: 120, icon: "🚌", color: "#10B981" },
    { id: "a3", category: "อื่นๆ", amount: 60, icon: "🎁", color: "#38BDF8" },
  ],
  "2025-08-14": [
    { id: "b1", category: "ค่าเดินทาง", amount: 800, icon: "🚌", color: "#4F86F7" }, // 49–50%
    { id: "b2", category: "ค่าน้ำมัน", amount: 200, icon: "⛽", color: "#38BDF8" },   // ~13%
    { id: "b3", category: "ค่าน้ำมัน", amount: 200, icon: "⛽", color: "#10B981" },   // ~13%
    { id: "b4", category: "อาหาร", amount: 320, icon: "🍚", color: "#A3A3A3" },       // ~20%
    { id: "b5", category: "อื่นๆ", amount: 112, icon: "🎁", color: "#14B8A6" },        // ~7%
  ],
  "2025-08-15": [
    { id: "c1", category: "อาหาร", amount: 120, icon: "🍱", color: "#4F86F7" },
    { id: "c2", category: "ของขวัญ", amount: 450, icon: "🎁", color: "#F59E0B" },
  ],
};
/* ------------------------------------------------------------------------ */

const palette = ["#4F86F7", "#14B8A6", "#38BDF8", "#A3A3A3", "#10B981", "#F59E0B", "#EF4444"];

function iso(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function thaiDate(d: Date) {
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const by = d.getFullYear() + 543;
  return `${dd}/${mm}/${by}`;
}

export default function Day({
  itemsByDate = demoItemsByDate,
  initialDate = new Date("2025-08-14"),
}: {
  itemsByDate?: ItemsByDate;
  initialDate?: Date;
}) {
  const [anchor, setAnchor] = useState<Date>(initialDate);

  // รายการของ “วันที่เลือก” เท่านั้น
  const items = useMemo<DayItem[]>(() => {
    const list = itemsByDate[iso(anchor)] ?? [];
    // เรียงมาก→น้อย เพื่อให้ลิสต์/เปอร์เซ็นต์ดูอ่านง่าย
    return [...list].sort((a, b) => b.amount - a.amount);
  }, [itemsByDate, anchor]);

  // series สำหรับ donut + รวมยอด + เปอร์เซ็นต์
  const { series, total } = useMemo(() => {
    const sum = items.reduce((s, v) => s + v.amount, 0);
    const safe = sum === 0 ? 1 : sum;
    const s = items.map((v, i) => ({
      id: v.id,
      name: v.category,
      value: v.amount,
      percent: v.amount / safe,
      color: v.color ?? palette[i % palette.length],
    }));
    return { series: s, total: sum };
  }, [items]);

  const prevDay = () =>
    setAnchor(new Date(anchor.getFullYear(), anchor.getMonth(), anchor.getDate() - 1));
  const nextDay = () =>
    setAnchor(new Date(anchor.getFullYear(), anchor.getMonth(), anchor.getDate() + 1));

  return (
    <div className="day-wrap">
      {/* Header */}
      <header className="day-header">
        <div className="avatar">A</div>
        <h1 className="app-title">Amanda</h1>
      </header>

      {/* Card + date switcher */}
      <section className="card">
        <div className="card-title">สรุปรายวัน</div>
        <div className="day-switcher">
          <button className="nav-btn" onClick={prevDay} aria-label="วันก่อนหน้า">
            <ChevronLeft size={18} />
          </button>

          <div className="date-chip">
            <CalendarDays size={16} className="ico" /> {thaiDate(anchor)}
          </div>

          <button className="nav-btn" onClick={nextDay} aria-label="วันถัดไป">
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Donut */}
        <div className="donut">
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={series}
                dataKey="value"
                nameKey="name"
                innerRadius={70}
                outerRadius={105}
                paddingAngle={2}
              >
                {series.map((s) => (
                  <Cell key={s.id} fill={s.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(v: number, _name, p: any) => [
                  `฿${Number(v).toLocaleString()}`,
                  `${p.payload.name}`,
                ]}
              />
            </PieChart>
          </ResponsiveContainer>

          {/* เปอร์เซ็นต์รอบวง */}
          <div className="pct-ring">
            {series.map((s) => (
              <span key={s.id} style={{ color: s.color }}>
                {Math.round(s.percent * 100)}%
              </span>
            ))}
          </div>
        </div>
      </section>

      <div className="divider" />

      {/* ลิสต์ของวันนั้น */}
      <section className="list">
        {items.length === 0 ? (
          <div className="empty">วันนี้ยังไม่มีรายการ</div>
        ) : (
          items.map((it, i) => {
            const Icon = iconMap[it.category] ?? Circle;
            return (
              <div className="item" key={it.id}>
                <div
                  className="icon-bubble"
                  style={{ background: it.color ?? palette[i % palette.length] }}
                >
                  <Icon size={18} color="#fff" strokeWidth={2} />
                </div>
                <div className="name">{it.category}</div>
                <div className="percent">
                  {total === 0 ? 0 : Math.round((it.amount / total) * 100)} %
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
