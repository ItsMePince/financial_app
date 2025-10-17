// src/pages/expense.test.tsx
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
    const btn = document.querySelector<HTMLButtonElement>(".ok-btn");
    if (!btn) throw new Error("Confirm button (.ok-btn) not found");
    return btn;
}

function getBackspaceBtn() {
    const btn = document.querySelector<HTMLButtonElement>(".keypad .key.danger");
    if (!btn) throw new Error("Backspace button (.keypad .key.danger) not found");
    return btn;
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

    it("renders title 'Expense' and confirm button", () => {
        renderWithProviders(<Expense />);
        expect(screen.getByText("Expense")).toBeInTheDocument();
        expect(getConfirmBtn()).toBeInTheDocument();
    });

    it("can select a category", () => {
        renderWithProviders(<Expense />);
        const giftBtn = screen.getByText("Gift");
        fireEvent.click(giftBtn);
        expect(giftBtn.parentElement).toHaveClass("cat");
        expect(giftBtn.parentElement?.className).toMatch(/active/);
    });

    it("keypad: inputs digits and can backspace", () => {
        renderWithProviders(<Expense />);

        const keypad = document.querySelector(".keypad") as HTMLElement;
        const amountEl = document.querySelector(".amount .num") as HTMLElement;

        fireEvent.click(within(keypad).getByText("1"));
        fireEvent.click(within(keypad).getByText("2"));
        expect(amountEl).toHaveTextContent("12");

        fireEvent.click(getBackspaceBtn());
        expect(amountEl).toHaveTextContent("1");
    });

    it("shows alert when required fields are missing", async () => {
        renderWithProviders(<Expense />);
        fireEvent.click(getConfirmBtn());
        await waitFor(() => {
            expect(window.alert).toHaveBeenCalledWith("Required fields");
        });
    });

    it("calls API and resets after submit", async () => {
        mockFetchOnce({}, true);

        renderWithProviders(<Expense />);

        fireEvent.change(screen.getByPlaceholderText("Note"), {
            target: { value: "test note" },
        });
        fireEvent.change(screen.getByPlaceholderText("Category"), {
            target: { value: "office" },
        });

        const keypad = document.querySelector(".keypad") as HTMLElement;
        fireEvent.click(within(keypad).getByText("1"));
        fireEvent.click(within(keypad).getByText("0"));

        fireEvent.click(getConfirmBtn());

        await waitFor(() => {
            expect(fetch).toHaveBeenCalled();
            expect(window.alert).toHaveBeenCalledWith("Saved successfully");
        });
    });
});
