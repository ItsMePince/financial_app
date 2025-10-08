// src/pages/income.tsx
// @ts-nocheck
import React, { useEffect, useMemo, useRef, useState } from "react";
import "./income.css";
import BottomNav from "./buttomnav";
import {
  ClipboardList, MapPin, HandCoins, Banknote, Bitcoin, CalendarDays,
  Gift, Coins, Wallet, Briefcase, Laptop, CreditCard, BarChart as BarChart, Clock, ShieldCheck,
  UserCheck, BookOpen, Camera, Bike, Car, PenTool, Code,
  PiggyBank, LineChart, FileText, Layers, TrendingUp,
  Home as HomeIcon, Bed, Building, Truck, Package,
  ShoppingBag, Store, Boxes, Tent, Ticket,
  Video, Mic, Radio, Music, Film, Gamepad,
  ClipboardCheck, Trophy, GraduationCap,
  Coffee, Star, Gem,
  CircuitBoard, Image, Cloud, Lock,
  Link, Megaphone, FileBadge, Users,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { usePaymentMethod } from "../PaymentMethodContext";

const API_BASE =
  (import.meta.env.VITE_API_BASE as string) || "http://localhost:8081";

/* inline icons */
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

/** รายได้เท่านั้น */
type Category = "ค่าขนม" | "ทำงาน" | "ลงทุน" | "อื่นๆ";

const ICON_MAP: Record<string, React.FC<any>> = {
  Briefcase, BarChart, Clock, Wallet, ShieldCheck,
  Laptop, UserCheck, BookOpen, Camera, Bike, Car, PenTool, Code, Banknote,
  Coins, PiggyBank, LineChart, FileText, Layers, TrendingUp,
  Home: HomeIcon, Bed, Building, Truck, Package,
  ShoppingBag, Store, Boxes, Tent, CreditCard, Ticket,
  Video, Mic, Radio, Music, Film, Gamepad,
  ClipboardList, ClipboardCheck, Trophy, GraduationCap,
  Gift, Coffee, Star, Gem, HandCoins,
  Bitcoin, CircuitBoard, Image, Cloud, Lock,
  Link, Megaphone, FileBadge, Users,
};

const getTodayISO = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}-${String(now.getDate()).padStart(2,"0")}`;
};

/** iconKey มาตรฐานสำหรับหมวดรายได้ */
const defaultIconKeyByCategory: Record<Category, string> = {
  "ค่าขนม": "HandCoins",
  "ทำงาน": "Banknote",
  "ลงทุน": "Bitcoin",
  "อื่นๆ": "more",
};

const DRAFT_KEY = "incomeDraft_v1";

export default function Income() {
  const navigate = useNavigate();
  const location = useLocation();
  const { payment, setPayment } = usePaymentMethod();

  const [category, setCategory] = useState<Category>("ค่าขนม");
  const [customCat, setCustomCat] = useState<{ label: string; icon?: string } | null>(null);
  const [amount, setAmount] = useState<string>("0");
  const [note, setNote] = useState<string>("");
  const [place, setPlace] = useState<string>("");
  const [date, setDate] = useState<string>(() => getTodayISO());
  const [menuOpen, setMenuOpen] = useState(false);

  // --- กู้คืน draft เมื่อเข้าหน้า ---
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(DRAFT_KEY);
      if (raw) {
        const d = JSON.parse(raw);
        if (d.category) setCategory(d.category);
        if (d.customCat) setCustomCat(d.customCat);
        if (typeof d.amount === "string") setAmount(d.amount);
        if (typeof d.note === "string") setNote(d.note);
        if (typeof d.place === "string") setPlace(d.place);
        if (typeof d.date === "string") setDate(d.date);
        if (d.payment) setPayment(d.payment);
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- บันทึก draft ทุกครั้งที่มีการแก้ไข ---
  useEffect(() => {
    const draft = { category, customCat, amount, note, place, date, payment };
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  }, [category, customCat, amount, note, place, date, payment]);

  // รับค่าจากหน้า customincome
  useEffect(() => {
    const st = location.state as any;
    if (st?.customIncome) {
      setCategory("อื่นๆ");
      setCustomCat({ label: st.customIncome.label, icon: st.customIncome.icon });
      navigate(location.pathname, { replace: true, state: null });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]);

  const pad = useMemo(() => ["1","2","3","4","5","6","7","8","9",".","0","⌫"], []);
  const onTapKey = (k: string) => {
    if (k === "⌫") return setAmount(a => (a.length <= 1 ? "0" : a.slice(0,-1)));
    if (k === ".")  return setAmount(a => (a.includes(".") ? a : a + "."));
    setAmount(a => (a === "0" ? k : a + k));
  };

  const resetAll = () => {
    setCategory("ค่าขนม"); setCustomCat(null); setPayment(null);
    setAmount("0"); setNote(""); setPlace(""); setDate(getTodayISO()); setMenuOpen(false);
    sessionStorage.removeItem(DRAFT_KEY);
  };

  const onConfirm = async () => {
    if (!amount || amount === "0" || !note.trim() || !place.trim() || !date) {
      alert("Required ❌"); return;
    }
    const finalCategory = category === "อื่นๆ" && customCat?.label ? customCat.label : category;

    const iconKey =
      category === "อื่นๆ"
        ? (customCat?.icon || "more")
        : defaultIconKeyByCategory[category];

    const payload = {
      type: "รายได้",
      category: finalCategory,
      amount: parseFloat(amount || "0"),
      note, place, date,
      paymentMethod: payment?.name ?? null,
      iconKey,
    };

    try {
      const res = await fetch(`${API_BASE}/api/expenses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include", // 🔗 ให้ session cookie ติดไปด้วย
      });
      if (!res.ok) throw new Error(await res.text());
      alert("บันทึกเรียบร้อย ✅");
      resetAll();
    } catch (e:any) {
      console.error(e);
      alert("บันทึกไม่สำเร็จ ❌ " + (e?.message ?? ""));
    }
  };

  const formatDate = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString("th-TH",{day:"2-digit",month:"2-digit",year:"numeric"});
    } catch { return "วัน / เดือน / ปี"; }
  };

  const renderCustomIcon = () => {
    if (!customCat?.icon) return <IconEtc active={category === "อื่นๆ"} />;
    const Cmp = ICON_MAP[customCat.icon];
    if (!Cmp) return <IconEtc active={category === "อื่นๆ"} />;
    return <Cmp className={`icon ${category === "อื่นๆ" ? "icon-active" : ""} lucide`} size={20} strokeWidth={2} />;
  };

  // ให้ปุ่มวันที่เปิด picker ได้ในบาง browser
  const dateBtnRef = useRef<HTMLInputElement>(null);
  const openDatePicker = (e?: React.MouseEvent | React.KeyboardEvent) => {
    e?.preventDefault();
    const el = dateBtnRef.current;
    if (!el) return;
    if (typeof (el as any).showPicker === "function") {
      (el as any).showPicker();
    } else {
      el.click();
      el.focus();
    }
  };

  return (
    <div className="calc-wrap">
      <header className="topbar"></header>

      <div className="type-pill" style={{ position:"relative" }}>
        <button className="pill" onClick={() => setMenuOpen(o=>!o)}>
          <span>รายได้</span><ChevronDown/>
        </button>
        {menuOpen && (
          <div onMouseLeave={() => setMenuOpen(false)}
               style={{position:"absolute",top:"calc(100% + 8px)",left:"50%",transform:"translateX(-50%)",background:"#fff",
                       border:"1px solid rgba(0,0,0,.06)",borderRadius:14,boxShadow:"0 10px 20px rgba(0,0,0,.08)",padding:6,minWidth:220,zIndex:20}}>
            <button onClick={()=>navigate("/expense")}
                    style={{width:"100%",textAlign:"center",padding:"10px 12px",border:0,background:"transparent",borderRadius:10,cursor:"pointer",fontWeight:600,color:"var(--ink)" as any}}
                    onMouseEnter={e=>e.currentTarget.style.background="#f3fbf8"}
                    onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
              ค่าใช้จ่าย
            </button>
          </div>
        )}
      </div>

      <div className="category-row">
        <button className={`cat ${category==="ค่าขนม"?"active":""}`} onClick={()=>{ setCategory("ค่าขนม"); setCustomCat(null); }}>
          <HandCoins className={`icon ${category==="ค่าขนม"?"icon-active":""} lucide`} size={20} strokeWidth={2} />
          <span>ค่าขนม</span>
        </button>
        <button className={`cat ${category==="ทำงาน"?"active":""}`} onClick={()=>{ setCategory("ทำงาน"); setCustomCat(null); }}>
          <Banknote className={`icon ${category==="ทำงาน"?"icon-active":""} lucide`} size={20} strokeWidth={2} />
          <span>ทำงาน</span>
        </button>
        <button className={`cat ${category==="ลงทุน"?"active":""}`} onClick={()=>{ setCategory("ลงทุน"); setCustomCat(null); }}>
          <Bitcoin className={`icon ${category==="ลงทุน"?"icon-active":""} lucide`} size={20} strokeWidth={2} />
          <span>ลงทุน</span>
        </button>
        <button className={`cat ${category==="อื่นๆ"?"active":""}`} onClick={()=>{ setCategory("อื่นๆ"); navigate("/customincome"); }}>
          {renderCustomIcon()}
          <span>{category==="อื่นๆ" && customCat?.label ? customCat.label : "อื่นๆ"}</span>
        </button>
      </div>

      <div
        className="amount"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "baseline",
          gap: 6,
          width: "100%",
        }}
      >
        <span className="num">{amount}</span>
        <span className="currency">฿</span>
      </div>

      <div className="segments" style={{ position:"relative" }}>
        <button
          type="button"
          className="seg date-seg"
          onClick={openDatePicker}
          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && openDatePicker(e)}
          style={{ display:"inline-flex", alignItems:"center", gap:6, cursor:"pointer", position:"relative" }}
        >
          <CalendarDays className="icon" size={18} />
          <span>{date ? formatDate(date) : "วัน / เดือน / ปี"}</span>
          <input
            ref={dateBtnRef}
            type="date"
            value={date}
            onChange={(e)=>setDate(e.target.value)}
            style={{ position:"absolute", inset:0, opacity:0, pointerEvents:"none" }}
            tabIndex={-1}
            aria-hidden="true"
          />
        </button>

        <button className="seg" onClick={()=>navigate("/accountselect",{ state:{ from:"/income" } })}>
          {payment ? payment.name : "ประเภทการชำระเงิน"}
        </button>
      </div>

      <div className="inputs">
        <div className="input"><ClipboardList size={18} strokeWidth={2} className="icon"/><input value={note} onChange={e=>setNote(e.target.value)} placeholder="โน้ต"/></div>
        <div className="input"><MapPin size={18} strokeWidth={2} className="icon"/><input value={place} onChange={e=>setPlace(e.target.value)} placeholder="สถานที่"/></div>
      </div>

      <div className="keypad">
        {pad.map((k,i)=>(
          <button key={i} className={`key ${k==="⌫"?"danger":""}`} onClick={()=> (k==="⌫"? onTapKey("⌫"): onTapKey(k))}>
            {k==="⌫"? <IconBackspace/> : k}
          </button>
        ))}
      </div>

      <div className="confirm"><button className="ok-btn" onClick={onConfirm}><IconCheck/></button></div>
      <BottomNav/>
    </div>
  );
}
