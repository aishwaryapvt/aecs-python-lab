let pyodide;
let editor;
const teacherPassword = "admin123";

window.addEventListener("DOMContentLoaded", async () => {
  pyodide = await loadPyodide();
  setupEditor();
  setupEvents();
  restoreTheme();
});

function setupEditor() {
  editor = ace.edit("editor-container");
  editor.setTheme("ace/theme/textmate");
  editor.session.setMode("ace/mode/python");
  editor.setOptions({ enableBasicAutocompletion: true, showLineNumbers: true });
  editor.session.on('change', () => {
    localStorage.setItem("student-code", editor.getValue());
  });
  const savedCode = localStorage.getItem("student-code");
  if (savedCode) editor.setValue(savedCode, -1);
}

function setupEvents() {
  document.getElementById("student-login").onclick = () => {
    const name = document.getElementById("student-name").value.trim();
    const roll = document.getElementById("student-roll").value.trim();
    const sclass = document.getElementById("student-class").value.trim();
    if (name && roll && sclass) {
      document.getElementById("student-id").textContent = `${name} (${roll})`;
      document.getElementById("login-form").classList.add("hidden");
      document.getElementById("student-panel").classList.remove("hidden");
      loadHomework(sclass);
    }
  };

  document.getElementById("teacher-login").onclick = () => {
    const pass = document.getElementById("teacher-pass").value.trim();
    if (pass === teacherPassword) {
      document.getElementById("teacher-login-form").classList.add("hidden");
      document.getElementById("teacher-panel").classList.remove("hidden");
    } else {
      alert("Incorrect password.");
    }
  };

  document.getElementById("run-code").onclick = async () => {
    const code = editor.getValue();
    try {
      const result = await pyodide.runPythonAsync(code);
      document.getElementById("code-output").textContent = result ?? "✅ No Output";
    } catch (err) {
      document.getElementById("code-output").textContent = `❌ Error: ${err}`;
    }
  };

  document.getElementById("submit-code").onclick = () => {
    alert("Code submitted (local only)");
  };

  document.getElementById("set-homework").onclick = () => {
    const cls = document.getElementById("target-class").value.trim();
    const hw = document.getElementById("homework-text").value.trim();
    if (cls && hw) {
      localStorage.setItem("hw-" + cls.toLowerCase(), hw);
      alert("Homework assigned to class " + cls);
    }
  };

  document.querySelectorAll(".back-home").forEach(btn =>
    btn.onclick = () => location.reload()
  );

  document.getElementById("show-teacher-login").onclick = () => {
    document.getElementById("login-form").classList.add("hidden");
    document.getElementById("teacher-login-form").classList.remove("hidden");
  };

  document.getElementById("show-student-login").onclick = () => {
    document.getElementById("teacher-login-form").classList.add("hidden");
    document.getElementById("login-form").classList.remove("hidden");
  };

  document.getElementById("theme-toggle").onclick = () => {
    document.body.classList.toggle("dark");
    editor.setTheme(document.body.classList.contains("dark") ? "ace/theme/monokai" : "ace/theme/textmate");
    localStorage.setItem("theme", document.body.classList.contains("dark") ? "dark" : "light");
  };
}

function restoreTheme() {
  const saved = localStorage.getItem("theme");
  if (saved === "dark") {
    document.body.classList.add("dark");
    editor?.setTheme("ace/theme/monokai");
  }
}

function loadHomework(cls) {
  const hw = localStorage.getItem("hw-" + cls.toLowerCase()) || "No homework assigned.";
  document.getElementById("assigned-homework").textContent = hw;
}
