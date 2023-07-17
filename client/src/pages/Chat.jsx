import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { fetchUserdata, fetchAllUsers, userActions } from "../store/userSlice";
import { fetchMessages } from "../store/messageSlice";
import uniqBy from "lodash";
import Logo from "../components/Logo";
import ContactList from "../components/ContactList";
import axios from "axios";

const Chat = () => {
  const navigate = useNavigate();

  const [newMessage, setNewMessage] = useState("");
  const [onlineUsers, setOnlineUsers] = useState({});
  const [offlinePeople, setOfflinePeople] = useState({});
  const [ws, setWs] = useState();
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [conversation, setConversation] = useState([]);
  const divUnderMessages = useRef();

  const dispatch = useDispatch();
  const userData = useSelector((state) => state.user.userData);
  const allMessages = useSelector((state) => state.messages.messages);
  const totalUsers = useSelector((state) => state.user.allUsers);

  //FETCHING ALL USERS AND SETTING CURRENT USER---------------
  useEffect(() => {
    dispatch(fetchUserdata());
    dispatch(fetchAllUsers());
  }, []);
  //FETCHING ALL USERS AND SETTING CURRENT USER---------------

  //CONNECTION TO WEBSOCKET-----------
  useEffect(() => {
    connectToWS();
  }, []);

  const connectToWS = () => {
    const ws = new WebSocket("ws://just-chat-server-ebon.vercel.app/api");
    setWs(ws);
    ws.addEventListener("message", handleMessage);
    ws.addEventListener("close", () => {
      setTimeout(() => {
        console.log("Disconnected. Trying to reconnect");
        connectToWS();
      }, 1000);
    });
  };
  //CONNECTION TO WEBSOCKET-----------

  //HANDELING MESSAGES--------------------------------

  // incoming messages
  const handleMessage = (e) => {
    const messageData = JSON.parse(e.data);
    if ("online" in messageData) {
      showOnlineUsers(messageData.online);
    } else if ("text" in messageData) {
      if (messageData.sender === selectedUserId) {
        setConversation((prev) => [...prev, { ...messageData }]);
      }
    }
  };
  //outgoing message
  const sendMessage = async (e, file = null) => {
    if (e) e.preventDefault();
    console.log(newMessage);
    if (newMessage != "") {
      ws.send(
        JSON.stringify({
          recipientId: selectedUserId,
          text: newMessage,
          file,
        })
      );
      setNewMessage("");
      setConversation((prev) => [
        ...prev,
        {
          text: newMessage,
          sender: userData.userId,
          recipientId: selectedUserId,
          _id: Date.now(),
        },
      ]);
      if (file) {
        const res = await axios.get("/messages/" + selectedUserId);
        setConversation(res.data);
      }
    }
  };
  //sending attachment------------------
  const sendFile = (e) => {
    const reader = new FileReader();
    reader.readAsDataURL(e.target.files[0]);
    reader.onload = () => {
      sendMessage(null, {
        name: e.target.files[0].name,
        data: reader.result,
      });
    };
  };
  // HANDELING MESSAGES--------------------------------

  // HANDELING OFFLINE AND ONLINE USERS---------------------
  const showOnlineUsers = (usersArray) => {
    const users = {};
    usersArray.forEach(({ userId, username }) => {
      if (userId) {
        users[userId] = username;
      }
    });
    setOnlineUsers(users);
  };

  useEffect(() => {
    const offlineUsersArray = totalUsers
      .filter((user) => user._id !== userData.userId)
      .filter((user) => !Object.keys(onlineUsers).includes(user._id));

    const offlineUsersObject = {};

    offlineUsersArray.forEach((p) => {
      offlineUsersObject[p._id] = p.username;
    });

    setOfflinePeople(offlineUsersObject);
    // console.log("offlineUser >> ", offlineUsersObject);
  }, [onlineUsers]);
  // HANDELING OFFLINE AND ONLINE USERS---------------------

  // FOR CHAT---------------------------
  useEffect(() => {
    const div = divUnderMessages.current;
    if (div) {
      div.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [conversation]);

  useEffect(() => {
    if (selectedUserId) {
      dispatch(fetchMessages(selectedUserId));
    }
  }, [selectedUserId]);

  useEffect(() => {
    setConversation(allMessages);
  }, [allMessages]);
  // FOR CHAT---------------------------

  //LOGOUT------------------------------
  const logout = () => {
    axios
      .post("/logout")
      .then(() => {
        dispatch(userActions.logout());
        setWs(null);
        navigate("/");
        window.location.reload();
      })
      .catch((err) => console.log(err));
  };
  //LOGOUT------------------------------

  const onlineUsersExcludingCurrentUser = { ...onlineUsers };
  delete onlineUsersExcludingCurrentUser[userData.userId];

  const conversationWithoutDuplicates = uniqBy.uniqBy(conversation, "_id");
  return (
    <div className="flex h-screen">
      <div className="bg-white-100 w-1/3 flex flex-col">
        <div className="flex-grow">
          <Logo />
          {Object.keys(onlineUsersExcludingCurrentUser).map((userId) => (
            <ContactList
              key={userId}
              userId={userId}
              username={onlineUsers[userId]}
              onClick={() => setSelectedUserId(userId)}
              selected={userId === selectedUserId}
              online={true}
            />
          ))}
          {Object.keys(offlinePeople).map((userId) => (
            <ContactList
              key={userId}
              userId={userId}
              username={offlinePeople[userId]}
              onClick={() => setSelectedUserId(userId)}
              selected={userId === selectedUserId}
              online={false}
            />
          ))}
        </div>
        <div className="p-2 text-center flex items-center justify-center">
          <span className="mr-2 text-sm text-gray-600 flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-4 h-4 "
            >
              <path
                fillRule="evenodd"
                d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z"
                clipRule="evenodd"
              />
            </svg>

            {userData.username}
          </span>
          <button
            onClick={logout}
            className="text-sm bg-blue-100 py-1 px-2 text-gray-500 border rounded-sm"
          >
            Logout
          </button>
        </div>
      </div>
      <div className="flex flex-col bg-blue-50 w-2/3 p-2">
        <div className="flex-grow">
          {!selectedUserId && (
            <div className="flex h-full items-center justify-center">
              <div className="font-bold text-gray-300">
                &larr; Select a person to Chat
              </div>
            </div>
          )}

          {/* message box */}

          {!!selectedUserId && (
            <div className="relative h-full mb-4">
              <div className="overflow-y-scroll absolute top-0 left-0 right-0 bottom-2">
                {conversationWithoutDuplicates.map((message) => (
                  <div
                    key={message._id}
                    className={
                      message.sender === userData.userId
                        ? "text-right"
                        : "text-left"
                    }
                  >
                    <div
                      key={message._id}
                      className={
                        "text-left inline-block p-2 m-2 rounded-md text-sm " +
                        (message.sender === userData.userId
                          ? "bg-blue-500 text-white "
                          : "bg-white text-gray-500 ")
                      }
                    >
                      {message.text}
                      {message.file && (
                        <div>
                          <a
                            target="_blank"
                            className="flex items-center gap-1 border-b"
                            href={
                              "http://localhost:5000/uploads/" + message.file
                            }
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                              className="w-4 h-4"
                            >
                              <path
                                fillRule="evenodd"
                                d="M18.97 3.659a2.25 2.25 0 00-3.182 0l-10.94 10.94a3.75 3.75 0 105.304 5.303l7.693-7.693a.75.75 0 011.06 1.06l-7.693 7.693a5.25 5.25 0 11-7.424-7.424l10.939-10.94a3.75 3.75 0 115.303 5.304L9.097 18.835l-.008.008-.007.007-.002.002-.003.002A2.25 2.25 0 015.91 15.66l7.81-7.81a.75.75 0 011.061 1.06l-7.81 7.81a.75.75 0 001.054 1.068L18.97 6.84a2.25 2.25 0 000-3.182z"
                                clipRule="evenodd"
                              />
                            </svg>
                            {message.file}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                <div className="h-12" ref={divUnderMessages}></div>
              </div>
            </div>
          )}
        </div>
        {selectedUserId && (
          <form className="flex gap-2" onSubmit={sendMessage}>
            <input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              type="text"
              placeholder="Type your message here"
              className="bg-white flex-grow border rounded-md p-2"
            />
            <label
              type="button"
              className="cursor-pointer bg-blue-200 p-2 rounded-md text-gray-600 border border-blue-200"
            >
              <input type="file" className="hidden" onChange={sendFile} />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-6 h-6"
              >
                <path
                  fillRule="evenodd"
                  d="M18.97 3.659a2.25 2.25 0 00-3.182 0l-10.94 10.94a3.75 3.75 0 105.304 5.303l7.693-7.693a.75.75 0 011.06 1.06l-7.693 7.693a5.25 5.25 0 11-7.424-7.424l10.939-10.94a3.75 3.75 0 115.303 5.304L9.097 18.835l-.008.008-.007.007-.002.002-.003.002A2.25 2.25 0 015.91 15.66l7.81-7.81a.75.75 0 011.061 1.06l-7.81 7.81a.75.75 0 001.054 1.068L18.97 6.84a2.25 2.25 0 000-3.182z"
                  clipRule="evenodd"
                />
              </svg>
            </label>
            <button
              type="submit"
              className="bg-blue-500 p-2 rounded-md text-white"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
                />
              </svg>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Chat;
