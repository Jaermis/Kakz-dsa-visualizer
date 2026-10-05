// ==========================================================================
// Array Algorithm Visualizer - Interactive Engine (C Syntax Logging)
// ==========================================================================

// Application State
let currentArray = [29, 10, 14, 37, 13, 85, 42, 6];
let steps = [];
let currentStepIndex = 0;
let isPlaying = false;
let playInterval = null;
let playSpeed = 600; // ms

// DOM Elements
const arrayContainer = document.getElementById("array-container");
const auxStage = document.getElementById("aux-stage");
const auxContainer = document.getElementById("aux-container");
const auxTitle = document.getElementById("aux-title");
const statusBox = document.getElementById("status-box");
const codeBox = document.getElementById("code-box");
const stepCounter = document.getElementById("step-counter");
const speedRange = document.getElementById("speed-range");
const speedLabel = document.getElementById("speed-label");

// Buttons
const btnPrevStep = document.getElementById("btn-prev-step");
const btnNextStep = document.getElementById("btn-next-step");
const btnPlayPause = document.getElementById("btn-play-pause");
const btnResetAlgo = document.getElementById("btn-reset-algo");
const btnRandomize = document.getElementById("btn-randomize");
const btnResetZero = document.getElementById("btn-reset-zero");
const btnResize = document.getElementById("btn-resize");
const btnApplyCustom = document.getElementById("btn-apply-custom");

// Inputs
const inputSize = document.getElementById("array-size");
const inputCustom = document.getElementById("custom-array-input");

// --- Initialization ---
function init() {
  setupEventListeners();
  renderArrayState({
    array: [...currentArray],
    boxStates: {},
    pointers: {},
    aux: null,
    status: "Array initialized. Choose an operation and click Start to begin.",
    code: `/* Initial C Array Declaration */\nint arr[${currentArray.length}] = {${currentArray.join(", ")}};\nint size = ${currentArray.length};`
  });
  updatePlaybackControls();
}

// Setup Event Listeners
function setupEventListeners() {
  // Top-Level Data Structure Navigation Tabs
  const dsButtons = document.querySelectorAll(".ds-nav-btn");
  dsButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const ds = btn.dataset.ds;
      if (btn.classList.contains("disabled")) {
        const titleName = btn.textContent.trim().replace("Soon", "").trim();
        statusBox.textContent = `The ${titleName} visualizer module is planned for a future update.`;
        if (llStatusBox) llStatusBox.textContent = `The ${titleName} visualizer module is planned for a future update.`;
      } else {
        dsButtons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        if (ds === "array") {
          document.getElementById("ds-content-array").classList.remove("hidden");
          document.getElementById("ds-content-linkedlist").classList.add("hidden");
          pauseLLPlayback();
        } else if (ds === "linkedlist") {
          document.getElementById("ds-content-array").classList.add("hidden");
          document.getElementById("ds-content-linkedlist").classList.remove("hidden");
          pausePlayback();
          initLinkedListVisualizer();
        }
      }
    });
  });

  // Algorithm Sub-Tabs
  const tabButtons = document.querySelectorAll(".tab-btn");
  tabButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      tabButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const category = btn.dataset.category;
      document.querySelectorAll(".algo-options").forEach(opt => opt.classList.add("hidden"));
      const activeOpt = document.getElementById(`opt-${category}`);
      if (activeOpt) activeOpt.classList.remove("hidden");
    });
  });

  // Array Global Controls
  btnRandomize.addEventListener("click", randomizeArray);
  btnResetZero.addEventListener("click", resetArrayToZero);
  btnResize.addEventListener("click", resizeArray);
  btnApplyCustom.addEventListener("click", applyCustomArray);

  // Playback Controls
  btnNextStep.addEventListener("click", stepForward);
  btnPrevStep.addEventListener("click", stepBackward);
  btnPlayPause.addEventListener("click", togglePlayPause);
  btnResetAlgo.addEventListener("click", resetSimulation);

  speedRange.addEventListener("input", (e) => {
    playSpeed = parseInt(e.target.value);
    speedLabel.textContent = `${playSpeed}ms`;
    if (isPlaying) {
      clearInterval(playInterval);
      playInterval = setInterval(stepForward, playSpeed);
    }
  });

  // Algorithm Start Buttons
  document.getElementById("btn-start-search").addEventListener("click", handleStartSearch);
  document.getElementById("btn-start-insertion").addEventListener("click", handleStartInsertion);
  document.getElementById("btn-start-deletion").addEventListener("click", handleStartDeletion);
  document.getElementById("btn-start-reversal").addEventListener("click", handleStartReversal);
  document.getElementById("btn-start-rotation").addEventListener("click", handleStartRotation);
  document.getElementById("btn-start-sorting").addEventListener("click", handleStartSorting);
}

// --- Array Base Management ---
function randomizeArray() {
  pausePlayback();
  const size = currentArray.length;
  currentArray = Array.from({ length: size }, () => Math.floor(Math.random() * 90) + 10);
  clearSimulation();
  renderArrayState({
    array: [...currentArray],
    boxStates: {},
    pointers: {},
    aux: null,
    status: `Array randomized with ${size} values.`,
    code: `/* C Randomization */\nfor (int i = 0; i < ${size}; i++) {\n    arr[i] = (rand() % 90) + 10;\n}`
  });
}

function resetArrayToZero() {
  pausePlayback();
  currentArray = currentArray.map(() => 0);
  clearSimulation();
  renderArrayState({
    array: [...currentArray],
    boxStates: {},
    pointers: {},
    aux: null,
    status: "Array reset. All box values set to 0.",
    code: `/* Reset array in C */\nfor (int i = 0; i < ${currentArray.length}; i++) {\n    arr[i] = 0;\n}`
  });
}

function resizeArray() {
  pausePlayback();
  const newSize = parseInt(inputSize.value);
  if (isNaN(newSize) || newSize < 3 || newSize > 16) {
    alert("Please enter an array size between 3 and 16.");
    return;
  }
  if (newSize > currentArray.length) {
    while (currentArray.length < newSize) {
      currentArray.push(Math.floor(Math.random() * 90) + 10);
    }
  } else {
    currentArray = currentArray.slice(0, newSize);
  }
  clearSimulation();
  renderArrayState({
    array: [...currentArray],
    boxStates: {},
    pointers: {},
    aux: null,
    status: `Array resized to ${newSize} elements.`,
    code: `/* C Array Size Declaration */\n#define SIZE ${newSize}\nint arr[SIZE] = {${currentArray.join(", ")}};\nint size = SIZE;`
  });
}

function applyCustomArray() {
  pausePlayback();
  const raw = inputCustom.value.trim();
  if (!raw) return;
  const parts = raw.split(/[\s,]+/).map(v => parseInt(v)).filter(v => !isNaN(v));
  if (parts.length < 2 || parts.length > 16) {
    alert("Please provide between 2 and 16 comma-separated numbers.");
    return;
  }
  currentArray = parts;
  inputSize.value = parts.length;
  clearSimulation();
  renderArrayState({
    array: [...currentArray],
    boxStates: {},
    pointers: {},
    aux: null,
    status: `Custom array loaded with ${parts.length} elements.`,
    code: `/* Loaded Custom Array in C */\nint arr[${parts.length}] = {${parts.join(", ")}};\nint size = ${parts.length};`
  });
}

// --- Simulation Runner ---
function setSimulationSteps(generatedSteps) {
  pausePlayback();
  steps = generatedSteps;
  currentStepIndex = 0;
  if (steps.length > 0) {
    renderArrayState(steps[0]);
  }
  updatePlaybackControls();
}

function clearSimulation() {
  steps = [];
  currentStepIndex = 0;
  updatePlaybackControls();
}

function stepForward() {
  if (currentStepIndex < steps.length - 1) {
    currentStepIndex++;
    renderArrayState(steps[currentStepIndex]);
    updatePlaybackControls();
  } else {
    pausePlayback();
  }
}

function stepBackward() {
  if (currentStepIndex > 0) {
    currentStepIndex--;
    renderArrayState(steps[currentStepIndex]);
    updatePlaybackControls();
  }
}

function togglePlayPause() {
  if (isPlaying) {
    pausePlayback();
  } else {
    if (steps.length === 0) return;
    if (currentStepIndex >= steps.length - 1) {
      currentStepIndex = 0;
      renderArrayState(steps[0]);
    }
    isPlaying = true;
    btnPlayPause.textContent = "Pause";
    btnPlayPause.classList.add("btn-primary");
    playInterval = setInterval(stepForward, playSpeed);
  }
}

function pausePlayback() {
  isPlaying = false;
  clearInterval(playInterval);
  btnPlayPause.textContent = "Auto Play";
  btnPlayPause.classList.remove("btn-primary");
}

function resetSimulation() {
  pausePlayback();
  if (steps.length > 0) {
    currentStepIndex = 0;
    renderArrayState(steps[0]);
    updatePlaybackControls();
  }
}

function updatePlaybackControls() {
  const total = steps.length;
  const current = total > 0 ? currentStepIndex + 1 : 0;
  stepCounter.textContent = `${current} / ${total}`;

  btnPrevStep.disabled = total === 0 || currentStepIndex === 0;
  btnNextStep.disabled = total === 0 || currentStepIndex >= total - 1;
  btnPlayPause.disabled = total === 0;
  btnResetAlgo.disabled = total === 0;
}

// --- DOM Rendering ---
function renderArrayState(step) {
  if (!step) return;

  const { array, boxStates = {}, pointers = {}, aux = null, status = "", code = "" } = step;

  // Render main array boxes
  arrayContainer.innerHTML = "";
  array.forEach((val, idx) => {
    const col = document.createElement("div");
    col.className = "array-col";

    // Index Label
    const idxLabel = document.createElement("span");
    idxLabel.className = "index-label";
    idxLabel.textContent = `[${idx}]`;
    col.appendChild(idxLabel);

    // Box
    const box = document.createElement("div");
    const stateClass = boxStates[idx] ? `state-${boxStates[idx]}` : "state-default";
    box.className = `array-box ${stateClass}`;
    box.textContent = val !== null && val !== undefined ? val : "";
    col.appendChild(box);

    // Pointers container
    const ptrContainer = document.createElement("div");
    ptrContainer.className = "pointers-container";
    if (pointers[idx]) {
      const ptrList = Array.isArray(pointers[idx]) ? pointers[idx] : [pointers[idx]];
      ptrList.forEach(p => {
        const badge = document.createElement("span");
        const cleanName = p.toLowerCase().replace(/[^a-z]/g, "");
        badge.className = `pointer-badge ptr-${cleanName}`;
        badge.textContent = p;
        ptrContainer.appendChild(badge);
      });
    }
    col.appendChild(ptrContainer);

    arrayContainer.appendChild(col);
  });

  // Render Auxiliary / Temp Stage
  if (aux && aux.items && aux.items.length > 0) {
    auxStage.style.display = "flex";
    auxTitle.textContent = aux.title || "Auxiliary / Temp Buffer:";
    auxContainer.innerHTML = "";
    aux.items.forEach(item => {
      const box = document.createElement("div");
      box.className = `array-box state-${item.state || "target"}`;
      box.style.width = "48px";
      box.style.height = "48px";
      box.textContent = item.value;
      if (item.label) {
        const wrap = document.createElement("div");
        wrap.className = "array-col";
        const lbl = document.createElement("span");
        lbl.className = "index-label";
        lbl.textContent = item.label;
        wrap.appendChild(lbl);
        wrap.appendChild(box);
        auxContainer.appendChild(wrap);
      } else {
        auxContainer.appendChild(box);
      }
    });
  } else {
    auxStage.style.display = "none";
  }

  // Update Status & Code
  statusBox.textContent = status;
  codeBox.textContent = code;
}

// Helper to push a snapshot
function createStep({ array, boxStates = {}, pointers = {}, aux = null, status = "", code = "" }) {
  return {
    array: [...array],
    boxStates: { ...boxStates },
    pointers: JSON.parse(JSON.stringify(pointers)),
    aux: aux ? JSON.parse(JSON.stringify(aux)) : null,
    status,
    code
  };
}

// ==========================================================================
// ALGORITHM IMPLEMENTATIONS & STEP GENERATORS (C SYNTAX)
// ==========================================================================

// --- 1. SEARCHING ---
function handleStartSearch() {
  const type = document.getElementById("search-type").value;
  const target = parseInt(document.getElementById("search-target").value);
  if (isNaN(target)) {
    alert("Please enter a valid target integer to search.");
    return;
  }

  if (type === "linear") {
    generateLinearSearchSteps(target);
  } else {
    generateBinarySearchSteps(target);
  }
}

function generateLinearSearchSteps(target) {
  const arr = [...currentArray];
  const n = arr.length;
  const genSteps = [];

  genSteps.push(createStep({
    array: arr,
    status: `Starting Linear Search in C for target = ${target}.`,
    code: `/* Linear Search in C */\nint linearSearch(int arr[], int size, int target) {\n    for (int i = 0; i < size; i++) {\n        if (arr[i] == target)\n            return i;\n    }\n    return -1;\n}`
  }));

  let found = false;
  const states = {};

  for (let i = 0; i < n; i++) {
    states[i] = "current";
    genSteps.push(createStep({
      array: arr,
      boxStates: { ...states },
      pointers: { [i]: ["i"] },
      status: `Checking index [${i}]: Is arr[${i}] (${arr[i]}) == ${target}?`,
      code: `/* Iteration i = ${i} */\nif (arr[${i}] == ${target}) /* Evaluates to ${arr[i] === target ? "1 (true)" : "0 (false)"} */`
    }));

    if (arr[i] === target) {
      states[i] = "success";
      genSteps.push(createStep({
        array: arr,
        boxStates: { ...states },
        pointers: { [i]: ["FOUND!"] },
        status: `Match found! Element ${target} is located at index ${i}.`,
        code: `return ${i}; /* Target located at index ${i} after ${i + 1} comparison(s) */`
      }));
      found = true;
      break;
    } else {
      states[i] = "eliminated";
    }
  }

  if (!found) {
    genSteps.push(createStep({
      array: arr,
      boxStates: { ...states },
      status: `Search finished. Target ${target} not found in array.`,
      code: `return -1; /* Target not found */`
    }));
  }

  setSimulationSteps(genSteps);
}

function generateBinarySearchSteps(target) {
  // Ensure array is sorted for binary search
  const sortedArr = [...currentArray].sort((a, b) => a - b);
  currentArray = sortedArr; // sync back

  const n = sortedArr.length;
  const genSteps = [];

  genSteps.push(createStep({
    array: sortedArr,
    status: `Array auto-sorted for Binary Search in C. Target = ${target}.`,
    code: `/* Binary Search in C */\nint binarySearch(int arr[], int low, int high, int target) {\n    while (low <= high) {\n        int mid = low + (high - low) / 2;\n        if (arr[mid] == target) return mid;\n        else if (arr[mid] < target) low = mid + 1;\n        else high = mid - 1;\n    }\n    return -1;\n}`
  }));

  let low = 0;
  let high = n - 1;
  let found = false;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const boxStates = {};
    for (let k = 0; k < n; k++) {
      if (k < low || k > high) {
        boxStates[k] = "eliminated";
      }
    }
    boxStates[mid] = "current";

    const pointers = {};
    if (low === high && low === mid) {
      pointers[mid] = ["low", "high", "mid"];
    } else {
      if (!pointers[low]) pointers[low] = [];
      pointers[low].push("low");
      if (!pointers[high]) pointers[high] = [];
      pointers[high].push("high");
      if (!pointers[mid]) pointers[mid] = [];
      if (!pointers[mid].includes("mid")) pointers[mid].push("mid");
    }

    genSteps.push(createStep({
      array: sortedArr,
      boxStates,
      pointers,
      status: `Current range: [${low} .. ${high}]. Calculated mid = ${low} + (${high} - ${low}) / 2 = ${mid}. Checking arr[${mid}] (${sortedArr[mid]}) == ${target}.`,
      code: `int low = ${low}, high = ${high};\nint mid = low + (high - low) / 2; /* mid = ${mid}, arr[${mid}] = ${sortedArr[mid]} */\nif (arr[mid] == ${target})`
    }));

    if (sortedArr[mid] === target) {
      boxStates[mid] = "success";
      genSteps.push(createStep({
        array: sortedArr,
        boxStates,
        pointers: { [mid]: ["FOUND!"] },
        status: `Match found! Target ${target} located at index ${mid}.`,
        code: `return ${mid}; /* Target found at index ${mid} */`
      }));
      found = true;
      break;
    } else if (sortedArr[mid] < target) {
      genSteps.push(createStep({
        array: sortedArr,
        boxStates,
        pointers,
        status: `arr[${mid}] (${sortedArr[mid]}) < ${target}. Target is in right half. Setting low = mid + 1 = ${mid + 1}.`,
        code: `else if (arr[mid] < target) {\n    low = mid + 1; /* low = ${mid + 1}, discard subarray [${low}..${mid}] */\n}`
      }));
      low = mid + 1;
    } else {
      genSteps.push(createStep({
        array: sortedArr,
        boxStates,
        pointers,
        status: `arr[${mid}] (${sortedArr[mid]}) > ${target}. Target is in left half. Setting high = mid - 1 = ${mid - 1}.`,
        code: `else {\n    high = mid - 1; /* high = ${mid - 1}, discard subarray [${mid}..${high}] */\n}`
      }));
      high = mid - 1;
    }
  }

  if (!found) {
    const eliminatedAll = {};
    for (let k = 0; k < n; k++) eliminatedAll[k] = "eliminated";
    genSteps.push(createStep({
      array: sortedArr,
      boxStates: eliminatedAll,
      status: `Binary search complete. low (${low}) > high (${high}). Target ${target} is not in array.`,
      code: `return -1; /* Target ${target} not found */`
    }));
  }

  setSimulationSteps(genSteps);
}

// --- 2. INSERTION ---
function handleStartInsertion() {
  const val = parseInt(document.getElementById("insert-val").value);
  const idx = parseInt(document.getElementById("insert-idx").value);

  if (isNaN(val)) {
    alert("Please enter a valid value to insert.");
    return;
  }
  if (isNaN(idx) || idx < 0 || idx > currentArray.length) {
    alert(`Please enter an index between 0 and ${currentArray.length}.`);
    return;
  }
  if (currentArray.length >= 16) {
    alert("Array is at maximum size (16). Please delete an element or resize.");
    return;
  }

  generateInsertionSteps(val, idx);
}

function generateInsertionSteps(val, targetIdx) {
  const orig = [...currentArray];
  const genSteps = [];
  const n = orig.length;

  // Step 1: Show value in auxiliary holder
  genSteps.push(createStep({
    array: orig,
    aux: { title: "Value to Insert (val)", items: [{ value: val, state: "target" }] },
    status: `Preparing to insert value ${val} at index [${targetIdx}] in C.`,
    code: `/* Array Insertion in C */\n// val = ${val}, index = ${targetIdx}, size = ${n}\nfor (int i = size - 1; i >= index; i--) {\n    arr[i + 1] = arr[i];\n}\narr[index] = val;\nsize++;`
  }));

  // Step 2: Allocate extra slot
  const workingArr = [...orig, ""];
  genSteps.push(createStep({
    array: workingArr,
    boxStates: { [workingArr.length - 1]: "shifted" },
    aux: { title: "Value to Insert (val)", items: [{ value: val, state: "target" }] },
    status: `Capacity expanded in memory to hold ${workingArr.length} elements.`,
    code: `/* Size increased for insertion */\nint new_size = ${workingArr.length};`
  }));

  // Step 3: Shift elements right from n-1 down to targetIdx
  for (let i = n - 1; i >= targetIdx; i--) {
    const states = { [i]: "current", [i + 1]: "shifted" };
    genSteps.push(createStep({
      array: workingArr,
      boxStates: states,
      pointers: { [i]: ["i"], [i + 1]: ["i+1"] },
      aux: { title: "Value to Insert (val)", items: [{ value: val, state: "target" }] },
      status: `Shifting arr[${i}] (${workingArr[i]}) right to arr[${i + 1}].`,
      code: `/* Shift right loop: i = ${i} */\narr[${i + 1}] = arr[${i}]; /* arr[${i + 1}] = ${workingArr[i]} */`
    }));

    workingArr[i + 1] = workingArr[i];
    workingArr[i] = "";

    genSteps.push(createStep({
      array: workingArr,
      boxStates: { [i + 1]: "shifted" },
      pointers: { [i]: ["vacant"], [i + 1]: ["shifted"] },
      aux: { title: "Value to Insert (val)", items: [{ value: val, state: "target" }] },
      status: `Element shifted. Slot arr[${i}] is now vacant for next step.`,
      code: `/* arr[${i + 1}] updated to ${workingArr[i + 1]} */`
    }));
  }

  // Step 4: Insert value at targetIdx
  workingArr[targetIdx] = val;
  genSteps.push(createStep({
    array: workingArr,
    boxStates: { [targetIdx]: "success" },
    pointers: { [targetIdx]: ["inserted"] },
    status: `Inserted value ${val} into arr[${targetIdx}]. Insertion complete!`,
    code: `arr[${targetIdx}] = ${val};\nsize++; /* New size is ${workingArr.length} */`
  }));

  // Update currentArray to new state
  currentArray = [...workingArr];
  inputSize.value = currentArray.length;
  setSimulationSteps(genSteps);
}

// --- 3. DELETION ---
function handleStartDeletion() {
  const idx = parseInt(document.getElementById("delete-idx").value);
  if (isNaN(idx) || idx < 0 || idx >= currentArray.length) {
    alert(`Please enter an index between 0 and ${currentArray.length - 1}.`);
    return;
  }
  if (currentArray.length <= 2) {
    alert("Array cannot be smaller than 2 elements.");
    return;
  }

  generateDeletionSteps(idx);
}

function generateDeletionSteps(targetIdx) {
  const orig = [...currentArray];
  const genSteps = [];
  const n = orig.length;
  const deletedVal = orig[targetIdx];

  // Step 1: Highlight target
  genSteps.push(createStep({
    array: orig,
    boxStates: { [targetIdx]: "target" },
    pointers: { [targetIdx]: ["delete"] },
    status: `Preparing to delete element arr[${targetIdx}] = ${deletedVal} in C.`,
    code: `/* Array Deletion in C */\n// index = ${targetIdx}, size = ${n}\nfor (int i = index; i < size - 1; i++) {\n    arr[i] = arr[i + 1];\n}\nsize--;`
  }));

  const workingArr = [...orig];
  workingArr[targetIdx] = "";

  genSteps.push(createStep({
    array: workingArr,
    boxStates: { [targetIdx]: "eliminated" },
    aux: { title: "Deleted Item", items: [{ value: deletedVal, state: "eliminated" }] },
    status: `Target arr[${targetIdx}] (${deletedVal}) marked for removal.`,
    code: `/* Removing element at index ${targetIdx} */\nint deleted_val = arr[${targetIdx}];`
  }));

  // Step 2: Shift left from targetIdx to n-2
  for (let i = targetIdx; i < n - 1; i++) {
    genSteps.push(createStep({
      array: workingArr,
      boxStates: { [i]: "target", [i + 1]: "current" },
      pointers: { [i]: ["i"], [i + 1]: ["i+1"] },
      aux: { title: "Deleted Item", items: [{ value: deletedVal, state: "eliminated" }] },
      status: `Shifting arr[${i + 1}] (${workingArr[i + 1]}) left to overwrite arr[${i}].`,
      code: `/* Shift left loop: i = ${i} */\narr[${i}] = arr[${i + 1}]; /* arr[${i}] = ${workingArr[i + 1]} */`
    }));

    workingArr[i] = workingArr[i + 1];
    workingArr[i + 1] = "";

    genSteps.push(createStep({
      array: workingArr,
      boxStates: { [i]: "shifted" },
      pointers: { [i]: ["shifted"] },
      aux: { title: "Deleted Item", items: [{ value: deletedVal, state: "eliminated" }] },
      status: `arr[${i}] updated with ${workingArr[i]}.`,
      code: `/* arr[${i}] now holds ${workingArr[i]} */`
    }));
  }

  // Step 3: Remove trailing empty box
  const finalArr = workingArr.slice(0, n - 1);
  genSteps.push(createStep({
    array: finalArr,
    boxStates: {},
    status: `Deletion complete! Array size decremented to ${finalArr.length} elements.`,
    code: `size--; /* Decrement size: size = ${finalArr.length} */`
  }));

  currentArray = [...finalArr];
  inputSize.value = currentArray.length;
  setSimulationSteps(genSteps);
}

// --- 4. REVERSAL (Two-Pointer Technique) ---
function handleStartReversal() {
  generateReversalSteps();
}

function generateReversalSteps() {
  const arr = [...currentArray];
  const n = arr.length;
  const genSteps = [];

  genSteps.push(createStep({
    array: arr,
    status: "Starting Two-Pointer Array Reversal in C.",
    code: `/* Array Reversal using Two Pointers in C */\nvoid reverseArray(int arr[], int size) {\n    int left = 0, right = size - 1;\n    while (left < right) {\n        int temp = arr[left];\n        arr[left] = arr[right];\n        arr[right] = temp;\n        left++;\n        right--;\n    }\n}`
  }));

  let left = 0;
  let right = n - 1;
  const settled = {};

  while (left < right) {
    const states = { ...settled, [left]: "current", [right]: "current" };
    const pointers = { [left]: ["left"], [right]: ["right"] };

    genSteps.push(createStep({
      array: arr,
      boxStates: states,
      pointers,
      status: `Comparing pointers: left = [${left}] (val: ${arr[left]}), right = [${right}] (val: ${arr[right]}). Preparing swap.`,
      code: `/* left = ${left}, right = ${right} */\nwhile (left < right) {\n    int temp = arr[${left}]; /* temp = ${arr[left]} */\n    arr[${left}] = arr[${right}];\n    arr[${right}] = temp;\n}`
    }));

    // Perform swap
    const temp = arr[left];
    arr[left] = arr[right];
    arr[right] = temp;

    states[left] = "shifted";
    states[right] = "shifted";

    genSteps.push(createStep({
      array: arr,
      boxStates: states,
      pointers,
      aux: { title: "Temp Swap Variable (int temp)", items: [{ value: temp, label: "temp" }] },
      status: `Swapped elements at arr[${left}] and arr[${right}]. Now incrementing left and decrementing right.`,
      code: `int temp = arr[${left}];\narr[${left}] = arr[${right}];\narr[${right}] = temp;\nleft++;  /* left becomes ${left + 1} */\nright--; /* right becomes ${right - 1} */`
    }));

    settled[left] = "success";
    settled[right] = "success";
    left++;
    right--;
  }

  // Center element if odd length
  if (left === right) {
    settled[left] = "success";
    genSteps.push(createStep({
      array: arr,
      boxStates: settled,
      pointers: { [left]: ["left=right"] },
      status: `Middle element at index [${left}] remains in place.`,
      code: `/* left == right (${left}), middle element requires no swap */`
    }));
  }

  genSteps.push(createStep({
    array: arr,
    boxStates: settled,
    status: "Array reversal complete!",
    code: `/* Array successfully reversed in-place */`
  }));

  currentArray = [...arr];
  setSimulationSteps(genSteps);
}

// --- 5. ROTATION ---
function handleStartRotation() {
  const dir = document.getElementById("rotate-direction").value;
  let k = parseInt(document.getElementById("rotate-k").value);
  const n = currentArray.length;

  if (isNaN(k) || k < 1) {
    alert("Please enter a valid shift position (k >= 1).");
    return;
  }
  k = k % n;
  if (k === 0) {
    alert(`k is a multiple of array size (${n}). Result will be identical.`);
    return;
  }

  generateRotationSteps(dir, k);
}

function generateRotationSteps(dir, k) {
  const arr = [...currentArray];
  const n = arr.length;
  const genSteps = [];

  const formulaStr = dir === "left"
    ? `temp[i] = arr[(i + k) % size]`
    : `temp[i] = arr[(i + size - k) % size]`;

  genSteps.push(createStep({
    array: arr,
    status: `Starting ${dir === "left" ? "Left" : "Right"} Shift Rotation by k = ${k} in C.`,
    code: `/* ${dir === "left" ? "Left" : "Right"} Shift Rotation in C (size = ${n}, k = ${k}) */\nint temp[${n}];\nfor (int i = 0; i < ${n}; i++) {\n    ${dir === "left" ? `temp[i] = arr[(i + ${k}) % ${n}];` : `temp[i] = arr[(i + ${n} - ${k}) % ${n}];`}\n}\nfor (int i = 0; i < ${n}; i++) arr[i] = temp[i];`
  }));

  // Target array to build step-by-step
  const rotated = new Array(n).fill("");

  for (let i = 0; i < n; i++) {
    // Exact user formula calculation for source index:
    const srcIdx = dir === "left"
      ? (i + k) % n
      : (i + n - k) % n;

    rotated[i] = arr[srcIdx];

    const calculationStr = dir === "left"
      ? `(${i} + ${k}) % ${n} = ${srcIdx}`
      : `(${i} + ${n} - ${k}) % ${n} = ${srcIdx}`;

    genSteps.push(createStep({
      array: arr,
      boxStates: { [srcIdx]: "target" },
      pointers: { [srcIdx]: [`src = [${srcIdx}]`] },
      aux: {
        title: `C Buffer (temp[0..${n-1}])`,
        items: rotated.map((v, idx) => ({
          value: v !== "" ? v : "-",
          label: `temp[${idx}]`,
          state: idx === i ? "shifted" : (v !== "" ? "success" : "default")
        }))
      },
      status: `Position i = [${i}]: Source element index is ${calculationStr}. Fetching arr[${srcIdx}] (${arr[srcIdx]}) into temp[${i}].`,
      code: `/* Iteration i = ${i} */\nint src_idx = ${calculationStr};\ntemp[${i}] = arr[src_idx]; /* temp[${i}] = arr[${srcIdx}] = ${arr[srcIdx]} */`
    }));
  }

  // Copy rotated back to main array
  const successStates = {};
  for (let i = 0; i < n; i++) successStates[i] = "success";

  genSteps.push(createStep({
    array: rotated,
    boxStates: successStates,
    aux: {
      title: `Rotated C Buffer (temp)`,
      items: rotated.map((v, idx) => ({ value: v, label: `temp[${idx}]`, state: "success" }))
    },
    status: `Rotation complete! Copying temp buffer back to main array.`,
    code: `/* Copy temp buffer back into main array */\nfor (int i = 0; i < ${n}; i++) {\n    arr[i] = temp[i];\n}`
  }));

  currentArray = [...rotated];
  setSimulationSteps(genSteps);
}

// --- 6. SORTING ---
function handleStartSorting() {
  const type = document.getElementById("sort-type").value;
  if (type === "bubble") {
    generateBubbleSortSteps();
  } else if (type === "selection") {
    generateSelectionSortSteps();
  } else if (type === "insertion") {
    generateInsertionSortSteps();
  }
}

function generateBubbleSortSteps() {
  const arr = [...currentArray];
  const n = arr.length;
  const genSteps = [];
  const sorted = {};

  genSteps.push(createStep({
    array: arr,
    status: "Starting Bubble Sort in C.",
    code: `/* Bubble Sort in C */\nvoid bubbleSort(int arr[], int n) {\n    for (int i = 0; i < n - 1; i++) {\n        for (int j = 0; j < n - i - 1; j++) {\n            if (arr[j] > arr[j + 1]) {\n                int temp = arr[j];\n                arr[j] = arr[j + 1];\n                arr[j + 1] = temp;\n            }\n        }\n    }\n}`
  }));

  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      const states = { ...sorted, [j]: "current", [j + 1]: "current" };
      const pointers = { [j]: ["j"], [j + 1]: ["j+1"] };

      genSteps.push(createStep({
        array: arr,
        boxStates: states,
        pointers,
        status: `Pass ${i + 1}: Comparing arr[${j}] (${arr[j]}) and arr[${j + 1}] (${arr[j + 1]}).`,
        code: `/* Pass i = ${i}, j = ${j} */\nif (arr[${j}] > arr[${j + 1}]) /* ${arr[j]} > ${arr[j + 1]} -> ${arr[j] > arr[j + 1] ? "1 (true)" : "0 (false)"} */`
      }));

      if (arr[j] > arr[j + 1]) {
        const temp = arr[j];
        arr[j] = arr[j + 1];
        arr[j + 1] = temp;

        states[j] = "shifted";
        states[j + 1] = "shifted";

        genSteps.push(createStep({
          array: arr,
          boxStates: states,
          pointers,
          status: `${temp} > ${arr[j]}, swapping elements.`,
          code: `int temp = arr[${j}]; /* temp = ${temp} */\narr[${j}] = arr[${j + 1}]; /* arr[${j}] = ${arr[j]} */\narr[${j + 1}] = temp;     /* arr[${j + 1}] = ${temp} */`
        }));
      }
    }

    // Element at n - i - 1 is now in its correct sorted spot
    sorted[n - i - 1] = "success";
    genSteps.push(createStep({
      array: arr,
      boxStates: { ...sorted },
      pointers: { [n - i - 1]: ["sorted"] },
      status: `Pass ${i + 1} complete. Element ${arr[n - i - 1]} at index [${n - i - 1}] is locked in sorted position.`,
      code: `/* arr[${n - i - 1}] is sorted */`
    }));
  }

  for (let k = 0; k < n; k++) sorted[k] = "success";
  genSteps.push(createStep({
    array: arr,
    boxStates: sorted,
    status: "Bubble sort complete! Array is fully sorted.",
    code: "/* Array sorted */"
  }));

  currentArray = [...arr];
  setSimulationSteps(genSteps);
}

function generateSelectionSortSteps() {
  const arr = [...currentArray];
  const n = arr.length;
  const genSteps = [];
  const sorted = {};

  genSteps.push(createStep({
    array: arr,
    status: "Starting Selection Sort in C. Minimum element in unsorted range is swapped to front.",
    code: `/* Selection Sort in C */\nvoid selectionSort(int arr[], int n) {\n    for (int i = 0; i < n - 1; i++) {\n        int min_idx = i;\n        for (int j = i + 1; j < n; j++) {\n            if (arr[j] < arr[min_idx])\n                min_idx = j;\n        }\n        int temp = arr[i];\n        arr[i] = arr[min_idx];\n        arr[min_idx] = temp;\n    }\n}`
  }));

  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;
    const states = { ...sorted, [i]: "target" };
    const pointers = { [i]: ["i", "min"] };

    genSteps.push(createStep({
      array: arr,
      boxStates: states,
      pointers,
      status: `Pass ${i + 1}: Setting initial min_idx = [${i}] (${arr[i]}).`,
      code: `/* Pass i = ${i} */\nint min_idx = ${i}; /* Initial min_idx = ${i} */`
    }));

    for (let j = i + 1; j < n; j++) {
      const stepStates = { ...sorted, [minIdx]: "target", [j]: "current" };
      const stepPointers = { [minIdx]: ["min"], [j]: ["j"] };
      if (!stepPointers[i]) stepPointers[i] = [];
      if (!stepPointers[i].includes("i")) stepPointers[i].push("i");

      genSteps.push(createStep({
        array: arr,
        boxStates: stepStates,
        pointers: stepPointers,
        status: `Comparing arr[${j}] (${arr[j]}) with current minimum arr[${minIdx}] (${arr[minIdx]}).`,
        code: `/* Inner loop j = ${j} */\nif (arr[${j}] < arr[min_idx]) /* ${arr[j]} < ${arr[minIdx]} -> ${arr[j] < arr[minIdx] ? "1 (true)" : "0 (false)"} */`
      }));

      if (arr[j] < arr[minIdx]) {
        minIdx = j;
        stepStates[minIdx] = "target";
        const newPointers = { [minIdx]: ["new min"], [i]: ["i"] };
        genSteps.push(createStep({
          array: arr,
          boxStates: stepStates,
          pointers: newPointers,
          status: `Found new minimum! Updated min_idx = [${minIdx}] (val: ${arr[minIdx]}).`,
          code: `min_idx = ${minIdx}; /* New minimum located at index ${minIdx} (val: ${arr[minIdx]}) */`
        }));
      }
    }

    if (minIdx !== i) {
      const temp = arr[i];
      arr[i] = arr[minIdx];
      arr[minIdx] = temp;

      const swapStates = { ...sorted, [i]: "shifted", [minIdx]: "shifted" };
      genSteps.push(createStep({
        array: arr,
        boxStates: swapStates,
        pointers: { [i]: ["swapped"], [minIdx]: ["swapped"] },
        status: `Swapping minimum element (${arr[i]}) from index [${minIdx}] into arr[${i}].`,
        code: `int temp = arr[${i}];\narr[${i}] = arr[${minIdx}];\narr[${minIdx}] = temp;`
      }));
    }

    sorted[i] = "success";
    genSteps.push(createStep({
      array: arr,
      boxStates: { ...sorted },
      pointers: { [i]: ["sorted"] },
      status: `Index [${i}] is now sorted with value ${arr[i]}.`,
      code: `/* arr[${i}] is now in final sorted position */`
    }));
  }

  for (let k = 0; k < n; k++) sorted[k] = "success";
  genSteps.push(createStep({
    array: arr,
    boxStates: sorted,
    status: "Selection sort complete! Array is fully sorted.",
    code: "/* Array sorted */"
  }));

  currentArray = [...arr];
  setSimulationSteps(genSteps);
}

function generateInsertionSortSteps() {
  const arr = [...currentArray];
  const n = arr.length;
  const genSteps = [];
  const sorted = { 0: "success" };

  genSteps.push(createStep({
    array: arr,
    boxStates: sorted,
    status: "Starting Insertion Sort in C. arr[0] is trivially sorted.",
    code: `/* Insertion Sort in C */\nvoid insertionSort(int arr[], int n) {\n    for (int i = 1; i < n; i++) {\n        int key = arr[i];\n        int j = i - 1;\n        while (j >= 0 && arr[j] > key) {\n            arr[j + 1] = arr[j];\n            j--;\n        }\n        arr[j + 1] = key;\n    }\n}`
  }));

  for (let i = 1; i < n; i++) {
    const key = arr[i];
    let j = i - 1;

    genSteps.push(createStep({
      array: arr,
      boxStates: { ...sorted, [i]: "target" },
      pointers: { [i]: ["key"] },
      aux: { title: "Selected Key (int key)", items: [{ value: key, label: "key", state: "target" }] },
      status: `Pass i = ${i}: Pick key = arr[${i}] (${key}). Comparing with sorted prefix arr[0 .. ${i - 1}].`,
      code: `int key = arr[${i}]; /* key = ${key} */\nint j = ${i - 1};`
    }));

    while (j >= 0 && arr[j] > key) {
      genSteps.push(createStep({
        array: arr,
        boxStates: { ...sorted, [j]: "current", [j + 1]: "shifted" },
        pointers: { [j]: ["j"], [j + 1]: ["j+1"] },
        aux: { title: "Selected Key (int key)", items: [{ value: key, label: "key", state: "target" }] },
        status: `arr[${j}] (${arr[j]}) > key (${key}). Shifting arr[${j}] right to arr[${j + 1}].`,
        code: `while (j >= 0 && arr[j] > key) {\n    arr[j + 1] = arr[j]; /* arr[${j + 1}] = ${arr[j]} */\n    j--;\n}`
      }));

      arr[j + 1] = arr[j];
      j--;

      genSteps.push(createStep({
        array: arr,
        boxStates: { ...sorted, [j + 1]: "shifted" },
        pointers: { [j + 1]: ["shifted"] },
        aux: { title: "Selected Key (int key)", items: [{ value: key, label: "key", state: "target" }] },
        status: `Element shifted right. Next checking index j = ${j}.`,
        code: `/* j decremented to ${j} */`
      }));
    }

    arr[j + 1] = key;
    sorted[i] = "success";
    for (let k = 0; k <= i; k++) sorted[k] = "success";

    genSteps.push(createStep({
      array: arr,
      boxStates: { ...sorted },
      pointers: { [j + 1]: ["inserted"] },
      aux: { title: "Selected Key (int key)", items: [{ value: key, label: "inserted", state: "success" }] },
      status: `Inserted key ${key} into arr[${j + 1}]. Subarray arr[0 .. ${i}] is now sorted.`,
      code: `arr[${j + 1}] = key; /* arr[${j + 1}] = ${key} */\n/* Prefix arr[0..${i}] is sorted */`
    }));
  }

  for (let k = 0; k < n; k++) sorted[k] = "success";
  genSteps.push(createStep({
    array: arr,
    boxStates: sorted,
    aux: null,
    status: "Insertion sort complete! Array is fully sorted.",
    code: "/* Array sorted */"
  }));

  currentArray = [...arr];
  setSimulationSteps(genSteps);
}

// ==========================================================================
// SINGLY LINKED LIST VISUALIZER ENGINE (C SYNTAX)
// ==========================================================================

let currentLinkedList = [15, 28, 42, 67, 89];
let llSteps = [];
let llCurrentStepIndex = 0;
let llIsPlaying = false;
let llPlayInterval = null;
let llPlaySpeed = 600; // ms
let llInitialized = false;

// Linked List DOM Elements
let llChainContainer, llAuxStage, llAuxContainer, llAuxTitle;
let llStatusBox, llCodeBox, llStepCounter, llSpeedRange, llSpeedLabel;
let btnLlPrevStep, btnLlNextStep, btnLlPlayPause, btnLlResetAlgo;
let btnLlRandomize, btnLlReset, btnLlResize, btnLlApplyCustom;
let inputLlSize, inputLlCustom;

function initLinkedListVisualizer() {
  if (!llInitialized) {
    setupLinkedListElements();
    setupLinkedListEventListeners();
    llInitialized = true;
  }
  renderLinkedListInitial();
}

function setupLinkedListElements() {
  llChainContainer = document.getElementById("ll-chain-container");
  llAuxStage = document.getElementById("ll-aux-stage");
  llAuxContainer = document.getElementById("ll-aux-container");
  llAuxTitle = document.getElementById("ll-aux-title");
  llStatusBox = document.getElementById("ll-status-box");
  llCodeBox = document.getElementById("ll-code-box");
  llStepCounter = document.getElementById("ll-step-counter");
  llSpeedRange = document.getElementById("ll-speed-range");
  llSpeedLabel = document.getElementById("ll-speed-label");

  btnLlPrevStep = document.getElementById("btn-ll-prev-step");
  btnLlNextStep = document.getElementById("btn-ll-next-step");
  btnLlPlayPause = document.getElementById("btn-ll-play-pause");
  btnLlResetAlgo = document.getElementById("btn-ll-reset-algo");

  btnLlRandomize = document.getElementById("btn-ll-randomize");
  btnLlReset = document.getElementById("btn-ll-reset");
  btnLlResize = document.getElementById("btn-ll-resize");
  btnLlApplyCustom = document.getElementById("btn-ll-apply-custom");

  inputLlSize = document.getElementById("ll-size");
  inputLlCustom = document.getElementById("custom-ll-input");
}

function setupLinkedListEventListeners() {
  // Linked List Sub-Tabs
  const llTabButtons = document.querySelectorAll("#ll-category-tabs .tab-btn");
  llTabButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      llTabButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const cat = btn.dataset.llcategory;
      document.querySelectorAll("#ds-content-linkedlist .algo-options").forEach(opt => opt.classList.add("hidden"));
      const activeOpt = document.getElementById(`opt-ll-${cat}`);
      if (activeOpt) activeOpt.classList.remove("hidden");
    });
  });

  // Dropdown toggles for Index input groups
  const selectInsertPos = document.getElementById("ll-insert-pos");
  const insertIdxGroup = document.getElementById("ll-insert-idx-group");
  selectInsertPos.addEventListener("change", () => {
    if (selectInsertPos.value === "index") {
      insertIdxGroup.classList.remove("hidden");
    } else {
      insertIdxGroup.classList.add("hidden");
    }
  });

  const selectDeletePos = document.getElementById("ll-delete-pos");
  const deleteIdxGroup = document.getElementById("ll-delete-idx-group");
  selectDeletePos.addEventListener("change", () => {
    if (selectDeletePos.value === "index") {
      deleteIdxGroup.classList.remove("hidden");
    } else {
      deleteIdxGroup.classList.add("hidden");
    }
  });

  // Setup buttons
  btnLlRandomize.addEventListener("click", randomizeLinkedList);
  btnLlReset.addEventListener("click", resetLinkedList);
  btnLlResize.addEventListener("click", resizeLinkedList);
  btnLlApplyCustom.addEventListener("click", applyCustomLinkedList);

  // Playback Controls
  btnLlNextStep.addEventListener("click", stepLLForward);
  btnLlPrevStep.addEventListener("click", stepLLBackward);
  btnLlPlayPause.addEventListener("click", toggleLLPlayPause);
  btnLlResetAlgo.addEventListener("click", resetLLSimulation);

  llSpeedRange.addEventListener("input", (e) => {
    llPlaySpeed = parseInt(e.target.value);
    llSpeedLabel.textContent = `${llPlaySpeed}ms`;
    if (llIsPlaying) {
      clearInterval(llPlayInterval);
      llPlayInterval = setInterval(stepLLForward, llPlaySpeed);
    }
  });

  // Algorithm Start Buttons
  document.getElementById("btn-ll-start-search").addEventListener("click", handleStartLLSearch);
  document.getElementById("btn-ll-start-insertion").addEventListener("click", handleStartLLInsertion);
  document.getElementById("btn-ll-start-deletion").addEventListener("click", handleStartLLDeletion);
  document.getElementById("btn-ll-start-reversal").addEventListener("click", handleStartLLReversal);
}

function renderLinkedListInitial() {
  clearLLSimulation();
  renderLinkedListState({
    nodes: currentLinkedList.map(v => ({ value: v, state: "default", arrow: "right" })),
    pointers: currentLinkedList.length > 0 ? { 0: ["head"] } : {},
    auxNode: null,
    status: "Singly Linked List initialized. Select an operation to visualize.",
    code: `/* Singly Linked List in C */\nstruct Node {\n    int data;\n    struct Node* next;\n};\n\nstruct Node* head = NULL; /* Initialized with ${currentLinkedList.length} node(s) */`
  });
  updateLLPlaybackControls();
}

// --- Linked List Base Management ---
function randomizeLinkedList() {
  pauseLLPlayback();
  const len = currentLinkedList.length > 0 ? currentLinkedList.length : 5;
  currentLinkedList = Array.from({ length: len }, () => Math.floor(Math.random() * 90) + 10);
  clearLLSimulation();
  renderLinkedListInitial();
}

function resetLinkedList() {
  pauseLLPlayback();
  currentLinkedList = [10];
  if (inputLlSize) inputLlSize.value = 1;
  clearLLSimulation();
  renderLinkedListState({
    nodes: [{ value: 10, state: "default", arrow: "right" }],
    pointers: { 0: ["head"] },
    auxNode: null,
    status: "Linked list reset to a single node.",
    code: `/* Single node list in C */\nstruct Node* head = (struct Node*)malloc(sizeof(struct Node));\nhead->data = 10;\nhead->next = NULL;`
  });
  updateLLPlaybackControls();
}

function resizeLinkedList() {
  pauseLLPlayback();
  const newSize = parseInt(inputLlSize.value);
  if (isNaN(newSize) || newSize < 1 || newSize > 10) {
    alert("Please enter a list length between 1 and 10.");
    return;
  }
  if (newSize > currentLinkedList.length) {
    while (currentLinkedList.length < newSize) {
      currentLinkedList.push(Math.floor(Math.random() * 90) + 10);
    }
  } else {
    currentLinkedList = currentLinkedList.slice(0, newSize);
  }
  clearLLSimulation();
  renderLinkedListInitial();
}

function applyCustomLinkedList() {
  pauseLLPlayback();
  const raw = inputLlCustom.value.trim();
  if (!raw) return;
  const parts = raw.split(/[\s,]+/).map(v => parseInt(v)).filter(v => !isNaN(v));
  if (parts.length < 1 || parts.length > 10) {
    alert("Please provide between 1 and 10 comma-separated numbers.");
    return;
  }
  currentLinkedList = parts;
  if (inputLlSize) inputLlSize.value = parts.length;
  clearLLSimulation();
  renderLinkedListInitial();
}

// --- Linked List Simulation Runner ---
function setLLSimulationSteps(generatedSteps) {
  pauseLLPlayback();
  llSteps = generatedSteps;
  llCurrentStepIndex = 0;
  if (llSteps.length > 0) {
    renderLinkedListState(llSteps[0]);
  }
  updateLLPlaybackControls();
}

function clearLLSimulation() {
  llSteps = [];
  llCurrentStepIndex = 0;
  updateLLPlaybackControls();
}

function stepLLForward() {
  if (llCurrentStepIndex < llSteps.length - 1) {
    llCurrentStepIndex++;
    renderLinkedListState(llSteps[llCurrentStepIndex]);
    updateLLPlaybackControls();
  } else {
    pauseLLPlayback();
  }
}

function stepLLBackward() {
  if (llCurrentStepIndex > 0) {
    llCurrentStepIndex--;
    renderLinkedListState(llSteps[llCurrentStepIndex]);
    updateLLPlaybackControls();
  }
}

function toggleLLPlayPause() {
  if (llIsPlaying) {
    pauseLLPlayback();
  } else {
    if (llSteps.length === 0) return;
    if (llCurrentStepIndex >= llSteps.length - 1) {
      llCurrentStepIndex = 0;
      renderLinkedListState(llSteps[0]);
    }
    llIsPlaying = true;
    btnLlPlayPause.textContent = "Pause";
    btnLlPlayPause.classList.add("btn-primary");
    llPlayInterval = setInterval(stepLLForward, llPlaySpeed);
  }
}

function pauseLLPlayback() {
  llIsPlaying = false;
  clearInterval(llPlayInterval);
  if (btnLlPlayPause) {
    btnLlPlayPause.textContent = "Auto Play";
    btnLlPlayPause.classList.remove("btn-primary");
  }
}

function resetLLSimulation() {
  pauseLLPlayback();
  if (llSteps.length > 0) {
    llCurrentStepIndex = 0;
    renderLinkedListState(llSteps[0]);
    updateLLPlaybackControls();
  }
}

function updateLLPlaybackControls() {
  if (!btnLlPrevStep) return;
  const total = llSteps.length;
  const current = total > 0 ? llCurrentStepIndex + 1 : 0;
  llStepCounter.textContent = `${current} / ${total}`;

  btnLlPrevStep.disabled = total === 0 || llCurrentStepIndex === 0;
  btnLlNextStep.disabled = total === 0 || llCurrentStepIndex >= total - 1;
  btnLlPlayPause.disabled = total === 0;
  btnLlResetAlgo.disabled = total === 0;
}

// --- Linked List DOM Rendering ---
function renderLinkedListState(step) {
  if (!step || !llChainContainer) return;

  const { nodes = [], pointers = {}, auxNode = null, status = "", code = "" } = step;

  llChainContainer.innerHTML = "";

  if (nodes.length === 0) {
    // Empty list
    const emptyWrapper = document.createElement("div");
    emptyWrapper.className = "ll-node-wrapper";

    const headCol = document.createElement("div");
    headCol.className = "ll-node-col";
    const ptrBox = document.createElement("div");
    ptrBox.className = "pointers-container";
    const badge = document.createElement("span");
    badge.className = "pointer-badge ptr-head";
    badge.textContent = "head";
    ptrBox.appendChild(badge);
    headCol.appendChild(ptrBox);

    const arrow = document.createElement("div");
    arrow.className = "ll-arrow";
    arrow.textContent = "──▶";

    const nullCol = document.createElement("div");
    nullCol.className = "ll-null-col";
    const nullBox = document.createElement("div");
    nullBox.className = "ll-null";
    nullBox.textContent = "NULL";
    nullCol.appendChild(nullBox);

    emptyWrapper.appendChild(headCol);
    emptyWrapper.appendChild(arrow);
    emptyWrapper.appendChild(nullCol);
    llChainContainer.appendChild(emptyWrapper);
  } else {
    nodes.forEach((node, idx) => {
      const wrapper = document.createElement("div");
      wrapper.className = "ll-node-wrapper";

      const col = document.createElement("div");
      col.className = "ll-node-col";

      // Pointers above node
      const ptrContainer = document.createElement("div");
      ptrContainer.className = "pointers-container";
      if (pointers[idx]) {
        const ptrList = Array.isArray(pointers[idx]) ? pointers[idx] : [pointers[idx]];
        ptrList.forEach(p => {
          const badge = document.createElement("span");
          const cleanName = p.toLowerCase().replace(/[^a-z]/g, "");
          badge.className = `pointer-badge ptr-${cleanName}`;
          badge.textContent = p;
          ptrContainer.appendChild(badge);
        });
      }
      col.appendChild(ptrContainer);

      // Node box: [ data | next ]
      const nodeBox = document.createElement("div");
      nodeBox.className = `ll-node state-${node.state || "default"}`;

      const dataBox = document.createElement("div");
      dataBox.className = "ll-data";
      dataBox.textContent = node.value !== undefined && node.value !== null ? node.value : "";
      nodeBox.appendChild(dataBox);

      const nextBox = document.createElement("div");
      nextBox.className = "ll-next";
      nextBox.textContent = "•";
      nodeBox.appendChild(nextBox);

      col.appendChild(nodeBox);

      // Index label
      const idxLabel = document.createElement("span");
      idxLabel.className = "index-label";
      idxLabel.textContent = `[${idx}]`;
      col.appendChild(idxLabel);

      wrapper.appendChild(col);

      // Arrow connector
      if (node.arrow !== "none") {
        const arrow = document.createElement("div");
        arrow.className = `ll-arrow ${node.arrow === "reversed" ? "reversed" : ""}`;
        arrow.textContent = node.arrow === "reversed" ? "◀──" : "──▶";
        wrapper.appendChild(arrow);
      }

      llChainContainer.appendChild(wrapper);
    });

    // Terminal NULL Box
    const nullWrapper = document.createElement("div");
    nullWrapper.className = "ll-node-wrapper";
    const nullCol = document.createElement("div");
    nullCol.className = "ll-null-col";

    const nullPtr = document.createElement("div");
    nullPtr.className = "pointers-container";
    if (pointers["null"]) {
      const badge = document.createElement("span");
      badge.className = "pointer-badge ptr-curr";
      badge.textContent = "curr = NULL";
      nullPtr.appendChild(badge);
    }
    nullCol.appendChild(nullPtr);

    const nullBox = document.createElement("div");
    nullBox.className = "ll-null";
    nullBox.textContent = "NULL";
    nullCol.appendChild(nullBox);

    const nullLabel = document.createElement("span");
    nullLabel.className = "index-label";
    nullLabel.textContent = "";
    nullCol.appendChild(nullLabel);

    nullWrapper.appendChild(nullCol);
    llChainContainer.appendChild(nullWrapper);
  }

  // Auxiliary / Newly Allocated Node Stage
  if (auxNode && auxNode.value !== undefined) {
    llAuxStage.style.display = "flex";
    llAuxTitle.textContent = auxNode.title || "Allocated Node (malloc / temp):";
    llAuxContainer.innerHTML = "";

    const wrap = document.createElement("div");
    wrap.className = "ll-node-col";

    const auxPtr = document.createElement("div");
    auxPtr.className = "pointers-container";
    if (auxNode.label) {
      const badge = document.createElement("span");
      const cleanName = auxNode.label.toLowerCase().replace(/[^a-z]/g, "");
      badge.className = `pointer-badge ptr-${cleanName}`;
      badge.textContent = auxNode.label;
      auxPtr.appendChild(badge);
    }
    wrap.appendChild(auxPtr);

    const auxNodeBox = document.createElement("div");
    auxNodeBox.className = `ll-node state-${auxNode.state || "success"}`;

    const dataBox = document.createElement("div");
    dataBox.className = "ll-data";
    dataBox.textContent = auxNode.value;
    auxNodeBox.appendChild(dataBox);

    const nextBox = document.createElement("div");
    nextBox.className = "ll-next";
    nextBox.textContent = "•";
    auxNodeBox.appendChild(nextBox);

    wrap.appendChild(auxNodeBox);
    llAuxContainer.appendChild(wrap);
  } else {
    llAuxStage.style.display = "none";
  }

  // Update Status & Code
  llStatusBox.textContent = status;
  llCodeBox.textContent = code;
}

function createLLStep({ nodes, pointers = {}, auxNode = null, status = "", code = "" }) {
  return {
    nodes: nodes.map(n => ({ ...n })),
    pointers: JSON.parse(JSON.stringify(pointers)),
    auxNode: auxNode ? JSON.parse(JSON.stringify(auxNode)) : null,
    status,
    code
  };
}

// ==========================================================================
// LINKED LIST ALGORITHM STEP GENERATORS (C SYNTAX)
// ==========================================================================

// --- 1. SEARCH / TRAVERSAL ---
function handleStartLLSearch() {
  const target = parseInt(document.getElementById("ll-search-target").value);
  if (isNaN(target)) {
    alert("Please enter a valid target integer to search.");
    return;
  }
  generateLLSearchSteps(target);
}

function generateLLSearchSteps(target) {
  const list = [...currentLinkedList];
  const n = list.length;
  const genSteps = [];

  const baseNodes = list.map(v => ({ value: v, state: "default", arrow: "right" }));

  genSteps.push(createLLStep({
    nodes: baseNodes,
    pointers: n > 0 ? { 0: ["head", "curr"] } : { null: ["head=NULL"] },
    status: `Starting Linked List search in C for target = ${target}. Setting curr = head.`,
    code: `/* Search Linked List in C */\nstruct Node* searchNode(struct Node* head, int target) {\n    struct Node* curr = head;\n    while (curr != NULL) {\n        if (curr->data == target)\n            return curr;\n        curr = curr->next;\n    }\n    return NULL;\n}`
  }));

  let found = false;

  for (let i = 0; i < n; i++) {
    const stepNodes = list.map((v, idx) => ({
      value: v,
      state: idx === i ? "current" : (idx < i ? "eliminated" : "default"),
      arrow: "right"
    }));

    const pointers = { [i]: ["curr"] };
    if (!pointers[0]) pointers[0] = [];
    if (!pointers[0].includes("head")) pointers[0].unshift("head");

    genSteps.push(createLLStep({
      nodes: stepNodes,
      pointers,
      status: `Inspecting node [${i}]: Checking if curr->data (${list[i]}) == target (${target}).`,
      code: `/* Node [${i}] */\nif (curr->data == ${target}) /* Evaluates to ${list[i] === target ? "1 (true)" : "0 (false)"} */`
    }));

    if (list[i] === target) {
      stepNodes[i].state = "success";
      pointers[i] = ["curr", "FOUND!"];
      genSteps.push(createLLStep({
        nodes: stepNodes,
        pointers,
        status: `Match found! Node with value ${target} is located at position [${i}].`,
        code: `return curr; /* Target node found with data = ${target} */`
      }));
      found = true;
      break;
    }
  }

  if (!found) {
    const finalNodes = list.map(v => ({ value: v, state: "eliminated", arrow: "right" }));
    genSteps.push(createLLStep({
      nodes: finalNodes,
      pointers: { 0: ["head"], null: ["curr=NULL"] },
      status: `curr reached NULL. Target ${target} not found in the linked list.`,
      code: `return NULL; /* Target not found */`
    }));
  }

  setLLSimulationSteps(genSteps);
}

// --- 2. INSERTION ---
function handleStartLLInsertion() {
  const pos = document.getElementById("ll-insert-pos").value;
  const val = parseInt(document.getElementById("ll-insert-val").value);

  if (isNaN(val)) {
    alert("Please enter a valid value to insert.");
    return;
  }

  if (currentLinkedList.length >= 10) {
    alert("Linked list reached maximum capacity (10 nodes). Please delete a node first.");
    return;
  }

  if (pos === "head") {
    generateLLInsertHeadSteps(val);
  } else if (pos === "tail") {
    generateLLInsertTailSteps(val);
  } else if (pos === "index") {
    const idx = parseInt(document.getElementById("ll-insert-idx").value);
    if (isNaN(idx) || idx < 0 || idx > currentLinkedList.length) {
      alert(`Please enter an index between 0 and ${currentLinkedList.length}.`);
      return;
    }
    generateLLInsertAtSteps(val, idx);
  }
}

function generateLLInsertHeadSteps(val) {
  const orig = [...currentLinkedList];
  const genSteps = [];

  // Step 1: Allocate node
  genSteps.push(createLLStep({
    nodes: orig.map(v => ({ value: v, state: "default", arrow: "right" })),
    pointers: orig.length > 0 ? { 0: ["head"] } : {},
    auxNode: { value: val, label: "new_node", state: "success" },
    status: `Allocating memory for new node with data = ${val} in C.`,
    code: `/* Insert at Head in C */\nstruct Node* new_node = (struct Node*)malloc(sizeof(struct Node));\nnew_node->data = ${val};\nnew_node->next = NULL;`
  }));

  // Step 2: Point new_node->next = head
  genSteps.push(createLLStep({
    nodes: orig.map(v => ({ value: v, state: "target", arrow: "right" })),
    pointers: orig.length > 0 ? { 0: ["head"] } : {},
    auxNode: { value: val, label: "new_node", state: "shifted" },
    status: `Connecting new_node->next = head; pointing to previous head node.`,
    code: `new_node->next = head; /* Point new node to current head */`
  }));

  // Step 3: head = new_node
  const newList = [val, ...orig];
  genSteps.push(createLLStep({
    nodes: newList.map((v, i) => ({ value: v, state: i === 0 ? "success" : "default", arrow: "right" })),
    pointers: { 0: ["head", "new_node"] },
    auxNode: null,
    status: `Reassigned head pointer to new_node. Insertion at head complete!`,
    code: `head = new_node; /* New node is now the head */`
  }));

  currentLinkedList = newList;
  if (inputLlSize) inputLlSize.value = currentLinkedList.length;
  setLLSimulationSteps(genSteps);
}

function generateLLInsertTailSteps(val) {
  const orig = [...currentLinkedList];
  const n = orig.length;
  const genSteps = [];

  // Step 1: Allocate node
  genSteps.push(createLLStep({
    nodes: orig.map(v => ({ value: v, state: "default", arrow: "right" })),
    pointers: n > 0 ? { 0: ["head"] } : {},
    auxNode: { value: val, label: "new_node", state: "success" },
    status: `Allocating memory for new node with data = ${val} in C.`,
    code: `/* Insert at Tail in C */\nstruct Node* new_node = (struct Node*)malloc(sizeof(struct Node));\nnew_node->data = ${val};\nnew_node->next = NULL;`
  }));

  if (n === 0) {
    const newList = [val];
    genSteps.push(createLLStep({
      nodes: newList.map(v => ({ value: v, state: "success", arrow: "right" })),
      pointers: { 0: ["head"] },
      auxNode: null,
      status: `List was empty. Setting head = new_node;`,
      code: `head = new_node;`
    }));
    currentLinkedList = newList;
    if (inputLlSize) inputLlSize.value = 1;
    setLLSimulationSteps(genSteps);
    return;
  }

  // Step 2: Traverse to tail
  for (let i = 0; i < n; i++) {
    const pointers = { [i]: ["curr"] };
    if (!pointers[0]) pointers[0] = [];
    if (!pointers[0].includes("head")) pointers[0].unshift("head");

    genSteps.push(createLLStep({
      nodes: orig.map((v, idx) => ({ value: v, state: idx === i ? "current" : "default", arrow: "right" })),
      pointers,
      auxNode: { value: val, label: "new_node", state: "target" },
      status: i < n - 1 ? `Traversing list: curr = curr->next;` : `curr has reached the last node (curr->next == NULL).`,
      code: i < n - 1 ? `curr = curr->next;` : `/* curr is at tail */\nwhile (curr->next != NULL) curr = curr->next;`
    }));
  }

  // Step 3: curr->next = new_node
  const newList = [...orig, val];
  genSteps.push(createLLStep({
    nodes: newList.map((v, i) => ({ value: v, state: i === n ? "success" : (i === n - 1 ? "shifted" : "default"), arrow: "right" })),
    pointers: { 0: ["head"], [n]: ["tail"] },
    auxNode: null,
    status: `Connected tail node's next pointer to new_node. Insertion at tail complete!`,
    code: `curr->next = new_node;\nnew_node->next = NULL;`
  }));

  currentLinkedList = newList;
  if (inputLlSize) inputLlSize.value = currentLinkedList.length;
  setLLSimulationSteps(genSteps);
}

function generateLLInsertAtSteps(val, targetIdx) {
  if (targetIdx === 0) {
    generateLLInsertHeadSteps(val);
    return;
  }

  const orig = [...currentLinkedList];
  const n = orig.length;
  const genSteps = [];

  // Step 1: Allocate node
  genSteps.push(createLLStep({
    nodes: orig.map(v => ({ value: v, state: "default", arrow: "right" })),
    pointers: { 0: ["head"] },
    auxNode: { value: val, label: "new_node", state: "success" },
    status: `Allocating memory for new node with data = ${val}.`,
    code: `/* Insert at Index ${targetIdx} in C */\nstruct Node* new_node = (struct Node*)malloc(sizeof(struct Node));\nnew_node->data = ${val};`
  }));

  // Step 2: Traverse to predecessor (index targetIdx - 1)
  for (let i = 0; i < targetIdx; i++) {
    const pointers = { [i]: ["curr"] };
    if (!pointers[0]) pointers[0] = [];
    if (!pointers[0].includes("head")) pointers[0].unshift("head");

    genSteps.push(createLLStep({
      nodes: orig.map((v, idx) => ({ value: v, state: idx === i ? "current" : "default", arrow: "right" })),
      pointers,
      auxNode: { value: val, label: "new_node", state: "target" },
      status: `Traversing to predecessor node at index [${targetIdx - 1}]. Currently at [${i}].`,
      code: `for (int i = 0; i < ${targetIdx - 1}; i++) curr = curr->next;`
    }));
  }

  // Step 3: Link new_node->next = curr->next
  genSteps.push(createLLStep({
    nodes: orig.map((v, idx) => ({ value: v, state: idx === targetIdx - 1 ? "current" : (idx === targetIdx ? "target" : "default"), arrow: "right" })),
    pointers: { 0: ["head"], [targetIdx - 1]: ["curr"] },
    auxNode: { value: val, label: "new_node", state: "shifted" },
    status: `Connecting new_node->next = curr->next; (linking to successor node [${targetIdx}]).`,
    code: `new_node->next = curr->next; /* Link new node to successor */`
  }));

  // Step 4: curr->next = new_node
  const newList = [...orig.slice(0, targetIdx), val, ...orig.slice(targetIdx)];
  genSteps.push(createLLStep({
    nodes: newList.map((v, idx) => ({ value: v, state: idx === targetIdx ? "success" : "default", arrow: "right" })),
    pointers: { 0: ["head"], [targetIdx]: ["inserted"] },
    auxNode: null,
    status: `Connected curr->next = new_node. Node spliced into position [${targetIdx}]!`,
    code: `curr->next = new_node; /* Node successfully inserted */`
  }));

  currentLinkedList = newList;
  if (inputLlSize) inputLlSize.value = currentLinkedList.length;
  setLLSimulationSteps(genSteps);
}

// --- 3. DELETION ---
function handleStartLLDeletion() {
  if (currentLinkedList.length === 0) {
    alert("Linked list is already empty.");
    return;
  }

  const pos = document.getElementById("ll-delete-pos").value;

  if (pos === "head") {
    generateLLDeleteHeadSteps();
  } else if (pos === "tail") {
    generateLLDeleteTailSteps();
  } else if (pos === "index") {
    const idx = parseInt(document.getElementById("ll-delete-idx").value);
    if (isNaN(idx) || idx < 0 || idx >= currentLinkedList.length) {
      alert(`Please enter an index between 0 and ${currentLinkedList.length - 1}.`);
      return;
    }
    generateLLDeleteAtSteps(idx);
  }
}

function generateLLDeleteHeadSteps() {
  const orig = [...currentLinkedList];
  const genSteps = [];
  const deletedVal = orig[0];

  // Step 1: temp = head
  genSteps.push(createLLStep({
    nodes: orig.map((v, idx) => ({ value: v, state: idx === 0 ? "target" : "default", arrow: "right" })),
    pointers: { 0: ["head", "temp"] },
    status: `Targeting head node for deletion. Setting temp = head;`,
    code: `/* Delete at Head in C */\nstruct Node* temp = head;`
  }));

  // Step 2: head = head->next
  const remaining = orig.slice(1);
  genSteps.push(createLLStep({
    nodes: remaining.map(v => ({ value: v, state: "shifted", arrow: "right" })),
    pointers: remaining.length > 0 ? { 0: ["head"] } : {},
    auxNode: { value: deletedVal, label: "temp", state: "eliminated", title: "Node to Free:" },
    status: `Advancing head pointer: head = head->next;`,
    code: `head = head->next; /* Head moved to next node */`
  }));

  // Step 3: free(temp)
  genSteps.push(createLLStep({
    nodes: remaining.map(v => ({ value: v, state: "default", arrow: "right" })),
    pointers: remaining.length > 0 ? { 0: ["head"] } : {},
    auxNode: null,
    status: `Freed memory for deleted node with value ${deletedVal}. Deletion complete!`,
    code: `free(temp); /* Deallocated node memory */`
  }));

  currentLinkedList = remaining;
  if (inputLlSize) inputLlSize.value = currentLinkedList.length;
  setLLSimulationSteps(genSteps);
}

function generateLLDeleteTailSteps() {
  const orig = [...currentLinkedList];
  const n = orig.length;

  if (n <= 1) {
    generateLLDeleteHeadSteps();
    return;
  }

  const genSteps = [];
  const deletedVal = orig[n - 1];

  // Step 1: Traverse to second to last node
  for (let i = 0; i < n - 1; i++) {
    const pointers = { [i]: ["curr"] };
    if (!pointers[0]) pointers[0] = [];
    if (!pointers[0].includes("head")) pointers[0].unshift("head");

    genSteps.push(createLLStep({
      nodes: orig.map((v, idx) => ({ value: v, state: idx === i ? "current" : "default", arrow: "right" })),
      pointers,
      status: i < n - 2 ? `Traversing to second-to-last node: curr = curr->next;` : `curr has reached the node before tail.`,
      code: `while (curr->next->next != NULL) curr = curr->next;`
    }));
  }

  // Step 2: temp = curr->next
  genSteps.push(createLLStep({
    nodes: orig.map((v, idx) => ({ value: v, state: idx === n - 1 ? "eliminated" : (idx === n - 2 ? "current" : "default"), arrow: "right" })),
    pointers: { 0: ["head"], [n - 2]: ["curr"], [n - 1]: ["temp"] },
    status: `Setting temp = curr->next (tail node to be freed).`,
    code: `struct Node* temp = curr->next;`
  }));

  // Step 3: curr->next = NULL
  const remaining = orig.slice(0, n - 1);
  genSteps.push(createLLStep({
    nodes: remaining.map((v, idx) => ({ value: v, state: idx === n - 2 ? "shifted" : "default", arrow: "right" })),
    pointers: { 0: ["head"], [n - 2]: ["curr"] },
    auxNode: { value: deletedVal, label: "temp", state: "eliminated", title: "Node to Free:" },
    status: `Disconnecting tail: curr->next = NULL;`,
    code: `curr->next = NULL; /* Break link to tail */`
  }));

  // Step 4: free(temp)
  genSteps.push(createLLStep({
    nodes: remaining.map(v => ({ value: v, state: "default", arrow: "right" })),
    pointers: { 0: ["head"] },
    auxNode: null,
    status: `Freed memory for tail node (${deletedVal}). Deletion at tail complete!`,
    code: `free(temp); /* Memory deallocated */`
  }));

  currentLinkedList = remaining;
  if (inputLlSize) inputLlSize.value = currentLinkedList.length;
  setLLSimulationSteps(genSteps);
}

function generateLLDeleteAtSteps(targetIdx) {
  if (targetIdx === 0) {
    generateLLDeleteHeadSteps();
    return;
  }

  const orig = [...currentLinkedList];
  const n = orig.length;
  const genSteps = [];
  const deletedVal = orig[targetIdx];

  // Step 1: Traverse to predecessor (targetIdx - 1)
  for (let i = 0; i < targetIdx; i++) {
    const pointers = { [i]: ["curr"] };
    if (!pointers[0]) pointers[0] = [];
    if (!pointers[0].includes("head")) pointers[0].unshift("head");

    genSteps.push(createLLStep({
      nodes: orig.map((v, idx) => ({ value: v, state: idx === i ? "current" : "default", arrow: "right" })),
      pointers,
      status: `Traversing to predecessor node at index [${targetIdx - 1}]. Currently at [${i}].`,
      code: `for (int i = 0; i < ${targetIdx - 1}; i++) curr = curr->next;`
    }));
  }

  // Step 2: temp = curr->next
  genSteps.push(createLLStep({
    nodes: orig.map((v, idx) => ({ value: v, state: idx === targetIdx ? "eliminated" : (idx === targetIdx - 1 ? "current" : "default"), arrow: "right" })),
    pointers: { 0: ["head"], [targetIdx - 1]: ["curr"], [targetIdx]: ["temp"] },
    status: `Setting temp = curr->next; identifying node [${targetIdx}] to delete.`,
    code: `struct Node* temp = curr->next;`
  }));

  // Step 3: Link bypass curr->next = temp->next
  const remaining = orig.filter((_, idx) => idx !== targetIdx);
  genSteps.push(createLLStep({
    nodes: remaining.map((v, idx) => ({ value: v, state: idx === targetIdx - 1 ? "shifted" : "default", arrow: "right" })),
    pointers: { 0: ["head"], [targetIdx - 1]: ["curr"] },
    auxNode: { value: deletedVal, label: "temp", state: "eliminated", title: "Node to Free:" },
    status: `Bypassing deleted node: curr->next = temp->next;`,
    code: `curr->next = temp->next; /* Bypass node [${targetIdx}] */`
  }));

  // Step 4: free(temp)
  genSteps.push(createLLStep({
    nodes: remaining.map(v => ({ value: v, state: "default", arrow: "right" })),
    pointers: { 0: ["head"] },
    auxNode: null,
    status: `Freed memory for node [${targetIdx}] (${deletedVal}). Deletion complete!`,
    code: `free(temp); /* Memory deallocated */`
  }));

  currentLinkedList = remaining;
  if (inputLlSize) inputLlSize.value = currentLinkedList.length;
  setLLSimulationSteps(genSteps);
}

// --- 4. REVERSAL ---
function handleStartLLReversal() {
  if (currentLinkedList.length <= 1) {
    alert("Reversal requires at least 2 nodes.");
    return;
  }
  generateLLReversalSteps();
}

function generateLLReversalSteps() {
  const orig = [...currentLinkedList];
  const n = orig.length;
  const genSteps = [];

  // Working representation
  const nodes = orig.map(v => ({ value: v, state: "default", arrow: "right" }));

  // Initial step
  genSteps.push(createLLStep({
    nodes,
    pointers: { 0: ["head", "curr"] },
    status: "Starting in-place Linked List Reversal in C with 3 pointers: prev = NULL, curr = head, next_node = NULL.",
    code: `/* In-place Linked List Reversal in C */\nstruct Node* reverseList(struct Node* head) {\n    struct Node* prev = NULL;\n    struct Node* curr = head;\n    struct Node* next_node = NULL;\n    while (curr != NULL) {\n        next_node = curr->next;\n        curr->next = prev;\n        prev = curr;\n        curr = next_node;\n    }\n    return prev;\n}`
  }));

  let prevIdx = null;
  let currIdx = 0;

  while (currIdx < n) {
    const nextIdx = currIdx + 1 < n ? currIdx + 1 : null;

    // Sub-step 1: next_node = curr->next
    const step1Pointers = {};
    if (currIdx === 0 && !step1Pointers[0]) step1Pointers[0] = [];
    step1Pointers[currIdx] = ["curr"];
    if (prevIdx !== null) step1Pointers[prevIdx] = ["prev"];
    if (nextIdx !== null) step1Pointers[nextIdx] = ["next_node"];

    nodes[currIdx].state = "current";
    if (prevIdx !== null) nodes[prevIdx].state = "target";
    if (nextIdx !== null) nodes[nextIdx].state = "shifted";

    genSteps.push(createLLStep({
      nodes,
      pointers: step1Pointers,
      status: `Preserving reference to next node: next_node = curr->next (val: ${nextIdx !== null ? orig[nextIdx] : "NULL"}).`,
      code: `next_node = curr->next; /* Saved next node pointer */`
    }));

    // Sub-step 2: curr->next = prev
    nodes[currIdx].arrow = "reversed";
    nodes[currIdx].state = "shifted";

    genSteps.push(createLLStep({
      nodes,
      pointers: step1Pointers,
      status: `Reversing link of node [${currIdx}]: curr->next = prev; (arrow now points back to ${prevIdx !== null ? `node [${prevIdx}]` : "NULL"}).`,
      code: `curr->next = prev; /* Pointer reversed */`
    }));

    // Sub-step 3: prev = curr; curr = next_node;
    prevIdx = currIdx;
    currIdx = nextIdx !== null ? nextIdx : n;

    const step3Pointers = {};
    if (prevIdx !== null) step3Pointers[prevIdx] = ["prev"];
    if (currIdx < n) step3Pointers[currIdx] = ["curr"];
    else step3Pointers["null"] = ["curr=NULL"];

    genSteps.push(createLLStep({
      nodes,
      pointers: step3Pointers,
      status: `Advancing pointers: prev = curr; curr = next_node;`,
      code: `prev = curr;\ncurr = next_node;`
    }));
  }

  // Final step: head = prev, layout flipped cleanly
  const reversedList = [...orig].reverse();
  const finalNodes = reversedList.map(v => ({ value: v, state: "success", arrow: "right" }));

  genSteps.push(createLLStep({
    nodes: finalNodes,
    pointers: { 0: ["head", "prev"] },
    status: `curr reached NULL. Setting head = prev. Linked list is successfully reversed!`,
    code: `head = prev;\nreturn head; /* Reversal complete */`
  }));

  currentLinkedList = reversedList;
  setLLSimulationSteps(genSteps);
}

// Run init on load
document.addEventListener("DOMContentLoaded", init);
