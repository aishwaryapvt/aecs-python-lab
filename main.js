// main.js

let pyodideReadyPromise = loadPyodideAndPackages();

async function loadPyodideAndPackages() {
  let pyodide = await loadPyodide();
  await pyodide.loadPackage("micropip");
  return pyodide;
}

function showElement(id) {
  document.querySelectorAll(".screen").forEach(div => div.style.display = "none");
  document.getElementById(id).style.display = "block";
}

// Student login
document.getElementById("student-btn").addEventListener("click", () => {
  showElement("student-login");
});

document.getElementById("student-login-btn").addEventListener("click", () => {
  const name = document.getElementById("name").value;
  const roll = document.getElementById("roll").value;
  const studentClass = document.getElementById("class").value;

  if (!name || !roll || !studentClass) {
    alert("Please fill in all fields.");
    return;
  }

  document.getElementById("student-dashboard").style.display = "block";
  document.getElementById("student-login").style.display = "none";
  document.getElementById("student-name").textContent = name;
});

// Go back from student dashboard
document.getElementById("student-back-btn").addEventListener("click", () => {
  showElement("login-screen");
  document.getElementById("code").value = "";
  document.getElementById("output").textContent = "";
});

// Teacher login redirect
document.getElementById("teacher-btn").addEventListener("click", () => {
  window.location.href = "teacher.html";
});

// Run Python code
document.getElementById("run-code").addEventListener("click", async () => {
  const code = document.getElementById("code").value;

  if (!code.trim()) {
    alert("Please enter Python code.");
    return;
  }

  const outputEl = document.getElementById("output");
  outputEl.textContent = "⏳ Running...";

  try {
    let pyodide = await pyodideReadyPromise;

    let output = await pyodide.runPythonAsync(`
      import sys
      from io import StringIO

      sys.stdout = StringIO()
      sys.stderr = StringIO()

      try:
          exec("""${code}""")
      except Exception as e:
          print("Error:", e)

      sys.stdout.getvalue() + sys.stderr.getvalue()
    `);

    outputEl.textContent = output;
  } catch (err) {
    outputEl.textContent = `❌ Unexpected Error:\n${err}`;
  }
});
