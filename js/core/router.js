"use strict";

window.App = {
  root: null,
  scenes: {}
};

window.formatNumber = function formatNumber(value) {
  return Math.round(value).toLocaleString("ja-JP");
};

window.totalMaterials = function totalMaterials() {
  const state = window.GameState;
  if (typeof window.ensureMaterialInventoryState === "function") window.ensureMaterialInventoryState();
  return Object.values(state.baseInventory?.materials || state.materials || {}).reduce((sum, count) => sum + Number(count || 0), 0);
};

window.totalExploreMaterials = function totalExploreMaterials() {
  const state = window.GameState;
  if (typeof window.ensureMaterialInventoryState === "function") window.ensureMaterialInventoryState();
  return Object.values(state.exploreInventory?.materials || state.runMaterials || {}).reduce((sum, count) => sum + Number(count || 0), 0);
};

window.getMaterialCurrency = function getMaterialCurrency() {
  const state = window.GameState;
  const ship = typeof window.ensureShipState === "function" ? window.ensureShipState() : state.ship || {};
  if (!state.moneyMigratedToMaterials && Number(state.money || 0) > 0) {
    ship.materials = Math.max(0, Math.floor(Number(ship.materials || 0)) + Math.floor(Number(state.money || 0)));
    state.money = 0;
    if (state.player) state.player.money = 0;
    state.moneyMigratedToMaterials = true;
  }
  const baseTotal = typeof window.getLifelineMaterialStock === "function"
    ? window.getLifelineMaterialStock()
    : Object.values(state.materials || {}).reduce((sum, count) => sum + Math.max(0, Number(count || 0)), 0);
  return Math.max(baseTotal, Math.floor(Number(ship.materials || 0)));
};

window.consumeMaterialCurrency = function consumeMaterialCurrency(amount) {
  const required = Math.max(0, Math.floor(Number(amount || 0)));
  if (required <= 0) return true;
  if (typeof window.consumeLifelineMaterials === "function") return window.consumeLifelineMaterials(required);
  return false;
};

window.addMaterialCurrency = function addMaterialCurrency(amount) {
  const state = window.GameState;
  const ship = typeof window.ensureShipState === "function" ? window.ensureShipState() : state.ship || {};
  ship.materials = Math.max(0, Math.floor(Number(ship.materials || 0)) + Math.max(0, Math.floor(Number(amount || 0))));
  return ship.materials;
};

window.getDailySurvivalBalance = function getDailySurvivalBalance() {
  const state = window.GameState;
  const ship = typeof window.ensureShipState === "function" ? window.ensureShipState() : state.ship || {};
  const pilots = Array.isArray(state.pilots) ? state.pilots : [];
  const facilities = ship.facilities || {};
  const foodCost = Math.ceil(pilots.length * Math.max(0, 1 - Math.min(0.8, Number(ship.foodCostReduction || 0) + Number(ship.lifeSupportCostReduction || 0))));
  const medicalBase = pilots.reduce((sum, pilot) => {
    if (!pilot?.survival?.condition || pilot.survival.condition === "healthy" || !pilot.survival.inMedicalRoom) return sum;
    return sum + ({ minor: 1, moderate: 3, severe: 5 }[pilot.survival.severity] || 1);
  }, 0);
  const medicineCost = Math.ceil(medicalBase * (1 - Math.min(0.8, Number(ship.medicineCostReduction || 0))));
  const fuelCost = Math.ceil(Object.values(facilities).reduce((sum, level) => sum + Math.max(0, Number(level || 0)), 0) * 0.2 * (1 - Math.min(0.6, Number(ship.fuelCostReduction || 0))));
  return [
    { id: "food", label: "食料", stock: Number(ship.food || 0), supply: Number(ship.foodProduction || 0), consume: foodCost },
    { id: "medicine", label: "医療品", stock: Number(ship.medicine || 0), supply: Number(ship.medicineProduction || 0), consume: medicineCost },
    { id: "fuel", label: "燃料", stock: Number(ship.fuel || 0), supply: 0, consume: fuelCost },
    { id: "materials", label: "資材", stock: window.getMaterialCurrency(), supply: 0, consume: 0 }
  ];
};

window.renderSurvivalResourceStrip = function renderSurvivalResourceStrip(options = {}) {
  const balances = window.getDailySurvivalBalance();
  const icons = { food: "🍚", medicine: "💊", fuel: "⛽", materials: "🧱" };
  const labels = { food: "食料", medicine: "医療", fuel: "燃料", materials: "資材" };
  return balances.map((row) => `
    <button class="resource survival-resource-button" data-action="open-survival-resources" type="button" aria-label="${labels[row.id] || row.label}: ${formatNumber(row.stock)}">
      <strong><span class="resource-icon" aria-hidden="true">${icons[row.id] || ""}</span>${formatNumber(row.stock)}</strong>
    </button>
  `).join("");
};

window.allMaterialCounts = function allMaterialCounts() {
  const state = window.GameState;
  if (typeof window.ensureMaterialInventoryState === "function") window.ensureMaterialInventoryState();
  const merged = { ...(state.baseInventory?.materials || state.materials || {}) };
  Object.entries(state.exploreInventory?.materials || state.runMaterials || {}).forEach(([id, count]) => {
    merged[id] = (merged[id] || 0) + count;
  });
  return merged;
};

window.baseMaterialCounts = function baseMaterialCounts() {
  if (typeof window.ensureMaterialInventoryState === "function") window.ensureMaterialInventoryState();
  if (typeof window.enforceBaseMaterialLimit === "function") window.enforceBaseMaterialLimit();
  return window.GameState.baseInventory?.materials || window.GameState.materials || {};
};

window.exploreMaterialCounts = function exploreMaterialCounts() {
  if (typeof window.ensureMaterialInventoryState === "function") window.ensureMaterialInventoryState();
  return window.GameState.exploreInventory?.materials || window.GameState.runMaterials || {};
};

window.addBaseMaterial = function addBaseMaterial(materialId, amount = 1) {
  if (!materialId) return 0;
  if (typeof window.ensureMaterialInventoryState === "function") window.ensureMaterialInventoryState();
  const base = window.GameState.baseInventory;
  const current = Math.max(0, Number(base.materials[materialId] || 0));
  const next = current + Math.max(0, Math.floor(Number(amount || 0)));
  base.materials[materialId] = next;
  window.GameState.materials = base.materials;
  if (typeof window.enforceBaseMaterialLimit === "function") window.enforceBaseMaterialLimit();
  return Math.max(0, Number(base.materials[materialId] || 0) - current);
};

window.enforceBaseMaterialLimit = function enforceBaseMaterialLimit() {
  const state = window.GameState;
  const base = state.baseInventory;
  if (!base || !base.materials) return 0;
  const limit = Math.max(1, Number(base.materialLimit || 9999));
  const total = Object.values(base.materials).reduce((sum, count) => sum + Math.max(0, Number(count || 0)), 0);
  let excess = Math.max(0, total - limit);
  if (excess <= 0) return 0;

  const rarityOrder = { N: 0, R: 1, SR: 2, SSR: 3, UR: 4 };
  const entries = Object.entries(base.materials)
    .filter(([, count]) => Number(count || 0) > 0)
    .map(([id, count]) => {
      const material = typeof window.displayMaterial === "function" ? window.displayMaterial(id) : null;
      const rarity = String(material?.rarity || material?.rank || "N").toUpperCase();
      return { id, count: Number(count || 0), material, rarity, score: rarityOrder[rarity] ?? 0 };
    })
    .sort((a, b) => a.score - b.score || String(a.material?.name || a.id).localeCompare(String(b.material?.name || b.id), "ja"));

  let discarded = 0;
  entries.forEach((entry) => {
    if (excess <= 0) return;
    const remove = Math.min(entry.count, excess);
    if (remove <= 0) return;
    base.materials[entry.id] = Math.max(0, Number(base.materials[entry.id] || 0) - remove);
    if (base.materials[entry.id] <= 0) delete base.materials[entry.id];
    excess -= remove;
    discarded += remove;
    const name = entry.material?.name || entry.id;
    if (typeof window.logMessage === "function") {
      window.logMessage("bar", `所持上限超過: ${name} ×${remove} を自動破棄`, "warn");
    }
  });
  state.materials = base.materials;
  return discarded;
};

window.addExploreMaterial = function addExploreMaterial(materialId, amount = 1) {
  if (!materialId) return 0;
  if (typeof window.ensureMaterialInventoryState === "function") window.ensureMaterialInventoryState();
  const ship = typeof window.ensureShipState === "function" ? window.ensureShipState() : window.GameState.ship || {};
  const explore = window.GameState.exploreInventory;
  const materials = explore.materials || {};
  const limit = Number(explore.slotLimit || 100);
  const currentTotal = Object.values(materials).reduce((sum, count) => sum + Number(count || 0), 0);
  const bonusAmount = Math.floor(Number(amount || 0) * Math.max(0, Number(ship.materialYieldBonus || 0)));
  const addable = Math.min(Math.max(0, Math.floor(Number(amount || 0)) + bonusAmount), Math.max(0, limit - currentTotal));
  if (addable <= 0) return 0;
  materials[materialId] = Math.max(0, Number(materials[materialId] || 0)) + addable;
  explore.materials = materials;
  window.GameState.runMaterials = materials;
  if (typeof window.applyWasteFoodConversion === "function") window.applyWasteFoodConversion(materialId, addable);
  return addable;
};

window.consumeBaseMaterial = function consumeBaseMaterial(materialId, amount = 1) {
  if (typeof window.ensureMaterialInventoryState === "function") window.ensureMaterialInventoryState();
  const materials = window.GameState.baseInventory?.materials || {};
  const need = Math.max(1, Math.floor(Number(amount || 1)));
  if (Number(materials[materialId] || 0) < need) return false;
  materials[materialId] = Math.max(0, Number(materials[materialId] || 0) - need);
  window.GameState.materials = materials;
  return true;
};

window.getMaterial = function getMaterial(id) {
  return window.MaterialCatalog.find((material) => material.id === id)
    || (typeof window.parseGeneratedMaterialId === "function" && typeof window.buildGeneratedMaterial === "function"
      ? (() => {
        const parsed = window.parseGeneratedMaterialId(id);
        return parsed ? window.buildGeneratedMaterial(parsed.materialBaseId, parsed.colorId, parsed.qualityId) : null;
      })()
      : null);
};

function displayMaterial(id) {
  return getMaterial(id) || {
    id,
    name: `Unknown Material (${id})`,
    rank: "-",
    rarity: "-",
    category: "unresolved",
    materialRole: "unresolved",
    prompts: [],
    value: 0
  };
}

window.displayMaterial = displayMaterial;

window.getPilot = function getPilot(id) {
  return window.GameState.pilots.find((pilot) => pilot.id === id);
};

window.displayPilot = function displayPilot(pilotId) {
  return getPilot(pilotId) || { id: "none", name: "未搭乗", rank: "-", classId: "", traitId: "", traitRank: "-", learnedSkills: [], appearanceId: "none", hair: "#263034", skin: "#6d777a" };
};

window.getMech = function getMech(id) {
  return window.GameState.mechs.find((mech) => mech.id === id);
};

window.pilotPortraitStyle = function pilotPortraitStyle(pilot) {
  return `style="--hair:${pilot.hair || "#263034"};--skin:${pilot.skin || "#6d777a"}"`;
};

window.renderHeader = function renderHeader(titleJa, titleEn, extra = "", options = {}) {
  const state = window.GameState;
  const defaultResources = options.hideDefaultResources ? "" : `
        ${window.renderSurvivalResourceStrip()}
        ${options.showBaseInventory ? `<button class="resource quest-material-button" data-action="open-base-inventory" type="button"><small>所持素材</small><strong>${totalMaterials()} / 9999</strong></button>` : ""}
  `;
  const resourceRowClass = options.resourceRowClass ? ` resource-row ${options.resourceRowClass}` : "resource-row";
  return `
    <div class="top-bar">
      <div class="title-block">
        <span class="title-ja">${titleJa}</span>
        <span class="title-en">${titleEn}</span>
        ${options.titleMeta ? `<span class="title-meta">${options.titleMeta}</span>` : ""}
      </div>
      <div class="${resourceRowClass}">
        ${defaultResources}
        ${extra}
      </div>
    </div>
    ${state.baseInventoryOpen ? renderBaseInventoryModal() : ""}
    ${state.survivalResourcesOpen ? renderSurvivalResourcesModal() : ""}
  `;
};

function renderSurvivalResourcesModal() {
  const rows = window.getDailySurvivalBalance();
  return `
    <div class="modal-backdrop survival-resources-modal-backdrop">
      <section class="quest-materials-modal panel panel-pad" role="dialog" aria-modal="true" aria-label="サバイバル資源">
        <div class="section-head">
          <h2>サバイバル資源</h2>
          <button class="button mini-map-close" data-action="close-survival-resources" type="button">閉じる</button>
        </div>
        <div class="quest-material-list">${rows.map((row) => {
          const net = Number(row.supply || 0) - Number(row.consume || 0);
          const tone = net < 0 ? "log-danger" : net > 0 ? "log-good" : "";
          return `<div class="material-row"><span style="flex:1">${row.label}<br><span class="muted">現在 ${formatNumber(row.stock)}</span></span><strong>供給 +${formatNumber(row.supply)}<br>消費 -${formatNumber(row.consume)}</strong><span class="${tone}">${net >= 0 ? "+" : ""}${formatNumber(net)}/日</span></div>`;
        }).join("")}</div>
      </section>
    </div>
  `;
}

window.openSurvivalResourcesModal = function openSurvivalResourcesModal() {
  window.GameState.survivalResourcesOpen = true;
  window.renderCurrentScene();
};

window.closeSurvivalResourcesModal = function closeSurvivalResourcesModal() {
  window.GameState.survivalResourcesOpen = false;
  window.renderCurrentScene();
};

function renderBaseInventoryModal() {
  const entries = Object.entries(window.baseMaterialCounts()).filter(([, count]) => Number(count) > 0);
  const total = entries.reduce((sum, [, count]) => sum + Number(count || 0), 0);
  const unresolvedCount = entries.reduce((sum, [id, count]) => sum + (getMaterial(id) ? 0 : Number(count || 0)), 0);
  return `
    <div class="modal-backdrop base-inventory-modal-backdrop">
      <section class="quest-materials-modal panel panel-pad" role="dialog" aria-modal="true" aria-label="所持素材">
        <div class="section-head">
          <h2>所持素材</h2>
          <button class="button mini-map-close" data-action="close-base-inventory" type="button">閉じる</button>
        </div>
        <div class="muted" style="margin-bottom:8px">合計 ${formatNumber(total)} / 種類 ${entries.length}${unresolvedCount ? ` / 未解決 ${formatNumber(unresolvedCount)}` : ""}</div>
        <div class="quest-material-list">${entries.length ? entries.map(([id, count]) => {
          const material = displayMaterial(id);
          return `<div class="material-row"><div class="material-icon"></div><span style="flex:1">${material.name}<br><span class="muted">RANK ${material.rank || material.rarity || "-"} / ${material.category || material.materialRole || "-"}</span></span><strong>x${count}</strong></div>`;
        }).join("") : `<div class="muted">所持素材はありません。</div>`}</div>
      </section>
    </div>
  `;
}

window.openBaseInventoryModal = function openBaseInventoryModal() {
  window.GameState.baseInventoryOpen = true;
  window.renderCurrentScene();
};

window.closeBaseInventoryModal = function closeBaseInventoryModal() {
  window.GameState.baseInventoryOpen = false;
  window.renderCurrentScene();
};
window.renderBottomNav = function renderBottomNav() {
  const state = window.GameState;
  const nav = document.querySelector(".bottom-nav");
  const isQuestScene = state.currentScene === "quest" || state.currentScene === "battle";
  const isExploring = Boolean(state.quest?.currentPlanetId || state.quest?.planetId);
  const hasBlockingQuestModal = Boolean(state.quest?.partySetupOpen || state.quest?.partySwapSlot !== undefined);
  if (nav) nav.classList.toggle("bottom-nav--hidden", isQuestScene && (isExploring || hasBlockingQuestModal));
  document.querySelectorAll(".nav-btn").forEach((button) => {
    button.classList.toggle("active", button.dataset.screen === state.currentScene);
  });
};

window.isQuestNavigationLocked = function isQuestNavigationLocked(targetScene) {
  const state = window.GameState;
  const isExploring = Boolean(state.quest?.currentPlanetId || state.quest?.planetId);
  if (!isExploring) return false;
  if (targetScene === "quest" || targetScene === "battle") return false;
  return state.currentScene === "quest" || state.currentScene === "battle";
};

window.logMessage = function logMessage(scene, message, tone = "") {
  const state = window.GameState;
  if (!state.logs[scene]) state.logs[scene] = [];
  const time = new Date().toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" });
  state.logs[scene].unshift({ time, message, tone });
  state.logs[scene] = state.logs[scene].slice(0, 18);
};

window.logHtml = function logHtml(scene) {
  return (window.GameState.logs[scene] || []).map((entry) => {
    if (typeof entry === "string") {
      return `<div class="log-line"><span class="log-time">--:--</span><span>${entry}</span></div>`;
    }
    return `<div class="log-line ${entry.tone ? `log-${entry.tone}` : ""}"><span class="log-time">${entry.time}</span><span>${entry.message}</span></div>`;
  }).join("");
};

window.statRows = function statRows(mech) {
  return `
    <div class="stat-row"><span>攻撃力</span><strong>${mech.atk}</strong></div>
    <div class="stat-row"><span>防御力</span><strong>${mech.def}</strong></div>
    <div class="stat-row"><span>機動力</span><strong>${mech.mobility}</strong></div>
    <div class="stat-row"><span>燃費効率</span><strong>${Number(mech.fuelCostRate).toFixed(1)}</strong></div>
  `;
};

window.materialRows = function materialRows() {
  const entries = Object.entries(baseMaterialCounts()).filter(([, count]) => count > 0);
  if (!entries.length) return `<div class="muted">素材はありません。</div>`;
  return entries.map(([id, count]) => {
    const material = displayMaterial(id);
    return `
      <div class="material-row">
        <div class="material-icon"></div>
        <span style="flex:1">${material.name}<br><span class="muted">RANK ${material.rank} / ${(material.prompts || [material.category || "-"])[0]}</span></span>
        <strong>x${count}</strong>
        <span>🧱 ${material.value}</span>
        <button class="button" data-action="sell-material" data-material="${id}">売却</button>
      </div>
    `;
  }).join("");
};

window.switchScene = function switchScene(sceneName) {
  const state = window.GameState;
  if (window.isQuestNavigationLocked?.(sceneName)) {
    logMessage("quest", "探索中は帰還するまで他の画面へ移動できません。", "warn");
    renderCurrentScene();
    return;
  }
  if (state.pendingGeneratedMech && sceneName !== "synthesis") {
    state.currentScene = "synthesis";
    state.synthesisTab = "mech-generate";
    state.synthesisStep = state.generationStatus?.busy ? "materials" : "result";
    logMessage("synthesis", "生成済み機体を保存または破棄してください。", "warn");
    savePlayerData();
    renderCurrentScene();
    return;
  }
  if (sceneName === "quest" && state.currentScene !== "quest" && state.currentScene !== "battle") {
    if (typeof window.ensureQuestFloor === "function") window.ensureQuestFloor();
  }
  if (state.currentScene === "battle" && sceneName !== "battle" && typeof window.stopAutoBattleTimer === "function") {
    window.stopAutoBattleTimer();
  }
  state.currentScene = sceneName;
  renderCurrentScene();
};

window.renderCurrentScene = function renderCurrentScene() {
  const state = window.GameState;
  if (state.scenario?.active && typeof window.renderScenario === "function") {
    window.renderScenario();
    renderBottomNav();
    return;
  }
  if (state.currentScene !== "battle" && typeof window.stopAutoBattleTimer === "function") window.stopAutoBattleTimer();
  const renderer = window.App.scenes[state.currentScene];
  if (renderer) renderer();
  if (typeof window.hydrateMechImages === "function") window.hydrateMechImages(window.App.root);
  renderBottomNav();
};

window.sellMaterial = function sellMaterial(materialId) {
  const state = window.GameState;
  const material = getMaterial(materialId);
  if (!material) return;
  if (!window.consumeBaseMaterial(materialId, 1)) return;
  if (typeof window.addMaterialCurrency === "function") window.addMaterialCurrency(material.value);
  logMessage("bar", `${material.name}を資材🧱${material.value}で売却した。`, "good");
  renderCurrentScene();
};

