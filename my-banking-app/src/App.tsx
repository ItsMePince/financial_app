// src/App.tsx
import { Routes, Route, Navigate } from "react-router-dom";

// Header + Navbar
import Header from "./components/Header";
import BottomNav from "./pages/buttomnav";

// หน้าหลัก
import Home from "./pages/Home";
import Day from "./pages/day";
import Month from "./pages/month";
import Income from "./pages/income";
import Expense from "./pages/expense";
import Summary from "./pages/summary";

// Auth / Account
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import AccountSelect from "./pages/AccountSelect";
import AccountNew from "./pages/accountnew";

// Custom categories
import CustomIncome from "./pages/customincome";
import CustomOutcome from "./pages/customoutcome";

function NotFound() {
  return (
    <div style={{ padding: 16 }}>
      <h3>404 - Page not found</h3>
      <a href="/">กลับหน้าแรก</a>
    </div>
  );
}

export default function App() {
  return (
    <div className="App">
      {/* ✅ แสดง Header ทุกหน้า */}
      <Header />

      <Routes>
        {/* default หน้าแรก */}
        <Route path="/" element={<Home />} />

        {/* เส้นทางการเงิน */}
        <Route path="/day" element={<Day />} />
        <Route path="/month" element={<Month />} />
        <Route path="/income" element={<Income />} />
        <Route path="/expense" element={<Expense />} />
        <Route path="/summary" element={<Summary />} />

        {/* Auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />

        {/* บัญชี */}
        <Route path="/accountselect" element={<AccountSelect />} />
        <Route path="/accountnew" element={<AccountNew />} />

        {/* Custom category */}
        <Route path="/customincome" element={<CustomIncome />} />
        <Route path="/customoutcome" element={<CustomOutcome />} />

        {/* redirect /home → / */}
        <Route path="/home" element={<Navigate to="/" replace />} />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>

      {/* ✅ Navbar ด้านล่าง */}
      <BottomNav />
    </div>
  );
}
