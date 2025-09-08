import React, { useMemo } from "react";
import "./header.css";

type AuthUser = { id: number; username: string; email: string; role: string };

export default function Header() {
  const user = useMemo(() => {
    try {
      const raw = localStorage.getItem("user");
      return raw ? (JSON.parse(raw) as AuthUser) : null;
    } catch {
      return null;
    }
  }, []);

  const name = user?.username?.trim() || "Guest";
  const initial = name.charAt(0).toUpperCase();

  return (
    <header className="app-header">
      <div className="container header__inner">
        {/* Avatar วงกลมแสดงอักษรแรก */}
        <div className="header__avatar">{initial}</div>
        {/* ชื่อเต็ม */}
        <div className="header__username">{name}</div>
      </div>
    </header>
  );
}
