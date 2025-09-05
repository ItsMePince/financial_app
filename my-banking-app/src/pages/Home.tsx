import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import BottomNav from "./buttomnav";
import "./buttomnav.css";
import "./Home.css";

import {
  Utensils,
  Building2,
  Landmark,
  CreditCard,
  Wallet,
  PiggyBank,
  Coins,
  MoreVertical,
  Edit2,
  Trash2,
} from "lucide-react";

const ICON_MAP: Record<string, React.ComponentType<any>> = {
  bank: Building2,
  banknote: Coins,
  landmark: Landmark,
  credit: CreditCard,
  wallet: Wallet,
  piggy: PiggyBank,
  coins: Coins,
};

type Account = { name: string; amount: number | string; iconKey?: string };

function loadAccounts(): Account[] {
  try {
    const raw = localStorage.getItem("accounts");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  return [
    { name: "ไทยพาณิชย์", amount: 20000, iconKey: "bank" },
    { name: "กสิกรไทย", amount: 20000, iconKey: "wallet" },
  ];
}

function saveAccounts(list: Account[]) {
  localStorage.setItem("accounts", JSON.stringify(list));
}

function formatTH(n: number) {
  return n.toLocaleString("th-TH");
}

export default function Home() {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [openMenu, setOpenMenu] = useState<number | null>(null);

  useEffect(() => {
    setAccounts(loadAccounts());
  }, []);

  // ✅ คำนวณผลรวมทุกบัญชี
  const totalAmount = accounts.reduce((sum, a) => {
    const num =
      typeof a.amount === "string" ? parseFloat(a.amount || "0") : Number(a.amount || 0);
    return sum + (Number.isFinite(num) ? num : 0);
  }, 0);

  const handleDelete = (idx: number) => {
    const acc = accounts[idx];
    const ok = window.confirm(`ลบบัญชี “${acc.name}” ใช่ไหม?`);
    if (!ok) return;
    const next = accounts.filter((_, i) => i !== idx);
    setAccounts(next);
    saveAccounts(next);
    setOpenMenu(null);
  };

  const handleEdit = (idx: number) => {
    const acc = accounts[idx];
    navigate("/accountnew", {
      state: { mode: "edit", index: idx, account: acc },
    });
  };

  useEffect(() => {
    const onDocClick = () => setOpenMenu(null);
    if (openMenu !== null) {
      document.addEventListener("click", onDocClick);
      return () => document.removeEventListener("click", onDocClick);
    }
  }, [openMenu]);

  return (
    <div className="App">
      <div className="main-content">
        {/* Balance Card */}
        <div className="balance-card">
          <div className="balance-display">
            <p className="balance-label">เงินรวม</p>
            <p className="balance-label">
              {new Date().getMonth() + 1}/{new Date().getFullYear()}
            </p>
            {/* ✅ ใช้ยอดรวมจริงแทนเลขฮาร์ดโค้ด */}
            <p className="balance-amount">{formatTH(totalAmount)} บาท</p>
          </div>

          {/* Action Buttons (ค่าเดโมตามเดิม) */}
          <div className="action-buttons">
            <button className="action-button">
              <div className="action-icon">
                <span style={{ fontSize: "18px", fontWeight: "bold", color: "#374151" }}>
                  1000
                </span>
              </div>
              <span className="action-label">ทั้งหมด</span>
            </button>

            <button className="action-button">
              <div className="action-icon">
                <span style={{ fontSize: "18px", fontWeight: "bold", color: "#374151" }}>
                  1200
                </span>
              </div>
              <span className="action-label">รายได้</span>
            </button>

            <button className="action-button">
              <div className="action-icon">
                <span style={{ fontSize: "18px", fontWeight: "bold", color: "#ef4444" }}>
                  -200
                </span>
              </div>
              <span className="action-label">ค่าใช้จ่าย</span>
            </button>
          </div>
        </div>

        {/* Recent Transactions Header */}
        <div className="transaction-header">
          <span className="transaction-title active">ล่าสุด</span>
          <Link to="/summary" className="transaction-link">
            ดูทั้งหมด
          </Link>
        </div>

        {/* Recent Transaction */}
        <div className="transaction-item">
          <div className="transaction-info">
            <div className="transaction-avatar">
              <Utensils className="tx-icon" />
            </div>
            <span className="transaction-description">ซื้อหมูกรอบ</span>
          </div>
          <span className="transaction-amount">-200</span>
        </div>

        {/* Account cards */}
        <div className="category-grid">
          {accounts.map((acc, idx) => {
            const Icon = ICON_MAP[acc.iconKey || "bank"] || Building2;
            const isOpen = openMenu === idx;
            const amt =
              typeof acc.amount === "string" ? parseFloat(acc.amount || "0") : Number(acc.amount || 0);

            return (
              <div className="category-card has-more" key={acc.name + idx}>
                <button
                  className="more-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    setOpenMenu((cur) => (cur === idx ? null : idx));
                  }}
                  aria-label="More actions"
                >
                  <MoreVertical size={18} />
                </button>

                {isOpen && (
                  <div className="more-menu" onClick={(e) => e.stopPropagation()}>
                    <button className="more-item" onClick={() => handleEdit(idx)}>
                      <Edit2 size={16} />
                      <span>แก้ไข</span>
                    </button>
                    <button className="more-item danger" onClick={() => handleDelete(idx)}>
                      <Trash2 size={16} />
                      <span>ลบ</span>
                    </button>
                  </div>
                )}

                <div className="category-icon">
                  <Icon className="cat-icon" />
                </div>
                <p className="category-name">{acc.name}</p>
                <p className="category-amount">{formatTH(amt)} บาท</p>
              </div>
            );
          })}

          {/* ปุ่ม + ไปหน้า accountnew */}
          <Link to="/accountnew" className="category-card">
            <div
              className="category-icon"
              style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              <span style={{ fontSize: "2rem", color: "#374151" }}>+</span>
            </div>
          </Link>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
