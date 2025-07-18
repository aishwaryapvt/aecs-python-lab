// Teacher-specific management functions

class TeacherManager {
    constructor() {
        this.currentClass = null;
        this.questions = this.loadQuestions();
        this.submissions = this.loadSubmissions();
    }
    
    loadQuestions() {
        // In a real app, this would load from a database
        const defaultQuestions = {
            '9A': [
                {
                    id: 1,
                    title: "Hello World",
                    description: "Write a Python program that prints 'Hello, World!' to the console.",
                    starterCode: "# Write your code here\nprint('Hello, World!')"
                }
            ],
            '9B': [],
            '10A': [
                {
                    id: 2,
                    title: "Simple Calculator",
                    description: "Create a calculator that can add, subtract, multiply, and divide two numbers.",
                    starterCode: "# Simple Calculator\n# Get two numbers and an operator from user\n"
                }
            ],
            '10B': [],
            '11A': [
                {
                    id: 3,
                    title: "List Operations",
                    description: "Write a program that performs various operations on a list of numbers.",
                    starterCode: "# List operations\nnumbers = [1, 2, 3, 4, 5]\n"
                }
            ],
            '11B': [],
            '12A': [
                {
                    id: 4,
                    title: "File Handling",
                    description: "Create a program that reads from and writes to a text file.",
                    starterCode: "# File handling example\n# Write code to handle files\n"
                }
            ],
            '12B': []
        };
        
        return defaultQuestions;
    }
    
    loadSubmissions() {
        // In a real app, this would load from a database
        return {
            '9A': {},
            '9B': {},
            '10A': {},
            '10B': {},
            '11A': {},
            '11B': {},
            '12A': {},
            '12B': {}
        };
    }
    
    getQuestionsForClass(className) {
        return this.questions[className] || [];
    }
    
    addQuestionToClass(className, question) {
        if (!this.questions[className]) {
            this.questions[className] = [];
        }
        
        question.id = Date.now(); // Simple ID generation
        this.questions[className].push(question);
        return question;
    }
    
    removeQuestionFromClass(className, questionId) {
        if (this.questions[className]) {
            this.questions[className] = this.questions[className].filter(
                q => q.id !== questionId
            );
        }
    }
    
    getSubmissionsForQuestion(className, questionId) {
        if (!this.submissions[className] || !this.submissions[className][questionId]) {
            return [];
        }
        return this.submissions[className][questionId];
    }
    
    addSubmission(className, questionId, submission) {
        if (!this.submissions[className]) {
            this.submissions[className] = {};
        }
        if (!this.submissions[className][questionId]) {
            this.submissions[className][questionId] = [];
        }
        
        submission.timestamp = Date.now();
        this.submissions[className][questionId].push(submission);
    }
    
    compileAndTestCode(code) {
        // In a real application, this would send the code to a secure Python execution environment
        // For now, we'll just do basic syntax checking
        
        return new Promise((resolve, reject) => {
            try {
                // Basic syntax validation
                if (!code.trim()) {
                    reject(new Error("Empty code"));
                    return;
                }
                
                // Check for common Python syntax patterns
                const hasIndentationError = this.checkIndentation(code);
                if (hasIndentationError) {
                    reject(new Error("Indentation error detected"));
                    return;
                }
                
                const hasSyntaxError = this.checkBasicSyntax(code);
                if (hasSyntaxError) {
                    reject(new Error("Syntax error detected"));
                    return;
                }
                
                // If we get here, basic validation passed
                resolve({
                    success: true,
                    output: "Code appears to be syntactically correct. In a real environment, this would execute the code safely.",
                    executionTime: Math.random() * 1000 + 100 // Simulated execution time
                });
                
            } catch (error) {
                reject(error);
            }
        });
    }
    
    checkIndentation(code) {
        const lines = code.split('\n');
        let expectedIndent = 0;
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (line.trim() === '') continue;
            
            const actualIndent = line.match(/^\s*/)[0].length;
            
            // Basic indentation check - this is simplified
            if (line.trim().endsWith(':')) {
                expectedIndent += 4;
            } else if (actualIndent < expectedIndent && !line.trim().startsWith('#')) {
                // Check if it's a dedent
                const prevLine = lines[i - 1];
                if (prevLine && !prevLine.trim().endsWith(':')) {
                    return true; // Potential indentation error
                }
            }
        }
        
        return false;
    }
    
    checkBasicSyntax(code) {
        // Basic syntax checks
        const openParens = (code.match(/\(/g) || []).length;
        const closeParens = (code.match(/\)/g) || []).length;
        
        if (openParens !== closeParens) {
            return true; // Unmatched parentheses
        }
        
        const openBrackets = (code.match(/\[/g) || []).length;
        const closeBrackets = (code.match(/\]/g) || []).length;
        
        if (openBrackets !== closeBrackets) {
            return true; // Unmatched brackets
        }
        
        const openBraces = (code.match(/\{/g) || []).length;
        const closeBraces = (code.match(/\}/g) || []).length;
        
        if (openBraces !== closeBraces) {
            return true; // Unmatched braces
        }
        
        return false;
    }
    
    generateClassReport(className) {
        const classQuestions = this.getQuestionsForClass(className);
        const report = {
            className: className,
            totalQuestions: classQuestions.length,
            questions: []
        };
        
        classQuestions.forEach(question => {
            const submissions = this.getSubmissionsForQuestion(className, question.id);
            report.questions.push({
                title: question.title,
                totalSubmissions: submissions.length,
                submissions: submissions.map(s => ({
                    studentName: s.studentName,
                    rollNo: s.rollNo,
                    submissionTime: new Date(s.timestamp).toLocaleString()
                }))
            });
        });
        
        return report;
    }
    
    exportClassData(className) {
        const report = this.generateClassReport(className);
        const dataStr = JSON.stringify(report, null, 2);
        
        // Create downloadable file
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${className}_report.json`;
        a.click();
        URL.revokeObjectURL(url);
    }
}

// Initialize teacher manager
const teacherManager = new TeacherManager();

// Enhanced teacher dashboard functions
function initializeTeacherDashboard() {
    // Update the global questions and submissions with teacher manager data
    questions = teacherManager.questions;
    submissions = teacherManager.submissions;
    
    // Add event listeners for enhanced functionality
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            if (currentClass) {
                teacherManager.exportClassData(currentClass);
            }
        }
    });
}

// Enhanced compilation function for teacher
function compileSubmission(code) {
    const outputDiv = document.createElement('div');
    outputDiv.className = 'compilation-output';
    outputDiv.innerHTML = '<p>Compiling code...</p>';
    
    // Add to modal
    const modal = document.getElementById('submissions-modal');
    const existingOutput = modal.querySelector('.compilation-output');
    if (existingOutput) {
        existingOutput.remove();
    }
    modal.querySelector('.modal-content').appendChild(outputDiv);
    
    teacherManager.compileAndTestCode(code)
        .then(result => {
            outputDiv.innerHTML = `
                <div class="compilation-success">
                    <h4>Compilation Result:</h4>
                    <p><strong>Status:</strong> Success</p>
                    <p><strong>Output:</strong> ${result.output}</p>
                    <p><strong>Execution Time:</strong> ${result.executionTime.toFixed(2)}ms</p>
                </div>
            `;
        })
        .catch(error => {
            outputDiv.innerHTML = `
                <div class="compilation-error">
                    <h4>Compilation Error:</h4>
                    <p><strong>Error:</strong> ${error.message}</p>
                    <p>Please review the code for syntax errors.</p>
                </div>
            `;
        });
}

// Enhanced question management
function addQuestionAdvanced(event) {
    event.preventDefault();
    
    const title = document.getElementById('question-title').value;
    const description = document.getElementById('question-description').value;
    const starterCode = document.getElementById('question-starter').value;
    
    const newQuestion = {
        title: title,
        description: description,
        starterCode: starterCode,
        createdAt: Date.now(),
        createdBy: currentUser?.username || 'teacher'
    };
    
    teacherManager.addQuestionToClass(currentClass, newQuestion);
    hideAddQuestionForm();
    displayQuestions();
}

// Enhanced submission viewing
function viewSubmissionsAdvanced(questionId) {
    const question = questions[currentClass].find(q => q.id === questionId);
    const questionSubmissions = teacherManager.getSubmissionsForQuestion(currentClass, questionId);
    
    document.getElementById('submissions-title').textContent = `Submissions for: ${question.title}`;
    
    const submissionsList = document.getElementById('submissions-list');
    submissionsList.innerHTML = '';
    
    if (questionSubmissions.length === 0) {
        submissionsList.innerHTML = '<p class="no-submissions">No submissions yet.</p>';
    } else {
        questionSubmissions.forEach((submission, index) => {
            const submissionDiv = document.createElement('div');
            submissionDiv.className = 'submission-item';
            submissionDiv.innerHTML = `
                <div class="submission-header">
                    <h4>${submission.studentName} (Roll: ${submission.rollNo})</h4>
                    <div class="submission-meta">
                        <span class="submission-time">${new Date(submission.timestamp).toLocaleString()}</span>
                        <span class="submission-number">#${index + 1}</span>
                    </div>
                </div>
                <div class="submission-code">
                    <pre><code>${submission.code}</code></pre>
                </div>
                <div class="submission-actions">
                    <button onclick="compileSubmission('${submission.code.replace(/'/g, "\\'")}')" class="compile-btn">Test Code</button>
                    <button onclick="downloadSubmission(${index})" class="download-btn">Download</button>
                </div>
            `;
            submissionsList.appendChild(submissionDiv);
        });
    }
    
    document.getElementById('submissions-modal').style.display = 'flex';
}

function downloadSubmission(submissionIndex) {
    const questionSubmissions = teacherManager.getSubmissionsForQuestion(currentClass, currentQuestion.id);
    const submission = questionSubmissions[submissionIndex];
    
    const content = `
# Student: ${submission.studentName}
# Roll No: ${submission.rollNo}
# Submission Time: ${new Date(submission.timestamp).toLocaleString()}
# Question: ${currentQuestion.title}

${submission.code}
    `;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${submission.studentName}_${submission.rollNo}_submission.py`;
    a.click();
    URL.revokeObjectURL(url);
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.includes('teacher.html')) {
        initializeTeacherDashboard();
    }
});