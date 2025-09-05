// src/PaymentMethodContext.tsx
// @ts-nocheck
import React, { createContext, useContext, useState } from "react";

type Payment = { id: string; name: string; favorite?: boolean; type?: string } | null;

type Ctx = {
  payment: Payment;
  setPayment: React.Dispatch<React.SetStateAction<Payment>>;
};

const PaymentMethodContext = createContext<Ctx | null>(null);

export function PaymentMethodProvider({ children }: { children: React.ReactNode }) {
  const [payment, setPayment] = useState<Payment>(null);
  return (
    <PaymentMethodContext.Provider value={{ payment, setPayment }}>
      {children}
    </PaymentMethodContext.Provider>
  );
}

export function usePaymentMethod() {
  const ctx = useContext(PaymentMethodContext);
  if (!ctx) throw new Error("usePaymentMethod must be used within PaymentMethodProvider");
  return ctx;
}
