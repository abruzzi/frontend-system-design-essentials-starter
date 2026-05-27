// noinspection TypeScriptValidateTypes

import { initSentry } from "./errors/initSentry.ts";

initSentry();

import "./App.css";
import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.tsx";
import { registerServiceWorker } from "./utils/serviceWorker.ts";
import { initWebVitalsReporting } from "./utils/performance.ts";
import { StatsigClientProvider } from "./shared/featureFlags/StatsigClientProvider.tsx";

registerServiceWorker().catch((error) => {
  console.error("Failed to register service worker:", error);
});

initWebVitalsReporting();

const container = document.getElementById("root")!;

const app = (
  <BrowserRouter>
    <StatsigClientProvider>
      <App />
    </StatsigClientProvider>
  </BrowserRouter>
);

const tree = import.meta.env.DEV ? <StrictMode>{app}</StrictMode> : app;

if (container.hasChildNodes()) {
  hydrateRoot(container, tree);
} else {
  createRoot(container).render(tree);
}
