// main.js

let pyodide;

async function loadPyodideAndPackages() {
  pyodide = await loadPyodide();
  console.log("Pyodide loaded");
}

loadPyodideAndPackages();

document.addEventListener("DOMContentLoaded", () => {
  const loginScreen = document.getElementById("login-screen");
  const studentLogin = document.getElementById("student-login");
  const studentDashboard = document.getElementById("student-dashboard");
  const teacherDashboard = document.getElementById("teacher-dashboard");

  document.getElementById("student-login-btn").addEventListener("click", () => {
    loginScreen.style.display = "none";
    studentLogin.style.display = "block";
  });

  document.getElementById("teacher-login-btn").addEventListener("click", () => {
    window.location.href = "teacher.html";
  });

  document.getElementById("student-submit-btn").addEventListener("click", () => {
    const name = document.getElementById("student-name").value;
    const studentClass = document.getElementById("student-class").value;
    const roll = document.getElementById("student-roll").value;

    if (name && studentClass && roll) {
      document.getElementById("student-name-display").textContent = name;
      loginScreen.style.display = "none";
      studentLogin.style.display = "none";
      studentDashboard.style.display = "block";
    } else {
      alert("Please fill in all student details.");
    }
  });

  document.getElementById("back-btn").addEventListener("click", () => {
    studentDashboard.style.display = "none";
    loginScreen.style.display = "block";
  });

  document.getElementById("run-code").addEventListener("click", async () => {
    const code = document.getElementById("code-input").value;
    const outputElem = document.getElementById("output");

    try {
      let output = await pyodide.runPythonAsync(`
import sys
from io import StringIO

stdout = sys.stdout
stderr = sys.stderr
sys.stdout = sys.stderr = StringIO()

try:
${code.split('\n').map(line => '  ' + line).join('\n')}
except Exception as e:
  print(e)

sys.stdout.getvalue()
      `);
      outputElem.textContent = output;
    } catch (err) {
      outputElem.textContent = `❌ Error:\n${err}`;
    }
  });
});
