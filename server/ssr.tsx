import React from "react";

import { renderToPipeableStream } from "react-dom/server";
import { BoardProvider } from "../src/components/BoardContext";
import { BoardPage } from "../src/components/BoardPage";
import type { NormalizedBoard } from "../src/types";

export function renderApp(initialData: NormalizedBoard, boardId: string) {
  const ABORT_DELAY = 10_000;
  let didError = false;

  const element = (
    <BoardProvider initialState={initialData}>
      <BoardPage id={boardId} />
    </BoardProvider>
  );

  return new Promise<{
    pipe: (w: NodeJS.WritableStream) => void;
    didError: () => boolean;
    abort: () => void;
  }>((resolve) => {
    const { pipe, abort } = renderToPipeableStream(element, {
      onShellReady() {
        resolve({ pipe, didError: () => didError, abort });
      },
      onShellError(err) {
        didError = true;
        console.error(err);
        resolve({ pipe, didError: () => didError, abort });
      },
      onError(err) {
        didError = true;
        console.error(err);
      },
    });
    setTimeout(abort, ABORT_DELAY);
  });
}
