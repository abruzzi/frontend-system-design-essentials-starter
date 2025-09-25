import "./App.css";
import { BoardPage } from "./components/BoardPage.tsx";
import {
  BoardProvider,
  EMPTY_BOARD_STATE,
} from "./components/BoardContext.tsx";

const App = () => (
  <BoardProvider initialState={EMPTY_BOARD_STATE}>
    <BoardPage id="1" />
  </BoardProvider>
);

export default App;
