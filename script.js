// Global Variables
let wpm = 300;
let mode = 'normal';
let fontSize = 18;
let lineSpacing = 1.5;
let backgroundColor = '#ffffff';
let readingMaterial = '';
let readingText = '';
let readingWords = [];
let currentWordIndex = 0;
let readingStartTime;
let readingEndTime;
let comprehensionQuestions = [];
let userAnswers = [];

// DOM Elements
const wpmInput = document.getElementById('wpm');
const modeSelect = document.getElementById('mode');
const fontSizeInput = document.getElementById('fontSize');
const lineSpacingInput = document.getElementById('lineSpacing');
const backgroundColorSelect = document.getElementById('backgroundColor');
const readingMaterialSelect = document.getElementById('readingMaterial');
const startReadingButton = document.getElementById('startReading');
const readingDisplay = document.getElementById('readingDisplay');
const nextWordButton = document.getElementById('nextWord');
const quizSection = document.getElementById('quizSection');
const quizQuestionsDiv = document.getElementById('quizQuestions');
const submitQuizButton = document.getElementById('submitQuiz');
const avgWPMSpan = document.getElementById('avgWPM');
const avgScoreSpan = document.getElementById('avgScore');

// Event Listeners
wpmInput.addEventListener('change', (e) => {
    wpm = parseInt(e.target.value);
});

modeSelect.addEventListener('change', (e) => {
    mode = e.target.value;
});

fontSizeInput.addEventListener('input', (e) => {
    fontSize = e.target.value;
    readingDisplay.style.fontSize = fontSize + 'px';
});

lineSpacingInput.addEventListener('input', (e) => {
    lineSpacing = e.target.value;
    readingDisplay.style.lineHeight = lineSpacing;
});

backgroundColorSelect.addEventListener('change', (e) => {
    backgroundColor = e.target.value;
    readingDisplay.style.backgroundColor = backgroundColor;
});

startReadingButton.addEventListener('click', startReading);

nextWordButton.addEventListener('click', displayNextWord);

submitQuizButton.addEventListener('click', submitQuiz);

// Functions
function startReading() {
    readingMaterial = readingMaterialSelect.value;
    fetch('readings/' + readingMaterial)
        .then(response => response.text())
        .then(text => {
            readingText = text;
            if (mode === 'normal') {
                readingDisplay.innerText = readingText;
                startTimer();
            } else if (mode === 'rsvp') {
                readingWords = readingText.split(/\s+/);
                currentWordIndex = 0;
                readingDisplay.innerText = '';
                nextWordButton.style.display = 'inline-block';
                startTimer();
            }
        });
}

function displayNextWord() {
    if (currentWordIndex < readingWords.length) {
        readingDisplay.innerText = readingWords[currentWordIndex];
        currentWordIndex++;
    } else {
        endReading();
    }
}

function startTimer() {
    readingStartTime = new Date();
    if (mode === 'rsvp') {
        const interval = 60000 / wpm;
        const rsvpInterval = setInterval(() => {
            if (currentWordIndex < readingWords.length) {
                readingDisplay.innerText = readingWords[currentWordIndex];
                currentWordIndex++;
            } else {
                clearInterval(rsvpInterval);
                endReading();
            }
        }, interval);
    }
}

function endReading() {
    readingEndTime = new Date();
    const timeSpent = (readingEndTime - readingStartTime) / 1000 / 60; // in minutes
    const actualWPM = readingWords.length / timeSpent;
    updateProgress(actualWPM);
    loadQuiz();
}

function loadQuiz() {
    quizSection.style.display = 'block';
    // Sample questions
    comprehensionQuestions = [
        {
            question: 'What is the main theme of the text?',
            options: ['Option A', 'Option B', 'Option C', 'Option D'],
            answer: 0
        },
        {
            question: 'True or False: The text mentions XYZ.',
            options: ['True', 'False'],
            answer: 1
        }
    ];
    displayQuizQuestions();
}

function displayQuizQuestions() {
    quizQuestionsDiv.innerHTML = '';
    comprehensionQuestions.forEach((q, index) => {
        const questionDiv = document.createElement('div');
        const questionText = document.createElement('p');
        questionText.innerText = q.question;
        questionDiv.appendChild(questionText);

        q.options.forEach((option, i) => {
            const label = document.createElement('label');
            const radio = document.createElement('input');
            radio.type = 'radio';
            radio.name = 'question' + index;
            radio.value = i;
            label.appendChild(radio);
            label.appendChild(document.createTextNode(option));
            questionDiv.appendChild(label);
        });
        quizQuestionsDiv.appendChild(questionDiv);
    });
}

function submitQuiz() {
    let score = 0;
    comprehensionQuestions.forEach((q, index) => {
        const selectedOption = document.querySelector(`input[name='question${index}']:checked`);
        if (selectedOption && parseInt(selectedOption.value) === q.answer) {
            score++;
        }
    });
    const percentage = (score / comprehensionQuestions.length) * 100;
    alert('Your score: ' + percentage + '%');
    updateComprehensionScore(percentage);
    quizSection.style.display = 'none';
}

function updateProgress(wpm) {
    let totalWPM = parseFloat(localStorage.getItem('totalWPM')) || 0;
    let sessions = parseInt(localStorage.getItem('sessions')) || 0;

    totalWPM += wpm;
    sessions += 1;

    localStorage.setItem('totalWPM', totalWPM);
    localStorage.setItem('sessions', sessions);

    const avgWPM = totalWPM / sessions;
    avgWPMSpan.innerText = avgWPM.toFixed(2);
}

function updateComprehensionScore(score) {
    let totalScore = parseFloat(localStorage.getItem('totalScore')) || 0;
    let quizzes = parseInt(localStorage.getItem('quizzes')) || 0;

    totalScore += score;
    quizzes += 1;

    localStorage.setItem('totalScore', totalScore);
    localStorage.setItem('quizzes', quizzes);

    const avgScore = totalScore / quizzes;
    avgScoreSpan.innerText = avgScore.toFixed(2) + '%';
}

// Initialize Progress
function initializeProgress() {
    const totalWPM = parseFloat(localStorage.getItem('totalWPM')) || 0;
    const sessions = parseInt(localStorage.getItem('sessions')) || 0;
    const avgWPM = sessions > 0 ? totalWPM / sessions : 0;
    avgWPMSpan.innerText = avgWPM.toFixed(2);

    const totalScore = parseFloat(localStorage.getItem('totalScore')) || 0;
    const quizzes = parseInt(localStorage.getItem('quizzes')) || 0;
    const avgScore = quizzes > 0 ? totalScore / quizzes : 0;
    avgScoreSpan.innerText = avgScore.toFixed(2) + '%';
}

// On Load
window.onload = () => {
    initializeProgress();
    readingDisplay.style.fontSize = fontSize + 'px';
    readingDisplay.style.lineHeight = lineSpacing;
    readingDisplay.style.backgroundColor = backgroundColor;
};
