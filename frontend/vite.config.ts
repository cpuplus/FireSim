import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    sourcemap: true,
  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:5007", // 백엔드 서버 주소 및 포트
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
