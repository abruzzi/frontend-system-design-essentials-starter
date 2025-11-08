// noinspection TypeScriptValidateTypes

import "./App.css";
import { hydrateRoot } from "react-dom/client";
import {
  BoardProvider,
  EMPTY_BOARD_STATE,
} from "./shared/BoardContext.tsx";
import { BoardPage } from "./board-page/BoardPage.tsx";
import type { NormalizedBoard } from "./types.ts";
import { QueryProvider } from "./shared/QueryProvider.tsx";

declare global {
  interface Window {
    __INITIAL_DATA__?: NormalizedBoard;
    __BOARD_ID__?: string;
  }
}

const initial = window.__INITIAL_DATA__ ?? EMPTY_BOARD_STATE;
const boardId = window.__BOARD_ID__ ?? "1";

hydrateRoot(
  document.getElementById("root")!,
  <QueryProvider>
    <BoardProvider initialState={initial}>
      <BoardPage id={boardId} />
    </BoardProvider>
  </QueryProvider>,
);
