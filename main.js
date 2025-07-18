let pyodide = null;
let db = {};
let currentStudent = null;
const TEACHER_PASSWORD = "12345"; // Change as needed

// Load Pyodide
async function loadPyodideAndInit() {
  pyodide = await loadPyodide();
}
loadPyodideAndInit();

// Load from localStorage
function loadData() {
  const stored = localStorage.getItem("homeworkDB");
  if (stored) db = JSON.parse(stored);
}

// Save to localStorage
function saveData() {
  localStorage.setItem("homeworkDB", JSON.stringify(db));
}

// UI Helpers
function show(id) {
  document.querySelectorAll(".container > div").forEach(div => div.classList.add("hidden"));
  document.getElementById(id).classList.remove("hidden");
}

// Load homework for student
function loadStudentPanel() {
  const sid = `${currentStudent.name} (${currentStudent.roll}, ${currentStudent.class})`;
  document.getElementById("student-id").textContent = sid;
  document.getElementById("assigned-homework").textContent = db[currentStudent.class]?.homework || "No homework assigned.";
  document.getElementById("student-code").value = db[currentStudent.class]?.submissions?.[sid] || "";
  document.getElementById("code-output").textContent = "";
  show("student-panel");
}

// Render all submissions for teacher
function loadTeacherPanel() {
  const out = document.getElementById("all-submissions");
  out.innerHTML = "";

  Object.entries(db).forEach(([className, classData]) => {
    if (classData.submissions && Object.keys(classData.submissions).length > 0) {
      const classDiv = document.createElement("div");
      classDiv.innerHTML = `<h4>Class ${className}</h4>`;
      Object.entries(classData.submissions).forEach(([studentId, code]) => {
        const pre = document.createElement("pre");
        pre.textContent = `${studentId}:\n${code}`;
        classDiv.appendChild(pre);
      });
      out.appendChild(classDiv);
    }
  });

  show("teacher-panel");
}

// Event: Student Login
document.getElementById("student-login").onclick = () => {
  const name = document.getElementById("student-name").value.trim();
  const roll = document.getElementById("student-roll").value.trim();
  const className = document.getElementById("student-class").value.trim();
  if (!name || !roll || !className) return alert("Fill all student fields");

  currentStudent = { name, roll, class: className };
  if (!db[className]) db[className] = { homework: "", submissions: {} };
  saveData();
  loadStudentPanel();
};

// Event: Show teacher login
document.getElementById("show-teacher-login").onclick = () => show("teacher-login-form");

// Event: Teacher Login
document.getElementById("teacher-login").onclick = () => {
  const pwd = document.getElementById("teacher-pass").value;
  if (pwd === TEACHER_PASSWORD) {
    loadTeacherPanel();
  } else {
    alert("Incorrect password");
  }
};

// Event: Run Python Code
document.getElementById("run-code").onclick = async () => {
  const code = document.getElementById("student-code").value;
  try {
    const result = await pyodide.runPythonAsync(code);
    document.getElementById("code-output").textContent = result;
  } catch (err) {
    document.getElementById("code-output").textContent = err;
  }
};

// Event: Submit Code
document.getElementById("submit-code").onclick = () => {
  const code = document.getElementById("student-code").value;
  const sid = `${currentStudent.name} (${currentStudent.roll}, ${currentStudent.class})`;
  db[currentStudent.class].submissions[sid] = code;
  saveData();
  alert("Submitted!");
};

// Event: Set Homework
document.getElementById("set-homework").onclick = () => {
  const className = document.getElementById("target-class").value.trim();
  const hwText = document.getElementById("homework-text").value.trim();
  if (!className || !hwText) return alert("Fill both fields");
  if (!db[className]) db[className] = { homework: "", submissions: {} };
  db[className].homework = hwText;
  saveData();
  alert("Homework assigned");
  loadTeacherPanel();
};

// Back Buttons
document.getElementById("back-to-home1").onclick = () => show("login-form");
document.getElementById("back-to-home2").onclick = () => show("login-form");
document.getElementById("back-to-home3").onclick = () => show("login-form");

// Initial load
loadData();
show("login-form");
