import axios from "axios";
import { Routes, Route } from "react-router-dom";

import RegisterAndLogin from "./pages/RegisterAndLogin";
import Chat from "./pages/Chat";

function App() {
  axios.defaults.baseURL = "https://just-chat-server-ebon.vercel.app/api";
  axios.defaults.withCredentials = true;
  return (
      <Routes>
        <Route path="/" element={<RegisterAndLogin />} />
        <Route path="/chat" element={<Chat />} />
      </Routes>
  );
}

export default App;
