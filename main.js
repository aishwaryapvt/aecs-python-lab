import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabase = createClient("https://ixxxlczhrmyisouoxdke.supabase.co", "YOUR_SUPABASE_ANON_KEY");

// --- HTML Element References ---
const studentLoginBox = document.getElementById("student-login");
const teacherLoginBox = document.getElementById("teacher-login");
const studentPanel = document.getElementById("student-panel");
const teacherPanel = document.getElementById("teacher-panel");

const teacherToggle = document.getElementById("teacher-login-toggle");
const studentToggle = document.getElementById("student-login-toggle");

let currentStudent = {};

// --- Toggle Login Views ---
teacherToggle.onclick = () => {
  studentLoginBox.classList.add("hidden");
  teacherLoginBox.classList.remove("hidden");
};

studentToggle.onclick = () => {
  teacherLoginBox.classList.add("hidden");
  studentLoginBox.classList.remove("hidden");
};

// --- Student Login ---
document.getElementById("student-login-btn").onclick = async () => {
  const name = document.getElementById("student-name").value.trim();
  const stdClass = document.getElementById("student-class").value.trim();
  const roll = document.getElementById("roll-number").value.trim();

  if (!name || !stdClass || !roll) return alert("All fields are required");

  currentStudent = { name, stdClass, roll };

  // Get assigned homework
  const { data, error } = await supabase
    .from("homework")
    .select("*")
    .eq("class", stdClass)
    .order("created_at", { ascending: false })
    .limit(1);

  document.getElementById("student-info").innerText = `${name} (Class ${stdClass}, Roll ${roll})`;
  document.getElementById("assigned-homework").innerText = data?.[0]?.homework || "No homework assigned";

  studentLoginBox.classList.add("hidden");
  studentPanel.classList.remove("hidden");
};

// --- Teacher Login ---
document.getElementById("teacher-login-btn").onclick = () => {
  const username = document.getElementById("teacher-username").value.trim();
  const password = document.getElementById("teacher-password").value.trim();

  if (username === "admin" && password === "1234") {
    teacherLoginBox.classList.add("hidden");
    teacherPanel.classList.remove("hidden");
  } else {
    alert("Invalid credentials");
  }
};

// --- Assign Homework (Teacher) ---
document.getElementById("set-homework").onclick = async () => {
  const targetClass = document.getElementById("target-class").value.trim();
  const homework = document.getElementById("homework-text").value.trim();
  if (!targetClass || !homework) return alert("Please fill both fields");

  const { error } = await supabase.from("homework").insert([
    {
      class: targetClass,
      homework: homework,
    },
  ]);
  if (error) return alert("Error assigning homework");
  alert("Homework assigned successfully");
};

// --- Submit Homework (Student) ---
document.getElementById("submit-code").onclick = async () => {
  const code = document.getElementById("student-code").value.trim();
  if (!code) return alert("Write code before submitting");

  const { error } = await supabase.from("submissions").insert([
    {
      name: currentStudent.name,
      class: currentStudent.stdClass,
      roll: currentStudent.roll,
      code: code,
    },
  ]);
  if (error) return alert("Submission failed");
  alert("Homework submitted successfully");
};

// --- Run Python Code using Pyodide ---
let pyodideReady = false;
let pyodide;

async function loadPyodideAndRun() {
  if (!pyodideReady) {
    pyodide = await loadPyodide();
    pyodideReady = true;
  }

  const code = document.getElementById("student-code").value;
  try {
    const result = await pyodide.runPythonAsync(code);
    document.getElementById("output").innerText = result || "Code ran successfully";
  } catch (err) {
    document.getElementById("output").innerText = "Error: " + err.message;
  }
}

document.getElementById("run-code").onclick = loadPyodideAndRun;
