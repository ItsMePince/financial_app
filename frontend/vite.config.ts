// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,   // à¹ƒà¸«à¹‰ dev server à¸£à¸±à¸™à¸—à¸µà¹ˆà¸žà¸­à¸£à¹Œà¸• 3000
    host: true,   // à¹€à¸›à¸´à¸”à¹ƒà¸«à¹‰à¹€à¸‚à¹‰à¸²à¸ˆà¸²à¸à¸ à¸²à¸¢à¸™à¸­à¸ container à¹„à¸”à¹‰ (à¸–à¹‰à¸²à¹ƒà¸Šà¹‰ Docker)
  },
  preview: {
    port: 3000,   // à¹ƒà¸«à¹‰ `vite preview` à¹ƒà¸Šà¹‰à¸žà¸­à¸£à¹Œà¸• 3000 à¸”à¹‰à¸§à¸¢
    host: true,
  },
  define: {
    "import.meta.env.VITE_API_BASE": JSON.stringify("/api"),
    "import.meta.env.REACT_APP_API_BASE": JSON.stringify(""),
  },
});




