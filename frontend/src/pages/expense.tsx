import { api } from "../api";
// src/pages/Expense.tsx
// @ts-nocheck
import React, { useEffect, useMemo, useRef, useState } from "react";
import "./expense.css";
import {
    ClipboardList, MapPin, CalendarDays,
    Utensils, Pizza, Drumstick, Coffee, Beer, CupSoda, IceCream, Candy, Cake,
    Car, Bus, Bike, Plane, Train, Ship, Fuel, Map, MapPin as MapPinIcon,
    Stethoscope, HeartPulse, Activity, Pill, Hospital, Ambulance,
    ShoppingCart, ShoppingBag, Gift, Tag, Shirt, CreditCard, SoapDispenserDroplet,
    Briefcase, Laptop, Calculator, BarChart, Coins, Wallet,
    BookOpen, GraduationCap, Pencil,
    Dumbbell, Goal, Trophy, Volleyball,
    Dog, Cat, Fish, Bird,
    Home, Sofa, Bed, Wrench, Hammer,
    Gamepad, Music, Film, Popcorn, Clapperboard, Sprout,
} from "lucide-react";
import BottomNav from "./buttomnav";
import { useNavigate } from "react-router-dom";
import { useTempCategory } from "../TempCategoryContext";
import { usePaymentMethod } from "../PaymentMethodContext";

const DRAFT_KEY = "expense_draft_v1";

/* ================= Icons ================= */
const ChevronDown = () => (
    <svg viewBox="0 0 24 24" className="icon">
        <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

// รับ prop อะไรก็ได้ (เพื่อให้ใช้ className/size ได้)
const IconEtc: React.FC<React.SVGProps<SVGSVGElement> & { active?: boolean }> = ({
                                                                                     active = false,
                                                                                     ...svgProps
                                                                                 }) => (
    <svg viewBox="0 0 24 24" className={`icon ${active ? "icon-active" : ""}`} {...svgProps}>
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
/* ========================================= */

type Category = "อาหาร" | "การเดินทาง" | "ของขวัญ" | "อื่น ๆ";

const getTodayISO = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}-${String(now.getDate()).padStart(2,"0")}`;
};

/* map iconKey -> component */
const customIconByKey: Record<string, React.ComponentType<any>> = {
    food: Utensils, pizza: Pizza, drumstick: Drumstick, coffee: Coffee, beer: Beer,
    cupsoda: CupSoda, icecream: IceCream, candy: Candy, cake: Cake,
    car: Car, bus: Bus, bike: Bike, plane: Plane, train: Train, ship: Ship,
    fuel: Fuel, map: Map, mappin: MapPinIcon,
    stethoscope: Stethoscope, heart: HeartPulse, activity: Activity,
    pill: Pill, hospital: Hospital, ambulance: Ambulance,
    cart: ShoppingCart, bag: ShoppingBag, gift: Gift, tag: Tag, shirt: Shirt, creditcard: CreditCard, soap: SoapDispenserDroplet,
    briefcase: Briefcase, laptop: Laptop, calculator: Calculator, barchart: BarChart, coins: Coins, wallet: Wallet,
    book: BookOpen, graduation: GraduationCap, pencil: Pencil,
    dumbbell: Dumbbell, goal: Goal, trophy: Trophy, volleyball: Volleyball,
    dog: Dog, cat: Cat, fish: Bird,
    home: Home, sofa: Sofa, bed: Bed, wrench: Wrench, hammer: Hammer,
    game: Gamepad, music: Music, film: Film, popcorn: Popcorn, clapper: Clapperboard, sprout: Sprout,
    more: IconEtc,
};

/* ไอคอนเริ่มต้นตามหมวดมาตรฐาน */
const defaultIconKeyByCategory: Record<Category, string> = {
    "อาหาร": "food",
    "การเดินทาง": "car",
    "ของขวัญ": "gift",
    "อื่น ๆ": "more",
};

export default function Expense() {
    const navigate = useNavigate();
    const { tempCategory, clearTempCategory } = useTempCategory();

    // ทำให้ type ปลอดภัยกับหลาย implementation ของ context
    const pm: any = usePaymentMethod();
    const payment = pm?.payment;
    const clearPayment = pm?.clearPayment;
    const setPayment = pm?.setPayment;

    const [category, setCategory] = useState<Category>(() => (tempCategory ? "อื่น ๆ" : "อาหาร"));
    const [amount, setAmount] = useState<string>("0");
    const [note, setNote] = useState<string>("");
    const [place, setPlace] = useState<string>("");
    const [date, setDate] = useState<string>(() => getTodayISO());

    const [typeOpen, setTypeOpen] = useState(false);
    const [entryType] = useState<"รายจ่าย" | "รายรับ">("รายจ่าย");
    const menuOptions: Array<"รายจ่าย" | "รายรับ"> = entryType === "รายจ่าย" ? ["รายรับ"] : ["รายจ่าย"];
    const onSelectType = (target: "รายจ่าย" | "รายรับ") => {
        setTypeOpen(false);
        navigate(target === "รายรับ" ? "/income" : "/expense");
    };

    useEffect(() => { if (tempCategory) setCategory("อื่น ๆ"); }, [tempCategory]);

    useEffect(() => {
        try {
            const raw = sessionStorage.getItem(DRAFT_KEY);
            if (!raw) return;
            const d = JSON.parse(raw);
            if (d.category) setCategory(d.category);
            if (typeof d.amount === "string") setAmount(d.amount);
            if (typeof d.note === "string") setNote(d.note);
            if (typeof d.place === "string") setPlace(d.place);
            if (typeof d.date === "string") setDate(d.date);
        } catch {}
    }, []);

    useEffect(() => {
        const d = { category, amount, note, place, date };
        sessionStorage.setItem(DRAFT_KEY, JSON.stringify(d));
    }, [category, amount, note, place, date]);

    const dateRef = useRef<HTMLInputElement>(null);
    const openDatePicker = (e?: React.MouseEvent | React.KeyboardEvent) => {
        e?.preventDefault();
        const el = dateRef.current;
        if (!el) return;
        if (typeof (el as any).showPicker === "function") {
            (el as any).showPicker();
        } else {
            el.click();
            el.focus();
        }
    };

    const pad = useMemo(() => ["1","2","3","4","5","6","7","8","9",".","0","⌫"], []);
    const onTapKey = (k: string) => {
        if (k === "⌫") return setAmount(a => (a.length <= 1 ? "0" : a.slice(0,-1)));
        if (k === ".")  return setAmount(a => (a.includes(".") ? a : a + "."));
        setAmount(a => (a === "0" ? k : a + k));
    };

    const resetForm = () => {
        setCategory("อาหาร"); setAmount("0"); setNote(""); setPlace("");
        setDate(getTodayISO()); clearTempCategory();
        if (typeof clearPayment === "function") clearPayment();
        else if (typeof setPayment === "function") setPayment(null);
        sessionStorage.removeItem(DRAFT_KEY);
    };

    const onConfirm = async () => {
        if (!amount || amount === "0" || !note.trim() || !place.trim() || !date) {
            alert("กรอกข้อมูลให้ครบก่อนนะ");
            return;
        }

        const finalCategory =
            category === "อื่น ๆ" && tempCategory?.name ? tempCategory.name : category;

        const iconKey =
            category === "อื่น ๆ"
                ? (tempCategory?.iconKey || "more")
                : defaultIconKeyByCategory[category];

        const payload = {
            type: "EXPENSE",
            category: finalCategory,
            amount: parseFloat(amount || "0"),
            note, place, date,
            paymentMethod: payment?.name ?? null,
            iconKey,
        };

        try {
            const res = await fetch(`/api/expenses`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
                credentials: "include",
            });
            if (!res.ok) throw new Error(await res.text());
            alert("บันทึกเรียบร้อย ✅");
            resetForm();
        } catch (err:any) {
            console.error(err);
            alert("บันทึกไม่สำเร็จ: " + (err?.message ?? ""));
        }
    };

    const formatDate = (iso: string) => {
        try {
            const d = new Date(iso);
            return d.toLocaleDateString("th-TH",{day:"2-digit",month:"2-digit",year:"numeric"});
        } catch { return "วัน / เดือน / ปี"; }
    };

    const otherLabel = tempCategory?.name || "อื่น ๆ";
    // ให้ชนิดเป็น ComponentType<any> เสมอ เพื่อรับ props ใดๆ ได้
    const OtherIcon: React.ComponentType<any> = useMemo(() => {
        const key = tempCategory?.iconKey;
        return (key && customIconByKey[key]) ? customIconByKey[key] : (IconEtc as React.ComponentType<any>);
    }, [tempCategory?.iconKey]);

    return (
        <div className="calc-wrap">
            <div className="type-pill" style={{ position:"relative" }}>
                <button className="pill" onClick={() => setTypeOpen(o=>!o)}>
                    <span>{entryType}</span><ChevronDown/>
                </button>
                {typeOpen && (
                    <div
                        onMouseLeave={() => setTypeOpen(false)}
                        style={{
                            position:"absolute",top:"calc(100% + 8px)",left:"50%",transform:"translateX(-50%)",
                            background:"#fff",border:"1px solid rgba(0,0,0,.06)",borderRadius:14,
                            boxShadow:"0 10px 20px rgba(0,0,0,.08)",padding:6,minWidth:200,zIndex:20
                        }}>
                        {menuOptions.map(op => (
                            <button
                                key={op}
                                onClick={() => onSelectType(op)}
                                style={{
                                    width:"100%",textAlign:"center",padding:"10px 12px",border:0,background:"transparent",
                                    borderRadius:10,cursor:"pointer",fontWeight:600,color:"var(--ink)" as any
                                }}
                                onMouseEnter={e=>e.currentTarget.style.background="#f3fbf8"}
                                onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                                {op}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div className="category-row">
                <button className={`cat ${category==="อาหาร"?"active":""}`} onClick={()=>setCategory("อาหาร")}>
                    <Utensils className={`icon ${category==="อาหาร"?"icon-active":""} lucide`} size={20} strokeWidth={2}/>
                    <span>อาหาร</span>
                </button>
                <button className={`cat ${category==="การเดินทาง"?"active":""}`} onClick={()=>setCategory("การเดินทาง")}>
                    <Car className={`icon ${category==="การเดินทาง"?"icon-active":""} lucide`} size={20} strokeWidth={2}/>
                    <span>การเดินทาง</span>
                </button>
                <button className={`cat ${category==="ของขวัญ"?"active":""}`} onClick={()=>setCategory("ของขวัญ")}>
                    <Gift className={`icon ${category==="ของขวัญ"?"icon-active":""} lucide`} size={20} strokeWidth={2}/>
                    <span>ของขวัญ</span>
                </button>
                <button
                    className={`cat ${category==="อื่น ๆ"?"active":""}`}
                    onClick={()=>{
                        setCategory("อื่น ๆ");
                        sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ category:"อื่น ๆ", amount, note, place, date }));
                        navigate("/customoutcome");
                    }}>
                    <OtherIcon className={`icon ${category==="อื่น ๆ"?"icon-active":""} lucide`} size={20} strokeWidth={2}/>
                    <span>{otherLabel}</span>
                </button>
            </div>

            <div className="amount">
                <span className="num">{amount}</span><span className="currency">฿</span>
            </div>

            <div className="segments" style={{ position:"relative", display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                <button
                    type="button"
                    className="seg date-seg"
                    onClick={openDatePicker}
                    onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && openDatePicker(e)}
                    style={{ display:"inline-flex", alignItems:"center", gap:6, cursor:"pointer", position:"relative" }}
                >
                    <CalendarDays className="icon" size={18}/>
                    <span>{date ? formatDate(date) : "วัน / เดือน / ปี"}</span>

                    <input
                        ref={dateRef}
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        style={{ position: "absolute", inset: 0, opacity: 0, pointerEvents: "none" }}
                        tabIndex={-1}
                        aria-hidden="true"
                    />
                </button>

                <button
                    className="seg"
                    onClick={() => {
                        sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ category, amount, note, place, date }));
                        navigate("/accountselect");
                    }}>
                    {payment?.name ?? "การชำระเงิน"}
                </button>
            </div>

            <div className="inputs">
                <div className="input">
                    <ClipboardList size={18} strokeWidth={2} className="icon"/>
                    <input value={note} onChange={e=>setNote(e.target.value)} placeholder="รายละเอียด"/>
                </div>
                <div className="input">
                    <MapPin size={18} strokeWidth={2} className="icon"/>
                    <input value={place} onChange={e=>setPlace(e.target.value)} placeholder="สถานที่"/>
                </div>
            </div>

            <div className="keypad">
                {pad.map((k,i)=>(
                    <button
                        key={i}
                        className={`key ${k==="⌫"?"danger":""}`}
                        onClick={()=> (k==="⌫"? onTapKey("⌫"): onTapKey(k))}>
                        {k==="⌫"? <IconBackspace/> : k}
                    </button>
                ))}
            </div>

            <div className="confirm">
                <button className="ok-btn" onClick={onConfirm}><IconCheck/></button>
            </div>

            <BottomNav/>
        </div>
    );
}
