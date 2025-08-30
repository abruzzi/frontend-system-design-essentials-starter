import "./App.css";
import { KanbanMockup } from "./components/BoardPage.tsx";
import { BoardProvider } from "./components/BoardContext.tsx";

const App = () => (
  <BoardProvider>
    <KanbanMockup id="1" />
  </BoardProvider>
);

export default App;
