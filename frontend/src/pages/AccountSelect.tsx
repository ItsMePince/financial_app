// src/pages/AccountSelect.tsx
// @ts-nocheck
import { useMemo, useState } from "react";
import "./AccountSelect.css";
import BottomNav from "./buttomnav";
import { useNavigate } from "react-router-dom";
import { usePaymentMethod } from "../PaymentMethodContext";

type FilterKey = "ALL" | "CASH" | "BANK" | "CREDIT";
type ItemType = "bank" | "cash" | "credit";

type AccountItem = {
  id: string;
  label: string;
  type: ItemType;
  favorite: boolean;
  favoritedAt?: number;
};

const initialItems: AccountItem[] = [
  { id: "scb",   label: "ธ.ไทยพาณิชย์", type: "bank",   favorite: true,  favoritedAt: 1 },
  { id: "kbank", label: "ธ.กสิกรไทย",   type: "bank",   favorite: true,  favoritedAt: 2 },
  { id: "gsb",   label: "ธ.ออมสิน",     type: "bank",   favorite: true,  favoritedAt: 3 },
  { id: "cash",  label: "เงินสด",        type: "cash",   favorite: false },
  { id: "ktc",   label: "บัตรKTC",       type: "credit", favorite: false },
];

const filterLabel: Record<FilterKey, string> = {
  ALL: "ทั้งหมด",
  CASH: "เงินสด",
  BANK: "ธนาคาร",
  CREDIT: "บัตรเครดิต",
};

export default function AccountSelect() {
  const [filter, setFilter] = useState<FilterKey>("ALL");
  const [menuOpen, setMenuOpen] = useState(false);
  const [items, setItems] = useState<AccountItem[]>(initialItems);

  const navigate = useNavigate();
  const { setPayment } = usePaymentMethod(); // ✅ context สำหรับส่งค่ากลับไปหน้า Expense

  const toggleFavorite = (id: string) => {
    setItems((prev) => {
      const now = Date.now();
      return prev.map((it) =>
        it.id === id
          ? {
              ...it,
              favorite: !it.favorite,
              favoritedAt: !it.favorite ? now : undefined,
            }
          : it
      );
    });
  };

  const sortedAndFiltered = useMemo(() => {
    const byFilter = (it: AccountItem) => {
      if (filter === "ALL") return true;
      if (filter === "CASH") return it.type === "cash";
      if (filter === "BANK") return it.type === "bank";
      if (filter === "CREDIT") return it.type === "credit";
      return true;
    };

    const favRank = (a: AccountItem) => (a.favorite ? 0 : 1);
    const favOrder = (a?: number, b?: number) => {
      if (a == null && b == null) return 0;
      if (a == null) return 1;
      if (b == null) return -1;
      return a - b;
    };

    return [...items]
      .filter(byFilter)
      .sort((a, b) => {
        const rank = favRank(a) - favRank(b);
        if (rank !== 0) return rank;
        const byTime = favOrder(a.favoritedAt, b.favoritedAt);
        if (byTime !== 0) return byTime;
        return a.label.localeCompare(b.label, "th");
      });
  }, [items, filter]);

  // ✅ แตะรายการเพื่อเลือกและย้อนกลับไปหน้า Expense
  const pick = (it: AccountItem) => {
    setPayment({ id: it.id, name: it.label, favorite: it.favorite });
    navigate(-1);
  };

  const gotoAddPage = () => alert("ไปหน้าเพิ่มบัญชี/แหล่งเงิน (Add)");

  return (
    <div className="screen">
      {/* Dropdown filter */}
      <div className="dropdown">
        <button
          className="dropdown__button"
          onClick={() => setMenuOpen((v) => !v)}
          aria-haspopup="listbox"
          aria-expanded={menuOpen}
        >
          <span>{filterLabel[filter]}</span>
          <svg className={`chev ${menuOpen ? "up" : ""}`} width="20" height="20" viewBox="0 0 24 24">
            <path d="M7 10l5 5 5-5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {menuOpen && (
          <ul
            className="dropdown__menu"
            role="listbox"
            onMouseLeave={() => setMenuOpen(false)}
          >
            {(["ALL", "CASH", "BANK", "CREDIT"] as FilterKey[]).map((k, i) => (
              <li
                key={k}
                role="option"
                aria-selected={filter === k}
                className={`dropdown__option ${i > 0 ? "with-sep" : ""}`}
                onClick={() => {
                  setFilter(k);
                  setMenuOpen(false);
                }}
              >
                {filterLabel[k]}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* List */}
      <div className="list">
        {sortedAndFiltered.length === 0 ? (
          <div className="empty">ไม่มีรายการ</div>
        ) : (
          sortedAndFiltered.map((it) => (
            <button
              key={it.id}
              className="card"
              onClick={() => pick(it)} // ✅ เลือกแล้วกลับ
            >
              <span className="card__label">{it.label}</span>
              <Star
                active={it.favorite}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(it.id);
                }}
              />
            </button>
          ))
        )}
      </div>

      {/* (ถ้าต้องการ) ปุ่มเพิ่มบัญชี
      <button className="add-btn" onClick={gotoAddPage}>+ เพิ่มบัญชี</button>
      */}

      <BottomNav />
    </div>
  );
}

function Star({
  active,
  onClick,
}: {
  active: boolean;
  onClick: (e: React.MouseEvent) => void;
}) {
  return (
    <span
      className={`star ${active ? "on" : "off"}`}
      onClick={onClick}
      aria-label={active ? "Unfavorite" : "Favorite"}
    >
      <svg width="22" height="22" viewBox="0 0 24 24">
        <path
          d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.62L12 2 9.19 8.62 2 9.24l5.46 4.73L5.82 21z"
          fill={active ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth={active ? 0 : 1.6}
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}
