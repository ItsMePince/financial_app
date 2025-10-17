// AmountDisplay.tsx
import { useEffect, useLayoutEffect, useRef, useState } from "react";

type Props = {
  value: number | string;     // รั�?�?ล�?หรือส�?ริ�?�?ี�?�?อร�?แม�?มาแล�?วก�?�?�?�?
  unit?: string;              // �?�?�?�? "�?า�?"
  max?: number;               // font-size สู�?สุ�? (px)
  min?: number;               // font-size �?�?ำสุ�? (px)
  className?: string;
};

const format = (v: number | string) => {
  const s = String(v);
  // �?�?า�?�?�?�?�?ล�?�?ิ�? �?? �?ส�? , หลัก�?ั�?
  if (/^\d+$/.test(s)) return s.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return s;
};

export default function AmountDisplay({
  value,
  unit = "�?า�?",
  max = 28,
  min = 12,
  className = "",
}: Props) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const numRef  = useRef<HTMLSpanElement | null>(null);
  const [size, setSize] = useState(max);

  const fit = () => {
    const wrap = wrapRef.current;
    const num  = numRef.current;
    if (!wrap || !num) return;

    // �?ริ�?ม�?าก�?�?า�?�?หญ�?สุ�? แล�?ว�?�?อย�? ล�?ล�?�?�?กว�?า�?ะ�?อ�?ี (มี safety cap)
    let s = max;
    num.style.fontSize = `${s}px`;
    for (let i = 0; i < 40 && (num.scrollWidth > wrap.clientWidth) && s > min; i++) {
      s -= 1;
      num.style.fontSize = `${s}px`;
    }
    setSize(s);
  };

  // �?รียก�?อ�? mount และ�?มื�?อ value �?�?ลี�?ย�?
  useLayoutEffect(() => { fit(); }, [value, max, min]);

  // รอ�?รั�? resize/container �?�?ลี�?ย�?�?�?า�?
  useEffect(() => {
    const ro = new ResizeObserver(() => fit());
    if (wrapRef.current) ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={wrapRef} className={`amount-display ${className}`}>
      <span ref={numRef} className="num" style={{ fontSize: size }}>
        {format(value)}
      </span>
      {unit && <span className="unit">{unit}</span>}
    </div>
  );
}




