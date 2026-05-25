// noinspection TypeScriptValidateTypes

import "./App.css";
import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.tsx";
import { registerServiceWorker } from "./utils/serviceWorker.ts";
import { logWebVitals } from "./utils/performance.ts";

registerServiceWorker().catch((error) => {
  console.error("Failed to register service worker:", error);
});

logWebVitals();

const container = document.getElementById("root")!;

const app = (
  <BrowserRouter>
    <App />
  </BrowserRouter>
);

const tree = import.meta.env.DEV ? <StrictMode>{app}</StrictMode> : app;

if (container.hasChildNodes()) {
  hydrateRoot(container, tree);
} else {
  createRoot(container).render(tree);
}
