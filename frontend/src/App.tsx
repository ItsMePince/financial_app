// src/App.tsx
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";

// Header + Navbar
import Header from "./components/Header";
import BottomNav from "./pages/buttomnav";

// ห�?�?าหลัก
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
      <a href="/">กลั�?ห�?�?าแรก</a>
    </div>
  );
}

// Component สำหรั�?�?�?อ�?กั�?ห�?�?า�?ี�?�?�?อ�? login
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

// Component สำหรั�? redirect �?�?า login แล�?ว
function AuthRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  
  if (isAuthenticated) {
    return <Navigate to="/home" replace />;
  }
  
  return <>{children}</>;
}

export default function App() {
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => localStorage.getItem('isAuthenticated') === 'true'
  );
  const [isLoading, setIsLoading] = useState(false);

  // �?�?�? useCallback �?�?ื�?อ�?�?อ�?กั�? re-render �?ี�?�?ม�?�?ำ�?�?�?�?
  const checkAuth = useCallback(() => {
    const authStatus = localStorage.getItem('isAuthenticated') === 'true';
    console.log('checkAuth called:', authStatus);
    setIsAuthenticated(authStatus);
  }, []);

  useEffect(() => {
    // �?�?ิ�?ม event listener
    window.addEventListener("auth-changed", checkAuth);
    
    return () => {
      window.removeEventListener("auth-changed", checkAuth);
    };
  }, [checkAuth]);

  const currentPath = location.pathname;
  
  // กำห�?�?ห�?�?า�?ี�?�?ม�?�?�?อ�?แส�?�? nav (auth pages)
  const authPages = ['/login', '/signup'];
  const isAuthPage = authPages.includes(currentPath);

  // Debug
  console.log('Current path:', currentPath);
  console.log('Is auth page:', isAuthPage);
  console.log('Is authenticated:', isAuthenticated);

  // Loading state
  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <div>กำลั�?�?หล�?...</div>
      </div>
    );
  }

  return (
    <div className="App">
      {/* แส�?�? Header �?�?�?าะ�?มื�?อ NOT auth page */}
      {!isAuthPage && <Header />}

      <Routes>
        {/* ห�?�?าแรก - �?�?�?�? login �?สมอ */}
        <Route 
          path="/" 
          element={<Navigate to="/login" replace />}
        />

        {/* Auth Routes */}
        <Route 
          path="/login" 
          element={<Login />}
        />
        <Route 
          path="/signup" 
          element={
            <AuthRoute>
              <SignUp />
            </AuthRoute>
          } 
        />

        {/* Protected Routes - �?�?อ�? login ก�?อ�? */}
        <Route 
          path="/home" 
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/day" 
          element={
            <ProtectedRoute>
              <Day />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/month" 
          element={
            <ProtectedRoute>
              <Month />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/income" 
          element={
            <ProtectedRoute>
              <Income />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/expense" 
          element={
            <ProtectedRoute>
              <Expense />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/summary" 
          element={
            <ProtectedRoute>
              <Summary />
            </ProtectedRoute>
          } 
        />

        {/* Account Routes - �?�?อ�? login ก�?อ�? */}
        <Route 
          path="/accountselect" 
          element={
            <ProtectedRoute>
              <AccountSelect />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/accountnew" 
          element={
            <ProtectedRoute>
              <AccountNew />
            </ProtectedRoute>
          } 
        />

        {/* Custom category Routes - �?�?อ�? login ก�?อ�? */}
        <Route 
          path="/customincome" 
          element={
            <ProtectedRoute>
              <CustomIncome />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/customoutcome" 
          element={
            <ProtectedRoute>
              <CustomOutcome />
            </ProtectedRoute>
          } 
        />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>

      {/* แส�?�? BottomNav �?�?�?าะ�?มื�?อ NOT auth page */}
      {!isAuthPage && <BottomNav />}
    </div>
  );
}
// trigger CI test run




