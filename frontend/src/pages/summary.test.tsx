// src/pages/SignUp.test.tsx
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import SignUp from "./SignUp";

// -------- helpers --------
function typeIntoForm({
  email = "me@example.com",
  username = "me",
  password = "secret6",
}: { email?: string; username?: string; password?: string }) {
  if (email !== undefined) {
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: email } });
  }
  if (username !== undefined) {
    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: username } });
  }
  if (password !== undefined) {
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: password } });
  }
}

function mockFetchOnce(data: any, ok = true) {
  (globalThis.fetch as any) = vi.fn().mockResolvedValueOnce({
    ok,
    json: async () => data,
  } as Response);
}

describe("SignUp (Frontend only)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(window.localStorage.__proto__, "setItem");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("�?ร�?�?�?อร�?�?อร�?ม�?�?�?�?ร�?และมีลิ�?ก�? Login", () => {
    render(
      <MemoryRouter>
        <SignUp />
      </MemoryRouter>
    );

    expect(screen.getByRole("heading", { name: /sign up/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    const loginLink = screen.getByRole("link", { name: /login/i });
    expect(loginLink).toHaveAttribute("href", "/login");
  });

  it("validate: �?�?อ�?กรอก�?�?อมูล�?ห�?�?ร�?�?�?ว�?", async () => {
    render(
      <MemoryRouter>
        <SignUp />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole("button", { name: /create account/i }));
    expect(await screen.findByText(/กรุ�?ากรอก�?�?อมูล�?ห�?�?ร�?�?�?ว�?/i)).toBeInTheDocument();
  });

  it("validate: รหัส�?�?า�?�?�?อ�?ยาวอย�?า�?�?�?อย 6 �?ัวอักษร", async () => {
    render(
      <MemoryRouter>
        <SignUp />
      </MemoryRouter>
    );

    typeIntoForm({ email: "a@b.com", username: "abc", password: "12345" });
    fireEvent.click(screen.getByRole("button", { name: /create account/i }));
    expect(await screen.findByText(/รหัส�?�?า�?�?�?อ�?มีอย�?า�?�?�?อย 6 �?ัวอักษร/i)).toBeInTheDocument();
  });

  it("�?มื�?อ�?ริ�?ม�?ิม�?�?�?หม�?แล�?ว error �?�?ิม�?ูกล�?า�?", async () => {
    render(
      <MemoryRouter>
        <SignUp />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole("button", { name: /create account/i }));
    expect(await screen.findByText(/กรุ�?ากรอก�?�?อมูล�?ห�?�?ร�?�?�?ว�?/i)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "me@x.com" } });
    expect(screen.queryByText(/กรุ�?ากรอก�?�?อมูล�?ห�?�?ร�?�?�?ว�?/i)).not.toBeInTheDocument();
  });

  it("loading: �?ุ�?มและ�?�?อ�?กรอก�?ูก disabled ระหว�?า�?ส�?�?�?�?อมูล", async () => {
    mockFetchOnce({ success: false, message: "x" });

    render(
      <MemoryRouter>
        <SignUp />
      </MemoryRouter>
    );

    typeIntoForm({});
    const submit = screen.getByRole("button", { name: /create account/i });

    fireEvent.click(submit);
    expect(submit).toBeDisabled();
    expect(submit).toHaveTextContent(/กำลั�?สมั�?รสมา�?ิก/i);

    await waitFor(() => {
      expect(submit).not.toBeDisabled();
      expect(submit).toHaveTextContent(/create account/i);
    });
  });

  it("�?ส�?�?�?า�? onSubmit prop: �?รียก callback �?�?วย�?�?า�?อร�?ม และ�?ม�?�?รียก fetch", async () => {
    const onSubmit = vi.fn();
    (globalThis.fetch as any) = vi.fn();

    render(
      <MemoryRouter>
        <SignUp onSubmit={onSubmit} />
      </MemoryRouter>
    );

    typeIntoForm({ email: "me@x.com", username: "me", password: "secret6" });
    fireEvent.click(screen.getByRole("button", { name: /create account/i }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        email: "me@x.com",
        username: "me",
        password: "secret6",
      });
    });

    expect(globalThis.fetch as any).not.toHaveBeenCalled();
  });

  it("�?รียก fetch �?�?วย�?ารามิ�?�?อร�?�?ี�?�?ูก�?�?อ�?�?มื�?อ�?ม�?มี onSubmit prop", async () => {
    mockFetchOnce({ success: false, message: "x" });

    render(
      <MemoryRouter>
        <SignUp />
      </MemoryRouter>
    );

    typeIntoForm({ email: "a@b.com", username: "abc", password: "secret6" });
    fireEvent.click(screen.getByRole("button", { name: /create account/i }));

    await waitFor(() => expect(globalThis.fetch as any).toHaveBeenCalled());

    const fetchMock = globalThis.fetch as unknown as { mock: { calls: any[] } };
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("/api/api/auth/signup");
    expect(init.method).toBe("POST");

    const contentType = new Headers(init.headers as HeadersInit).get("Content-Type");
    expect(contentType).toBe("application/json");

    const bodyObj = JSON.parse(String(init.body));
    expect(bodyObj).toEqual({
      email: "a@b.com",
      username: "abc",
      password: "secret6",
    });
  });

  it("API success: �?ก�?�? user �?�? localStorage และ�?รียก onSignUpSuccess", async () => {
    const fakeUser = { username: "me", email: "me@x.com", role: "member" };
    mockFetchOnce({ success: true, user: fakeUser });
    const onSignUpSuccess = vi.fn();

    render(
      <MemoryRouter>
        <SignUp onSignUpSuccess={onSignUpSuccess} />
      </MemoryRouter>
    );

    typeIntoForm({});
    fireEvent.click(screen.getByRole("button", { name: /create account/i }));

    await waitFor(() => {
      expect(localStorage.setItem).toHaveBeenCalledWith("user", JSON.stringify(fakeUser));
      expect(onSignUpSuccess).toHaveBeenCalledWith(fakeUser);
    });
  });

  it("API success (�?ม�?มี onSignUpSuccess): redirect �?�? /Home", async () => {
    const fakeUser = { username: "me", email: "me@x.com", role: "member" };
    mockFetchOnce({ success: true, user: fakeUser });

    const originalLocation = window.location;
    Object.defineProperty(window, "location", {
      value: { ...originalLocation, href: "" },
      writable: true,
    });

    render(
      <MemoryRouter>
        <SignUp />
      </MemoryRouter>
    );

    typeIntoForm({});
    fireEvent.click(screen.getByRole("button", { name: /create account/i }));

    await waitFor(() => {
      expect(window.location.href).toBe("/Home");
    });

    Object.defineProperty(window, "location", { value: originalLocation });
  });

  it("API error: แส�?�?�?�?อ�?วาม�?าก server", async () => {
    mockFetchOnce({ success: false, message: "อี�?มล�?ี�?มี�?ู�?�?�?�?�?า�?แล�?ว" });

    render(
      <MemoryRouter>
        <SignUp />
      </MemoryRouter>
    );

    typeIntoForm({});
    fireEvent.click(screen.getByRole("button", { name: /create account/i }));

    expect(await screen.findByText(/อี�?มล�?ี�?มี�?ู�?�?�?�?�?า�?แล�?ว/i)).toBeInTheDocument();
  });

  it("API error (�?ม�?มี message): �?�?�? fallback 'การสมั�?รสมา�?ิกล�?ม�?หลว'", async () => {
    mockFetchOnce({ success: false });

    render(
      <MemoryRouter>
        <SignUp />
      </MemoryRouter>
    );

    typeIntoForm({});
    fireEvent.click(screen.getByRole("button", { name: /create account/i }));

    expect(await screen.findByText(/การสมั�?รสมา�?ิกล�?ม�?หลว/i)).toBeInTheDocument();
  });

  it("Network error: แส�?�?�?�?อ�?วามภาษา�?�?ย�?าม�?ี�?กำห�?�?", async () => {
    (globalThis.fetch as any) = vi.fn().mockRejectedValueOnce(new Error("Network down"));

    render(
      <MemoryRouter>
        <SignUp />
      </MemoryRouter>
    );

    typeIntoForm({});
    fireEvent.click(screen.getByRole("button", { name: /create account/i }));

    expect(
      await screen.findByText(/�?�?ื�?อม�?�?อ�?�?ิร�?�?�?วอร�?�?ม�?�?�?�? กรุ�?าลอ�?�?หม�?อีก�?รั�?�?/i)
    ).toBeInTheDocument();
  });
});




