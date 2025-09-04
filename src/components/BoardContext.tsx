import { createContext, useCallback, useContext, useState } from "react";
import type { BoardPayload, NormalizedBoard, User } from "../types.ts";
import { normalizeBoard } from "../utils";

type BoardContextType = {
  state: NormalizedBoard;
  ingestBoard: (data: BoardPayload) => void;
  ingestUsers: (users: User[]) => void;
  upsertUser: (user: User) => void;
};

const initialState = {
  usersById: {},
  cardsById: {},
  columnsById: {},
  columnOrder: [],
};

const BoardContext = createContext<BoardContextType>({
  state: initialState,
  ingestBoard: () => {},
  ingestUsers: () => {},
  upsertUser: () => {},
});

export const BoardProvider = ({ children }) => {
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

  return (
    <BoardContext.Provider
      value={{ state, ingestBoard, ingestUsers, upsertUser }}
    >
      {children}
    </BoardContext.Provider>
  );
};

export const useBoardContext = () => useContext<BoardContextType>(BoardContext);
