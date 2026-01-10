// noinspection TypeScriptValidateTypes

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.tsx";
import { registerServiceWorker } from "./utils/serviceWorker.ts";

registerServiceWorker().catch((error) => {
  console.error("Failed to register service worker:", error);
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
