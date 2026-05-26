import * as Sentry from "@sentry/react";

type ReportCardCreationFailureInput = {
  error: unknown;
  columnId: string;
  status?: number;
};

type ReportCardMoveFailureInput = {
  error: unknown;
  cardId: string;
  fromColumnId: string;
  toColumnId: string;
  status?: number;
};

export function reportCardCreationFailure({
  error,
  columnId,
  status,
}: ReportCardCreationFailureInput) {
  Sentry.captureException(error, {
    tags: {
      feature: "board",
      operation: "create_card",
    },
    extra: {
      columnId,
      status,
    },
  });
}

export function reportCardMoveFailure({
  error,
  cardId,
  fromColumnId,
  toColumnId,
  status,
}: ReportCardMoveFailureInput) {
  Sentry.captureException(error, {
    tags: {
      feature: "board",
      operation: "move_card",
    },
    extra: {
      cardId,
      fromColumnId,
      toColumnId,
      status,
    },
  });
}
