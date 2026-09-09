const questions = [
  { label: 'Mood', text: 'I could notice hopeful, cheerful or enjoyable moments.' },
  { label: 'Calm', text: 'I felt calm enough to manage ordinary daily stress.' },
  { label: 'Energy', text: 'I had enough energy for my usual tasks and routines.' },
  { label: 'Rest', text: 'My sleep helped me feel rested or restored.' },
  { label: 'Interest', text: 'Everyday activities felt meaningful or interesting to me.' }
];
const answerOptions = [
  { label: 'All of the time', value: 5 },
  { label: 'Most of the time', value: 4 },
  { label: 'More than half the time', value: 3 },
  { label: 'Less than half the time', value: 2 },
  { label: 'Some of the time', value: 1 },
  { label: 'At no time', value: 0 }
];
let currentQuestion = 0;
const answers = Array(questions.length).fill(null);
const form = document.querySelector('#wellbeing-form');
const fieldset = document.querySelector('#question-fieldset');
const questionText = document.querySelector('#question-text');
const questionCount = document.querySelector('#question-count');
const answerList = document.querySelector('#answer-list');
const progressBar = document.querySelector('#progress-bar');
const nextButton = document.querySelector('#next-button');
const backButton = document.querySelector('#back-button');
const formStatus = document.querySelector('#form-status');
const resultPanel = document.querySelector('#result-panel');

function renderQuestion() {
  const question = questions[currentQuestion];
  questionText.textContent = question.text;
  questionCount.textContent = `Question ${currentQuestion + 1} of ${questions.length}`;
  progressBar.style.width = `${((currentQuestion + 1) / questions.length) * 100}%`;
  answerList.innerHTML = '';
  answerOptions.forEach((option) => {
    const label = document.createElement('label');
    label.className = 'answer-option';
    const input = document.createElement('input');
    input.type = 'radio';
    input.name = `question-${currentQuestion}`;
    input.value = String(option.value);
    input.checked = answers[currentQuestion] === option.value;
    input.addEventListener('change', () => {
      answers[currentQuestion] = option.value;
      nextButton.disabled = false;
      formStatus.textContent = '';
    });
    const span = document.createElement('span');
    span.textContent = option.label;
    label.append(input, span);
    answerList.append(label);
  });
  backButton.style.visibility = currentQuestion === 0 ? 'hidden' : 'visible';
  nextButton.disabled = answers[currentQuestion] === null;
  nextButton.textContent = currentQuestion === questions.length - 1 ? 'See my reflection' : 'Next question';
}

function getResultMessage(score) {
  if (score < 40) return { title: 'You may be running low right now.', copy: 'Your answers show fewer moments of ease, energy or interest recently. Consider telling someone you trust and speaking with a counsellor or mental-health professional.' };
  if (score < 70) return { title: 'Your wellbeing looks mixed.', copy: 'Some parts of the last two weeks may have felt manageable while others took more from you. Notice the lower areas below and choose one kind next step.' };
  return { title: 'There are signs of steadiness.', copy: 'Your answers suggest several supportive moments across the last two weeks. Keep noticing what helps—and remember that a higher score never means you must handle hard moments alone.' };
}

function showResult() {
  const total = answers.reduce((sum, value) => sum + value, 0);
  const score = Math.round((total / 25) * 100);
  const message = getResultMessage(score);
  form.hidden = true;
  resultPanel.hidden = false;
  document.querySelector('#score-value').textContent = String(score);
  const ring = document.querySelector('#score-ring');
  ring.style.background = `conic-gradient(var(--red) ${score}%, #231a1b ${score}%)`;
  ring.setAttribute('aria-label', `Wellbeing reflection score ${score} out of 100`);
  document.querySelector('#result-title').textContent = message.title;
  document.querySelector('#result-copy').textContent = message.copy;
  const bars = document.querySelector('#portrait-bars');
  bars.innerHTML = '';
  questions.forEach((question, index) => {
    const percent = answers[index] * 20;
    const row = document.createElement('div');
    row.className = 'portrait-row';
    row.innerHTML = `<span>${question.label}</span><div class="portrait-track"><i style="width:${percent}%"></i></div><b>${percent}</b>`;
    bars.append(row);
  });
  resultPanel.focus();
}

nextButton.addEventListener('click', () => {
  if (answers[currentQuestion] === null) { formStatus.textContent = 'Choose the answer that feels closest before continuing.'; return; }
  if (currentQuestion < questions.length - 1) {
    currentQuestion += 1;
    renderQuestion();
    fieldset.scrollIntoView({ behavior: 'smooth', block: 'center' });
  } else showResult();
});
backButton.addEventListener('click', () => { if (currentQuestion > 0) { currentQuestion -= 1; renderQuestion(); } });
document.querySelector('#retake-button').addEventListener('click', () => {
  answers.fill(null);
  currentQuestion = 0;
  resultPanel.hidden = true;
  form.hidden = false;
  renderQuestion();
  document.querySelector('#survey-card').scrollIntoView({ behavior: 'smooth', block: 'center' });
});

const copyButton = document.querySelector('#copy-message');
const copyStatus = document.querySelector('#copy-status');
const messageText = document.querySelector('#message-text');
copyButton.addEventListener('click', async () => {
  const message = messageText.textContent.replace(/[“”]/g, '');
  try { await navigator.clipboard.writeText(message); copyStatus.textContent = 'Copied. Send it to someone you trust.'; }
  catch { copyStatus.textContent = 'Select the message above and copy it.'; }
});

const breathButton = document.querySelector('#breath-toggle');
const orbit = document.querySelector('#breath-orbit');
const breathWord = document.querySelector('#breath-word');
const breathTime = document.querySelector('#breath-time');
const breathInstruction = document.querySelector('#breath-instruction');
let timerId = null;
let remaining = 60;
function formatTime(seconds) { return `0:${String(seconds).padStart(2, '0')}`; }
function updateBreath() {
  const phase = (60 - remaining) % 10;
  orbit.classList.add('active');
  if (phase < 4) { orbit.classList.add('inhale'); orbit.classList.remove('exhale'); breathWord.textContent = 'Breathe in'; breathInstruction.textContent = 'Slow and easy. No need for a very deep breath.'; }
  else if (phase < 6) { orbit.classList.remove('inhale', 'exhale'); breathWord.textContent = 'Pause'; breathInstruction.textContent = 'Let your shoulders soften.'; }
  else { orbit.classList.add('exhale'); orbit.classList.remove('inhale'); breathWord.textContent = 'Breathe out'; breathInstruction.textContent = 'Let the exhale take its own time.'; }
  breathTime.textContent = formatTime(remaining);
}
function stopBreathing(completed = false) {
  clearInterval(timerId); timerId = null; orbit.classList.remove('active', 'inhale', 'exhale'); breathButton.textContent = 'Start 60-second pause'; breathWord.textContent = completed ? 'You paused' : 'Ready'; breathTime.textContent = completed ? 'Complete' : '1:00'; breathInstruction.textContent = completed ? 'Notice one small thing you need next.' : 'Place both feet on the floor if you can.'; remaining = 60;
}
breathButton.addEventListener('click', () => {
  if (timerId) { stopBreathing(); return; }
  breathButton.textContent = 'Stop pause'; updateBreath();
  timerId = setInterval(() => { remaining -= 1; if (remaining <= 0) { stopBreathing(true); return; } updateBreath(); }, 1000);
});
renderQuestion();
