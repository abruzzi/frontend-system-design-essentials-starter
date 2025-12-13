import { readFileSync } from "fs";
import { gzipSync } from "zlib";
import { globSync } from "glob";

// Read performance budget
const budget = JSON.parse(readFileSync("./performance-budget.json", "utf-8"));

// Get all JS files from dist
const jsFiles = globSync("dist/assets/**/*.js");

let totalSize = 0;
let vendorSize = 0;
let initialSize = 0;

jsFiles.forEach((file) => {
  const content = readFileSync(file);
  const gzipped = gzipSync(content);
  const size = gzipped.length;

  totalSize += size;

  const fileName = file.split("/").pop();

  if (fileName.includes("vendor")) {
    vendorSize += size;
  } else if (fileName.includes("index")) {
    initialSize += size;
  }
});

const results = {
  total: totalSize,
  vendor: vendorSize,
  initial: initialSize,
};

// Check against budgets
let hasError = false;

Object.entries(budget.budgets).forEach(([key, config]) => {
  const actual = results[key];
  if (!actual) return;

  const maxKB = parseFloat(config.max.replace("kb", ""));
  const actualKB = actual / 1024;

  if (actualKB > maxKB) {
    console.error(
      `❌ ${key} bundle exceeded budget: ${actualKB.toFixed(
        2,
      )} KB > ${maxKB} KB (${config.description})`,
    );
    hasError = true;
  } else {
    console.log(`✅ ${key} bundle OK: ${actualKB.toFixed(2)} KB / ${maxKB} KB`);
  }
});

if (hasError) {
  process.exit(1);
}

console.log("🎉 All performance budgets met.");
