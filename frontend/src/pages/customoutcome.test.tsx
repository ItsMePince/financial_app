// src/pages/customoutcome.test.tsx
// @ts-nocheck
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import CategoryCustom from "./customoutcome";
import { TempCategoryProvider } from "../TempCategoryContext";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
    const actual: any = await vi.importActual("react-router-dom");
    return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock("./buttomnav", () => ({ default: () => <div data-testid="bottom-nav" /> }));

beforeEach(() => {
    vi.spyOn(window, "alert").mockImplementation(() => {});
});

afterEach(() => {
    vi.restoreAllMocks();
    mockNavigate.mockReset();
});

function renderWithProvider(ui: React.ReactNode) {
    return render(
        <MemoryRouter>
            <TempCategoryProvider>{ui}</TempCategoryProvider>
        </MemoryRouter>
    );
}

function searchInput() {
    return (
        screen.queryByPlaceholderText(/Search icons|ค้นหาไอคอน/i) ||
        screen.getByRole("textbox", { name: /ค้นหา|search/i })
    );
}

function nameInput() {
    return (
        screen.queryByPlaceholderText(/Category name|ชื่อหมวด/i) ||
        screen.getByRole("textbox", { name: /ชื่อ/i })
    );
}

describe("CustomOutcome Page", () => {
    it("renders title", () => {
        renderWithProvider(<CategoryCustom />);
        expect(
            screen.getByText(/OutcomeCustom|กำหนดหมวดรายจ่ายเอง|กำหนดหมวดค่าใช้จ่าย/i)
        ).toBeInTheDocument();
    });

    it("can search and select an icon", () => {
        renderWithProvider(<CategoryCustom />);

        const si = searchInput();
        fireEvent.change(si, { target: { value: "Coffee" } });

        const coffeeBtn =
            screen.queryByTitle(/Coffee/i) ||
            screen.getByRole("button", { name: /Coffee|กาแฟ/i });

        fireEvent.click(coffeeBtn);
        expect(coffeeBtn).toHaveClass("active");
    });

    it("alerts when no icon selected or name empty", () => {
        renderWithProvider(<CategoryCustom />);
        const confirmBtn =
            screen.queryByRole("button", { name: /Confirm|ยืนยัน/i }) ||
            screen.getByText(/Confirm|ยืนยัน/i);
        fireEvent.click(confirmBtn);

        expect(window.alert).toHaveBeenCalled();
        const msg = (window.alert as any).mock.calls[0]?.[0];
        expect(String(msg)).toMatch(
            /(Please select an icon.*enter a name|โปรดเลือกไอคอน.*กรอกชื่อ)/i
        );
    });

    it("saves and navigates back when valid", () => {
        renderWithProvider(<CategoryCustom />);

        const si = searchInput();
        fireEvent.change(si, { target: { value: "Food" } });

        const foodBtn =
            screen.queryByTitle(/Food/i) ||
            screen.getByRole("button", { name: /Food|อาหาร/i });
        fireEvent.click(foodBtn);

        const ni = nameInput();
        fireEvent.change(ni, { target: { value: "Groceries" } });

        const confirmBtn =
            screen.queryByRole("button", { name: /Confirm|ยืนยัน/i }) ||
            screen.getByText(/Confirm|ยืนยัน/i);
        fireEvent.click(confirmBtn);

        expect(mockNavigate).toHaveBeenCalledWith(-1);
    });
});
