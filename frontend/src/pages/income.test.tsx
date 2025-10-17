// src/pages/income.test.tsx
import React from "react";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import Income from "./income";

// mock BottomNav �?�?ื�?อ�?ม�?�?ห�? error �?รื�?อ�? useLocation
vi.mock("./buttomnav", () => ({
  default: () => <div data-testid="bottom-nav" />,
}));

// mock usePaymentMethod
vi.mock("../PaymentMethodContext", () => ({
  usePaymentMethod: () => ({
    payment: { name: "�?�?ิ�?ส�?" },
    setPayment: vi.fn(),
  }),
}));

function getConfirmBtn() {
  const buttons = screen.getAllByRole("button") as HTMLButtonElement[];
  const btn = buttons.find((b) => b.classList.contains("ok-btn"));
  if (!btn) throw new Error("�?ม�?�?�?�?ุ�?มยื�?ยั�? (.ok-btn)");
  return btn;
}

function getBackspaceBtn() {
  const btn = document.querySelector<HTMLButtonElement>(".keypad .key.danger");
  if (!btn) throw new Error("�?ม�?�?�?�?ุ�?มล�? (.keypad .key.danger)");
  return btn;
}

describe("Income Page", () => {
  const originalAlert = window.alert;
  beforeEach(() => {
    vi.restoreAllMocks();
    window.alert = vi.fn();
    sessionStorage.clear();
  });
  afterEach(() => {
    window.alert = originalAlert;
  });

  it("แส�?�?หัว�?�?อ 'ราย�?�?�?' และ�?ุ�?ม confirm", () => {
    render(
      <MemoryRouter>
        <Income />
      </MemoryRouter>
    );
    expect(screen.getByText("ราย�?�?�?")).toBeInTheDocument();
    expect(getConfirmBtn()).toBeInTheDocument();
  });

  it("สามาร�?�?ลือกหมว�?หมู�?�?�?�?", () => {
    render(
      <MemoryRouter>
        <Income />
      </MemoryRouter>
    );
    const workBtn = screen.getByRole("button", { name: /�?ำ�?า�?/ });
    fireEvent.click(workBtn);
    expect(workBtn.className).toMatch(/active/);
  });

  it("keypad: �?ิม�?�?�?ัว�?ล�?และล�?�?�?�?", () => {
    render(
      <MemoryRouter>
        <Income />
      </MemoryRouter>
    );

    const keypad = document.querySelector(".keypad") as HTMLElement;
    const amountEl = document.querySelector(".amount .num") as HTMLElement;

    // �?ำกั�?การ�?�?�?หา�?�? keypad �?�?�?า�?ั�?�? �?�?ื�?อ�?ม�?�?�?�?�?�?ัว�?ล�?�?ี�?แส�?�?�?ล
    fireEvent.click(within(keypad).getByText("1"));
    fireEvent.click(within(keypad).getByText("2"));

    expect(amountEl).toHaveTextContent("12");

    // ล�?�?ัว�?ล�?�?�?วย�?ุ�?ม�?อ�?อ�?
    fireEvent.click(getBackspaceBtn());
    expect(amountEl).toHaveTextContent("1");
  });

  it("แส�?�? alert �?�?า required field �?ม�?�?ร�?", async () => {
    render(
      <MemoryRouter>
        <Income />
      </MemoryRouter>
    );

    fireEvent.click(getConfirmBtn());

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith("Required �?");
    });
  });

  it("�?รียก API และ reset �?มื�?อ�?�?อมูล�?ร�?�?�?ว�?", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
        text: async () => "OK",
      } as Response);

    render(
      <MemoryRouter>
        <Income />
      </MemoryRouter>
    );

    // กรอก�?�?า�?ี�?�?ำ�?�?�?�?
    fireEvent.change(screen.getByPlaceholderText("�?�?�?�?"), {
      target: { value: "test note" },
    });
    fireEvent.change(screen.getByPlaceholderText("ส�?า�?�?ี�?"), {
      target: { value: "office" },
    });

    // �?ิม�?�?�?ำ�?ว�?�?�?ิ�? 10 (�?�? keypad)
    const keypad = document.querySelector(".keypad") as HTMLElement;
    fireEvent.click(within(keypad).getByText("1"));
    fireEvent.click(within(keypad).getByText("0"));

    // ก�? confirm
    fireEvent.click(getConfirmBtn());

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalled();
      expect(window.alert).toHaveBeenCalledWith("�?ั�?�?ึก�?รีย�?ร�?อย �??");
    });
  });
});



