import { defineConfig } from "vite";
import packageJson from "./package.json" with { type: "json" };

const allowedHosts = process.env.VITE_ALLOWED_HOSTS
  ?.split(",")
  .map((host) => host.trim())
  .filter(Boolean);

export default defineConfig({
  clearScreen: false,
  define: {
    __APP_VERSION__: JSON.stringify(packageJson.version),
  },
  server: {
    host: "0.0.0.0",
    port: 1420,
    strictPort: true,
    allowedHosts,
  },
  preview: {
    host: "0.0.0.0",
    port: 4173,
    strictPort: true,
    allowedHosts,
  },
  build: {
    target: "es2022",
    sourcemap: false,
  },
});
