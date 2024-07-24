import fetchNewParagraph from './fetchNewParagraph.js';

export const paragraphs = [];
const paragraphText = await fetchText();
paragraphs.push(paragraphText.join(' '));
const typingText = document.querySelector('.typing-text p');
const inpField = document.querySelector('.wrapper .input-field');
const tryAgainBtn = document.querySelector('#try-again-btn');
const timeTag = document.querySelector('.time span b');
const wpmTag = document.querySelector('.wpm span');
const accuracyTag = document.querySelector('.accuracy span');
const bestWPMTag = document.getElementById('best-wpm');
const highestAccuracyTag = document.getElementById('highest-accuracy');
const statsBtn = document.querySelector('#stats-btn');

let timer;
let maxTime = 60;
let timeLeft = maxTime;
let charIndex = 0;
let isTyping = 0;
let totalWords = 0;
let correctWords = 0;

const prevBestWPM = parseInt(localStorage.getItem('prevBestWPM')) || '';
const prevBestAccuracy =
    parseInt(localStorage.getItem('prevBestAccuracy')) || '';

async function loadParagraph() {
    const newParagraph = await fetchNewParagraph();
    const typingText = document.querySelector('.typing-text p');
    typingText.innerHTML = '';
    newParagraph.split('').forEach(char => {
        let span = `<span>${char}</span>`;
        typingText.innerHTML += span;
    });
    typingText.querySelectorAll('span')[0].classList.add('active');
    document.addEventListener('keydown', () => inpField.focus());
}

async function fetchText() {
    try {
        const response = await fetch(
            'https://random-word-api.vercel.app/api?words=100'
        );
        const data = await response.json();
        return data;
    } catch (err) {
        console.log(err);
        return [];
    }
}

function resetGame() {
    initTyping();
    clearInterval(timer);
    charIndex = 0; // Reset charIndex to 0
    isTyping = 0;
    totalWords = 0;
    correctWords = 0;
    maxTime = 60;
    timeLeft = maxTime;
    inpField.value = '';
    timeTag.innerText = maxTime;
    wpmTag.innerText = 0;
    accuracyTag.innerText = 0;
    const characters = typingText.querySelectorAll('span');
    characters.forEach(char => {
        char.classList.remove('correct', 'incorrect', 'active');
    });
    characters[0].classList.add('active');
}

document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
        resetGame();
        loadParagraph();
    } else if (event.key === 'Enter') {
        resetGame();
    }
});

statsBtn.addEventListener('click', () => {
    if (
        localStorage.getItem('prevBestWPM') ||
        localStorage.getItem('prevBestAccuracy')
    ) {
        localStorage.removeItem('prevBestWPM');
        localStorage.removeItem('prevBestAccuracy');

        bestWPMTag.innerText = 'Best WPM: ';
        highestAccuracyTag.innerText = 'Highest Accuracy: ';
    }
});

function initTyping() {
    let characters = typingText.querySelectorAll('span');
    let typedChar = inpField.value.split('')[charIndex];
    if (charIndex < characters.length - 1 && timeLeft > 0) {
        if (!isTyping) {
            timer = setInterval(initTimer, 1000);
            isTyping = true;
        }
        if (typedChar == null) {
            if (charIndex > 0) {
                charIndex--;
                characters[charIndex].classList.remove('correct', 'incorrect');
            }
        } else {
            if (characters[charIndex].innerText == typedChar) {
                characters[charIndex].classList.add('correct');
            } else {
                characters[charIndex].classList.add('incorrect');
            }
            charIndex++;

            if (typedChar === ' ' && charIndex > 0) {
                let typedWords = inpField.value.trim().split(' ');
                let paragraphWords = typingText.innerText.trim().split(' ');
                totalWords++;
                if (
                    typedWords[totalWords - 1] ===
                    paragraphWords[totalWords - 1]
                ) {
                    correctWords++;
                }
            }
        }
        characters.forEach(span => span.classList.remove('active'));
        characters[charIndex].classList.add('active');

        let accuracy = calculateAccuracy();
        accuracyTag.innerText = accuracy + '%';
    } else {
        clearInterval(timer);
        saveAndDisplayScores();
    }
}

function initTimer() {
    if (timeLeft > 0) {
        timeLeft--;
        timeTag.innerText = timeLeft;
        let wpm = Math.round((charIndex / 5 / (maxTime - timeLeft)) * 60);
        wpmTag.innerText = wpm;
    } else {
        clearInterval(timer);
        saveAndDisplayScores();
    }
}

function calculateAccuracy() {
    let correctWordsSpan = typingText.querySelectorAll('span.correct').length;
    let incorrectWordsSpan =
        typingText.querySelectorAll('span.incorrect').length;
    let totalTypedWords = correctWordsSpan + incorrectWordsSpan;

    let accuracy = 0;
    if (totalTypedWords > 0) {
        accuracy = Math.round((correctWordsSpan / totalTypedWords) * 100);
    }
    return accuracy;
}

function saveAndDisplayScores() {
    bestWPMTag.innerText = `Best WPM: ${
        localStorage.getItem('prevBestWPM') || 0
    }`;
    highestAccuracyTag.innerText = `Highest Accuracy: ${
        localStorage.getItem('prevBestAccuracy') || 0
    }%`;

    const currentWPM = parseInt(wpmTag.innerText);
    const currentAccuracy = parseInt(accuracyTag.innerText);

    const prevBestWPM = parseInt(localStorage.getItem('prevBestWPM')) || 0;
    const prevBestAccuracy =
        parseInt(localStorage.getItem('prevBestAccuracy')) || 0;

    if (currentWPM > prevBestWPM) {
        localStorage.setItem('prevBestWPM', currentWPM);
        bestWPMTag.innerText = `Best WPM: ${currentWPM}`;
    }

    if (currentAccuracy > prevBestAccuracy) {
        localStorage.setItem('prevBestAccuracy', currentAccuracy);
        highestAccuracyTag.innerText = `Highest Accuracy: ${currentAccuracy}%`;
    }
}

loadParagraph();
inpField.addEventListener('input', initTyping);
tryAgainBtn.addEventListener('click', resetGame);
saveAndDisplayScores();
