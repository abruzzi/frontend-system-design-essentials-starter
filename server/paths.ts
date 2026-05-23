import path from "node:path";
import { fileURLToPath } from "node:url";

const currentFileDir = path.dirname(fileURLToPath(import.meta.url));

/** Directory containing the Express app (`server/`), whether run from source or `server/dist/`. */
export const SERVER_DIR = currentFileDir.endsWith(`${path.sep}dist`)
  ? path.resolve(currentFileDir, "..")
  : currentFileDir;

/** Repository root (parent of `server/`). */
export const PROJECT_ROOT = path.resolve(SERVER_DIR, "..");

export const DIST_DIR = path.join(PROJECT_ROOT, "dist");
export const CLIENT_ASSETS_DIR = path.join(DIST_DIR, "assets");
export const CLIENT_MANIFEST_PATH = path.join(DIST_DIR, ".vite/manifest.json");
export const SSR_ENTRY_PATH = path.join(DIST_DIR, "server/entry-server.js");
export const MOCKS_DIR = path.join(SERVER_DIR, "mocks");
