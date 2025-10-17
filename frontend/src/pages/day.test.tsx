// src/pages/day.test.tsx
import React from "react";
import { render, screen, waitFor, fireEvent, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import Day from "./day";

// ---------- Helpers ----------
function mockFetchOk(data: any, delay = 0) {
  const resp = {
    ok: true,
    json: async () => data,
  } as Response;
  if (delay > 0) {
    return vi.fn().mockImplementation(
      () => new Promise((r) => setTimeout(() => r(resp), delay))
    );
  }
  return vi.fn().mockResolvedValue(resp);
}

function mockFetchErr(status = 500) {
  const resp = {
    ok: false,
    status,
    json: async () => {
      throw new Error(`�?หล�?รายการ�?ม�?สำ�?ร�?�? (${status})`);
    },
  } as any;
  return vi.fn().mockResolvedValue(resp);
}

function renderWithRouter(
  ui: React.ReactNode,
  initialEntries = ["/day?date=2025-09-24"]
) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>{ui}</MemoryRouter>
  );
}

beforeEach(() => {
  // polyfill ResizeObserver
  // @ts-ignore
  global.ResizeObserver =
    global.ResizeObserver ||
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    };

  vi.restoreAllMocks();
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("Day Page", () => {
  it("แส�?�?ส�?า�?ะ loading �?อ�?แรก", async () => {
    global.fetch = mockFetchOk([], 80) as any;

    renderWithRouter(<Day />);

    expect(screen.getByText(/กำลั�?�?หล�?�?�?อมูล/i)).toBeInTheDocument();

    await waitFor(() =>
      expect(screen.queryByText(/กำลั�?�?หล�?�?�?อมูล/i)).not.toBeInTheDocument()
    );
  });

  it("แส�?�?�?�?อ�?วาม error �?มื�?อ API ล�?ม�?หลว", async () => {
    global.fetch = mockFetchErr(500) as any;

    renderWithRouter(<Day />);

    await waitFor(() =>
      expect(
        screen.getByText(/�?หล�?รายการ�?ม�?สำ�?ร�?�? \(500\)/)
      ).toBeInTheDocument()
    );
  });

  it("แส�?�?�?�?อ�?วาม 'วั�?�?ี�?ยั�?�?ม�?มีรายการ' �?�?า API �?ื�? array ว�?า�?", async () => {
    global.fetch = mockFetchOk([]) as any;

    renderWithRouter(<Day />);

    await waitFor(() =>
      expect(screen.getByText(/วั�?�?ี�?ยั�?�?ม�?มีรายการ/i)).toBeInTheDocument()
    );
  });

  it("แส�?�?�?�?อมูล�?มื�?อ�?หล�?สำ�?ร�?�?", async () => {
    const data = [
      { category: "อาหาร", type: "EXPENSE", amount: 120 },
      { category: "�?�?ิ�?�?า�?", type: "EXPENSE", amount: 80 },
    ];
    global.fetch = mockFetchOk(data) as any;

    renderWithRouter(<Day />);

    await waitFor(() => expect(screen.getByText("�?ระ�?ภ�?")).toBeInTheDocument());

    expect(screen.getByText("อาหาร")).toBeInTheDocument();
    expect(screen.getByText("�?�?ิ�?�?า�?")).toBeInTheDocument();

    // �?รว�?�?ล�?�?�?ำ �?�?�? getAllByText
    expect(screen.getAllByText(/120/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/80/).length).toBeGreaterThan(0);
  });

  it("�?�?ลี�?ย�?วั�?�?มื�?อก�?�?ุ�?ม ก�?อ�?ห�?�?า/�?ั�?�?�?", async () => {
    // สร�?า�? resp �?ลอม�?ห�?�?รียก�?�?�?หลาย�?รั�?�? (initial, next, prev)
    const makeResp = (data: any) =>
      ({
        ok: true,
        json: async () => data,
      } as Response);

    // �?�?�? vi.fn แล�?ว chain resolved value แ�?�?ละ�?รั�?�?
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce(makeResp([])) // initial load
      .mockResolvedValueOnce(makeResp([])) // after click next
      .mockResolvedValueOnce(makeResp([])); // after click prev

    renderWithRouter(<Day />, ["/day?date=2025-09-24"]);

    // หา container �?อ�?สวิ�?�?�?อร�?
    const switcher = (await screen.findByRole("button", { name: "�?ั�?�?�?" })).closest(
      ".switcher"
    ) as HTMLElement;

    // helper: อ�?า�?วั�?�?ี�?�?าก chip
    const readDateText = () => {
      const chip = Array.from(switcher.querySelectorAll("*")).find((n) =>
        /\d{2}\/\d{2}\/\d{4}/.test(n.textContent ?? "")
      ) as HTMLElement | undefined;
      return chip?.textContent?.match(/\d{2}\/\d{2}\/\d{4}/)?.[0] ?? "";
    };

    // helper: format AD -> TH
    const fmtTh = (d: Date) => {
      const dd = String(d.getDate()).padStart(2, "0");
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const yyyy = d.getFullYear() + 543;
      return `${dd}/${mm}/${yyyy}`;
    };

    // รอ�?ห�? initial render �?สร�?�?แล�?วอ�?า�?วั�?�?ี�?�?ั�?�?�?�?�?
    await waitFor(() => expect(readDateText()).toMatch(/\d{2}\/\d{2}\/\d{4}/));
    const startStr = readDateText();
    const [dd, mm, th] = startStr.split("/").map(Number);
    const start = new Date(th - 543, mm - 1, dd);

    // �?�️ �?ั�?�?�?
    const nextBtn = within(switcher).getByRole("button", { name: "�?ั�?�?�?" });
    nextBtn.click();

    const next = new Date(start);
    next.setDate(next.getDate() + 1);
    await waitFor(() => {
      // �?�?�? includes �?�?ื�?อล�?�?วาม�?�?ราะ�?า�?�?อ�? space/newline
      expect(readDateText()).toContain(fmtTh(next));
    });

    // �?️ ก�?อ�?ห�?�?า (กลั�?มาวั�?�?�?ิม)
    const prevBtn = within(switcher).getByRole("button", { name: "ก�?อ�?ห�?�?า" });
    prevBtn.click();

    await waitFor(() => {
      expect(readDateText()).toContain(fmtTh(start));
    });

    // �?รว�?ว�?ามีการ�?รียก fetch �?าม�?ำ�?ว�?�?รั�?�?�?ี�?�?า�?
    expect(global.fetch).toHaveBeenCalledTimes(3);
  });
});



