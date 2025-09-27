// vitest.config.ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/setupTests.ts",
  },
  define: {
    "import.meta.env.VITE_API_BASE": JSON.stringify("http://localhost:8081"),
    "import.meta.env.REACT_APP_API_BASE": JSON.stringify(""),
  },
});
