// src/pages/accountnew.test.tsx
import React from "react";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AccountNew from "./accountnew";

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
  localStorage.clear();
  vi.clearAllMocks();
  vi.spyOn(window, "alert").mockImplementation(() => {});
});

describe("AccountNew Page", () => {
  it("แสดงหัวข้อ 'สร้างบัญชี' และปุ่มยืนยัน", () => {
    render(
      <MemoryRouter>
        <AccountNew />
      </MemoryRouter>
    );
    expect(screen.getByText("สร้างบัญชี")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "ยืนยัน" })).toBeInTheDocument();
  });

  it("กรอกไม่ครบ → alert error", () => {
    render(
      <MemoryRouter>
        <AccountNew />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole("button", { name: "ยืนยัน" }));
    expect(window.alert).toHaveBeenCalledWith(
      "กรอกข้อมูลให้ครบและจำนวนเงินให้ถูกต้องก่อนน้าา"
    );
  });

  it("สามารถเลือกประเภทบัญชีและไอคอนได้", () => {
    render(
      <MemoryRouter>
        <AccountNew />
      </MemoryRouter>
    );

    // เปิด dropdown ประเภท
    fireEvent.click(screen.getByText("ประเภท"));

    // scope การหา "ธนาคาร" เฉพาะใน dropdown เพื่อตัดชนกับปุ่มไอคอนที่ชื่อซ้ำ
    const dd = document.querySelector(".dropdown") as HTMLElement;
    const bankOption = within(dd).getByRole("button", { name: "ธนาคาร" });
    fireEvent.click(bankOption);

    // ยืนยันว่าข้อความที่เลือกไปแสดงอยู่ (placeholder เปลี่ยนเป็น "ธนาคาร")
    expect(screen.getByText("ธนาคาร")).toBeInTheDocument();

    // เลือกไอคอน "กระปุก"
    const piggyBtn = screen.getByRole("button", { name: "กระปุก" });
    fireEvent.click(piggyBtn);
    expect(piggyBtn).toHaveClass("active");
  });

  it("บันทึกบัญชีใหม่ลง localStorage และ navigate ไป /Home", async () => {
    render(
      <MemoryRouter>
        <AccountNew />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText("ชื่อบัญชี"), {
      target: { value: "MyCash" },
    });

    // เลือกประเภท = เงินสด
    fireEvent.click(screen.getByText("ประเภท"));
    const dd = document.querySelector(".dropdown") as HTMLElement;
    fireEvent.click(within(dd).getByRole("button", { name: "เงินสด" }));

    fireEvent.change(screen.getByPlaceholderText("บาท"), {
      target: { value: "1000" },
    });

    fireEvent.click(screen.getByRole("button", { name: "ยืนยัน" }));

    await waitFor(() => {
      const saved = JSON.parse(localStorage.getItem("accounts") || "[]");
      expect(saved).toHaveLength(1);
      expect(saved[0].name).toBe("MyCash");
      expect(mockNavigate).toHaveBeenCalledWith("/Home");
    });
  });

  it("โหมดแก้ไข: โหลดค่ามาแก้ไขและกด submit แล้วบันทึกการแก้ไข", async () => {
    const initAcc = { name: "Old", amount: 50, iconKey: "wallet", type: "เงินสด" };
    localStorage.setItem("accounts", JSON.stringify([initAcc]));

    render(
      <MemoryRouter
        initialEntries={[
          { pathname: "/edit", state: { mode: "edit", index: 0, account: initAcc } },
        ]}
      >
        <AccountNew />
      </MemoryRouter>
    );

    expect(screen.getByDisplayValue("Old")).toBeInTheDocument();
    expect(screen.getByDisplayValue("50")).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText("ชื่อบัญชี"), {
      target: { value: "Updated" },
    });
    fireEvent.click(screen.getByRole("button", { name: "บันทึกการแก้ไข" }));

    await waitFor(() => {
      const saved = JSON.parse(localStorage.getItem("accounts") || "[]");
      expect(saved[0].name).toBe("Updated");
      expect(mockNavigate).toHaveBeenCalledWith("/Home");
    });
  });
});