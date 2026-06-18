import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        // Split the heavy charting lib and data layer into cacheable vendor chunks.
        manualChunks: {
          recharts: ["recharts"],
          supabase: ["@supabase/supabase-js"],
          react: ["react", "react-dom", "react-router-dom"],
        },
      },
    },
  },
});
