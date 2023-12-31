import React from "react";
import Avatar from "./Avatar";

const ContactList = ({userId, username, onClick, selected, online}) => {
  return (
    <div
      onClick={() => onClick(userId)}
      key={userId}
      className={`border-b border-gray-200 flex items-center gap-2 cursor-pointer ${
        selected ? "bg-blue-50" : ""
      }`}
    >
      {selected && (
        <div className="w-1 bg-blue-500 h-12 rounded-r-md"></div>
      )}
      <div className="flex gap-2 py-2 pl-4 items-center">
        <Avatar online={online} username={username} userId={userId} />
        <span className="text-gray-800">{username}</span>
      </div>
    </div>
  );
};

export default ContactList;
