import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Button, StyleSheet } from "react-native";
import io, { Socket } from "socket.io-client";

const App = () => {
  const [username, setUsername] = useState<string>("");
  const [user, setUser] = useState<string>("");
  const [socket, setSocket] = useState<any | null>(null);

  useEffect(() => {
    const newSocket = io("http://10.0.2.2:5000");
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (socket) {
      socket.emit("newUser", user);
    }
  }, [socket, user]);

  return (
    <View style={styles.container}>
      {user ? (
        <>
          <Text style={styles.username}>{user}</Text>
        </>
      ) : (
        <View style={styles.login}>
          <Text style={styles.title}>socket test App</Text>
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
});
