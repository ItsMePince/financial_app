// src/pages/Home.test.tsx
// @ts-nocheck
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import Home from "./Home";

vi.mock("./buttomnav", () => ({ default: () => <div data-testid="bottom-nav" /> }));

function mockFetchOnce(data: any, ok = true, status = 200) {
    global.fetch = vi.fn().mockResolvedValue({
        ok,
        status,
        json: async () => data,
        text: async () => (typeof data === "string" ? data : JSON.stringify(data)),
    }) as any;
}

describe("Home Page", () => {
    beforeEach(() => {
        vi.restoreAllMocks();
        localStorage.clear();
        sessionStorage.clear();
    });

    it("renders total balance", async () => {
        mockFetchOnce([]);
        render(
            <MemoryRouter>
                <Home />
            </MemoryRouter>
        );
        expect(
            await screen.findByText(/Total Balance|ยอดคงเหลือรวม/i)
        ).toBeInTheDocument();
    });

    it("shows loading state", async () => {
        mockFetchOnce([]);
        render(
            <MemoryRouter>
                <Home />
            </MemoryRouter>
        );
        expect(
            screen.getByText(/Loading data|กำลังดึงข้อมูล/i)
        ).toBeInTheDocument();
    });

    it("shows error when API fails", async () => {
        mockFetchOnce({}, false, 500);
        render(
            <MemoryRouter>
                <Home />
            </MemoryRouter>
        );
        expect(
            await screen.findByText(/Failed to fetch data|ดึงข้อมูลล้มเหลว/i)
        ).toBeInTheDocument();
    });

    it("shows message when no data", async () => {
        mockFetchOnce([]);
        render(
            <MemoryRouter>
                <Home />
            </MemoryRouter>
        );
        expect(
            await screen.findByText(/No transactions yet|ยังไม่มีรายการ/i)
        ).toBeInTheDocument();
    });

    it("shows latest transaction when data exists", async () => {
        const fakeTx = [
            {
                id: 1,
                type: "INCOME",
                category: "Salary",
                amount: 5000,
                date: "2025-09-01",
                note: "test",
                iconKey: "Wallet",
            },
        ];
        mockFetchOnce(fakeTx);
        render(
            <MemoryRouter>
                <Home />
            </MemoryRouter>
        );
        expect(await screen.findByText(/test/i)).toBeInTheDocument();
        expect(
            screen.getByText(/\+5,?000|฿5,?000|\+฿5,?000/i)
        ).toBeInTheDocument();
    });

    it("navigates months with prev/next buttons", async () => {
        mockFetchOnce([]);
        render(
            <MemoryRouter>
                <Home />
            </MemoryRouter>
        );
        const prev =
            screen.queryByLabelText(/Previous month|เดือนก่อน/i) ||
            screen.getByRole("button", { name: /Previous|ก่อนหน้า/i });
        const next =
            screen.queryByLabelText(/Next month|เดือนถัดไป/i) ||
            screen.getByRole("button", { name: /Next|ถัดไป/i });

        fireEvent.click(prev as Element);
        fireEvent.click(next as Element);

        expect(prev).toBeInTheDocument();
        expect(next).toBeInTheDocument();
    });

    it("More → Delete account triggers confirm", async () => {
        localStorage.setItem(
            "accounts",
            JSON.stringify([{ name: "TestBank", amount: 1000, iconKey: "bank" }])
        );
        mockFetchOnce([]);
        vi.spyOn(window, "confirm").mockReturnValue(true);

        render(
            <MemoryRouter>
                <Home />
            </MemoryRouter>
        );

        const moreBtn =
            (await screen.findByLabelText(/More actions|ตัวเลือกเพิ่มเติม|เมนูเพิ่มเติม/i)) ||
            screen.getByRole("button", { name: /More|เพิ่มเติม/i });
        fireEvent.click(moreBtn);

        const del =
            screen.queryByText(/Delete|ลบ/i) ||
            screen.getByRole("menuitem", { name: /Delete|ลบ/i });
        fireEvent.click(del as Element);

        expect(window.confirm).toHaveBeenCalled();
    });
});
