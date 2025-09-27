import "./App.css";
import { BoardPage } from "./components/BoardPage.tsx";
import {
  BoardProvider,
  EMPTY_BOARD_STATE,
} from "./components/BoardContext.tsx";
import { QueryProvider } from "./components/QueryProvider.tsx";

const App = () => (
  <QueryProvider>
    <BoardProvider initialState={EMPTY_BOARD_STATE}>
      <BoardPage id="1" />
    </BoardProvider>
  </QueryProvider>
);

export default App;
