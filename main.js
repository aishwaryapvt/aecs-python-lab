// main.js
let pyodideReadyPromise;

async function loadPyodideAndPackages() {
  pyodideReadyPromise = loadPyodide();
  await pyodideReadyPromise;
}

loadPyodideAndPackages();

document.addEventListener("DOMContentLoaded", () => {
  const loginScreen = document.getElementById("login-screen");
  const studentLogin = document.getElementById("student-login");
  const studentDashboard = document.getElementById("student-dashboard");
  const teacherButton = document.getElementById("teacher-login-btn");
  const studentButton = document.getElementById("student-login-btn");
  const studentSubmitBtn = document.getElementById("student-submit-btn");
  const backToLoginBtn = document.getElementById("back-to-login");

  // Navigate to teacher.html
  teacherButton.addEventListener("click", () => {
    window.location.href = "teacher.html";
  });

  // Show student login form
  studentButton.addEventListener("click", () => {
    loginScreen.style.display = "none";
    studentLogin.style.display = "block";
  });

  // Student login submission
  document.getElementById("student-login-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("student-name").value.trim();
    const studentClass = document.getElementById("student-class").value.trim();
    const roll = document.getElementById("student-roll").value.trim();
    if (name && studentClass && roll) {
      studentLogin.style.display = "none";
      studentDashboard.style.display = "block";
      document.getElementById("student-id-display").textContent = `${name} | Class ${studentClass} | Roll ${roll}`;
    }
  });

  // Go back to main login screen
  backToLoginBtn.addEventListener("click", () => {
    studentDashboard.style.display = "none";
    loginScreen.style.display = "block";
    document.getElementById("student-code").value = "";
    document.getElementById("output").textContent = "";
  });

  // Run Python code using Pyodide
  studentSubmitBtn.addEventListener("click", async () => {
    const code = document.getElementById("student-code").value;
    const outputElement = document.getElementById("output");
    try {
      await pyodideReadyPromise;
      let result = await pyodide.runPythonAsync(`
import sys
from io import StringIO
sys.stdout = sys.stderr = mystdout = StringIO()

${code}

mystdout.getvalue()
      `);
      outputElement.textContent = result;
    } catch (err) {
      outputElement.textContent = "❌ Error:\n" + err;
    }
  });
});
