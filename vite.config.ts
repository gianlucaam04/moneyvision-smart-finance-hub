import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// `vite preview` has to serve the pre-rendered pages (dist/about.html for
// /about), not fall back to index.html as a single-page app would. In dev the
// SPA fallback is what we want, so the app type depends on the command.
const isPreview = process.argv.includes("preview");

// https://vitejs.dev/config/
export default defineConfig({
  appType: isPreview ? "mpa" : "spa",
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
