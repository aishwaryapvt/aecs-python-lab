import { loadHomework, assignHomework } from './homeworkManager.js';

let pyodide;
let editor;

async function main() {
  pyodide = await loadPyodide();
  editor = monaco.editor.create(document.getElementById('editor-container'), {
    value: 'print("Hello")',
    language: 'python',
    theme: 'vs',
    automaticLayout: true
  });
}

window.studentLogin = async function () {
  const name = document.getElementById('student-name').value.trim();
  const cls = document.getElementById('student-class').value.trim();
  const roll = document.getElementById('student-roll').value.trim();
  if (!name || !cls || !roll) return alert('Please fill all fields.');
  document.getElementById('login-page').classList.add('hidden');
  document.getElementById('student-dashboard').classList.remove('hidden');
  document.getElementById('student-name-display').textContent = name;
  document.getElementById('student-class-display').textContent = cls;
  const hw = await loadHomework(cls);
  document.getElementById('homework-display').textContent = hw ?? 'No homework assigned.';
};

window.teacherLogin = function () {
  const username = document.getElementById('teacher-username').value;
  const password = document.getElementById('teacher-password').value;
  if (username === 'teacher' && password === '1234') {
    document.getElementById('login-page').classList.add('hidden');
    document.getElementById('teacher-login').classList.add('hidden');
    document.getElementById('teacher-dashboard').classList.remove('hidden');
  } else {
    alert('Invalid credentials');
  }
};

window.showTeacherLogin = function () {
  document.getElementById('login-page').classList.add('hidden');
  document.getElementById('teacher-login').classList.remove('hidden');
};

window.runCode = async function () {
  const code = editor.getValue();
  try {
    let result = await pyodide.runPythonAsync(code);
    document.getElementById('output').textContent = String(result ?? '✅ No Output');
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
    let result = await pyodide.runPythonAsync(code);
    document.getElementById('teacher-output').textContent = String(result ?? '✅ No Output');
  } catch (err) {
    document.getElementById('teacher-output').textContent = '❌ ' + err;
  }
};

main();


// homeworkManager.js
export async function loadHomework(studentClass) {
  const homeworkKey = `homework-${studentClass}`;
  const homework = localStorage.getItem(homeworkKey);
  return homework;
}

export function assignHomework(studentClass, homeworkText) {
  const homeworkKey = `homework-${studentClass}`;
  localStorage.setItem(homeworkKey, homeworkText);
}