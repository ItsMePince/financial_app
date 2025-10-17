// src/pages/income.test.tsx
import React from "react";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import Income from "./income";

// mock BottomNav to avoid useLocation errors
vi.mock("./buttomnav", () => ({
    default: () => <div data-testid="bottom-nav" />,
}));

// mock usePaymentMethod
vi.mock("../PaymentMethodContext", () => ({
    usePaymentMethod: () => ({
        payment: { name: "Bank" },
        setPayment: vi.fn(),
    }),
}));

function getConfirmBtn() {
    const buttons = screen.getAllByRole("button") as HTMLButtonElement[];
    const btn = buttons.find((b) => b.classList.contains("ok-btn"));
    if (!btn) throw new Error("Confirm button (.ok-btn) not found");
    return btn;
}

function getBackspaceBtn() {
    const btn = document.querySelector<HTMLButtonElement>(".keypad .key.danger");
    if (!btn) throw new Error("Backspace button (.keypad .key.danger) not found");
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

    it("renders title 'Income' and confirm button", () => {
        render(
            <MemoryRouter>
                <Income />
            </MemoryRouter>
        );
        expect(screen.getByText("Income")).toBeInTheDocument();
        expect(getConfirmBtn()).toBeInTheDocument();
    });

    it("can select a category", () => {
        render(
            <MemoryRouter>
                <Income />
            </MemoryRouter>
        );
        const workBtn = screen.getByRole("button", { name: /Work/i });
        fireEvent.click(workBtn);
        expect(workBtn.className).toMatch(/active/);
    });

    it("keypad: inputs digits and can backspace", () => {
        render(
            <MemoryRouter>
                <Income />
            </MemoryRouter>
        );

        const keypad = document.querySelector(".keypad") as HTMLElement;
        const amountEl = document.querySelector(".amount .num") as HTMLElement;

        fireEvent.click(within(keypad).getByText("1"));
        fireEvent.click(within(keypad).getByText("2"));

        expect(amountEl).toHaveTextContent("12");

        fireEvent.click(getBackspaceBtn());
        expect(amountEl).toHaveTextContent("1");
    });

    it("shows alert when required fields are missing", async () => {
        render(
            <MemoryRouter>
                <Income />
            </MemoryRouter>
        );

        fireEvent.click(getConfirmBtn());

        await waitFor(() => {
            expect(window.alert).toHaveBeenCalledWith("Required fields");
        });
    });

    it("calls API and resets after submit", async () => {
        const fetchMock = vi.spyOn(globalThis as any, "fetch").mockResolvedValueOnce({
            ok: true,
            json: async () => ({}),
            text: async () => "OK",
        } as any);

        render(
            <MemoryRouter>
                <Income />
            </MemoryRouter>
        );

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
            expect(fetchMock).toHaveBeenCalled();
            expect(window.alert).toHaveBeenCalledWith("Saved successfully");
        });
    });
});
