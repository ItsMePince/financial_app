// src/pages/customoutcome.test.tsx
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import CategoryCustom from "./customoutcome";
import { TempCategoryProvider } from "../TempCategoryContext";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
    const actual: any = await vi.importActual("react-router-dom");
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

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

describe("CustomOutcome Page", () => {
    it("renders title OutcomeCustom", () => {
        renderWithProvider(<CategoryCustom />);
        expect(screen.getByText("OutcomeCustom")).toBeInTheDocument();
    });

    it("can search and select an icon", () => {
        renderWithProvider(<CategoryCustom />);
        fireEvent.change(screen.getByPlaceholderText(/Search icons/i), {
            target: { value: "Coffee" },
        });
        const coffeeBtn = screen.getByTitle("Coffee");
        fireEvent.click(coffeeBtn);
        expect(coffeeBtn).toHaveClass("active");
    });

    it("alerts when no icon selected or name empty", () => {
        renderWithProvider(<CategoryCustom />);
        const confirmBtn = screen.getByRole("button", { name: "Confirm" });
        fireEvent.click(confirmBtn);
        expect(window.alert).toHaveBeenCalledWith("Please select an icon and enter a name");
    });

    it("saves and navigates back when valid", () => {
        renderWithProvider(<CategoryCustom />);

        fireEvent.change(screen.getByPlaceholderText(/Search icons/i), {
            target: { value: "Food" },
        });
        fireEvent.click(screen.getByTitle("Food"));

        fireEvent.change(screen.getByPlaceholderText("Category name"), {
            target: { value: "Groceries" },
        });

        fireEvent.click(screen.getByRole("button", { name: "Confirm" }));

        expect(mockNavigate).toHaveBeenCalledWith(-1);
    });
});
