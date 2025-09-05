// src/pages/Expense.tsx
// @ts-nocheck
import React, { useEffect, useMemo, useState } from "react";
import "./expense.css";
import {
  // base & inputs
  ClipboardList,
  MapPin,
  CalendarDays,

  // Food & Drink
  Utensils, Pizza, Drumstick, Coffee, Beer, CupSoda, IceCream, Candy, Cake,

  // Travel
  Car, Bus, Bike, Plane, Train, Ship, Fuel, Map,

  // Health
  Stethoscope, HeartPulse, Activity, Pill, Hospital, Ambulance,

  // Shopping / Style
  ShoppingCart, ShoppingBag, Gift, Tag, Shirt, CreditCard, SoapDispenserDroplet,

  // Work & Finance
  Briefcase, Laptop, Calculator, BarChart, Coins, Wallet,

  // Learning
  BookOpen, GraduationCap, Pencil,

  // Sports
  Dumbbell, Goal, Trophy, Volleyball,

  // Pets
  Dog, Cat, Fish, Bird,

  // Home / Family
  Home, Sofa, Bed, Wrench, Hammer,

  // Entertainment / Relax
  Gamepad, Music, Film, Popcorn, Clapperboard, Sprout,
} from "lucide-react";
import BottomNav from "./buttomnav";
import { useNavigate } from "react-router-dom";
import { useTempCategory } from "../TempCategoryContext";
import { usePaymentMethod } from "../PaymentMethodContext";

/* ================= Icons (inline SVG) ================= */
const ChevronDown = () => (
  <svg viewBox="0 0 24 24" className="icon">
    <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
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
      stroke="currentColor" strokeWidth="1.7" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const IconCheck = () => (
  <svg viewBox="0 0 24 24" className="icon">
    <path d="m5 12 4 4 10-10" stroke="currentColor" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
/* ===================================================== */

type Category = "อาหาร" | "ค่าเดินทาง" | "ของขวัญ" | "อื่นๆ";

// 👉 helper: คืนค่าวันนี้ในรูปแบบ YYYY-MM-DD (ตัด timezone)
const getTodayISO = () => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

/* ===== Mapping ไอคอนจาก CustomOutcome (iconKey -> Component) ===== */
const customIconByKey: Record<string, React.FC<any>> = {
  // Food & Drink
  food: Utensils, pizza: Pizza, drumstick: Drumstick, coffee: Coffee, beer: Beer,
  cupsoda: CupSoda, icecream: IceCream, candy: Candy, cake: Cake,

  // Travel
  car: Car, bus: Bus, bike: Bike, plane: Plane, train: Train, ship: Ship,
  fuel: Fuel, map: Map, mappin: MapPin,

  // Health
  stethoscope: Stethoscope, heart: HeartPulse, activity: Activity,
  pill: Pill, hospital: Hospital, ambulance: Ambulance,

  // Shopping / Style
  cart: ShoppingCart, bag: ShoppingBag, gift: Gift, tag: Tag, shirt: Shirt,
  creditcard: CreditCard, soap: SoapDispenserDroplet,

  // Work & Finance
  briefcase: Briefcase, laptop: Laptop, calculator: Calculator, barchart: BarChart,
  coins: Coins, wallet: Wallet,

  // Learning
  book: BookOpen, graduation: GraduationCap, pencil: Pencil,

  // Sports
  dumbbell: Dumbbell, goal: Goal, trophy: Trophy, volleyball: Volleyball,

  // Pets
  dog: Dog, cat: Cat, fish: Fish, bird: Bird,

  // Home / Family
  home: Home, sofa: Sofa, bed: Bed, wrench: Wrench, hammer: Hammer,

  // Entertainment / Relax
  game: Gamepad, music: Music, film: Film, popcorn: Popcorn,
  clapper: Clapperboard, sprout: Sprout,

  // fallback
  more: IconEtc,
};

export default function Expense() {
  const navigate = useNavigate();
  const { tempCategory, clearTempCategory } = useTempCategory();
  const { payment, clearPayment } = usePaymentMethod(); // ✅ อ่าน/เคลียร์วิธีชำระได้

  // 👇 ถ้ามี tempCategory (กลับจากหน้า Custom) ให้ active = "อื่นๆ" อัตโนมัติ
  const [category, setCategory] = useState<Category>(() => (tempCategory ? "อื่นๆ" : "อาหาร"));
  useEffect(() => {
    if (tempCategory) setCategory("อื่นๆ");
  }, [tempCategory]);

  const [amount, setAmount] = useState<string>("0");
  const [note, setNote] = useState<string>("");
  const [place, setPlace] = useState<string>("");

  // ดรอปดาวน์ "ประเภทรายการ"
  const [typeOpen, setTypeOpen] = useState(false);
  const [entryType] = useState<"ค่าใช้จ่าย" | "รายได้">("ค่าใช้จ่าย");

  const menuOptions: Array<"ค่าใช้จ่าย" | "รายได้"> =
    entryType === "ค่าใช้จ่าย" ? ["รายได้"] : ["ค่าใช้จ่าย"];

  const onSelectType = (target: "ค่าใช้จ่าย" | "รายได้") => {
    setTypeOpen(false);
    if (target === "รายได้") navigate("/income");
    else navigate("/expense");
  };

  // Date: เริ่มต้น = วันนี้
  const [date, setDate] = useState<string>(() => getTodayISO());

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

  // ✅ รีเซ็ตแบบครบถ้วนหลังบันทึก
  const resetForm = () => {
    setCategory("อาหาร");
    setAmount("0");
    setNote("");
    setPlace("");
    setDate(getTodayISO());
    clearTempCategory();
    if (typeof clearPayment === "function") clearPayment(); // กลับเป็นค่าเริ่มต้น
  };

  const onConfirm = () => {
    if (!amount || amount === "0" || !note.trim() || !place.trim() || !date) {
      alert("Required ❌");
      return;
    }

    // ชื่อหมวดสุดท้ายที่ต้องส่งบันทึก:
    const finalCategory =
      category === "อื่นๆ" && tempCategory?.name ? tempCategory.name : category;

    // ตัวอย่างการใช้งานจริง: ส่งไปบันทึก / API
    console.log({
      type: entryType,
      category: finalCategory,
      amount: parseFloat(amount || "0"),
      note,
      place,
      date,
      paymentMethod: payment?.name ?? null,
    });

    alert("บันทึกเรียบร้อย ✅");
    resetForm(); // ← รีเซ็ตทุกอย่าง
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

  // ---- ชื่อ/ไอคอนบนปุ่ม "อื่นๆ" (ใช้ค่าชั่วคราวถ้ามี) ----
  const otherLabel = tempCategory?.name || "อื่นๆ";
  const OtherIcon =
    (tempCategory?.iconKey && customIconByKey[tempCategory.iconKey]) || IconEtc;

  return (
    <div className="calc-wrap">
      {/* Type pill with dropdown */}
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

        {/* อื่นๆ → /customoutcome */}
        <button
          className={`cat ${category === "อื่นๆ" ? "active" : ""}`}
          onClick={() => {
            setCategory("อื่นๆ");
            navigate("/customoutcome");
          }}
        >
          <OtherIcon
            className={`icon ${category === "อื่นๆ" ? "icon-active" : ""}`}
            size={20}
            strokeWidth={2}
          />
          <span>{otherLabel}</span>
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
          style={{
            position: "relative",
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
          }}
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

        {/* วิธีชำระเงิน */}
        <button className="seg" onClick={() => navigate("/accountselect")}>
          {payment?.name ?? "ประเภทการชำระเงิน"}
        </button>
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

      <BottomNav />
    </div>
  );
}
