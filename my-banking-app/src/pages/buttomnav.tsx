// BottomNav.tsx
import React from "react";
import { Calculator, Home, BarChart3 } from "lucide-react";
import "./buttomnav.css";

const BottomNav: React.FC = () => {
  return (
    <div className="bottom-nav">
      <button className="nav-button">
        <Calculator size={24} />
      </button>

      <button className="nav-button">
        <Home size={24} />
      </button>

      <button className="nav-button">
        <BarChart3 size={24} />
      </button>
    </div>
  );
};

export default BottomNav;
