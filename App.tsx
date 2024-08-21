import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity } from "react-native";
import io from "socket.io-client";

const App = () => {
  const [username, setUsername] = useState<string>("");
  const [user, setUser] = useState<string>("");
  const [socket, setSocket] = useState<any | null>(null);
  const [activeConnections, setActiveConnections] = useState<number>(0);
  const [messages, setMessages] = useState<any[]>([]);
  const [messageInput, setMessageInput] = useState<string>("");

  useEffect(() => {
    const newSocket = io("http://10.0.2.2:5000");
    setSocket(newSocket);

    newSocket.on("activeConnections", (count: number) => {
      setActiveConnections(count);
    });

    newSocket.on("receiveMessage", (msg: any) => {
      setMessages((prevMessages) => [...prevMessages, msg]);
    });

    newSocket.on("updateMessage", ({ id, likes }: any) => {
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === id ? { ...msg, likes } : msg
        )
      );
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (socket && user) {
      socket.emit("newUser", user);
    }
  }, [socket, user]);

  const handleSendMessage = () => {
    if (socket && user && messageInput.trim()) {
      socket.emit("sendMessage", { senderName: user, message: messageInput });
      setMessageInput("");
    }
  };

  const handleLikeMessage = (messageId: string) => {
    if (socket && user) {
      socket.emit("likeMessage", { messageId, username: user });
    }
  };

  return (
    <View style={styles.container}>
      {user ? (
        <>
          <Text style={styles.username}>Welcome, {user}</Text>
          <View style={styles.messagesContainer}>
            {messages.map((msg) => (
              <View key={msg.id} style={styles.messageContainer}>
                <Text>{msg.senderName}: {msg.message}</Text>
                <View style={styles.likeContainer}>
                  <TouchableOpacity onPress={() => handleLikeMessage(msg.id)}>
                    <Text style={styles.likeButton}>Like</Text>
                  </TouchableOpacity>
                  <Text>({msg.likes.length})</Text>
                </View>
              </View>
            ))}
          </View>
          <TextInput
            style={styles.input}
            placeholder="Type a message"
            onChangeText={(text) => setMessageInput(text)}
            value={messageInput}
          />
          <Button title="Send" onPress={handleSendMessage} />
        </>
      ) : (
        <View style={styles.login}>
          <Text style={styles.activeCount}>Active Users: {activeConnections}</Text>
          <Text style={styles.title}>Lama App</Text>
          <TextInput
            style={styles.input}
            placeholder="Username"
            onChangeText={(text) => setUsername(text)}
            value={username}
          />
          <Button title="Login" onPress={() => setUser(username)} />
        </View>
      )}
    </View>
  );
};

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  login: {
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  input: {
    width: "80%",
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 20,
    borderRadius: 5,
  },
  username: {
    marginTop: 20,
    fontSize: 18,
    textAlign: "center",
  },
  activeCount: {
    fontSize: 16,
    textAlign: "center",
    marginVertical: 10,
  },
  messagesContainer: {
    marginBottom: 20,
  },
  messageContainer: {
    marginBottom: 10,
  },
  likeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  likeButton: {
    color: "blue",
    marginRight: 5,
  },
});
