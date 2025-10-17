// frontend/src/config/api.ts
// อ่านค่าจาก .env (Vite) แล้วมี fallback เป็น '/api' สำหรับ k8s/Ingress
export const API_BASE: string =
    (import.meta as any)?.env?.VITE_API_BASE ?? '/api';

// helper กัน / ซ้ำ/หาย
export const apiUrl = (path: string) =>
    `${API_BASE.replace(/\/$/, '')}/${String(path).replace(/^\//, '')}`;
