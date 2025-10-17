const RAW_BASE = (import.meta as any)?.env?.VITE_API_BASE ?? "/api";

const API_BASE = (() => {
    const b = String(RAW_BASE || "").trim();
    if (!b) return "/api";
    if (/^https?:\/\//i.test(b)) return b.replace(/\/+$/, "");
    return `/${b.replace(/^\/+/, "").replace(/\/+$/, "")}`;
})();

type JSONValue = string | number | boolean | null | { [k: string]: JSONValue } | JSONValue[];

export type ApiError = Error & { status?: number; body?: unknown };

async function request<T = any>(
    path: string,
    init: RequestInit & { timeoutMs?: number } = {}
): Promise<T> {
    const timeoutMs = init.timeoutMs ?? 15000;
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeoutMs);

    const p = path.startsWith("/") ? path : `/${path}`;
    const url = `${API_BASE}${p}`;

    try {
        const res = await fetch(url, {
            credentials: "include",
            headers: { Accept: "application/json", ...(init.headers || {}) },
            signal: ctrl.signal,
            ...init,
        });

        const ct = res.headers.get("content-type") || "";
        const body = ct.includes("application/json") ? await res.json() : await res.text();

        if (!res.ok) {
            const err: ApiError = new Error(
                typeof body === "string" && body ? body.slice(0, 300) : `${res.status} ${res.statusText}`
            );
            err.status = res.status;
            err.body = body;
            throw err;
        }
        return body as T;
    } catch (e: any) {
        if (e?.name === "AbortError") throw new Error("Request timeout. Please try again.");
        throw e;
    } finally {
        clearTimeout(timer);
    }
}

function jsonHeaders() {
    return { "Content-Type": "application/json" };
}

export const api = {
    base: API_BASE,
    get:  <T = any>(path: string, init: RequestInit = {}) =>
        request<T>(path, { method: "GET", ...init }),
    post: <T = any>(path: string, data?: JSONValue, init: RequestInit = {}) =>
        request<T>(path, { method: "POST", headers: { ...jsonHeaders(), ...(init.headers || {}) }, body: data != undefined ? JSON.stringify(data) : undefined, ...init }),
    put:  <T = any>(path: string, data?: JSONValue, init: RequestInit = {}) =>
        request<T>(path, { method: "PUT", headers: { ...jsonHeaders(), ...(init.headers || {}) }, body: data != undefined ? JSON.stringify(data) : undefined, ...init }),
    patch:<T = any>(path: string, data?: JSONValue, init: RequestInit = {}) =>
        request<T>(path, { method: "PATCH", headers: { ...jsonHeaders(), ...(init.headers || {}) }, body: data != undefined ? JSON.stringify(data) : undefined, ...init }),
    del:  <T = any>(path: string, init: RequestInit = {}) =>
        request<T>(path, { method: "DELETE", ...init }),
};
