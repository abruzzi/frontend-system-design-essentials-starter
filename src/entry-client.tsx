// noinspection TypeScriptValidateTypes

import "./App.css";
import { hydrateRoot } from "react-dom/client";
import {
  BoardProvider,
  EMPTY_BOARD_STATE,
} from "./components/BoardContext.tsx";
import { BoardPage } from "./components/BoardPage.tsx";
import type { NormalizedBoard } from "./types.ts";

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
  <BoardProvider initialState={initial}>
    <BoardPage id={boardId} />
  </BoardProvider>,
);
