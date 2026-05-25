import type { ReactElement, ReactNode } from "react";
import { render, type RenderOptions } from "@testing-library/react";
import {
  BoardProvider,
  EMPTY_BOARD_STATE,
} from "../shared/BoardContext.tsx";
import { QueryProvider } from "../shared/QueryProvider.tsx";
import type { NormalizedBoard } from "../types.ts";

type ProviderOptions = {
  boardState?: NormalizedBoard;
  withQuery?: boolean;
};

function AllProviders({
  children,
  boardState = EMPTY_BOARD_STATE,
  withQuery = true,
}: {
  children: ReactNode;
  boardState?: NormalizedBoard;
  withQuery?: boolean;
}) {
  const tree = (
    <BoardProvider initialState={boardState}>{children}</BoardProvider>
  );
  return withQuery ? <QueryProvider>{tree}</QueryProvider> : tree;
}

export function renderWithProviders(
  ui: ReactElement,
  {
    boardState,
    withQuery = true,
    ...renderOptions
  }: ProviderOptions & Omit<RenderOptions, "wrapper"> = {},
) {
  return render(ui, {
    wrapper: ({ children }) => (
      <AllProviders boardState={boardState} withQuery={withQuery}>
        {children}
      </AllProviders>
    ),
    ...renderOptions,
  });
}
