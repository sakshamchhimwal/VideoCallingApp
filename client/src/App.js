import { Route, Routes } from "react-router-dom";
import './App.css';
import Lobby from "./screen/lobby";
import RoomPage from "./screen/room";

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Lobby />} />
        <Route path="/room/:roomId" element={<RoomPage />} />
      </Routes>
    </div>
  );
}

export default App;
