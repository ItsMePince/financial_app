// cypress.config.ts
import { defineConfig } from "cypress";

export default defineConfig({
    e2e: {
        baseUrl: process.env.CYPRESS_baseUrl || "http://app.localtest.me:8080",
        supportFile: "cypress/support/e2e.ts",
        specPattern: "cypress/e2e/**/*.cy.{js,jsx,ts,tsx}",
        env: {
            API_BASE: process.env.CYPRESS_API_URL || "/api",
        },
    },
});
