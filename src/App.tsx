import "./App.css";
import { Routes, Route } from "react-router-dom";
import { BoardPage } from "./board-page/BoardPage.tsx";
import { YourWorkPage } from "./your-work/YourWorkPage.tsx";
import { SettingsPage } from "./settings/SettingsPage.tsx";
import {
  BoardProvider,
  EMPTY_BOARD_STATE,
} from "./shared/BoardContext.tsx";
import { QueryProvider } from "./shared/QueryProvider.tsx";

const App = () => (
  <QueryProvider>
    <BoardProvider initialState={EMPTY_BOARD_STATE}>
      <Routes>
        <Route path="/your-work" element={<YourWorkPage />} />
        <Route path="/board/:id" element={<BoardPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/" element={<YourWorkPage />} />
      </Routes>
    </BoardProvider>
  </QueryProvider>
);

export default App;
