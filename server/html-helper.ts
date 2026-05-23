import fs from "node:fs";
import { CLIENT_MANIFEST_PATH } from "./paths.js";

export function startHTML(head = "") {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
${head}
<title>Frontend System Design Essentials</title>
</head>
<body>
<div id="root">`;
}

export function endHTML(beforeScripts = "", scripts = "") {
  return `</div>
${beforeScripts}
${scripts}
</body></html>`;
}

export function serialize(data: unknown) {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

type ManifestEntry = {
  file?: string;
  css?: string[];
};

type Manifest = Record<string, ManifestEntry>;

export function getClientAssets() {
  if (!fs.existsSync(CLIENT_MANIFEST_PATH)) {
    return { head: "", bodyScript: "" };
  }

  const manifest = JSON.parse(
    fs.readFileSync(CLIENT_MANIFEST_PATH, "utf-8"),
  ) as Manifest;

  // Vite manifests can use either "src/entry-client.tsx" or "index.html" as the app entry.
  const entry =
    manifest["src/entry-client.tsx"] ??
    manifest["index.html"] ??
    null;

  if (!entry?.file) {
    return { head: "", bodyScript: "" };
  }

  const js = `/${entry.file}`;
  const cssLinks = (entry?.css ?? [])
    .map((href) => `<link rel="stylesheet" href="/${href}">`)
    .join("");

  const head = cssLinks + (js ? `<link rel="modulepreload" href="${js}">` : "");
  const bodyScript = js ? `<script type="module" src="${js}"></script>` : "";

  return { head, bodyScript };
}
