// src/pages/accountnew.test.tsx
import React from "react";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import AccountNew from "./accountnew";

// ---- mock useNavigate (vitest) ----
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
    const actual: any = await vi.importActual("react-router-dom");
    return { ...actual, useNavigate: () => mockNavigate };
});

beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    vi.spyOn(window, "alert").mockImplementation(() => {});
});

// helper: pick dropdown trigger (separate from its label)
function getTypeDropdownTrigger(): HTMLElement {
    const all = screen.getAllByText(/Type/i);
    const placeholderEl = all.find((el) => (el as any).classList?.contains("placeholder"));
    if (placeholderEl) return placeholderEl as HTMLElement;
    if (all.length > 1) return all[1] as HTMLElement;
    return all[0] as HTMLElement;
}

describe("AccountNew Page", () => {
    it("renders title 'Create Account' and confirm button", () => {
        render(
            <MemoryRouter>
                <AccountNew />
            </MemoryRouter>
        );
        expect(screen.getByText(/Create Account/i)).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /Confirm/i })).toBeInTheDocument();
    });

    it("shows alert when form invalid", () => {
        render(
            <MemoryRouter>
                <AccountNew />
            </MemoryRouter>
        );
        fireEvent.click(screen.getByRole("button", { name: /Confirm/i }));
        expect(window.alert).toHaveBeenCalledWith(
            "Please complete all fields and enter a valid amount"
        );
    });

    it("can select account type and an icon", () => {
        render(
            <MemoryRouter>
                <AccountNew />
            </MemoryRouter>
        );

        const trigger = getTypeDropdownTrigger();
        fireEvent.click(trigger);

        const dd = document.querySelector(".dropdown") as HTMLElement;
        const bankOption = within(dd).getByText(/Bank/i);
        fireEvent.click(bankOption);

        expect(screen.getByText(/Bank/i)).toBeInTheDocument();

        const piggyBtn = screen.getByRole("button", { name: /Piggy Bank/i });
        fireEvent.click(piggyBtn);
        expect(piggyBtn).toHaveClass("active");
    });

    it.skip("saves new account to localStorage and navigates to /home (integration)", async () => {
        render(
            <MemoryRouter>
                <AccountNew />
            </MemoryRouter>
        );

        fireEvent.change(screen.getByPlaceholderText(/Account name/i), {
            target: { value: "MyCash" },
        });

        const trigger = getTypeDropdownTrigger();
        fireEvent.click(trigger);

        const dd = document.querySelector(".dropdown") as HTMLElement;
        fireEvent.click(within(dd).getByText(/Cash/i));

        fireEvent.change(screen.getByPlaceholderText(/Amount/i), {
            target: { value: "1000" },
        });

        fireEvent.click(screen.getByRole("button", { name: /Confirm/i }));

        await waitFor(() => {
            const saved = JSON.parse(localStorage.getItem("accounts") || "[]");
            expect(saved).toHaveLength(1);
            expect(saved[0].name).toBe("MyCash");
            expect(mockNavigate).toHaveBeenCalledWith(expect.stringMatching(/^\/home$/i));
        });
    });

    it.skip("edit mode: prefill, submit, and persist updates", async () => {
        const initAcc = { name: "Old", amount: 50, iconKey: "wallet", type: "Cash" };
        localStorage.setItem("accounts", JSON.stringify([initAcc]));

        render(
            <MemoryRouter
                initialEntries={[
                    { pathname: "/edit", state: { mode: "edit", index: 0, account: initAcc } } as any,
                ]}
            >
                <AccountNew />
            </MemoryRouter>
        );

        expect(screen.getByDisplayValue("Old")).toBeInTheDocument();
        expect(screen.getByDisplayValue("50")).toBeInTheDocument();

        fireEvent.change(screen.getByPlaceholderText(/Account name/i), {
            target: { value: "Updated" },
        });
        fireEvent.click(screen.getByRole("button", { name: /Save changes/i }));

        await waitFor(() => {
            const saved = JSON.parse(localStorage.getItem("accounts") || "[]");
            expect(saved[0].name).toBe("Updated");
            expect(mockNavigate).toHaveBeenCalledWith(expect.stringMatching(/^\/home$/i));
        });
    });
});
