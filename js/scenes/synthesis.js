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

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

window.renderSynthesis = function renderSynthesis() {
  const state = window.GameState;
  window.ensureMechGenerationState();
  state.synthesisTab = ["mech-generate", "mech-enhance", "mech-rank-up", "weapon-generate"].includes(state.synthesisTab) ? state.synthesisTab : "mech-generate";
  if (state.pendingGeneratedMech && !state.generationStatus.busy) {
    state.synthesisTab = "mech-generate";
    setSynthesisStep("result");
  }
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

function renderCoreStep() {
  const state = window.GameState;
  const selectedCore = window.getMechCore(state.selectedCoreId);
  return `
    <section class="synthesis-layout">
      ${renderSlotPanel(false)}
      <div class="panel panel-pad">
        <div class="section-head"><h2>コア選択</h2><span>${selectedCore ? `${selectedCore.outputLimit} output` : "未選択"}</span></div>
        <div class="compact-list core-list scroll-list">${coreRowsHtml()}</div>
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
  if (state.generationStatus.busy) return renderGenerationBusyStep();
  const selectedCore = window.getMechCore(state.selectedCoreId);
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
        <div class="section-head"><h2>素材選択</h2><span>クリックで投入</span></div>
        <div class="synth-materials compact-list">${synthesisMaterialRows()}</div>
      </div>
      <div class="panel panel-pad">
        <div class="section-head"><h2>生成予測</h2><span>${preview ? preview.output.state : "素材不足"}</span></div>
        ${preview ? previewHtml(preview) : `<div class="muted">素材を3-5個投入してください。</div>`}
        <div class="synth-actions" style="margin-top:10px">
          <button class="button" data-action="synthesis-prev-step">戻る</button>
          <button class="button" data-action="start-synthesis" ${canGenerate ? "" : "disabled"}>生成</button>
        </div>
        ${state.generationStatus.message ? `<p class="muted">${escapeHtml(state.generationStatus.message)}</p>` : ""}
      </div>
      ${renderLogPanel()}
    </section>
  `;
}

function renderGenerationBusyStep() {
  const message = window.GameState.generationStatus.message || "培養中...";
  return `
    <section class="synthesis-busy panel panel-pad">
      <div class="bio-vat-loader" aria-hidden="true">
        <div class="bio-vat-core"></div>
      </div>
      <div class="section-head"><h2>培養中...</h2><span>IMAGE API</span></div>
      <p>生体構造を構築しています。</p>
      <p class="muted">${escapeHtml(message)}</p>
    </section>
  `;
}

function renderResultStep() {
  const pending = window.GameState.pendingGeneratedMech;
  const ownedLimit = typeof window.getOwnedMechLimit === "function" ? window.getOwnedMechLimit() : 30;
  const full = (window.GameState.mechs || []).length >= ownedLimit;
  return `
    <section class="synthesis-layout synthesis-result-layout">
      <div class="panel panel-pad generated-result-panel">
        <div class="section-head"><h2>生成完了</h2><span>${pending ? "PENDING" : "EMPTY"}</span></div>
        ${pending ? generatedMechPreviewHtml(pending) : `<div class="muted">保存待ち機体はありません。</div>`}
      </div>
      ${pending ? renderPendingMechDecisionModal(pending, full) : `
        <div class="panel panel-pad">
          <div class="synth-actions">
            <button class="button" data-action="reset-synthesis">続けて生成</button>
          </div>
        </div>
      `}
      ${renderLogPanel()}
    </section>
  `;
}

function renderPendingMechDecisionModal(pending, full) {
  return `
    <div class="pending-mech-modal panel panel-pad" role="dialog" aria-modal="true" aria-labelledby="pending-mech-title">
      <div class="section-head"><h2 id="pending-mech-title">保存または破棄</h2><span>${pending.rarity || pending.rank || "-"}</span></div>
      <p class="muted">生成済み機体を処理するまで他画面へ移動できません。</p>
      ${full ? `<p class="muted">格納庫が満杯です。保存するには機体を削除して空きを作ってください。</p>` : ""}
      <label class="pending-name-field">
        <span>機体名</span>
        <input class="pending-mech-name-input" type="text" value="${escapeHtml(pending.name || "")}" placeholder="${escapeHtml(pending.name || "Machine")}">
      </label>
      <div class="synth-actions" style="margin-top:10px">
        <button class="button" data-action="confirm-pending-mech" ${full ? "disabled" : ""} type="button">格納庫へ保存</button>
        <button class="button danger" data-action="discard-pending-mech" type="button">破棄</button>
      </div>
    </div>
  `;
}

function generatedMechPreviewHtml(mech) {
  const imageHtml = typeof window.renderMechImage === "function"
    ? window.renderMechImage(mech, "detail")
    : mech.imagePath
      ? `<div class="mech-image mech-image-detail"><img src="${mech.imagePath}" alt="${escapeHtml(mech.name || "Machine")}"></div>`
      : `<div class="mech-image mech-image-detail"><span class="muted">画像保存済み</span></div>`;
  const stats = mech.stats || {};
  return `
    <div class="generated-mech-preview generated-mech-preview-large">
      ${imageHtml}
      <div class="compact-list">
        <div class="material-row"><span>${escapeHtml(mech.name || "Machine")}</span><strong>${mech.rank || mech.rarity || "-"}</strong></div>
        <div class="material-row"><span>SIZE / TYPE</span><strong>${mech.size || "-"} / ${mech.type || "-"}</strong></div>
        <div class="material-row"><span>HP / PP</span><strong>${formatNumber(stats.hp || mech.hp || 0)} / ${formatNumber(stats.pp || 0)}</strong></div>
        <div class="material-row"><span>ATK</span><strong>${formatNumber(Math.max(stats.sAtk || 0, stats.mAtk || 0, stats.lAtk || 0))}</strong></div>
      </div>
    </div>
  `;
}

function renderSlotPanel(allowRemove) {
  const selectedCore = window.getMechCore(window.GameState.selectedCoreId);
  return `
    <div class="panel panel-pad">
      <div class="section-head"><h2>素材スロット</h2><span>${selectedSynthesisMaterialCount()} / 5</span></div>
      <div class="synth-core-slot ${selectedCore ? "filled" : ""}">
        <span class="muted">コア</span>
        ${selectedCore ? `<strong>${selectedCore.name}</strong><span class="muted">${selectedCore.rarity} / output ${selectedCore.outputLimit}</span>` : `<strong>コア</strong><span class="muted">未選択</span>`}
      </div>
      <div class="slot-grid">${synthesisSlotsHtml()}</div>
      ${allowRemove && selectedSynthesisMaterialCount() ? `<p class="muted">投入済み素材はスロットをクリックすると外せます。</p>` : ""}
    </div>
  `;
}

function synthesisSlotsHtml() {
  return synthesisSlotDefs().map((slot, index) => {
    const material = window.getMechGenerationMaterial(window.GameState.synthesisSlots[index]);
    const slotType = material?.slotType || slot.key;
    return `<button class="synth-slot ${material ? "filled" : ""}" data-action="select-synth-slot" data-slot="${index}" type="button"><span class="muted">${slot.label}</span><br>${material ? `<strong>${material.name}</strong><br><span class="muted">${slotType} / ${material.rarity}</span>` : `<span class="muted">EMPTY<br>${String(index + 1).padStart(2, "0")}</span>`}</button>`;
  }).join("");
}

function synthesisMaterialRows() {
  const counts = materialCountsForSynthesis();
  const slots = normalizedSynthesisSlots();
  const entryIds = [
    ...new Set([
      ...Object.entries(counts).filter(([id, count]) => count > 0 && window.getMechGenerationMaterial(id)).map(([id]) => id),
      ...slots.filter(Boolean)
    ])
  ];
  if (!entryIds.length) return `<div class="muted">生成に使える素材がありません。</div>`;
  return entryIds.map((id) => {
    const count = counts[id] || 0;
    const material = window.getMechGenerationMaterial(id);
    const slotIndex = findFirstAvailableSynthesisSlot(material);
    const toggleSlotIndex = findSlotForToggleMaterial(material, slots);
    const displaySlotIndex = slotIndex >= 0 ? slotIndex : toggleSlotIndex;
    const slotLabel = displaySlotIndex >= 0 ? synthesisSlotDefs()[displaySlotIndex].label : "空き枠なし";
    const alreadySelected = slots.includes(id);
    return `
      <button class="material-row ${alreadySelected ? "active" : ""}" data-action="select-synth-material" data-material="${id}" ${slotIndex >= 0 || toggleSlotIndex >= 0 || alreadySelected ? "" : "disabled"} type="button">
        <div class="material-icon"></div>
        <span style="flex:1;text-align:left">${material.name}<br><span class="muted">${material.slotType || material.category} / ${slotLabel} / ${material.rarity}</span></span>
        <strong>x${count}</strong>
      </button>
    `;
  }).join("");
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

function normalizedSynthesisSlots() {
  const defs = synthesisSlotDefs();
  const slots = Array.isArray(window.GameState.synthesisSlots) ? window.GameState.synthesisSlots : [];
  window.GameState.synthesisSlots = Array.from({ length: defs.length }, (_, index) => slots[index] || null);
  return window.GameState.synthesisSlots;
}

function synthesisSlotCanAccept(material, slotIndex) {
  if (typeof window.canMaterialFitSynthesisSlot !== "function") return true;
  return window.canMaterialFitSynthesisSlot(material, slotIndex);
}

function findSlotForToggleMaterial(material, slots) {
  const defs = synthesisSlotDefs();
  const sameTypeIndex = slots.findIndex((id, index) => {
    const existing = window.getMechGenerationMaterial(id);
    return existing && existing.slotType === material.slotType && synthesisSlotCanAccept(material, index);
  });
  if (sameTypeIndex >= 0) return sameTypeIndex;

  const dedicatedIndex = defs.findIndex((slot, index) => {
    return slot.key !== "free" && !slots[index] && synthesisSlotCanAccept(material, index);
  });
  if (dedicatedIndex >= 0) return dedicatedIndex;

  return defs.findIndex((slot, index) => {
    return slot.key === "free" && !slots[index] && synthesisSlotCanAccept(material, index);
  });
}

window.selectSynthMaterial = function selectSynthMaterial(materialId) {
  const material = window.getMechGenerationMaterial(materialId);
  if (!material) return;
  const slots = normalizedSynthesisSlots();
  const existingIndex = slots.indexOf(materialId);
  if (existingIndex >= 0) {
    slots[existingIndex] = null;
    window.GameState.selectedMaterialId = null;
    logMessage("synthesis", `${material.name}をスロットから外しました。`, "warn");
    window.savePlayerData();
    window.renderCurrentScene();
    return;
  }

  const counts = materialCountsForSynthesis();
  const slotIndex = Number(counts[materialId] || 0) > 0 ? findSlotForToggleMaterial(material, slots) : -1;
  if (slotIndex < 0) {
    logMessage("synthesis", `${material.name}を投入できる空き枠がありません。`, "warn");
    window.savePlayerData();
    window.renderCurrentScene();
    return;
  }

  const replaced = window.getMechGenerationMaterial(slots[slotIndex]);
  slots[slotIndex] = materialId;
  window.GameState.selectedMaterialId = materialId;
  logMessage("synthesis", replaced ? `${replaced.name}を${material.name}に入れ替えました。` : `${material.name}を${synthesisSlotDefs()[slotIndex].label}に投入しました。`, "good");
  window.savePlayerData();
  window.renderCurrentScene();
};

window.removeSynthMaterialAtSlot = function removeSynthMaterialAtSlot(slotIndex) {
  const slots = normalizedSynthesisSlots();
  const index = Number(slotIndex);
  if (!Number.isInteger(index) || !slots[index]) return false;
  const material = window.getMechGenerationMaterial(slots[index]);
  slots[index] = null;
  if (window.GameState.selectedMaterialId === material?.id) window.GameState.selectedMaterialId = null;
  logMessage("synthesis", `${material?.name || "素材"}をスロットから外しました。`, "warn");
  window.savePlayerData();
  window.renderCurrentScene();
  return true;
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
  const selectedCoreMaterial = typeof window.getMaterial === "function" ? window.getMaterial(state.selectedCoreId) : null;
  const selectedCoreIsMaterial = selectedCoreMaterial && (selectedCoreMaterial.materialRole === "boss_core" || selectedCoreMaterial.materialRole === "core");
  const materialCounts = typeof allMaterialCounts === "function" ? allMaterialCounts() : {};
  if (selectedCoreIsMaterial && Number(materialCounts[state.selectedCoreId] || 0) <= 0) {
    logMessage("synthesis", "Core material is missing.", "danger");
    window.renderCurrentScene();
    return;
  }
  if (!slots.every(consumeMaterial)) {
    logMessage("synthesis", "素材消費に失敗しました。", "danger");
    window.renderCurrentScene();
    return;
  }
  if (selectedCoreIsMaterial && !consumeMaterial(state.selectedCoreId)) {
    logMessage("synthesis", "コア素材の消費に失敗しました。", "danger");
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
  if (window.GameState.pendingGeneratedMech) {
    window.GameState.synthesisTab = "mech-generate";
    window.GameState.synthesisStep = window.GameState.generationStatus?.busy ? "materials" : "result";
    window.renderCurrentScene();
    return;
  }
  window.GameState.synthesisTab = ["mech-generate", "mech-enhance", "mech-rank-up", "weapon-generate"].includes(tab) ? tab : "mech-generate";
  window.renderCurrentScene();
};

const baseConfirmPendingGeneratedMech = window.confirmPendingGeneratedMech;
if (typeof baseConfirmPendingGeneratedMech === "function") {
  window.confirmPendingGeneratedMech = function confirmPendingGeneratedMech() {
    const state = window.GameState;
    const input = document.querySelector(".pending-mech-name-input");
    if (state.pendingGeneratedMech && input) {
      const nextName = String(input.value || "").trim();
      if (nextName) state.pendingGeneratedMech.name = nextName;
    }
    const saved = baseConfirmPendingGeneratedMech();
    if (saved) {
      state.synthesisSlots = [];
      state.synthesisStep = "core";
      state.synthesisTab = "mech-generate";
      window.savePlayerData();
      window.renderCurrentScene();
    }
    return saved;
  };
}

const baseDiscardPendingGeneratedMech = window.discardPendingGeneratedMech;
if (typeof baseDiscardPendingGeneratedMech === "function") {
  window.discardPendingGeneratedMech = async function discardPendingGeneratedMech() {
    if (!window.confirm("生成済み機体を破棄しますか？")) return false;
    const discarded = await baseDiscardPendingGeneratedMech();
    if (discarded) {
      window.GameState.synthesisSlots = [];
      window.GameState.synthesisStep = "core";
      window.GameState.synthesisTab = "mech-generate";
      window.savePlayerData();
      window.renderCurrentScene();
    }
    return discarded;
  };
}

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
