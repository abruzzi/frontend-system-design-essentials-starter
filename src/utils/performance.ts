import { onCLS, onINP, onLCP, onFCP, onTTFB } from 'web-vitals'

export function reportWebVitals(onReport) {
  onCLS(onReport)
  onINP(onReport)
  onLCP(onReport)
  onFCP(onReport)
  onTTFB(onReport)
}

export function logWebVitals() {
  console.info("Log Vitals", import.meta.env.DEV);
  if (import.meta.env.DEV) {
    reportWebVitals(metric => {
      console.log(`[Web Vitals] ${metric.name}: ${metric.value.toFixed(2)} (${metric.rating})`)
    })
  }
}
