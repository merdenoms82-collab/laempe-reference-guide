// app.js
// Laempe Reference Guide v1 — Search + Troubleshooting Upgrade (offline KB)
// NOTE: Layout/UI is untouched. This file only adds KB content + search behavior + troubleshooting content.

// ===== DOM =====
const homeView = document.getElementById("homeView");
const detailView = document.getElementById("detailView");
const searchView = document.getElementById("searchView");
const dynamicContent = document.getElementById("dynamicContent");

const detailTitle = document.getElementById("detailTitle");
const detailSub = document.getElementById("detailSub");

const openSearch = document.getElementById("openSearch");
const closeSearch = document.getElementById("closeSearch");
const backBtn = document.getElementById("backBtn");

const searchInput = document.getElementById("searchInput");
const searchResults = document.getElementById("searchResults");

// Bottom Sheet
const sheetOverlay = document.getElementById("sheetOverlay");
const bottomSheet = document.getElementById("bottomSheet");
const sheetTitle = document.getElementById("sheetTitle");
const sheetWhat = document.getElementById("sheetWhat");
const sheetIncrease = document.getElementById("sheetIncrease");
const sheetDecrease = document.getElementById("sheetDecrease");
const sheetNote = document.getElementById("sheetNote");
const sheetNoteContainer = document.getElementById("sheetNoteContainer");
const effectRow = document.getElementById("effectRow");
const sheetDivider = document.getElementById("sheetDivider");
const sheetLabelWhat = document.getElementById("sheetLabelWhat");

// ===== FEEDBACK LINK =====
const FEEDBACK_URL =
  "https://docs.google.com/forms/d/1Y8y6EhBOFtrcyOM9H0jcpygWUcnXNGvgO_4v4O_Uj3U/viewform";

const FEEDBACK_FALLBACK_EMAIL =
  "mailto:REPLACE_ME@company.com?subject=Laempe%20Guide%20Feedback";

// ==========================================================
// SMALL UTILS (safe, offline)
// ==========================================================
function escHtml(s){
  return String(s ?? "")
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}

function normalizeText(s){
  return String(s || "")
    .toLowerCase()
    .replace(/['’]/g,"")
    .replace(/[^a-z0-9\s]/g," ")
    .replace(/\s+/g," ")
    .trim();
}

function tokenize(s){
  const t = normalizeText(s);
  return t ? t.split(" ").filter(Boolean) : [];
}

function editDistance(a,b){
  a = normalizeText(a);
  b = normalizeText(b);
  const al=a.length, bl=b.length;
  if (!al) return bl;
  if (!bl) return al;

  const dp = Array.from({length: al+1}, ()=>Array(bl+1).fill(0));
  for (let i=0;i<=al;i++) dp[i][0]=i;
  for (let j=0;j<=bl;j++) dp[0][j]=j;

  for (let i=1;i<=al;i++){
    for (let j=1;j<=bl;j++){
      const cost = a[i-1]===b[j-1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i-1][j] + 1,
        dp[i][j-1] + 1,
        dp[i-1][j-1] + cost
      );
    }
  }
  return dp[al][bl];
}

function tokenOverlapScore(query, haystack){
  const q = tokenize(query);
  const h = new Set(tokenize(haystack));
  let score = 0;
  for (const w of q){
    if (h.has(w)) score += 2;
    else {
      // prefix match helps "clamp" vs "clamping"
      for (const tk of h){
        if (tk.startsWith(w) && w.length >= 3){ score += 1; break; }
      }
    }
  }
  return score;
}

// ===== PARAM DEFINITIONS =====
// GASSING (mirrors HMI labels + order)
const GASSING_PARAMS = {
  numGassings: {
    name: "Number of gassings",
    what: "How many times amine gas is injected during one curing cycle.",
    increase:
      "May improve cure penetration on complex cores. Increases total cycle time/exposure.",
    decrease: "May reduce cure strength on thick sections. Shorter cycle.",
    note: "Pending confirmation: verify best practice for your jobs.",
  },
  fillingPressure: {
    name: "Filling pressure [bar]",
    what: "Air pressure used during the fill/blow phase before gassing.",
    increase: "May pack sand harder (risk: overpack/venting issues).",
    decrease: "May reduce packing (risk: incomplete fill).",
    note: "Pending confirmation (your site commonly runs this near 0; some operators set pressure ~1).",
  },
  fillingTime: {
    name: "Filling time [s]",
    what: "How long the fill/blow phase runs before gassing.",
    increase: "May increase packing (risk: overfill/vent issues).",
    decrease: "May reduce packing (risk: incomplete fill).",
    note: "Pending confirmation (your site commonly runs this near 0; some operators set time ~2).",
  },
  gassingPressure: {
    name: "Gassing pressure [bar]",
    what: "Pressure used to inject gas into the core during curing.",
    increase: "Stronger penetration (risk: vent marks/holes if too aggressive).",
    decrease: "Reduced penetration (risk: under-cure).",
    note: "Pending confirmation: define safe ranges for your core families.",
  },
  gassingTime: {
    name: "Gassing time [s]",
    what: "How long gas flows into the core (primary cure exposure).",
    increase:
      "Harder cure and longer cycle. Too high can cause holes/marks near vents on some jobs.",
    decrease: "Risk of under-cure and soft cores.",
    note: "",
  },
  timeToFinalPressure: {
    name: "Time to final pressure [s]",
    what: "Ramp time from start to full gassing pressure.",
    increase: "Slower ramp; gentler pressure buildup.",
    decrease: "Faster ramp; more aggressive pressure buildup.",
    note: "Pending confirmation: operators use this for complex cores, but exact effect should be verified.",
  },
  postHardening: {
    name: "Post-hardening time [s]",
    what: "Extra time the core stays clamped after gassing stops.",
    increase: "More stabilization time before opening.",
    decrease:
      "Less stabilization time; may increase breakage risk on fragile cores.",
    note: "Pending confirmation (usage varies).",
  },
  gasExhaust: {
    name: "Gas exhaust time valve [s]",
    what: "How long exhaust valve stays open to clear residual gas after gassing.",
    increase: "Less smell/residual gas; increases cycle time.",
    decrease: "Faster cycle; may leave residual gas/odor.",
    note: "Operators use this to reduce smell/odor. Verify site policy.",
  },
  preHeating: {
    name: "Pre-heating time [s]",
    what: "Time allowed for the gas generator to reach operating temperature before running.",
    increase: "More stable generation (useful for cold starts/cold conditions).",
    decrease: "Faster start; may reduce stability on startup.",
    note: "Pending confirmation: commonly used when box/conditions are cold.",
  },
};

// MACHINE (Shot Parameters — mirrors HMI labels + order)
const MACHINE_PARAMS = {
  numberOfShots: {
    name: "Number of shots",
    what: "How many sand blows occur per cycle.",
    increase:
      "Longer cycle; may improve fill on complex shapes (risk: overfill).",
    decrease: "Shorter cycle; risk: incomplete fill.",
    note: "Pending confirmation: common practice varies by job.",
  },
  shootingPressure: {
    name: "Shooting pressure [bar]",
    what: "Air pressure used to blow sand into the corebox.",
    increase: "Risk: flashing/venting issues if too high.",
    decrease: "Risk: incomplete fill if too low.",
    note: "Pending confirmation.",
  },
  shootingTime: {
    name: "Shooting time [s]",
    what: "Duration of the sand blow.",
    increase: "May overpack; increases cycle time.",
    decrease: "Risk: incomplete cavity fill.",
    note: "Pending confirmation.",
  },
  exhaustTimeCorebox: {
    name: "Exhaust time corebox [s]",
    what: "Time the corebox exhaust remains open after shooting.",
    increase: "More venting; increases cycle time.",
    decrease: "Risk: trapped air / uneven fill.",
    note: "Pending confirmation.",
  },
  exhaustTimeValve: {
    name: "Exhaust time valve [s]",
    what: "Duration of valve exhaust after shooting.",
    increase: "More venting; increases cycle time.",
    decrease: "Risk: incomplete venting.",
    note: "Pending confirmation.",
  },
  sandRefillInterval: {
    name: "Sand refill interval",
    what: "How frequently automatic sand refills occur.",
    increase: "Refills less often (risk: hopper runs low).",
    decrease: "Refills more often (adds extra cycling).",
    note: "Pending confirmation.",
  },
  sandRefillTime1: {
    name: "Sand refill time 1 [s]",
    what: "Primary refill duration.",
    increase: "Longer refill; increases refill time.",
    decrease: "Shorter refill; risk of low sand.",
    note: "Pending confirmation.",
  },
  sandRefillTime2: {
    name: "Sand refill time 2 [s]",
    what: "Secondary refill duration (if used).",
    increase: "Longer refill; increases refill time.",
    decrease: "Shorter refill; may not complete refill.",
    note: "Pending confirmation.",
  },
  remainingShotsCounter: {
    name: "Remaining shots counter",
    what: "Displays remaining programmed shot count.",
    increase: "",
    decrease: "",
    note: "Display only.",
  },
};

// ===== BOTTOM-SHEET ONLY SCREENS =====
const SCREEN_SHEETS = {
  pneu: {
    whatLabel: "PNEU",
    what: [
      "Sensor 41 — Corebox / Part Removal Detection",
      "Sensor 51 — Machine Function Monitoring",
      "Sensor 61 — Machine State Monitoring",
      "",
      "Reset Air: cycles air off/on to clear air/sensor-state stops.",
    ].join("\n"),
    note: "Pending confirmation details can be submitted via Feedback.",
  },
  sand: {
    whatLabel: "SAND",
    what: [
      "Sand Demand: indicates the hopper is low.",
      "Release: enable to automatically make sand whenever it is low.",
      "",
      "Mixer states shown: Mixing • Transporting • Ready.",
    ].join("\n"),
    note: "Exact wording may vary by configuration.",
  },
  lg: {
    whatLabel: "LG",
    what: [
      "Pre-dosing [strokes]: amount added before cycle dosing. (Pending confirmation on best-use.)",
      "Post dosing start delay [s]: delay before post dosing begins. (Pending confirmation.)",
      "Maximum post dosing [strokes]: maximum allowed post dosing amount. (Pending confirmation.)",
      "Post dosing [strokes]: amount added after main dosing (if used). (Pending confirmation.)",
    ].join("\n"),
    note: "Operator practice varies by job. Confirmed screen; usage details pending.",
  },
};

// ===== BASIC PAGES (Corebox Setup updated) =====
const CONTENT = {
  basics: {
    title: "Machine Operation",
    subtitle: "Start • Run • Shutdown",
    blocks: [
      {
        h: "Startup (placeholder)",
        p: "We will write this section next, one step at a time.",
        type: "tip",
      },
      {
        h: "Shutdown (placeholder)",
        p: "We will write this section later, one step at a time.",
      },
    ],
  },

  loadbox: {
    title: "Corebox Setup",
    subtitle: "Automatic load + manual (placeholder)",
    blocks: [
      {
        h: "Automatic Corebox Load (Crane + HMI)",
        p: [
          "1) Inspect the crane for wear and verify hooks and chains are in safe working condition.",
          "2) Lower the crane and attach lifting hooks/chains to the corebox.",
          "3) CRITICAL: Verify all four transport hooks are engaged (upper half hooked to lower half). These hooks keep both halves together during lifting/transport.",
          "",
          "4) Lift slowly. Stay arms-length away and never stand under a suspended load.",
          "5) Place the corebox onto the carriage with the label marked “FRONT” facing you.",
          "6) Verify the box is seated level.",
          "7) Confirm alignment pins are seated in the front and rear of the box.",
          "",
          "8) CRITICAL: Remove all four transport hooks AFTER seating the box.",
          "   - These hooks are for lifting only.",
          "   - If left installed, the machine can load/clamp and break something.",
          "",
          "9) Remove chains and return hoist out of the way.",
          "",
          "10) On the HMI screen: tap Database and use the dropdown to select your box.",
          "11) After selected, hit the Load Corebox button.",
          "12) Verify on-screen (top left) it shows which box is loaded.",
          "13) Go to the Mode screen and make sure Clamp is highlighted.",
          "14) Turn the machine to Auto and hit the Green Start button.",
          "15) Machine should load the box automatically.",
        ].join("\n"),
        type: "tip",
      },
      {
        h: "High-Risk Mistakes",
        p: [
          "• Transport hooks left installed (damage risk).",
          "• Box facing wrong direction (FRONT not facing you).",
          "• Pins not seated front/rear.",
          "• Wrong corebox selected in Database.",
          "• Standing too close during lift.",
        ].join("\n"),
        type: "warn",
      },
      {
        h: "Manual Corebox Load (placeholder)",
        p: "Placeholder. We will add the manual loading method step-by-step next.",
        type: "tip",
      },
    ],
  },

  troubleshoot: {
    title: "Troubleshooting",
    subtitle: "Symptoms → check first",
    blocks: [
      {
        h: "Placeholder",
        p: "We will build troubleshooting steps later.",
        type: "warn",
      },
    ],
  },

  safety: {
    title: "Emergency & Safety",
    subtitle: "Critical procedures only",
    blocks: [{ h: "Placeholder", p: "We will build emergency-only content later.", type: "warn" }],
  },

  feedback: {
    title: "Operator Feedback",
    subtitle: "Submit improvement input",
    blocks: [
      {
        h: "Submit feedback",
        p: "Use the button below to submit corrections, missing steps, or suggestions.",
        type: "tip",
      },
    ],
  },
};

// ===== CHECKLISTS =====
const CHECKLISTS = {
  start: {
    title: "Start of Shift",
    subtitle: "Do this before starting production",
    sections: [
      {
        label: "Job / Plan",
        steps: [
          "Verify today’s job and priority on the production board (next to the supervisor’s office).",
          "Verify the quantity needed for the shift.",
        ],
      },
      {
        label: "Corebox / Cores",
        steps: [
          "Verify the correct corebox for the job.",
          "Verify cores are acceptable quality and match the corebox being run.",
        ],
      },
      {
        label: "Machine / Materials",
        steps: [
          "Verify sand supply is adequate for the run.",
          "Verify machine is ready to run (no active faults, area clear, guards OK).",
        ],
      },
      {
        label: "Paperwork & Labels",
        steps: [
          "Complete the Production Log / Scrap & Downtime sheet.",
          "Print labels with parts, date, shift, and quantity.",
        ],
      },
      {
        label: "Finish",
        steps: ["If anything is missing or abnormal, notify supervisor/lead before starting production."],
      },
    ],
  },
  end: {
    title: "End of Shift",
    subtitle: "Closeout steps before leaving",
    sections: [
      {
        label: "Production Closeout",
        steps: ["Verify final quantity produced for the shift.", "Move completed parts to the correct designated area."],
      },
      {
        label: "Scrap / Documentation",
        steps: [
          "Record all scrap and downtime on the Production Log / Scrap & Downtime sheet.",
          "Verify paperwork is complete and accurate before leaving.",
        ],
      },
      {
        label: "Machine Condition",
        steps: [
          "Return machine to start position.",
          "Clean machine as required (remove sand buildup, wipe surfaces as needed).",
          "Clean the mixer and return it to start position.",
          "Empty trash and clear work area around the machine.",
        ],
      },
      {
        label: "Machine State",
        steps: ["Leave the carriage out.", "Leave the machine in Manual mode."],
      },
    ],
  },
};

// ===== STATE =====
let currentView =
  "home"; // home | screens-list | gassing-params | machine-params | mixer-list | checklist-list | checklist-detail | content | search | troubleshooting-home | troubleshooting-issue

// ===== HELPERS =====
function setDockActive(key) {
  document.querySelectorAll(".dockBtn").forEach((btn) => {
    btn.classList.toggle("is-active", btn.dataset.dock === key);
  });
}

function showBottomSheet(payload) {
  sheetTitle.textContent = payload.title || "SETTINGS";
  sheetLabelWhat.textContent = payload.whatLabel
    ? payload.whatLabel.toUpperCase()
    : "WHAT IT DOES";

  sheetWhat.textContent = payload.what || "—";

  const hasEffects = Boolean(payload.increase || payload.decrease);
  if (hasEffects) {
    sheetIncrease.textContent = payload.increase || "—";
    sheetDecrease.textContent = payload.decrease || "—";
    effectRow.style.display = "flex";
    sheetDivider.style.display = "block";
  } else {
    effectRow.style.display = "none";
    sheetDivider.style.display = "none";
  }

  if (payload.note) {
    sheetNote.textContent = payload.note;
    sheetNoteContainer.style.display = "block";
  } else {
    sheetNoteContainer.style.display = "none";
  }

  sheetOverlay.classList.add("active");
  requestAnimationFrame(() => bottomSheet.classList.add("active"));
}

function hideParameterSheet() {
  sheetOverlay.classList.remove("active");
  bottomSheet.classList.remove("active");
}

// ===== RENDER: Screens list =====
function renderScreensList() {
  return `
    <div class="screens-list">

      <div class="screen-item" data-screen="pneu">
        <div class="screen-icon">💨</div>
        <div class="screen-info">
          <div class="screen-name">PNEU</div>
          <div class="screen-desc">Sensors + Reset Air</div>
        </div>
        <div class="screen-arrow">→</div>
      </div>

      <div class="screen-item" data-screen="gassingParams">
        <div class="screen-icon">⚡</div>
        <div class="screen-info">
          <div class="screen-name">Gassing parameters</div>
          <div class="screen-desc">Cure pressure/time, exhaust, preheat</div>
        </div>
        <div class="screen-arrow">→</div>
      </div>

      <div class="screen-item" data-screen="machine">
        <div class="screen-icon">🛠️</div>
        <div class="screen-info">
          <div class="screen-name">Machine shot parameters</div>
          <div class="screen-desc">Shots, pressure/time, exhaust, sand refill</div>
        </div>
        <div class="screen-arrow">→</div>
      </div>

      <div class="screen-item" data-screen="sand">
        <div class="screen-icon">🏖️</div>
        <div class="screen-info">
          <div class="screen-name">SAND</div>
          <div class="screen-desc">Demand / Release + state</div>
        </div>
        <div class="screen-arrow">→</div>
      </div>

      <div class="screen-item" data-screen="lg">
        <div class="screen-icon">🧪</div>
        <div class="screen-info">
          <div class="screen-name">LG</div>
          <div class="screen-desc">Pre-dose / Post-dose parameters</div>
        </div>
        <div class="screen-arrow">→</div>
      </div>

    </div>
  `;
}

// ===== RENDER: Gassing params =====
function renderGassingParams() {
  return `
    <div class="screen-header">
      <div class="screen-header-title">GASSING PARAMETERS</div>
    </div>

    <div class="hmi-container">
      <div class="simulated-hmi">
        <div class="hmi-param-grid">
          ${Object.entries(GASSING_PARAMS)
            .map(
              ([key, p]) => `
            <div class="hmi-param" data-param="${key}">
              <span class="param-name">${escHtml(p.name)}</span>
              <span class="tap-indicator"></span>
            </div>
          `
            )
            .join("")}
        </div>
      </div>
    </div>

    <div class="stack">
      <div class="card card--tip">
        <h3>SETTINGS</h3>
        <p>Tap a parameter to view what it does. If anything looks wrong, submit corrections via Feedback.</p>
      </div>
    </div>
  `;
}

// ===== RENDER: Machine params =====
function renderMachineParams() {
  return `
    <div class="screen-header">
      <div class="screen-header-title">MACHINE SHOT PARAMETERS</div>
    </div>

    <div class="hmi-container">
      <div class="simulated-hmi">
        <div class="hmi-param-grid">
          ${Object.entries(MACHINE_PARAMS)
            .map(
              ([key, p]) => `
            <div class="hmi-param" data-machine-param="${key}">
              <span class="param-name">${escHtml(p.name)}</span>
              <span class="tap-indicator"></span>
            </div>
          `
            )
            .join("")}
        </div>
      </div>
    </div>

    <div class="stack">
      <div class="card card--tip">
        <h3>SETTINGS</h3>
        <p>Tap a parameter to view what it does. If anything looks wrong, submit corrections via Feedback.</p>
      </div>
    </div>
  `;
}

// ===== MIXER MODULE (placeholder list) =====
function renderMixerList() {
  return `
    <div class="screens-list">
      <div class="screen-item" data-mixer="overview">
        <div class="screen-icon">🌀</div>
        <div class="screen-info">
          <div class="screen-name">Mixer Overview</div>
          <div class="screen-desc">Purpose and workflow (placeholder)</div>
        </div>
        <div class="screen-arrow">→</div>
      </div>

      <div class="screen-item" data-mixer="settings">
        <div class="screen-icon">⚙️</div>
        <div class="screen-info">
          <div class="screen-name">Mixer Settings</div>
          <div class="screen-desc">Adjustable settings (placeholder)</div>
        </div>
        <div class="screen-arrow">→</div>
      </div>

      <div class="screen-item" data-mixer="checks">
        <div class="screen-icon">✅</div>
        <div class="screen-info">
          <div class="screen-name">Mixer Checks</div>
          <div class="screen-desc">Operator checks (placeholder)</div>
        </div>
        <div class="screen-arrow">→</div>
      </div>

      <div class="screen-item" data-mixer="cleaning">
        <div class="screen-icon">🧽</div>
        <div class="screen-info">
          <div class="screen-name">Mixer Cleaning</div>
          <div class="screen-desc">End-of-shift cleaning (placeholder)</div>
        </div>
        <div class="screen-arrow">→</div>
      </div>
    </div>
  `;
}

// ===== RENDER: Checklist list =====
function renderChecklistList() {
  detailTitle.textContent = "Shift Checklists";
  detailSub.textContent = "Tap to open step-by-step";
  dynamicContent.innerHTML = `
    <div class="screens-list">
      <div class="screen-item" data-checklist="start">
        <div class="screen-icon">☀️</div>
        <div class="screen-info">
          <div class="screen-name">Start of Shift</div>
          <div class="screen-desc">Before starting production</div>
        </div>
        <div class="screen-arrow">→</div>
      </div>

      <div class="screen-item" data-checklist="end">
        <div class="screen-icon">🌙</div>
        <div class="screen-info">
          <div class="screen-name">End of Shift</div>
          <div class="screen-desc">Closeout before leaving</div>
        </div>
        <div class="screen-arrow">→</div>
      </div>
    </div>
  `;
}

// ===== RENDER: Checklist detail =====
function renderChecklistDetail(which) {
  const page = CHECKLISTS[which];
  if (!page) return;

  detailTitle.textContent = page.title;
  detailSub.textContent = page.subtitle;

  let n = 1;
  dynamicContent.innerHTML = `
    <div class="stack">
      ${page.sections
        .map(
          (sec) => `
        <div class="card">
          <div class="sectionLabel">${escHtml(sec.label)}</div>
          <div class="stepsWrap">
            ${sec.steps
              .map(
                (step) => `
              <div class="stepRow">
                <div class="stepNum">${n++}</div>
                <div class="stepText">${escHtml(step)}</div>
              </div>
            `
              )
              .join("")}
          </div>
        </div>
      `
        )
        .join("")}
    </div>
  `;
}

// ===== RENDER: Content pages =====
function renderContentPage(key) {
  // Intercept troubleshooting module and render from KB
  if (key === "troubleshoot") {
    renderTroubleshootingHome();
    return;
  }

  const page = CONTENT[key];
  if (!page) return;

  detailTitle.textContent = page.title;
  detailSub.textContent = page.subtitle;

  if (key === "feedback") {
    dynamicContent.innerHTML = `
      <div class="stack">
        <div class="card card--tip">
          <h3>Submit feedback</h3>
          <p>Use the button below to submit corrections, missing steps, or suggestions.</p>
        </div>

        <button class="tile tile--blue" id="openFeedback" type="button" style="min-height:110px;width:100%;">
          <div class="tile__icon">📝</div>
          <div class="tile__title">Open Feedback Form</div>
          <div class="tile__sub">Google Form (external link)</div>
        </button>
      </div>
    `;
    return;
  }

  dynamicContent.innerHTML = `
    <div class="stack">
      ${page.blocks
        .map((b) => {
          const klass =
            b.type === "warn"
              ? "card card--warn"
              : b.type === "tip"
              ? "card card--tip"
              : "card";
          return `
          <div class="${klass}">
            <h3>${escHtml(b.h)}</h3>
            <p style="white-space:pre-line">${escHtml(b.p)}</p>
          </div>
        `;
        })
        .join("")}
    </div>
  `;
}

// ===== NAVIGATION =====
function showHome() {
  homeView.hidden = false;
  detailView.hidden = true;
  searchView.hidden = true;
  setDockActive("home");
  window.location.hash = "";
  hideParameterSheet();
  currentView = "home";
}

function showScreensList() {
  detailTitle.textContent = "Control Screens";
  detailSub.textContent = "Parameter & status reference";
  dynamicContent.innerHTML = renderScreensList();

  homeView.hidden = true;
  detailView.hidden = false;
  searchView.hidden = true;
  setDockActive("screens");
  window.location.hash = "screens";
  hideParameterSheet();
  currentView = "screens-list";
}

function showGassingParams() {
  detailTitle.textContent = "Control Screens";
  detailSub.textContent = "Gassing parameters";
  dynamicContent.innerHTML = renderGassingParams();

  homeView.hidden = true;
  detailView.hidden = false;
  searchView.hidden = true;
  setDockActive("screens");
  window.location.hash = "screens/gassing";
  hideParameterSheet();
  currentView = "gassing-params";
}

function showMachineParams() {
  detailTitle.textContent = "Control Screens";
  detailSub.textContent = "Machine shot parameters";
  dynamicContent.innerHTML = renderMachineParams();

  homeView.hidden = true;
  detailView.hidden = false;
  searchView.hidden = true;
  setDockActive("screens");
  window.location.hash = "screens/machine";
  hideParameterSheet();
  currentView = "machine-params";
}

function showMixerList() {
  detailTitle.textContent = "Sand Mixer";
  detailSub.textContent = "Mixer settings & checks (placeholders)";
  dynamicContent.innerHTML = renderMixerList();

  homeView.hidden = true;
  detailView.hidden = false;
  searchView.hidden = true;
  setDockActive("mixer");
  window.location.hash = "mixer";
  hideParameterSheet();
  currentView = "mixer-list";
}

function showMixerPlaceholder(label, id) {
  detailTitle.textContent = "Sand Mixer";
  detailSub.textContent = label;
  dynamicContent.innerHTML = `
    <div class="stack">
      <div class="card card--tip">
        <h3>${escHtml(label)}</h3>
        <p>Placeholder. We will add step-by-step instructions and (optional) screen images later.</p>
      </div>
    </div>
  `;
  homeView.hidden = true;
  detailView.hidden = false;
  searchView.hidden = true;
  setDockActive("mixer");
  window.location.hash = `mixer/${id}`;
  hideParameterSheet();
  currentView = "content";
}

function showChecklistsList() {
  homeView.hidden = true;
  detailView.hidden = false;
  searchView.hidden = true;
  setDockActive("");
  window.location.hash = "checklists";
  hideParameterSheet();
  renderChecklistList();
  currentView = "checklist-list";
}

function showChecklistDetail(which) {
  homeView.hidden = true;
  detailView.hidden = false;
  searchView.hidden = true;
  setDockActive("");
  window.location.hash = `checklists/${which}`;
  hideParameterSheet();
  renderChecklistDetail(which);
  currentView = "checklist-detail";
}

function showDetail(key) {
  if (key === "screens") return showScreensList();
  if (key === "mixer") return showMixerList();
  if (key === "checklists") return showChecklistsList();

  // Troubleshooting: route to KB-powered module
  if (key === "troubleshoot") {
    homeView.hidden = true;
    detailView.hidden = false;
    searchView.hidden = true;
    setDockActive("troubleshoot");
    window.location.hash = "troubleshooting";
    hideParameterSheet();
    renderTroubleshootingHome();
    currentView = "troubleshooting-home";
    return;
  }

  homeView.hidden = true;
  detailView.hidden = false;
  searchView.hidden = true;

  setDockActive(key === "troubleshoot" ? "troubleshoot" : "");
  window.location.hash = key;

  hideParameterSheet();
  renderContentPage(key);
  currentView = "content";
}

function showSearch() {
  homeView.hidden = true;
  detailView.hidden = true;
  searchView.hidden = false;
  setDockActive("");
  searchInput.value = "";
  searchResults.innerHTML = "";
  window.location.hash = "search";
  setTimeout(() => searchInput.focus(), 50);
  hideParameterSheet();
  currentView = "search";
}

// ===== SEARCH =====
function highlightText(text, term) {
  if (!term || !text) return text;
  const regex = new RegExp(
    `(${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
    "gi"
  );
  return String(text).replace(regex, "<mark>$1</mark>");
}

// ==========================================================
// Troubleshooting KB (single source of truth)
// ==========================================================
const KB_TROUBLESHOOT = [
  {
    id: "vacuum-drops",
    title: "Vacuum drops / won’t hold vacuum",
    priority: 1,
    triggers: [
      "vac", "vacuum", "vac drop", "vacuum low", "losing vacuum", "losing vac",
      "vac gauge low", "vac leak", "won't hold vacuum", "wont hold vacuum"
    ],
    symptom: "Vacuum will not reach target or drops during/after clamp.",
    firstChecks: [
      "Confirm air supply is stable at the normal bar setting.",
      "Watch gauge pattern: steady low vs. slowly falling vs. sudden 0.",
      "Check obvious leaks: loose hoses, cracked lines, fittings not seated.",
      "Check sealing surfaces for sand/debris; clean if allowed.",
      "If allowed: verify vacuum filter/line is not blocked."
    ],
    nextSteps: [
      "If it drops only after clamp: suspect seal seating/alignment (see “Cope eject seal issue”).",
      "If low even while idle: suspect upstream leak or valve not sealing.",
      "If it drops to 0 suddenly: check disconnected line / valve not actuating.",
      "Record: gauge value + step where it fails for maintenance."
    ],
    likelyCauses: [
      "Seal not seated / dirty sealing surface",
      "Loose/cracked vacuum line or fitting",
      "Restriction/blockage in vacuum path",
      "Valve not sealing (pneumatic issue)"
    ],
    whenCallMaint: [
      "Cannot reach minimum vacuum to run after basic checks.",
      "Repeated sudden drop to 0.",
      "Constant leak you cannot locate quickly."
    ],
    safetyNotes: [
      "Do not bypass interlocks or run below minimum vacuum."
    ],
    pending: [
      "Pending confirmation: exact minimum vacuum setpoint for this machine."
    ],
    relatedPages: [
      { label: "PNEU — Sensors + Reset Air", route: "screens" },
      { label: "Gassing parameters", route: "screens/gassing" }
    ]
  },

  {
    id: "random-stop-mid-cycle",
    title: "Machine stops mid-cycle / random stop",
    priority: 2,
    triggers: [
      "stops", "mid cycle", "cycle stopped", "random stop", "halts",
      "wont run", "won't run", "fault", "error"
    ],
    symptom: "Cycle halts unexpectedly without a clear operator command.",
    firstChecks: [
      "Check HMI for exact fault text/code and write it down.",
      "Confirm guards/doors/safety inputs are closed and stable.",
      "Confirm air supply is stable during motion (not just at idle).",
      "If repeatable: note exact step where it stops.",
      "Check PNEU references (41/51/61) and use Reset Air if appropriate."
    ],
    nextSteps: [
      "If always same step: escalate as sensor/sequence confirmation issue with step details.",
      "If random: suspect intermittent sensor, air sag, or loose connection.",
      "Capture: time, fault text, step, and recent changes (box/job/parameters)."
    ],
    likelyCauses: [
      "Intermittent safety input",
      "Air pressure instability",
      "Sequence sensor not confirming in time",
      "Loose connection / sensor intermittency"
    ],
    whenCallMaint: [
      "Any safety-related fault that repeats.",
      "Multiple stops in one shift without clear cause.",
      "Stops tied to a specific sensor/step."
    ],
    safetyNotes: [
      "Do not defeat safety switches."
    ],
    pending: [
      "Pending confirmation: best HMI view to pinpoint stop step."
    ],
    relatedPages: [
      { label: "PNEU — Sensors + Reset Air", route: "screens" },
      { label: "Machine shot parameters", route: "screens/machine" }
    ]
  },

  {
    id: "core-stuck-eject",
    title: "Core stuck / eject problem",
    priority: 3,
    triggers: [
      "core stuck", "sticking", "stuck in box", "won't eject", "wont eject",
      "eject", "release", "parts sticking"
    ],
    symptom: "Core does not release cleanly from the corebox or sticks during removal.",
    firstChecks: [
      "Confirm vacuum is normal (low vacuum can worsen release).",
      "Check corebox surfaces for sand buildup/debris; clean if allowed.",
      "Verify release/eject step is actually occurring (watch step order).",
      "Look for obvious mechanical bind: misalignment, debris."
    ],
    nextSteps: [
      "If it started after a change: note what changed (box/job/sand/parameters).",
      "If vent marks/holes also present: review gassing/exhaust settings for over-gassing symptoms.",
      "If repeatable with one box: isolate as corebox condition/alignment and escalate with box ID."
    ],
    likelyCauses: [
      "Sand/debris preventing release",
      "Release/eject sequence not completing",
      "Corebox condition/alignment issue"
    ],
    whenCallMaint: [
      "Eject mechanism does not actuate or binds repeatedly.",
      "Issue persists after basic cleaning checks.",
      "Unsafe handling risk."
    ],
    safetyNotes: [
      "Avoid reaching into pinch points or moving areas."
    ],
    pending: [
      "Pending confirmation: any approved release aid method for this process (if any)."
    ],
    relatedPages: [
      { label: "Troubleshooting — Cope eject seal issue", route: "troubleshooting/cope-eject-seal" },
      { label: "Gassing parameters", route: "screens/gassing" }
    ]
  },

  {
    id: "cope-eject-seal",
    title: "Cope eject seal issue (re-seat / lower+raise table trick)",
    priority: 4,
    triggers: [
      "won't clamp", "wont clamp", "seal issue", "cope seal",
      "reseat seal", "re-seat seal", "lower raise table", "table trick",
      "clamp won't engage", "clamp not responding"
    ],
    symptom: "Clamp/seal won’t seat correctly, or clamp behavior is inconsistent.",
    firstChecks: [
      "Confirm machine is in the correct position/state to allow clamp (some states block clamp).",
      "Check sealing surface for sand/debris; clean if allowed.",
      "Check obvious alignment: table fully positioned, box seated square.",
      "If approved: lower then raise table to re-seat, then re-clamp."
    ],
    nextSteps: [
      "If clamp works only sometimes: note the machine state when it works vs. doesn’t.",
      "If clamp engages but vacuum drops after: go to “Vacuum drops / won’t hold vacuum”.",
      "Escalate with: position/state, indicators, and what changed after re-seat."
    ],
    likelyCauses: [
      "Seal contamination preventing seating",
      "Alignment/table position not reached",
      "Interlock/state preventing clamp",
      "Seal wear/mechanical seating issue"
    ],
    whenCallMaint: [
      "Clamp cannot be commanded even in correct state.",
      "Re-seat works briefly but fails repeatedly.",
      "Visible seal damage."
    ],
    safetyNotes: [
      "Keep hands clear of pinch points during seating attempts."
    ],
    pending: [
      "Pending confirmation: exact HMI indicator/state that permits clamp."
    ],
    relatedPages: [
      { label: "Troubleshooting — Vacuum drops", route: "troubleshooting/vacuum-drops" },
      { label: "PNEU — Sensors + Reset Air", route: "screens" }
    ]
  },

  {
    id: "gas-smell-exhaust",
    title: "Gas smell complaint / exhaust adjustment",
    priority: 5,
    triggers: [
      "gas smell", "smell gas", "odor", "fumes", "amine",
      "exhaust", "venting", "strong smell"
    ],
    symptom: "Operators notice gas odor during or after the gassing cycle.",
    firstChecks: [
      "Confirm the area is safe and ventilation is functioning (follow site policy).",
      "Check for obvious leaks in accessible lines/fittings (visual + audible).",
      "Verify exhaust-related setting is not set too low for clearing residual gas."
    ],
    nextSteps: [
      "If odor increased after changes: revert last setting change if allowed and document.",
      "Increase Gas Exhaust Time slightly to clear residual gas (cycle time increases).",
      "If odor persists or leak suspected: stop and escalate—do not normalize it."
    ],
    likelyCauses: [
      "Exhaust duration too short",
      "Leak in accessible connections",
      "Ventilation issue in the area"
    ],
    whenCallMaint: [
      "Suspected leak you cannot identify/stop safely.",
      "Persistent odor despite exhaust adjustments.",
      "Any safety alarm/exposure concern."
    ],
    safetyNotes: [
      "Treat unusual odor as a safety issue first. Follow site PPE/vent rules."
    ],
    pending: [
      "Pending confirmation: exact adjustment increment and site policy for exhaust changes."
    ],
    relatedPages: [
      { label: "Gassing parameters", route: "screens/gassing" }
    ]
  },

  {
    id: "vent-marks-holes",
    title: "Holes/marks near vents (possible over-gassing symptom)",
    priority: 6,
    triggers: [
      "holes near vents", "vent marks", "marks near vents", "pitting",
      "overgassing", "over gassing", "gas too much", "holes", "vents"
    ],
    symptom: "Visible defects concentrated near vents (holes/marks).",
    firstChecks: [
      "Confirm the pattern is consistently near vents (pattern matters).",
      "Check for recent changes in gassing time/pressure or ramp settings.",
      "Inspect vents for blockage or sand buildup (if allowed)."
    ],
    nextSteps: [
      "If settings changed recently: move back toward baseline if allowed and document effect.",
      "If vents are partially blocked: clean/clear per approved practice.",
      "Escalate with photos, box ID, and what settings changed."
    ],
    likelyCauses: [
      "Process imbalance linked to gassing/exhaust timing (symptom-linked)",
      "Vent blockage causing localized effects",
      "Corebox condition at vent features"
    ],
    whenCallMaint: [
      "Defects persist after baseline re-check and approved cleaning.",
      "Suspected damage to vent features or corebox surfaces."
    ],
    safetyNotes: [],
    pending: [
      "Pending confirmation: exact relationship between this defect pattern and gassing settings for this process."
    ],
    relatedPages: [
      { label: "Gassing parameters", route: "screens/gassing" }
    ]
  },

  {
    id: "cold-box-preheat",
    title: "Cold box start issues / preheating use (Pending)",
    priority: 7,
    triggers: [
      "cold box", "cold start", "preheat", "preheating", "first run bad",
      "startup curing", "initial curing"
    ],
    symptom: "Early runs on a cold corebox show poor curing/consistency until the box warms.",
    firstChecks: [
      "Confirm it happens mainly at start of shift or after long downtime.",
      "Check if Pre-heating is available and operator-accessible on this machine.",
      "Compare first-run vs later-run outcomes (does it stabilize after warming?)."
    ],
    nextSteps: [
      "If preheating is used on the floor: increase preheat time modestly to stabilize startup (cycle time increases).",
      "Document: preheat time used and whether it improved first run.",
      "Escalate if you need a baseline preheat standard for the box/process."
    ],
    likelyCauses: [
      "Corebox temperature too low at startup affecting early curing/consistency"
    ],
    whenCallMaint: [
      "Preheat setting exists but has no noticeable effect.",
      "Startup issues persist beyond initial warmup period."
    ],
    safetyNotes: [],
    pending: [
      "Pending confirmation: heating mechanism and best-practice preheat range for this machine."
    ],
    relatedPages: [
      { label: "Gassing parameters", route: "screens/gassing" }
    ]
  }
];

// ---------- KB Search / Ranking ----------
function scoreKBEntry(query, entry){
  const q = normalizeText(query);
  if (!q) return 0;

  let score = 0;
  const titleN = normalizeText(entry.title);
  const trigText = (entry.triggers || []).join(" ");
  const trigN = normalizeText(trigText);

  if (titleN === q) score += 200;
  if (titleN.includes(q)) score += 120;

  for (const t of entry.triggers || []){
    const nt = normalizeText(t);
    if (!nt) continue;
    if (nt === q) score += 160;
    if (nt.includes(q) || q.includes(nt)) score += 90;

    if (q.length <= 18 && nt.length <= 18){
      const d = editDistance(q, nt);
      if (d <= 2) score += (60 - d * 10);
    }
  }

  const hay = `${entry.title} ${trigText} ${entry.symptom || ""}`;
  score += tokenOverlapScore(query, hay) * 6;

  score += Math.max(0, 20 - (entry.priority || 20));
  if (trigN.includes(q) || q.includes(trigN)) score += 25;

  return score;
}

function matchKB(query, { limit = 3, minScore = 70 } = {}){
  const scored = KB_TROUBLESHOOT
    .map(e => ({ entry: e, score: scoreKBEntry(query, e) }))
    .filter(x => x.score >= minScore)
    .sort((a,b) => b.score - a.score)
    .slice(0, limit);

  return scored;
}

// ---------- Assistant Answer rendering ----------
function renderAssistantBlock(query){
  const hits = matchKB(query, { limit: 3, minScore: 70 });
  if (!hits.length) return "";

  const cards = hits.map(({ entry }) => {
    const checks = (entry.firstChecks || []).slice(0, 5).map(x => `<li>${escHtml(x)}</li>`).join("");
    const next = (entry.nextSteps || []).slice(0, 4).map(x => `<li>${escHtml(x)}</li>`).join("");

    const pending = (entry.pending && entry.pending.length)
      ? `<p style="white-space:pre-line"><strong>Pending:</strong> ${escHtml(entry.pending[0])}</p>`
      : "";

    const openRoute = `troubleshooting/${entry.id}`;

    return `
      <div class="card">
        <h3>Assistant Answer — ${escHtml(entry.title)}</h3>
        <p style="white-space:pre-line"><strong>Symptom:</strong> ${escHtml(entry.symptom || "—")}</p>

        <div style="margin-top:8px;">
          <strong>Fast first checks:</strong>
          <ul style="margin:6px 0 0 18px;">${checks}</ul>
        </div>

        <div style="margin-top:8px;">
          <strong>If still happening:</strong>
          <ul style="margin:6px 0 0 18px;">${next}</ul>
        </div>

        ${pending}

        <button class="tile tile--blue" data-route="${openRoute}" type="button" style="margin-top:10px;min-height:78px;width:100%;">
          <div class="tile__icon">🧭</div>
          <div class="tile__title">Open Troubleshooting</div>
          <div class="tile__sub">${escHtml(entry.title)}</div>
        </button>
      </div>
    `;
  }).join("");

  return `
    <div class="card card--tip">
      <h3>Assistant Answers</h3>
      <p>Ranked matches based on common operator issues. Offline and safe for IT review.</p>
    </div>
    ${cards}
    <div class="card card--tip">
      <h3>Related pages</h3>
      <p>Standard page results are listed below.</p>
    </div>
  `;
}

// ==========================================================
// Troubleshooting module rendering from same KB
// ==========================================================
function getTroubleshootingEntries(){
  return KB_TROUBLESHOOT
    .slice()
    .sort((a,b) => (a.priority || 999) - (b.priority || 999));
}

function renderTroubleshootingHome(){
  detailTitle.textContent = "Troubleshooting";
  detailSub.textContent = "Symptoms → check first";

  const entries = getTroubleshootingEntries();

  dynamicContent.innerHTML = `
    <div class="stack">
      <div class="card card--tip">
        <h3>Top issues</h3>
        <p>Tap an issue to open a fast, floor-usable checklist.</p>
      </div>

      ${entries.map(e => `
        <button class="tile tile--blue" data-route="troubleshooting/${escHtml(e.id)}" type="button" style="min-height:110px;width:100%;">
          <div class="tile__icon">🧰</div>
          <div class="tile__title">${escHtml(e.title)}</div>
          <div class="tile__sub">${escHtml(e.symptom || "")}</div>
        </button>
      `).join("")}
    </div>
  `;

  currentView = "troubleshooting-home";
}

function renderTroubleshootingIssue(id){
  const entry = KB_TROUBLESHOOT.find(e => e.id === id);
  if (!entry){
    detailTitle.textContent = "Troubleshooting";
    detailSub.textContent = "Not found";
    dynamicContent.innerHTML = `
      <div class="stack">
        <div class="card card--warn">
          <h3>Issue not found</h3>
          <p>This troubleshooting item does not exist.</p>
        </div>
      </div>
    `;
    currentView = "troubleshooting-issue";
    return;
  }

  detailTitle.textContent = "Troubleshooting";
  detailSub.textContent = entry.title;

  function listCard(title, items, type){
    if (!items || !items.length) return "";
    const klass = type === "warn" ? "card card--warn" :
                  type === "tip" ? "card card--tip" : "card";
    return `
      <div class="${klass}">
        <h3>${escHtml(title)}</h3>
        <div class="stepsWrap">
          ${items.slice(0, 7).map((t, i) => `
            <div class="stepRow">
              <div class="stepNum">${i+1}</div>
              <div class="stepText">${escHtml(t)}</div>
            </div>
          `).join("")}
        </div>
      </div>
    `;
  }

  const related = (entry.relatedPages && entry.relatedPages.length)
    ? `
      <div class="card card--tip">
        <h3>Related pages</h3>
        ${entry.relatedPages.map(p => `
          <button class="tile tile--blue" data-route="${escHtml(p.route)}" type="button" style="min-height:90px;width:100%;margin-top:8px;">
            <div class="tile__icon">🔗</div>
            <div class="tile__title">${escHtml(p.label)}</div>
            <div class="tile__sub">Open reference</div>
          </button>
        `).join("")}
      </div>
    `
    : "";

  dynamicContent.innerHTML = `
    <div class="stack">
      <div class="card card--tip">
        <h3>Symptom</h3>
        <p style="white-space:pre-line">${escHtml(entry.symptom || "—")}</p>
      </div>

      ${listCard("Fast first checks", entry.firstChecks, "tip")}
      ${listCard("If still happening", entry.nextSteps, "")}
      ${listCard("Likely causes", entry.likelyCauses, "")}
      ${listCard("Call maintenance when", entry.whenCallMaint, "warn")}
      ${entry.safetyNotes && entry.safetyNotes.length ? listCard("Safety notes", entry.safetyNotes, "warn") : ""}
      ${entry.pending && entry.pending.length ? listCard("Pending confirmation", entry.pending, "tip") : ""}

      ${related}

      <button class="tile tile--blue" data-route="troubleshoot" type="button" style="min-height:90px;width:100%;">
        <div class="tile__icon">↩️</div>
        <div class="tile__title">Back to Troubleshooting</div>
        <div class="tile__sub">All issues</div>
      </button>
    </div>
  `;

  currentView = "troubleshooting-issue";
}

// ==========================================================
// ROUTE HANDLER (hash → screens)
// Keeps layout and existing nav; only adds troubleshooting routes.
// ==========================================================
function handleHashRoute(){
  const hash = (window.location.hash || "").replace(/^#/, "");
  if (!hash){
    showHome();
    return;
  }

  if (hash === "search"){
    showSearch();
    return;
  }

  if (hash === "screens"){ showScreensList(); return; }
  if (hash === "screens/gassing"){ showGassingParams(); return; }
  if (hash === "screens/machine"){ showMachineParams(); return; }

  if (hash === "mixer"){ showMixerList(); return; }
  if (hash.startsWith("mixer/")){
    const id = hash.split("/")[1] || "overview";
    const label = id.charAt(0).toUpperCase() + id.slice(1);
    showMixerPlaceholder(label, id);
    return;
  }

  if (hash === "checklists"){ showChecklistsList(); return; }
  if (hash.startsWith("checklists/")){
    const which = hash.split("/")[1];
    showChecklistDetail(which);
    return;
  }

  if (hash === "troubleshooting" || hash === "troubleshoot"){
    homeView.hidden = true;
    detailView.hidden = false;
    searchView.hidden = true;
    setDockActive("troubleshoot");
    hideParameterSheet();
    window.location.hash = "troubleshooting";
    renderTroubleshootingHome();
    return;
  }
  if (hash.startsWith("troubleshooting/")){
    const id = hash.split("/")[1] || "";
    homeView.hidden = true;
    detailView.hidden = false;
    searchView.hidden = true;
    setDockActive("troubleshoot");
    hideParameterSheet();
    renderTroubleshootingIssue(id);
    return;
  }

  showDetail(hash);
}

// ===== SEARCH =====
let searchTimeout;

function runSearch(q){
  const termRaw = q.trim();
  const term = termRaw.toLowerCase();
  if (!term){ searchResults.innerHTML = ""; return; }

  const hits = [];

  const assistantHTML = renderAssistantBlock(termRaw);

  // CONTENT
  Object.entries(CONTENT).forEach(([key,page])=>{
    const hay = (page.title+" "+page.subtitle+" "+(page.blocks||[]).map(b=>b.h+" "+b.p).join(" ")).toLowerCase();
    if (hay.includes(term)) hits.push({type:"page", key, title:page.title, sub:page.subtitle});
  });

  // CHECKLISTS
  Object.entries(CHECKLISTS).forEach(([key,page])=>{
    const hay = (page.title+" "+page.subtitle+" "+page.sections.map(s=>s.label+" "+s.steps.join(" ")).join(" ")).toLowerCase();
    if (hay.includes(term)) hits.push({type:"checklist", key, title:page.title, sub:page.subtitle});
  });

  const troubleshootHay = "troubleshooting troubleshoot issue issues vacuum clamp eject stuck stop mid cycle smell odor vents preheat";
  if (tokenize(termRaw).some(w => troubleshootHay.includes(w))){
    hits.push({type:"route", key:"troubleshooting", title:"Troubleshooting", sub:"Symptoms → check first"});
  }

  const screenHay = "screens gassing machine shots pressure time exhaust sand lg pneu vacuum air";
  if (tokenize(termRaw).some(w => screenHay.includes(w))) {
    hits.push({type:"route", key:"screens", title:"Control Screens", sub:"Parameter & status reference"});
  }

  const mixerHay = "mixer mixing sand binder ratio checks cleaning";
  if (tokenize(termRaw).some(w => mixerHay.includes(w))) {
    hits.push({type:"route", key:"mixer", title:"Sand Mixer", sub:"Mixer module (placeholders)"});
  }

  if (hits.length === 0 && !assistantHTML){
    searchResults.innerHTML = `
      <div class="card">
        <h3>🔍 No results found</h3>
        <p>Try "vacuum", "clamp", "eject", "stops", "gassing", "shots", "exhaust", "shift".</p>
      </div>
    `;
    return;
  }

  // de-dupe
  const seen = new Set();
  const deduped = [];
  for (const hit of hits){
    const route =
      hit.type === "page" ? hit.key :
      hit.type === "checklist" ? `checklists/${hit.key}` :
      hit.key;
    if (seen.has(route)) continue;
    seen.add(route);
    deduped.push(hit);
  }

  const normalHTML = deduped.map(hit=>{
    const route =
      hit.type === "page" ? hit.key :
      hit.type === "checklist" ? `checklists/${hit.key}` :
      hit.key;

    return `
      <button class="tile tile--blue" data-route="${route}" type="button" style="min-height:110px;width:100%;">
        <div class="tile__icon">🔎</div>
        <div class="tile__title">${highlightText(hit.title, term)}</div>
        <div class="tile__sub">${highlightText(hit.sub, term)}</div>
      </button>
    `;
  }).join("");

  searchResults.innerHTML = assistantHTML + normalHTML;
}

// ===== EVENTS =====
document.addEventListener("click", (e)=>{

  // Feedback open button
  const fb = e.target.closest("#openFeedback");
  if (fb){
    if (!FEEDBACK_URL || FEEDBACK_URL.includes("REPLACE_ME")){
      window.location.href = FEEDBACK_FALLBACK_EMAIL;
    } else {
      window.open(FEEDBACK_URL, "_blank", "noopener,noreferrer");
    }
    return;
  }

  // Screens items
  const screenItem = e.target.closest("[data-screen]");
  if (screenItem){
    const screenId = screenItem.dataset.screen;

    if (screenId === "gassingParams"){ showGassingParams(); return; }
    if (screenId === "machine"){ showMachineParams(); return; }

    if (screenId === "pneu" || screenId === "sand" || screenId === "lg"){
      const payload = SCREEN_SHEETS[screenId];
      showBottomSheet({
        title: "SCREENS",
        whatLabel: payload.whatLabel,
        what: payload.what,
        note: payload.note
      });
      return;
    }
    return;
  }

  // Mixer items
  const mixerItem = e.target.closest("[data-mixer]");
  if (mixerItem){
    const id = mixerItem.dataset.mixer;
    const label = mixerItem.querySelector(".screen-name")?.textContent || "Mixer";
    showMixerPlaceholder(label, id);
    return;
  }

  // Param taps (gassing)
  const gasParam = e.target.closest("[data-param]");
  if (gasParam){
    const key = gasParam.dataset.param;
    const param = GASSING_PARAMS[key];
    if (param){
      showBottomSheet({
        title: "SETTINGS",
        whatLabel: param.name,
        what: param.what,
        increase: param.increase,
        decrease: param.decrease,
        note: param.note
      });
    }
    return;
  }

  // Param taps (machine)
  const machParam = e.target.closest("[data-machine-param]");
  if (machParam){
    const key = machParam.dataset.machineParam;
    const param = MACHINE_PARAMS[key];
    if (param){
      showBottomSheet({
        title: "SETTINGS",
        whatLabel: param.name,
        what: param.what,
        increase: param.increase,
        decrease: param.decrease,
        note: param.note
      });
    }
    return;
  }

  // Checklist list taps
  const checklistItem = e.target.closest("[data-checklist]");
  if (checklistItem){
    showChecklistDetail(checklistItem.dataset.checklist);
    return;
  }

  // Tiles (home + search results + troubleshooting tiles)
  const tile = e.target.closest("[data-route]");
  if (tile){
    const route = tile.dataset.route || "";

    if (route === "troubleshooting" || route === "troubleshoot"){
      window.location.hash = "troubleshooting";
      return;
    }
    if (route.startsWith("troubleshooting/")){
      window.location.hash = route;
      return;
    }

    if (route.startsWith("checklists/")){
      const which = route.split("/")[1];
      showChecklistDetail(which);
      return;
    }

    window.location.hash = route;
    return;
  }

  // Dock
  const dock = e.target.closest("[data-dock]");
  if (dock){
    const key = dock.dataset.dock;
    if (key === "home") showHome();
    else if (key === "screens") showScreensList();
    else if (key === "mixer") showMixerList();
    else if (key === "troubleshoot") {
      window.location.hash = "troubleshooting";
    }
    return;
  }
});

// Close sheet
sheetOverlay.addEventListener("click", hideParameterSheet);

// Back behavior
backBtn.addEventListener("click", ()=>{
  if (currentView === "gassing-params" || currentView === "machine-params"){
    showScreensList(); return;
  }
  if (currentView === "mixer-list" || window.location.hash.startsWith("#mixer/")){
    showMixerList(); return;
  }
  if (currentView === "checklist-detail"){
    showChecklistsList(); return;
  }
  if (currentView === "troubleshooting-issue"){
    window.location.hash = "troubleshooting"; return;
  }
  if (currentView === "troubleshooting-home"){
    showHome(); return;
  }
  if (currentView !== "home"){
    showHome(); return;
  }
  showHome();
});

// Search open/close
openSearch.addEventListener("click", showSearch);
closeSearch.addEventListener("click", showHome);

// Search debounce
searchInput.addEventListener("input", (e)=>{
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(()=>runSearch(e.target.value), 200);
});

// Keyboard
document.addEventListener("keydown", (e)=>{
  if (e.key === "Escape"){
    if (bottomSheet.classList.contains("active")) hideParameterSheet();
    else if (currentView === "gassing-params" || currentView === "machine-params") showScreensList();
    else if (currentView === "checklist-detail") showChecklistsList();
    else if (currentView === "troubleshooting-issue") window.location.hash = "troubleshooting";
    else showHome();
  }
  if ((e.ctrlKey || e.metaKey) && e.key === "k"){
    e.preventDefault();
    showSearch();
  }
});

// Swipe-to-close sheet
let touchStartY = 0;
bottomSheet.addEventListener("touchstart", (e)=>{
  touchStartY = e.touches[0].clientY;
},{passive:true});

bottomSheet.addEventListener("touchmove", (e)=>{
  const touchY = e.touches[0].clientY;
  const diff = touchY - touchStartY;
  if (diff > 0){
    e.preventDefault();
    bottomSheet.style.transform = `translateY(${diff}px)`;
  }
},{passive:false});

bottomSheet.addEventListener("touchend", (e)=>{
  const touchY = e.changedTouches[0].clientY;
  const diff = touchY - touchStartY;
  bottomSheet.style.transform = "";
  if (diff > 100) hideParameterSheet();
},{passive:true});

// Hash routing
window.addEventListener("hashchange", handleHashRoute);

// Init
handleHashRoute();
