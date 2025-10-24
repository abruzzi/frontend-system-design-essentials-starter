import "@testing-library/jest-dom";
import '@testing-library/jest-dom/vitest';

import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";

import { toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

afterEach(() => {
  cleanup();
});

// Mock ResizeObserver (used by Radix UI Popover)
globalThis.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));
