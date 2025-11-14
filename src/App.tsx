import "./App.css";
import { Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import {
  BoardProvider,
  EMPTY_BOARD_STATE,
} from "./shared/BoardContext.tsx";
import { QueryProvider } from "./shared/QueryProvider.tsx";
import { AppLayout } from "./shared/AppLayout.tsx";
import { PageLoadingFallback } from "./shared/PageLoadingFallback.tsx";

// Lazy load page components for code splitting
// Note: These components should NOT include TopBar - it's in AppLayout
const YourWorkPage = lazy(() =>
  import("./your-work/YourWorkPage.tsx").then((mod) => ({
    default: mod.YourWorkPage,
  })),
);

const BoardPage = lazy(() =>
  import("./board-page/BoardPage.tsx").then((mod) => ({
    default: mod.BoardPage,
  })),
);

const SettingsPage = lazy(() =>
  import("./settings/SettingsPage.tsx").then((mod) => ({
    default: mod.SettingsPage,
  })),
);

const App = () => (
  <QueryProvider>
    <BoardProvider initialState={EMPTY_BOARD_STATE}>
      <AppLayout>
        <Suspense fallback={<PageLoadingFallback />}>
          <Routes>
            <Route path="/your-work" element={<YourWorkPage />} />
            <Route path="/board/:id" element={<BoardPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/" element={<YourWorkPage />} />
          </Routes>
        </Suspense>
      </AppLayout>
    </BoardProvider>
  </QueryProvider>
);

export default App;
