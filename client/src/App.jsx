import axios from "axios";
import { Routes, Route } from "react-router-dom";

import RegisterAndLogin from "./pages/RegisterAndLogin";
import Chat from "./pages/Chat";

function App() {
  axios.defaults.baseURL = "http://localhost:5000/api";
  axios.defaults.withCredentials = true;
  return (
      <Routes>
        <Route path="/" element={<RegisterAndLogin />} />
        <Route path="/chat" element={<Chat />} />
      </Routes>
  );
}

export default App;
