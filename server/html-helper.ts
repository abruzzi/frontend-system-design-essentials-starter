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
