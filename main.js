// Load questions for selected class
function loadQuestions() {
    const questionsList = document.getElementById('questions-list');
    const classQuestions = questions[currentClass] || [];
    
    questionsList.innerHTML = '';
    
    if (classQuestions.length === 0) {
        questionsList.innerHTML = '<p>No questions available for this class.</p>';
        return;
    }
    
    classQuestions.forEach((question, index) => {
        const questionDiv = document.createElement('div');
        questionDiv.className = 'question-item';
        questionDiv.innerHTML = `
            <h3>${question.title}</h3>
            <p>${question.description}</p>
            <div class="question-actions">
                <button onclick="editQuestion(${index})">Edit</button>
                <button onclick="deleteQuestion(${index})">Delete</button>
            </div>
        `;
        questionsList.appendChild(questionDiv);
    });
}

// Edit question function
function editQuestion(index) {
    const question = questions[currentClass][index];
    document.getElementById('question-title').value = question.title;
    document.getElementById('question-description').value = question.description;
    document.getElementById('question-code').value = question.code;
    document.getElementById('expected-output').value = question.expectedOutput;
    
    // Store the index for updating
    document.getElementById('question-form').setAttribute('data-edit-index', index);
    
    // Show form
    document.getElementById('question-form').style.display = 'block';
}

// Delete question function
function deleteQuestion(index) {
    if (confirm('Are you sure you want to delete this question?')) {
        questions[currentClass].splice(index, 1);
        saveData();
        loadQuestions();
    }
}

// Load student questions
function loadStudentQuestions() {
    const questionsList = document.getElementById('student-questions-list');
    const classQuestions = questions[currentClass] || [];
    
    questionsList.innerHTML = '';
    
    if (classQuestions.length === 0) {
        questionsList.innerHTML = '<p>No questions available for this class.</p>';
        return;
    }
    
    classQuestions.forEach((question, index) => {
        const questionDiv = document.createElement('div');
        questionDiv.className = 'question-item';
        
        // Check if student has submitted this question
        const submissionKey = `${currentUser}_${currentClass}_${index}`;
        const hasSubmitted = submissions[submissionKey] ? 'submitted' : 'not-submitted';
        
        questionDiv.innerHTML = `
            <h3>${question.title}</h3>
            <p>${question.description}</p>
            <div class="question-status ${hasSubmitted}">
                Status: ${hasSubmitted === 'submitted' ? 'Submitted' : 'Not Submitted'}
            </div>
            <button onclick="solveQuestion(${index})">Solve</button>
        `;
        questionsList.appendChild(questionDiv);
    });
}

// Solve question function
function solveQuestion(index) {
    currentQuestion = index;
    const question = questions[currentClass][index];
    
    document.getElementById('solve-title').textContent = question.title;
    document.getElementById('solve-description').textContent = question.description;
    document.getElementById('student-code').value = question.code;
    
    // Hide questions list and show solve area
    document.getElementById('questions-area').style.display = 'none';
    document.getElementById('solve-area').style.display = 'block';
}

// Go back to questions list
function goBackToQuestions() {
    document.getElementById('solve-area').style.display = 'none';
    document.getElementById('questions-area').style.display = 'block';
    currentQuestion = null;
}

// Run Python code function
function runPythonCode() {
    const code = document.getElementById('student-code').value;
    const outputDiv = document.getElementById('code-output');
    
    // Clear previous output
    outputDiv.innerHTML = '';
    
    if (!code.trim()) {
        outputDiv.innerHTML = '<div class="error">Please enter some code to run.</div>';
        return;
    }
    
    try {
        // Check if Skulpt is available
        if (typeof Sk !== 'undefined') {
            // Use Skulpt for Python execution
            Sk.pre = "code-output";
            Sk.configure({
                output: function(text) {
                    outputDiv.innerHTML += text;
                },
                read: function(x) {
                    if (Sk.builtinFiles === undefined || Sk.builtinFiles["files"][x] === undefined)
                        throw "File not found: '" + x + "'";
                    return Sk.builtinFiles["files"][x];
                }
            });
            
            const myPromise = Sk.misceval.asyncToPromise(function() {
                return Sk.importMainWithBody("<stdin>", false, code, true);
            });
            
            myPromise.then(function(mod) {
                // Code executed successfully
                console.log('Code executed successfully');
            }, function(err) {
                outputDiv.innerHTML = '<div class="error">Error: ' + err.toString() + '</div>';
            });
        } else {
            // Fallback: simulate Python execution
            simulatePythonExecution(code, outputDiv);
        }
    } catch (error) {
        outputDiv.innerHTML = '<div class="error">Error: ' + error.message + '</div>';
    }
}

// Simulate Python execution for basic operations
function simulatePythonExecution(code, outputDiv) {
    try {
        // Simple simulation for basic Python operations
        const lines = code.split('\n');
        let output = '';
        
        for (let line of lines) {
            line = line.trim();
            if (line.startsWith('print(')) {
                // Extract content from print statement
                const match = line.match(/print\((.+)\)/);
                if (match) {
                    let content = match[1];
                    
                    // Handle f-strings (basic)
                    if (content.startsWith('f"') || content.startsWith("f'")) {
                        content = content.substring(2, content.length - 1);
                        // Simple variable substitution (for demo)
                        content = content.replace(/\{(\w+)\}/g, 'value');
                    } else if (content.startsWith('"') || content.startsWith("'")) {
                        content = content.substring(1, content.length - 1);
                    }
                    
                    output += content + '\n';
                }
            } else if (line.includes('=') && !line.includes('==')) {
                // Variable assignment (just acknowledge)
                continue;
            } else if (line.startsWith('#') || line === '') {
                // Comments and empty lines
                continue;
            }
        }
        
        if (output) {
            outputDiv.innerHTML = '<div class="success">' + output.replace(/\n/g, '<br>') + '</div>';
        } else {
            outputDiv.innerHTML = '<div class="info">Code executed (no output)</div>';
        }
    } catch (error) {
        outputDiv.innerHTML = '<div class="error">Simulation Error: ' + error.message + '</div>';
    }
}

// Submit solution function
function submitSolution() {
    if (currentQuestion === null) {
        alert('No question selected');
        return;
    }
    
    const code = document.getElementById('student-code').value;
    const question = questions[currentClass][currentQuestion];
    
    if (!code.trim()) {
        alert('Please enter your solution code');
        return;
    }
    
    // Create submission
    const submissionKey = `${currentUser}_${currentClass}_${currentQuestion}`;
    const submission = {
        studentName: currentUser,
        className: currentClass,
        questionIndex: currentQuestion,
        questionTitle: question.title,
        code: code,
        timestamp: new Date().toISOString(),
        status: 'submitted'
    };
    
    submissions[submissionKey] = submission;
    saveData();
    
    alert('Solution submitted successfully!');
    goBackToQuestions();
    loadStudentQuestions(); // Refresh the questions list
}

// Test compilation function
function testCompilation() {
    const code = document.getElementById('student-code').value;
    
    if (!code.trim()) {
        alert('Please enter code to test');
        return;
    }
    
    // Open a new window with the code for testing
    const testWindow = window.open('', '_blank', 'width=800,height=600');
    testWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Python Code Test</title>
            <script src="https://cdnjs.cloudflare.com/ajax/libs/skulpt/0.11.1/skulpt.min.js"></script>
            <script src="https://cdnjs.cloudflare.com/ajax/libs/skulpt/0.11.1/skulpt-stdlib.js"></script>
            <style>
                body { font-family: monospace; padding: 20px; }
                #output { background: #f0f0f0; padding: 10px; margin: 10px 0; border: 1px solid #ccc; }
                .error { color: red; }
            </style>
        </head>
        <body>
            <h2>Python Code Test</h2>
            <pre id="code">${code}</pre>
            <button onclick="runCode()">Run Code</button>
            <div id="output"></div>
            
            <script>
                function runCode() {
                    const outputDiv = document.getElementById('output');
                    outputDiv.innerHTML = '';
                    
                    Sk.pre = "output";
                    Sk.configure({
                        output: function(text) {
                            outputDiv.innerHTML += text;
                        }
                    });
                    
                    const myPromise = Sk.misceval.asyncToPromise(function() {
                        return Sk.importMainWithBody("<stdin>", false, \`${code}\`, true);
                    });
                    
                    myPromise.then(function(mod) {
                        console.log('Code executed successfully');
                    }, function(err) {
                        outputDiv.innerHTML = '<div class="error">Error: ' + err.toString() + '</div>';
                    });
                }
                
                // Auto-run on load
                window.onload = runCode;
            </script>
        </body>
        </html>
    `);
}

// View submissions function (for teachers)
function viewSubmissions() {
    const submissionsList = document.getElementById('submissions-list');
    submissionsList.innerHTML = '';
    
    // Get all submissions for current class
    const classSubmissions = Object.values(submissions).filter(sub => 
        sub.className === currentClass
    );
    
    if (classSubmissions.length === 0) {
        submissionsList.innerHTML = '<p>No submissions found for this class.</p>';
        return;
    }
    
    classSubmissions.forEach(submission => {
        const submissionDiv = document.createElement('div');
        submissionDiv.className = 'submission-item';
        submissionDiv.innerHTML = `
            <h3>${submission.questionTitle}</h3>
            <p><strong>Student:</strong> ${submission.studentName}</p>
            <p><strong>Submitted:</strong> ${new Date(submission.timestamp).toLocaleString()}</p>
            <div class="submission-code">
                <h4>Code:</h4>
                <pre>${submission.code}</pre>
            </div>
            <div class="submission-actions">
                <button onclick="gradeSubmission('${submission.studentName}_${submission.className}_${submission.questionIndex}')">Grade</button>
                <button onclick="downloadSubmission('${submission.studentName}_${submission.className}_${submission.questionIndex}')">Download</button>
            </div>
        `;
        submissionsList.appendChild(submissionDiv);
    });
}

// Grade submission function
function gradeSubmission(submissionKey) {
    const submission = submissions[submissionKey];
    if (!submission) {
        alert('Submission not found');
        return;
    }
    
    const grade = prompt(`Grade for ${submission.studentName}'s submission of "${submission.questionTitle}":`, '');
    if (grade !== null) {
        submission.grade = grade;
        submission.gradedAt = new Date().toISOString();
        saveData();
        alert('Grade saved successfully!');
        viewSubmissions(); // Refresh the view
    }
}

// Download submission function
function downloadSubmission(submissionKey) {
    const submission = submissions[submissionKey];
    if (!submission) {
        alert('Submission not found');
        return;
    }
    
    const content = `
Student: ${submission.studentName}
Class: ${submission.className}
Question: ${submission.questionTitle}
Submitted: ${new Date(submission.timestamp).toLocaleString()}
${submission.grade ? `Grade: ${submission.grade}` : ''}

Code:
${submission.code}
    `;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${submission.studentName}_${submission.questionTitle}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}

// Clear all data function
function clearAllData() {
    if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
        localStorage.removeItem('pythonJudgeData');
        questions = {};
        submissions = {};
        initializeData();
        alert('All data cleared successfully!');
        
        // Refresh current view
        if (currentUser === 'teacher') {
            if (currentClass) {
                loadQuestions();
            }
        } else {
            if (currentClass) {
                loadStudentQuestions();
            }
        }
    }
}

// Export data function
function exportData() {
    const data = {
        questions: questions,
        submissions: submissions,
        exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'python_judge_data.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}

// Import data function
function importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const data = JSON.parse(e.target.result);
                    if (data.questions && data.submissions) {
                        questions = data.questions;
                        submissions = data.submissions;
                        saveData();
                        alert('Data imported successfully!');
                        
                        // Refresh current view
                        if (currentUser === 'teacher' && currentClass) {
                            loadQuestions();
                        } else if (currentUser !== 'teacher' && currentClass) {
                            loadStudentQuestions();
                        }
                    } else {
                        alert('Invalid data format');
                    }
                } catch (error) {
                    alert('Error importing data: ' + error.message);
                }
            };
            reader.readAsText(file);
        }
    };
    input.click();
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    initializeData();
    
    // Auto-login if user data exists
    const savedUser = localStorage.getItem('currentUser');
    const savedClass = localStorage.getItem('currentClass');
    
    if (savedUser && savedClass) {
        currentUser = savedUser;
        currentClass = savedClass;
        
        // Redirect to appropriate page
        if (currentUser === 'teacher') {
            if (window.location.pathname.includes('teacher.html')) {
                loadQuestions();
            } else if (!window.location.pathname.includes('teacher.html')) {
                window.location.href = 'teacher.html';
            }
        } else {
            if (window.location.pathname.includes('student.html')) {
                loadStudentQuestions();
            } else if (!window.location.pathname.includes('student.html')) {
                window.location.href = 'student.html';
            }
        }
    }
});