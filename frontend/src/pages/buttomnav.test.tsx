// src/pages/buttomnav.test.tsx
import { describe, it, expect } from "vitest";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import BottomNav from "./buttomnav";

function renderAt(pathname: string) {
  return render(
    <MemoryRouter initialEntries={[pathname]}>
      <Routes>
        {/* �?ห�? BottomNav อยู�?�?�?�?ริ�?�?�?อ�? Router �?สมอ */}
        <Route path="*" element={<BottomNav />} />
      </Routes>
    </MemoryRouter>
  );
}

describe("BottomNav", () => {
  it("แส�?�?ลิ�?ก�?�?ร�? 3 �?ุ�?ม และ href �?ูก�?�?อ�?", () => {
    const { container } = renderAt("/home");
    const links = container.querySelectorAll("a.nav-button");
    expect(links.length).toBe(3);

    // �?รว�? href (�?า�?�?ี JSDOM แ�?ล�?�?�?�?�? absolute ก�?�?�?�?�?แ�?�? endsWith)
    expect(links[0].getAttribute("href") ?? "").toMatch(/\/expense$/);
    expect(links[1].getAttribute("href") ?? "").toMatch(/\/home$/);
    expect(links[2].getAttribute("href") ?? "").toMatch(/\/month$/);
  });

  it("�?�?ิ�?ม�?ลาส active �?ูก�?ุ�?ม�?าม�?ส�?�?�?า�?�?ั�?�?ุ�?ั�? - /home", () => {
    const { container } = renderAt("/home");
    const links = container.querySelectorAll("a.nav-button");
    expect(links[1].className).toMatch(/\bactive\b/);
    expect(links[0].className).not.toMatch(/\bactive\b/);
    expect(links[2].className).not.toMatch(/\bactive\b/);
  });

  it("�?�?ิ�?ม�?ลาส active �?ูก�?ุ�?ม�?าม�?ส�?�?�?า�?�?ั�?�?ุ�?ั�? - /expense", () => {
    const { container } = renderAt("/expense");
    const links = container.querySelectorAll("a.nav-button");
    expect(links[0].className).toMatch(/\bactive\b/);
    expect(links[1].className).not.toMatch(/\bactive\b/);
    expect(links[2].className).not.toMatch(/\bactive\b/);
  });

  it("�?�?ิ�?ม�?ลาส active �?ูก�?ุ�?ม�?าม�?ส�?�?�?า�?�?ั�?�?ุ�?ั�? - /month", () => {
    const { container } = renderAt("/month");
    const links = container.querySelectorAll("a.nav-button");
    expect(links[2].className).toMatch(/\bactive\b/);
    expect(links[0].className).not.toMatch(/\bactive\b/);
    expect(links[1].className).not.toMatch(/\bactive\b/);
  });
});



