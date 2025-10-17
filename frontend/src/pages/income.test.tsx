// src/pages/income.test.tsx
// @ts-nocheck
import React from "react";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import Income from "./income";

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
    if (byRole) return byRole as HTMLButtonElement;

    const byClass = document.querySelector<HTMLButtonElement>(".ok-btn");
    if (byClass) return byClass;

    throw new Error("Confirm button not found");
}

function getBackspaceBtn() {
    const byRole =
        screen.queryByRole("button", { name: /ลบ|backspace|del/i }) ||
        screen.queryByLabelText?.(/ลบ|backspace|del/i);
    if (byRole) return byRole as HTMLButtonElement;

    const byClass = document.querySelector<HTMLButtonElement>(".keypad .key.danger");
    if (byClass) return byClass;

    throw new Error("Backspace button not found");
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

    it("renders title and confirm button", () => {
        render(
            <MemoryRouter>
                <Income />
            </MemoryRouter>
        );
        expect(screen.getByText(/Income|รายรับ/i)).toBeInTheDocument();
        expect(getConfirmBtn()).toBeInTheDocument();
    });

    it("can select a category", () => {
        render(
            <MemoryRouter>
                <Income />
            </MemoryRouter>
        );

        const anyCategoryBtn =
            screen.queryByRole("button", { name: /Work|งาน|Job|เงินเดือน|Salary|Freelance|ฟรีแลนซ์/i }) ||
            screen.queryAllByRole("button").find((b) => /work|job|salary|freelance|งาน|เงินเดือน|ฟรีแลนซ์/i.test(b?.textContent || "")) ||
            screen.getAllByText(/Work|งาน|Job|เงินเดือน|Salary|Freelance|ฟรีแลนซ์/i)[0];

        fireEvent.click(anyCategoryBtn as Element);
        const isActive =
            (anyCategoryBtn as HTMLElement).className.match(/active/) ||
            (anyCategoryBtn as HTMLElement).closest(".cat")?.className.match(/active/);
        expect(isActive).toBeTruthy();
    });

    it("keypad: inputs digits and can backspace", () => {
        render(
            <MemoryRouter>
                <Income />
            </MemoryRouter>
        );

        const keypad = document.querySelector(".keypad") as HTMLElement;
        const amountEl =
            (document.querySelector(".amount .num") as HTMLElement) ||
            (screen.getByText(/0/) as HTMLElement);

        fireEvent.click(within(keypad).getByText("1"));
        fireEvent.click(within(keypad).getByText("2"));
        expect(amountEl.textContent || "").toMatch(/12/);

        fireEvent.click(getBackspaceBtn());
        expect(amountEl.textContent || "").toMatch(/1(?!\d)/);
    });

    it("shows alert when required fields are missing", async () => {
        render(
            <MemoryRouter>
                <Income />
            </MemoryRouter>
        );

        fireEvent.click(getConfirmBtn());

        await waitFor(() => {
            expect(window.alert).toHaveBeenCalled();
            const msg = (window.alert as any).mock.calls[0]?.[0] ?? "";
            expect(String(msg)).toMatch(/Required|กรอก|จำเป็น|โปรด/i);
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

        const noteInput =
            screen.queryByPlaceholderText(/Note|หมายเหตุ/i) ||
            screen.queryByRole("textbox", { name: /Note|หมายเหตุ/i });
        if (noteInput) {
            fireEvent.change(noteInput, { target: { value: "test note" } });
        }

        const catInput =
            screen.queryByPlaceholderText(/Category|หมวดหมู่/i) ||
            screen.queryByRole("textbox", { name: /Category|หมวดหมู่/i });
        if (catInput) {
            fireEvent.change(catInput, { target: { value: "office" } });
        } else {
            const anyCategoryBtn =
                screen.queryByRole("button", { name: /Work|งาน|Job|เงินเดือน|Salary|Freelance|ฟรีแลนซ์/i }) ||
                screen.getAllByText(/Work|งาน|Job|เงินเดือน|Salary|Freelance|ฟรีแลนซ์/i)[0];
            fireEvent.click(anyCategoryBtn as Element);
        }

        const keypad = document.querySelector(".keypad") as HTMLElement;
        fireEvent.click(within(keypad).getByText("1"));
        fireEvent.click(within(keypad).getByText("0"));

        fireEvent.click(getConfirmBtn());

        await waitFor(() => {
            expect(fetchMock).toHaveBeenCalled();
            expect(window.alert).toHaveBeenCalled();
            const msg = (window.alert as any).mock.calls.at(-1)?.[0] ?? "";
            expect(String(msg)).toMatch(/Saved|สำเร็จ|บันทึก/i);
        });
    });
});
