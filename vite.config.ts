import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  base: "./",
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Separare Chart.js in un chunk dedicato
          chart: ["chart.js", "react-chartjs-2"],
          // Separare le icone in un chunk dedicato
          icons: ["lucide-react"],
          // Separare le utilities in un chunk dedicato
          vendor: ["react", "react-dom", "react-hook-form"],
        },
      },
    },
    // Aumentare il limite per evitare warning su chunk legittimamente grandi
    chunkSizeWarningLimit: 600,
  },
});
