// src/pages/CustomOutcome.tsx
// @ts-nocheck
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./customoutcome.css";
import {
  Check,
  // Food & Drink
  Utensils, Pizza, Drumstick, Coffee, Beer, CupSoda, IceCream, Candy, Cake,
  // Travel
  Car, Bus, Bike, Plane, Train, Ship, Fuel, Map, MapPin,
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
  Gamepad, Music, Film, Popcorn, Clapperboard, Sprout, Search
} from "lucide-react";
import BottomNav from "./buttomnav";
import { useTempCategory } from "../TempCategoryContext";

type LucideIcon = React.ComponentType<{ className?: string }>;
type IconItem = { key: string; label: string; Icon: LucideIcon };

const ICON_SETS: Record<string, IconItem[]> = {
  "อาหาร & �?�?รื�?อ�?�?ื�?ม": [
    { key: "food", label: "อาหาร", Icon: Utensils },
    { key: "pizza", label: "�?ิ�?�?�?า", Icon: Pizza },
    { key: "drumstick", label: "�?ก�?�?อ�?", Icon: Drumstick },
    { key: "coffee", label: "กาแ�?", Icon: Coffee },
    { key: "beer", label: "�?�?ียร�?", Icon: Beer },
    { key: "cupsoda", label: "�?�?�?า", Icon: CupSoda },
    { key: "icecream", label: "�?อศกรีม", Icon: IceCream },
    { key: "candy", label: "�?�?ม", Icon: Candy },
    { key: "cake", label: "�?�?�?ก", Icon: Cake },
  ],
  "การ�?�?ิ�?�?า�?": [
    { key: "car", label: "ร�?ย�?�?�?", Icon: Car },
    { key: "bus", label: "ร�?�?ัส", Icon: Bus },
    { key: "bike", label: "�?ักรยา�?", Icon: Bike },
    { key: "plane", label: "�?�?รื�?อ�?�?ิ�?", Icon: Plane },
    { key: "train", label: "ร�?�?�?", Icon: Train },
    { key: "ship", label: "�?รือ", Icon: Ship },
    { key: "fuel", label: "�?�?ำมั�?", Icon: Fuel },
    { key: "map", label: "แ�?�?�?ี�?", Icon: Map },
    { key: "mappin", label: "�?ักหมุ�?", Icon: MapPin },
  ],
  "สุ�?ภา�? & การแ�?�?ย�?": [
    { key: "stethoscope", label: "หมอ", Icon: Stethoscope },
    { key: "heart", label: "สุ�?ภา�?", Icon: HeartPulse },
    { key: "activity", label: "ออกกำลั�?", Icon: Activity },
    { key: "pill", label: "ยา", Icon: Pill },
    { key: "hospital", label: "�?ร�?�?ยา�?าล", Icon: Hospital },
    { key: "ambulance", label: "�?ฐม�?ยา�?าล", Icon: Ambulance },
  ],
  "�?สื�?อ�?�?า & �?�?อ�?�?ิ�?�?": [
    { key: "cart", label: "�?�?อ�?�?ิ�?�?", Icon: ShoppingCart },
    { key: "bag", label: "กระ�?�?�?า", Icon: ShoppingBag },
    { key: "gift", label: "�?อ�?�?วัญ", Icon: Gift },
    { key: "tag", label: "�?�?ายรา�?า", Icon: Tag },
    { key: "shirt", label: "�?สื�?อ�?�?า", Icon: Shirt },
    { key: "creditcard", label: "�?ั�?ร�?�?ร�?ิ�?", Icon: CreditCard },
    { key: "soap", label: "�?อ�?�?�?�?", Icon: SoapDispenserDroplet },
  ],
  "�?า�? & การ�?�?ิ�?": [
    { key: "briefcase", label: "�?า�?", Icon: Briefcase },
    { key: "laptop", label: "�?อม", Icon: Laptop },
    { key: "calculator", label: "�?ำ�?ว�?", Icon: Calculator },
    { key: "barchart", label: "ราย�?า�?", Icon: BarChart },
    { key: "coins", label: "�?หรียญ", Icon: Coins },
    { key: "wallet", label: "กระ�?�?�?า�?�?ิ�?", Icon: Wallet },
  ],
  "การ�?รีย�?รู�?": [
    { key: "book", label: "ห�?ั�?สือ", Icon: BookOpen },
    { key: "graduation", label: "�?รีย�?", Icon: GraduationCap },
    { key: "pencil", label: "�?�?ีย�?", Icon: Pencil },
  ],
  "กีฬา & กิ�?กรรม": [
    { key: "dumbbell", label: "�?ิ�?�?�?ส", Icon: Dumbbell },
    { key: "goal", label: "�?ุ�?�?อล", Icon: Goal },
    { key: "trophy", label: "�?�?วยรา�?วัล", Icon: Trophy },
    { key: "volleyball", label: "วอล�?ลย�?�?อล", Icon: Volleyball },
  ],
  "สั�?ว�?�?ลี�?ย�?": [
    { key: "dog", label: "สุ�?ั�?", Icon: Dog },
    { key: "cat", label: "แมว", Icon: Cat },
    { key: "fish", label: "�?ลา", Icon: Fish },
    { key: "bird", label: "�?ก", Icon: Bird },
  ],
  "�?�?า�? & �?รอ�?�?รัว": [
    { key: "home", label: "�?�?า�?", Icon: Home },
    { key: "sofa", label: "�?�?�?า", Icon: Sofa },
    { key: "bed", label: "�?�?ีย�?", Icon: Bed },
    { key: "wrench", label: "�?ระแ�?", Icon: Wrench },
    { key: "hammer", label: "�?�?อ�?", Icon: Hammer },
  ],
  "�?ั�?�?�?ิ�? & �?�?อ�?�?ลาย": [
    { key: "game", label: "�?กม", Icon: Gamepad },
    { key: "music", label: "�?�?ล�?", Icon: Music },
    { key: "film", label: "ห�?ั�?", Icon: Film },
    { key: "popcorn", label: "�?�?อ�?�?อร�?�?", Icon: Popcorn },
    { key: "clapper", label: "กอ�?�?�?าย", Icon: Clapperboard },
    { key: "sprout", label: "�?ลูก�?�?�?�?ม�?", Icon: Sprout },
  ],
};

export default function CategoryCustom() {
  const nav = useNavigate();
  const { setTempCategory } = useTempCategory();

  const [picked, setPicked] = useState<IconItem | null>(null);
  const [name, setName] = useState("");
  const [query, setQuery] = useState("");

  const filteredSets = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ICON_SETS;

    const next: Record<string, IconItem[]> = {};
    Object.entries(ICON_SETS).forEach(([group, list]) => {
      if (group.toLowerCase().includes(q)) {
        next[group] = list;
        return;
      }
      const hit = list.filter(
        (it) =>
          it.label.toLowerCase().includes(q) ||
          it.key.toLowerCase().includes(q)
      );
      if (hit.length) next[group] = hit;
    });
    return next;
  }, [query]);

  function handleConfirm() {
    const trimmed = name.trim();
    if (!picked || !trimmed) {
      alert("กรุ�?า�?ลือก�?อ�?อ�?และ�?ั�?�?�?ื�?อ");
      return;
    }
    // �?? �?ั�?�?�?�?าหมว�?�?ั�?ว�?ราวแล�?วกลั�?�?�?ห�?�?า Expense
    setTempCategory({ name: trimmed, iconKey: picked.key });
    nav(-1); // กลั�?ห�?�?าก�?อ�?ห�?�?า (Expense)
  }

  return (
    <div className="cc-wrap">
      {/* Header */}
      <header className="cc-header">
        <h1 className="cc-title">OutcomeCustom</h1>
      </header>

      {/* Search bar */}
      <div className="cc-search">
        <Search className="cc-search-icon" />
        <input
          className="cc-search-input"
          placeholder="�?�?�?หา�?อ�?อ�?�?� (�?ิม�?�?�?�?�?�? กาแ�?, ร�?, �?า�?, music)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {query && (
          <button className="cc-search-clear" onClick={() => setQuery("")} aria-label="ล�?า�?�?ำ�?�?�?">
            �?
          </button>
        )}
      </div>

      {/* Creator */}
      <section className="cc-creator">
        <div className="cc-picked">
          {picked ? <picked.Icon className="cc-picked-icon" /> : <span>?</span>}
        </div>

        <div className="cc-namefield">
          <input
            className="cc-nameinput"
            placeholder="�?ื�?อหมว�?หมู�?"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={32}
          />
          <div className="cc-underline" />
        </div>

        <button className="cc-confirm" onClick={handleConfirm} aria-label="ยื�?ยั�?">
          <Check className="cc-checkicon" />
        </button>
      </section>

      {/* Library (กรอ�?�?าม�?ำ�?�?�?) */}
      <section className="cc-library">
        {Object.keys(filteredSets).length === 0 ? (
          <p className="cc-noresult">�?ม�?�?�?�?อ�?อ�?�?ี�?�?ร�?กั�? �??{query}�?�</p>
        ) : (
          Object.entries(filteredSets).map(([group, list]) => (
            <div key={group} className="cc-group">
              <h3 className="cc-group-title">{group}</h3>
              <div className="cc-grid">
                {list.map((item) => (
                  <button
                    key={item.key}
                    className={`cc-chip ${picked?.key === item.key ? "active" : ""}`}
                    onClick={() => setPicked(item)}
                    title={item.label}
                  >
                    <item.Icon className="cc-icon" />
                  </button>
                ))}
              </div>
            </div>
          ))
        )}
      </section>

      <BottomNav />
    </div>
  );
}




