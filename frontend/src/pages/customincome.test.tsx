// src/pages/customincome.test.tsx
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import CustomIncome from "./customincome";

// mock useNavigate
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
    mockNavigate.mockReset();
});

afterEach(() => {
    vi.restoreAllMocks();
});

function renderWithRouter(ui: React.ReactNode) {
    return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe("CustomIncome Page", () => {
    it("renders header and inputs", () => {
        renderWithRouter(<CustomIncome />);
        expect(screen.getByText("Custom Income")).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/Search income icons/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText("Income category name")).toBeInTheDocument();
    });

    it("filters with search", () => {
        renderWithRouter(<CustomIncome />);
        const input = screen.getByPlaceholderText(/Search income icons/i);
        fireEvent.change(input, { target: { value: "Job" } });
        expect(screen.getByText("Job & Salary")).toBeInTheDocument();
        expect(screen.getByTitle("Job")).toBeInTheDocument();
    });

    it("selects icon and sets name", () => {
        renderWithRouter(<CustomIncome />);
        fireEvent.change(screen.getByPlaceholderText(/Search income icons/i), {
            target: { value: "Freelance" },
        });
        const chip = screen.getByTitle("Freelance");
        fireEvent.click(chip);
        fireEvent.change(screen.getByPlaceholderText("Income category name"), {
            target: { value: "Side income" },
        });
        expect(screen.getByDisplayValue("Side income")).toBeInTheDocument();
    });

    it("alerts if icon or name is missing", () => {
        renderWithRouter(<CustomIncome />);
        fireEvent.click(screen.getByRole("button", { name: "Confirm" }));
        expect(window.alert).toHaveBeenCalledWith("Please select an icon and enter a name");
    });

    it("navigates to /income when form is complete", () => {
        renderWithRouter(<CustomIncome />);
        fireEvent.change(screen.getByPlaceholderText(/Search income icons/i), {
            target: { value: "Job" },
        });
        fireEvent.click(screen.getByTitle("Job"));
        fireEvent.change(screen.getByPlaceholderText("Income category name"), {
            target: { value: "Main income" },
        });
        fireEvent.click(screen.getByRole("button", { name: "Confirm" }));
        expect(mockNavigate).toHaveBeenCalledWith("/income", {
            state: {
                customIncome: {
                    label: "Main income",
                    icon: "Briefcase",
                },
            },
            replace: true,
        });
    });
});
