import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "../../../test/renderWithProviders.tsx";
import { buildNormalizedBoard } from "../../../test/fixtures/board.ts";
import { ListView } from "../ListView.tsx";

describe("ListView", () => {
  it("hides the assignee column", () => {
    // given
    renderWithProviders(<ListView />, {
      boardState: buildNormalizedBoard(),
    });

    // then
    expect(screen.queryByText(/assignee/i)).not.toBeInTheDocument();
    expect(screen.queryByText("John Doe")).not.toBeInTheDocument();
  });
});

