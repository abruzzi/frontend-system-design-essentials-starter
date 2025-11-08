import "./App.css";
import { BoardPage } from "./board-page/BoardPage.tsx";
import {
  BoardProvider,
  EMPTY_BOARD_STATE,
} from "./shared/BoardContext.tsx";
import { QueryProvider } from "./shared/QueryProvider.tsx";

const App = () => (
  <QueryProvider>
    <BoardProvider initialState={EMPTY_BOARD_STATE}>
      <BoardPage id="1" />
    </BoardProvider>
  </QueryProvider>
);

export default App;
