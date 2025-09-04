import { useMemo, useState } from "react";
import "./accountnew.css";
import {
  Building2,
  Banknote,
  Landmark,
  CreditCard,
  Wallet,
  PiggyBank,
  Coins,
  Calculator,
  Home,
  LineChart,
} from "lucide-react";

type AccountType = "เงินสด" | "ธนาคาร" | "บัตรเครดิต";
const ACCOUNT_TYPES: AccountType[] = ["เงินสด", "ธนาคาร", "บัตรเครดิต"];

const ICONS = [
  { key: "bank", label: "ธนาคาร", Icon: Building2 },
  { key: "banknote", label: "ธนบัตร", Icon: Banknote },
  { key: "landmark", label: "ออมทรัพย์", Icon: Landmark },
  { key: "credit", label: "บัตรเครดิต", Icon: CreditCard },
  { key: "wallet", label: "กระเป๋าเงิน", Icon: Wallet },
  { key: "piggy", label: "กระปุก", Icon: PiggyBank },
  { key: "coins", label: "เหรียญ", Icon: Coins },
] as const;

export default function AccountNew() {
  const [name, setName] = useState("");
  const [type, setType] = useState<AccountType | "">("");
  const [amount, setAmount] = useState<string>("");
  const [iconKey, setIconKey] = useState<string>("bank");
  const [openType, setOpenType] = useState(false);

  const SelectedIcon = useMemo(
    () => ICONS.find((i) => i.key === iconKey)?.Icon ?? Building2,
    [iconKey]
  );

  const amountOnlyNumber = (v: string) => v.replace(/[^\d.]/g, "");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !type || amount.trim() === "") {
      alert("กรอกข้อมูลให้ครบก่อนน้าา");
      return;
    }
    alert("สร้างบัญชีสำเร็จจ ");
    // เด้งกลับหน้าหลัก (ไม่ใช้ router)
    window.location.assign("/");
  }

  return (
    <div className="accnew-wrap">
      <header className="accnew-topbar">
        <div className="avatar">A</div>
        <div className="owner">Amanda</div>
      </header>

      <h1 className="title">สร้างบัญชี</h1>

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
        <div className="row">
          <span className="label">ประเภทบัญชี</span>
          <div className="select" onClick={() => setOpenType((o) => !o)}>
            <span className={type ? "" : "placeholder"}>
              {type || "ประเภท"}
            </span>
            <span className="chev">▾</span>
          </div>
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
            ยืนยัน
          </button>
        </div>
      </form>

      <footer className="dock">
        <button className="dock-btn" type="button">
          <Calculator className="dock-icon" />
        </button>
        <button className="dock-btn" type="button">
          <Home className="dock-icon" />
        </button>
        <button className="dock-btn" type="button">
          <LineChart className="dock-icon" />
        </button>
      </footer>
    </div>
  );
}
