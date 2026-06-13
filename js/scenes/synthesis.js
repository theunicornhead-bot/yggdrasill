"use strict";

function materialCountsForSynthesis() {
  const counts = allMaterialCounts();
  window.GameState.synthesisSlots.forEach((id) => {
    counts[id] = Math.max(0, (counts[id] || 0) - 1);
  });
  return counts;
}

window.canAddMech = function canAddMech() {
  return window.GameState.mechs.length < 4;
};

function consumeMaterial(materialId) {
  const state = window.GameState;
  if (state.materials[materialId] > 0) {
    state.materials[materialId] -= 1;
    return true;
  }
  if (state.runMaterials[materialId] > 0) {
    state.runMaterials[materialId] -= 1;
    return true;
  }
  return false;
}

function synthesisPreview() {
  window.ensureMechGenerationState();
  return window.previewGeneratedMech(window.GameState.selectedCoreId, window.GameState.synthesisSlots);
}

window.renderSynthesis = function renderSynthesis() {
  const state = window.GameState;
  window.ensureMechGenerationState();
  const selectedCore = getMechCore(state.selectedCoreId);
  const selectedMaterial = getMechGenerationMaterial(state.selectedMaterialId) || firstOwnedGenerationMaterial();
  const preview = synthesisPreview();
  const canGenerate = preview && preview.output.state !== "failure" && !state.generationStatus.busy && canAddMech();
  window.App.root.innerHTML = `
    ${renderHeader("機体生成", "MECH FORGE")}
    <section class="synthesis-vat panel">
      <div class="reticle"></div>
      <div class="vat-label"><span>LOCAL FORGE ONLINE</span><span>MATERIAL ${state.synthesisSlots.length} / 5</span></div>
    </section>
    <section class="synthesis-layout">
      <div class="panel panel-pad">
        <div class="section-head"><h2>コア選択</h2><span>${selectedCore ? selectedCore.outputLimit : "-"} output</span></div>
        <div class="compact-list">${coreRowsHtml()}</div>
      </div>
      <div class="panel panel-pad">
        <div class="section-head"><h2>素材スロット</h2><span>3-5個</span></div>
        <div class="slot-grid">${synthesisSlotsHtml()}</div>
        <div class="synth-actions" style="margin-top:10px">
          <button class="button" data-action="start-synthesis" ${canGenerate ? "" : "disabled"}>${state.generationStatus.busy ? "生成中..." : "機体生成"}</button>
          <button class="button" data-action="remove-synth-material" ${state.synthesisSlots.length ? "" : "disabled"}>素材を外す</button>
          <button class="button danger" data-action="reset-synthesis" ${state.synthesisSlots.length ? "" : "disabled"}>リセット</button>
        </div>
        ${state.generationStatus.message ? `<p class="muted">${state.generationStatus.message}</p>` : ""}
      </div>
      <div class="panel panel-pad">
        <div class="section-head"><h2>所持素材</h2><span>選択して投入</span></div>
        <div class="synth-materials compact-list">${synthesisMaterialRows()}</div>
      </div>
      <div class="panel panel-pad">
        <div class="section-head"><h2>選択中素材</h2><span>${selectedMaterial ? selectedMaterial.rarity : "-"}</span></div>
        ${selectedMaterial ? selectedMaterialHtml(selectedMaterial) : `<div class="muted">投入できる素材がありません。</div>`}
      </div>
      <div class="panel panel-pad">
        <div class="section-head"><h2>生成予測</h2><span>${preview ? preview.output.state : "素材不足"}</span></div>
        ${preview ? previewHtml(preview) : `<div class="muted">コア1個と素材3-5個を選択してください。</div>`}
      </div>
      <div class="panel panel-pad">
        <div class="section-head"><h2>生成ログ</h2><span>server image api</span></div>
        <div class="log-panel">${logHtml("synthesis")}</div>
      </div>
    </section>
  `;
};

function firstOwnedGenerationMaterial() {
  const counts = materialCountsForSynthesis();
  const id = Object.keys(counts).find((materialId) => counts[materialId] > 0 && getMechGenerationMaterial(materialId));
  return id ? getMechGenerationMaterial(id) : null;
}

function coreRowsHtml() {
  return getOwnedCoreIds().map((id) => {
    const core = getMechCore(id);
    if (!core) return "";
    return `
      <button class="material-row ${window.GameState.selectedCoreId === id ? "active" : ""}" data-action="select-mech-core" data-core="${id}" type="button">
        <span style="flex:1;text-align:left">${core.name}<br><span class="muted">${core.category} / ${core.rarity}</span></span>
        <strong>${core.outputLimit}</strong>
      </button>
    `;
  }).join("");
}

function synthesisSlotsHtml() {
  return Array.from({ length: 5 }, (_, index) => {
    const material = getMechGenerationMaterial(window.GameState.synthesisSlots[index]);
    return `<button class="synth-slot ${material ? "filled" : ""}" data-action="select-synth-slot" data-slot="${index}" type="button">${material ? `<strong>${material.rarity}</strong><br>${material.name}` : `<span class="muted">EMPTY<br>${String(index + 1).padStart(2, "0")}</span>`}</button>`;
  }).join("");
}

function synthesisMaterialRows() {
  const counts = materialCountsForSynthesis();
  const entries = Object.entries(counts).filter(([id, count]) => count > 0 && getMechGenerationMaterial(id));
  if (!entries.length) return `<div class="muted">生成に使える素材がありません。</div>`;
  return entries.map(([id, count]) => {
    const material = getMechGenerationMaterial(id);
    return `
      <button class="material-row ${window.GameState.selectedMaterialId === id ? "active" : ""}" data-action="select-synth-material" data-material="${id}" type="button">
        <div class="material-icon"></div>
        <span style="flex:1;text-align:left">${material.name}<br><span class="muted">${material.category} / cost ${material.outputCost}</span></span>
        <strong>x${count}</strong>
      </button>
    `;
  }).join("");
}

function selectedMaterialHtml(material) {
  return `
    <div class="material-row">
      <div class="material-icon"></div>
      <span style="flex:1">${material.name}<br><span class="muted">${material.category} / ${material.rarity}</span></span>
      <button class="button" data-action="add-synth-material" data-material="${material.id}">投入</button>
    </div>
    <div class="tag-row" style="margin-top:8px">${material.prompts.map((prompt) => `<span class="tag">${prompt}</span>`).join("")}</div>
  `;
}

function previewHtml(preview) {
  return `
    <div class="stat-row"><span>カテゴリ</span><strong>${preview.type}</strong></div>
    <div class="stat-row"><span>サイズ</span><strong>${preview.size}</strong></div>
    <div class="stat-row"><span>必要出力</span><strong>${preview.output.required} / ${preview.output.limit}</strong></div>
    <div class="stat-row"><span>余剰出力</span><strong>${preview.output.margin}</strong></div>
    <div class="stat-row"><span>負荷率</span><strong>${Math.round(preview.output.loadRate * 100)}%</strong></div>
    <div class="stat-row"><span>HP</span><strong>${preview.stats.hp}</strong></div>
    <div class="stat-row"><span>ATK</span><strong>${preview.stats.attack}</strong></div>
    <div class="stat-row"><span>DEF</span><strong>${preview.stats.armor}</strong></div>
    <div class="stat-row"><span>ACCURACY</span><strong>${preview.stats.accuracy}</strong></div>
    <div class="stat-row"><span>EVASION</span><strong>${preview.stats.evasion}</strong></div>
    <div class="stat-row"><span>SPEED</span><strong>${preview.stats.speed}</strong></div>
    <div class="stat-row"><span>FUEL COST</span><strong>${preview.stats.fuelCost}</strong></div>
    <div class="stat-row"><span>CARGO</span><strong>${preview.stats.cargo}</strong></div>
    <div class="stat-row"><span>SCAN</span><strong>${preview.stats.scan}</strong></div>
    <div class="section-head" style="margin-top:10px"><h3>visualPrompt</h3></div>
    <div class="prompt-box">${preview.visualPrompt}</div>
  `;
}

window.selectMechCore = function selectMechCore(coreId) {
  if (!getMechCore(coreId)) return;
  window.GameState.selectedCoreId = coreId;
  renderCurrentScene();
};

window.selectSynthMaterial = function selectSynthMaterial(materialId) {
  if (!getMechGenerationMaterial(materialId)) return;
  window.GameState.selectedMaterialId = materialId;
  renderCurrentScene();
};

window.addSynthMaterial = function addSynthMaterial(materialId) {
  const counts = materialCountsForSynthesis();
  const material = getMechGenerationMaterial(materialId);
  if (!material || window.GameState.synthesisSlots.length >= 5 || !counts[materialId]) {
    logMessage("synthesis", "投入できない素材です。", "danger");
    renderCurrentScene();
    return;
  }
  window.GameState.selectedMaterialId = materialId;
  window.GameState.synthesisSlots.push(materialId);
  logMessage("synthesis", `${material.name}を投入しました。`, "good");
  renderCurrentScene();
};

window.removeSynthMaterial = function removeSynthMaterial() {
  const removedId = window.GameState.synthesisSlots.pop();
  const material = getMechGenerationMaterial(removedId);
  if (material) logMessage("synthesis", `${material.name}を外しました。`, "warn");
  renderCurrentScene();
};

window.resetSynthesis = function resetSynthesis() {
  window.GameState.synthesisSlots = [];
  window.GameState.generationStatus = { busy: false, message: "" };
  logMessage("synthesis", "生成スロットをリセットしました。", "warn");
  renderCurrentScene();
};

window.startSynthesisProcess = async function startSynthesisProcess() {
  const state = window.GameState;
  window.ensureMechGenerationState();
  const slots = [...state.synthesisSlots];
  const preview = window.previewGeneratedMech(state.selectedCoreId, slots);
  if (!preview) {
    logMessage("synthesis", "コア1個と素材3-5個が必要です。", "danger");
    renderCurrentScene();
    return;
  }
  if (preview.output.state === "failure") {
    logMessage("synthesis", "出力限界を超過しました。failure のため生成できません。", "danger");
    renderCurrentScene();
    return;
  }
  if (!canAddMech()) {
    logMessage("synthesis", "ハンガーの空きがありません。", "danger");
    renderCurrentScene();
    return;
  }
  if (!slots.every(consumeMaterial)) {
    logMessage("synthesis", "素材消費に失敗しました。", "danger");
    renderCurrentScene();
    return;
  }

  const mech = window.createGeneratedMechData(preview, slots);
  state.mechs.push(mech);
  state.selectedMechId = mech.id;
  state.synthesisSlots = [];
  state.generationStatus = { busy: true, message: "画像生成APIへ送信中..." };
  window.savePlayerData();
  renderCurrentScene();

  try {
    const response = await fetch("/api/generate-mech-image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ unitId: mech.id, prompt: mech.visualPrompt })
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || !payload.ok) throw new Error(payload.error || `HTTP ${response.status}`);
    mech.imagePath = payload.imagePath;
    logMessage("synthesis", `${mech.name}を生成し、画像を保存しました。`, "good");
  } catch (error) {
    mech.imagePath = null;
    logMessage("synthesis", `${mech.name}を生成しました。画像生成は失敗: ${error.message || error}`, "warn");
  } finally {
    state.generationStatus = { busy: false, message: "" };
    window.savePlayerData();
    renderCurrentScene();
  }
};

window.App.scenes.synthesis = window.renderSynthesis;
