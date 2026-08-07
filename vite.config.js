import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Vite Library Mode：产出 ESM，外部化 React / icons */
export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/index.js"),
      name: "RideOSUI",
      formats: ["es"],
      fileName: () => "rideos-ui.js",
      cssFileName: "rideos-ui",
    },
    rollupOptions: {
      external: [
        "react",
        "react-dom",
        "react/jsx-runtime",
        "react/jsx-dev-runtime",
        "@ant-design/icons",
        "prop-types",
      ],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
          "prop-types": "PropTypes",
        },
      },
    },
    emptyOutDir: true,
  },
});
