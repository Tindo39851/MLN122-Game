import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: true,
    proxy: {
      "/identitytoolkit.googleapis.com": { target: "http://127.0.0.1:9099", changeOrigin: true },
      "/securetoken.googleapis.com": { target: "http://127.0.0.1:9099", changeOrigin: true },
      "/demo-mln122": { target: "http://127.0.0.1:5001", changeOrigin: true },
      "/.ws": { target: "ws://127.0.0.1:9000", ws: true, changeOrigin: true },
      "/.lp": { target: "http://127.0.0.1:9000", changeOrigin: true },
    },
  },
  build: {
    outDir: process.env.VERCEL ? "dist" : "../public",
    emptyOutDir: true,
  },
});
