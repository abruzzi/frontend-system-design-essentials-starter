import "./App.css";
import { Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import * as Sentry from "@sentry/react";
import {
  BoardProvider,
  EMPTY_BOARD_STATE,
} from "./shared/BoardContext.tsx";
import { QueryProvider } from "./shared/QueryProvider.tsx";
import { AppLayout } from "./shared/AppLayout.tsx";
import { PageLoadingFallback } from "./shared/PageLoadingFallback.tsx";

const SentryRoutes = Sentry.withSentryReactRouterV7Routing(Routes);

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
          <SentryRoutes>
            <Route path="/your-work" element={<YourWorkPage />} />
            <Route path="/board/:id" element={<BoardPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/" element={<YourWorkPage />} />
          </SentryRoutes>
        </Suspense>
      </AppLayout>
    </BoardProvider>
  </QueryProvider>
);

export default App;
