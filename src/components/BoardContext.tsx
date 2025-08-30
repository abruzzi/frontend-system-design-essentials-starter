import { createContext, useContext, useState } from "react";
import type {BoardPayload, NormalizedBoard, User} from "../types.ts";
import { normalizeBoard } from "../utils";

type BoardContextType = {
  state: NormalizedBoard;
  ingestBoard: (data: BoardPayload) => void;
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
  upsertUser: () => {},
});

export const BoardProvider = ({ children }) => {
  const [state, setState] = useState<NormalizedBoard>(initialState);

  const ingestBoard = (data: BoardPayload) => {
    setState(normalizeBoard(data));
  };

  const upsertUser = (user: User) =>
    setState((state) => ({
      ...state,
      usersById: {
        ...state.usersById,
        [user.id]: { ...state.usersById[user.id], ...user },
      },
    }));

  return (
    <BoardContext.Provider value={{ state, ingestBoard, upsertUser }}>
      {children}
    </BoardContext.Provider>
  );
};

export const useBoardContext = () => useContext<BoardContextType>(BoardContext);
