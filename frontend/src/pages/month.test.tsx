// src/pages/month.test.tsx
import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Month from "./month";
import { render, screen, waitFor, fireEvent, within } from "@testing-library/react";

declare global {
  // eslint-disable-next-line no-var
  var fetch: any;
}

/* ---------------- Polyfill for Recharts ---------------- */
/* ---------------- Polyfill for Recharts ---------------- */
beforeAll(() => {
  // @ts-ignore
  if (typeof global.ResizeObserver === "undefined") {
    // @ts-ignore
    global.ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  }
});

const onlyNumber = (s: string | null | undefined) => (s ?? "").replace(/[^\d]/g, "");

/** สร�?า�? mock fetch �?ี�? resolve �?�?�?�?�?�?า�?ี�?ระ�?ุ 1 �?รั�?�? */
function mockFetchResolveOnce(data: any, ok = true) {
  global.fetch = vi.fn().mockResolvedValue({
    ok,
    json: async () => data,
    text: async () => (typeof data === "string" ? data : JSON.stringify(data)),
  }) as any;
}

describe("Month Page", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("แส�?�?ส�?า�?ะ loading �?อ�?แรก", async () => {
    // �?ำ�?ห�? fetch �?�?า�?�?ว�?ก�?อ�? �?�?ื�?อ�?�?�?�?�?อ Loading
    let resolveFn: (v: any) => void = () => {};
    const pending = new Promise((res) => (resolveFn = res));
    global.fetch = vi.fn().mockReturnValueOnce(pending);

    render(
      <MemoryRouter>
        <Month />
      </MemoryRouter>
    );

    // มี�?�?อ�?วาม 'กำลั�?�?หล�?' อย�?า�?�?�?อยห�?ึ�?�?�?ุ�?
    const loadingEls = screen.getAllByText((_, node) =>
      !!node?.textContent?.toLowerCase().includes("load") ||
      !!node?.textContent?.includes("กำลั�?�?หล�?")
    );
    expect(loadingEls.length).toBeGreaterThanOrEqual(1);

    // �?ล�?อย fetch �?ห�?�?สร�?�?
    resolveFn({
      ok: true,
      json: async () => [],
      text: async () => "[]",
    });

    // รอ�?ห�?�?�?อ�?วาม�?หล�?หาย�?�?�?ั�?�?หม�?
    await waitFor(() => {
      const still = screen.queryAllByText((_, node) =>
        !!node?.textContent?.toLowerCase().includes("load") ||
        !!node?.textContent?.includes("กำลั�?�?หล�?")
      );
      expect(still.length).toBe(0);
    });
  });

  it("แส�?�?�?�?อ�?วาม error �?มื�?อ API ล�?ม�?หลว", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      text: async () => "�?กิ�?�?�?อ�?ิ�?�?ลา�?",
    }) as any;

    render(
      <MemoryRouter>
        <Month />
      </MemoryRouter>
    );

    // �?อม�?�?�?�?�?�?�?แส�?�?ว�?า "�?หล�?�?�?อมูล�?ม�?สำ�?ร�?�? (...)" อยู�?�?�? DOM
    await waitFor(() => {
      expect(screen.getByText(/�?หล�?�?�?อมูล�?ม�?สำ�?ร�?�?/i)).toBeInTheDocument();
    });
  });

  it("แส�?�? '�?ม�?มีรายการ�?�?�?�?ือ�?�?ี�?' �?มื�?อ API �?ื�? array ว�?า�?", async () => {
    mockFetchResolveOnce([]);

    render(
      <MemoryRouter>
        <Month />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/�?ม�?มีรายการ�?�?�?�?ือ�?�?ี�?/i)).toBeInTheDocument();
    });

    // KPI �?วร�?�?�?�? 0 �?ั�?�?หม�? (อ�?า�?�?าก kpi-inline �?�?ื�?อ�?ลี�?ย�?�?�?กั�? cell �?�? grid)
    const kpiInline = screen.getByText(/รายรั�?:/i).closest(".kpi-inline") as HTMLElement;
    const incomeEl  = kpiInline.querySelector("b.income") as HTMLElement;
    const expenseEl = kpiInline.querySelector("b.expense") as HTMLElement;
    const balanceEl = kpiInline.querySelector("b.balance") as HTMLElement;

    expect(onlyNumber(incomeEl.textContent)).toBe("0");
    expect(onlyNumber(expenseEl.textContent)).toBe("0");
    expect(onlyNumber(balanceEl.textContent)).toBe("0");
  });

  it("แส�?�?�?�?อมูล�?มื�?อ�?หล�?สำ�?ร�?�? และ�?ำ�?ว�? KPI �?ูก�?�?อ�?", async () => {
    // �?ั�? mock �?�?�?าะ�?�?ส�?ี�?
    const sample = [
      { id: 1, date: "2025-09-01", type: "INCOME",  amount: 12000, category: "�?�?ิ�?�?�?ือ�?" },
      { id: 2, date: "2025-09-01", type: "EXPENSE", amount: 3000,  category: "อาหาร"   },
    ];

    const fetchMock = vi
      .spyOn(global as any, "fetch")
      .mockResolvedValue({
        ok: true,
        json: async () => sample,
        text: async () => JSON.stringify(sample),
      } as any);

    render(
      <MemoryRouter>
        <Month />
      </MemoryRouter>
    );

    // ยื�?ยั�?ว�?ามีการยิ�? fetch แล�?ว
    await waitFor(() => expect(fetchMock).toHaveBeenCalled());

    // รอ�?ห�?สลั�?�?าก loading �?�?�?�?การ�?�?สรุ�?
    const title = await screen.findByText(/สรุ�?ราย�?�?ือ�?/i);
    const summaryCard = title.closest(".summary-card") as HTMLElement;

    // �?รว�? KPI �?�?�?าะ�?�?การ�?�?สรุ�? (กั�?�?�?กั�?�?ัว�?ล�?�?�? grid)
    const kpi = summaryCard.querySelector(".kpi-inline") as HTMLElement;
    expect(within(kpi).getByText(/12,?000/)).toBeInTheDocument(); // รายรั�?
    expect(within(kpi).getByText(/3,?000/)).toBeInTheDocument();  // ราย�?�?าย
    expect(within(kpi).getByText(/9,?000/)).toBeInTheDocument();  // �?�?�?หลือ

    expect(await screen.findAllByText(/12,?000/)).not.toHaveLength(0);
    expect(await screen.findAllByText(/3,?000/)).not.toHaveLength(0);
    expect(await screen.findAllByText(/9,?000/)).not.toHaveLength(0);

  });

  it("�?�?ลี�?ย�?�?�?ือ�?�?มื�?อก�?�?ุ�?ม ก�?อ�?ห�?�?า/�?ั�?�?�? และ�?รียก fetch �?หม�?", async () => {
    // initial + prev + next อย�?า�?�?�?อย 3 mock responses
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, json: async () => [], text: async () => "[]" })
      .mockResolvedValueOnce({ ok: true, json: async () => [], text: async () => "[]" })
      .mockResolvedValueOnce({ ok: true, json: async () => [], text: async () => "[]" });

    render(
      <MemoryRouter>
        <Month />
      </MemoryRouter>
    );

    // รอ�?ห�?�?หล�?รอ�?แรก�?�? (�?�?อ�?วามกำลั�?�?หล�?หาย)
    await waitFor(() => {
      const still = screen.queryAllByText((_, node) =>
        !!node?.textContent?.toLowerCase().includes("load") ||
        !!node?.textContent?.includes("กำลั�?�?หล�?")
      );
      expect(still.length).toBe(0);
    }, { timeout: 3000 });

    const getChipText = () =>
      (document.querySelector(".month-chip") as HTMLElement)?.textContent?.trim() ?? "";

    const initialText = getChipText();
    expect(initialText).not.toBe("");

    // previous
    fireEvent.click(screen.getByRole("button", { name: "ก�?อ�?ห�?�?า" }));
    await waitFor(() => {
      expect(getChipText()).not.toBe(initialText);
    }, { timeout: 3000 });

    // next (กลั�?มา�?�?�?า�?�?ิม)
    fireEvent.click(screen.getByRole("button", { name: "�?ั�?�?�?" }));
    await waitFor(() => {
      expect(getChipText()).toBe(initialText);
    }, { timeout: 3000 });

    // �?ั�?�?ำ�?ว�?�?รียก fetch �?? ยอมรั�? >= 2 �?�?ื�?อกั�? timing
    await waitFor(() => {
      expect((global.fetch as any).mock.calls.length).toBeGreaterThanOrEqual(2);
    }, { timeout: 3000 });
  });
});




