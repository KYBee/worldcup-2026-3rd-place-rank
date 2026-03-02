import { defineConfig } from "vite";
import path from "node:path";

export default defineConfig({
  resolve: {
    alias: {
      "@core": path.resolve(__dirname, "src/core"),
      "@ui": path.resolve(__dirname, "src/ui"),
      "@pages": path.resolve(__dirname, "src/pages"),
      "@data": path.resolve(__dirname, "src/data"),
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, "index.html"),
        simulator: path.resolve(__dirname, "ui/simulator.html"),
        groups: path.resolve(__dirname, "ui/groups.html"),
        schedule: path.resolve(__dirname, "ui/schedule.html"),
        bracket: path.resolve(__dirname, "ui/bracket.html"),
      },
    },
  },
});
