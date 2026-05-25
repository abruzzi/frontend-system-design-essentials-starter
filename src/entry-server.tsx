import * as React from "react";

import { renderToPipeableStream } from "react-dom/server";
import { StaticRouter } from "react-router";
import App from "./App.tsx";

export function renderApp(url: string) {
  const ABORT_DELAY = 10_000;
  let didError = false;

  const element = (
    <StaticRouter location={url}>
      <App />
    </StaticRouter>
  );

  return new Promise<{
    pipe: (w: NodeJS.WritableStream) => void;
    didError: () => boolean;
    abort: () => void;
  }>((resolve) => {
    const { pipe, abort } = renderToPipeableStream(element, {
      onShellReady() {
        clearTimeout(timeoutId);
        resolve({ pipe, didError: () => didError, abort });
      },
      onShellError(err) {
        didError = true;
        clearTimeout(timeoutId);
        console.error(err);
        resolve({ pipe, didError: () => didError, abort });
      },
      onError(err) {
        didError = true;
        console.error(err);
      },
    });
    const timeoutId = setTimeout(abort, ABORT_DELAY);
  });
}
