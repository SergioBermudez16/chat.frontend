import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import Lobby from "./components/Lobby";
import { HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
import { useState } from "react";
import Chat from "./components/Chat";
import { BrowserRouter, Routes, Route } from "react-router-dom";

const App = () => {
  const [connection, setConnection] = useState();
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);

  const joinRoom = async (user, room) => {
    try {
      const connection = new HubConnectionBuilder()
        .withUrl("https://localhost:7083/chat")
        .configureLogging(LogLevel.Information)
        .build();

      connection.on("ReceiveMessage", (user, message) => {
        setMessages((messages) => [...messages, { user, message }]);
        console.log("message received: ", message);
      });

      connection.on("UsersInRoom", (users) => {
        setUsers(users);
      });

      connection.onclose((e) => {
        setConnection();
        setMessages([]);
        setUsers([]);
      });

      await connection.start();
      await connection.invoke("joinRoom", { user, room });
      setConnection(connection);
    } catch (e) {
      console.log(e);
    }
  };

  const sendMessage = async (message) => {
    try {
      await connection.invoke("sendMessage", message);
    } catch (e) {
      console.log(e);
    }
  };

  const closeConnection = async () => {
    try {
      await connection.stop();
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <>
      {/* <BrowserRouter>
        <Routes>
          <Route exact path="/" element={Lobby} />
          <Route exact path="/chat" element={Chat} />
          <Route exact path="/chat" element={Chat} />
        </Routes>
      </BrowserRouter> */}
      <div className="app">
        <h2>SerberChat</h2>
        <hr className="line"></hr>
        {!connection ? (
          <Lobby joinRoom={joinRoom}></Lobby>
        ) : (
          <Chat
            messages={messages}
            sendMessage={sendMessage}
            closeConnection={closeConnection}
            users={users}
          />
        )}
      </div>
    </>
  );
};

export default App;
