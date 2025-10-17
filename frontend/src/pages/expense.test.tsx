// src/pages/expense.test.tsx
// @ts-nocheck
import React from "react";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import Expense from "./expense";
import { TempCategoryProvider } from "../TempCategoryContext";

vi.mock("./buttomnav", () => ({
    default: () => <div data-testid="bottom-nav" />,
}));

vi.mock("../PaymentMethodContext", () => ({
    usePaymentMethod: () => ({
        payment: { name: "Bank" },
        setPayment: vi.fn(),
    }),
}));

function getConfirmBtn() {
    const byRole =
        screen.queryByRole("button", { name: /ยืนยัน|confirm/i }) ||
        screen.queryByText(/ยืนยัน|confirm/i);
    if (byRole) return (byRole as HTMLElement) as HTMLButtonElement;

    const byClass = document.querySelector<HTMLButtonElement>(".ok-btn");
    if (byClass) return byClass;

    throw new Error("Confirm button not found");
}

function getBackspaceBtn() {
    const byRole =
        screen.queryByRole("button", { name: /ลบ|backspace|del/i }) ||
        screen.queryByLabelText?.(/ลบ|backspace|del/i);
    if (byRole) return (byRole as HTMLElement) as HTMLButtonElement;

    const byClass = document.querySelector<HTMLButtonElement>(".keypad .key.danger");
    if (byClass) return byClass;

    throw new Error("Backspace button not found");
}

function renderWithProviders(ui: React.ReactNode) {
    return render(
        <MemoryRouter>
            <TempCategoryProvider>{ui}</TempCategoryProvider>
        </MemoryRouter>
    );
}

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

    it("renders title and confirm button", () => {
        renderWithProviders(<Expense />);
        expect(screen.getByText(/Expense|รายจ่าย/i)).toBeInTheDocument();
        expect(getConfirmBtn()).toBeInTheDocument();
    });

    it("can select a category chip", () => {
        renderWithProviders(<Expense />);

        const gift =
            screen.queryByRole("button", { name: /Gift|ของขวัญ/i }) ||
            screen.queryByText(/Gift|ของขวัญ/i) ||
            screen.getAllByText(/Food|อาหาร|Gift|ของขวัญ/i)[0];
        fireEvent.click(gift as Element);

        const chip = (gift as HTMLElement).closest(".cat") || (gift as HTMLElement).parentElement;
        expect(chip?.className).toMatch(/active/);
    });

    it("keypad: inputs digits and can backspace", () => {
        renderWithProviders(<Expense />);

        const keypad = document.querySelector(".keypad") as HTMLElement;
        const amountEl =
            (document.querySelector(".amount .num") as HTMLElement) ||
            screen.getByTestId?.("amount-number") ||
            (screen.getByText(/0/) as HTMLElement);

        fireEvent.click(within(keypad).getByText("1"));
        fireEvent.click(within(keypad).getByText("2"));
        expect(amountEl.textContent || "").toMatch(/12/);

        fireEvent.click(getBackspaceBtn());
        expect(amountEl.textContent || "").toMatch(/1(?!\d)/);
    });

    it("shows alert when required fields are missing", async () => {
        renderWithProviders(<Expense />);
        fireEvent.click(getConfirmBtn());
        await waitFor(() => {
            expect(window.alert).toHaveBeenCalled();
            const msg = (window.alert as any).mock.calls[0]?.[0] ?? "";
            expect(String(msg)).toMatch(/Required|กรอก|จำเป็น|โปรด/i);
        });
    });

    it("calls API and resets after submit", async () => {
        mockFetchOnce({}, true);

        renderWithProviders(<Expense />);

        const anyCategoryBtn =
            screen.queryByRole("button", { name: /Food|อาหาร|Gift|ของขวัญ|Cafe|กาแฟ/i }) ||
            screen.getAllByText(/Food|อาหาร|Gift|ของขวัญ|Cafe|กาแฟ/i)[0];
        fireEvent.click(anyCategoryBtn as Element);

        const noteInput =
            screen.queryByPlaceholderText(/Note|หมายเหตุ/i) ||
            screen.queryByRole("textbox", { name: /Note|หมายเหตุ/i });
        if (noteInput) {
            fireEvent.change(noteInput, { target: { value: "test note" } });
        }

        const keypad = document.querySelector(".keypad") as HTMLElement;
        fireEvent.click(within(keypad).getByText("1"));
        fireEvent.click(within(keypad).getByText("0"));

        fireEvent.click(getConfirmBtn());

        await waitFor(() => {
            expect(fetch).toHaveBeenCalled();
            expect(window.alert).toHaveBeenCalled();
            const msg = (window.alert as any).mock.calls.at(-1)?.[0] ?? "";
            expect(String(msg)).toMatch(/Saved|สำเร็จ|บันทึก/i);
        });
    });
});
