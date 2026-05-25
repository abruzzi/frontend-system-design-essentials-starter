import { onCLS, onINP, onLCP, onFCP, onTTFB, type Metric } from "web-vitals";

export function reportWebVitals(onReport: (metric: Metric) => void) {
  onCLS(onReport);
  onINP(onReport);
  onLCP(onReport);
  onFCP(onReport);
  onTTFB(onReport);
}

export function logWebVitals() {
  reportWebVitals((metric) => {
    if (import.meta.env.DEV) {
      console.log(
        `[Web Vitals] ${metric.name}: ${metric.value.toFixed(2)} (${metric.rating})`,
      );
    }
  });
}
