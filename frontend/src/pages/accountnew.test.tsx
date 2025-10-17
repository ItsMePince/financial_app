// @ts-nocheck
import React from "react";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import AccountNew from "./accountnew";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
    const actual: any = await vi.importActual("react-router-dom");
    return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock("./buttomnav", () => ({ default: () => <div data-testid="bottom-nav" /> }));

beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    vi.spyOn(window, "alert").mockImplementation(() => {});
});

function getTypeDropdownTrigger(): HTMLElement {
    const btns = screen.getAllByRole("button") as HTMLElement[];
    const byText = btns.find((b) => /ประเภท|เงินสด|ธนาคาร|บัตรเครดิต/.test(b.textContent || ""));
    if (byText) return byText;
    const byClass = btns.find((b) => (b as HTMLElement).classList?.contains("select"));
    if (byClass) return byClass;
    throw new Error("ไม่พบปุ่มเลือกประเภทบัญชี");
}

describe("AccountNew Page (TH UI)", () => {
    it("เรนเดอร์หัวข้อ 'สร้างบัญชี' และปุ่ม 'ยืนยัน'", () => {
        render(
            <MemoryRouter>
                <AccountNew />
            </MemoryRouter>
        );
        expect(screen.getByText(/สร้างบัญชี/i)).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /ยืนยัน/i })).toBeInTheDocument();
    });

    it("แสดง alert เมื่อฟอร์มไม่ครบหรือจำนวนเงินไม่ถูกต้อง", () => {
        render(
            <MemoryRouter>
                <AccountNew />
            </MemoryRouter>
        );
        fireEvent.click(screen.getByRole("button", { name: /ยืนยัน/i }));
        expect(window.alert).toHaveBeenCalledWith("กรอกข้อมูลให้ครบถ้วน และจำนวนเงินให้ถูกต้อง");
    });

    it("เลือกประเภทบัญชี และเลือกไอคอนได้", () => {
        render(
            <MemoryRouter>
                <AccountNew />
            </MemoryRouter>
        );

        const trigger = getTypeDropdownTrigger();
        fireEvent.click(trigger);

        const dd = screen.getByRole("listbox", { name: /เลือกประเภทบัญชี/i });
        const bankOption = within(dd).getByRole("option", { name: "ธนาคาร" });
        fireEvent.click(bankOption);

        expect(screen.getByRole("button", { name: /ธนาคาร/ })).toBeInTheDocument();

        const piggyBtn = screen.getByRole("button", { name: /กระปุก/i });
        fireEvent.click(piggyBtn);
        expect(piggyBtn).toHaveClass("active");
    });

    it("บันทึกบัญชีใหม่ลง localStorage และนำทางไป /home (integration)", async () => {
        render(
            <MemoryRouter>
                <AccountNew />
            </MemoryRouter>
        );

        fireEvent.change(screen.getByPlaceholderText(/ชื่อบัญชี/i), {
            target: { value: "เงินสดของฉัน" }
        });

        const trigger = getTypeDropdownTrigger();
        fireEvent.click(trigger);
        const dd = screen.getByRole("listbox", { name: /เลือกประเภทบัญชี/i });
        fireEvent.click(within(dd).getByRole("option", { name: "เงินสด" }));

        const amountInput = screen.getByLabelText(/จำนวนเงินตั้งต้น/i);
        fireEvent.change(amountInput, { target: { value: "1000" } });

        fireEvent.click(screen.getByRole("button", { name: /ยืนยัน/i }));

        await waitFor(() => {
            const saved = JSON.parse(localStorage.getItem("accounts") || "[]");
            expect(saved).toHaveLength(1);
            expect(saved[0].name).toBe("เงินสดของฉัน");
            expect(saved[0].amount).toBe(1000);
            expect(mockNavigate).toHaveBeenCalledWith("/home");
        });
    });

    it("โหมดแก้ไข: prefill, บันทึกการแก้ไข, และ persist สำเร็จ", async () => {
        const initAcc = { name: "เก่า", amount: 50, iconKey: "wallet", type: "เงินสด" as const };
        localStorage.setItem("accounts", JSON.stringify([initAcc]));

        render(
            <MemoryRouter
                initialEntries={[
                    { pathname: "/edit", state: { mode: "edit", index: 0, account: initAcc } } as any
                ]}
            >
                <AccountNew />
            </MemoryRouter>
        );

        expect(screen.getByText(/แก้ไขบัญชี/i)).toBeInTheDocument();
        expect(screen.getByDisplayValue("เก่า")).toBeInTheDocument();
        expect(screen.getByDisplayValue("50")).toBeInTheDocument();

        fireEvent.change(screen.getByPlaceholderText(/ชื่อบัญชี/i), {
            target: { value: "อัปเดตแล้ว" }
        });
        fireEvent.click(screen.getByRole("button", { name: /บันทึกการแก้ไข/i }));

        await waitFor(() => {
            const saved = JSON.parse(localStorage.getItem("accounts") || "[]");
            expect(saved[0].name).toBe("อัปเดตแล้ว");
            expect(mockNavigate).toHaveBeenCalledWith("/home");
        });
    });
});
