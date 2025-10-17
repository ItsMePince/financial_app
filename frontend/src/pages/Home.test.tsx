// src/pages/Home.test.tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import Home from "./Home";

function mockFetchOnce(data: any, ok = true, status = 200) {
    global.fetch = vi.fn().mockResolvedValue({
        ok,
        status,
        json: async () => data,
    }) as any;
}

describe("Home Page", () => {
    beforeEach(() => {
        vi.restoreAllMocks();
        localStorage.clear();
    });

    it("renders total balance", async () => {
        mockFetchOnce([]);
        render(
            <MemoryRouter>
                <Home />
            </MemoryRouter>
        );
        expect(await screen.findByText(/Total Balance/i)).toBeInTheDocument();
    });

    it("shows loading state", async () => {
        mockFetchOnce([]);
        render(
            <MemoryRouter>
                <Home />
            </MemoryRouter>
        );
        expect(screen.getByText(/Loading data/i)).toBeInTheDocument();
    });

    it("shows error when API fails", async () => {
        mockFetchOnce({}, false, 500);
        render(
            <MemoryRouter>
                <Home />
            </MemoryRouter>
        );
        expect(await screen.findByText(/Failed to fetch data/i)).toBeInTheDocument();
    });

    it("shows message when no data", async () => {
        mockFetchOnce([]);
        render(
            <MemoryRouter>
                <Home />
            </MemoryRouter>
        );
        expect(await screen.findByText(/No transactions yet/i)).toBeInTheDocument();
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
        expect(await screen.findByText(/test/)).toBeInTheDocument();
        expect(screen.getByText(/\+5,000/)).toBeInTheDocument();
    });

    it("navigates months with prev/next buttons", async () => {
        mockFetchOnce([]);
        render(
            <MemoryRouter>
                <Home />
            </MemoryRouter>
        );
        const prev = screen.getByLabelText("Previous month");
        const next = screen.getByLabelText("Next month");
        fireEvent.click(prev);
        fireEvent.click(next);
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

        fireEvent.click(await screen.findByLabelText("More actions"));
        fireEvent.click(screen.getByText("Delete"));
        expect(window.confirm).toHaveBeenCalled();
    });
});
