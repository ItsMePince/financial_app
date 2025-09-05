// src/pages/income.tsx
// @ts-nocheck
import React, { useEffect, useMemo, useState } from "react";
import "./income.css";
import BottomNav from "./buttomnav";
import {
  // พื้นฐาน
  ClipboardList,
  MapPin,
  HandCoins,
  Banknote,
  Bitcoin,
  CalendarDays,

  // ====== เพิ่มให้ตรงกับ customincome ======
  // เงินเดือน & งานประจำ
  Gift, Coins, Wallet, Briefcase, Laptop, CreditCard,
  BarChart as BarChart, Clock, ShieldCheck,

  // งานเสริม & ฟรีแลนซ์
  UserCheck, BookOpen, Camera, Bike, Car, PenTool, Code,

  // การลงทุน & ดอกผล
  PiggyBank, LineChart, FileText, Layers, TrendingUp,

  // ค่าเช่า & ทรัพย์สิน
  Home as HomeIcon, Bed, Building, Truck, Package,

  // ค้าขาย & ออนไลน์
  ShoppingBag, Store, Boxes, Tent, Ticket,

  // ครีเอเตอร์ & ลิขสิทธิ์
  Video, Mic, Radio, Music, Film, Gamepad,

  // ทุน/สนับสนุน
  ClipboardCheck, Trophy, GraduationCap,

  // ของขวัญ & อื่นๆ
  Coffee, Star, Gem,

  // Crypto & Digital
  CircuitBoard, Image, Cloud, Lock,

  // Passive
  Link, Megaphone, FileBadge, Users,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { usePaymentMethod } from "../PaymentMethodContext";

/* ================= Icons (inline SVG) ================= */
const ChevronDown = () => (
  <svg viewBox="0 0 24 24" className="icon">
    <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
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
    <path d="M4 12 9 6h10a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H9L4 12Zm6-3 6 6m0-6-6 6"
      stroke="currentColor" strokeWidth="1.7" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconCheck = () => (
  <svg viewBox="0 0 24 24" className="icon">
    <path d="m5 12 4 4 10-10" stroke="currentColor" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
/* ===================================================== */

/** รายได้เท่านั้น */
type Category = "ค่าขนม" | "ทำงาน" | "ลงทุน" | "อื่นๆ";

// ชุด map สำหรับเรนเดอร์ไอคอนจากชื่อที่ customincome ส่งกลับมา
const ICON_MAP: Record<string, React.FC<any>> = {
  // เงินเดือน & งานประจำ
  Briefcase, BarChart, Clock, Wallet, ShieldCheck,

  // งานเสริม & ฟรีแลนซ์
  Laptop, UserCheck, BookOpen, Camera, Bike, Car, PenTool, Code, Banknote,

  // การลงทุน & ดอกผล
  Coins, PiggyBank, LineChart, FileText, Layers, TrendingUp,

  // ค่าเช่า & ทรัพย์สิน
  Home: HomeIcon, Bed, Building, Truck, Package,

  // ค้าขาย & ออนไลน์
  ShoppingBag, Store, Boxes, Tent, CreditCard, Ticket,

  // ครีเอเตอร์ & ลิขสิทธิ์
  Video, Mic, Radio, Music, Film, Gamepad,

  // ทุน/สนับสนุน
  ClipboardList, ClipboardCheck, Trophy, GraduationCap,

  // ของขวัญ & อื่นๆ
  Gift, Coffee, Star, Gem, HandCoins,

  // Crypto & Digital
  Bitcoin, CircuitBoard, Image, Cloud, Lock,

  // Passive
  Link, Megaphone, FileBadge, Users,
};

// 👉 helper: คืนค่าวันนี้เป็น YYYY-MM-DD (เลี่ยงปัญหา timezone)
const getTodayISO = () => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

export default function Income() {
  const navigate = useNavigate();
  const location = useLocation();

  // ==== ดึง/เซ็ตบัญชีที่เลือกจาก Context ====
  const { payment, setPayment } = usePaymentMethod(); // { id, name, favorite?, type? } | null

  // หมวดรายได้
  const [category, setCategory] = useState<Category>("ค่าขนม");

  // “อื่นๆ” ที่กลับมาจาก /customincome
  const [customCat, setCustomCat] = useState<{ label: string; icon?: string } | null>(null);

  // ฟิลด์อื่น ๆ
  const [amount, setAmount] = useState<string>("0");
  const [note, setNote] = useState<string>("");
  const [place, setPlace] = useState<string>("");

  // Date: เริ่มต้น = วันนี้
  const [date, setDate] = useState<string>(() => getTodayISO());

  // Dropdown สำหรับไปหน้า expense
  const [menuOpen, setMenuOpen] = useState(false);
  const goExpense = () => navigate("/expense");

  // รับค่าจาก customincome (ใช้ router state)
  useEffect(() => {
    const st = location.state as any;
    if (st?.customIncome) {
      setCategory("อื่นๆ");
      setCustomCat({
        label: st.customIncome.label,
        icon: st.customIncome.icon, // ต้องเป็น key ที่อยู่ใน ICON_MAP
      });
      // ล้าง state เพื่อกันแสดงซ้ำเมื่อ re-render
      navigate(location.pathname, { replace: true, state: null });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]);

  // ปุ่มตัวเลข
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

  const resetAll = () => {
    setCategory("ค่าขนม");
    setCustomCat(null);
    setPayment(null); // ✅ รีเซ็ตบัญชีที่เลือก
    setAmount("0");
    setNote("");
    setPlace("");
    setDate(getTodayISO());
    setMenuOpen(false);
  };

  const onConfirm = () => {
    if (!amount || amount === "0" || !note.trim() || !place.trim() || !date) {
      alert("Required ❌");
      return;
    }
    console.log({
      type: "รายได้",
      category: category === "อื่นๆ" && customCat?.label ? customCat.label : category,
      amount: parseFloat(amount || "0"),
      note,
      place,
      date,
      customIcon: category === "อื่นๆ" ? customCat?.icon ?? null : null,
      account: payment ? { id: payment.id, name: payment.name, type: payment.type ?? null } : null,
    });
    alert("บันทึกเรียบร้อย ✅");
    resetAll(); // ✅ กดตกลงแล้วรีเซ็ตค่าเหมือนเดิม
  };

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

  // เรนเดอร์ไอคอน “อื่นๆ (custom)”
  const renderCustomIcon = () => {
    if (!customCat?.icon) return <IconEtc active={category === "อื่นๆ"} />;
    const Cmp = ICON_MAP[customCat.icon];
    if (!Cmp) return <IconEtc active={category === "อื่นๆ"} />;
    return <Cmp className={`icon ${category === "อื่นๆ" ? "icon-active" : ""} lucide`} size={20} strokeWidth={2} />;
  };

  return (
    <div className="calc-wrap">
      {/* Header */}
      <header className="topbar"></header>

      {/* Pill: รายได้ + เมนูไปหน้า expense */}
      <div className="type-pill" style={{ position: "relative" }}>
        <button className="pill" onClick={() => setMenuOpen((o) => !o)}>
          <span>รายได้</span>
          <ChevronDown />
        </button>

        {menuOpen && (
          <div
            onMouseLeave={() => setMenuOpen(false)}
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
              minWidth: 220,
              zIndex: 20,
            }}
          >
            <button
              onClick={goExpense}
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
              ค่าใช้จ่าย
            </button>
          </div>
        )}
      </div>

      {/* Category row — รายได้เท่านั้น */}
      <div className="category-row">
        <button
          className={`cat ${category === "ค่าขนม" ? "active" : ""}`}
          onClick={() => {
            setCategory("ค่าขนม");
            setCustomCat(null);
          }}
        >
          <HandCoins className={`icon ${category === "ค่าขนม" ? "icon-active" : ""} lucide`} size={20} strokeWidth={2} />
          <span>ค่าขนม</span>
        </button>

        <button
          className={`cat ${category === "ทำงาน" ? "active" : ""}`}
          onClick={() => {
            setCategory("ทำงาน");
            setCustomCat(null);
          }}
        >
          <Banknote className={`icon ${category === "ทำงาน" ? "icon-active" : ""} lucide`} size={20} strokeWidth={2} />
          <span>ทำงาน</span>
        </button>

        <button
          className={`cat ${category === "ลงทุน" ? "active" : ""}`}
          onClick={() => {
            setCategory("ลงทุน");
            setCustomCat(null);
          }}
        >
          <Bitcoin className={`icon ${category === "ลงทุน" ? "icon-active" : ""} lucide`} size={20} strokeWidth={2} />
          <span>ลงทุน</span>
        </button>

        {/* 👇 อื่นๆ: ไปหน้า customincome */}
        <button
          className={`cat ${category === "อื่นๆ" ? "active" : ""}`}
          onClick={() => {
            setCategory("อื่นๆ");
            navigate("/customincome");
          }}
        >
          {renderCustomIcon()}
          <span>{category === "อื่นๆ" && customCat?.label ? customCat.label : "อื่นๆ"}</span>
        </button>
      </div>

      {/* Amount */}
      <div className="amount">
        <span className="num">{amount}</span>
        <span className="currency">฿</span>
      </div>

      {/* Segments */}
      <div className="segments" style={{ position: "relative" }}>
        {/* วันที่ */}
        <label
          className="seg date-seg"
          style={{ position: "relative", display: "inline-flex", alignItems: "center", gap: 6 }}
        >
          <CalendarDays className="icon" size={18} />
          <span>{date ? formatDate(date) : "วัน / เดือน / ปี"}</span>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer" }}
          />
        </label>

        {/* ประเภทการชำระเงิน → AccountSelect */}
        <button
          className="seg"
          onClick={() =>
            navigate("/accountselect", { state: { from: "/income" } })
          }
        >
          {payment ? payment.name : "ประเภทการชำระเงิน"}
        </button>
      </div>

      {/* Inputs */}
      <div className="inputs">
        <div className="input">
          <ClipboardList size={18} strokeWidth={2} className="icon" />
          <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="โน้ต" />
        </div>
        <div className="input">
          <MapPin size={18} strokeWidth={2} className="icon" />
          <input value={place} onChange={(e) => setPlace(e.target.value)} placeholder="สถานที่" />
        </div>
      </div>

      {/* Keypad */}
      <div className="keypad">
        {pad.map((k, i) => (
          <button key={i} className={`key ${k === "⌫" ? "danger" : ""}`} onClick={() => (k === "⌫" ? onTapKey("⌫") : onTapKey(k))}>
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

      <BottomNav />
    </div>
  );
}
