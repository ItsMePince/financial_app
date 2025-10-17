// src/pages/customoutcome.test.tsx
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import CategoryCustom from "./customoutcome";
import { TempCategoryProvider } from "../TempCategoryContext";

// mock useNavigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async (importOriginal) => {
  const actual: any = await importOriginal();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// mock alert
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
  it("แส�?�?หัว�?�?อ OutcomeCustom", () => {
    renderWithProvider(<CategoryCustom />);
    expect(screen.getByText("OutcomeCustom")).toBeInTheDocument();
  });

  it("สามาร�?�?�?�?หาและ�?ลือก�?อ�?อ�?�?�?�?", () => {
    renderWithProvider(<CategoryCustom />);
    fireEvent.change(
      screen.getByPlaceholderText(/�?�?�?หา�?อ�?อ�?/i),
      { target: { value: "กาแ�?" } }
    );
    const coffeeBtn = screen.getByTitle("กาแ�?");
    fireEvent.click(coffeeBtn);
    expect(coffeeBtn).toHaveClass("active");
  });

  it("แส�?�? alert �?�?า�?ม�?�?ลือก�?อ�?อ�?หรือ�?ม�?กรอก�?ื�?อ", () => {
    renderWithProvider(<CategoryCustom />);
    const confirmBtn = screen.getByRole("button", { name: "ยื�?ยั�?" });
    fireEvent.click(confirmBtn);
    expect(window.alert).toHaveBeenCalledWith("กรุ�?า�?ลือก�?อ�?อ�?และ�?ั�?�?�?ื�?อ");
  });

  it("�?ั�?�?ึกและ navigate กลั�? �?มื�?อ�?ลือก�?ร�?�?�?ว�?", () => {
    renderWithProvider(<CategoryCustom />);
    fireEvent.change(
      screen.getByPlaceholderText(/�?�?�?หา�?อ�?อ�?/i),
      { target: { value: "�?า�?" } }
    );
    fireEvent.click(screen.getByTitle("�?า�?"));

    fireEvent.change(
      screen.getByPlaceholderText("�?ื�?อหมว�?หมู�?"),
      { target: { value: "�?า�?อ�?ิ�?รก" } }
    );

    fireEvent.click(screen.getByRole("button", { name: "ยื�?ยั�?" }));

    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });
});



