let pyodideReadyPromise = loadPyodideAndPackages();

let homeworkData = {};
let submissions = {};

async function loadPyodideAndPackages() {
  let pyodide = await loadPyodide();
  await pyodide.loadPackage(["micropip"]);
  await pyodide.runPythonAsync(`
    import sys
    import io
    sys.stdout = io.StringIO()
    sys.stderr = io.StringIO()
  `);
  return pyodide;
}

// ------------------ Student Login Flow ------------------
document.getElementById("student-login-link").onclick = () => {
  document.getElementById("login-screen").classList.add("hidden");
  document.getElementById("student-login").classList.remove("hidden");
};

document.getElementById("back-to-login-student").onclick = () => {
  document.getElementById("student-login").classList.add("hidden");
  document.getElementById("login-screen").classList.remove("hidden");
};

document.getElementById("login-student").onclick = () => {
  const name = document.getElementById("student-name").value.trim();
  const className = document.getElementById("student-class").value.trim();
  const roll = document.getElementById("student-roll").value.trim();

  if (!name || !className || !roll) return alert("Please fill all fields!");

  document.getElementById("student-name-display").textContent = name;
  document.getElementById("student-class-display").textContent = className;

  document.getElementById("student-login").classList.add("hidden");
  document.getElementById("student-dashboard").classList.remove("hidden");

  const homework = homeworkData[className] || "No homework assigned.";
  document.getElementById("homework-display").textContent = homework;
};

// ------------------ Teacher Login Flow ------------------
document.getElementById("teacher-login-link").onclick = () => {
  document.getElementById("login-screen").classList.add("hidden");
  document.getElementById("teacher-login").classList.remove("hidden");
};

document.getElementById("back-to-login-teacher").onclick = () => {
  document.getElementById("teacher-login").classList.add("hidden");
  document.getElementById("login-screen").classList.remove("hidden");
};

document.getElementById("login-teacher").onclick = () => {
  const password = document.getElementById("teacher-pass").value;
  if (password !== "teacher123") return alert("Incorrect password!");
  document.getElementById("teacher-login").classList.add("hidden");
  document.getElementById("teacher-dashboard").classList.remove("hidden");
  updateClassDropdown();
};

// ------------------ Assign Homework ------------------
function assignHomeworkToClass() {
  const className = document.getElementById("homework-class").value.trim();
  const homework = document.getElementById("homework-text").value.trim();
  if (!className || !homework) return alert("Enter class and homework!");
  homeworkData[className] = homework;
  alert("Homework assigned!");
  updateClassDropdown();
}

// ------------------ Submit Code ------------------
function submitCode() {
  const name = document.getElementById("student-name").value.trim();
  const className = document.getElementById("student-class").value.trim();
  const roll = document.getElementById("student-roll").value.trim();
  const code = document.getElementById("code-editor").value;

  const studentId = `${roll}-${name}`;
  if (!submissions[className]) submissions[className] = {};
  submissions[className][studentId] = { name, roll, code };

  alert("Code submitted successfully!");
}

// ------------------ Review Submissions ------------------
function updateClassDropdown() {
  const dropdown = document.getElementById("review-class-select");
  dropdown.innerHTML = "";

  Object.keys(submissions).forEach((cls) => {
    const option = document.createElement("option");
    option.value = cls;
    option.textContent = cls;
    dropdown.appendChild(option);
  });

  dropdown.onchange = () => {
    const cls = dropdown.value;
    const ul = document.getElementById("submission-list");
    ul.innerHTML = "";
    if (!submissions[cls]) return;

    Object.entries(submissions[cls]).forEach(([id, { name, code }]) => {
      const li = document.createElement("li");
      li.innerHTML = `<strong>${name}</strong><pre>${code}</pre>`;
      ul.appendChild(li);
    });
  };

  dropdown.dispatchEvent(new Event("change"));
}

// ------------------ Python Code Execution ------------------
async function runCode() {
  const code = document.getElementById("code-editor").value;
  const pyodide = await pyodideReadyPromise;

  try {
    await pyodide.runPythonAsync(`
      import sys
      sys.stdout = sys.__stdout__ = sys.stderr = sys.__stderr__ = None
      from js import console
      import io
      sys.stdout = io.StringIO()
      sys.stderr = io.StringIO()
      ${code}
    `);
    const output = await pyodide.runPythonAsync("sys.stdout.getvalue()");
    const error = await pyodide.runPythonAsync("sys.stderr.getvalue()");
    document.getElementById("output").textContent = (output + error).trim();
  } catch (err) {
    document.getElementById("output").textContent = `❌ Error:\n${err}`;
  }
}

// ------------------ Teacher Code Runner ------------------
async function runTeacherCode() {
  const code = document.getElementById("teacher-code").value;
  const pyodide = await pyodideReadyPromise;

  try {
    await pyodide.runPythonAsync(`
      import sys
      sys.stdout = sys.__stdout__ = sys.stderr = sys.__stderr__ = None
      from js import console
      import io
      sys.stdout = io.StringIO()
      sys.stderr = io.StringIO()
      ${code}
    `);
    const output = await pyodide.runPythonAsync("sys.stdout.getvalue()");
    const error = await pyodide.runPythonAsync("sys.stderr.getvalue()");
    document.getElementById("teacher-output").textContent = (output + error).trim();
  } catch (err) {
    document.getElementById("teacher-output").textContent = `❌ Error:\n${err}`;
  }
}
