let pyodide = null;
let studentInfo = {};
let homeworkData = {};

async function loadPyodideAndPackages() {
  pyodide = await loadPyodide();
  console.log("✅ Pyodide loaded");
}

loadPyodideAndPackages();

document.getElementById("student-login-btn").addEventListener("click", () => {
  document.getElementById("login-screen").style.display = "none";
  document.getElementById("student-login").style.display = "block";
});

document.getElementById("teacher-login-btn").addEventListener("click", () => {
  document.getElementById("login-screen").style.display = "none";
  document.getElementById("teacher-dashboard").style.display = "block";
});

document.getElementById("submit-student-login").addEventListener("click", () => {
  const name = document.getElementById("student-name").value.trim();
  const cls = document.getElementById("student-class").value.trim();
  const roll = document.getElementById("student-roll").value.trim();

  if (!name || !cls || !roll) {
    alert("Please fill all fields");
    return;
  }

  studentInfo = { name, class: cls, roll };
  document.getElementById("student-login").style.display = "none";
  document.getElementById("student-dashboard").style.display = "block";
  document.getElementById("student-greeting").textContent = `Welcome, ${name}`;
  loadHomeworkForStudent(cls);
});

document.getElementById("assign-homework").addEventListener("click", () => {
  const classInput = document.getElementById("homework-class").value.trim();
  const task = document.getElementById("homework-text").value.trim();

  if (!classInput || !task) {
    alert("Class and Homework text required");
    return;
  }

  homeworkData[classInput] = task;
  alert(`📚 Homework assigned for Class ${classInput}`);
  document.getElementById("homework-class").value = "";
  document.getElementById("homework-text").value = "";
});

function loadHomeworkForStudent(cls) {
  const homeworkArea = document.getElementById("homework-area");
  if (homeworkData[cls]) {
    homeworkArea.textContent = homeworkData[cls];
  } else {
    homeworkArea.textContent = "No homework assigned for your class yet.";
  }
}

document.getElementById("run-code").addEventListener("click", async () => {
  const code = document.getElementById("student-code").value;
  const outputArea = document.getElementById("code-output");

  if (!pyodide) {
    outputArea.textContent = "⏳ Pyodide is still loading...";
    return;
  }

  try {
    await pyodide.loadPackagesFromImports(code);
    const result = pyodide.runPython(code);
    outputArea.textContent = `✅ Output:\n${result}`;
  } catch (err) {
    outputArea.textContent = `❌ Error:\n${err}`;
  }
});
