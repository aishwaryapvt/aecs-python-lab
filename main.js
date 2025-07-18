// Global variables
let currentUser = null;
let currentClass = null;
let currentQuestion = null;
let questions = {};
let submissions = {};

// Initialize data structure
function initializeData() {
    const classes = ['9A', '9B', '10A', '10B', '11A', '11B', '12A', '12B'];
    
    // Initialize questions for each class
    classes.forEach(cls => {
        if (!questions[cls]) {
            questions[cls] = [];
        }
        if (!submissions[cls]) {
            submissions[cls] = {};
        }
    });
    
    // Add sample questions
    if (questions['9A'].length === 0) {
        questions['9A'].push({
            id: 1,
            title: "Hello World",
            description: "Write a Python program that prints 'Hello, World!' to the console.",
            starterCode: "# Write your code here\nprint('Hello, World!')"
        });
        
        questions['10A'].push({
            id: 2,
            title: "Simple Calculator",
            description: "Create a calculator that can add, subtract, multiply, and divide two numbers.",
            starterCode: "# Simple Calculator\n# Get two numbers and an operator from user\na = 10\nb = 5\nprint(f'Addition: {a + b}')\nprint(f'Subtraction: {a - b}')\nprint(f'Multiplication: {a * b}')\nprint(f'Division: {a / b}')"
        });
        
        questions['11A'].push({
            id: 3,
            title: "List Operations",
            description: "Write a program that performs various operations on a list of numbers.",
            starterCode: "# List operations\nnumbers = [1, 2, 3, 4, 5]\nprint(f'Sum: {sum(numbers)}')\nprint(f'Max: {max(numbers)}')\nprint(f'Min: {min(numbers)}')"
        });
    }
}

// Login page functions
function showTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    document.getElementById(tabName + '-tab').classList.add('active');
    event.target.classList.add('active');
}

function studentLogin(event) {
    event.preventDefault();
    
    const name = document.getElementById('student-name').value;
    const studentClass = document.getElementById('student-class').value;
    const rollNo = document.getElementById('student-roll').value;
    
    currentUser = {
        type: 'student',
        name: name,
        class: studentClass,
        rollNo: rollNo
    };
    
    // Store user info for persistence
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    // Redirect to student dashboard
    window.location.href = 'student.html';
}

function teacherLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('teacher-username').value;
    const password = document.getElementById('teacher-password').value;
    
    // Simple authentication (in real app, this would be server-side)
    if (username === 'teacher' && password === 'password') {
        currentUser = {
            type: 'teacher',
            username: username
        };
        
        // Store user info for persistence
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        // Redirect to teacher dashboard
        window.location.href = 'teacher.html';
    } else {
        alert('Invalid credentials. Use username: teacher, password: password');
    }
}

// Teacher dashboard functions
function selectClass(className) {
    currentClass = className;
    document.getElementById('selected-class').textContent = `Class: ${className}`;
    document.getElementById('add-question-btn').style.display = 'block';
    
    // Highlight selected class
    document.querySelectorAll('.class-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    displayQuestions();
}

function displayQuestions() {
    const container = document.getElementById('questions-container');
    const classQuestions = questions[currentClass] || [];
    
    container.innerHTML = '';
    
    if (classQuestions.length === 0) {
        container.innerHTML = '<p class="no-questions">No questions assigned to this class yet.</p>';
        return;
    }
    
    classQuestions.forEach(question => {
        const questionDiv = document.createElement('div');
        questionDiv.className = 'question-item';
        questionDiv.innerHTML = `
            <div class="question-header">
                <h4>${question.title}</h4>
                <div class="question-actions">
                    <button onclick="viewSubmissions(${question.id})" class="view-btn">View Submissions</button>
                    <button onclick="removeQuestion(${question.id})" class="remove-btn">Remove</button>
                </div>
            </div>
            <p class="question-desc">${question.description}</p>
        `;
        container.appendChild(questionDiv);
    });
}

function showAddQuestionForm() {
    document.getElementById('add-question-form').style.display = 'flex';
}

function hideAddQuestionForm() {
    document.getElementById('add-question-form').style.display = 'none';
    document.getElementById('question-title').value = '';
    document.getElementById('question-description').value = '';
    document.getElementById('question-starter').value = '';
}

function addQuestion(event) {
    event.preventDefault();
    
    const title = document.getElementById('question-title').value;
    const description = document.getElementById('question-description').value;
    const starterCode = document.getElementById('question-starter').value;
    
    const newQuestion = {
        id: Date.now(),
        title: title,
        description: description,
        starterCode: starterCode
    };
    
    questions[currentClass].push(newQuestion);
    hideAddQuestionForm();
    displayQuestions();
}

function removeQuestion(questionId) {
    if (confirm('Are you sure you want to remove this question?')) {
        questions[currentClass] = questions[currentClass].filter(q => q.id !== questionId);
        displayQuestions();
    }
}

function viewSubmissions(questionId) {
    const question = questions[currentClass].find(q => q.id === questionId);
    const questionSubmissions = submissions[currentClass][questionId] || [];
    
    document.getElementById('submissions-title').textContent = `Submissions for: ${question.title}`;
    
    const submissionsList = document.getElementById('submissions-list');
    submissionsList.innerHTML = '';
    
    if (questionSubmissions.length === 0) {
        submissionsList.innerHTML = '<p>No submissions yet.</p>';
    } else {
        questionSubmissions.forEach(submission => {
            const submissionDiv = document.createElement('div');
            submissionDiv.className = 'submission-item';
            submissionDiv.innerHTML = `
                <div class="submission-header">
                    <h4>${submission.studentName} (Roll: ${submission.rollNo})</h4>
                    <span class="submission-time">${new Date(submission.timestamp).toLocaleString()}</span>
                </div>
                <div class="submission-code">
                    <pre><code>${submission.code}</code></pre>
                </div>
                <button onclick="compileSubmission('${encodeURIComponent(submission.code)}')" class="compile-btn">Test Code</button>
            `;
            submissionsList.appendChild(submissionDiv);
        });
    }
    
    document.getElementById('submissions-modal').style.display = 'flex';
}

function hideSubmissionsModal() {
    document.getElementById('submissions-modal').style.display = 'none';
}

function compileSubmission(encodedCode) {
    const code = decodeURIComponent(encodedCode);
    runPythonCode(code, 'Compilation test result:');
}

// Student dashboard functions
function initializeStudentDashboard() {
    // Get user info from storage
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
        currentUser = JSON.parse(storedUser);
    }
    
    const studentInfo = currentUser || {
        name: 'Student Name',
        class: '9A',
        rollNo: '1'
    };
    
    document.getElementById('student-info').textContent = 
        `${studentInfo.name} - Class: ${studentInfo.class}, Roll: ${studentInfo.rollNo}`;
    
    loadAssignedQuestions(studentInfo.class);
}

function loadAssignedQuestions(studentClass) {
    const assignedQuestions = questions[studentClass] || [];
    const container = document.getElementById('assigned-questions');
    
    container.innerHTML = '';
    
    if (assignedQuestions.length === 0) {
        container.innerHTML = '<p class="no-questions">No questions assigned yet.</p>';
        return;
    }
    
    assignedQuestions.forEach(question => {
        const questionDiv = document.createElement('div');
        questionDiv.className = 'question-item';
        questionDiv.innerHTML = `
            <h4>${question.title}</h4>
            <button onclick="selectQuestion(${question.id})" class="select-btn">Select</button>
        `;
        container.appendChild(questionDiv);
    });
}

function selectQuestion(questionId) {
    const studentClass = currentUser?.class || '9A';
    currentQuestion = questions[studentClass].find(q => q.id === questionId);
    
    if (currentQuestion) {
        document.getElementById('current-question-title').textContent = currentQuestion.title;
        document.getElementById('question-description').innerHTML = 
            `<p>${currentQuestion.description}</p>`;
        document.getElementById('code-editor').value = currentQuestion.starterCode || '';
        
        // Enable buttons
        document.getElementById('run-btn').disabled = false;
        document.getElementById('submit-btn').disabled = false;
        
        // Highlight selected question
        document.querySelectorAll('.question-item .select-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        event.target.classList.add('active');
    }
}

// Fixed Python code execution function
function runPythonCode(code, outputPrefix = '') {
    const output = document.getElementById('output');
    
    if (!code.trim()) {
        output.innerHTML = '<span class="error">Please write some code first.</span>';
        return;
    }
    
    // Clear previous output
    output.innerHTML = outputPrefix ? `<strong>${outputPrefix}</strong><br>` : '';
    
    // Check if Skulpt is available
    if (typeof Sk === 'undefined') {
        // Fallback: simulate Python execution for common cases
        simulatePythonExecution(code, output);
        return;
    }
    
    // Configure Skulpt
    Sk.pre = "output";
    Sk.configure({
        output: function(text) {
            output.innerHTML += text.replace(/\n/g, '<br>');
        },
        read: function(x) {
            if (Sk.builtinFiles === undefined || Sk.builtinFiles["files"][x] === undefined)
                throw "File not found: '" + x + "'";
            return Sk.builtinFiles["files"][x];
        }
    });
    
    // Run the code
    try {
        const prog = Sk.misceval.asyncToPromise(function() {
            return Sk.importMainWithBody("<stdin>", false, code, true);
        });
        
        prog.then(function(mod) {
            // Success - output already handled by Skulpt
        }, function(err) {
            output.innerHTML += '<br><span class="error">Error: ' + err.toString() + '</span>';
        });
    } catch (e) {
        output.innerHTML += '<br><span class="error">Error: ' + e.toString() + '</span>';
    }
}

// Fallback simulation for basic Python code
function simulatePythonExecution(code, outputElement) {
    try {
        // Simple simulation for basic Python constructs
        let simulatedOutput = '';
        
        // Handle print statements
        const printRegex = /print\s*\(\s*([^)]+)\s*\)/g;
        let match;
        
        while ((match = printRegex.exec(code)) !== null) {
            let printContent = match[1];
            
            // Handle f-strings
            if (printContent.includes('f\'') || printContent.includes('f"')) {
                printContent = printContent.replace(/f['"]([^'"]*)['"]/g, function(match, content) {
                    // Simple f-string simulation
                    return content.replace(/\{([^}]+)\}/g, function(match, expr) {
                        // Very basic expression evaluation
                        if (expr.includes('+')) {
                            const parts = expr.split('+').map(p => p.trim());
                            if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
                                return (parseFloat(parts[0]) + parseFloat(parts[1])).toString();
                            }
                        }
                        return expr; // Return as-is if can't evaluate
                    });
                });
            }
            
            // Remove quotes
            printContent = printContent.replace(/^['"]|['"]$/g, '');
            
            simulatedOutput += printContent + '<br>';
        }
        
        // Handle simple variable assignments and calculations
        if (code.includes('sum(') && code.includes('[')) {
            const listMatch = code.match(/\[([^\]]+)\]/);
            if (listMatch) {
                const numbers = listMatch[1].split(',').map(n => parseFloat(n.trim()));
                const sum = numbers.reduce((a, b) => a + b, 0);
                simulatedOutput = simulatedOutput.replace(/\{sum\([^}]+\)\}/g, sum.toString());
            }
        }
        
        if (simulatedOutput) {
            outputElement.innerHTML += simulatedOutput;
        } else {
            outputElement.innerHTML += '<span class="info">Code executed successfully (simulation mode)</span>';
        }
        
    } catch (error) {
        outputElement.innerHTML += '<span class="error">Simulation Error: ' + error.message + '</span>';
    }
}

function runCode() {
    const code = document.getElementById('code-editor').value;
    runPythonCode(code);
}

function submitCode() {
    const code = document.getElementById('code-editor').value;
    
    if (!code.trim()) {
        alert('Please write some code before submitting.');
        return;
    }
    
    if (!currentQuestion) {
        alert('Please select a question first.');
        return;
    }
    
    const studentClass = currentUser?.class || '9A';
    const submission = {
        questionId: currentQuestion.id,
        studentName: currentUser?.name || 'Student',
        rollNo: currentUser?.rollNo || '1',
        code: code,
        timestamp: Date.now()
    };
    
    // Initialize submissions structure if needed
    if (!submissions[studentClass][currentQuestion.id]) {
        submissions[studentClass][currentQuestion.id] = [];
    }
    
    submissions[studentClass][currentQuestion.id].push(submission);
    
    alert('Code submitted successfully!');
}

function logout() {
    currentUser = null;
    currentClass = null;
    currentQuestion = null;
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeData();
    
    // Check which page we're on and initialize accordingly
    if (window.location.pathname.includes('student.html')) {
        initializeStudentDashboard();
    }
});