import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function RegisterAndLogin() {
  const navigate = useNavigate();
  const [isLoggedInOrRegister, setIsLoggedInOrRegister] = useState("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (username && password) { // Check if form fields are not empty
      const endPoint = isLoggedInOrRegister === "register" ? "/register" : "/login";
      try {
        await axios.post(endPoint, { username: username, password: password });
        setTimeout(() => {
          navigate("/chat");
        }, 500);
      } catch (error) {
        console.error("Request failed", error);
        // Handle error here if needed
      }
    }
  };
  

  return (
  <div className="bg-blue-50 h-screen flex items-center">
    <div className="w-96 mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-center text-3xl font-bold mb-6 text-blue-500">Welcome!</h2>
      <form onSubmit={handleSubmit} className="w-full">
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          type="text"
          placeholder="Username"
          className="block w-full rounded-lg p-3 mb-6 border focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          placeholder="Password"
          className="block w-full rounded-lg p-3 mb-6 border focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button className="bg-blue-500 text-white block w-full rounded-lg p-3 transition duration-300 ease-in-out hover:bg-blue-600">
          {isLoggedInOrRegister === "register" ? "Register" : "Login"}
        </button>
        {isLoggedInOrRegister === "register" ? (
          <div className="text-center mt-6">
            Already have an Account?{" "}
            <button onClick={() => setIsLoggedInOrRegister("login")} className="text-blue-500 font-medium focus:outline-none hover:underline">
              Login here!
            </button>
          </div>
        ) : (
          <div className="text-center mt-6">
            Don't have an Account?{" "}
            <button onClick={() => setIsLoggedInOrRegister("register")} className="text-blue-500 font-medium focus:outline-none hover:underline">
              Register here!
            </button>
          </div>
        )}
      </form>
    </div>
  </div>
);




}

export default RegisterAndLogin;
