// Global variable to hold the score
let score = 0;

// Get references to login page elements
const loginPage = document.getElementById('login-page');
const mainApp = document.getElementById('main-app');
const usernameInput = document.getElementById('username-input');
const passwordInput = document.getElementById('password-input');
const loginBtn = document.getElementById('login-btn');
const loginErrorMessage = document.getElementById('login-error-message');

// Get references to the HTML elements
const conceptInput = document.getElementById('concept-input');
const explainBtn = document.getElementById('explain-btn');
const quizInput = document.getElementById('quiz-input');
const quizBtn = document.getElementById('quiz-btn');
const summaryInput = document.getElementById('summary-input');
const summarizeBtn = document.getElementById('summarize-btn');
const flashcardsInput = document.getElementById('flashcards-input');
const flashcardsBtn = document.getElementById('flashcards-btn');
const chatBtn = document.getElementById('chat-btn');
const outputArea = document.getElementById('output-area');
const scoreDisplay = document.getElementById('current-score');
const loaderContainer = document.querySelector('.loader-container');

// Get references for chatbox elements
const chatIconContainer = document.getElementById('chat-icon-container');
const chatBox = document.getElementById('chat-box');
const closeChatBtn = document.getElementById('close-chat-btn');
const chatHistory = document.getElementById('chat-history');
const chatInputBox = document.getElementById('chat-input-box');
const sendChatBtn = document.getElementById('send-chat-btn');


// A reusable function to handle API calls
async function callAPI(endpoint, prompt) {
    if (prompt === '') {
        outputArea.innerHTML = '<h3>AI Output</h3><p>Please provide input.</p>';
        return;
    }
    
    loaderContainer.style.display = 'flex';
    outputArea.innerHTML = '';
    
    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ prompt: prompt })
        });
        const data = await response.json();
        loaderContainer.style.display = 'none';

        if (response.ok) {
            return data.response;
        } else {
            outputArea.innerHTML = `<h3>Error</h3><p>Server Error: ${data.error}</p>`;
        }
    } catch (error) {
        loaderContainer.style.display = 'none';
        console.error('Network or server error:', error);
        outputArea.innerHTML = `<h3>Error</h3><p>Could not connect to the server. Please try again later.</p>`;
    }
    return null;
}

// Validation functions
function validateUsername(username) {
    const letters = /^[A-Za-z]+$/; // Regex to check for only alphabetic characters
    return letters.test(username);
}

function validatePassword(password) {
    // Regex for at least one lowercase, one uppercase, one number, and one special character
    const hasLowercase = /[a-z]/;
    const hasUppercase = /[A-Z]/;
    const hasNumber = /[0-9]/;
    const hasSpecialChar = /[!@#$%^&*]/; // You can customize these special characters
    
    return hasLowercase.test(password) && hasUppercase.test(password) && hasNumber.test(password) && hasSpecialChar.test(password);
}


// Add event listener for login
loginBtn.addEventListener('click', async () => {
    const username = usernameInput.value;
    const password = passwordInput.value;

    // Front-end validation
    if (!validateUsername(username)) {
        loginErrorMessage.textContent = 'Username must contain only alphabetic characters.';
        return;
    }
    
    if (!validatePassword(password)) {
        loginErrorMessage.textContent = 'Password must have at least one capital letter, one lowercase letter, one number, and one special character.';
        return;
    }
    
    // If validation passes, proceed with the login request
    const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    });

    const result = await response.json();
    if (result.success) {
        loginPage.classList.add('hidden');
        mainApp.classList.remove('hidden');
    } else {
        loginErrorMessage.textContent = result.message;
    }
});


// Add a click event listener to the "Explain" button
explainBtn.addEventListener('click', async () => {
    const prompt = conceptInput.value.trim();
    const aiResponse = await callAPI('/api/explain', prompt);
    if (aiResponse) {
        outputArea.innerHTML = `<h3>AI Explanation</h3><p>${aiResponse}</p>`;
        conceptInput.value = '';
    }
});

// Add a click event listener to the "Generate Quiz" button
quizBtn.addEventListener('click', async () => {
    const prompt = quizInput.value.trim();
    score = 0;
    scoreDisplay.textContent = score;
    const aiResponse = await callAPI('/api/quiz', prompt);
    if (aiResponse) {
        renderQuiz(aiResponse);
        quizInput.value = '';
    }
});

// Add a click event listener to the "Summarize" button
summarizeBtn.addEventListener('click', async () => {
    const prompt = summaryInput.value.trim();
    const aiResponse = await callAPI('/api/summarize', prompt);
    if (aiResponse) {
        outputArea.innerHTML = `<h3>AI-Generated Summary</h3><p>${aiResponse}</p>`;
        summaryInput.value = '';
    }
});

// Add a click event listener for flashcard generation
flashcardsBtn.addEventListener('click', async () => {
    const prompt = flashcardsInput.value.trim();
    const aiResponse = await callAPI('/api/flashcards', prompt);
    if (aiResponse) {
        renderFlashcards(aiResponse);
        flashcardsInput.value = '';
    }
});

// Add event listeners for the interactive chatbox
chatIconContainer.addEventListener('click', () => {
    chatBox.classList.toggle('hidden');
});

closeChatBtn.addEventListener('click', () => {
    chatBox.classList.add('hidden');
});

sendChatBtn.addEventListener('click', async () => {
    const userMessage = chatInputBox.value.trim();
    if (userMessage === '') return;
    
    addMessageToChatHistory(userMessage, 'user');
    chatInputBox.value = '';

    const aiThinkingMessage = document.createElement('div');
    aiThinkingMessage.className = 'chat-message-ai';
    aiThinkingMessage.innerHTML = `<p>...</p>`;
    chatHistory.appendChild(aiThinkingMessage);
    chatHistory.scrollTop = chatHistory.scrollHeight;

    const aiResponse = await callAPI('/api/chat', userMessage);
    if (aiResponse) {
        aiThinkingMessage.innerHTML = `<p>${aiResponse}</p>`;
    } else {
        aiThinkingMessage.innerHTML = `<p>Error: Could not get a response.</p>`;
    }
});

// A function to add a message to the chat history
function addMessageToChatHistory(message, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.className = sender === 'user' ? 'chat-message-user' : 'chat-message-ai';
    messageDiv.innerHTML = `<p>${message}</p>`;
    chatHistory.appendChild(messageDiv);
    chatHistory.scrollTop = chatHistory.scrollHeight;
}

// Function to parse and render the quiz
function renderQuiz(quizText) {
    outputArea.innerHTML = '';
    
    const quizTitle = document.createElement('h3');
    quizTitle.textContent = 'AI-Generated Quiz';
    outputArea.appendChild(quizTitle);
    
    const rawQuestions = quizText.split('Question').slice(1);
    
    const correctAnswers = [];
    
    rawQuestions.forEach((qText, index) => {
        const lines = qText.split('\n').filter(line => line.trim() !== '');
        
        const questionText = lines[0].replace(/:/, '').trim();
        
        const options = lines.slice(1, -1);
        
        const correctAnswerLine = lines[lines.length - 1];
        const correctMatch = correctAnswerLine.match(/[A-D]/);
        let correctAnswerLetter = null;
        if (correctMatch) {
            correctAnswerLetter = correctMatch[0]; 
            correctAnswers.push({ index: index, correct: correctAnswerLetter });
        }
        
        const questionDiv = document.createElement('div');
        questionDiv.className = 'quiz-question';
        questionDiv.innerHTML = `<h4>Question ${index + 1}: ${questionText}</h4>`;
        
        const optionsList = document.createElement('ul');
        optionsList.className = 'quiz-options';
        optionsList.dataset.questionIndex = index;

        options.forEach(optionText => {
            const optionItem = document.createElement('li');
            const trimmedOptionText = optionText.trim();
            optionItem.textContent = trimmedOptionText;
            optionItem.className = 'quiz-option-item';
            
            optionItem.addEventListener('click', () => {
                optionsList.querySelectorAll('.quiz-option-item').forEach(item => {
                    item.classList.remove('selected');
                });
                optionItem.classList.add('selected');
            });
            optionsList.appendChild(optionItem);
        });
        
        questionDiv.appendChild(optionsList);
        outputArea.appendChild(questionDiv);
    });

    const submitBtn = document.createElement('button');
    submitBtn.textContent = 'Submit Answers';
    submitBtn.className = 'submit-btn';
    outputArea.appendChild(submitBtn);

    submitBtn.addEventListener('click', () => {
        if (submitBtn.disabled) return;
        submitBtn.disabled = true;
        let currentScore = 0;
        
        correctAnswers.forEach(correctAnswer => {
            const questionList = outputArea.querySelector(`[data-question-index="${correctAnswer.index}"]`);
            const selectedAnswer = questionList.querySelector('.selected');
            
            if (selectedAnswer) {
                const selectedLetter = selectedAnswer.textContent.trim()[0];
                if (selectedLetter === correctAnswer.correct) {
                    currentScore++;
                    selectedAnswer.classList.add('correct');
                } else {
                    selectedAnswer.classList.add('incorrect');
                    const correctOption = Array.from(questionList.querySelectorAll('.quiz-option-item')).find(item => {
                        return item.textContent.trim()[0] === correctAnswer.correct;
                    });
                    if (correctOption) {
                        correctOption.classList.add('correct');
                    }
                }
            }
        });

        scoreDisplay.textContent = currentScore;
    });
}

// Function to parse and render flashcards
function renderFlashcards(flashcardsText) {
    outputArea.innerHTML = '';
    
    const flashcardTitle = document.createElement('h3');
    flashcardTitle.textContent = 'AI-Generated Flashcards';
    outputArea.appendChild(flashcardTitle);
    
    const rawFlashcards = flashcardsText.split('Term:').slice(1);
    
    rawFlashcards.forEach(cardText => {
        const lines = cardText.split('\n').filter(line => line.trim() !== '');
        const term = lines[0].trim();
        const definition = lines[1].replace('Definition:', '').trim();
        
        const flashcardDiv = document.createElement('div');
        flashcardDiv.className = 'flashcard-card';
        flashcardDiv.innerHTML = `
            <div class="flashcard-content">
                <div class="flashcard-front">
                    <h4>${term}</h4>
                </div>
                <div class="flashcard-back">
                    <p>${definition}</p>
                </div>
            </div>
        `;
        
        flashcardDiv.addEventListener('click', () => {
            flashcardDiv.classList.toggle('flipped');
        });
        
        outputArea.appendChild(flashcardDiv);
    });
}