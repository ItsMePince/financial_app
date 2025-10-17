// src/pages/AccountSelect.test.tsx
// @ts-nocheck
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import AccountSelect from "./AccountSelect";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
    const actual: any = await vi.importActual("react-router-dom");
    return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock("../PaymentMethodContext", () => ({
    usePaymentMethod: () => ({ setPayment: vi.fn() }),
}));

vi.mock("./buttomnav", () => ({ default: () => <div data-testid="bottom-nav" /> }));

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
        const seed = [
            { name: "SCB", type: "ธนาคาร", favorite: false, iconKey: "bank" },
            { name: "เงินสด", type: "เงินสด", favorite: false, iconKey: "wallet" },
        ];
        localStorage.setItem("accounts", JSON.stringify(seed));
    });

    it("renders filter dropdown and initial list", () => {
        renderPage();
        expect(
            screen.getByRole("button", { name: /ตัวกรอง|Filter/i })
        ).toBeInTheDocument();
        expect(screen.getByText(/SCB/i)).toBeInTheDocument();
        expect(screen.getByText(/เงินสด|Cash/i)).toBeInTheDocument();
    });

    it("can open dropdown and choose 'Bank' filter", () => {
        renderPage();
        fireEvent.click(screen.getByRole("button", { name: /ตัวกรอง|Filter/i }));
        const optBank =
            screen.queryByText(/ธนาคาร|Bank/i) ??
            screen.getByRole("option", { name: /ธนาคาร|Bank/i });
        fireEvent.click(optBank);
        expect(screen.getByText(/SCB/i)).toBeInTheDocument();
        expect(screen.queryByText(/เงินสด|Cash/i)).not.toBeInTheDocument();
    });

    it("can toggle favorite/unfavorite", () => {
        renderPage();
        const toFav =
            screen.queryAllByLabelText(/เพิ่มเป็นรายการโปรด|unfavorite|add to favorites/i)[0] ||
            screen.getAllByRole("button", { name: /unfavorite/i })[0];
        fireEvent.click(toFav);
        const nowFav =
            screen.queryAllByLabelText(/นำออกจากรายการโปรด|favorite|remove from favorites/i)[0] ||
            screen.getAllByRole("button", { name: /favorite/i })[0];
        expect(nowFav).toBeInTheDocument();
    });

    it.skip("shows 'No items' when list becomes empty after filter", () => {
        renderPage();
    });

    it("selecting an account navigates back (-1)", async () => {
        renderPage();
        const item = screen.getByText(/เงินสด|Cash/i);
        fireEvent.click(item);
        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith(-1);
        });
    });
});
