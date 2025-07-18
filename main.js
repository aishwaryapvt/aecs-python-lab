let pyodide = null;
let homeworkDB = {};

async function loadPyodideAndPackages() {
  pyodide = await loadPyodide();
  console.log("Pyodide loaded");
}
loadPyodideAndPackages();

function showSection(idToShow) {
  document.querySelectorAll(".section").forEach(el => {
    el.classList.add("hidden");
  });
  document.getElementById(idToShow).classList.remove("hidden");
}

window.studentLogin = function () {
  const name = document.getElementById("student-name").value.trim();
  const cls = document.getElementById("student-class").value.trim();
  const roll = document.getElementById("student-roll").value.trim();

  if (!name || !cls || !roll) return alert("Fill all fields");

  const hw = homeworkDB[cls];
  if (!hw) {
    alert("No homework assigned to this class.");
    return;
  }

  document.getElementById("student-welcome").textContent = `Welcome, ${name} (${cls})`;
  document.getElementById("student-homework").textContent = hw;
  showSection("student-dashboard");
};

window.teacherLogin = function () {
  const pass = document.getElementById("teacher-pass").value.trim();
  if (pass === "admin123") {
    showSection("teacher-dashboard");
  } else {
    alert("Incorrect password");
  }
};

window.assignHomeworkToClass = function () {
  const cls = document.getElementById("homework-class").value.trim();
  const hw = document.getElementById("homework-text").value.trim();
  if (!cls || !hw) return alert("Fill all fields");

  homeworkDB[cls] = hw;
  alert(`Homework assigned to class ${cls}`);
  document.getElementById("homework-class").value = "";
  document.getElementById("homework-text").value = "";
};

window.runCode = async function () {
  const code = document.getElementById("code-editor").value;
  try {
    const result = await pyodide.runPythonAsync(code);
    const captured = pyodide.globals.get("print").toJs()._output;
    document.getElementById("output").textContent = captured || result || "✅ No Output";
  } catch (err) {
    document.getElementById("output").textContent = "❌ " + err;
  }
};

window.submitCode = function () {
  alert("Code submitted!");
};
