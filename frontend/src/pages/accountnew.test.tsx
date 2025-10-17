// src/pages/accountnew.test.tsx
import React from "react";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
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

// �?? helper: �?ลือก trigger �?อ�? dropdown �?ห�?�?ั�? (�?ม�?�?ะ�?ะกั�? label)
function getTypeDropdownTrigger(): HTMLElement {
  // �?ยายามหา element �?ี�?�?�?�?�? placeholder ก�?อ�?
  const all = screen.getAllByText(/�?ระ�?ภ�?/i);
  // �?ลือก�?ัว�?ี�?�?�?�?�? placeholder �?�?ามี
  const placeholderEl = all.find((el) =>
    el.classList?.contains("placeholder")
  );
  if (placeholderEl) return placeholderEl as HTMLElement;

  // �?�?า�?ม�?มี class �?ห�?�?ลือก�?ัว�?ั�?�?�? (�?�?ยมาก�?ัวแรก�?ะ�?�?�?�? label, �?ัว�?ั�?�?�?�?ือ trigger)
  if (all.length > 1) return all[1] as HTMLElement;

  // fallback อย�?า�?สุภา�?
  return all[0] as HTMLElement;
}

describe("AccountNew Page", () => {
  it("แส�?�?หัว�?�?อ 'สร�?า�?�?ัญ�?ี' และ�?ุ�?มยื�?ยั�?", () => {
    render(
      <MemoryRouter>
        <AccountNew />
      </MemoryRouter>
    );
    expect(screen.getByText(/สร�?า�?�?ัญ�?ี/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /ยื�?ยั�?/i })).toBeInTheDocument();
  });

  it("กรอก�?ม�?�?ร�? �?? alert error", () => {
    render(
      <MemoryRouter>
        <AccountNew />
      </MemoryRouter>
    );
    fireEvent.click(screen.getByRole("button", { name: /ยื�?ยั�?/i }));
    expect(window.alert).toHaveBeenCalledWith(
      "กรอก�?�?อมูล�?ห�?�?ร�?และ�?ำ�?ว�?�?�?ิ�?�?ห�?�?ูก�?�?อ�?ก�?อ�?�?�?าา"
    );
  });

  it("สามาร�?�?ลือก�?ระ�?ภ�?�?ัญ�?ีและ�?อ�?อ�?�?�?�?", () => {
    render(
      <MemoryRouter>
        <AccountNew />
      </MemoryRouter>
    );

    // �?�?ิ�? dropdown �?ระ�?ภ�? (�?�?�? helper �?�?ื�?อ�?ม�?�?�? label)
    const trigger = getTypeDropdownTrigger();
    fireEvent.click(trigger);

    // �?ลือก "�?�?า�?าร" �?ากรายการ
    const dd = document.querySelector(".dropdown") as HTMLElement;
    const bankOption = within(dd).getByText(/�?�?า�?าร/i);
    fireEvent.click(bankOption);

    // �?�?อ�?วาม�?ี�?�?ลือก�?�?อ�?แส�?�?อยู�?
    expect(screen.getByText(/�?�?า�?าร/i)).toBeInTheDocument();

    // �?ลือก�?อ�?อ�? "กระ�?ุก"
    const piggyBtn = screen.getByRole("button", { name: /กระ�?ุก/i });
    fireEvent.click(piggyBtn);
    expect(piggyBtn).toHaveClass("active");
  });

  // (�?�?าอยาก�?�?ิ�?�?�?ส�?�?�?ี�?อีก�?รั�?�? ก�?�?อา .skip ออก�?�?�?�?มื�?อ�?ร�?อม)
  it.skip("�?ั�?�?ึก�?ัญ�?ี�?หม�?ล�? localStorage และ navigate �?�? /home (�?ม�?ส�?�?ัว�?ิม�?�?)", async () => {
    render(
      <MemoryRouter>
        <AccountNew />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText(/�?ื�?อ�?ัญ�?ี/i), {
      target: { value: "MyCash" },
    });

    const trigger = getTypeDropdownTrigger();
    fireEvent.click(trigger);

    const dd = document.querySelector(".dropdown") as HTMLElement;
    fireEvent.click(within(dd).getByText(/�?�?ิ�?ส�?/i));

    fireEvent.change(screen.getByPlaceholderText(/�?า�?/i), {
      target: { value: "1000" },
    });

    fireEvent.click(screen.getByRole("button", { name: /ยื�?ยั�?/i }));

    await waitFor(() => {
      const saved = JSON.parse(localStorage.getItem("accounts") || "[]");
      expect(saved).toHaveLength(1);
      expect(saved[0].name).toBe("MyCash");
      expect(mockNavigate).toHaveBeenCalledWith(expect.stringMatching(/^\/home$/i));
    });
  });

  it.skip("�?หม�?แก�?�?�?: �?หล�?�?�?ามาแก�?�?�?และ submit แล�?ว�?ั�?�?ึก", async () => {
    const initAcc = { name: "Old", amount: 50, iconKey: "wallet", type: "�?�?ิ�?ส�?" };
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

    fireEvent.change(screen.getByPlaceholderText(/�?ื�?อ�?ัญ�?ี/i), {
      target: { value: "Updated" },
    });
    fireEvent.click(screen.getByRole("button", { name: /�?ั�?�?ึกการแก�?�?�?/i }));

    await waitFor(() => {
      const saved = JSON.parse(localStorage.getItem("accounts") || "[]");
      expect(saved[0].name).toBe("Updated");
      expect(mockNavigate).toHaveBeenCalledWith(expect.stringMatching(/^\/home$/i));
    });
  });
});




