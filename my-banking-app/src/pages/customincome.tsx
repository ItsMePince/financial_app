import { useMemo, useState } from "react";
import "./customincome.css";
import {
  Check, Search,
  Briefcase, Coins, Wallet, BarChart, Laptop, Clock, ShieldCheck,
   ShoppingBag, CreditCard,FileText, Layers, TrendingUp,
  BookOpen, GraduationCap,Code,PiggyBank,LineChart,Building , Truck, Package,
  Music, Film,  Gamepad,Bed,ClipboardList,ClipboardCheck,Trophy,
  Home,UserCheck,Camera,PenTool,Store,Boxes,Tent,Ticket,Image,
  Video,Mic,Radio,CircuitBoard,Cloud,Lock,FileBadge,Users,
  Bitcoin,Gem,Star,Link,Megaphone,HandCoins ,
  Car, Bike,Banknote,
  Gift, Coffee,
} from "lucide-react";
import BottomNav from './buttomnav';
type LucideIcon = React.ComponentType<{ className?: string }>;
type IconItem = { key: string; label: string; Icon: LucideIcon };

const ICON_SETS_INCOME: Record<string, IconItem[]> = {
  "เงินเดือน & งานประจำ": [
    { key: "salary", label: "เงินเดือน", Icon: Briefcase },
    { key: "bonus", label: "โบนัส", Icon: BarChart },
    { key: "overtime", label: "OT", Icon: Clock },
    { key: "allowance", label: "สวัสดิการ", Icon: Wallet },
    { key: "insurance", label: "ค่าชดเชย/ประกัน", Icon: ShieldCheck },
  ],
  "งานเสริม & ฟรีแลนซ์": [
    { key: "freelance", label: "ฟรีแลนซ์", Icon: Laptop },
    { key: "consult", label: "ที่ปรึกษา", Icon: UserCheck },
    { key: "tutor", label: "ติวเตอร์", Icon: BookOpen },
    { key: "photography", label: "ถ่ายภาพ", Icon: Camera },
    { key: "delivery", label: "ไรเดอร์", Icon: Bike },
    { key: "driver", label: "ขับรถ", Icon: Car },
    { key: "design", label: "งานดีไซน์", Icon: PenTool },
    { key: "dev", label: "โปรแกรมเมอร์", Icon: Code },
    { key: "work", label: "ทำงาน", Icon: Banknote },
  ],
  "การลงทุน & ดอกผล": [
    { key: "interest", label: "ดอกเบี้ย", Icon: Coins },
    { key: "dividend", label: "เงินปันผล", Icon: PiggyBank },
    { key: "stock", label: "หุ้น", Icon: LineChart },
    { key: "bond", label: "พันธบัตร", Icon: FileText },
    { key: "fund", label: "กองทุนรวม", Icon: Layers },
    { key: "profit", label: "กำไรซื้อขาย", Icon: TrendingUp },
  ],
  "ค่าเช่า & ทรัพย์สิน": [
    { key: "rent_house", label: "ค่าเช่าบ้าน", Icon: Home },
    { key: "rent_room", label: "ค่าเช่าห้อง", Icon: Bed },
    { key: "rent_office", label: "ค่าเช่าสำนักงาน", Icon: Building },
    { key: "rent_car", label: "ค่าเช่ารถ", Icon: Truck },
    { key: "rent_asset", label: "เช่าทรัพย์สิน", Icon: Package },
  ],
  "ค้าขาย & ออนไลน์": [
    { key: "online_sale", label: "ขายออนไลน์", Icon: ShoppingBag },
    { key: "retail", label: "ค้าปลีก", Icon: Store },
    { key: "wholesale", label: "ค้าส่ง", Icon: Boxes },
    { key: "market", label: "ตลาดนัด", Icon: Tent },
    { key: "cashback", label: "Cashback", Icon: CreditCard },
    { key: "voucher", label: "Voucher", Icon: Ticket },
  ],
  "ครีเอเตอร์ & ลิขสิทธิ์": [
    { key: "youtube", label: "YouTube Ads", Icon: Video },
    { key: "twitch", label: "Live Stream", Icon: Mic },
    { key: "podcast", label: "Podcast", Icon: Radio },
    { key: "royalty_music", label: "เพลง", Icon: Music },
    { key: "royalty_film", label: "หนัง/ละคร", Icon: Film },
    { key: "royalty_book", label: "หนังสือ/งานเขียน", Icon: FileText },
    { key: "royalty_game", label: "เกม", Icon: Gamepad },
  ],
  "ทุนการศึกษา & สนับสนุน": [
    { key: "scholarship", label: "ทุนการศึกษา", Icon: GraduationCap },
    { key: "stipend", label: "เบี้ยเลี้ยง", Icon: ClipboardList },
    { key: "grant", label: "Grant/ทุนวิจัย", Icon: ClipboardCheck },
    { key: "competition", label: "ชนะประกวด", Icon: Trophy },
  ],
  "ของขวัญ & อื่น ๆ": [
    { key: "gift_money", label: "อั่งเปา/ของขวัญ", Icon: Gift },
    { key: "tips", label: "ทิป", Icon: Coffee },
    { key: "lottery", label: "ลอตเตอรี่", Icon: Star },
    { key: "inheritance", label: "มรดก", Icon: Gem },
    { key: "hand_coins", label: "ค่าขนม", Icon: HandCoins },

  ],
  "Crypto & Digital Assets": [
    { key: "btc", label: "Bitcoin", Icon: Bitcoin },
    { key: "eth", label: "Ethereum", Icon: CircuitBoard },
    { key: "nft", label: "NFT", Icon: Image },
    { key: "airdrop", label: "Airdrop", Icon: Cloud },
    { key: "staking", label: "Staking", Icon: Lock },
  ],
  "Passive Income & Royalty": [
    { key: "affiliate", label: "Affiliate", Icon: Link },
    { key: "ads", label: "โฆษณา", Icon: Megaphone },
    { key: "license", label: "License", Icon: FileBadge },
    { key: "membership", label: "สมาชิก/Subscription", Icon: Users },
  ],
};


export default function IncomeCustom() {
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
      alert("กรุณาเลือกไอคอนและตั้งชื่อ");
      return;
    }
    alert(`สร้างหมวดรายได้ "${name.trim()}" ด้วยไอคอน ${picked.label} สำเร็จ`);
    window.history.back();
  }

  return (
    <div className="cc-wrap">
      {/* Header */}
      <header className="cc-header">
        <div className="cc-topbar">
          <div className="cc-avatar">A</div>
          <div className="cc-owner">Amanda</div>
        </div>
        <h1 className="cc-title">IncomeCustom</h1>
      </header>

      {/* Search bar */}
      <div className="cc-search">
        <Search className="cc-search-icon" />
        <input
          className="cc-search-input"
          placeholder="ค้นหาไอคอนรายได้… (พิมพ์เช่น เงินเดือน, ฟรีแลนซ์, ปันผล)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {query && (
          <button className="cc-search-clear" onClick={() => setQuery("")} aria-label="ล้างคำค้น">
            ×
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
            placeholder="ชื่อหมวดรายได้"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={32}
          />
          <div className="cc-underline" />
        </div>

        <button className="cc-confirm" onClick={handleConfirm} aria-label="ยืนยัน">
          <Check className="cc-checkicon" />
        </button>
      </section>

      {/* Library */}
      <section className="cc-library">
        {Object.keys(filteredSets).length === 0 ? (
          <p className="cc-noresult">ไม่พบไอคอนที่ตรงกับ “{query}”</p>
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
