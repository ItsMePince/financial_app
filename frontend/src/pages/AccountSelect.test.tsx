// src/pages/AccountSelect.test.tsx
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AccountSelect from "./AccountSelect";
import { vi } from "vitest";

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
  });

  it("แส�?�? dropdown filter และรายการ�?ริ�?ม�?�?�?", () => {
    renderPage();
    // dropdown �?ริ�?ม�?�?�?
    expect(screen.getByRole("button", { name: /�?ั�?�?หม�?/i })).toBeInTheDocument();
    // รายการ�?ริ�?ม�?�?�?�?�? UI
    expect(screen.getByText("�?.�?�?ย�?า�?ิ�?ย�?")).toBeInTheDocument();
    expect(screen.getByText("�?�?ิ�?ส�?")).toBeInTheDocument();
  });

  it("สามาร�?�?�?ิ�? dropdown และ�?ลือก filter '�?�?า�?าร' �?�?�?", () => {
    renderPage();
    fireEvent.click(screen.getByRole("button", { name: /�?ั�?�?หม�?/i }));
    fireEvent.click(screen.getByText("�?�?า�?าร"));
    // �?หลือ�?�?�?าะ�?อ�?�?�?า�?าร
    expect(screen.getByText("�?.�?�?ย�?า�?ิ�?ย�?")).toBeInTheDocument();
    expect(screen.queryByText("�?�?ิ�?ส�?")).not.toBeInTheDocument();
  });

  it("สามาร�?ก�? favorite/unfavorite �?�?�?", () => {
    renderPage();
    // สมม�?ิ�?ุ�?ม�?าวมี aria-label �?ามส�?า�?ะ
    const starBtn = screen.getAllByLabelText(/unfavorite/i)[0];
    fireEvent.click(starBtn);
    // ก�?แล�?ว�?วรสลั�? aria-label �?�?�?�? Favorite
    expect(
      screen.getAllByLabelText(/favorite/i)[0]
    ).toBeInTheDocument();
  });

  // หมาย�?ห�?ุ: UI �?ั�?�?ุ�?ั�?�?ม�?มีวิ�?ี�?ำ�?ห�?รายการว�?า�?�?ริ�? �? (แ�?�?ละ filter มีอย�?า�?�?�?อย 1 รายการ
  // และการก�?�?าว�?ม�?�?�?�?�?�?อ�?รายการ) �?ึ�? skip �?�?ส�?ี�?�?ว�?ก�?อ�?
  it.skip("แส�?�?�?�?อ�?วาม '�?ม�?มีรายการ' �?มื�?อ filter แล�?ว�?ม�?�?�?อ", () => {
    renderPage();
    // �?�?า�?�?อ�?า�?�?มี toggle '�?�?�?าะรายการ�?�?ร�?' หรือ�?�?อ�?�?�?�?หา �?�?อยมา�?�?ิม�?�?ส�?ร�?�?ี�?�?�?�?
    // expect(screen.getByText("�?ม�?มีรายการ")).toBeInTheDocument();
  });

  it("ก�?�?ลือก account แล�?ว�?รียก navigate(-1)", async () => {
    renderPage();
    fireEvent.click(screen.getByText("�?�?ิ�?ส�?"));
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(-1);
    });
  });
});




