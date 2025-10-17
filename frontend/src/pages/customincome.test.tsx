// src/pages/customincome.test.tsx
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
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

// mock alert
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
  it("แส�?�?หัว�?�?อและ input", () => {
    renderWithRouter(<CustomIncome />);
    expect(screen.getByText("Custom Income")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/�?�?�?หา�?อ�?อ�?ราย�?�?�?/i)
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText("�?ื�?อหมว�?ราย�?�?�?")).toBeInTheDocument();
  });

  it("กรอ�?�?�?วย search", () => {
    renderWithRouter(<CustomIncome />);
    const input = screen.getByPlaceholderText(/�?�?�?หา�?อ�?อ�?ราย�?�?�?/i);
    fireEvent.change(input, { target: { value: "�?�?ิ�?�?�?ือ�?" } });
    expect(screen.getByText("�?�?ิ�?�?�?ือ�? & �?า�?�?ระ�?ำ")).toBeInTheDocument();
    expect(screen.getByTitle("�?�?ิ�?�?�?ือ�?")).toBeInTheDocument();
  });

  it("�?ลือก icon และ�?ั�?�?�?ื�?อ�?�?�?", () => {
    renderWithRouter(<CustomIncome />);
    fireEvent.change(screen.getByPlaceholderText(/�?�?�?หา�?อ�?อ�?ราย�?�?�?/i), {
      target: { value: "�?รีแล�?�?�?" },
    });
    const chip = screen.getByTitle("�?รีแล�?�?�?");
    fireEvent.click(chip);
    fireEvent.change(screen.getByPlaceholderText("�?ื�?อหมว�?ราย�?�?�?"), {
      target: { value: "ราย�?�?�?�?สริม" },
    });
    expect(screen.getByDisplayValue("ราย�?�?�?�?สริม")).toBeInTheDocument();
  });

  it("alert �?�?า�?ม�?�?ลือก icon หรือ�?ม�?กรอก�?ื�?อ", () => {
    renderWithRouter(<CustomIncome />);
    fireEvent.click(screen.getByRole("button", { name: "ยื�?ยั�?" }));
    expect(window.alert).toHaveBeenCalledWith("กรุ�?า�?ลือก�?อ�?อ�?และ�?ั�?�?�?ื�?อ");
  });

  it("navigate �?�? /income �?�?ากรอก�?ร�?", () => {
    renderWithRouter(<CustomIncome />);
    // �?ลือก icon
    fireEvent.change(screen.getByPlaceholderText(/�?�?�?หา�?อ�?อ�?ราย�?�?�?/i), {
      target: { value: "�?�?ิ�?�?�?ือ�?" },
    });
    fireEvent.click(screen.getByTitle("�?�?ิ�?�?�?ือ�?"));

    // �?ส�?�?ื�?อ
    fireEvent.change(screen.getByPlaceholderText("�?ื�?อหมว�?ราย�?�?�?"), {
      target: { value: "�?�?ิ�?�?�?ือ�?หลัก" },
    });

    fireEvent.click(screen.getByRole("button", { name: "ยื�?ยั�?" }));

    expect(mockNavigate).toHaveBeenCalledWith("/income", {
      state: {
        customIncome: {
          label: "�?�?ิ�?�?�?ือ�?หลัก",
          icon: "Briefcase",
        },
      },
      replace: true,
    });
  });
});



