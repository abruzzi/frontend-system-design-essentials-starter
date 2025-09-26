import path from "node:path";
import fs from "node:fs";

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

let manifest = null;

const mf = path.join(__dirname, "../dist/.vite/manifest.json");
if (fs.existsSync(mf)) {
  manifest = JSON.parse(fs.readFileSync(mf, "utf-8"));
}

export function getClientAssets() {
  const entry = manifest["src/entry-client.tsx"];

  const js = `/${entry.file}`;
  const cssLinks = (entry?.css ?? [])
    .map((href) => `<link rel="stylesheet" href="/${href}">`)
    .join("");

  const head = cssLinks + (js ? `<link rel="modulepreload" href="${js}">` : "");
  const bodyScript = js ? `<script type="module" src="${js}"></script>` : "";

  return { head, bodyScript };
}
