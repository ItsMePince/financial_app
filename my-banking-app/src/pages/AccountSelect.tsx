import { useMemo, useState } from "react";
import "./App.css";

type FilterKey = "ALL" | "CASH" | "BANK" | "CREDIT";

type ItemType = "bank" | "cash" | "credit";

type AccountItem = {
  id: string;
  label: string;
  type: ItemType;
  favorite: boolean;
  // ใช้จัดลำดับรายการโปรดให้ต่อท้ายกันตามเวลาที่ติ๊ก
  favoritedAt?: number;
};

const initialItems: AccountItem[] = [
  { id: "scb", label: "ธ.ไทยพาณิชย์", type: "bank", favorite: true, favoritedAt: 1 },
  { id: "kbank", label: "ธ.กสิกรไทย", type: "bank", favorite: true, favoritedAt: 2 },
  { id: "gsb", label: "ธ.ออมสิน", type: "bank", favorite: true, favoritedAt: 3 },
  { id: "cash", label: "เงินสด", type: "cash", favorite: false },
  { id: "ktc", label: "บัตรKTC", type: "credit", favorite: false },
];

const filterLabel: Record<FilterKey, string> = {
  ALL: "ทั้งหมด",
  CASH: "เงินสด",
  BANK: "ธนาคาร",
  CREDIT: "บัตรเครดิต",
};

export default function App() {
  const [ownerName] = useState("Amanda");
  const [filter, setFilter] = useState<FilterKey>("ALL");
  const [menuOpen, setMenuOpen] = useState(false);
  const [items, setItems] = useState<AccountItem[]>(initialItems);

  // กดดาว: toggle + กำหนดเวลาเพื่อใช้เรียงให้ต่อท้ายรายการโปรดเดิม
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

  // จัดลำดับ: favorite มาก่อน (เรียงตาม favoritedAt เพิ่มขึ้น = ต่อท้าย), ที่เหลือเรียงตาม label
  const sortedAndFiltered = useMemo(() => {
    const byFilter = (it: AccountItem) => {
      if (filter === "ALL") return true;
      if (filter === "CASH") return it.type === "cash";
      if (filter === "BANK") return it.type === "bank";
      if (filter === "CREDIT") return it.type === "credit";
      return true;
    };

    const fav = (a: AccountItem) => (a.favorite ? 0 : 1);
    const favOrder = (a?: number, b?: number) => {
      if (a == null && b == null) return 0;
      if (a == null) return 1;
      if (b == null) return -1;
      return a - b; // เวลาน้อยกว่า = ถูกติ๊กก่อน = อยู่ข้างหน้า
    };

    return [...items]
      .filter(byFilter)
      .sort((a, b) => {
        const favRank = fav(a) - fav(b);
        if (favRank !== 0) return favRank;
        const byFavTime = favOrder(a.favoritedAt, b.favoritedAt);
        if (byFavTime !== 0) return byFavTime;
        return a.label.localeCompare(b.label, "th");
      });
  }, [items, filter]);

  const gotoAddPage = () => {
    // แทนจริงอาจใช้ router; ตอนนี้เดโมด้วย alert
    alert("ไปหน้าเพิ่มบัญชี/แหล่งเงิน (Add)");
  };

  return (
    <div className="screen">
      {/* Header */}
      <header className="header">
        <div className="avatar">A</div>
        <div className="title">{ownerName}</div>
      </header>

      {/* Dropdown filter */}
      <div className="dropdown">
        <button
          className="dropdown__button"
          onClick={() => setMenuOpen((v) => !v)}
          aria-haspopup="listbox"
          aria-expanded={menuOpen}
        >
          <span>{filterLabel[filter]}</span>
          <svg
            className={`chev ${menuOpen ? "up" : ""}`}
            width="20"
            height="20"
            viewBox="0 0 24 24"
          >
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
        {sortedAndFiltered.map((it) => (
          <button key={it.id} className="card" onClick={() => { /* เลือกเข้าไปดูรายละเอียดได้ในอนาคต */ }}>
            <span className="card__label">{it.label}</span>
            <Star
              active={it.favorite}
              onClick={(e) => {
                e.stopPropagation();
                toggleFavorite(it.id);
              }}
            />
          </button>
        ))}
      </div>

      {/* Add Floating */}
      <div className="fab-wrap">
        <button className="fab" aria-label="Add" onClick={gotoAddPage}>
          +
        </button>
      </div>

      {/* Bottom actions (ไอคอนตัวอย่าง) */}
      <nav className="dock">
        <button className="dock__btn" aria-label="Calculator">
          <span className="icon">🧮</span>
        </button>
        <button className="dock__btn" aria-label="Home">
          <span className="icon">🏠</span>
        </button>
        <button className="dock__btn" aria-label="Stats">
          <span className="icon">📈</span>
        </button>
      </nav>
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
          fill={active ? "currentColor" : "none"}   // off = ไม่ถมสี
          stroke="currentColor"                     // ใช้สีจาก CSS
          strokeWidth={active ? 0 : 1.6}            // off = เส้นเดียวบางๆ
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}