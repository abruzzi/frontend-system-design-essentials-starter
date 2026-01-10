export async function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return null;

  try {
    const reg = await navigator.serviceWorker.register(
      "/offlineServiceWorker.js",
      {
        scope: "/",
      },
    );
    await navigator.serviceWorker.ready;
    return reg;
  } catch (e) {
    console.error("[SW] registration failed:", e);
    return null;
  }
}
