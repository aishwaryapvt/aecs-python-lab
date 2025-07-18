import { loadHomework, assignHomework } from './homeworkManager.js';

let pyodide;
let editor;

async function initPyodide() {
  pyodide = await loadPyodide();
  console.log('Pyodide loaded');
}

window.onload = async function () {
  await initPyodide();

  editor = ace.edit("editor");
  editor.setTheme("ace/theme/chrome");
  editor.session.setMode("ace/mode/python");

  document.getElementById('student-login-btn').onclick = () => login('student');
  document.getElementById('teacher-login-btn').onclick = () => login('teacher');
};

function login(role) {
  const name = document.getElementById('name').value.trim();
  const roll = document.getElementById('roll').value.trim();
  const cls = document.getElementById('class').value.trim();
  const password = document.getElementById('password').value;

  if (role === 'teacher') {
    if (name !== 'teacher' || password !== 'admin') return alert('Invalid teacher credentials');
    document.getElementById('login-page').classList.add('hidden');
    document.getElementById('teacher-dashboard').classList.remove('hidden');
    return;
  }

  if (!name || !roll || !cls) return alert('Fill all student fields');
  document.getElementById('login-page').classList.add('hidden');
  document.getElementById('student-dashboard').classList.remove('hidden');
  document.getElementById('student-info').textContent = `Welcome, ${name} (${roll})`;
  loadHomework(cls).then(hw => {
    document.getElementById('homework-text-display').textContent = hw || 'No homework assigned';
  });
}

window.runCode = async function () {
  const code = editor.getValue();
  try {
    const result = await pyodide.runPythonAsync(code);
    document.getElementById('output').textContent = result !== undefined ? result.toString() : '✅ No Output';
  } catch (err) {
    document.getElementById('output').textContent = '❌ ' + err;
  }
};

window.submitCode = function () {
  alert('Code submitted!');
};

window.assignHomeworkToClass = function () {
  const cls = document.getElementById('homework-class').value.trim();
  const hw = document.getElementById('homework-text').value.trim();
  if (!cls || !hw) return alert('Fill all fields');
  assignHomework(cls, hw);
  alert('Homework assigned to Class ' + cls);
};

window.runTeacherCode = async function () {
  const code = document.getElementById('teacher-code').value;
  try {
    const result = await pyodide.runPythonAsync(code);
    document.getElementById('teacher-output').textContent = result !== undefined ? result.toString() : '✅ No Output';
  } catch (err) {
    document.getElementById('teacher-output').textContent = '❌ ' + err;
  }
};
