// src/pages/Home.test.tsx
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Home from "./Home";

// helper: mock fetch response
function mockFetchOnce(data: any, ok = true, status = 200) {
  global.fetch = vi.fn().mockResolvedValue({
    ok,
    status,
    json: async () => data,
  }) as any;
}

describe("Home Page", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it("แส�?�?ยอ�?�?�?ิ�?รวม", async () => {
    mockFetchOnce([]); // �?ม�?มี transaction
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );
    expect(await screen.findByText(/�?�?ิ�?รวม/)).toBeInTheDocument();
  });

  it("แส�?�? state กำลั�?�?หล�?", async () => {
    mockFetchOnce([]); // แ�?�?�?รา�?ะ�?รว�? loading ก�?อ�?
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );
    expect(screen.getByText(/กำลั�?�?หล�?�?�?อมูล/)).toBeInTheDocument();
  });

  it("แส�?�? error �?มื�?อ API ล�?ม�?หลว", async () => {
    mockFetchOnce({}, false, 500);
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );
    expect(await screen.findByText(/�?หล�?�?�?อมูล�?ม�?สำ�?ร�?�?/)).toBeInTheDocument();
  });

  it("แส�?�?�?�?อ�?วาม�?มื�?อ�?ม�?มี�?�?อมูล", async () => {
    mockFetchOnce([]); // �?ม�?มี transaction
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );
    expect(
      await screen.findByText(/ยั�?�?ม�?มีรายการ�?�?�?�?ือ�?�?ี�?/)
    ).toBeInTheDocument();
  });

  it("แส�?�? transaction ล�?าสุ�?�?มื�?อมี�?�?อมูล", async () => {
    const fakeTx = [
      {
        id: 1,
        type: "INCOME",
        category: "�?�?ิ�?�?�?ือ�?",
        amount: 5000,
        date: "2025-09-01",
        note: "test",
        iconKey: "Wallet",
      },
    ];
    mockFetchOnce(fakeTx);
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );
    expect(await screen.findByText(/test/)).toBeInTheDocument();
    expect(screen.getByText(/\+5,000/)).toBeInTheDocument();
  });

  it("�?�?ลี�?ย�?�?�?ือ�?�?�?วย�?ุ�?ม prev/next", async () => {
    mockFetchOnce([]);
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );
    const prev = screen.getByLabelText("Previous month");
    const next = screen.getByLabelText("Next month");
    fireEvent.click(prev);
    fireEvent.click(next);
    expect(prev).toBeInTheDocument();
    expect(next).toBeInTheDocument();
  });

  it("ก�? More �?? Delete account �?รียก confirm", async () => {
    // �?�?รียม localStorage
    localStorage.setItem(
      "accounts",
      JSON.stringify([{ name: "TestBank", amount: 1000, iconKey: "bank" }])
    );
    mockFetchOnce([]); // �?ม�?มี tx
    vi.spyOn(window, "confirm").mockReturnValue(true);

    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    // �?�?ิ�?�?ม�?ู more
    fireEvent.click(await screen.findByLabelText("More actions"));
    fireEvent.click(screen.getByText("ล�?"));
    expect(window.confirm).toHaveBeenCalled();
  });
});



