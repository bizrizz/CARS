// Global Variables
let wpm = 300;
let mode = 'normal';
let fontSize = 18;
let lineSpacing = 1.5;
let backgroundColor = '#ffffff';
let topic = 'anthropology';
let complexityLevel = 'level1';
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
const topicSelect = document.getElementById('topicSelect');
const complexitySelect = document.getElementById('complexityLevel');
const readingMaterialSelect = document.getElementById('readingMaterial');
const startReadingButton = document.getElementById('startReading');
const readingDisplay = document.getElementById('readingDisplay');
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

topicSelect.addEventListener('change', (e) => {
    topic = e.target.value;
    populateReadingMaterials();
});

complexitySelect.addEventListener('change', (e) => {
    complexityLevel = e.target.value;
    populateReadingMaterials();
});

startReadingButton.addEventListener('click', startReading);

submitQuizButton.addEventListener('click', submitQuiz);

// Functions
function populateReadingMaterials() {
    readingMaterialSelect.innerHTML = '';

    // Assuming 3 stories per level
    for (let i = 1; i <= 3; i++) {
        const option = document.createElement('option');
        option.value = `story${i}.txt`;
        option.text = `Story ${i}`;
        readingMaterialSelect.appendChild(option);
    }
}

function startReading() {
    readingMaterial = readingMaterialSelect.value;
    const filePath = `readings/${topic}/${complexityLevel}/${readingMaterial}`;

    fetch(filePath)
        .then(response => response.text())
        .then(text => {
            readingText = text;
            readingWords = readingText.split(/\s+/);
            currentWordIndex = 0;
            if (mode === 'normal') {
                readingDisplay.innerText = readingText;
                startTimer();
            } else if (mode === 'rsvp') {
                readingDisplay.innerText = '';
                startTimer();
                startRSVP();
            }
        });
}

function startTimer() {
    readingStartTime = new Date();
}

function endReading() {
    readingEndTime = new Date();
    const timeSpent = (readingEndTime - readingStartTime) / 1000 / 60; // in minutes
    const actualWPM = readingWords.length / timeSpent;
    updateProgress(actualWPM);
    loadQuiz();
}

function startRSVP() {
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

function loadQuiz() {
    quizSection.style.display = 'block';

    const storyNumber = readingMaterialSelect.selectedIndex + 1;

    if (topic === 'anthropology') {
        if (complexityLevel === 'level1') {
            comprehensionQuestions = getAnthropologyLevel1Quiz(storyNumber);
        } else if (complexityLevel === 'level2') {
            comprehensionQuestions = getAnthropologyLevel2Quiz(storyNumber);
        } else if (complexityLevel === 'level3') {
            comprehensionQuestions = getAnthropologyLevel3Quiz(storyNumber);
        }
    } else if (topic === 'philosophy') {
        if (complexityLevel === 'level1') {
            comprehensionQuestions = getPhilosophyLevel1Quiz(storyNumber);
        } else if (complexityLevel === 'level2') {
            comprehensionQuestions = getPhilosophyLevel2Quiz(storyNumber);
        } else if (complexityLevel === 'level3') {
            comprehensionQuestions = getPhilosophyLevel3Quiz(storyNumber);
        }
    } else if (topic === 'social_sciences') {
        if (complexityLevel === 'level1') {
            comprehensionQuestions = getSocialSciencesLevel1Quiz(storyNumber);
        } else if (complexityLevel === 'level2') {
            comprehensionQuestions = getSocialSciencesLevel2Quiz(storyNumber);
        } else if (complexityLevel === 'level3') {
            comprehensionQuestions = getSocialSciencesLevel3Quiz(storyNumber);
        }
    }

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
            label.style.display = 'block';
            const radio = document.createElement('input');
            radio.type = 'radio';
            radio.name = 'question' + index;
            radio.value = i;
            label.appendChild(radio);
            label.appendChild(document.createTextNode(' ' + option));
            questionDiv.appendChild(label);
        });
        quizQuestionsDiv.appendChild(questionDiv);
    });
}

function submitQuiz() {
    let score = 0;
    comprehensionQuestions.forEach((q, index) => {
        const selectedOption = document.querySelector(`input[name='question${index}']:checked`);
        if (selectedOption) {
            const answer = parseInt(selectedOption.value);
            if (answer === q.answer) {
                score++;
            }
        }
    });
    const totalQuestions = comprehensionQuestions.length;
    const percentage = (score / totalQuestions) * 100;
    alert('Your score: ' + score + '/' + totalQuestions + ' (' + percentage.toFixed(2) + '%)');
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

    populateReadingMaterials();
};

// Quiz Functions for each topic and level
// Anthropology Level 1 Quizzes
function getAnthropologyLevel1Quiz(storyNumber) {
    if (storyNumber === 1) {
        return [
            {
                question: 'Where did the people gather?',
                options: ['In the marketplace', 'Around the fire', 'At the riverbank', 'In the town hall'],
                answer: 1
            },
            {
                question: 'What did they talk about?',
                options: ['The weather', 'Their ancestors', 'Sports', 'Technology'],
                answer: 1
            },
            {
                question: 'What did they value?',
                options: ['Money', 'Traditions and rituals', 'Fame', 'Modernization'],
                answer: 1
            },
            {
                question: 'How were traditions passed down?',
                options: ['Through books', 'Online courses', 'Through generations', 'Television'],
                answer: 2
            }
        ];
    } else if (storyNumber === 2) {
        return [
            {
                question: 'What did the children play?',
                options: ['Sports', 'Games about customs', 'Music', 'Video games'],
                answer: 1
            },
            {
                question: 'Who watched the children?',
                options: ['Teachers', 'Elders', 'Parents', 'Tourists'],
                answer: 1
            },
            {
                question: 'How did the elders feel?',
                options: ['Angry', 'Indifferent', 'Happy', 'Worried'],
                answer: 2
            },
            {
                question: 'What did the elders know?',
                options: ['The culture would live on', 'The children were misbehaving', 'A storm was coming', 'They needed new games'],
                answer: 0
            }
        ];
    } else if (storyNumber === 3) {
        return [
            {
                question: 'What did the villagers celebrate?',
                options: ['A wedding', 'The harvest', 'New Year', 'A victory'],
                answer: 1
            },
            {
                question: 'How did they celebrate?',
                options: ['With songs and dances', 'By working harder', 'By fasting', 'By traveling'],
                answer: 0
            },
            {
                question: 'How did everyone feel?',
                options: ['Sad', 'Angry', 'Joyful and grateful', 'Tired'],
                answer: 2
            },
            {
                question: 'How often did the celebration occur?',
                options: ['Daily', 'Monthly', 'Yearly', 'Once a decade'],
                answer: 2
            }
        ];
    }
}

// Anthropology Level 2 Quizzes
function getAnthropologyLevel2Quiz(storyNumber) {
    if (storyNumber === 1) {
        return [
            {
                question: 'Why did the tribe migrate?',
                options: ['To find new villages', 'To follow animal herds', 'To escape enemies', 'For adventure'],
                answer: 1
            },
            {
                question: 'What did they depend on for food?',
                options: ['Farming', 'Animals', 'Fishing', 'Trading'],
                answer: 1
            },
            {
                question: 'What guided their movements?',
                options: ['Maps', 'Ancient knowledge', 'Stars', 'Modern technology'],
                answer: 1
            },
            {
                question: 'What does "migrated seasonally" mean?',
                options: ['Moved every day', 'Moved randomly', 'Moved during certain seasons', 'Never moved'],
                answer: 2
            }
        ];
    }
    // ... Add quizzes for story 2 and 3
}

// Continue adding quiz functions for other topics and levels

// Placeholder functions for other quizzes
function getAnthropologyLevel3Quiz(storyNumber) { /* Add quizzes */ }
function getPhilosophyLevel1Quiz(storyNumber) { /* Add quizzes */ }
function getPhilosophyLevel2Quiz(storyNumber) { /* Add quizzes */ }
function getPhilosophyLevel3Quiz(storyNumber) { /* Add quizzes */ }
function getSocialSciencesLevel1Quiz(storyNumber) { /* Add quizzes */ }
function getSocialSciencesLevel2Quiz(storyNumber) { /* Add quizzes */ }
function getSocialSciencesLevel3Quiz(storyNumber) { /* Add quizzes */ }
