import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Login from "./Login";

// mock useNavigate
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

// helper: mock fetch
function mockFetchOnce(data: any, ok = true) {
  global.fetch = jest.fn().mockResolvedValueOnce({
    ok,
    json: async () => data,
  } as Response);
}

describe("Login Frontend", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    jest.spyOn(window.localStorage.__proto__, "setItem");
    jest.spyOn(window, "dispatchEvent");
  });

  it("แสดงปุ่ม login บนหน้าจอ", () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );
    expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
  });

  it("เปลี่ยนปุ่มเป็น loading ขณะ submit", async () => {
    mockFetchOnce({ success: false, message: "Login failed" });

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/Username/i), {
      target: { value: "user" },
    });
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: "pass" },
    });

    const btn = screen.getByRole("button", { name: /login/i });
    fireEvent.click(btn);

    expect(btn).toBeDisabled();
    expect(btn).toHaveTextContent(/กำลังเข้าสู่ระบบ/i);

    await waitFor(() => {
      expect(btn).toHaveTextContent(/login/i);
    });
  });

  it("navigate ไป /home เมื่อ login สำเร็จ", async () => {
    const fakeUser = { username: "u", role: "member" };
    mockFetchOnce({ success: true, user: fakeUser });

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/Username/i), {
      target: { value: "u" },
    });
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: "p" },
    });
    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    await waitFor(() => {
      expect(localStorage.setItem).toHaveBeenCalledWith(
        "isAuthenticated",
        "true"
      );
      expect(localStorage.setItem).toHaveBeenCalledWith(
        "user",
        JSON.stringify(fakeUser)
      );
      expect(mockNavigate).toHaveBeenCalledWith("/home");
    });
  });

  it("แสดง error message จาก API", async () => {
    mockFetchOnce({ success: false, message: "Invalid credentials" });

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/Username/i), {
      target: { value: "wrong" },
    });
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: "wrong" },
    });
    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    expect(
      await screen.findByText(/Invalid credentials/i)
    ).toBeInTheDocument();
  });

  it("แสดงข้อความ error ภาษาไทยเมื่อ network ล้มเหลว", async () => {
    global.fetch = jest.fn().mockRejectedValueOnce(new Error("Network down"));

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/Username/i), {
      target: { value: "u" },
    });
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: "p" },
    });
    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    expect(
      await screen.findByText(/เชื่อมต่อเซิร์ฟเวอร์ไม่ได้ กรุณาลองใหม่อีกครั้ง/i)
    ).toBeInTheDocument();
  });

  it("กดปุ่ม Sign Up แล้ว navigate ไป /signup", () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole("button", { name: /Sign Up/i }));
    expect(mockNavigate).toHaveBeenCalledWith("/signup");
  });
  it("เรียก fetch ด้วยพารามิเตอร์ที่ถูกต้อง", async () => {
    const fakeUser = { username: "u", role: "member" };
    const fetchSpy = jest.spyOn(global, "fetch" as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, user: fakeUser }),
    } as Response);

    render(<MemoryRouter><Login /></MemoryRouter>);
    fireEvent.change(screen.getByLabelText(/Username/i), { target: { value: "u" } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: "p" } });
    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    await waitFor(() => expect(fetchSpy).toHaveBeenCalled());

    // ใส่ type [string, RequestInit]
    const [url, options] = fetchSpy.mock.calls[0] as [string, RequestInit];

    expect(url).toBe("http://localhost:8081/api/auth/login");
    expect(options.method).toBe("POST");

    const contentType = new Headers(options.headers as HeadersInit).get("Content-Type");
    expect(contentType).toBe("application/json");

    expect(options.credentials).toBe("include");

    expect(JSON.parse(String(options.body))).toEqual({ username: "u", password: "p" });
  });

  it("ช่องกรอกถูก disabled ระหว่าง loading", async () => {
    // ให้ fetch ค้างไว้จนกว่า waitFor จะรอ
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: false, message: "x" }),
    } as Response);

    render(<MemoryRouter><Login /></MemoryRouter>);
    const userInput = screen.getByLabelText(/Username/i) as HTMLInputElement;
    const passInput = screen.getByLabelText(/Password/i) as HTMLInputElement;
    const btn = screen.getByRole("button", { name: /login/i });

    fireEvent.change(userInput, { target: { value: "u" } });
    fireEvent.change(passInput, { target: { value: "p" } });
    fireEvent.click(btn);

    expect(userInput).toBeDisabled();
    expect(passInput).toBeDisabled();

    await waitFor(() => expect(btn).not.toBeDisabled());
  });

  it("ล้าง error ก่อนส่งครั้งใหม่", async () => {
    // ครั้งแรกให้ fail
    mockFetchOnce({ success: false, message: "Invalid credentials" });
    render(<MemoryRouter><Login /></MemoryRouter>);

    fireEvent.change(screen.getByLabelText(/Username/i), { target: { value: "u" } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: "x" } });
    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    expect(await screen.findByText(/Invalid credentials/i)).toBeInTheDocument();

    // ครั้งที่สอง submit ใหม่ → ก่อนส่ง error ควรถูกล้าง
    mockFetchOnce({ success: false, message: "Another error" });
    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    // ข้อความเก่าไม่ควรค้าง (รอข้อความใหม่ขึ้นแทน)
    await waitFor(() => {
      expect(screen.queryByText(/Invalid credentials/i)).not.toBeInTheDocument();
    });
    expect(await screen.findByText(/Another error/i)).toBeInTheDocument();
  });

  it("ใช้ fallback 'Login failed' เมื่อ server ไม่ส่ง message", async () => {
    mockFetchOnce({ success: false }); // ไม่มี message
    render(<MemoryRouter><Login /></MemoryRouter>);

    fireEvent.change(screen.getByLabelText(/Username/i), { target: { value: "u" } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: "p" } });
    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    expect(await screen.findByText(/Login failed/i)).toBeInTheDocument();
  });

  it("เรียก onLoginSuccess ด้วย user ที่ได้จาก API", async () => {
    const fakeUser = { username: "u", role: "member" };
    const onLoginSuccess = jest.fn();
    mockFetchOnce({ success: true, user: fakeUser });

    render(<MemoryRouter><Login onLoginSuccess={onLoginSuccess} /></MemoryRouter>);
    fireEvent.change(screen.getByLabelText(/Username/i), { target: { value: "u" } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: "p" } });
    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    await waitFor(() => expect(onLoginSuccess).toHaveBeenCalledWith(fakeUser));
  });

  it('dispatch event "auth-changed" หลังล็อกอินสำเร็จ', async () => {
    const fakeUser = { username: "u", role: "member" };
    const dispatchSpy = jest.spyOn(window, "dispatchEvent");
    mockFetchOnce({ success: true, user: fakeUser });

    render(<MemoryRouter><Login /></MemoryRouter>);
    fireEvent.change(screen.getByLabelText(/Username/i), { target: { value: "u" } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: "p" } });
    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    await waitFor(() => {
      expect(dispatchSpy).toHaveBeenCalled();
      const evt = dispatchSpy.mock.calls[0][0] as Event;
      expect(evt.type).toBe("auth-changed");
    });
  });

});

