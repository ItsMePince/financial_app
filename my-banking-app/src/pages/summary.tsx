// src/pages/summary.tsx
import React, { useState } from "react";
import { Utensils, X, Edit, Trash2 } from "lucide-react";
import "./summary.css";
import BottomNav from "./buttomnav";
import "./buttomnav.css";

type Item = {
  title: string;
  tag: string;
  amount: number;
  date?: string;
  note?: string;
  account?: string;
  location?: string;
};

type DayEntry = {
  date: string;
  total: number;
  items: Item[];
};

const entries: DayEntry[] = [
  {
    date: "อ. 26/08",
    total: -400,
    items: [
      {
        title: "ซื้อหมูกรอบ",
        tag: "#ซื้ออาหาร",
        amount: -200,
        date: "26/08/2025",
        note: "โมโต้ : กล้วย",
        account: "กสิกรไทย",
        location: "เซเว่นหน้าบ้าน.",
      },
      { title: "ซื้อไอคอน", tag: "#ซื้ออาหาร", amount: -200 },
    ],
  },
  {
    date: "อ. 27/08",
    total: -400,
    items: [
      { title: "ซื้อไอคอน", tag: "#ซื้ออาหาร", amount: -200 },
      { title: "ซื้อไอคอน", tag: "#ซื้ออาหาร", amount: -200 },
    ],
  },
  {
    date: "อ. 28/08",
    total: -400,
    items: [
      { title: "ซื้อไอคอน", tag: "#ซื้ออาหาร", amount: -200 },
      { title: "ซื้อไอคอน", tag: "#ซื้ออาหาร", amount: -200 },
    ],
  },
];

export default function Summary() {
  const [selected, setSelected] = useState<Item | null>(null);

  return (
    <div className="App summary-page">
      {/* รายการรายวัน */}
      <div className="list-wrap">
        {entries.map((day) => (
          <section
            key={day.date}
            className="day-card is-clickable"
            onClick={() => setSelected(day.items[0])}
            role="button"
            aria-label={`ดูรายละเอียดของ ${day.date}`}
          >
            <header className="day-header">
              <span className="day-date">{day.date}</span>
              <span className="day-total">
                รวม: <b className="neg">{day.total.toLocaleString()}</b> ฿
              </span>
            </header>

            <div className="day-body">
              {day.items.map((it, idx) => (
                <div
                  key={idx}
                  className="row clickable"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelected(it);
                  }}
                >
                  <div className="row-left">
                    <div className="row-avatar">
                      <Utensils size={16} />
                    </div>
                    <div className="row-text">
                      <div className="row-title">{it.title}</div>
                      <div className="row-tag">{it.tag}</div>
                    </div>
                  </div>

                  {/* ✅ จำนวนเงิน: ชิดขวาริม + ฟอร์แมต + สีอัตโนมัติ */}
                  <div className={`row-amt ${it.amount < 0 ? "neg" : "pos"}`}>
                    {it.amount.toLocaleString()}
                  </div>

                  {idx !== day.items.length - 1 && (
                    <div className="divider" aria-hidden="true" />
                  )}
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* Modal รายละเอียด */}
      {selected && (
        <div className="detail-overlay" onClick={() => setSelected(null)}>
          <div
            className="detail-card"
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="detail-close"
              onClick={() => setSelected(null)}
              aria-label="ปิด"
            >
              <X size={20} />
            </button>

            <div className="detail-header">
              <div className="detail-avatar" />
              <h3 className="detail-title">{selected.title}</h3>
              <div className="detail-actions">
                <button className="icon-btn" aria-label="แก้ไข">
                  <Edit size={18} />
                </button>
                <button className="icon-btn" aria-label="ลบ">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>

            <div className="detail-body">
              {selected.date && <p>{selected.date}</p>}
              {selected.note && <p>{selected.note}</p>}
              {selected.account && <p>บัญชี : {selected.account}</p>}
              {selected.location && <p>สถานที่ : {selected.location}</p>}
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
