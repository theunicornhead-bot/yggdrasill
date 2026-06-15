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
  return Object.values({ ...state.materials, ...state.runMaterials }).reduce((sum, count) => sum + count, 0);
};

window.allMaterialCounts = function allMaterialCounts() {
  const state = window.GameState;
  const merged = { ...state.materials };
  Object.entries(state.runMaterials).forEach(([id, count]) => {
    merged[id] = (merged[id] || 0) + count;
  });
  return merged;
};

window.getMaterial = function getMaterial(id) {
  return window.MaterialCatalog.find((material) => material.id === id);
};

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

window.renderHeader = function renderHeader(titleJa, titleEn, extra = "") {
  const state = window.GameState;
  return `
    <div class="top-bar">
      <div class="title-block">
        <span class="title-ja">${titleJa}</span>
        <span class="title-en">${titleEn}</span>
      </div>
      <div class="resource-row">
        <div class="resource"><small>所持金</small><strong>${formatNumber(state.money)} G</strong></div>
        <div class="resource"><small>所持素材</small><strong>${totalMaterials()} / 100</strong></div>
        ${extra}
      </div>
    </div>
  `;
};

window.renderBottomNav = function renderBottomNav() {
  document.querySelectorAll(".nav-btn").forEach((button) => {
    button.classList.toggle("active", button.dataset.screen === window.GameState.currentScene);
  });
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
  const entries = Object.entries(allMaterialCounts()).filter(([, count]) => count > 0);
  if (!entries.length) return `<div class="muted">素材はありません。</div>`;
  return entries.map(([id, count]) => {
    const material = getMaterial(id);
    return `
      <div class="material-row">
        <div class="material-icon"></div>
        <span style="flex:1">${material.name}<br><span class="muted">RANK ${material.rank} / ${material.prompts[0]}</span></span>
        <strong>x${count}</strong>
        <span>${material.value} G</span>
        <button class="button" data-action="sell-material" data-material="${id}">売却</button>
      </div>
    `;
  }).join("");
};

window.switchScene = function switchScene(sceneName) {
  const state = window.GameState;
  if (sceneName === "quest" && state.currentScene !== "quest" && state.currentScene !== "battle") {
    if (typeof window.ensureQuestFloor === "function") window.ensureQuestFloor();
  }
  state.currentScene = sceneName;
  renderCurrentScene();
};

window.renderCurrentScene = function renderCurrentScene() {
  renderBottomNav();
  const state = window.GameState;
  const renderer = window.App.scenes[state.currentScene];
  if (renderer) renderer();
  if (typeof window.hydrateMechImages === "function") window.hydrateMechImages(window.App.root);
};

window.sellMaterial = function sellMaterial(materialId) {
  const state = window.GameState;
  const material = getMaterial(materialId);
  if (!material) return;
  if (state.materials[materialId] > 0) {
    state.materials[materialId] -= 1;
  } else if (state.runMaterials[materialId] > 0) {
    state.runMaterials[materialId] -= 1;
  } else {
    return;
  }
  state.money += material.value;
  logMessage("bar", `${material.name}を${material.value}Gで売却した。`, "good");
  renderCurrentScene();
};
