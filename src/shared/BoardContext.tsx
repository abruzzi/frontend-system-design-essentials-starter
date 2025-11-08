import type { ReactNode } from "react";
import { createContext, useCallback, useContext, useState } from "react";
import type { BoardPayload, NormalizedBoard, User } from "../types.ts";
import { normalizeBoard } from "../utils";

type BoardContextType = {
  state: NormalizedBoard;
  ingestBoard: (data: BoardPayload) => void;
  ingestUsers: (users: User[]) => void;
  upsertUser: (user: User) => void;
  updateCard: (
    cardId: string,
    updates: Partial<{ title: string; assigneeId?: number }>,
  ) => void;
  removeCard: (cardId: string) => void;
  toggleAssigneeFilter: (userId: number) => void;
  clearAssigneeFilters: () => void;
  addCard: (columnId: string, card: { id: string; title: string }) => void;
};

export const EMPTY_BOARD_STATE = {
  usersById: {},
  cardsById: {},
  columnsById: {},
  columnOrder: [],
  selectedAssigneeIds: [],
};

const BoardContext = createContext<BoardContextType>({
  state: EMPTY_BOARD_STATE,
  ingestBoard: () => {},
  ingestUsers: () => {},
  upsertUser: () => {},
  updateCard: () => {},
  removeCard: () => {},
  toggleAssigneeFilter: () => {},
  clearAssigneeFilters: () => {},
  addCard: () => {},
});

export const BoardProvider = ({
  initialState,
  children,
}: {
  initialState: NormalizedBoard;
  children: ReactNode;
}) => {
  const [state, setState] = useState<NormalizedBoard>(initialState);

  const ingestBoard = useCallback((data: BoardPayload) => {
    const normalized = normalizeBoard(data);

    console.log(normalized);

    setState((prev) => {
      const updated = {
        ...prev,
        usersById: { ...prev.usersById, ...normalized.usersById },
        cardsById: { ...prev.cardsById, ...normalized.cardsById },
        columnsById: { ...prev.columnsById, ...normalized.columnsById },
        columnOrder: normalized.columnOrder,
      };

      console.log(updated);

      return updated;
    });
  }, []);

  const ingestUsers = useCallback((users: User[]) => {
    setState((prev) => ({
      ...prev,
      usersById: {
        ...prev.usersById,
        ...Object.fromEntries(
          users.map((u) => [u.id, { ...prev.usersById[u.id], ...u }]),
        ),
      },
    }));
  }, []);

  const upsertUser = useCallback(
    (user: User) =>
      setState((state) => ({
        ...state,
        usersById: {
          ...state.usersById,
          [user.id]: { ...state.usersById[user.id], ...user },
        },
      })),
    [],
  );

  const removeCard = useCallback((cardId: string) => {
    setState((prev) => {
      // if (!prev.cardsById[cardId]) return prev;

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [cardId]: _removed, ...restCards } = prev.cardsById;

      const updatedColumns = Object.fromEntries(
        Object.entries(prev.columnsById).map(([colId, col]) => {
          if (!col.cardIds.includes(cardId)) return [colId, col];
          return [
            colId,
            { ...col, cardIds: col.cardIds.filter((id) => id !== cardId) },
          ];
        }),
      );

      return {
        ...prev,
        cardsById: restCards,
        columnsById: updatedColumns,
      };
    });
  }, []);

  const toggleAssigneeFilter = useCallback((userId: number) => {
    setState((prevState) => ({
      ...prevState,
      selectedAssigneeIds: prevState.selectedAssigneeIds.includes(userId)
        ? prevState.selectedAssigneeIds.filter((id) => id !== userId)
        : [...prevState.selectedAssigneeIds, userId],
    }));
  }, []);

  const clearAssigneeFilters = useCallback(() => {
    setState((prevState) => ({
      ...prevState,
      selectedAssigneeIds: [],
    }));
  }, []);

  const addCard = useCallback(
    (columnId: string, card: { id: string; title: string }) => {
      setState((prevState: NormalizedBoard) => {
        const updatedCardsById = {
          ...prevState.cardsById,
          [card.id]: {
            id: card.id,
            title: card.title,
          },
        };

        const column = prevState.columnsById[columnId];
        const updatedColumnsById = {
          ...prevState.columnsById,
          [columnId]: {
            ...column,
            cardIds: [...column.cardIds, card.id],
          },
        };

        return {
          ...prevState,
          cardsById: updatedCardsById,
          columnsById: updatedColumnsById,
        };
      });
    },
    [],
  );

  const updateCard = useCallback(
    (
      cardId: string,
      updates: Partial<{ title: string; assigneeId?: number }>,
    ) => {
      setState((prev) => {
        const existingCard = prev.cardsById[cardId];

        return {
          ...prev,
          cardsById: {
            ...prev.cardsById,
            [cardId]: { ...existingCard, ...updates },
          },
        };
      });
    },
    [],
  );

  return (
    <BoardContext.Provider
      value={{
        state,
        ingestBoard,
        ingestUsers,
        upsertUser,
        removeCard,
        updateCard,
        toggleAssigneeFilter,
        clearAssigneeFilters,
        addCard,
      }}
    >
      {children}
    </BoardContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useBoardContext = () => useContext<BoardContextType>(BoardContext);