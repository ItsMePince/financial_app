import React, { useMemo, useRef, useState } from "react";
import "./expense.css";
import { ClipboardList, MapPin, Utensils, Car, Gift } from "lucide-react";

/* ================= Icons (inline SVG) ================= */
const ChevronDown = () => (
  <svg viewBox="0 0 24 24" className="icon">
    <path
      d="M6 9l6 6 6-6"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const IconEtc = ({ active = false }: { active?: boolean }) => (
  <svg viewBox="0 0 24 24" className={`icon ${active ? "icon-active" : ""}`}>
    <circle cx="5" cy="12" r="1.8" />
    <circle cx="12" cy="12" r="1.8" />
    <circle cx="19" cy="12" r="1.8" />
  </svg>
);

const IconBackspace = () => (
  <svg viewBox="0 0 24 24" className="icon">
    <path
      d="M4 12 9 6h10a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H9L4 12Zm6-3 6 6m0-6-6 6"
      stroke="currentColor"
      strokeWidth="1.7"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const IconCheck = () => (
  <svg viewBox="0 0 24 24" className="icon">
    <path
      d="m5 12 4 4 10-10"
      stroke="currentColor"
      strokeWidth="2.2"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/* ===================================================== */

type Category = "อาหาร" | "ค่าเดินทาง" | "ของขวัญ" | "อื่นๆ";

export default function Expense() {
  const [category, setCategory] = useState<Category>("อาหาร");
  const [amount, setAmount] = useState<string>("0");
  const [note, setNote] = useState<string>("");
  const [place, setPlace] = useState<string>("");

  // ดรอปดาวน์ "ประเภทรายการ" (แสดงเฉพาะอีกตัวเลือกเท่านั้น)
  const [typeOpen, setTypeOpen] = useState(false);
  const [entryType] = useState<"ค่าใช้จ่าย" | "รายได้">("ค่าใช้จ่าย");

  // แสดงเฉพาะตัวเลือกที่ "ไม่ใช่" ค่าปัจจุบัน
  const menuOptions: Array<"ค่าใช้จ่าย" | "รายได้"> =
    entryType === "ค่าใช้จ่าย" ? ["รายได้"] : ["ค่าใช้จ่าย"];

  // เปลี่ยนหน้าเมื่อเลือกอีกโหมด
  const onSelectType = (target: "ค่าใช้จ่าย" | "รายได้") => {
    setTypeOpen(false);
    if (target === "รายได้") {
      // ปรับตาม routing ของโปรเจกต์คุณ (React Router -> useNavigate)
      window.location.href = "/income";
    } else {
      window.location.href = "/expense";
    }
  };

  // Date Picker
  const [date, setDate] = useState<string>("");
  const dateInputRef = useRef<HTMLInputElement>(null);

  const pad = useMemo(
    () => ["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "⌫"],
    []
  );

  const onTapKey = (k: string) => {
    if (k === "⌫") {
      setAmount((a) => (a.length <= 1 ? "0" : a.slice(0, -1)));
      return;
    }
    if (k === ".") {
      setAmount((a) => (a.includes(".") ? a : a + "."));
      return;
    }
    setAmount((a) => (a === "0" ? k : a + k));
  };

  const onConfirm = () => {
    if (!amount || amount === "0" || !note.trim() || !place.trim() || !date) {
      alert("Required ❌");
      return;
    }
    console.log({
      type: entryType,
      category,
      amount: parseFloat(amount || "0"),
      note,
      place,
      date,
    });
    alert("บันทึกเรียบร้อย ✅");
  };

  // เปิดปฏิทินเมื่อกดปุ่ม "วัน / เดือน / ปี"
  const openDatePicker = () => {
    const input = dateInputRef.current;
    if (!input) return;
    if (typeof (input as any).showPicker === "function") {
      (input as any).showPicker();
    } else {
      input.click();
    }
  };

  // รูปแบบวันที่ให้แสดงบนปุ่ม (เช่น 05/09/2025)
  const formatDate = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString("th-TH", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      return "วัน / เดือน / ปี";
    }
  };

  return (
    <div className="calc-wrap">
      {/* Header */}
      <header className="topbar">
        <div className="avatar">A</div>
        <div className="who">
          <div className="name">Amanda</div>
        </div>
      </header>

      {/* Type pill with dropdown (แสดงเฉพาะอีกตัวเลือก) */}
      <div className="type-pill" style={{ position: "relative" }}>
        <button className="pill" onClick={() => setTypeOpen((o) => !o)}>
          <span>{entryType}</span>
          <ChevronDown />
        </button>

        {typeOpen && (
          <div
            onMouseLeave={() => setTypeOpen(false)}
            style={{
              position: "absolute",
              top: "calc(100% + 8px)",
              left: "50%",
              transform: "translateX(-50%)",
              background: "#fff",
              border: "1px solid rgba(0,0,0,.06)",
              borderRadius: 14,
              boxShadow: "0 10px 20px rgba(0,0,0,.08)",
              padding: 6,
              minWidth: 200,
              zIndex: 20,
            }}
          >
            {menuOptions.map((op) => (
              <button
                key={op}
                onClick={() => onSelectType(op)}
                style={{
                  width: "100%",
                  textAlign: "center",
                  padding: "10px 12px",
                  border: 0,
                  background: "transparent",
                  borderRadius: 10,
                  cursor: "pointer",
                  fontWeight: 600,
                  color: "var(--ink)" as any,
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "#f3fbf8")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
              >
                {op}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Category row */}
      <div className="category-row">
        <button
          className={`cat ${category === "อาหาร" ? "active" : ""}`}
          onClick={() => setCategory("อาหาร")}
        >
          <Utensils
            className={`icon ${category === "อาหาร" ? "icon-active" : ""} lucide`}
            size={20}
            strokeWidth={2}
          />
          <span>อาหาร</span>
        </button>

        <button
          className={`cat ${category === "ค่าเดินทาง" ? "active" : ""}`}
          onClick={() => setCategory("ค่าเดินทาง")}
        >
          <Car
            className={`icon ${category === "ค่าเดินทาง" ? "icon-active" : ""} lucide`}
            size={20}
            strokeWidth={2}
          />
          <span>ค่าเดินทาง</span>
        </button>

        <button
          className={`cat ${category === "ของขวัญ" ? "active" : ""}`}
          onClick={() => setCategory("ของขวัญ")}
        >
          <Gift
            className={`icon ${category === "ของขวัญ" ? "icon-active" : ""} lucide`}
            size={20}
            strokeWidth={2}
          />
          <span>ของขวัญ</span>
        </button>

        <button
          className={`cat ${category === "อื่นๆ" ? "active" : ""}`}
          onClick={() => setCategory("อื่นๆ")}
        >
          <IconEtc active={category === "อื่นๆ"} />
          <span>อื่นๆ</span>
        </button>
      </div>

      {/* Amount */}
      <div className="amount">
        <span className="num">{amount}</span>
        <span className="currency">฿</span>
      </div>

      {/* Segments */}
      <div className="segments" style={{ position: "relative" }}>
        <button className="seg" onClick={openDatePicker}>
          {date ? formatDate(date) : "วัน / เดือน / ปี"}
        </button>
        <input
          ref={dateInputRef}
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          style={{
            position: "absolute",
            opacity: 0,
            pointerEvents: "none",
            width: 0,
            height: 0,
          }}
        />

        <button className="seg">ประเภทการชำระเงิน</button>
      </div>

      {/* Inputs */}
      <div className="inputs">
        <div className="input">
          <ClipboardList size={18} strokeWidth={2} className="icon" />
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="โน้ต"
          />
        </div>
        <div className="input">
          <MapPin size={18} strokeWidth={2} className="icon" />
          <input
            value={place}
            onChange={(e) => setPlace(e.target.value)}
            placeholder="สถานที่"
          />
        </div>
      </div>

      {/* Keypad */}
      <div className="keypad">
        {pad.map((k, i) => (
          <button
            key={i}
            className={`key ${k === "⌫" ? "danger" : ""}`}
            onClick={() => (k === "⌫" ? onTapKey("⌫") : onTapKey(k))}
          >
            {k === "⌫" ? <IconBackspace /> : k}
          </button>
        ))}
      </div>

      {/* Confirm */}
      <div className="confirm">
        <button className="ok-btn" onClick={onConfirm}>
          <IconCheck />
        </button>
      </div>
    </div>
  );
}
