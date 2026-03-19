import { defineConfig } from "vitest/config"
import react from "@vitejs/plugin-react"
import path from "path"

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "node",
    include: ["src/__tests__/**/*.test.ts"],
    globals: true,
    env: {
      SKIP_ENV_VALIDATION: "1",
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
