import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./accountnew.css";
import {
  Building2, Banknote, Landmark, CreditCard, Wallet, PiggyBank, Coins,
} from "lucide-react";
import BottomNav from "./buttomnav";

type AccountType = "เงินสด" | "ธนาคาร" | "บัตรเครดิต";
const ACCOUNT_TYPES: AccountType[] = ["เงินสด", "ธนาคาร", "บัตรเครดิต"];

const ICONS = [
  { key: "bank",     label: "ธนาคาร",   Icon: Building2 },
  { key: "banknote", label: "ธนบัตร",  Icon: Banknote },
  { key: "landmark", label: "ออมทรัพย์", Icon: Landmark },
  { key: "credit",   label: "บัตรเครดิต", Icon: CreditCard },
  { key: "wallet",   label: "กระเป๋าเงิน", Icon: Wallet },
  { key: "piggy",    label: "กระปุก",   Icon: PiggyBank },
  { key: "coins",    label: "เหรียญ",   Icon: Coins },
] as const;

type Account = { name: string; amount: number; iconKey?: string; type?: AccountType };

function loadAccounts(): Account[] {
  try {
    const raw = localStorage.getItem("accounts");
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
function saveAccounts(list: Account[]) {
  localStorage.setItem("accounts", JSON.stringify(list));
}

export default function AccountNew() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const editState = state as
    | { mode: "edit"; index: number; account: Account }
    | undefined;

  const [name, setName] = useState("");
  const [type, setType] = useState<AccountType | "">("");
  const [amount, setAmount] = useState<string>("");
  const [iconKey, setIconKey] = useState<string>("bank");
  const [openType, setOpenType] = useState(false);

  const SelectedIcon = useMemo(
    () => ICONS.find((i) => i.key === iconKey)?.Icon ?? Building2,
    [iconKey]
  );

  // เติมค่าถ้าเป็นโหมดแก้ไข
  useEffect(() => {
    if (editState?.mode === "edit" && editState.account) {
      const a = editState.account;
      setName(a.name ?? "");
      setAmount(
        (typeof a.amount === "number" && !Number.isNaN(a.amount))
          ? String(a.amount)
          : ""
      );
      setIconKey(a.iconKey ?? "bank");
      setType(a.type ?? "");
    }
  }, [editState]);

  // ปิด dropdown เมื่อคลิกข้างนอก
  const typeRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!typeRef.current) return;
      if (!typeRef.current.contains(e.target as Node)) setOpenType(false);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  const amountOnlyNumber = (v: string) => v.replace(/[^\d.]/g, "");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const amt = parseFloat(amount || "0");
    if (!name.trim() || !type || Number.isNaN(amt)) {
      alert("กรอกข้อมูลให้ครบและจำนวนเงินให้ถูกต้องก่อนน้าา");
      return;
    }

    const nextItem: Account = { name: name.trim(), amount: amt, iconKey, type: type as AccountType };
    const list = loadAccounts();

    if (editState?.mode === "edit" && Number.isInteger(editState.index) && editState.index >= 0 && editState.index < list.length) {
      // แก้ไข
      list[editState.index] = nextItem;
    } else {
      // เพิ่มใหม่
      list.push(nextItem);
    }
    saveAccounts(list);
    navigate("/Home"); // กลับหน้าแรก
  }

  return (
    <div className="accnew-wrap">
      <h1 className="title">{editState?.mode === "edit" ? "แก้ไขบัญชี" : "สร้างบัญชี"}</h1>

      <form className="form" onSubmit={handleSubmit}>
        {/* ชื่อบัญชี */}
        <label className="row">
          <span className="label">ชื่อบัญชี</span>
          <input
            className="input text"
            placeholder="ชื่อบัญชี"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={40}
          />
        </label>

        {/* ประเภทบัญชี */}
        <div className="row" ref={typeRef}>
          <span className="label">ประเภทบัญชี</span>
          <div className="select" onClick={() => setOpenType((o) => !o)}>
            <span className={type ? "" : "placeholder"}>{type || "ประเภท"}</span>
            <span className="chev">▾</span>
          </div>
          {openType && (
            <div className="dropdown">
              {ACCOUNT_TYPES.map((t) => (
                <button
                  type="button"
                  key={t}
                  className={`opt ${type === t ? "active" : ""}`}
                  onClick={() => {
                    setType(t);
                    setOpenType(false);
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ไอคอน */}
        <div className="row">
          <span className="label">ไอคอน</span>
          <div className="icon-current">
            <SelectedIcon className="icon" />
          </div>
        </div>
        <div className="icon-grid">
          {ICONS.map(({ key, Icon, label }) => (
            <button
              type="button"
              key={key}
              className={`icon-chip ${iconKey === key ? "active" : ""}`}
              onClick={() => setIconKey(key)}
              aria-label={label}
              title={label}
            >
              <Icon className="icon" />
            </button>
          ))}
        </div>

        {/* จำนวนเงิน */}
        <label className="row">
          <span className="label">จำนวนเงิน</span>
          <div className="amount-wrap">
            <input
              className="input number"
              placeholder="บาท"
              inputMode="decimal"
              pattern="[0-9.]*"
              value={amount}
              onChange={(e) => setAmount(amountOnlyNumber(e.target.value))}
            />
            <span className="unit">บาท</span>
          </div>
        </label>

        <div className="actions">
          <button className="primary" type="submit">
            {editState?.mode === "edit" ? "บันทึกการแก้ไข" : "ยืนยัน"}
          </button>
        </div>
      </form>

      <BottomNav />
    </div>
  );
}
