import { onCLS, onINP, onLCP, onFCP, onTTFB, type Metric } from "web-vitals";

export function reportWebVitals(onReport: (metric: Metric) => void) {
  onCLS(onReport);
  onINP(onReport);
  onLCP(onReport);
  onFCP(onReport);
  onTTFB(onReport);
}

/**
 * Logs Core Web Vitals to the browser console in development.
 *
 * In production, Sentry's `reactRouterV7BrowserTracingIntegration` (see
 * `initSentry.ts`) already attaches LCP, CLS, INP, etc. to sampled `pageload`
 * transactions when `tracesSampleRate` > 0. We do not forward metrics here to
 * avoid duplicate events in Sentry.
 *
 * To verify vitals in Sentry locally, set in `.env.local`:
 * `VITE_SENTRY_TRACES_SAMPLE_RATE=1` and reload with DSN configured.
 */
export function initWebVitalsReporting() {
  reportWebVitals((metric) => {
    if (!import.meta.env.DEV) return;

    const unit = metric.name === "CLS" ? "" : "ms";
    console.log(
      `[Web Vitals] ${metric.name}: ${metric.value.toFixed(2)}${unit} (${metric.rating})`,
    );
  });
}

/** @deprecated Use initWebVitalsReporting */
export function logWebVitals() {
  initWebVitalsReporting();
}
