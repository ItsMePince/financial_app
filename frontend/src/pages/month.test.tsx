// src/pages/month.test.tsx
import React from "react";
import { render, screen, waitFor, fireEvent, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, vi, beforeAll, beforeEach } from "vitest";
import Month from "./month";

/* ---------------- Polyfill for Recharts ---------------- */
beforeAll(() => {
    if (typeof (globalThis as any).ResizeObserver === "undefined") {
        (globalThis as any).ResizeObserver = class {
            observe() {}
            unobserve() {}
            disconnect() {}
        };
    }
});

const onlyNumber = (s: string | null | undefined) => (s ?? "").replace(/\D/g, "");

function mockFetchResolveOnce(data: any, ok = true) {
    (globalThis.fetch as any) = vi.fn().mockResolvedValue({
        ok,
        json: async () => data,
        text: async () => (typeof data === "string" ? data : JSON.stringify(data)),
    }) as any;
}

describe("Month Page", () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    it("shows loading state at first render", async () => {
        let resolveFn: (v: any) => void = () => {};
        const pending = new Promise((res) => (resolveFn = res));
        (globalThis.fetch as any) = vi.fn().mockReturnValueOnce(pending);

        render(
            <MemoryRouter>
                <Month />
            </MemoryRouter>
        );

        const loadingEls = screen.getAllByText((_, node) =>
            !!node?.textContent?.toLowerCase().includes("load")
        );
        expect(loadingEls.length).toBeGreaterThanOrEqual(1);

        resolveFn({
            ok: true,
            json: async () => [],
            text: async () => "[]",
        });

        await waitFor(() => {
            const still = screen.queryAllByText((_, node) =>
                !!node?.textContent?.toLowerCase().includes("load")
            );
            expect(still.length).toBe(0);
        });
    });

    it("shows error message when API fails", async () => {
        (globalThis.fetch as any) = vi.fn().mockResolvedValue({
            ok: false,
            status: 500,
            text: async () => "Server error",
        }) as any;

        render(
            <MemoryRouter>
                <Month />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText(/Failed to fetch data/i)).toBeInTheDocument();
        });
    });

    it("shows 'No transactions yet' when API returns empty array", async () => {
        mockFetchResolveOnce([]);

        render(
            <MemoryRouter>
                <Month />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText(/No transactions yet/i)).toBeInTheDocument();
        });

        const kpiInline = screen.getByText(/Income:/i).closest(".kpi-inline") as HTMLElement;
        const incomeEl = kpiInline.querySelector("b.income") as HTMLElement;
        const expenseEl = kpiInline.querySelector("b.expense") as HTMLElement;
        const balanceEl = kpiInline.querySelector("b.balance") as HTMLElement;

        expect(onlyNumber(incomeEl.textContent)).toBe("0");
        expect(onlyNumber(expenseEl.textContent)).toBe("0");
        expect(onlyNumber(balanceEl.textContent)).toBe("0");
    });

    it("renders summary from data and computes KPIs correctly", async () => {
        const sample = [
            { id: 1, date: "2025-09-01", type: "INCOME", amount: 12000, category: "Salary" },
            { id: 2, date: "2025-09-01", type: "EXPENSE", amount: 3000, category: "Food" },
        ];

        const fetchMock = vi.spyOn(globalThis as any, "fetch").mockResolvedValue({
            ok: true,
            json: async () => sample,
            text: async () => JSON.stringify(sample),
        } as any);

        render(
            <MemoryRouter>
                <Month />
            </MemoryRouter>
        );

        await waitFor(() => expect(fetchMock).toHaveBeenCalled());

        const title = await screen.findByText(/Summary/i);
        const summaryCard = title.closest(".summary-card") as HTMLElement;

        const kpi = summaryCard.querySelector(".kpi-inline") as HTMLElement;
        expect(within(kpi).getByText(/12,?000/)).toBeInTheDocument();
        expect(within(kpi).getByText(/3,?000/)).toBeInTheDocument();
        expect(within(kpi).getByText(/9,?000/)).toBeInTheDocument();

        expect(await screen.findAllByText(/12,?000/)).not.toHaveLength(0);
        expect(await screen.findAllByText(/3,?000/)).not.toHaveLength(0);
        expect(await screen.findAllByText(/9,?000/)).not.toHaveLength(0);
    });

    it("navigates months with previous/next and refetches", async () => {
        (globalThis.fetch as any) = vi
            .fn()
            .mockResolvedValueOnce({ ok: true, json: async () => [], text: async () => "[]" })
            .mockResolvedValueOnce({ ok: true, json: async () => [], text: async () => "[]" })
            .mockResolvedValueOnce({ ok: true, json: async () => [], text: async () => "[]" });

        render(
            <MemoryRouter>
                <Month />
            </MemoryRouter>
        );

        await waitFor(
            () => {
                const still = screen.queryAllByText((_, node) =>
                    !!node?.textContent?.toLowerCase().includes("load")
                );
                expect(still.length).toBe(0);
            },
            { timeout: 3000 }
        );

        const getChipText = () =>
            (document.querySelector(".month-chip") as HTMLElement)?.textContent?.trim() ?? "";

        const initialText = getChipText();
        expect(initialText).not.toBe("");

        fireEvent.click(screen.getByRole("button", { name: "Previous" }));
        await waitFor(
            () => {
                expect(getChipText()).not.toBe(initialText);
            },
            { timeout: 3000 }
        );

        fireEvent.click(screen.getByRole("button", { name: "Next" }));
        await waitFor(
            () => {
                expect(getChipText()).toBe(initialText);
            },
            { timeout: 3000 }
        );

        await waitFor(
            () => {
                expect(((globalThis.fetch as any).mock.calls.length)).toBeGreaterThanOrEqual(2);
            },
            { timeout: 3000 }
        );
    });
});
