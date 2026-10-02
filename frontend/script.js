/* =========================
   1. THE RULES
   Each rule has a label and a test. A test receives the password and
   returns true (passed) or false (failed).
========================= */
const RULES = [
  { label: "At least 8 characters", test: (p) => p.length >= 8 },
  { label: "One uppercase letter",  test: (p) => /[A-Z]/.test(p) },
  { label: "One lowercase letter",  test: (p) => /[a-z]/.test(p) },
  { label: "One number",            test: (p) => /[0-9]/.test(p) },
  { label: "One special symbol",    test: (p) => /[^A-Za-z0-9\s]/.test(p) },
];

/* =========================
   2. PAGE ELEMENTS
========================= */
const input = document.getElementById("password");
const toggleBtn = document.getElementById("toggle");
const clearBtn = document.getElementById("clear");
const rulesList = document.getElementById("rules");
const meterFill = document.getElementById("meterFill");
const strengthLabel = document.getElementById("strengthLabel");
const result = document.getElementById("result");
const statusBtn = document.getElementById("status");
const strengthBox = strengthLabel.closest(".strength");

/* =========================
   3. ANALYSIS (runs only in the browser)
   The password is read from the input, checked, and forgotten.
   It is never saved, logged, or sent anywhere.
========================= */
function checkPassword(password) {
  return RULES.map((rule) => rule.test(password));   // e.g. [true, true, false, true, false]
}

function calculateStrength(results, password) {
  if (password.length === 0) return { level: "empty", score: 0 };
  const score = results.filter(Boolean).length;       // how many rules passed (0-5)
  if (score === RULES.length) return { level: "strong", score };
  if (score >= 3) return { level: "medium", score };
  return { level: "weak", score };
}

/* =========================
   4. UPDATING THE PAGE
========================= */
const MESSAGES = {
  empty:  ["Start typing", "Your password is checked live, right here in your browser."],
  weak:   ["\uD83D\uDD34 Weak password", "It fails several basic requirements. Check the red items above."],
  medium: ["\uD83D\uDFE0 Medium password", "Almost there. Fix the remaining red items to make it strong."],
  strong: ["\uD83D\uDFE2 Strong password", "Your password meets all basic requirements."],
};

function renderRules() {
  RULES.forEach((rule) => {
    const li = document.createElement("li");
    li.className = "rule";
    li.dataset.state = "idle";
    li.innerHTML = '<span class="rule__icon" aria-hidden="true">&middot;</span><span class="rule__text"></span><span class="visually-hidden"></span>';
    li.querySelector(".rule__text").textContent = rule.label;
    rulesList.appendChild(li);
  });
}

function updateRules(results, hasInput) {
  [...rulesList.children].forEach((li, i) => {
    const state = !hasInput ? "idle" : results[i] ? "pass" : "fail";
    li.dataset.state = state;
    li.querySelector(".rule__icon").innerHTML = state === "pass" ? "&#10003;" : state === "fail" ? "&#10005;" : "&middot;";
  });
}

function updateUI() {
  const password = input.value;
  const results = checkPassword(password);
  const { level, score } = calculateStrength(results, password);

  updateRules(results, password.length > 0);

  meterFill.style.transform = `scaleX(${score / RULES.length})`;
  strengthLabel.textContent = level === "empty" ? "\u2014" : level.toUpperCase();
  [meterFill, strengthBox, result].forEach((el) => (el.dataset.level = level));

  result.innerHTML = "<strong></strong><span></span>";
  result.querySelector("strong").textContent = MESSAGES[level][0];
  result.querySelector("span").textContent = MESSAGES[level][1];

  clearBtn.hidden = password.length === 0;
}

/* =========================
   5. BUTTONS
========================= */
input.addEventListener("input", updateUI);

toggleBtn.addEventListener("click", () => {
  const show = input.type === "password";
  input.type = show ? "text" : "password";
  toggleBtn.textContent = show ? "Hide" : "Show";
  toggleBtn.setAttribute("aria-pressed", String(show));
  input.focus();
});

clearBtn.addEventListener("click", () => {
  input.value = "";
  input.type = "password";
  toggleBtn.textContent = "Show";
  toggleBtn.setAttribute("aria-pressed", "false");
  updateUI();
  input.focus();
});

/* =========================
   6. TALKING TO THE FLASK BACKEND
   This demonstrates frontend -> backend communication.
   NO password is sent: these are plain GET requests with no data.
========================= */
async function checkBackend() {
  const base = window.APP_CONFIG.API_BASE_URL.replace(/\/$/, "");   // remove a trailing slash if present
  setStatus("checking", "Connecting to server\u2026");

  // A free Render server can take up to a minute to wake up, so allow 60 seconds.
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 60000);

  try {
    const health = await fetchJson(`${base}/api/health`, controller.signal);
    const info = await fetchJson(`${base}/api/info`, controller.signal);
    setStatus("online", `${info.name} API online \u00B7 v${info.version} (${health.status})`);
  } catch (error) {
    setStatus("offline", "Server offline. The analyzer still works. Click to retry.");
  } finally {
    clearTimeout(timer);
  }
}

async function fetchJson(url, signal) {
  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

function setStatus(state, text) {
  statusBtn.dataset.state = state;
  statusBtn.textContent = text;
}

statusBtn.addEventListener("click", checkBackend);

/* =========================
   7. START
========================= */
renderRules();
updateUI();
checkBackend();
