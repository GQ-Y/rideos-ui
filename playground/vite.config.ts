import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

/** 别名直指源码,开发期免构建、支持 HMR */
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      {
        find: "@rideos/ui/styles.css",
        replacement: fileURLToPath(new URL("../packages/ui/src/styles/index.css", import.meta.url)),
      },
      {
        find: "@rideos/charts/styles.css",
        replacement: fileURLToPath(new URL("../packages/charts/src/styles/charts.css", import.meta.url)),
      },
      {
        find: "@rideos/ui",
        replacement: fileURLToPath(new URL("../packages/ui/src/index.ts", import.meta.url)),
      },
      {
        find: "@rideos/charts",
        replacement: fileURLToPath(new URL("../packages/charts/src/index.ts", import.meta.url)),
      },
    ],
  },
  server: {
    port: 5173,
  },
});
