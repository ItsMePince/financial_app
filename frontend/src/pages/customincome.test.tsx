// src/pages/customincome.test.tsx
// @ts-nocheck
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import CustomIncome from "./customincome";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
    const actual: any = await vi.importActual("react-router-dom");
    return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock("./buttomnav", () => ({ default: () => <div data-testid="bottom-nav" /> }));

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

function phSearch() {
    return (
        screen.queryByPlaceholderText(/Search income icons|ค้นหาไอคอนรายได้/i) ||
        screen.getByRole("textbox", { name: /ค้นหา|search/i })
    );
}

function phName() {
    return (
        screen.queryByPlaceholderText(/Income category name|ชื่อหมวดรายได้/i) ||
        screen.getByRole("textbox", { name: /ชื่อ/i })
    );
}

describe("CustomIncome Page", () => {
    it("renders header and inputs", () => {
        renderWithRouter(<CustomIncome />);
        expect(
            screen.getByText(/Custom Income|กำหนดรายได้เอง/i)
        ).toBeInTheDocument();
        expect(phSearch()).toBeInTheDocument();
        expect(phName()).toBeInTheDocument();
    });

    it("filters with search", () => {
        renderWithRouter(<CustomIncome />);
        const search = phSearch();
        fireEvent.change(search, { target: { value: "Job" } });

        expect(
            screen.getByText(/Job & Salary|งานและเงินเดือน/i)
        ).toBeInTheDocument();

        const jobChip =
            screen.queryByTitle(/Job/i) ||
            screen.getByRole("button", { name: /Job|งาน/i });
        expect(jobChip).toBeInTheDocument();
    });

    it("selects icon and sets name", () => {
        renderWithRouter(<CustomIncome />);
        const search = phSearch();
        fireEvent.change(search, { target: { value: "Freelance" } });

        const chip =
            screen.queryByTitle(/Freelance/i) ||
            screen.getByRole("button", { name: /Freelance|ฟรีแลนซ์/i });
        fireEvent.click(chip);

        const nameInput = phName();
        fireEvent.change(nameInput, { target: { value: "Side income" } });
        expect(screen.getByDisplayValue("Side income")).toBeInTheDocument();
    });

    it("alerts if icon or name is missing", () => {
        renderWithRouter(<CustomIncome />);
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

    it("navigates to /income when form is complete", () => {
        renderWithRouter(<CustomIncome />);

        const search = phSearch();
        fireEvent.change(search, { target: { value: "Job" } });

        const jobChip =
            screen.queryByTitle(/Job/i) ||
            screen.getByRole("button", { name: /Job|งาน/i });
        fireEvent.click(jobChip);

        const nameInput = phName();
        fireEvent.change(nameInput, { target: { value: "Main income" } });

        const confirmBtn =
            screen.queryByRole("button", { name: /Confirm|ยืนยัน/i }) ||
            screen.getByText(/Confirm|ยืนยัน/i);
        fireEvent.click(confirmBtn);

        expect(mockNavigate).toHaveBeenCalled();
        const [path, opts] = mockNavigate.mock.calls.at(-1)!;

        expect(path).toBe("/income");
        expect(opts?.replace).toBe(true);
        expect(opts?.state?.customIncome).toBeTruthy();
        expect(opts?.state?.customIncome?.label).toBe("Main income");
        expect(typeof opts?.state?.customIncome?.icon).toBe("string");
        expect(opts.state.customIncome.icon.length).toBeGreaterThan(0);
    });
});
