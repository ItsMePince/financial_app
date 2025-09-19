// src/pages/summary.tsx
import React, { useEffect, useState } from "react";
import {
  Utensils, X,
  Train, Wallet, CreditCard, Car, Bus, Bike,
  Coffee, Gift, Tag, ShoppingBag, ShoppingCart,
  Home, HeartPulse, Activity, Fuel, MapPin
} from "lucide-react";
import "./summary.css";
import BottomNav from "./buttomnav";
import "./buttomnav.css";

type ExpenseDTO = {
  id: number;
  type: "EXPENSE" | "INCOME";
  category: string;
  amount: number;
  note?: string | null;
  place?: string | null;
  date: string;
  paymentMethod?: string | null;
  iconKey?: string | null;
  userId?: number;
  username?: string;
};

type Item = {
  id: number;
  category: string;
  paymentMethod?: string;
  iconKey?: string;
  title: string;
  tag: string;
  amount: number;
  date?: string;
  isoDate: string;
  note?: string;
  account?: string;
  location?: string;
  type: "EXPENSE" | "INCOME";
};

type DayEntry = {
  isoKey: string;
  label: string;
  total: number;
  items: Item[];
};

const API_BASE =
  (import.meta as any)?.env?.VITE_API_BASE ||
  (import.meta as any)?.env?.REACT_APP_API_BASE ||
  "http://localhost:8081";

const ICONS: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  Utensils, Train, Wallet, CreditCard, Car, Bus, Bike, Coffee, Gift, Tag,
  ShoppingBag, ShoppingCart, Home, HeartPulse, Activity, Fuel, MapPin
};

const EN_ALIAS: Record<string, string> = {
  gift: "Gift",
  present: "Gift",
  wallet: "Wallet",
  cash: "Wallet",
  credit: "CreditCard",
  card: "CreditCard",
  food: "Utensils",
  restaurant: "Utensils",
  home: "Home",
  house: "Home",
  health: "HeartPulse",
  fuel: "Fuel",
  shopping: "ShoppingCart",
  bag: "ShoppingBag",
  map: "MapPin",
  train: "Train",
  car: "Car",
  bus: "Bus",
  bike: "Bike",
  coffee: "Coffee",
  tag: "Tag",
  activity: "Activity",
  handcoins: "Wallet"
};

const TH_ALIAS: Record<string, string> = {
  "ของขวัญ": "Gift",
  "อาหาร": "Utensils",
  "กาแฟ": "Coffee",
  "เดินทาง": "Train",
  "รถ": "Car",
  "รถยนต์": "Car",
  "รถเมล์": "Bus",
  "จักรยาน": "Bike",
  "บ้าน": "Home",
  "สุขภาพ": "HeartPulse",
  "น้ำมัน": "Fuel",
  "ช้อปปิ้ง": "ShoppingCart",
  "ซื้อของ": "ShoppingCart",
  "กระเป๋า": "ShoppingBag",
  "แผนที่": "MapPin",
  "บัตรเครดิต": "CreditCard",
  "เงินสด": "Wallet",
  "ธนาคาร": "Wallet",
  "ลงทุน": "Activity"
};

function normalizeIconKey(raw?: string | null, category?: string | null) {
  const tryDirect = (k: string) =>
    ICONS[k] ? k : Object.keys(ICONS).find((x) => x.toLowerCase() === k.toLowerCase());
  if (raw && raw.trim() !== "") {
    const k = raw.trim();
    const direct = tryDirect(k);
    if (direct) return direct;
    const alias = EN_ALIAS[k.toLowerCase()];
    if (alias) return alias;
  }
  if (category && category.trim() !== "") {
    const c = category.trim().toLowerCase();
    for (const [th, val] of Object.entries(TH_ALIAS)) {
      if (c.includes(th)) return val;
    }
    const direct = tryDirect(category);
    if (direct) return direct;
  }
  return "Utensils";
}

function IconByKey({
  name,
  category,
  size = 16
}: {
  name?: string | null;
  category?: string | null;
  size?: number;
}) {
  const key = normalizeIconKey(name, category);
  const Icon = ICONS[key] || Utensils;
  return <Icon size={size} />;
}

function pad2(n: number) { return n.toString().padStart(2, "0"); }
function parseIsoDateToLocal(iso: string) {
  const [y, m, d] = iso.split("-").map((s) => parseInt(s, 10));
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}
function thaiWeekdayAbbr(d: Date) {
  const map = ["อา.", "จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส."];
  return map[d.getDay()];
}
function dayLabel(d: Date) {
  return `${thaiWeekdayAbbr(d)} ${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}`;
}
function ddmmyyyy(d: Date) {
  return `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}/${d.getFullYear()}`;
}
function signedAmountText(n: number) {
  if (n > 0) return `+${n.toLocaleString()}`;
  if (n < 0) return `-${Math.abs(n).toLocaleString()}`;
  return "0";
}

function toDayEntries(list: ExpenseDTO[]): DayEntry[] {
  const groups = new Map<string, Item[]>();
  for (const e of list) {
    const sign = e.type === "EXPENSE" ? -1 : 1;
    const signed = sign * Math.abs(Number(e.amount));
    const d = parseIsoDateToLocal(e.date);
    const isoKey = e.date;
    const item: Item = {
      id: e.id,
      category: e.category,
      paymentMethod: e.paymentMethod || undefined,
      iconKey: e.iconKey || undefined,
      title: e.category,
      tag: e.paymentMethod ? e.paymentMethod : "",
      amount: signed,
      date: ddmmyyyy(d),
      isoDate: e.date,
      note: e.note || undefined,
      account: e.paymentMethod || undefined,
      location: e.place || undefined,
      type: e.type
    };
    if (!groups.has(isoKey)) groups.set(isoKey, []);
    groups.get(isoKey)!.push(item);
  }
  const entries: DayEntry[] = Array.from(groups.entries()).map(([key, items]) => {
    const [y, m, d] = key.split("-").map(Number);
    const dt = new Date(y, (m ?? 1) - 1, d ?? 1);
    const total = items.reduce((s, it) => s + it.amount, 0);
    return { isoKey: key, label: dayLabel(dt), total, items };
  });
  entries.sort((a, b) => (a.isoKey < b.isoKey ? 1 : -1));
  return entries;
}

type EditForm = {
  typeLabel: "ค่าใช้จ่าย" | "รายได้";
  category: string;
  amount: number;
  note: string;
  place: string;
  date: string;
  paymentMethod: string;
  iconKey: string;
};

function itemToForm(it: Item): EditForm {
  return {
    typeLabel: it.type === "EXPENSE" ? "ค่าใช้จ่าย" : "รายได้",
    category: it.category,
    amount: Math.abs(it.amount),
    note: it.note ?? "",
    place: it.location ?? "",
    date: it.isoDate,
    paymentMethod: it.paymentMethod ?? "",
    iconKey: it.iconKey ?? "Utensils",
  };
}

export default function Summary() {
  const [selected, setSelected] = useState<Item | null>(null);
  const [entries, setEntries] = useState<DayEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState<EditForm | null>(null);
  const [saving, setSaving] = useState(false);

  const loadExpenses = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/expenses`, {
        headers: { Accept: "application/json" },
        credentials: "include",
      });
      if (!res.ok) throw new Error(`โหลดข้อมูลไม่สำเร็จ (${res.status})`);
      const data: ExpenseDTO[] = await res.json();
      setEntries(toDayEntries(data));
    } catch (e: any) {
      setError(e?.message || "เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadExpenses(); }, []);

  const onEdit = (it: Item) => {
    setForm(itemToForm(it));
    setEditMode(true);
    setSelected(it);
  };

  const removeFromState = (id: number) => {
    setEntries((prev) =>
      prev
        .map((d) => ({ ...d, items: d.items.filter((x) => x.id !== id), total: d.items.filter((x) => x.id !== id).reduce((s, it) => s + it.amount, 0) }))
        .filter((d) => d.items.length > 0)
    );
  };

  const tryDeleteEndpoints = async (id: number) => {
    const attempt = async (url: string, init: RequestInit) => {
      const r = await fetch(url, init);
      return r.ok;
    };
    if (await attempt(`${API_BASE}/api/expenses/${id}`, { method: "DELETE", credentials: "include", headers: { Accept: "application/json" } })) return true;
    if (await attempt(`${API_BASE}/api/expenses/${id}?_method=DELETE`, { method: "POST", credentials: "include", headers: { Accept: "application/json" } })) return true;
    if (await attempt(`${API_BASE}/api/expenses/delete/${id}`, { method: "POST", credentials: "include", headers: { Accept: "application/json" } })) return true;
    if (await attempt(`${API_BASE}/api/expenses/${id}`, { method: "DELETE", credentials: "include" })) return true;
    return false;
  };

  const onDelete = async (it: Item) => {
    if (!window.confirm("ลบรายการนี้ใช่ไหม?")) return;
    try {
      setSaving(true);
      const ok = await tryDeleteEndpoints(it.id);
      if (!ok) throw new Error("ลบไม่สำเร็จ");
      removeFromState(it.id);
      setSelected(null);
    } catch (e: any) {
      alert(e?.message || "เกิดข้อผิดพลาดขณะลบ");
    } finally {
      setSaving(false);
    }
  };

  const submitEdit = async () => {
    if (!selected || !form) return;
    const apiType: "EXPENSE" | "INCOME" = form.typeLabel === "รายได้" ? "INCOME" : "EXPENSE";
    const payload = {
      id: selected.id,
      type: apiType,
      category: form.category,
      amount: Number(form.amount),
      note: form.note,
      place: form.place,
      date: form.date,
      paymentMethod: form.paymentMethod || "",
      iconKey: form.iconKey || "Utensils",
    };
    try {
      setSaving(true);
      let res = await fetch(`${API_BASE}/api/expenses/${selected.id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const createRes = await fetch(`${API_BASE}/api/expenses`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify(payload),
        });
        if (!createRes.ok) {
          const txt = await createRes.text();
          throw new Error(`บันทึกรายการใหม่ไม่สำเร็จ (${createRes.status}) ${txt}`);
        }
        const delRes = await fetch(`${API_BASE}/api/expenses/${selected.id}`, {
          method: "DELETE",
          credentials: "include",
          headers: { Accept: "application/json" }
        });
        if (!delRes.ok) {
          const txt = await delRes.text();
          throw new Error(`ลบรายการเดิมไม่สำเร็จ (${delRes.status}) ${txt}`);
        }
      }
      setEditMode(false);
      setSelected(null);
      await loadExpenses();
    } catch (e: any) {
      alert(e?.message || "เกิดข้อผิดพลาดขณะบันทึก");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="App summary-page">
      <div className="list-wrap"><div className="day-card">กำลังโหลดข้อมูล…</div></div>
      <BottomNav/>
    </div>
  );
  if (error) return (
    <div className="App summary-page">
      <div className="list-wrap"><div className="day-card neg">{error}</div></div>
      <BottomNav/>
    </div>
  );

  return (
    <div className="App summary-page">
      <div className="list-wrap">
        {entries.length === 0 && (
          <section className="day-card">
            <header className="day-header"><span className="day-date">ไม่มีรายการ</span></header>
            <div className="day-body" />
          </section>
        )}

        {entries.map((day) => (
          <section
            key={day.isoKey}
            className="day-card is-clickable"
            onClick={() => setSelected(day.items[0] ?? null)}
            role="button"
            aria-label={`ดูรายละเอียดของ ${day.label}`}
          >
            <header className="day-header">
              <span className="day-date">{day.label}</span>
              <span className="day-total">
                รวม:{" "}
                <b className={day.total < 0 ? "neg" : "pos"}>
                  {signedAmountText(day.total)} ฿
                </b>
              </span>
            </header>

            <div className="day-body">
              {day.items.map((it, idx) => (
                <div
                  key={it.id ?? idx}
                  className="row clickable"
                  onClick={(e) => { e.stopPropagation(); setSelected(it); setEditMode(false); }}
                >
                  <div className="row-left">
                    <div className="row-avatar">
                      <IconByKey name={it.iconKey} category={it.category} size={16} />
                    </div>
                    <div className="row-text">
                      <div className="row-title">{it.category}</div>
                      <div className="row-tag">{it.paymentMethod || "-"}</div>
                    </div>
                  </div>

                  <div className={`row-amt ${it.amount < 0 ? "neg" : "pos"}`}>
                    {signedAmountText(it.amount)}
                  </div>

                  {idx !== day.items.length - 1 && <div className="divider" aria-hidden="true" />}
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      {selected && (
        <div className="detail-overlay" onClick={() => { setSelected(null); setEditMode(false); }}>
          <div className="detail-card" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <button className="detail-close" onClick={() => { setSelected(null); setEditMode(false); }} aria-label="ปิด">
              <X size={20} />
            </button>

            <div className="detail-header">
              <div className="detail-avatar">
                <IconByKey name={selected.iconKey} category={selected.category} size={24} />
              </div>
              <h3 className="detail-title">{selected.category}</h3>
            </div>

            {!editMode && (
              <div className="detail-body">
                <div className="edit-grid">
                  <div className="pair">
                    <div className="field">
                      <label>ประเภท</label>
                      <input readOnly value={selected.type === "INCOME" ? "รายได้" : "ค่าใช้จ่าย"} />
                    </div>
                    <div className="field">
                      <label>หมวดหมู่</label>
                      <input readOnly value={selected.category} />
                    </div>
                  </div>

                  <div className="pair">
                    <div className="field">
                      <label>จำนวนเงิน</label>
                      <input readOnly value={Math.abs(selected.amount)} />
                    </div>
                    <div className="field">
                      <label>วันที่</label>
                      <input readOnly value={selected.date || ""} />
                    </div>
                  </div>

                  <div className="pair">
                    <div className="field">
                      <label>บัญชี</label>
                      <input readOnly value={selected.account || ""} />
                    </div>
                    <div className="field">
                      <label>วิธีจ่าย</label>
                      <input readOnly value={selected.location || ""} />
                    </div>
                  </div>

                  <div className="pair">
                    <div className="field">
                      <label>โน้ต</label>
                      <input readOnly value={selected.note || ""} />
                    </div>
                    <div className="field">
                      <label>Icon Key</label>
                      <input readOnly value={selected.iconKey || ""} />
                    </div>
                  </div>

                  <div className="actions-row two">
                    <button className="btn primary" onClick={() => onEdit(selected)}>แก้ไข</button>
                    <button className="btn danger" onClick={() => onDelete(selected)}>ลบ</button>
                  </div>
                </div>
              </div>
            )}

            {editMode && form && (
              <div className="detail-body">
                <div className="edit-grid">
                  <div className="pair">
                    <div className="field">
                      <label>ประเภท</label>
                      <select
                        value={form.typeLabel}
                        onChange={(e) => setForm({ ...form, typeLabel: e.target.value as EditForm["typeLabel"] })}
                      >
                        <option value="ค่าใช้จ่าย">ค่าใช้จ่าย</option>
                        <option value="รายได้">รายได้</option>
                      </select>
                    </div>
                    <div className="field">
                      <label>หมวดหมู่</label>
                      <input
                        type="text"
                        value={form.category}
                        onChange={(e) => setForm({ ...form, category: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="pair">
                    <div className="field">
                      <label>จำนวนเงิน</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={form.amount}
                        onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
                        required
                      />
                    </div>
                    <div className="field date">
                      <label>วันที่</label>
                      <input
                        type="date"
                        value={form.date}
                        onChange={(e) => setForm({ ...form, date: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="pair">
                    <div className="field">
                      <label>บัญชี</label>
                      <input
                        type="text"
                        value={form.paymentMethod}
                        onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
                      />
                    </div>
                    <div className="field">
                      <label>วิธีจ่าย</label>
                      <input
                        type="text"
                        value={form.place}
                        onChange={(e) => setForm({ ...form, place: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="pair">
                    <div className="field">
                      <label>โน้ต</label>
                      <input
                        type="text"
                        value={form.note}
                        onChange={(e) => setForm({ ...form, note: e.target.value })}
                      />
                    </div>
                    <div className="field">
                      <label>Icon Key</label>
                      <input
                        type="text"
                        value={form.iconKey}
                        onChange={(e) => setForm({ ...form, iconKey: e.target.value })}
                        list="iconKeys"
                      />
                      <datalist id="iconKeys">
                        {Object.keys(ICONS).map((k) => <option key={k} value={k} />)}
                      </datalist>
                    </div>
                  </div>

                  <div className="actions-row compact wide-save">
                    <button className="btn primary stretch" onClick={submitEdit} disabled={saving}>
                      {saving ? "กำลังบันทึก…" : "บันทึก"}
                    </button>
                    <button className="btn ghost small-cancel" onClick={() => setEditMode(false)} disabled={saving}>
                      ยกเลิก
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
