import type { ReactElement, ReactNode } from "react";
import { render, type RenderOptions } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import {
  BoardProvider,
  EMPTY_BOARD_STATE,
} from "../shared/BoardContext.tsx";
import { QueryProvider } from "../shared/QueryProvider.tsx";
import type { NormalizedBoard } from "../types.ts";

type ProviderOptions = {
  boardState?: NormalizedBoard;
  withQuery?: boolean;
  route?: string;
};

function AllProviders({
  children,
  boardState = EMPTY_BOARD_STATE,
  withQuery = true,
  route = "/",
}: {
  children: ReactNode;
  boardState?: NormalizedBoard;
  withQuery?: boolean;
  route?: string;
}) {
  const tree = (
    <MemoryRouter initialEntries={[route]}>
      <BoardProvider initialState={boardState}>{children}</BoardProvider>
    </MemoryRouter>
  );
  return withQuery ? <QueryProvider>{tree}</QueryProvider> : tree;
}

export function renderWithProviders(
  ui: ReactElement,
  {
    boardState,
    withQuery = true,
    route = "/",
    ...renderOptions
  }: ProviderOptions & Omit<RenderOptions, "wrapper"> = {},
) {
  return render(ui, {
    wrapper: ({ children }) => (
      <AllProviders boardState={boardState} withQuery={withQuery} route={route}>
        {children}
      </AllProviders>
    ),
    ...renderOptions,
  });
}
