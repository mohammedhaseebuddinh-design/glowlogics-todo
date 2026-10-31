
import { useEffect, useState } from "react";
import { signInAnonymously, onAuthStateChanged } from "firebase/auth";
import {
  collection, addDoc, onSnapshot,
  updateDoc, deleteDoc, doc, serverTimestamp
} from "firebase/firestore";
import { auth, db } from "./firebase";
import "./App.css";

export default function App() {
  const [user, setUser] = useState(null);
  const [task, setTask] = useState("");
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        setUser(null);
        try {
          await signInAnonymously(auth);
        } catch (err) {
          setError(err.message);
        }
      }
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!user) return;

    const tasksRef = collection(db, "users", user.uid, "tasks");

    const unsubscribe = onSnapshot(
      tasksRef,
      (snapshot) => {
        const data = snapshot.docs.map((item) => ({
          id: item.id,
          ...item.data()
        }));
        data.sort((a, b) =>
          (a.createdAt?.seconds ?? 0) -
          (b.createdAt?.seconds ?? 0)
        );
        setTasks(data);
      },
      (err) => setError(err.message)
    );

    return unsubscribe;
  }, [user]);

  async function addTask() {
    if (!task.trim() || !user) return;

    try {
      await addDoc(collection(db, "users", user.uid, "tasks"), {
        text: task.trim(),
        completed: false,
        createdAt: serverTimestamp()
      });
      setTask("");
      setError("");
    } catch (err) {
      setError(err.message);
    }
  }

  async function toggleTask(item) {
    try {
      await updateDoc(
        doc(db, "users", user.uid, "tasks", item.id),
        { completed: !item.completed }
      );
    } catch (err) {
      setError(err.message);
    }
  }

  async function removeTask(id) {
    try {
      await deleteDoc(doc(db, "users", user.uid, "tasks", id));
    } catch (err) {
      setError(err.message);
    }
  }

  async function resetTasks() {
    if (!window.confirm("Delete all tasks?")) return;
    try {
      await Promise.all(tasks.map((item) =>
        deleteDoc(doc(db, "users", user.uid, "tasks", item.id))
      ));
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <main style={{ maxWidth: 600, margin: "50px auto", padding: 25 }}>
      <h1>🚀 Glowlogics</h1>
      <h2>Cloud To-Do Task Manager</h2>
      <p>{user ? "☁️ Cloud connected" : "Connecting to cloud..."}</p>

      <input
        type="text"
        placeholder="Enter a task"
        value={task}
        onChange={(e) => setTask(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && addTask()}
      />
      <button onClick={addTask} disabled={!user}>Add Task</button>

      <h3>My Tasks ({tasks.length})</h3>

      <ul style={{ listStyle: "none", padding: 0 }}>
        {tasks.map((item) => (
          <li key={item.id}>
            <input
              type="checkbox"
              checked={item.completed}
              onChange={() => toggleTask(item)}
            />
            <span style={{
              margin: 10,
              textDecoration: item.completed ? "line-through" : "none"
            }}>
              {item.text}
            </span>
            <button onClick={() => removeTask(item.id)}>
              Delete
            </button>
          </li>
        ))}
      </ul>

      <button onClick={resetTasks} disabled={!user || !tasks.length}>
        Reset All Tasks
      </button>

      {error && <p style={{ color: "#ff8a8a" }}>Error: {error}</p>}
    </main>
  );
}
