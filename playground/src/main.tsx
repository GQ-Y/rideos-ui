import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@rideos-ai/ui/styles.css";
import "@rideos-ai/charts/styles.css";
import { App } from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
