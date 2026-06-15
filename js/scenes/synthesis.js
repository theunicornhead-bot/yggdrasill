"use strict";

function materialCountsForSynthesis() {
  const counts = allMaterialCounts();
  (window.GameState.synthesisSlots || []).filter(Boolean).forEach((id) => {
    counts[id] = Math.max(0, (counts[id] || 0) - 1);
  });
  return counts;
}

function selectedSynthesisMaterialIds() {
  return (window.GameState.synthesisSlots || []).filter(Boolean);
}

function selectedSynthesisMaterialCount() {
  return selectedSynthesisMaterialIds().length;
}

function synthesisSlotDefs() {
  return typeof window.getSynthesisSlotDefs === "function"
    ? window.getSynthesisSlotDefs()
    : Array.from({ length: 5 }, (_, index) => ({ key: `slot${index}`, label: `SLOT ${index + 1}`, accepts: [] }));
}

function findFirstAvailableSynthesisSlot(material) {
  const slots = window.GameState.synthesisSlots || [];
  return synthesisSlotDefs().findIndex((slot, index) => {
    if (slots[index]) return false;
    if (typeof window.canMaterialFitSynthesisSlot !== "function") return true;
    return window.canMaterialFitSynthesisSlot(material, index);
  });
}

window.canAddMech = function canAddMech() {
  const state = window.GameState;
  const ownedLimit = typeof window.getOwnedMechLimit === "function" ? window.getOwnedMechLimit() : 30;
  return !state.pendingGeneratedMech && (state.mechs || []).length < ownedLimit;
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

function getSynthesisStep() {
  window.ensureMechGenerationState();
  const step = window.GameState.synthesisStep;
  return step === "materials" || step === "result" ? step : "core";
}

function setSynthesisStep(step) {
  window.GameState.synthesisStep = step;
}

window.renderSynthesis = function renderSynthesis() {
  const state = window.GameState;
  window.ensureMechGenerationState();
  state.synthesisTab = ["mech-generate", "mech-enhance", "mech-rank-up", "weapon-generate"].includes(state.synthesisTab) ? state.synthesisTab : "mech-generate";
  const step = getSynthesisStep();
  window.App.root.innerHTML = `
    ${renderHeader("生成", "FORGE")}
    ${renderSynthesisTabs()}
    ${state.synthesisTab === "mech-generate" ? `
    <section class="synthesis-vat panel">
      <div class="reticle"></div>
      <div class="vat-label"><span>${stepLabel(step)}</span><span>MATERIAL ${selectedSynthesisMaterialCount()} / 5</span></div>
    </section>
    ${step === "core" ? renderCoreStep() : ""}
    ${step === "materials" ? renderMaterialsStep() : ""}
    ${step === "result" ? renderResultStep() : ""}
    ` : ""}
    ${state.synthesisTab === "mech-enhance" ? renderMachineEnhanceTab() : ""}
    ${state.synthesisTab === "mech-rank-up" ? renderMachineRankUpTab() : ""}
    ${state.synthesisTab === "weapon-generate" ? renderWeaponGenerateTab() : ""}
  `;
};

function renderSynthesisTabs() {
  const tabs = [
    ["mech-generate", "機体生成"],
    ["mech-enhance", "機体強化"],
    ["mech-rank-up", "機体ランクアップ"],
    ["weapon-generate", "武器生成"]
  ];
  return `<section class="sub-tabs synthesis-tabs">${tabs.map(([tab, label]) => `<button class="button ${window.GameState.synthesisTab === tab ? "active" : ""}" data-action="change-synthesis-tab" data-tab="${tab}" type="button">${label}</button>`).join("")}</section>`;
}

function renderMachineEnhanceTab() {
  return `
    <section class="panel panel-pad">
      <div class="section-head"><h2>機体強化</h2><span>M-Lv</span></div>
      <div class="compact-list">${(window.GameState.mechs || []).map(renderMachineEnhanceRow).join("")}</div>
    </section>
  `;
}

function renderMachineEnhanceRow(machine) {
  if (typeof window.normalizeMachineStatus === "function") window.normalizeMachineStatus(machine);
  const cap = typeof window.getMachineLevelCap === "function" ? window.getMachineLevelCap(machine.rank) : 10;
  const canEnhance = typeof window.canEnhanceMachine === "function" ? window.canEnhanceMachine(machine, window.GameState.materials) : machine.level < cap;
  return `
    <article class="material-row">
      <span style="flex:1">${machine.name || "Machine"}<br><span class="muted">RANK ${machine.rank || "-"} / Lv ${machine.level || 1} / ${cap}</span></span>
      <button class="button" data-action="enhance-machine" data-mech="${machine.id}" ${canEnhance ? "" : "disabled"} type="button">強化</button>
    </article>
  `;
}

function renderMachineRankUpTab() {
  return `
    <section class="panel panel-pad">
      <div class="section-head"><h2>機体ランクアップ</h2><span>再生成予定</span></div>
      <div class="compact-list">${(window.GameState.mechs || []).map(renderMachineRankUpRow).join("")}</div>
    </section>
  `;
}

function renderMachineRankUpRow(machine) {
  const requirement = typeof window.getMachineRankUpRequirement === "function" ? window.getMachineRankUpRequirement(machine) : { nextRank: null, coreId: "", message: "必要コア未設定" };
  const canRankUp = typeof window.canRankUpMachine === "function" && window.canRankUpMachine(machine, window.ensureInventoryState ? window.ensureInventoryState() : {});
  return `
    <article class="panel panel-pad">
      <div class="section-head"><h3>${machine.name || "Machine"}</h3><span>RANK ${machine.rank || "-"}</span></div>
      <div class="material-row"><span>次Rank</span><strong>${requirement.nextRank || "なし"}</strong></div>
      <div class="material-row"><span>必要コア</span><strong>${requirement.coreId || requirement.message || "必要コア未設定"}</strong></div>
      <div class="material-row"><span>見た目</span><strong>再生成予定</strong></div>
      <button class="button tavern-wide-action" data-action="rank-up-machine" data-mech="${machine.id}" ${canRankUp ? "" : "disabled"} type="button">ランクアップ</button>
    </article>
  `;
}

function renderWeaponGenerateTab() {
  const weapons = Array.isArray(window.masterData?.weaponMaster) ? window.masterData.weaponMaster.slice(0, 16) : [];
  return `
    <section class="panel panel-pad">
      <div class="section-head"><h2>武器生成</h2><span>${weapons.length ? "候補" : "未実装"}</span></div>
      <div class="compact-list">${weapons.length ? weapons.map(renderWeaponCandidate).join("") : `<div class="muted">weapon_master.csv が未読込です。武器生成ロジックは後続実装です。</div>`}</div>
    </section>
  `;
}

function renderWeaponCandidate(weapon) {
  return `
    <div class="material-row">
      <span style="flex:1">${weapon.name || weapon.weaponId || "Weapon"}<br><span class="muted">${weapon.weaponType || "-"} / ${weapon.element || "none"} / RANK ${weapon.rank || "-"}</span></span>
      <button class="button" data-action="generate-weapon" data-weapon="${weapon.weaponId}" type="button">未実装</button>
    </div>
  `;
}

function stepLabel(step) {
  return { core: "STEP 1 CORE SELECT", materials: "STEP 2 MATERIAL SELECT", result: "RESULT" }[step] || "MECH FORGE";
}

function renderCoreStep() {
  const state = window.GameState;
  const selectedCore = window.getMechCore(state.selectedCoreId);
  return `
    <section class="synthesis-layout">
      ${renderSlotPanel(false)}
      <div class="panel panel-pad">
        <div class="section-head"><h2>コア選択</h2><span>${selectedCore ? `${selectedCore.outputLimit} output` : "未選択"}</span></div>
        <div class="compact-list">${coreRowsHtml()}</div>
      </div>
      <div class="panel panel-pad">
        <div class="section-head"><h2>選択中コア</h2><span>${selectedCore ? selectedCore.rarity : "-"}</span></div>
        ${selectedCore ? selectedCoreHtml(selectedCore) : `<div class="muted">コアを選択してください。</div>`}
        <div class="synth-actions" style="margin-top:10px">
          <button class="button" data-action="synthesis-next-step" ${selectedCore ? "" : "disabled"}>次へ</button>
          <button class="button danger" data-action="reset-synthesis" ${selectedSynthesisMaterialCount() ? "" : "disabled"}>リセット</button>
        </div>
      </div>
      ${renderLogPanel()}
    </section>
  `;
}

function renderMaterialsStep() {
  const state = window.GameState;
  const selectedCore = window.getMechCore(state.selectedCoreId);
  const selectedMaterial = window.getMechGenerationMaterial(state.selectedMaterialId) || firstOwnedGenerationMaterial();
  const preview = synthesisPreview();
  const materialCount = selectedSynthesisMaterialCount();
  const enoughMaterials = materialCount >= 3 && materialCount <= 5;
  const canGenerate = Boolean(
    selectedCore &&
    preview &&
    preview.output.state !== "failure" &&
    enoughMaterials &&
    !state.generationStatus.busy &&
    window.canAddMech()
  );

  return `
    <section class="synthesis-layout">
      ${renderSlotPanel(true)}
      <div class="panel panel-pad">
        <div class="section-head"><h2>選択済みコア</h2><span>${selectedCore ? selectedCore.outputLimit : "-"} output</span></div>
        ${selectedCore ? selectedCoreHtml(selectedCore) : `<div class="muted">コアが未選択です。</div>`}
        <div class="synth-actions" style="margin-top:10px">
          <button class="button" data-action="synthesis-prev-step">戻る</button>
        </div>
      </div>
      <div class="panel panel-pad">
        <div class="section-head"><h2>素材選択</h2><span>3-5個</span></div>
        <div class="synth-materials compact-list">${synthesisMaterialRows()}</div>
      </div>
      <div class="panel panel-pad">
        <div class="section-head"><h2>選択中素材</h2><span>${selectedMaterial ? selectedMaterial.rarity : "-"}</span></div>
        ${selectedMaterial ? selectedMaterialHtml(selectedMaterial) : `<div class="muted">投入できる素材がありません。</div>`}
      </div>
      <div class="panel panel-pad">
        <div class="section-head"><h2>生成予測</h2><span>${preview ? preview.output.state : "素材不足"}</span></div>
        ${preview ? previewHtml(preview) : `<div class="muted">素材を3-5個選択してください。</div>`}
        <div class="synth-actions" style="margin-top:10px">
          <button class="button" data-action="start-synthesis" ${canGenerate ? "" : "disabled"}>${state.generationStatus.busy ? "生成中..." : "生成"}</button>
        </div>
        ${state.generationStatus.message ? `<p class="muted">${state.generationStatus.message}</p>` : ""}
      </div>
      ${renderLogPanel()}
    </section>
  `;
}

function renderResultStep() {
  const pending = window.GameState.pendingGeneratedMech;
  const ownedLimit = typeof window.getOwnedMechLimit === "function" ? window.getOwnedMechLimit() : 30;
  const full = (window.GameState.mechs || []).length >= ownedLimit;
  return `
    <section class="synthesis-layout">
      ${renderSlotPanel(false)}
      <div class="panel panel-pad">
        <div class="section-head"><h2>生成完了</h2><span>${pending ? "PENDING" : "HANGER"}</span></div>
        <div class="muted">${pending ? `${pending.name || "Machine"}は保存待ちです。` : "保存待ち機体はありません。"}</div>
        ${full ? `<p class="muted">格納庫が満杯です。保存するには機体を削除してください。</p>` : ""}
        <div class="synth-actions" style="margin-top:10px">
          <button class="button" data-action="confirm-pending-mech" ${pending && !full ? "" : "disabled"} type="button">格納庫へ保存</button>
          <button class="button danger" data-action="discard-pending-mech" ${pending ? "" : "disabled"} type="button">破棄</button>
          <button class="button" data-screen="hangar">ハンガーへ</button>
          <button class="button" data-action="reset-synthesis" ${pending ? "disabled" : ""}>続けて生成</button>
        </div>
      </div>
      ${renderLogPanel()}
    </section>
  `;
}

function renderSlotPanel(allowRemove) {
  const state = window.GameState;
  return `
    <div class="panel panel-pad">
      <div class="section-head"><h2>素材スロット</h2><span>${selectedSynthesisMaterialCount()} / 5</span></div>
      <div class="slot-grid">${synthesisSlotsHtml()}</div>
      ${allowRemove ? `
        <div class="synth-actions" style="margin-top:10px">
          <button class="button" data-action="remove-synth-material" ${selectedSynthesisMaterialCount() ? "" : "disabled"}>素材を外す</button>
          <button class="button danger" data-action="clear-synth-materials" ${selectedSynthesisMaterialCount() ? "" : "disabled"}>素材リセット</button>
        </div>
      ` : ""}
    </div>
  `;
}

function renderLogPanel() {
  return `
    <div class="panel panel-pad">
      <div class="section-head"><h2>生成ログ</h2><span>server image api</span></div>
      <div class="log-panel">${logHtml("synthesis")}</div>
    </div>
  `;
}

function firstOwnedGenerationMaterial() {
  const counts = materialCountsForSynthesis();
  const id = Object.keys(counts).find((materialId) => counts[materialId] > 0 && window.getMechGenerationMaterial(materialId));
  return id ? window.getMechGenerationMaterial(id) : null;
}

function coreRowsHtml() {
  return window.getOwnedCoreIds().map((id) => {
    const core = window.getMechCore(id);
    if (!core) return "";
    return `
      <button class="material-row ${window.GameState.selectedCoreId === id ? "active" : ""}" data-action="select-mech-core" data-core="${id}" type="button">
        <span style="flex:1;text-align:left">${core.name}<br><span class="muted">${core.category} / ${core.rarity}</span></span>
        <strong>${core.outputLimit}</strong>
      </button>
    `;
  }).join("");
}

function selectedCoreHtml(core) {
  return `
    <div class="material-row">
      <span style="flex:1">${core.name}<br><span class="muted">${core.category} / ${core.rarity}</span></span>
      <strong>${core.outputLimit}</strong>
    </div>
    <div class="tag-row" style="margin-top:8px">${core.prompts.map((prompt) => `<span class="tag">${prompt}</span>`).join("")}</div>
  `;
}

function synthesisSlotsHtml() {
  return synthesisSlotDefs().map((slot, index) => {
    const material = window.getMechGenerationMaterial(window.GameState.synthesisSlots[index]);
    const slotType = material?.slotType || slot.key;
    return `<button class="synth-slot ${material ? "filled" : ""}" data-action="select-synth-slot" data-slot="${index}" type="button"><span class="muted">${slot.label}</span><br>${material ? `<strong>${material.rarity}</strong><br>${material.name}<br><span class="muted">${slotType}</span>` : `<span class="muted">EMPTY<br>${String(index + 1).padStart(2, "0")}</span>`}</button>`;
  }).join("");
}

function synthesisMaterialRows() {
  const counts = materialCountsForSynthesis();
  const entries = Object.entries(counts).filter(([id, count]) => count > 0 && window.getMechGenerationMaterial(id));
  if (!entries.length) return `<div class="muted">生成に使える素材がありません。</div>`;
  return entries.map(([id, count]) => {
    const material = window.getMechGenerationMaterial(id);
    const slotIndex = findFirstAvailableSynthesisSlot(material);
    const slotLabel = slotIndex >= 0 ? synthesisSlotDefs()[slotIndex].label : "対応枠なし";
    return `
      <button class="material-row ${window.GameState.selectedMaterialId === id ? "active" : ""}" data-action="select-synth-material" data-material="${id}" ${slotIndex >= 0 ? "" : "disabled"} type="button">
        <div class="material-icon"></div>
        <span style="flex:1;text-align:left">${material.name}<br><span class="muted">${material.slotType || material.category} / ${slotLabel} / cost ${material.outputCost}</span></span>
        <strong>x${count}</strong>
      </button>
    `;
  }).join("");
}

function selectedMaterialHtml(material) {
  const counts = materialCountsForSynthesis();
  const slotIndex = findFirstAvailableSynthesisSlot(material);
  const slotLabel = slotIndex >= 0 ? synthesisSlotDefs()[slotIndex].label : "対応する空き枠なし";
  const canAdd = slotIndex >= 0 && counts[material.id] > 0;
  return `
    <div class="material-row">
      <div class="material-icon"></div>
      <span style="flex:1">${material.name}<br><span class="muted">${material.slotType || material.category} / ${slotLabel} / ${material.rarity}</span></span>
      <button class="button" data-action="add-synth-material" data-material="${material.id}" ${canAdd ? "" : "disabled"}>投入</button>
    </div>
    <div class="tag-row" style="margin-top:8px">${[material.accentColor, ...(material.visualTags || []), ...(material.prompts || [])].filter(Boolean).map((prompt) => `<span class="tag">${prompt}</span>`).join("")}</div>
  `;
}

function previewHtml(preview) {
  const stats = preview.unitStats || {};
  return `
    <div class="stat-row"><span>RANK</span><strong>${preview.rarity || "N"}</strong></div>
    <div class="stat-row"><span>TAG</span><strong>${preview.tag || "general"}</strong></div>
    <div class="stat-row"><span>カテゴリ</span><strong>${preview.type}</strong></div>
    <div class="stat-row"><span>サイズ</span><strong>${preview.size}</strong></div>
    <div class="stat-row"><span>必要出力</span><strong>${preview.output.required} / ${preview.output.limit}</strong></div>
    <div class="stat-row"><span>余剰出力</span><strong>${preview.output.margin}</strong></div>
    <div class="stat-row"><span>負荷率</span><strong>${Math.round(preview.output.loadRate * 100)}%</strong></div>
    <div class="stat-row"><span>HP</span><strong>${stats.hp || 0}</strong></div>
    <div class="stat-row"><span>PP</span><strong>${stats.pp || 0}</strong></div>
    <div class="stat-row"><span>S-ATK</span><strong>${stats.sAtk || 0}</strong></div>
    <div class="stat-row"><span>M-ATK</span><strong>${stats.mAtk || 0}</strong></div>
    <div class="stat-row"><span>L-ATK</span><strong>${stats.lAtk || 0}</strong></div>
    <div class="stat-row"><span>S-DEF</span><strong>${stats.sDef || 0}</strong></div>
    <div class="stat-row"><span>M-DEF</span><strong>${stats.mDef || 0}</strong></div>
    <div class="stat-row"><span>L-DEF</span><strong>${stats.lDef || 0}</strong></div>
    <div class="stat-row"><span>SPEED</span><strong>${stats.speed || 0}</strong></div>
    <div class="section-head" style="margin-top:10px"><h3>visualPrompt</h3></div>
    <div class="prompt-box">${preview.visualPrompt}</div>
  `;
}

window.selectMechCore = function selectMechCore(coreId) {
  if (!window.getMechCore(coreId)) return;
  window.GameState.selectedCoreId = coreId;
  setSynthesisStep("core");
  window.renderCurrentScene();
};

window.goSynthesisNextStep = function goSynthesisNextStep() {
  if (!window.getMechCore(window.GameState.selectedCoreId)) return;
  setSynthesisStep("materials");
  window.renderCurrentScene();
};

window.goSynthesisPrevStep = function goSynthesisPrevStep() {
  window.GameState.synthesisSlots = [];
  setSynthesisStep("core");
  window.renderCurrentScene();
};

window.clearSynthMaterials = function clearSynthMaterials() {
  window.GameState.synthesisSlots = [];
  window.renderCurrentScene();
};

window.selectSynthMaterial = function selectSynthMaterial(materialId) {
  if (!window.getMechGenerationMaterial(materialId)) return;
  window.GameState.selectedMaterialId = materialId;
  window.renderCurrentScene();
};

window.addSynthMaterial = function addSynthMaterial(materialId) {
  const counts = materialCountsForSynthesis();
  const material = window.getMechGenerationMaterial(materialId);
  const slotIndex = material ? findFirstAvailableSynthesisSlot(material) : -1;
  if (!material || slotIndex < 0 || !counts[materialId]) {
    logMessage("synthesis", "投入できない素材です。", "danger");
    window.renderCurrentScene();
    return;
  }
  window.GameState.selectedMaterialId = materialId;
  window.GameState.synthesisSlots[slotIndex] = materialId;
  logMessage("synthesis", `${material.name}を${synthesisSlotDefs()[slotIndex].label}に投入しました。`, "good");
  window.renderCurrentScene();
};

window.removeSynthMaterial = function removeSynthMaterial() {
  const slots = window.GameState.synthesisSlots || [];
  const lastIndex = slots.map((id, index) => (id ? index : -1)).filter((index) => index >= 0).pop();
  const removedId = lastIndex >= 0 ? slots[lastIndex] : null;
  if (lastIndex >= 0) slots[lastIndex] = null;
  const material = window.getMechGenerationMaterial(removedId);
  if (material) logMessage("synthesis", `${material.name}を外しました。`, "warn");
  window.renderCurrentScene();
};

window.resetSynthesis = function resetSynthesis() {
  window.GameState.synthesisSlots = [];
  window.GameState.synthesisStep = "core";
  window.GameState.generationStatus = { busy: false, message: "" };
  logMessage("synthesis", "生成スロットをリセットしました。", "warn");
  window.renderCurrentScene();
};

window.startSynthesisProcess = async function startSynthesisProcess() {
  const state = window.GameState;
  window.ensureMechGenerationState();
  const rawSlots = [...(state.synthesisSlots || [])];
  const slots = rawSlots.filter(Boolean);
  const preview = window.previewGeneratedMech(state.selectedCoreId, rawSlots);
  if (!preview) {
    logMessage("synthesis", "コア1個と素材3-5個が必要です。", "danger");
    window.renderCurrentScene();
    return;
  }
  if (preview.output.state === "failure") {
    logMessage("synthesis", "出力限界を超過しました。failure のため生成できません。", "danger");
    window.renderCurrentScene();
    return;
  }
  if (!window.canAddMech()) {
    logMessage("synthesis", state.pendingGeneratedMech ? "保存待ち機体を先に保存または破棄してください。" : "格納庫の空きがありません。", "danger");
    window.renderCurrentScene();
    return;
  }
  if (!slots.every(consumeMaterial)) {
    logMessage("synthesis", "素材消費に失敗しました。", "danger");
    window.renderCurrentScene();
    return;
  }

  const mech = window.createGeneratedMechData(preview, slots);
  state.pendingGeneratedMech = mech;
  state.selectedMechId = mech.id;
  state.synthesisSlots = [];
  state.generationStatus = { busy: true, message: "画像生成APIへ送信中..." };
  window.savePlayerData();
  window.renderCurrentScene();

  try {
    const response = await fetch("/api/generate-mech-image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ unitId: mech.id, prompt: mech.visualPrompt })
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || !payload.ok) throw new Error(payload.error || `HTTP ${response.status}`);
    if (payload.imagePath && typeof window.saveMechImageFromSource === "function") {
      await window.saveMechImageFromSource(mech.imageId, payload.imagePath);
      mech.imagePath = null;
      logMessage("synthesis", `${mech.name}を生成し、画像をWebPで保存しました。`, "good");
    } else {
      mech.imagePath = payload.imagePath || null;
      logMessage("synthesis", `${mech.name}を生成しました。画像保存形式は旧形式です。`, "warn");
    }
  } catch (error) {
    mech.imagePath = null;
    logMessage("synthesis", `${mech.name}を生成しました。画像生成は失敗: ${error.message || error}`, "warn");
  } finally {
    state.generationStatus = { busy: false, message: "" };
    state.synthesisStep = "result";
    window.savePlayerData();
    window.renderCurrentScene();
  }
};

window.setSynthesisTab = function setSynthesisTab(tab) {
  window.GameState.synthesisTab = ["mech-generate", "mech-enhance", "mech-rank-up", "weapon-generate"].includes(tab) ? tab : "mech-generate";
  window.renderCurrentScene();
};

window.getNextMachineRank = function getNextMachineRank(rank) {
  const ranks = ["N", "R", "SR", "SSR", "UR"];
  const normalized = typeof window.normalizeMachineRank === "function" ? window.normalizeMachineRank(rank) : String(rank || "N").toUpperCase();
  const index = ranks.indexOf(normalized);
  return index >= 0 && index < ranks.length - 1 ? ranks[index + 1] : null;
};

window.getMachineRankUpRequirement = function getMachineRankUpRequirement(machine) {
  const nextRank = window.getNextMachineRank(machine?.rank || machine?.rarity);
  if (!nextRank) return { nextRank: null, coreId: "", message: "最高ランクです。" };
  return { nextRank, coreId: `core_${nextRank.toLowerCase()}`, message: "" };
};

window.canRankUpMachine = function canRankUpMachine(machine, inventory) {
  const requirement = window.getMachineRankUpRequirement(machine);
  if (!requirement.nextRank || !requirement.coreId) return false;
  const cores = inventory?.cores || {};
  return (cores[requirement.coreId] || 0) > 0;
};

window.rankUpMachine = function rankUpMachine(machine) {
  const inventory = window.ensureInventoryState ? window.ensureInventoryState() : window.GameState.inventory;
  if (!window.canRankUpMachine(machine, inventory)) return false;
  const requirement = window.getMachineRankUpRequirement(machine);
  inventory.cores[requirement.coreId] = Math.max(0, (inventory.cores[requirement.coreId] || 0) - 1);
  machine.rank = requirement.nextRank;
  machine.rarity = requirement.nextRank;
  machine.optionSlots = typeof window.getOptionSlotCountByRank === "function" ? window.getOptionSlotCountByRank(machine.rank) : machine.optionSlots;
  machine.optionalSlots = machine.optionSlots;
  if (typeof window.normalizeMachineStatus === "function") window.normalizeMachineStatus(machine);
  return true;
};

window.canEnhanceMachine = function canEnhanceMachine(machine, materials) {
  if (!machine) return false;
  const cap = typeof window.getMachineLevelCap === "function" ? window.getMachineLevelCap(machine.rank) : 10;
  return (machine.level || 1) < cap && Object.values(materials || {}).some((count) => count > 0);
};

window.enhanceMachine = function enhanceMachine(machine, materials) {
  if (!window.canEnhanceMachine(machine, materials)) return false;
  const materialId = Object.keys(materials || {}).find((id) => (materials[id] || 0) > 0);
  if (!materialId) return false;
  materials[materialId] -= 1;
  machine.level = Math.min((typeof window.getMachineLevelCap === "function" ? window.getMachineLevelCap(machine.rank) : 10), (machine.level || 1) + 1);
  if (typeof window.normalizeMachineStatus === "function") window.normalizeMachineStatus(machine);
  return true;
};

window.enhanceMachineById = function enhanceMachineById(machineId) {
  const machine = getMech(machineId);
  if (!machine || !window.enhanceMachine(machine, window.GameState.materials)) {
    logMessage("synthesis", "強化条件を満たしていません。", "danger");
    renderCurrentScene();
    return;
  }
  logMessage("synthesis", `${machine.name}をLv ${machine.level}に強化しました。`, "good");
  renderCurrentScene();
};

window.rankUpMachineById = function rankUpMachineById(machineId) {
  const machine = getMech(machineId);
  if (!machine || !window.rankUpMachine(machine)) {
    logMessage("synthesis", "ランクアップ条件を満たしていません。", "danger");
    renderCurrentScene();
    return;
  }
  logMessage("synthesis", `${machine.name}がRANK ${machine.rank}になりました。見た目再生成は後続実装です。`, "good");
  renderCurrentScene();
};

window.canGenerateWeapon = function canGenerateWeapon() {
  return false;
};

window.generateWeapon = function generateWeapon() {
  logMessage("synthesis", "武器生成ロジックは未実装です。", "warn");
  renderCurrentScene();
  return false;
};

window.App.scenes.synthesis = window.renderSynthesis;
