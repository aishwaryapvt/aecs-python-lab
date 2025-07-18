let pyodideReadyPromise;

async function main() {
  pyodideReadyPromise = loadPyodide();
  await pyodideReadyPromise;
}
main();

function runCode() {
  let code = document.getElementById("code-editor").value;
  let output = document.getElementById("output");
  pyodideReadyPromise.then((pyodide) => {
    try {
      let result = pyodide.runPython(code);
      output.textContent = result === undefined ? "✅ No Output" : result;
    } catch (err) {
      output.textContent = `❌ Error: ${err}`;
    }
  });
}

function runTeacherCode() {
  let code = document.getElementById("teacher-code").value;
  let output = document.getElementById("teacher-output");
  pyodideReadyPromise.then((pyodide) => {
    try {
      let result = pyodide.runPython(code);
      output.textContent = result === undefined ? "✅ No Output" : result;
    } catch (err) {
      output.textContent = `❌ Error: ${err}`;
    }
  });
}

// UI State
const loginScreen = document.getElementById("login-screen");
const studentLogin = document.getElementById("student-login");
const teacherLogin = document.getElementById("teacher-login");
const studentDashboard = document.getElementById("student-dashboard");
const teacherDashboard = document.getElementById("teacher-dashboard");

// Navigation Buttons
const studentLoginLink = document.getElementById("student-login-link");
const teacherLoginLink = document.getElementById("teacher-login-link");
const backToLoginStudent = document.getElementById("back-to-login-student");
const backToLoginTeacher = document.getElementById("back-to-login-teacher");

// Login Buttons
const loginStudentBtn = document.getElementById("login-student");
const loginTeacherBtn = document.getElementById("login-teacher");

studentLoginLink.addEventListener("click", () => {
  loginScreen.classList.add("hidden");
  studentLogin.classList.remove("hidden");
});

teacherLoginLink.addEventListener("click", () => {
  loginScreen.classList.add("hidden");
  teacherLogin.classList.remove("hidden");
});

backToLoginStudent.addEventListener("click", () => {
  studentLogin.classList.add("hidden");
  loginScreen.classList.remove("hidden");
});

backToLoginTeacher.addEventListener("click", () => {
  teacherLogin.classList.add("hidden");
  loginScreen.classList.remove("hidden");
});

loginStudentBtn.addEventListener("click", () => {
  const name = document.getElementById("student-name").value;
  const studentClass = document.getElementById("student-class").value;
  const roll = document.getElementById("student-roll").value;

  if (!name || !studentClass || !roll) {
    alert("Please fill all fields");
    return;
  }

  studentLogin.classList.add("hidden");
  studentDashboard.classList.remove("hidden");
  document.getElementById("student-name-display").textContent = name;
  document.getElementById("student-class-display").textContent = studentClass;

  const homework = localStorage.getItem(`homework-${studentClass}`);
  document.getElementById("homework-display").textContent = homework || "No homework assigned.";
});

loginTeacherBtn.addEventListener("click", () => {
  const password = document.getElementById("teacher-pass").value;
  if (password !== "admin123") {
    alert("Wrong password");
    return;
  }
  teacherLogin.classList.add("hidden");
  teacherDashboard.classList.remove("hidden");
  loadSubmissions();
});

function assignHomeworkToClass() {
  const cls = document.getElementById("homework-class").value;
  const hw = document.getElementById("homework-text").value;
  if (!cls || !hw) {
    alert("Please enter class and homework.");
    return;
  }
  localStorage.setItem(`homework-${cls}`, hw);
  alert("Homework Assigned!");
  updateReviewClassSelect();
}

function submitCode() {
  const name = document.getElementById("student-name").value;
  const studentClass = document.getElementById("student-class").value;
  const roll = document.getElementById("student-roll").value;
  const code = document.getElementById("code-editor").value;

  const key = `submission-${studentClass}-${roll}`;
  localStorage.setItem(key, JSON.stringify({ name, studentClass, roll, code }));
  alert("Submitted!");
}

function loadSubmissions() {
  updateReviewClassSelect();
  document.getElementById("review-class-select").addEventListener("change", function () {
    const cls = this.value;
    const list = document.getElementById("submission-list");
    list.innerHTML = "";
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith(`submission-${cls}`)) {
        const data = JSON.parse(localStorage.getItem(key));
        const item = document.createElement("li");
        item.textContent = `${data.name} (Roll ${data.roll})`;
        item.addEventListener("click", () => {
          document.getElementById("teacher-code").value = data.code;
        });
        list.appendChild(item);
      }
    }
  });
}

function updateReviewClassSelect() {
  const select = document.getElementById("review-class-select");
  const classes = new Set();
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.startsWith("submission-")) {
      const cls = key.split("-")[1];
      classes.add(cls);
    }
  }
  select.innerHTML = "";
  classes.forEach(cls => {
    const option = document.createElement("option");
    option.value = cls;
    option.textContent = cls;
    select.appendChild(option);
  });
}
