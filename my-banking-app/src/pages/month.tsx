// @ts-nocheck
import React, { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { Link } from "react-router-dom";
import "./month.css";

import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import BottomNav from "./buttomnav";

export type Transaction = {
  id: string;
  date: string;      // YYYY-MM-DD
  amount: number;    // + รายรับ, - รายจ่าย
  category: string;  // อาหาร/ค่าเดินทาง/ของขวัญ/อื่นๆ/รายรับ
  note?: string;
};

// ตัวอย่างข้อมูล (เปลี่ยนเป็น data จริงได้)
const demoTx: Transaction[] = [
  { id: "t1", date: "2025-08-12", amount: -800, category: "อาหาร", note: "ข้าว-ชาไข่มุก" },
  { id: "t2", date: "2025-08-13", amount: -750, category: "ค่าเดินทาง", note: "BTS+แท็กซี่" },
  { id: "t3", date: "2025-08-15", amount: 4000, category: "รายรับ", note: "ค่าแรงเสริม" },
];

const thMonths = [
  "มกราคม","กุมภาพันธ์","มีนาคม","เมษายน","พฤษภาคม","มิถุนายน",
  "กรกฎาคม","สิงหาคม","กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม",
];

function formatThaiMonthYear(d: Date): string {
  return `${thMonths[d.getMonth()]} ${d.getFullYear() + 543}`;
}

function startOfMonth(d: Date): Date { 
  return new Date(d.getFullYear(), d.getMonth(), 1); 
}

function endOfMonth(d: Date): Date { 
  return new Date(d.getFullYear(), d.getMonth() + 1, 0); 
}

function iso(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// Custom formatters for chart
const tooltipFormatter = (value: number) => [`${value.toLocaleString()} ฿`, ''];
const tooltipLabelFormatter = (label: string) => `วันที่ ${label}`;

interface MonthProps {
  transactions?: Transaction[];
}

export default function Month({ transactions = demoTx }: MonthProps) {
  const [anchor, setAnchor] = useState<Date>(new Date("2025-08-01"));
  const monthLabel = formatThaiMonthYear(anchor);

  const { dailySeries, totals, monthTx } = useMemo(() => {
    const days = endOfMonth(anchor).getDate();
    const start = startOfMonth(anchor);
    const map: Record<string, { day: number; income: number; expense: number }> = {};
    
    for (let i = 0; i < days; i++) {
      const d = new Date(start.getFullYear(), start.getMonth(), i + 1);
      map[iso(d)] = { day: i + 1, income: 0, expense: 0 };
    }
    
    let inc = 0, exp = 0;
    const onlyThisMonth = transactions
      .filter(t => {
        const d = new Date(t.date);
        return d.getFullYear() === anchor.getFullYear() && d.getMonth() === anchor.getMonth();
      })
      .sort((a,b)=> +new Date(a.date) - +new Date(b.date));

    for (const t of onlyThisMonth) {
      const k = iso(new Date(t.date));
      if (t.amount >= 0) { 
        map[k].income += t.amount; 
        inc += t.amount; 
      } else { 
        map[k].expense += Math.abs(t.amount); 
        exp += Math.abs(t.amount); 
      }
    }
    
    const series = Object.values(map).map(v => ({
      name: v.day.toString(),
      income: v.income,
      expense: v.expense,
    }));

    return {
      dailySeries: series,
      totals: { income: inc, expense: exp, balance: inc - exp },
      monthTx: [...onlyThisMonth].sort((a,b)=> +new Date(b.date) - +new Date(a.date)), 
    };
  }, [transactions, anchor]);

  const prevMonth = () => setAnchor(new Date(anchor.getFullYear(), anchor.getMonth() - 1, 1));
  const nextMonth = () => setAnchor(new Date(anchor.getFullYear(), anchor.getMonth() + 1, 1));

  return (
    <div className="month-wrapper">


      {/* Summary card */}
      <section className="summary-card">
        <div className="summary-title">สรุปรายเดือน</div>
        <div className="month-switcher">
          <button className="nav-btn" onClick={prevMonth} aria-label="ก่อนหน้า">
            <ChevronLeft size={18} />
          </button>
          <div className="month-chip">
            <CalendarDays size={16} className="calendar-ico" />
            {monthLabel}
          </div>
          <button className="nav-btn" onClick={nextMonth} aria-label="ถัดไป">
            <ChevronRight size={18} />
          </button>
        </div>

        <div className="kpi-inline">
          <span>รายรับ: <b className="income">{totals.income.toLocaleString()} ฿</b></span>
          <span>รายจ่าย: <b className="expense">{totals.expense.toLocaleString()} ฿</b></span>
          <span>คงเหลือ: <b className="balance">{totals.balance.toLocaleString()} ฿</b></span>
        </div>

        <div className="chart-card">
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={dailySeries} margin={{ top: 10, right: 16, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="income" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#34d399" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="expense" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f87171" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#f87171" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
              <XAxis dataKey="name" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} width={46} />
              <Tooltip formatter={tooltipFormatter} labelFormatter={tooltipLabelFormatter} />
              <Area type="monotone" dataKey="income" stroke="#10b981" strokeWidth={3} dot={{ r: 3 }} fill="url(#income)" />
              <Area type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={3} dot={{ r: 3 }} fill="url(#expense)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Header row */}
      <div className="grid-header">
        <div>วันที่</div>
        <div>รายรับ</div>
        <div>รายจ่าย</div>
        <div>คงเหลือ</div>
      </div>

      {/* "ทั้งหมด" */}
      <div className="row big-row">
        <div className="left-icon">
          <CalendarDays size={18} />
        </div>
        <div className="row-title">ทั้งหมด</div>
      </div>

      {/* รายการรายวัน */}
      {monthTx.map((t) => {
        const d = new Date(t.date);
        const dd = String(d.getDate()).padStart(2, "0");
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const yyyy = d.getFullYear();
        return (
          <Link
            to={`/day?date=${yyyy}-${mm}-${dd}`}
            key={t.id}
            className="row"
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <div className="left-badge">{dd}/{mm}</div>
            <div className="cell income">
              {t.amount > 0 ? `${t.amount.toLocaleString()} ฿` : "0 ฿"}
            </div>
            <div className="cell expense">
              {t.amount < 0 ? `${Math.abs(t.amount).toLocaleString()} ฿` : "0 ฿"}
            </div>
            <div className="cell remain">{t.amount.toLocaleString()} ฿</div>
          </Link>
        );
      })}

      <BottomNav />  
    </div>
  );
}
