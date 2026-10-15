
const questions = [
  {
    category: "HTML",
    question: "What does HTML stand for?",
    options: [
      "Hyper Text Markup Language",
      "High Text Machine Language",
      "Hyper Transfer Making Language",
      "Home Tool Markup Language"
    ],
    answer: 0
  },
  {
    category: "CSS",
    question: "Which language is used to style a web page?",
    options: ["Python", "CSS", "SQL", "Java"],
    answer: 1
  },
  {
    category: "JavaScript",
    question: "Which keyword declares a block-scoped variable that can be reassigned?",
    options: ["const", "static", "let", "fixed"],
    answer: 2
  },
  {
    category: "HTML",
    question: "Which HTML tag creates a hyperlink?",
    options: ["<link>", "<a>", "<href>", "<url>"],
    answer: 1
  },
  {
    category: "CSS",
    question: "Which CSS property changes the text color?",
    options: ["font-style", "background", "text-size", "color"],
    answer: 3
  },
  {
    category: "JavaScript",
    question: "Which symbol is commonly used for a single-line comment in JavaScript?",
    options: ["//", "<!--", "**", "##"],
    answer: 0
  },
  {
    category: "HTML",
    question: "Which tag is used for the largest standard HTML heading?",
    options: ["<head>", "<h6>", "<h1>", "<heading>"],
    answer: 2
  },
  {
    category: "JavaScript",
    question: "Which method selects an element by its ID?",
    options: [
      "document.querySelectorAll()",
      "document.getElementById()",
      "document.getElementsByTag()",
      "document.findId()"
    ],
    answer: 1
  },
  {
    category: "CSS",
    question: "Which CSS layout system is designed for one-dimensional layouts?",
    options: ["Flexbox", "SQL", "HTML", "JSON"],
    answer: 0
  },
  {
    category: "Web Basics",
    question: "Which protocol is commonly used to load secure websites?",
    options: ["FTP only", "HTTP only", "SMTP", "HTTPS"],
    answer: 3
  }
];

const EXAM_DURATION = 5 * 60;

const $ = (id) => document.getElementById(id);

const welcomeScreen = $("welcomeScreen");
const examScreen = $("examScreen");
const resultScreen = $("resultScreen");
const startForm = $("startForm");
const studentNameInput = $("studentName");
const timerElement = $("timer");
const confirmDialog = $("confirmDialog");

let studentName = "";
let currentQuestion = 0;
let answers = [];
let timeLeft = EXAM_DURATION;
let timerInterval = null;
let examActive = false;
let submitted = false;

function startExam(event) {
  event.preventDefault();

  const enteredName = studentNameInput.value.trim();
  if (!enteredName) {
    studentNameInput.focus();
    return;
  }

  studentName = enteredName;
  currentQuestion = 0;
  answers = Array(questions.length).fill(null);
  timeLeft = EXAM_DURATION;
  examActive = true;
  submitted = false;

  welcomeScreen.hidden = true;
  resultScreen.hidden = true;
  examScreen.hidden = false;

  $("welcomeStudent").textContent = `Student: ${studentName}`;
  renderNavigator();
  renderQuestion();
  updateProgress();
  updateTimerDisplay();

  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    if (!examActive) return;

    timeLeft -= 1;
    updateTimerDisplay();

    if (timeLeft <= 0) {
      finishExam(true);
    }
  }, 1000);
}

function renderQuestion() {
  const question = questions[currentQuestion];

  $("questionCounter").textContent =
    `Question ${currentQuestion + 1} of ${questions.length}`;

  $("questionCategory").textContent =
    `${question.category.toUpperCase()} · QUESTION ${String(currentQuestion + 1).padStart(2, "0")}`;

  $("questionText").textContent = question.question;

  const optionsContainer = $("options");
  optionsContainer.replaceChildren();

  question.options.forEach((optionText, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "option";
    button.classList.toggle("selected", answers[currentQuestion] === index);
    button.setAttribute("aria-pressed", String(answers[currentQuestion] === index));

    const letter = document.createElement("span");
    letter.className = "option-letter";
    letter.textContent = String.fromCharCode(65 + index);

    const text = document.createElement("span");
    text.textContent = optionText;

    button.append(letter, text);
    button.addEventListener("click", () => {
      if (!examActive) return;

      answers[currentQuestion] = index;
      renderQuestion();
      renderNavigator();
      updateProgress();
    });

    optionsContainer.appendChild(button);
  });

  $("previousBtn").disabled = currentQuestion === 0;
  $("previousBtn").style.opacity = currentQuestion === 0 ? "0.5" : "1";

  $("nextBtn").textContent =
    currentQuestion === questions.length - 1 ? "Last Question" : "Next →";

  renderNavigator();
}

function renderNavigator() {
  const nav = $("questionNav");
  nav.replaceChildren();

  questions.forEach((question, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "nav-number";
    button.textContent = String(index + 1);

    if (answers[index] !== null) {
      button.classList.add("answered");
    }

    if (index === currentQuestion) {
      button.classList.add("current");
      button.setAttribute("aria-current", "step");
    }

    button.setAttribute("aria-label",
      `Question ${index + 1}${answers[index] !== null ? ", answered" : ", unanswered"}`);

    button.addEventListener("click", () => {
      if (!examActive) return;
      currentQuestion = index;
      renderQuestion();
    });

    nav.appendChild(button);
  });
}

function updateProgress() {
  const answeredCount = answers.filter(answer => answer !== null).length;

  $("answeredCounter").textContent = `${answeredCount} answered`;

  $("progressBar").style.width =
    `${((currentQuestion + 1) / questions.length) * 100}%`;
}

function updateTimerDisplay() {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  timerElement.textContent =
    `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  $("timer").parentElement.classList.toggle("urgent", timeLeft <= 60);
}

function goPrevious() {
  if (!examActive || currentQuestion === 0) return;
  currentQuestion -= 1;
  renderQuestion();
}

function goNext() {
  if (!examActive || currentQuestion >= questions.length - 1) return;
  currentQuestion += 1;
  renderQuestion();
}

function requestSubmit() {
  if (!examActive) return;

  const unanswered = answers.filter(answer => answer === null).length;
  $("confirmText").textContent = unanswered > 0
    ? `You have ${unanswered} unanswered question(s). Submit anyway?`
    : "You have answered every question. Are you ready to submit?";

  if (typeof confirmDialog.showModal === "function") {
    confirmDialog.showModal();
  } else if (window.confirm($("confirmText").textContent)) {
    finishExam(false);
  }
}

function finishExam(timeExpired) {
  if (!examActive || submitted) return;

  examActive = false;
  submitted = true;
  clearInterval(timerInterval);
  confirmDialog.close();

  const correctCount = questions.reduce((total, question, index) => {
    return total + (answers[index] === question.answer ? 1 : 0);
  }, 0);

  const wrongCount = answers.reduce((total, answer, index) => {
    return total + (answer !== null && answer !== questions[index].answer ? 1 : 0);
  }, 0);

  const unansweredCount = answers.filter(answer => answer === null).length;
  const percentage = Math.round((correctCount / questions.length) * 100);

  examScreen.hidden = true;
  welcomeScreen.hidden = true;
  resultScreen.hidden = false;

  $("resultStudent").textContent = `Result for ${studentName}`;
  $("scorePercent").textContent = `${percentage}%`;
  $("correctCount").textContent = correctCount;
  $("wrongCount").textContent = wrongCount;
  $("unansweredCount").textContent = unansweredCount;
  $("resultHeading").textContent =
    percentage >= 80 ? "Excellent work!" :
    percentage >= 50 ? "Good effort!" : "Keep practicing!";

  $("resultMessage").textContent = timeExpired
    ? "Time is up. Your answers have been submitted automatically."
    : `You scored ${correctCount} out of ${questions.length}. Each question carries 10 marks.`;

  $("resultIcon").textContent = percentage >= 50 ? "✓" : "↗";

  const review = $("answerReview");
  review.replaceChildren();

  questions.forEach((question, index) => {
    const isCorrect = answers[index] === question.answer;
    const item = document.createElement("article");
    item.className = "review-item";

    const title = document.createElement("strong");
    title.textContent = `${index + 1}. ${question.question}`;

    const yourAnswer = document.createElement("p");
    yourAnswer.textContent = answers[index] === null
      ? "Your answer: Not answered"
      : `Your answer: ${question.options[answers[index]]}`;
    yourAnswer.className = isCorrect ? "correct-text" : "wrong-text";

    const correctAnswer = document.createElement("p");
    correctAnswer.textContent = `Correct answer: ${question.options[question.answer]}`;
    correctAnswer.className = "correct-text";

    item.append(title, yourAnswer, correctAnswer);
    review.appendChild(item);
  });

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function restartExam() {
  clearInterval(timerInterval);
  examActive = false;
  submitted = false;

  resultScreen.hidden = true;
  examScreen.hidden = true;
  welcomeScreen.hidden = false;

  studentNameInput.value = studentName;
  studentNameInput.focus();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

startForm.addEventListener("submit", startExam);
$("previousBtn").addEventListener("click", goPrevious);
$("nextBtn").addEventListener("click", goNext);
$("submitBtn").addEventListener("click", requestSubmit);
$("cancelSubmitBtn").addEventListener("click", () => confirmDialog.close());
$("confirmSubmitBtn").addEventListener("click", () => finishExam(false));
$("restartBtn").addEventListener("click", restartExam);

confirmDialog.addEventListener("cancel", event => {
  if (!examActive) event.preventDefault();
});
