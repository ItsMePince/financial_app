import { Link, useLocation } from "react-router-dom";
import { Calculator, Home, BarChart3 } from "lucide-react";
import "./buttomnav.css";

export default function BottomNav() {
  const location = useLocation();
  const is = (p: string) => (location.pathname === p ? "active" : "");

  return (
    <div className="bottom-nav">
      <Link to="/expense" className={`nav-button ${is("/expense")}`}>
        <Calculator size={24} />
      </Link>
      <Link to="/home" className={`nav-button ${is("/home")}`}>
        <Home size={24} />
      </Link>
      <Link to="/month" className={`nav-button ${is("/month")}`}>
        <BarChart3 size={24} />
      </Link>
    </div>
  );
}