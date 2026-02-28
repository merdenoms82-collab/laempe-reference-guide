// app.js

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
// Replace with your real Google Forms URL
const FEEDBACK_URL = "https://forms.gle/REPLACE_ME";

// ===== PARAM DEFINITIONS =====
// GASSING (mirrors HMI labels + order)
const GASSING_PARAMS = {
  numGassings: {
    name: "Number of gassings",
    what: "How many times amine gas is injected during one curing cycle.",
    increase: "May improve cure penetration on complex cores. Increases total cycle time/exposure.",
    decrease: "May reduce cure strength on thick sections. Shorter cycle.",
    note: "Pending confirmation: verify best practice for your jobs."
  },
  fillingPressure: {
    name: "Filling pressure [bar]",
    what: "Air pressure used during the fill/blow phase before gassing.",
    increase: "May pack sand harder (risk: overpack/venting issues).",
    decrease: "May reduce packing (risk: incomplete fill).",
    note: "Pending confirmation (your site commonly runs this near 0; some operators set pressure ~1)."
  },
  fillingTime: {
    name: "Filling time [s]",
    what: "How long the fill/blow phase runs before gassing.",
    increase: "May increase packing (risk: overfill/vent issues).",
    decrease: "May reduce packing (risk: incomplete fill).",
    note: "Pending confirmation (your site commonly runs this near 0; some operators set time ~2)."
  },
  gassingPressure: {
    name: "Gassing pressure [bar]",
    what: "Pressure used to inject gas into the core during curing.",
    increase: "Stronger penetration (risk: vent marks/holes if too aggressive).",
    decrease: "Reduced penetration (risk: under-cure).",
    note: "Pending confirmation: define safe ranges for your core families."
  },
  gassingTime: {
    name: "Gassing time [s]",
    what: "How long gas flows into the core (primary cure exposure).",
    increase: "Harder cure and longer cycle. Too high can cause holes/marks near vents on some jobs.",
    decrease: "Risk of under-cure and soft cores.",
    note: ""
  },
  timeToFinalPressure: {
    name: "Time to final pressure [s]",
    what: "Ramp time from start to full gassing pressure.",
    increase: "Slower ramp; gentler pressure buildup.",
    decrease: "Faster ramp; more aggressive pressure buildup.",
    note: "Pending confirmation: operators use this for complex cores, but exact effect should be verified."
  },
  postHardening: {
    name: "Post-hardening time [s]",
    what: "Extra time the core stays clamped after gassing stops.",
    increase: "More stabilization time before opening.",
    decrease: "Less stabilization time; may increase breakage risk on fragile cores.",
    note: "Pending confirmation (usage varies)."
  },
  gasExhaust: {
    name: "Gas exhaust time valve [s]",
    what: "How long exhaust valve stays open to clear residual gas after gassing.",
    increase: "Less smell/residual gas; increases cycle time.",
    decrease: "Faster cycle; may leave residual gas/odor.",
    note: "Operators use this to reduce smell/odor. Verify site policy."
  },
  preHeating: {
    name: "Pre-heating time [s]",
    what: "Time allowed for the gas generator to reach operating temperature before running.",
    increase: "More stable generation (useful for cold starts/cold conditions).",
    decrease: "Faster start; may reduce stability on startup.",
    note: "Pending confirmation: commonly used when box/conditions are cold."
  }
};

// MACHINE (Shot Parameters — mirrors HMI labels + order)
const MACHINE_PARAMS = {
  numberOfShots: {
    name: "Number of shots",
    what: "How many sand blows occur per cycle.",
    increase: "Longer cycle; may improve fill on complex shapes (risk: overfill).",
    decrease: "Shorter cycle; risk of incomplete fill.",
    note: "Pending confirmation: common practice varies by job."
  },
  shootingPressure: {
    name: "Shooting pressure [bar]",
    what: "Air pressure used to blow sand into the corebox.",
    increase: "Risk: flashing/venting issues if too high.",
    decrease: "Risk: incomplete fill if too low.",
    note: "Pending confirmation."
  },
  shootingTime: {
    name: "Shooting time [s]",
    what: "Duration of the sand blow.",
    increase: "May overpack; increases cycle time.",
    decrease: "Risk: incomplete cavity fill.",
    note: "Pending confirmation."
  },
  exhaustTimeCorebox: {
    name: "Exhaust time corebox [s]",
    what: "Time the corebox exhaust remains open after shooting.",
    increase: "More venting; increases cycle time.",
    decrease: "Risk: trapped air / uneven fill.",
    note: "Pending confirmation."
  },
  exhaustTimeValve: {
    name: "Exhaust time valve [s]",
    what: "Duration of valve exhaust after shooting.",
    increase: "More venting; increases cycle time.",
    decrease: "Risk: incomplete venting.",
    note: "Pending confirmation."
  },
  sandRefillInterval: {
    name: "Sand refill interval",
    what: "How frequently automatic sand refills occur.",
    increase: "Refills less often (risk: hopper runs low).",
    decrease: "Refills more often (adds extra cycling).",
    note: "Pending confirmation."
  },
  sandRefillTime1: {
    name: "Sand refill time 1 [s]",
    what: "Primary refill duration.",
    increase: "Longer refill; increases refill time.",
    decrease: "Shorter refill; risk of low sand.",
    note: "Pending confirmation."
  },
  sandRefillTime2: {
    name: "Sand refill time 2 [s]",
    what: "Secondary refill duration (if used).",
    increase: "Longer refill; increases refill time.",
    decrease: "Shorter refill; may not complete refill.",
    note: "Pending confirmation."
  },
  remainingShotsCounter: {
    name: "Remaining shots counter",
    what: "Displays remaining programmed shot count.",
    increase: "",
    decrease: "",
    note: "Display only."
  }
};

// ===== BOTTOM-SHEET ONLY SCREENS =====
const SCREEN_SHEETS = {
  pneu: {
    whatLabel: "PNEU",
    what: [
      "Sensor 41 — Removal",
      "Sensor 51 — Machine functions",
      "Sensor 61 — Machine",
      "",
      "Reset Air: commonly used to clear sensor-related stops by cycling air off/on."
    ].join("\n"),
    note: "Sensors are located together in the cabinet in front of the machine. Details can be refined via operator feedback."
  },
  sand: {
    whatLabel: "SAND",
    what: [
      "Sand Demand: indicates the hopper is low.",
      "Release: enable to automatically make sand whenever it is low.",
      "",
      "Mixer states shown: Mixing • Transporting • Ready."
    ].join("\n"),
    note: "Exact wording may vary by configuration."
  },
  lg: {
    whatLabel: "LG",
    what: [
      "Pre-dosing [strokes]: amount added before cycle dosing. (Pending confirmation on best-use.)",
      "Post dosing start delay [s]: delay before post dosing begins. (Pending confirmation.)",
      "Maximum post dosing [strokes]: maximum allowed post dosing amount. (Pending confirmation.)",
      "Post dosing [strokes]: amount added after main dosing (if used). (Pending confirmation.)"
    ].join("\n"),
    note: "Operator practice varies by job. Confirmed screen; usage details pending."
  }
};

// ===== BASIC PAGES (placeholders) =====
const CONTENT = {
  basics: {
    title: "Machine Operation",
    subtitle: "Start • Run • Shutdown",
    blocks: [
      { h: "Startup (placeholder)", p: "We will write this section next, one step at a time.", type: "tip" },
      { h: "Shutdown (placeholder)", p: "We will write this section later, one step at a time." }
    ]
  },
  loadbox: {
    title: "Corebox Setup",
    subtitle: "Changeover & configuration",
    blocks: [
      { h: "Placeholder", p: "We will build Corebox Setup steps after Screens + Checklists are locked.", type: "tip" }
    ]
  },
  troubleshoot: {
    title: "Troubleshooting",
    subtitle: "Symptoms → check first",
    blocks: [
      { h: "Placeholder", p: "We will build troubleshooting steps later.", type: "warn" }
    ]
  },
  safety: {
    title: "Emergency & Safety",
    subtitle: "Critical procedures only",
    blocks: [
      { h: "Placeholder", p: "We will build emergency-only content later.", type: "warn" }
    ]
  },
  feedback: {
    title: "Operator Feedback",
    subtitle: "Submit improvement input",
    blocks: [
      { h: "Submit feedback", p: "Use the button below to submit corrections, missing steps, or suggestions.", type: "tip" }
    ]
  }
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
          "Verify the quantity needed for the shift."
        ]
      },
      {
        label: "Corebox / Cores",
        steps: [
          "Verify the correct corebox for the job.",
          "Verify cores are acceptable quality and match the corebox being run."
        ]
      },
      {
        label: "Machine / Materials",
        steps: [
          "Verify sand supply is adequate for the run.",
          "Verify machine is ready to run (no active faults, area clear, guards OK)."
        ]
      },
      {
        label: "Paperwork & Labels",
        steps: [
          "Complete the Production Log / Scrap & Downtime sheet.",
          "Print labels with parts, date, shift, and quantity."
        ]
      },
      {
        label: "Finish",
        steps: [
          "If anything is missing or abnormal, notify supervisor/lead before starting production."
        ]
      }
    ]
  },
  end: {
    title: "End of Shift",
    subtitle: "Closeout steps before leaving",
    sections: [
      {
        label: "Production Closeout",
        steps: [
          "Verify final quantity produced for the shift.",
          "Move completed parts to the correct designated area."
        ]
      },
      {
        label: "Scrap / Documentation",
        steps: [
          "Record all scrap and downtime on the Production Log / Scrap & Downtime sheet.",
          "Verify paperwork is complete and accurate before leaving."
        ]
      },
      {
        label: "Machine Condition",
        steps: [
          "Return machine to start position.",
          "Clean machine as required (remove sand buildup, wipe surfaces as needed).",
          "Clean the mixer and return it to start position.",
          "Empty trash and clear work area around the machine."
        ]
      },
      {
        label: "Machine State",
        steps: [
          "Leave the carriage out.",
          "Leave the machine in Manual mode."
        ]
      }
    ]
  }
};

// ===== STATE =====
let currentView = "home"; // home | screens-list | gassing-params | machine-params | mixer-list | checklist-list | checklist-detail | content | search

// ===== HELPERS =====
function setDockActive(key){
  document.querySelectorAll(".dockBtn").forEach(btn=>{
    btn.classList.toggle("is-active", btn.dataset.dock === key);
  });
}

function showBottomSheet(payload){
  // payload: { title, whatLabel, what, increase?, decrease?, note? }
  sheetTitle.textContent = payload.title || "SETTINGS";
  sheetLabelWhat.textContent = payload.whatLabel ? payload.whatLabel.toUpperCase() : "WHAT IT DOES";

  sheetWhat.textContent = payload.what || "—";

  const hasEffects = Boolean(payload.increase || payload.decrease);
  if (hasEffects){
    sheetIncrease.textContent = payload.increase || "—";
    sheetDecrease.textContent = payload.decrease || "—";
    effectRow.style.display = "flex";
    sheetDivider.style.display = "block";
  } else {
    effectRow.style.display = "none";
    sheetDivider.style.display = "none";
  }

  if (payload.note){
    sheetNote.textContent = payload.note;
    sheetNoteContainer.style.display = "block";
  } else {
    sheetNoteContainer.style.display = "none";
  }

  sheetOverlay.classList.add("active");
  requestAnimationFrame(() => bottomSheet.classList.add("active"));
}

function hideParameterSheet(){
  sheetOverlay.classList.remove("active");
  bottomSheet.classList.remove("active");
}

// ===== RENDER: Screens list =====
function renderScreensList(){
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
function renderGassingParams(){
  return `
    <div class="screen-header">
      <div class="screen-header-title">GASSING PARAMETERS</div>
    </div>

    <div class="hmi-container">
      <div class="simulated-hmi">
        <div class="hmi-param-grid">
          ${Object.entries(GASSING_PARAMS).map(([key,p])=>`
            <div class="hmi-param" data-param="${key}">
              <span class="param-name">${p.name}</span>
              <span class="tap-indicator"></span>
            </div>
          `).join("")}
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
function renderMachineParams(){
  return `
    <div class="screen-header">
      <div class="screen-header-title">MACHINE SHOT PARAMETERS</div>
    </div>

    <div class="hmi-container">
      <div class="simulated-hmi">
        <div class="hmi-param-grid">
          ${Object.entries(MACHINE_PARAMS).map(([key,p])=>`
            <div class="hmi-param" data-machine-param="${key}">
              <span class="param-name">${p.name}</span>
              <span class="tap-indicator"></span>
            </div>
          `).join("")}
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
function renderMixerList(){
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
function renderChecklistList(){
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
function renderChecklistDetail(which){
  const page = CHECKLISTS[which];
  if (!page) return;

  detailTitle.textContent = page.title;
  detailSub.textContent = page.subtitle;

  let n = 1;
  dynamicContent.innerHTML = `
    <div class="stack">
      ${page.sections.map(sec=>`
        <div class="card">
          <div class="sectionLabel">${sec.label}</div>
          <div class="stepsWrap">
            ${sec.steps.map(step=>`
              <div class="stepRow">
                <div class="stepNum">${n++}</div>
                <div class="stepText">${step}</div>
              </div>
            `).join("")}
          </div>
        </div>
      `).join("")}
    </div>
  `;
}

// ===== RENDER: Content pages =====
function renderContentPage(key){
  const page = CONTENT[key];
  if (!page) return;

  detailTitle.textContent = page.title;
  detailSub.textContent = page.subtitle;

  if (key === "feedback"){
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
      ${page.blocks.map(b=>{
        const klass = b.type === "warn" ? "card card--warn" :
                      b.type === "tip" ? "card card--tip" : "card";
        return `
          <div class="${klass}">
            <h3>${b.h}</h3>
            <p>${b.p}</p>
          </div>
        `;
      }).join("")}
    </div>
  `;
}

// ===== NAVIGATION =====
function showHome(){
  homeView.hidden = false;
  detailView.hidden = true;
  searchView.hidden = true;
  setDockActive("home");
  window.location.hash = "";
  hideParameterSheet();
  currentView = "home";
}

function showScreensList(){
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

function showGassingParams(){
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

function showMachineParams(){
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

function showMixerList(){
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

function showMixerPlaceholder(label, id){
  detailTitle.textContent = "Sand Mixer";
  detailSub.textContent = label;
  dynamicContent.innerHTML = `
    <div class="stack">
      <div class="card card--tip">
        <h3>${label}</h3>
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

function showChecklistsList(){
  homeView.hidden = true;
  detailView.hidden = false;
  searchView.hidden = true;
  setDockActive("");
  window.location.hash = "checklists";
  hideParameterSheet();
  renderChecklistList();
  currentView = "checklist-list";
}

function showChecklistDetail(which){
  homeView.hidden = true;
  detailView.hidden = false;
  searchView.hidden = true;
  setDockActive("");
  window.location.hash = `checklists/${which}`;
  hideParameterSheet();
  renderChecklistDetail(which);
  currentView = "checklist-detail";
}

function showDetail(key){
  if (key === "screens") return showScreensList();
  if (key === "mixer") return showMixerList();
  if (key === "checklists") return showChecklistsList();

  homeView.hidden = true;
  detailView.hidden = false;
  searchView.hidden = true;

  setDockActive(key === "troubleshoot" ? "troubleshoot" : "");
  window.location.hash = key;

  hideParameterSheet();
  renderContentPage(key);
  currentView = "content";
}

function showSearch(){
  homeView.hidden = true;
  detailView.hidden = true;
  searchView.hidden = false;
  setDockActive("");
  searchInput.value = "";
  searchResults.innerHTML = "";
  window.location.hash = "search";
  setTimeout(()=>searchInput.focus(), 50);
  hideParameterSheet();
  currentView = "search";
}

// ===== SEARCH =====
function highlightText(text, term){
  if (!term || !text) return text;
  const regex = new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')})`, 'gi');
  return String(text).replace(regex, '<mark>$1</mark>');
}

let searchTimeout;
function runSearch(q){
  const term = q.trim().toLowerCase();
  if (!term){ searchResults.innerHTML = ""; return; }

  const hits = [];

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

  // Screens keywords
  const screenHay = "screens gassing machine shots pressure time exhaust sand lg pneu vacuum air";
  if (screenHay.includes(term)) hits.push({type:"route", key:"screens", title:"Control Screens", sub:"Parameter & status reference"});

  const mixerHay = "mixer mixing sand binder ratio checks cleaning";
  if (mixerHay.includes(term)) hits.push({type:"route", key:"mixer", title:"Sand Mixer", sub:"Mixer module (placeholders)"});

  if (hits.length === 0){
    searchResults.innerHTML = `
      <div class="card">
        <h3>🔍 No results found</h3>
        <p>Try "vacuum", "clamp", "gassing", "shots", "exhaust", "shift".</p>
      </div>
    `;
    return;
  }

  searchResults.innerHTML = hits.map(hit=>{
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
}

// ===== EVENTS =====
document.addEventListener("click", (e)=>{

  // Feedback open button
  const fb = e.target.closest("#openFeedback");
  if (fb){
    window.open(FEEDBACK_URL, "_blank", "noopener,noreferrer");
    return;
  }

  // Screens items
  const screenItem = e.target.closest("[data-screen]");
  if (screenItem){
    const screenId = screenItem.dataset.screen;

    if (screenId === "gassingParams"){ showGassingParams(); return; }
    if (screenId === "machine"){ showMachineParams(); return; }

    // bottom-sheet only screens
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

  // Tiles (home + search results)
  const tile = e.target.closest("[data-route]");
  if (tile){
    const route = tile.dataset.route;

    if (route.startsWith("checklists/")){
      const which = route.split("/")[1];
      showChecklistDetail(which);
      return;
    }

    showDetail(route);
    return;
  }

  // Dock
  const dock = e.target.closest("[data-dock]");
  if (dock){
    const key = dock.dataset.dock;
    if (key === "home") showHome();
    else if (key === "screens") showScreensList();
    else if (key === "mixer") showMixerList();
    else if (key === "troubleshoot") showDetail("troubleshoot");
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

// Init
showHome();
