import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // During dev, forward /api calls to Express
      "/api": {
        target: "http://localhost:5001",
        changeOrigin: true,
      },
    },
  },
});
