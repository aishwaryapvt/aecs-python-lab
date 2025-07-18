import { loadPyodide } from "https://cdn.jsdelivr.net/pyodide/v0.25.1/full/pyodide.mjs";

let pyodide;
let db = {
  homework: {},
  submissions: {},
};

async function main() {
  pyodide = await loadPyodide();

  // UI elements
  const studentLoginBtn = document.getElementById("student-login");
  const teacherLoginBtn = document.getElementById("teacher-login");
  const setHomeworkBtn = document.getElementById("set-homework");
  const runCodeBtn = document.getElementById("run-code");
  const submitCodeBtn = document.getElementById("submit-code");

  const studentPanel = document.getElementById("student-panel");
  const teacherPanel = document.getElementById("teacher-panel");
  const loginForm = document.getElementById("login-form");

  let currentStudent = null;

  studentLoginBtn.onclick = () => {
    const name = document.getElementById("student-name").value.trim();
    const roll = document.getElementById("student-roll").value.trim();
    const cls = document.getElementById("student-class").value.trim();
    if (!name || !roll || !cls) return alert("Please fill all fields.");
    currentStudent = { name, roll, cls };
    document.getElementById("student-id").textContent = `${name} (${roll}, Class ${cls})`;

    loginForm.classList.add("hidden");
    studentPanel.classList.remove("hidden");

    // Show assigned homework
    document.getElementById("assigned-homework").innerText =
      db.homework[cls] || "No homework assigned.";
  };

  teacherLoginBtn.onclick = () => {
    const pass = document.getElementById("teacher-pass").value;
    if (pass !== "teacher123") return alert("Wrong password");
    loginForm.classList.add("hidden");
    teacherPanel.classList.remove("hidden");
    renderSubmissions();
  };

  setHomeworkBtn.onclick = () => {
    const cls = document.getElementById("target-class").value.trim();
    const hw = document.getElementById("homework-text").value.trim();
    if (!cls || !hw) return alert("Enter class and homework.");
    db.homework[cls] = hw;
    alert(`Assigned to Class ${cls}`);
  };

  runCodeBtn.onclick = async () => {
    const code = document.getElementById("student-code").value;
    try {
      await pyodide.runPythonAsync(`
import sys
from io import StringIO
sys.stdout = mystdout = StringIO()
` + code + `
output = mystdout.getvalue()
`);
      const output = pyodide.globals.get("output");
      document.getElementById("code-output").innerText = output;
    } catch (err) {
      document.getElementById("code-output").innerText = err;
    }
  };

  submitCodeBtn.onclick = () => {
    const code = document.getElementById("student-code").value;
    const key = `${currentStudent.cls}-${currentStudent.roll}`;
    db.submissions[key] = {
      ...currentStudent,
      code,
      timestamp: new Date().toLocaleString(),
    };
    alert("Code submitted!");
  };

  function renderSubmissions() {
    const container = document.getElementById("all-submissions");
    container.innerHTML = "";
    for (const [key, data] of Object.entries(db.submissions)) {
      const div = document.createElement("div");
      div.innerHTML = `<strong>${data.name} (${data.roll}, Class ${data.cls})</strong><br/>
        <em>Submitted at: ${data.timestamp}</em><br/>
        <pre>${data.code}</pre><hr/>`;
      container.appendChild(div);
    }
  }
}

main();