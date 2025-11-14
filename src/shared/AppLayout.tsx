import type { ReactNode } from "react";
import { TopBar } from "../board-page/topbar/TopBar.tsx";

/**
 * Shared layout component that wraps all pages.
 * This ensures TopBar is always loaded and doesn't need to be lazy-loaded.
 */
export const AppLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 flex flex-col">
      <TopBar />
      {children}
    </div>
  );
};

