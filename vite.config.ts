import { defineConfig } from "vite";

// User site: https://rohsomeness.github.io — base path is root
export default defineConfig({
  base: "/",
  server: {
    port: 5173,
    open: false,
  },
  build: {
    outDir: "dist",
    assetsDir: "assets",
  },
});
