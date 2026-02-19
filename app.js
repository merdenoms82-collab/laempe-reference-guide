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

// ===== PARAM DEFINITIONS =====
const GASSING_PARAMS = {
  numGassings: {
    name: "Number of Gassings",
    what: "Determines how many times amine gas is injected during one curing cycle.",
    increase: "Improves cure penetration on complex cores.",
    decrease: "May reduce cure strength on thick sections.",
    note: "More gassings increase total exposure and cycle time."
  },
  fillingPressure: {
    name: "Filling Pressure",
    what: "Controls air pressure used to blow sand into the corebox.",
    increase: "Denser core structure.",
    decrease: "Softer, less compacted fill."
  },
  fillingTime: {
    name: "Filling Time",
    what: "How long sand blow air is active.",
    increase: "More sand packed into corebox.",
    decrease: "Possible incomplete fill."
  },
  gassingPressure: {
    name: "Gassing Pressure",
    what: "Controls gas injection pressure during curing.",
    increase: "Stronger gas penetration.",
    decrease: "Reduced cure intensity."
  },
  gassingTime: {
    name: "Gassing Time",
    what: "How long gas flows into the core.",
    increase: "Harder cure.",
    decrease: "Potential under-cure."
  },
  timeToFinalPressure: {
    name: "Time to Final Pressure",
    what: "Ramp time from zero to full gas pressure.",
    increase: "More gradual pressure buildup.",
    decrease: "More aggressive pressure ramp."
  },
  postHardening: {
    name: "Post-Hardening Time",
    what: "Additional time core remains clamped after gassing stops.",
    increase: "More time for reaction stabilization.",
    decrease: "Less stabilization time.",
    note: "Allows reaction to stabilize before opening."
  },
  gasExhaust: {
    name: "Gas Exhaust Time",
    what: "Duration exhaust valve remains open to clear residual gas.",
    increase: "Long exhaust increases cycle time.",
    decrease: "Short exhaust may leave gas in cavity."
  },
  preHeating: {
    name: "Pre-Heating Time",
    what: "Time allowed for gas generator to reach operating temperature.",
    increase: "More stable gas generation before running.",
    decrease: "May reduce stability at startup.",
    note: "Ensures stable vaporization before production."
  }
};

// Machine screen: placeholders until you send the screenshot
const MACHINE_PARAMS = {
  machineMode: {
    name: "Machine Mode (placeholder)",
    what: "Placeholder. Replace with the real function shown on your Machine tab.",
    increase: "Placeholder (if applicable).",
    decrease: "Placeholder (if applicable).",
    note: "We will replace these once you send the Machine screen photo."
  },
  cycleOption: {
    name: "Cycle Option (placeholder)",
    what: "Placeholder description.",
    increase: "Placeholder.",
    decrease: "Placeholder."
  },
  timingSetting: {
    name: "Timing Setting (placeholder)",
    what: "Placeholder description.",
    increase: "Placeholder.",
    decrease: "Placeholder."
  },
  safetyInterlock: {
    name: "Safety / Interlock (placeholder)",
    what: "Placeholder description.",
    increase: "Placeholder.",
    decrease: "Placeholder."
  }
};

// ===== BASIC PAGES (placeholders) =====
const CONTENT = {
  basics: {
    title: "Operation",
    subtitle: "Start • Run • Shutdown",
    blocks: [
      { h: "Startup (placeholder)", p: "We will write this section next, one step at a time.", type: "tip" },
      { h: "Shutdown (placeholder)", p: "We will write this section later, one step at a time." }
    ]
  },
  loadbox: {
    title: "Load Box",
    subtitle: "Changeover / corebox setup",
    blocks: [
      { h: "Placeholder", p: "We will build Load Box steps after Screens + Checklists are locked.", type: "tip" }
    ]
  },
  troubleshoot: {
    title: "Fix It",
    subtitle: "Symptom → check first",
    blocks: [
      { h: "Placeholder", p: "We will build troubleshooting steps later.", type: "warn" }
    ]
  },
  safety: {
    title: "Safety",
    subtitle: "Emergency only",
    blocks: [
      { h: "Placeholder", p: "We will build emergency-only content later.", type: "warn" }
    ]
  }
};

// ===== CHECKLISTS (no saving) =====
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

function showBottomSheetForParam(param){
  sheetTitle.textContent = param.name || "Parameter";
  sheetWhat.textContent = param.what || "—";
  sheetIncrease.textContent = param.increase || "No significant change";
  sheetDecrease.textContent = param.decrease || "No significant change";

  if (param.note){
    sheetNote.textContent = param.note;
    sheetNoteContainer.style.display = "block";
  } else {
    sheetNoteContainer.style.display = "none";
  }

  sheetOverlay.classList.add("active");
  bottomSheet.classList.add("active");
}

function hideParameterSheet(){
  sheetOverlay.classList.remove("active");
  bottomSheet.classList.remove("active");
}

// ===== RENDER: Screens list =====
function renderScreensList(){
  return `
    <div class="screens-list">
      <div class="screen-item" data-screen="hydraulics">
        <div class="screen-icon">💧</div>
        <div class="screen-info">
          <div class="screen-name">Hydraulics / Pneumatics</div>
          <div class="screen-desc">Live air + vacuum + shooting pressure</div>
        </div>
        <div class="screen-arrow">→</div>
      </div>

      <div class="screen-item" data-screen="gassingParams">
        <div class="screen-icon">⚡</div>
        <div class="screen-info">
          <div class="screen-name">Gassing Parameters</div>
          <div class="screen-desc">Cure pressure/time, exhaust, post-hardening</div>
        </div>
        <div class="screen-arrow">→</div>
      </div>

      <div class="screen-item" data-screen="machine">
        <div class="screen-icon">🛠️</div>
        <div class="screen-info">
          <div class="screen-name">Machine</div>
          <div class="screen-desc">Adjustable machine settings</div>
        </div>
        <div class="screen-arrow">→</div>
      </div>

      <div class="screen-item" data-screen="sand">
        <div class="screen-icon">🏖️</div>
        <div class="screen-info">
          <div class="screen-name">Sand</div>
          <div class="screen-desc">Sand system info (placeholder)</div>
        </div>
        <div class="screen-arrow">→</div>
      </div>

      <div class="screen-item" data-screen="lg">
        <div class="screen-icon">🏭</div>
        <div class="screen-info">
          <div class="screen-name">LG</div>
          <div class="screen-desc">LG screen (placeholder)</div>
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
        <h3>About This Screen</h3>
        <p>Cure pressure/time, exhaust, post-hardening. Affects hardness + exposure.</p>
      </div>
    </div>
  `;
}

// ===== RENDER: Machine params (placeholders) =====
function renderMachineParams(){
  return `
    <div class="screen-header">
      <div class="screen-header-title">MACHINE</div>
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
        <h3>About This Screen</h3>
        <p>Machine settings. Tap a setting to see what it does. (Placeholders until we add real items.)</p>
      </div>
    </div>
  `;
}

// ===== MIXER MODULE (runs like Screens; placeholders for now) =====
function renderMixerList(){
  return `
    <div class="screens-list">
      <div class="screen-item" data-mixer="overview">
        <div class="screen-icon">🌀</div>
        <div class="screen-info">
          <div class="screen-name">Mixer Overview</div>
          <div class="screen-desc">What this page is for (placeholder)</div>
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
  detailTitle.textContent = "Checklists";
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

// ===== RENDER: Basic content pages =====
function renderContentPage(key){
  const page = CONTENT[key];
  if (!page) return;

  detailTitle.textContent = page.title;
  detailSub.textContent = page.subtitle;

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
  detailTitle.textContent = "Machine Screens";
  detailSub.textContent = "What each page tells you";
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
  detailTitle.textContent = "Machine Screens";
  detailSub.textContent = "Gassing Parameters";
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
  detailTitle.textContent = "Machine Screens";
  detailSub.textContent = "Machine";
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
  detailTitle.textContent = "Mixer";
  detailSub.textContent = "Screens and checks (placeholders)";
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
  detailTitle.textContent = "Mixer";
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
  setDockActive(""); // not on dock
  window.location.hash = "checklists";
  hideParameterSheet();
  renderChecklistList();
  currentView = "checklist-list";
}

function showChecklistDetail(which){
  homeView.hidden = true;
  detailView.hidden = false;
  searchView.hidden = true;
  setDockActive(""); // not on dock
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
    const hay = (page.title+" "+page.subtitle+" "+page.blocks.map(b=>b.h+" "+b.p).join(" ")).toLowerCase();
    if (hay.includes(term)) hits.push({type:"page", key, title:page.title, sub:page.subtitle});
  });

  // CHECKLISTS
  Object.entries(CHECKLISTS).forEach(([key,page])=>{
    const hay = (page.title+" "+page.subtitle+" "+page.sections.map(s=>s.label+" "+s.steps.join(" ")).join(" ")).toLowerCase();
    if (hay.includes(term)) hits.push({type:"checklist", key, title:page.title, sub:page.subtitle});
  });

  // Mixer + Screens (broad)
  const screenHay = "screens gassing parameters machine sand lg hydraulics pneumatics vacuum air";
  if (screenHay.includes(term)) hits.push({type:"route", key:"screens", title:"Screens", sub:"Machine screens list"});

  const mixerHay = "mixer mixing sand binder ratio checks cleaning";
  if (mixerHay.includes(term)) hits.push({type:"route", key:"mixer", title:"Mixer", sub:"Mixer module (placeholders)"});

  if (hits.length === 0){
    searchResults.innerHTML = `
      <div class="card">
        <h3>🔍 No results found</h3>
        <p>Try "vacuum", "clamp", "gassing", "machine", "mixer", or "shift".</p>
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
  // Screens items
  const screenItem = e.target.closest("[data-screen]");
  if (screenItem){
    const screenId = screenItem.dataset.screen;

    if (screenId === "gassingParams"){ showGassingParams(); return; }
    if (screenId === "machine"){ showMachineParams(); return; }

    // placeholders: hydraulics / sand / lg
    const label = screenItem.querySelector(".screen-name")?.textContent || "Screen";
    detailTitle.textContent = "Machine Screens";
    detailSub.textContent = label;
    dynamicContent.innerHTML = `
      <div class="stack">
        <div class="card card--tip">
          <h3>${label}</h3>
          <p>Placeholder screen. We will add step-by-step instructions and (optional) images later.</p>
        </div>
      </div>
    `;
    homeView.hidden = true;
    detailView.hidden = false;
    searchView.hidden = true;
    setDockActive("screens");
    window.location.hash = `screens/${screenId}`;
    hideParameterSheet();
    currentView = "content";
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
    if (param) showBottomSheetForParam(param);
    return;
  }

  // Param taps (machine)
  const machParam = e.target.closest("[data-machine-param]");
  if (machParam){
    const key = machParam.dataset.machineParam;
    const param = MACHINE_PARAMS[key];
    if (param) showBottomSheetForParam(param);
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

// Back button behavior
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
