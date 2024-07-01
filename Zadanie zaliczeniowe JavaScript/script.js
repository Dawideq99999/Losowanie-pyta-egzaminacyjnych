//Mateusz Burek
//Dawid Dłubacz 14445
// Czekamy na załadowanie DOM, a następnie wczytujemy uczestników i pytania
document.addEventListener('DOMContentLoaded', () => {
    loadParticipants();
    loadQuestions();
});

// Inicjalizujemy zmienne globalne
let questions = []; // Lista pytań
let currentQuestion = null; // Aktualnie wybrane pytanie
const drawnQuestions = new Set(); // Zestaw przechowujący wylosowane pytania
const participantsScores = {}; // Obiekt przechowujący wyniki uczestników

// Funkcja do losowania pytania
function drawQuestion() {
    const participantSelect = document.getElementById('participant-select');
    const selectedParticipant = participantSelect.value;
    const participantDiv = document.getElementById('participant');
    const questionDiv = document.getElementById('drawn-question');
    const answerSection = document.getElementById('answer-section');
    const resultDiv = document.getElementById('result');

    resultDiv.textContent = '';

    // Sprawdzamy, czy wybrano uczestnika
    if (!selectedParticipant) {
        alert("Proszę wybrać uczestnika.");
        return;
    }

    // Debugowanie: sprawdzamy liczbę wylosowanych pytań i całkowitą liczbę pytań
    console.log('Drawn questions size:', drawnQuestions.size);
    console.log('Total questions:', questions.length);

    // Sprawdzamy, czy wylosowano już wszystkie pytania
    if (drawnQuestions.size === questions.length) {
        questionDiv.textContent = "Wszystkie pytania zostały wylosowane.";
        return;
    }

    // Losujemy nowe pytanie, które nie zostało jeszcze wylosowane
    let questionObj;
    do {
        questionObj = questions[Math.floor(Math.random() * questions.length)];
    } while (drawnQuestions.has(questionObj.question));

    // Debugowanie: sprawdzamy wylosowane pytanie
    console.log('Drawn question:', questionObj);

    // Dodajemy wylosowane pytanie do zestawu wylosowanych pytań
    drawnQuestions.add(questionObj.question);
    currentQuestion = questionObj;

    // Wyświetlamy pytanie i informacje o uczestniku
    participantDiv.textContent = `Uczestnik: ${selectedParticipant}`;
    questionDiv.textContent = `Pytanie: ${questionObj.question}`;
    answerSection.style.display = 'block';
}

// Funkcja do sprawdzania odpowiedzi
function checkAnswer() {
    const answerInput = document.getElementById('answer-input').value.trim();
    const resultDiv = document.getElementById('result');
    const participantSelect = document.getElementById('participant-select');
    const selectedParticipant = participantSelect.value;

    // Sprawdzamy, czy wpisano odpowiedź
    if (currentQuestion && answerInput) {
        // Porównujemy odpowiedź z poprawną odpowiedzią
        if (answerInput.toLowerCase() === currentQuestion.answer.toLowerCase()) {
            resultDiv.textContent = "Poprawna odpowiedź!";
            resultDiv.style.color = "green";
            updateScore(selectedParticipant, true);
        } else {
            resultDiv.textContent = `Niepoprawna odpowiedź. Poprawna odpowiedź to: ${currentQuestion.answer}`;
            resultDiv.style.color = "red";
            updateScore(selectedParticipant, false);
        }
        displayScores();
    } else {
        alert("Proszę wpisać odpowiedź.");
    }
}

// Funkcja do aktualizowania wyniku uczestnika
function updateScore(participant, isCorrect) {
    // Sprawdzamy, czy uczestnik jest już w obiekcie scores
    if (!participantsScores[participant]) {
        participantsScores[participant] = { correct: 0, incorrect: 0 };
    }
    // Aktualizujemy liczbę poprawnych lub błędnych odpowiedzi
    if (isCorrect) {
        participantsScores[participant].correct += 1;
    } else {
        participantsScores[participant].incorrect += 1;
    }
}

// Funkcja do wyświetlania wyników
function displayScores() {
    const scoresDiv = document.getElementById('scores');
    scoresDiv.innerHTML = '<h2>Wyniki:</h2>';
    // Iterujemy po uczestnikach i wyświetlamy ich wyniki
    for (const participant in participantsScores) {
        const score = participantsScores[participant];
        scoresDiv.innerHTML += `<p>${participant}: Poprawne  ${score.correct}, Błędne  ${score.incorrect}</p>`;
    }
}

// Funkcja do wczytywania uczestników z pliku CSV
function loadParticipants() {
    fetch('participants.csv')
        .then(response => response.text())
        .then(data => {
            const participants = parseCSV(data);
            populateParticipantSelect(participants);
        });
}

// Funkcja do wczytywania pytań z pliku CSV
function loadQuestions() {
    fetch('questions.csv')
        .then(response => response.text())
        .then(data => {
            questions = parseCSV(data, true);
            console.log('Loaded questions:', questions); 
        })
        .catch(error => {
            console.error('Error loading questions:', error);
        });
}

// Funkcja do parsowania pliku CSV
function parseCSV(data, isQuestionFile = false) {
    const lines = data.split('\n').filter(line => line.trim() !== '');
    if (isQuestionFile) {
        return lines.map(line => {
            const [question, answer] = line.split(' - ');
            return { question: question.trim(), answer: answer.trim() };
        }).filter(line => line.question && line.answer);
    } else {
        return lines.slice(1).map(line => line.trim()).filter(line => line.length > 0);
    }
}

// Funkcja do populacji listy wyboru uczestników
function populateParticipantSelect(participants) {
    const participantSelect = document.getElementById('participant-select');
    participantSelect.innerHTML = ''; // Czyszczenie obecnych opcji
    participants.forEach(participant => {
        const option = document.createElement('option');
        option.value = participant;
        option.textContent = participant;
        participantSelect.appendChild(option);
    });
}
