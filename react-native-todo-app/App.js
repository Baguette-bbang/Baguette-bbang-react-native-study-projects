import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from "react-native";
import { theme } from "./colors";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import CustomAlert from "./src/conponents/CustomAlert"; // 경로는 실제 파일 위치에 맞게 조정하세요
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";

const STORAGE_KEY = "@toDos";
export default function App() {
  useEffect(() => {
    loadToDos();
  }, []);

  const [working, setWorking] = useState(true);
  const [text, setText] = useState("");
  const [toDos, setToDos] = useState({});
  const [alertVisible, setAlertVisible] = useState(false);
  const [toDoToDelete, setToDoToDelete] = useState(null);

  const travel = () => setWorking(false);
  const work = () => setWorking(true);
  const onChangeText = (payload) => setText(payload);
  const saveToDos = async (toSave) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  };
  const loadToDos = async () => {
    try {
      const s = await AsyncStorage.getItem(STORAGE_KEY);
      if (s) {
        const parsedToDos = JSON.parse(s);
        setToDos(parsedToDos);
        console.log("Loaded ToDos:", parsedToDos);
      }
    } catch (error) {
      console.error("Error loading ToDos:", error);
    }
  };

  const addToDo = async () => {
    if (text === "") {
      return;
    }
    const newToDos = { ...toDos, [Date.now()]: { text, working: working } };
    setToDos(newToDos);
    await saveToDos(newToDos);
    setText("");
  };

  // const deleteToDo = async (key) => {
  //   Alert.alert("Delete To Do", "Are You Sure?", [
  //     { text: "Cancle" },
  //     {
  //       text: "I'm Sure",
  //       onPress: async () => {
  //         const { [key]: deleteElement, ...newToDos } = toDos;
  //         setToDos(newToDos);
  //         await saveToDos(newToDos);
  //       },
  //     },
  //   ]);
  // };
  const deleteToDo = (key) => {
    setToDoToDelete(key);
    setAlertVisible(true);
  };
  const handleDeleteConfirm = async () => {
    if (toDoToDelete) {
      const { [toDoToDelete]: _, ...newToDos } = toDos;
      setToDos(newToDos);
      await saveToDos(newToDos);
      setAlertVisible(false);
      setToDoToDelete(null);
    }
  };

  console.log(toDos);
  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.header}>
        <TouchableOpacity onPress={work}>
          <Text style={{ ...styles.btnText, color: working ? "white" : theme.grey }}>Work</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={travel}>
          <Text style={{ ...styles.btnText, color: !working ? "white" : theme.grey }}>Travel</Text>
        </TouchableOpacity>
      </View>
      <TextInput
        onSubmitEditing={addToDo}
        onChangeText={onChangeText}
        returnKeyType="done"
        style={styles.input}
        placeholder={working ? "Add a To Do" : "Where do you want to go"}
        value={text}
      />
      <ScrollView>
        {Object.keys(toDos).map((key) =>
          toDos[key].working === working ? (
            <View style={styles.toDo} key={key}>
              <Text style={styles.toDoText}>{toDos[key].text}</Text>
              <TouchableOpacity
                onPress={() => {
                  deleteToDo(key);
                }}
              >
                <FontAwesome6 name="trash-can" size={24} color={theme.grey} />
              </TouchableOpacity>
            </View>
          ) : null
        )}
      </ScrollView>
      <CustomAlert
        visible={alertVisible}
        title="Delete To Do"
        message="Are you sure you want to delete this item?"
        onCancel={() => setAlertVisible(false)}
        onConfirm={handleDeleteConfirm}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
    paddingHorizontal: 20,
  },
  header: {
    justifyContent: "space-between",
    flexDirection: "row",
    marginTop: 100,
  },
  btnText: {
    fontSize: 38,
    fontWeight: "600",
  },
  input: {
    backgroundColor: "white",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginTop: 20,
    fontSize: 18,
    marginBottom: 20,
  },
  toDo: {
    backgroundColor: theme.toDoBg,
    marginBottom: 10,
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  toDoText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
});
