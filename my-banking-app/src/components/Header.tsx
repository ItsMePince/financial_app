import React, { useMemo } from "react";
import "./header.css";

export default function Header() {
  const name = useMemo(
    () => localStorage.getItem("username") || "User",
    []
  );
  const initial = name.trim().charAt(0).toUpperCase();

  return (
    <header className="app-header">
      <div className="container header__inner">
        <div className="header__avatar">{initial}</div>
        <div className="header__username">{name}</div>
      </div>
    </header>
  );
}
