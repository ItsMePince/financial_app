// src/pages/customincome.tsx
// @ts-nocheck
import { useMemo, useState } from "react";
import "./customincome.css";
import {
  // UI
  Check, Search,

  // �?�?ิ�?�?�?ือ�? & �?า�?�?ระ�?ำ
  Briefcase, BarChart, Clock, Wallet, ShieldCheck,

  // �?า�?�?สริม & �?รีแล�?�?�?
  Laptop, UserCheck, BookOpen, Camera, Bike, Car, PenTool, Code, Banknote,

  // การล�?�?ุ�? & �?อก�?ล
  Coins, PiggyBank, LineChart, FileText, Layers, TrendingUp,

  // �?�?า�?�?�?า & �?รั�?ย�?สิ�?
  Home, Bed, Building, Truck, Package,

  // �?�?า�?าย & ออ�?�?ล�?�?
  ShoppingBag, Store, Boxes, Tent, CreditCard, Ticket,

  // �?รี�?อ�?�?อร�? & ลิ�?สิ�?�?ิ�?
  Video, Mic, Radio, Music, Film, Gamepad,

  // �?ุ�?/ส�?ั�?ส�?ุ�?
  ClipboardList, ClipboardCheck, Trophy, GraduationCap,

  // �?อ�?�?วัญ & อื�?�? �?
  Gift, Coffee, Star, Gem, HandCoins,

  // Crypto & Digital
  Bitcoin, CircuitBoard, Image, Cloud, Lock,

  // Passive
  Link, Megaphone, FileBadge, Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import BottomNav from "./buttomnav";

type LucideIcon = React.ComponentType<{ className?: string }>;
type IconItem = { key: string; label: string; Icon: LucideIcon; iconName: string };

// ====== �?ุ�?�?อ�?อ�?ราย�?�?�? (�?�?ิ�?ม/ล�?�?�?�?�?าม�?�?อ�?การ) ======
const ICON_SETS_INCOME: Record<string, IconItem[]> = {
  "�?�?ิ�?�?�?ือ�? & �?า�?�?ระ�?ำ": [
    { key: "salary",     label: "�?�?ิ�?�?�?ือ�?",          Icon: Briefcase,   iconName: "Briefcase" },
    { key: "bonus",      label: "�?�?�?ัส",              Icon: BarChart,    iconName: "BarChart" },
    { key: "overtime",   label: "OT",                 Icon: Clock,       iconName: "Clock" },
    { key: "allowance",  label: "สวัส�?ิการ",         Icon: Wallet,      iconName: "Wallet" },
    { key: "insurance",  label: "�?�?า�?�?�?�?ย/�?ระกั�?",   Icon: ShieldCheck, iconName: "ShieldCheck" },
  ],
  "�?า�?�?สริม & �?รีแล�?�?�?": [
    { key: "freelance",  label: "�?รีแล�?�?�?",          Icon: Laptop,      iconName: "Laptop" },
    { key: "consult",    label: "�?ี�?�?รึกษา",         Icon: UserCheck,   iconName: "UserCheck" },
    { key: "tutor",      label: "�?ิว�?�?อร�?",          Icon: BookOpen,    iconName: "BookOpen" },
    { key: "photo",      label: "�?�?ายภา�?",           Icon: Camera,      iconName: "Camera" },
    { key: "delivery",   label: "�?ร�?�?อร�?",           Icon: Bike,        iconName: "Bike" },
    { key: "driver",     label: "�?ั�?ร�?",             Icon: Car,         iconName: "Car" },
    { key: "design",     label: "�?า�?�?ี�?�?�?�?",         Icon: PenTool,     iconName: "PenTool" },
    { key: "dev",        label: "�?�?รแกรม�?มอร�?",      Icon: Code,        iconName: "Code" },
    { key: "work",       label: "�?ำ�?า�?",             Icon: Banknote,    iconName: "Banknote" },
  ],
  "การล�?�?ุ�? & �?อก�?ล": [
    { key: "interest",   label: "�?อก�?�?ี�?ย",          Icon: Coins,       iconName: "Coins" },
    { key: "dividend",   label: "�?�?ิ�?�?ั�?�?ล",         Icon: PiggyBank,   iconName: "PiggyBank" },
    { key: "stock",      label: "หุ�?�?",               Icon: LineChart,   iconName: "LineChart" },
    { key: "bond",       label: "�?ั�?�?�?ั�?ร",          Icon: FileText,    iconName: "FileText" },
    { key: "fund",       label: "กอ�?�?ุ�?รวม",         Icon: Layers,      iconName: "Layers" },
    { key: "profit",     label: "กำ�?ร�?ื�?อ�?าย",       Icon: TrendingUp,  iconName: "TrendingUp" },
  ],
  "�?�?า�?�?�?า & �?รั�?ย�?สิ�?": [
    { key: "rent_house", label: "�?�?า�?�?�?า�?�?า�?",       Icon: Home,        iconName: "Home" },
    { key: "rent_room",  label: "�?�?า�?�?�?าห�?อ�?",       Icon: Bed,         iconName: "Bed" },
    { key: "rent_office",label: "�?�?า�?�?�?าสำ�?ัก�?า�?",  Icon: Building,    iconName: "Building" },
    { key: "rent_car",   label: "�?�?า�?�?�?าร�?",         Icon: Truck,       iconName: "Truck" },
    { key: "rent_asset", label: "�?�?�?า�?รั�?ย�?สิ�?",     Icon: Package,     iconName: "Package" },
  ],
  "�?�?า�?าย & ออ�?�?ล�?�?": [
    { key: "online_sale",label: "�?ายออ�?�?ล�?�?",        Icon: ShoppingBag, iconName: "ShoppingBag" },
    { key: "retail",     label: "�?�?า�?ลีก",           Icon: Store,       iconName: "Store" },
    { key: "wholesale",  label: "�?�?าส�?�?",            Icon: Boxes,       iconName: "Boxes" },
    { key: "market",     label: "�?ลา�?�?ั�?",           Icon: Tent,        iconName: "Tent" },
    { key: "cashback",   label: "Cashback",          Icon: CreditCard,  iconName: "CreditCard" },
    { key: "voucher",    label: "Voucher",           Icon: Ticket,      iconName: "Ticket" },
  ],
  "�?รี�?อ�?�?อร�? & ลิ�?สิ�?�?ิ�?": [
    { key: "youtube",    label: "YouTube Ads",       Icon: Video,       iconName: "Video" },
    { key: "twitch",     label: "Live Stream",       Icon: Mic,         iconName: "Mic" },
    { key: "podcast",    label: "Podcast",           Icon: Radio,       iconName: "Radio" },
    { key: "royalty_music", label: "�?�?ล�?",           Icon: Music,       iconName: "Music" },
    { key: "royalty_film",  label: "ห�?ั�?/ละ�?ร",      Icon: Film,        iconName: "Film" },
    { key: "royalty_game",  label: "�?กม",            Icon: Gamepad,     iconName: "Gamepad" },
  ],
  "�?ุ�?การศึกษา & ส�?ั�?ส�?ุ�?": [
    { key: "scholarship",label: "�?ุ�?การศึกษา",      Icon: GraduationCap, iconName: "GraduationCap" },
    { key: "stipend",    label: "�?�?ี�?ย�?ลี�?ย�?",      Icon: ClipboardList, iconName: "ClipboardList" },
    { key: "grant",      label: "Grant/�?ุ�?วิ�?ัย",   Icon: ClipboardCheck,iconName: "ClipboardCheck" },
    { key: "competition",label: "�?�?ะ�?ระกว�?",        Icon: Trophy,        iconName: "Trophy" },
  ],
  "�?อ�?�?วัญ & อื�?�? �?": [
    { key: "gift_money", label: "อั�?�?�?�?า/�?อ�?�?วัญ",  Icon: Gift,        iconName: "Gift" },
    { key: "tips",       label: "�?ิ�?",               Icon: Coffee,      iconName: "Coffee" },
    { key: "lottery",    label: "ลอ�?�?�?อรี�?",         Icon: Star,        iconName: "Star" },
    { key: "inheritance",label: "มร�?ก",             Icon: Gem,         iconName: "Gem" },
    { key: "hand_coins", label: "�?�?า�?�?ม",           Icon: HandCoins,   iconName: "HandCoins" },
  ],
  "Crypto & Digital Assets": [
    { key: "btc",        label: "Bitcoin",           Icon: Bitcoin,     iconName: "Bitcoin" },
    { key: "eth",        label: "Ethereum",          Icon: CircuitBoard,iconName: "CircuitBoard" },
    { key: "nft",        label: "NFT",               Icon: Image,       iconName: "Image" },
    { key: "airdrop",    label: "Airdrop",           Icon: Cloud,       iconName: "Cloud" },
    { key: "staking",    label: "Staking",           Icon: Lock,        iconName: "Lock" },
  ],
  "Passive Income & Royalty": [
    { key: "affiliate",  label: "Affiliate",         Icon: Link,        iconName: "Link" },
    { key: "ads",        label: "�?�?ษ�?า",            Icon: Megaphone,   iconName: "Megaphone" },
    { key: "license",    label: "License",           Icon: FileBadge,   iconName: "FileBadge" },
    { key: "membership", label: "สมา�?ิก/Subscription", Icon: Users,     iconName: "Users" },
  ],
};

export default function IncomeCustom() {
  const navigate = useNavigate();

  const [picked, setPicked] = useState<IconItem | null>(null);
  const [name, setName] = useState("");
  const [query, setQuery] = useState("");

  const filteredSets = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ICON_SETS_INCOME;

    const next: Record<string, IconItem[]> = {};
    Object.entries(ICON_SETS_INCOME).forEach(([group, list]) => {
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
    if (!picked || !name.trim()) {
      alert("กรุ�?า�?ลือก�?อ�?อ�?และ�?ั�?�?�?ื�?อ");
      return;
    }
    // �?? ส�?�?กลั�?�?�?ห�?�?า Income �?ร�?อม state
    navigate("/income", {
      state: {
        customIncome: {
          label: name.trim(),
          icon: picked.iconName, // �?�?อ�?�?ร�?กั�? ICON_MAP �?�?ห�?�?า Income
        },
      },
      replace: true,
    });
  }

  return (
    <div className="cc-wrap">
      {/* Header */}
      <header className="cc-header">
        <h1 className="cc-title">Custom Income</h1>
      </header>

      {/* Search bar */}
      <div className="cc-search">
        <Search className="cc-search-icon" />
        <input
          className="cc-search-input"
          placeholder="�?�?�?หา�?อ�?อ�?ราย�?�?�?�?� (�?�?�?�? �?�?ิ�?�?�?ือ�?, �?รีแล�?�?�?, �?ั�?�?ล)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {query && (
          <button
            className="cc-search-clear"
            onClick={() => setQuery("")}
            aria-label="ล�?า�?�?ำ�?�?�?"
          >
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
            placeholder="�?ื�?อหมว�?ราย�?�?�?"
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

      {/* Library */}
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
                    onClick={() => {
                      setPicked(item);
                    }}
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




