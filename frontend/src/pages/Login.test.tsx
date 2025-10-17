// src/pages/Login.test.tsx
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import Login from "./Login";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
    const actual = await vi.importActual<any>("react-router-dom");
    return { ...actual, useNavigate: () => mockNavigate };
});

function mockFetchOnce(data: any, ok = true) {
    (globalThis.fetch as any) = vi.fn().mockResolvedValueOnce({
        ok,
        json: async () => data,
        headers: { get: () => "application/json" },
    } as any);
}

const isAnyLoginError = (txt: string) =>
    /invalid|login failed|unable|not allowed|network/i.test(txt);

describe("Login Frontend", () => {
    beforeEach(() => {
        vi.restoreAllMocks();
        vi.spyOn(window.localStorage.__proto__, "setItem");
        vi.spyOn(window, "dispatchEvent");
        mockNavigate.mockReset();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("renders login button", () => {
        render(
            <MemoryRouter>
                <Login />
            </MemoryRouter>
        );
        expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
    });

    it("disables button and shows loading while submitting", async () => {
        mockFetchOnce({ success: false, message: "x" });
        render(
            <MemoryRouter>
                <Login />
            </MemoryRouter>
        );
        fireEvent.change(screen.getByLabelText(/Username/i), { target: { value: "user" } });
        fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: "pass" } });
        const btn = screen.getByRole("button", { name: /login/i });
        fireEvent.click(btn);
        expect(btn).toBeDisabled();
        expect(btn).toHaveTextContent(/Logging in/i);
        await waitFor(() => expect(btn).toHaveTextContent(/login/i));
    });

    it("navigates to /home on successful login", async () => {
        const fakeUser = { username: "u", role: "member" };
        mockFetchOnce({ success: true, user: fakeUser });
        render(
            <MemoryRouter>
                <Login />
            </MemoryRouter>
        );
        fireEvent.change(screen.getByLabelText(/Username/i), { target: { value: "u" } });
        fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: "p" } });
        fireEvent.click(screen.getByRole("button", { name: /login/i }));
        await waitFor(() => {
            expect(localStorage.setItem).toHaveBeenCalledWith("isAuthenticated", "true");
            expect(localStorage.setItem).toHaveBeenCalledWith("user", JSON.stringify(fakeUser));
            expect(mockNavigate).toHaveBeenCalledWith("/home", expect.objectContaining({ replace: true }));
        });
    });

    it("shows error message from API", async () => {
        mockFetchOnce({ success: false, message: "Invalid credentials" });
        render(
            <MemoryRouter>
                <Login />
            </MemoryRouter>
        );
        fireEvent.change(screen.getByLabelText(/Username/i), { target: { value: "wrong" } });
        fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: "wrong" } });
        fireEvent.click(screen.getByRole("button", { name: /login/i }));
        expect(await screen.findByText((t) => isAnyLoginError(t))).toBeInTheDocument();
    });

    it("shows English error when network fails", async () => {
        (globalThis.fetch as any) = vi.fn().mockRejectedValueOnce(new Error("Network down"));
        render(
            <MemoryRouter>
                <Login />
            </MemoryRouter>
        );
        fireEvent.change(screen.getByLabelText(/Username/i), { target: { value: "u" } });
        fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: "p" } });
        fireEvent.click(screen.getByRole("button", { name: /login/i }));
        expect(await screen.findByText((t) => isAnyLoginError(t))).toBeInTheDocument();
    });

    it("clicks Sign Up and navigates to /signup", () => {
        render(
            <MemoryRouter>
                <Login />
            </MemoryRouter>
        );
        fireEvent.click(screen.getByRole("button", { name: /Sign Up/i }));
        expect(mockNavigate).toHaveBeenCalledWith("/signup");
    });

    it("calls fetch with correct params", async () => {
        const fakeUser = { username: "u", role: "member" };
        const fetchSpy = vi.spyOn(globalThis as any, "fetch").mockResolvedValueOnce({
            ok: true,
            json: async () => ({ success: true, user: fakeUser }),
            headers: { get: () => "application/json" },
        } as any);
        render(
            <MemoryRouter>
                <Login />
            </MemoryRouter>
        );
        fireEvent.change(screen.getByLabelText(/Username/i), { target: { value: "u" } });
        fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: "p" } });
        fireEvent.click(screen.getByRole("button", { name: /login/i }));
        await waitFor(() => expect(fetchSpy).toHaveBeenCalled());
        const [url, options] = fetchSpy.mock.calls[0] as [string, RequestInit];
        expect(url).toBe("/api/api/auth/login");
        expect(options.method).toBe("POST");
        const contentType = new Headers(options.headers as HeadersInit).get("Content-Type");
        expect(contentType).toBe("application/json");
        expect(options.credentials).toBe("include");
        expect(JSON.parse(String(options.body))).toEqual({ username: "u", password: "p" });
    });

    it("inputs are disabled during loading", async () => {
        (globalThis.fetch as any) = vi.fn().mockResolvedValueOnce({
            ok: true,
            json: async () => ({ success: false, message: "x" }),
            headers: { get: () => "application/json" },
        } as any);
        render(
            <MemoryRouter>
                <Login />
            </MemoryRouter>
        );
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

    it("clears previous error before showing the next one", async () => {
        mockFetchOnce({ success: false, message: "Invalid credentials" });
        render(
            <MemoryRouter>
                <Login />
            </MemoryRouter>
        );
        fireEvent.change(screen.getByLabelText(/Username/i), { target: { value: "u" } });
        fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: "x" } });
        fireEvent.click(screen.getByRole("button", { name: /login/i }));
        const firstErr = await screen.findByText((t) => isAnyLoginError(t));
        expect(firstErr).toBeInTheDocument();

        mockFetchOnce({ success: false, message: "Another error" });
        fireEvent.click(screen.getByRole("button", { name: /login/i }));

        await waitFor(() => {
            expect(screen.queryByText((t) => /invalid/i.test(t))).not.toBeInTheDocument();
        });
        expect(await screen.findByText((t) => isAnyLoginError(t))).toBeInTheDocument();
    });

    it("falls back when server lacks message (shows status or 'Invalid response')", async () => {
        (globalThis.fetch as any) = vi.fn().mockResolvedValueOnce({
            ok: false,
            status: 400,
            statusText: "Bad Request",
            headers: { get: () => "application/json" },
            json: async () => ({ success: false }),
        } as any);
        render(
            <MemoryRouter>
                <Login />
            </MemoryRouter>
        );
        fireEvent.change(screen.getByLabelText(/Username/i), { target: { value: "u" } });
        fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: "p" } });
        fireEvent.click(screen.getByRole("button", { name: /login/i }));
        const matches = await screen.findAllByText((_, node) => {
            const text = node?.textContent || "";
            return /400 Bad Request|Invalid response from server/i.test(text);
        });
        expect(matches.length).toBeGreaterThan(0);
    });

    it("calls onLoginSuccess with user from API", async () => {
        const fakeUser = { username: "u", role: "member" };
        const onLoginSuccess = vi.fn();
        mockFetchOnce({ success: true, user: fakeUser });
        render(
            <MemoryRouter>
                <Login onLoginSuccess={onLoginSuccess} />
            </MemoryRouter>
        );
        fireEvent.change(screen.getByLabelText(/Username/i), { target: { value: "u" } });
        fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: "p" } });
        fireEvent.click(screen.getByRole("button", { name: /login/i }));
        await waitFor(() => expect(onLoginSuccess).toHaveBeenCalledWith(fakeUser));
    });

    it('dispatches "auth-changed" after successful login', async () => {
        const fakeUser = { username: "u", role: "member" };
        const dispatchSpy = vi.spyOn(window, "dispatchEvent");
        mockFetchOnce({ success: true, user: fakeUser });
        render(
            <MemoryRouter>
                <Login />
            </MemoryRouter>
        );
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
