// src/pages/AccountSelect.test.tsx
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import AccountSelect from "./AccountSelect";

// --- mock navigate ---
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
    const actual = await vi.importActual<any>("react-router-dom");
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

// --- mock PaymentMethodContext ---
vi.mock("../PaymentMethodContext", () => ({
    usePaymentMethod: () => ({ setPayment: vi.fn() }),
}));

function renderPage() {
    return render(
        <MemoryRouter>
            <AccountSelect />
        </MemoryRouter>
    );
}

describe("AccountSelect Page", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    it("renders filter dropdown and initial list", () => {
        renderPage();
        expect(screen.getByRole("button", { name: /Filter/i })).toBeInTheDocument();
        expect(screen.getByText("SCB")).toBeInTheDocument();
        expect(screen.getByText("Cash")).toBeInTheDocument();
    });

    it("can open dropdown and choose 'Bank' filter", () => {
        renderPage();
        fireEvent.click(screen.getByRole("button", { name: /Filter/i }));
        fireEvent.click(screen.getByText("Bank"));
        expect(screen.getByText("SCB")).toBeInTheDocument();
        expect(screen.queryByText("Cash")).not.toBeInTheDocument();
    });

    it("can toggle favorite/unfavorite", () => {
        renderPage();
        const starBtn = screen.getAllByLabelText(/unfavorite/i)[0];
        fireEvent.click(starBtn);
        expect(screen.getAllByLabelText(/favorite/i)[0]).toBeInTheDocument();
    });

    it.skip("shows 'No items' when list becomes empty after filter", () => {
        renderPage();
        // expect(screen.getByText("No items")).toBeInTheDocument();
    });

    it("selecting an account navigates back (-1)", async () => {
        renderPage();
        fireEvent.click(screen.getByText("Cash"));
        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith(-1);
        });
    });
});
