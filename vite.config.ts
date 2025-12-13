import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { visualizer } from "rollup-plugin-visualizer";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    visualizer({
      filename: "./dist/stats.html",
      open: false,
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:4000",
        changeOrigin: true,
      },
    },
  },
  test: {
    globals: true, // Makes describe, it, expect available globally
    environment: "jsdom",
    setupFiles: ["./src/test-setup.ts"],
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "**/e2e/**",
      "**/.{idea,git,cache,output,temp}/**",
    ],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: ["node_modules/", "src/test/", "e2e/"],
    },
  },
  build: {
    outDir: "dist",
    manifest: true,
    rollupOptions: {
      input: "/src/entry-client.tsx",
    },
  },
  ssr: {
    // Externalize React and React-DOM to use node_modules versions directly
    // This prevents multiple React instances and context issues
    external: [
      "react",
      "react-dom",
      "react/jsx-runtime",
      "@atlaskit/pragmatic-drag-and-drop",
      "@atlaskit/pragmatic-drag-and-drop-hitbox",
    ],
    noExternal: ["react-router-dom", "react-router"],
    resolve: {
      // Ensure consistent React resolution
      conditions: ["node", "import"],
      dedupe: ["react", "react-dom"],
    },
  },
});
