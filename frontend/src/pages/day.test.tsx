// src/pages/day.test.tsx
// @ts-nocheck
import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import Day from "./day";

function mockFetchOk(data: any, delay = 0) {
    const resp = { ok: true, json: async () => data } as Response;
    if (delay > 0) {
        return vi.fn().mockImplementation(
            () => new Promise((r) => setTimeout(() => r(resp), delay))
        );
    }
    return vi.fn().mockResolvedValue(resp);
}

function mockFetchErr(status = 500, message?: string) {
    const resp = {
        ok: false,
        status,
        json: async () => {
            throw new Error(message ?? `ดึงรายการไม่สำเร็จ (${status})`);
        },
    } as any;
    return vi.fn().mockResolvedValue(resp);
}

function renderWithRouter(ui: React.ReactNode, initialEntries = ["/day?date=2025-09-24"]) {
    return render(<MemoryRouter initialEntries={initialEntries}>{ui}</MemoryRouter>);
}

function findDisplayedDate(): string | null {
    const all = Array.from(document.querySelectorAll("body *"));
    const re = /\b\d{2}\/\d{2}\/\d{4}\b/;
    for (const el of all) {
        const t = el.textContent ?? "";
        const m = t.match(re);
        if (m) return m[0];
    }
    return null;
}

function fmtTh(d: Date) {
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear() + 543;
    return `${dd}/${mm}/${yyyy}`;
}

beforeEach(() => {
    // @ts-ignore
    global.ResizeObserver =
        global.ResizeObserver ||
        class {
            observe() {}
            unobserve() {}
            disconnect() {}
        };
    vi.restoreAllMocks();
});

afterEach(() => {
    vi.clearAllMocks();
});

describe("Day Page", () => {
    it("แสดงสถานะกำลังโหลดตอนแรก แล้วหายไปเมื่อโหลดเสร็จ", async () => {
        global.fetch = mockFetchOk([], 80) as any;
        renderWithRouter(<Day />);
        expect(
            screen.getByText(/กำลัง|loading/i)
        ).toBeInTheDocument();
        await waitFor(() =>
            expect(
                screen.queryByText(/กำลัง|loading/i)
            ).not.toBeInTheDocument()
        );
    });

    it("แสดงข้อความ error เมื่อ API ล้มเหลว", async () => {
        global.fetch = mockFetchErr(500) as any;
        renderWithRouter(<Day />);
        await waitFor(() =>
            expect(
                screen.getByText(/500|ผิดพลาด|error/i)
            ).toBeInTheDocument()
        );
    });

    it("แสดง 'ไม่มีรายการ' เมื่อ API คืน array ว่าง", async () => {
        global.fetch = mockFetchOk([]) as any;
        renderWithRouter(<Day />);
        await waitFor(() =>
            expect(
                screen.getByText(/ไม่มีรายการ|no items/i)
            ).toBeInTheDocument()
        );
    });

    it("แสดงข้อมูลเมื่อดึงสำเร็จ", async () => {
        const data = [
            { category: "อาหาร", type: "EXPENSE", amount: 120 },
            { category: "ขนมหวาน", type: "EXPENSE", amount: 80 },
        ];
        global.fetch = mockFetchOk(data) as any;
        renderWithRouter(<Day />);
        await waitFor(() =>
            expect(
                screen.getByText(/ประเภท|category/i)
            ).toBeInTheDocument()
        );
        expect(screen.getByText("อาหาร")).toBeInTheDocument();
        expect(screen.getByText("ขนมหวาน")).toBeInTheDocument();
        expect(screen.getAllByText(/120/).length).toBeGreaterThan(0);
        expect(screen.getAllByText(/80/).length).toBeGreaterThan(0);
    });

    it("เปลี่ยนวันได้ด้วยปุ่ม ถัดไป/ก่อนหน้า และเรียก fetch ตามรอบ", async () => {
        const makeResp = (data: any) => ({ ok: true, json: async () => data } as Response);
        global.fetch = vi
            .fn()
            .mockResolvedValueOnce(makeResp([]))
            .mockResolvedValueOnce(makeResp([]))
            .mockResolvedValueOnce(makeResp([]));

        renderWithRouter(<Day />, ["/day?date=2025-09-24"]);

        await waitFor(() => expect(findDisplayedDate()).toMatch(/\d{2}\/\d{2}\/\d{4}/));
        const startStr = findDisplayedDate()!;
        const [dd, mm, th] = startStr.split("/").map(Number);
        const start = new Date(th - 543, mm - 1, dd);

        const nextBtn =
            screen.queryByRole("button", { name: /ถัดไป|next/i }) ||
            screen.getByText(/ถัดไป|next/i);
        fireEvent.click(nextBtn as Element);

        const next = new Date(start);
        next.setDate(next.getDate() + 1);
        await waitFor(() => {
            expect(findDisplayedDate()).toBe(fmtTh(next));
        });

        const prevBtn =
            screen.queryByRole("button", { name: /ก่อนหน้า|prev|previous/i }) ||
            screen.getByText(/ก่อนหน้า|prev|previous/i);
        fireEvent.click(prevBtn as Element);

        await waitFor(() => {
            expect(findDisplayedDate()).toBe(fmtTh(start));
        });

        expect(global.fetch).toHaveBeenCalledTimes(3);
    });
});
