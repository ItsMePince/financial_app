// src/pages/expense.test.tsx
import React from "react";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import Expense from "./expense";
import { TempCategoryProvider } from "../TempCategoryContext";

// �?? mock BottomNav กั�? useLocation error
vi.mock("./buttomnav", () => ({
  default: () => <div data-testid="bottom-nav" />,
}));

// �?? mock usePaymentMethod �?�?ื�?อ�?ม�?�?�?อ�?�?�?�? Provider �?ริ�?
vi.mock("../PaymentMethodContext", () => ({
  usePaymentMethod: () => ({
    payment: { name: "�?�?ิ�?ส�?" },
    setPayment: vi.fn(),
  }),
}));

// helper: �?ลือก�?ุ�?มยื�?ยั�?�?�?วย class
function getConfirmBtn() {
  const btn = document.querySelector<HTMLButtonElement>(".ok-btn");
  if (!btn) throw new Error("�?ม�?�?�?�?ุ�?มยื�?ยั�? (.ok-btn)");
  return btn;
}

// helper: �?ลือก�?ุ�?มล�?�?�? keypad �?�?วย class
function getBackspaceBtn() {
  const btn = document.querySelector<HTMLButtonElement>(".keypad .key.danger");
  if (!btn) throw new Error("�?ม�?�?�?�?ุ�?มล�? (.keypad .key.danger)");
  return btn;
}

// helper: render �?ร�?อม TempCategoryProvider
function renderWithProviders(ui: React.ReactNode) {
  return render(
    <MemoryRouter>
      <TempCategoryProvider>{ui}</TempCategoryProvider>
    </MemoryRouter>
  );
}

// mock fetch �?ีละ�?รั�?�?
function mockFetchOnce(data: any, ok = true, status = 200) {
  global.fetch = vi.fn().mockResolvedValue({
    ok,
    status,
    json: async () => data,
    text: async () => (typeof data === "string" ? data : JSON.stringify(data)),
  }) as any;
}

describe("Expense Page", () => {
  const originalAlert = window.alert;
  beforeEach(() => {
    vi.restoreAllMocks();
    window.alert = vi.fn();
    sessionStorage.clear();
  });
  afterEach(() => {
    window.alert = originalAlert;
  });

  it("แส�?�?หัว�?�?อ '�?�?า�?�?�?�?�?าย' และ�?ุ�?ม confirm", () => {
    renderWithProviders(<Expense />);
    expect(screen.getByText("�?�?า�?�?�?�?�?าย")).toBeInTheDocument();
    expect(getConfirmBtn()).toBeInTheDocument();
  });

  it("สามาร�?�?ลือกหมว�?หมู�?�?�?�?", () => {
    renderWithProviders(<Expense />);
    const giftBtn = screen.getByText("�?อ�?�?วัญ");
    fireEvent.click(giftBtn);
    // �?�?ร�?สร�?า�?�?ุ�?ม�?�?�?�? <button class="cat ..."><span>�?อ�?�?วัญ</span></button>
    // �?ึ�?�?�?�?�? class �?ี�? element �?อ�? span (parent �?ือ button)
    expect(giftBtn.parentElement).toHaveClass("cat");
    expect(giftBtn.parentElement?.className).toMatch(/active/);
  });

  it("keypad: �?ิม�?�?�?ัว�?ล�?และล�?�?�?�?", () => {
    renderWithProviders(<Expense />);

    const keypad = document.querySelector(".keypad") as HTMLElement;
    const amountEl = document.querySelector(".amount .num") as HTMLElement;

    // �?ำกั�?การ�?�?�?หา�?�? keypad �?�?ื�?อ�?ม�?�?�?กั�?�?ัว�?ล�?แส�?�?�?ล
    fireEvent.click(within(keypad).getByText("1"));
    fireEvent.click(within(keypad).getByText("2"));

    expect(amountEl).toHaveTextContent("12");

    // ล�? 1 �?ัว
    fireEvent.click(getBackspaceBtn());
    expect(amountEl).toHaveTextContent("1");
  });

  it("แส�?�? alert �?�?า required field �?ม�?�?ร�?", async () => {
    renderWithProviders(<Expense />);
    fireEvent.click(getConfirmBtn());
    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith("Required �?");
    });
  });

  it("�?รียก API และ reset �?มื�?อ�?�?อมูล�?ร�?�?�?ว�?", async () => {
    mockFetchOnce({}, true);

    renderWithProviders(<Expense />);

    // กรอก�?ิล�?�?�?ี�?�?ำ�?�?�?�?
    fireEvent.change(screen.getByPlaceholderText("�?�?�?�?"), {
      target: { value: "test note" },
    });
    fireEvent.change(screen.getByPlaceholderText("ส�?า�?�?ี�?"), {
      target: { value: "office" },
    });

    const keypad = document.querySelector(".keypad") as HTMLElement;
    fireEvent.click(within(keypad).getByText("1"));
    fireEvent.click(within(keypad).getByText("0"));

    fireEvent.click(getConfirmBtn());

    await waitFor(() => {
      expect(fetch).toHaveBeenCalled();
      expect(window.alert).toHaveBeenCalledWith("�?ั�?�?ึก�?รีย�?ร�?อย �??");
    });
  });
});



