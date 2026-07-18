/* =====================================================================
   SIMULATED SMART GATE DASHBOARD LOGIC
   ===================================================================== */

// ---- Config: how long each transition/hold phase lasts (ms) ----------
const TIMING = {
  opening: 2600,   // Gate Closed -> Gate Opening... -> Gate Open
  openHold: 3200,  // how long the gate stays fully open before auto-closing
  closing: 2600,   // Gate Open -> Gate Closing... -> Gate Closed
  autoTriggerEvery: 9000 // if idle this long, simulate a new vehicle arriving
};

// ---- Per-state visual configuration -----------------------------------

const STATE_CONFIG = {
  closed: {
    label: 'Gate Closed',
    sub: 'STATE: CLOSED · AWAITING VEHICLE',
    dot: 'bg-slate-400',
    edge: 'bg-slate-500/40',
    textClass: 'text-slate-200',
    showProgress: false,
    showScanRing: false,
    gateOpen: false
  },
  opening: {
    label: 'Gate Opening...',
    sub: 'STATE: OPENING · SERVO DRIVING',
    dot: 'bg-amber-400',
    edge: 'bg-amber-400/70',
    textClass: 'text-amber-300',
    showProgress: true,
    progressColor: 'bg-amber-400',
    showScanRing: true,
    gateOpen: true // arm animates toward open during this phase
  },
  open: {
    label: 'Gate Open',
    sub: 'STATE: OPEN · PATH CLEAR CHECK ACTIVE',
    dot: 'bg-emerald-400',
    edge: 'bg-emerald-400/70',
    textClass: 'text-emerald-300',
    showProgress: false,
    showScanRing: false,
    gateOpen: true
  },
  closing: {
    label: 'Gate Closing...',
    sub: 'STATE: CLOSING · SERVO DRIVING',
    dot: 'bg-orange-400',
    edge: 'bg-orange-400/70',
    textClass: 'text-orange-300',
    showProgress: true,
    progressColor: 'bg-orange-400',
    showScanRing: true,
    gateOpen: false // arm animates back toward closed during this phase
  }
};

// ---- DOM references -----------------------------------------------------
const statusCard   = document.getElementById('statusCard');
const statusEdge   = document.getElementById('statusEdge');
const statusIcon   = document.getElementById('statusIcon');
const statusLabel  = document.getElementById('statusLabel');
const statusSub    = document.getElementById('statusSub');
const gateArm      = document.getElementById('gateArm');
const scanRing     = document.getElementById('scanRing');
const progressTrack = document.getElementById('progressTrack');
const progressBar  = document.getElementById('progressBar');
const commandLine  = document.getElementById('commandLine');
const triggerBtn   = document.getElementById('triggerBtn');
const logFeed      = document.getElementById('logFeed');
const statEntries  = document.getElementById('statEntries');
const statLastTriggered = document.getElementById('statLastTriggered');
const clockEl      = document.getElementById('clock');

// ---- Simulation state ----------------------------------------------------
let currentState = 'closed';
let cycleInProgress = false;
let entriesToday = 0;
let idleTimer = null;

// ---- Helpers --------------------------------------------------------------

/** HH:MM:SS for log timestamps and the header clock. */
function timeNow() {
  return new Date().toLocaleTimeString('en-GB', { hour12: false });
}

/** Appends one line to the activity feed, newest entry on top. */
function logEvent(text) {
  const line = document.createElement('div');
  line.innerHTML = `<span class="text-[#4A5673]">${timeNow()}</span> — ${text}`;
  logFeed.prepend(line);

  // Cap the visible log so it doesn't grow forever in a long demo session.
  while (logFeed.children.length > 30) {
    logFeed.removeChild(logFeed.lastChild);
  }
}

/** Applies a state's full visual configuration to the DOM. */
function renderState(state) {
  const cfg = STATE_CONFIG[state];
  currentState = state;

  // Label + sub-readout
  statusLabel.textContent = cfg.label;
  statusLabel.className = `font-display font-700 text-3xl md:text-4xl uppercase tracking-wide ${cfg.textClass}`;
  statusSub.textContent = cfg.sub;

  // Status dot + top edge accent
  statusIcon.className = `w-3 h-3 rounded-full ${cfg.dot}`;
  statusEdge.className = `absolute inset-x-0 top-0 h-1 ${cfg.edge}` + (cfg.showProgress ? ' edge-glow' : '');

  // Boom barrier arm position (CSS transition handles the smooth motion)
  gateArm.classList.toggle('is-open', cfg.gateOpen);

  // Scan ring only shown mid-transition
  scanRing.style.opacity = cfg.showScanRing ? '1' : '0';

  // Progress bar only shown mid-transition; width is animated separately
  // by runProgressBar() so it visually fills across the transition time.
  progressTrack.style.opacity = cfg.showProgress ? '1' : '0';
  if (cfg.showProgress) {
    progressBar.className = `h-full w-0 rounded-full ${cfg.progressColor}`;
  }
}

/** Animates the progress bar from 0% to 100% over `duration` ms. */
function runProgressBar(duration) {
  progressBar.style.transition = 'none';
  progressBar.style.width = '0%';
  // Force reflow so the transition below reliably restarts from 0%.
  void progressBar.offsetWidth;
  progressBar.style.transition = `width ${duration}ms linear`;
  progressBar.style.width = '100%';
}

/** Small promise-based wrapper around setTimeout for readable sequencing. */
function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ---- Core simulated gate cycle --------------------------------------------
// Closed -> Opening... -> Open -> (auto, "path clear") -> Closing... -> Closed
async function runGateCycle(speed) {
  if (cycleInProgress) return;
  cycleInProgress = true;
  clearTimeout(idleTimer);
  triggerBtn.disabled = true;
  triggerBtn.textContent = 'Cycle In Progress…';

  logEvent(`Sensor triggered <span class="text-[#4A5673]">(vehicle detected)</span>`);
  commandLine.innerHTML = `&gt; last command: <span class="text-[#8593AD]">servo.write(${speed})</span> // opening`;

  // --- Opening ---
  renderState('opening');
  runProgressBar(TIMING.opening);
  logEvent(`Gate opening <span class="text-[#4A5673]">(servo.write(${speed}))</span>`);
  await wait(TIMING.opening);

  // --- Open ---
  renderState('open');
  logEvent('Gate fully open');
  const nowLabel = timeNow();
  statLastTriggered.textContent = nowLabel;
  entriesToday += 1;
  statEntries.textContent = entriesToday;
  await wait(TIMING.openHold);

  // --- Closing (auto-triggered once the simulated path-clear check passes) ---
  logEvent('Path clear — closing gate');
  commandLine.innerHTML = `&gt; last command: <span class="text-[#8593AD]">servo.write(${speed})</span> // closing`;
  renderState('closing');
  runProgressBar(TIMING.closing);
  logEvent(`Gate closing <span class="text-[#4A5673]">(servo.write(${speed}))</span>`);
  await wait(TIMING.closing);

  // --- Back to Closed ---
  renderState('closed');
  logEvent('Gate closed — system idle');
  commandLine.innerHTML = `&gt; last command: <span class="text-[#8593AD]">servo.write(${speed})</span> // idle`;

  cycleInProgress = false;
  triggerBtn.disabled = false;
  triggerBtn.textContent = 'Simulate Trigger';

  scheduleIdleAutoTrigger();
}

/** Simulated ambient activity: if nothing happens for a while, a "vehicle"
 *  arrives on its own so the dashboard keeps feeling live during a demo. */
function scheduleIdleAutoTrigger() {
  clearTimeout(idleTimer);
  idleTimer = setTimeout(() => {
    if (!cycleInProgress) {
      const randomSpeed = Math.floor(Math.random() * 10) + 1; // 1-10, mirrors the Blockly block's speed input
      runGateCycle(randomSpeed);
    }
  }, TIMING.autoTriggerEvery);
}

// ---- Wire up controls -------------------------------------------------------
triggerBtn.addEventListener('click', () => {
  const randomSpeed = Math.floor(Math.random() * 10) + 1;
  runGateCycle(randomSpeed);
});

// ---- Live header clock (purely cosmetic, updates every second) -------------
function tickClock() {
  clockEl.textContent = timeNow();
}
tickClock();
setInterval(tickClock, 1000);

// ---- Boot -------------------------------------------------------------------
renderState('closed');
logEvent('System initialized — sensor online');
scheduleIdleAutoTrigger();
