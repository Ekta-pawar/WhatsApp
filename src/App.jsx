import React, { useState, useRef, useEffect } from "react";
import { connectWS } from "./ws";

const App = () => {

  const socket = useRef(null);

  const [userName, setUserName] = useState("");
  const [showNamePopup, setShowNamePopup] = useState(true);
  const [inputName, setInputName] = useState("");

 const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  const chatRef = useRef(null);

useEffect(() => {

  socket.current = connectWS();

  socket.current.on("connect", () => {
    console.log("Connected:", socket.current.id);
  });

  socket.current.on("roomNotice", (userName) => {
    console.log(`${userName} joined to group!`);
  });

  socket.current.on("chatMessage", (msg) => {
    console.log("New message:", msg);
    setMessages((prev) => [...prev, msg]);
  });

  return () => {
    socket.current.disconnect();
  };

}, []);

  // AUTO SCROLL
  useEffect(() => {
    chatRef.current?.scrollTo(0, chatRef.current.scrollHeight);
  }, [messages]);

  function formatTime(ts) {
    const d = new Date(ts);
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    return `${hh}:${mm}`;
  }

  function handleNameSubmit(e) {
    e.preventDefault();

    const trimmed = inputName.trim();
    if (!trimmed) return;
      socket.current.emit("joinRoom", trimmed);

    setUserName(trimmed);
    setShowNamePopup(false);
  }

function sendMessage() {

  const t = text.trim();
  if (!t) return;

  const msg = {
    id: Date.now(),
    sender: userName,
    text: t,
    ts: Date.now()
  };

  // send to server
  socket.current.emit("chatMessage", msg);

  setText("");
}
  function handleKeyDown(e) {

    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }

  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#ece5dd] p-4">

      {/* NAME POPUP */}
      {showNamePopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-40">

          <div className="bg-white rounded-xl shadow-xl w-[90%] max-w-md p-6">

            <h1 className="text-xl font-semibold">
              Enter your name
            </h1>

            <p className="text-sm text-gray-500 mt-1">
              This will be visible to everyone in the chat
            </p>

            <form onSubmit={handleNameSubmit} className="mt-4">

              <input
                autoFocus
                value={inputName}
                onChange={(e) => setInputName(e.target.value)}
                className="w-full border rounded-md px-3 py-2 outline-green-500"
                placeholder="Your name"
              />

              <button
                className="mt-4 bg-[#25D366] text-white px-4 py-2 rounded-full float-right"
              >
                Continue
              </button>

            </form>

          </div>

        </div>
      )}

      {/* CHAT APP */}
      {!showNamePopup && (

        <div className="w-full max-w-3xl h-[90vh] bg-white rounded-xl shadow-lg flex flex-col overflow-hidden">

          {/* HEADER */}
          <div className="flex items-center gap-3 px-4 py-3 border-b bg-[#075E54] text-white">

            <div className="h-10 w-10 rounded-full bg-green-700 flex items-center justify-center">
              {userName[0]?.toUpperCase()}
            </div>

            <div className="flex-1">
              <div className="font-medium">
                Realtime group chat
              </div>

              <div className="text-xs opacity-80">
                Online
              </div>
            </div>

            <div className="text-sm opacity-80">
              {userName}
            </div>

          </div>

          {/* MESSAGES */}
          <div
            ref={chatRef}
            className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#ece5dd]"
          >

            {messages.map((m) => {

              const mine = m.sender === userName;

              return (
                <div
                  key={m.id}
                  className={`flex ${mine ? "justify-end" : "justify-start"}`}
                >

                  <div
                    className={`max-w-[75%] p-3 rounded-lg text-sm shadow ${
                      mine ? "bg-[#DCF8C6]" : "bg-white"
                    }`}
                  >

                    <div className="break-words">
                      {m.text}
                    </div>

                    <div className="flex justify-between text-[11px] mt-1 text-gray-500">

                      <span className="font-semibold">
                        {m.sender}
                      </span>

                      <span>
                        {formatTime(m.ts)}
                      </span>

                    </div>

                  </div>

                </div>
              );
            })}

          </div>

          {/* INPUT AREA */}
          <div className="bg-white border-t p-3 flex items-center gap-3">

            <textarea
              rows="1"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message"
              className="flex-1 resize-none border rounded-full px-4 py-2 outline-none"
            />

            <button
              onClick={sendMessage}
              className="bg-[#25D366] text-white px-5 py-2 rounded-full"
            >
              Send
            </button>

          </div>

        </div>

      )}

    </div>
  );
};

export default App;