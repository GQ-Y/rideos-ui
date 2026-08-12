import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@rideos/ui/styles.css";
import "@rideos/charts/styles.css";
import { App } from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
