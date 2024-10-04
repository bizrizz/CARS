// Global Variables
let wpm = 300;
let mode = 'normal';
let fontSize = 18;
let lineSpacing = 1.5;
let backgroundColor = '#ffffff';
let topic = 'Cryptozoology'; // Default topic
let complexityLevel = '1';    // Default level
let readingText = '';
let readingWords = [];
let currentWordIndex = 0;
let readingStartTime;
let readingEndTime;
let comprehensionQuestions = [];
let userAnswers = [];

let csvData = [];        // Holds raw CSV data
let organizedData = {};  // Holds data organized by level and topic

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
const doneReadingButton = document.getElementById('doneReading');
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
    topic = e.target.value.trim();
    populateReadingMaterials();
});

complexitySelect.addEventListener('change', (e) => {
    complexityLevel = e.target.value.trim();
    populateReadingMaterials();
});

startReadingButton.addEventListener('click', startReading);

doneReadingButton.addEventListener('click', endReading);

submitQuizButton.addEventListener('click', submitQuiz);

// Functions
function loadCSVData() {
    const csvUrl = 'https://bizrizz.github.io/CARS/comprehension.csv'; // Update with your actual URL

    Papa.parse(csvUrl, {
        download: true,
        header: true,
        complete: function(results) {
            csvData = results.data;
            console.log('CSV Data Loaded:', csvData);
            organizeCSVData(); // Organize data after loading
            populateReadingMaterials(); // Call this function after data is loaded
        },
        error: function(err) {
            console.error('Error loading CSV:', err);
        }
    });
}

function organizeCSVData() {
    organizedData = {};

    csvData.forEach(row => {
        const level = row.Level.trim();
        const topic = row.Topic.trim();
        const passageID = row.PassageID.trim();
        const passageText = row.PassageText;
        const questionID = row.QuestionID.trim();
        const questionText = row.QuestionText;
        const options = [row.OptionA, row.OptionB, row.OptionC, row.OptionD];
        const correctOption = row.CorrectOption.trim();

        if (!organizedData[level]) {
            organizedData[level] = {};
        }

        if (!organizedData[level][topic]) {
            organizedData[level][topic] = {};
        }

        if (!organizedData[level][topic][passageID]) {
            organizedData[level][topic][passageID] = {
                passageText: passageText !== 'SAME' ? passageText : '',
                questions: []
            };
        }

        const passage = organizedData[level][topic][passageID];

        if (passageText !== 'SAME' && passageText !== '') {
            passage.passageText = passageText;
        }

        passage.questions.push({
            questionID: questionID,
            questionText: questionText,
            options: options,
            correctOption: correctOption
        });
    });

    console.log('Organized Data:', organizedData);
}

function populateReadingMaterials() {
    console.log('complexityLevel:', complexityLevel);
    console.log('topic:', topic);
    console.log('organizedData:', organizedData);

    readingMaterialSelect.innerHTML = '';

    // Ensure data is loaded and organized
    if (!organizedData[complexityLevel] || !organizedData[complexityLevel][topic]) {
        console.warn('No data available for the selected level and topic.');
        return;
    }

    const passages = organizedData[complexityLevel][topic];
    const passageIDs = Object.keys(passages);

    passageIDs.forEach((passageID, index) => {
        const option = document.createElement('option');
        option.value = passageID;
        option.text = `Passage ${index + 1}`;
        readingMaterialSelect.appendChild(option);
    });
}

function startReading() {
    const passageID = readingMaterialSelect.value;

    if (!organizedData[complexityLevel] || !organizedData[complexityLevel][topic]) {
        alert('Passage data not available.');
        return;
    }

    const passageData = organizedData[complexityLevel][topic][passageID];

    if (!passageData) {
        alert('Selected passage not found.');
        return;
    }

    readingText = passageData.passageText;
    comprehensionQuestions = passageData.questions;

    readingWords = readingText.split(/\s+/);
    currentWordIndex = 0;

    startTimer();

    if (mode === 'normal') {
        readingDisplay.innerText = readingText;
        doneReadingButton.style.display = 'inline'; // Show the 'Done Reading' button
    } else if (mode === 'rsvp') {
        readingDisplay.innerText = '';
        startRSVP();
    }

    // Disable controls during reading
    startReadingButton.disabled = true;
    topicSelect.disabled = true;
    complexitySelect.disabled = true;
    readingMaterialSelect.disabled = true;
}

function startTimer() {
    readingStartTime = new Date();
}

function endReading() {
    readingEndTime = new Date();
    const timeSpent = (readingEndTime - readingStartTime) / 1000 / 60; // in minutes
    const actualWPM = readingWords.length / timeSpent;
    updateProgress(actualWPM);

    // Hide 'Done Reading' button and re-enable controls
    doneReadingButton.style.display = 'none';
    startReadingButton.disabled = false;
    topicSelect.disabled = false;
    complexitySelect.disabled = false;
    readingMaterialSelect.disabled = false;

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
            // Re-enable controls after RSVP mode ends
            startReadingButton.disabled = false;
            topicSelect.disabled = false;
            complexitySelect.disabled = false;
            readingMaterialSelect.disabled = false;
            endReading();
        }
    }, interval);
}

function loadQuiz() {
    quizSection.style.display = 'block';
    displayQuizQuestions();
}

function displayQuizQuestions() {
    quizQuestionsDiv.innerHTML = '';
    comprehensionQuestions.forEach((q, index) => {
        const questionDiv = document.createElement('div');
        const questionText = document.createElement('p');
        questionText.innerText = q.questionText;
        questionDiv.appendChild(questionText);

        q.options.forEach((option, i) => {
            const label = document.createElement('label');
            label.style.display = 'block';
            const radio = document.createElement('input');
            radio.type = 'radio';
            radio.name = 'question' + index;
            radio.value = String.fromCharCode(65 + i); // Convert 0 to 'A', 1 to 'B', etc.
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
            const answer = selectedOption.value;
            if (answer === q.correctOption) {
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

    loadCSVData(); // Load the CSV data
};
