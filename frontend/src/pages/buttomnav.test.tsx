// src/pages/buttomnav.test.tsx
import { describe, it, expect } from "vitest";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { render } from "@testing-library/react";
import BottomNav from "./buttomnav";

function renderAt(pathname: string) {
    return render(
        <MemoryRouter initialEntries={[pathname]}>
            <Routes>
                {/* ต้องให้ BottomNav อยู่ภายใน Router เสมอ */}
                <Route path="*" element={<BottomNav />} />
            </Routes>
        </MemoryRouter>
    );
}

describe("BottomNav", () => {
    it("แสดงลิงก์นำทาง 3 ปุ่ม และ href ถูกต้อง", () => {
        const { container } = renderAt("/home");
        const links = container.querySelectorAll("a.nav-button");
        expect(links.length).toBe(3);

        // ตรวจ href (ใน JSDOM มักถูกแปลงเป็น absolute จึงตรวจด้วย regex ปลายทาง)
        expect(links[0].getAttribute("href") ?? "").toMatch(/\/expense$/);
        expect(links[1].getAttribute("href") ?? "").toMatch(/\/home$/);
        expect(links[2].getAttribute("href") ?? "").toMatch(/\/month$/);
    });

    it("มีคลาส active ถูกปุ่มตามเส้นทางที่กำหนด - /home", () => {
        const { container } = renderAt("/home");
        const links = container.querySelectorAll("a.nav-button");
        expect(links[1].className).toMatch(/\bactive\b/);
        expect(links[0].className).not.toMatch(/\bactive\b/);
        expect(links[2].className).not.toMatch(/\bactive\b/);
    });

    it("มีคลาส active ถูกปุ่มตามเส้นทางที่กำหนด - /expense", () => {
        const { container } = renderAt("/expense");
        const links = container.querySelectorAll("a.nav-button");
        expect(links[0].className).toMatch(/\bactive\b/);
        expect(links[1].className).not.toMatch(/\bactive\b/);
        expect(links[2].className).not.toMatch(/\bactive\b/);
    });

    it("มีคลาส active ถูกปุ่มตามเส้นทางที่กำหนด - /month", () => {
        const { container } = renderAt("/month");
        const links = container.querySelectorAll("a.nav-button");
        expect(links[2].className).toMatch(/\bactive\b/);
        expect(links[0].className).not.toMatch(/\bactive\b/);
        expect(links[1].className).not.toMatch(/\bactive\b/);
    });
});
