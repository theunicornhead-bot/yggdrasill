"use strict";

function slotLabel(slot) {
  return { weapon: "武器", armor: "装甲", core: "コア", option: "補助" }[slot] || slot;
}

window.getPilotMechCompatibility = function getPilotMechCompatibility(pilot, mech) {
  if (!pilot || !mech) return { label: "未搭乗", bonusText: "パイロット未設定", matched: false };
  const talents = typeof window.getPilotTalents === "function" ? window.getPilotTalents(pilot) : [];
  const mechSize = String(mech.size || "").toUpperCase().replace("小型", "S").replace("中型", "M").replace("大型", "L");
  const mechTags = typeof window.normalizeMachineTags === "function" ? window.normalizeMachineTags(mech.tags) : (mech.tags || []);
  for (const talent of talents) {
    const master = typeof window.getTalentMaster === "function" ? window.getTalentMaster(talent.talentId) : null;
    const effectType = master?.effectType || master?.effect_type || "";
    const targetValue = master?.targetValue || "";
    if (effectType === "size_bonus" && targetValue && mechSize === String(targetValue).toUpperCase()) {
      return { label: master?.name || "サイズ適性", bonusText: `${targetValue}機体性能 +`, matched: true };
    }
    if (effectType === "tag_bonus" && targetValue && mechTags.includes(targetValue)) {
      return { label: master?.name || "機体適性", bonusText: `${targetValue}タグ性能 +`, matched: true };
    }
    if (effectType === "fuel_cost_down" || effectType === "fuel_cost_up") {
      return { label: master?.name || "燃費才能", bonusText: master?.description || "燃費に影響", matched: true };
    }
    if (effectType === "rare_drop_up") {
      return { label: master?.name || "探索才能", bonusText: "素材発見に期待", matched: true };
    }
  }
  return { label: "標準", bonusText: "特別な適性なし", matched: false };
};

const BASE_MECH_IMAGE_PATH = "generated/mechs/basemech_000.png";

function getSafeMechImageId(mech) {
  const id = mech?.imageId || mech?.id || mech?.baseId || "";
  return String(id).replace(/[^a-zA-Z0-9_-]/g, "");
}

window.getMechImagePath = function getMechImagePath(mech) {
  const explicitPath = String(mech?.imagePath || "").trim();
  if (explicitPath) return explicitPath;
  const imageId = getSafeMechImageId(mech);
  if (imageId) return `generated/mechs/${imageId}.png`;
  return BASE_MECH_IMAGE_PATH;
};

window.renderMechImage = function renderMechImage(mech, variant = "card") {
  const variantAliases = { party: "card", list: "card", quest: "icon" };
  const normalizedVariant = variantAliases[variant] || variant;
  const safeVariant = ["card", "detail", "icon"].includes(normalizedVariant) ? normalizedVariant : "card";
  const crop = mech?.imageCrop?.[safeVariant] || mech?.imageCrop?.[variant] || {};
  const style = [
    crop.x ? `--mech-position-x:${crop.x}` : "",
    crop.y ? `--mech-position-y:${crop.y}` : "",
    crop.scale !== undefined ? `--mech-scale:${crop.scale}` : ""
  ].filter(Boolean).join(";");
  const styleAttr = style ? ` style="${style}"` : "";
  const imagePath = window.getMechImagePath(mech);
  const altText = mech?.name || "Machine";
  const imageIdAttr = mech?.imageId ? ` data-mech-image-id="${mech.imageId}"` : "";

  return `<div class="mech-image mech-image-${safeVariant}"${styleAttr}><img src="${imagePath}"${imageIdAttr} alt="${altText}" onerror="this.onerror=null;this.src='${BASE_MECH_IMAGE_PATH}'"></div>`;
};

window.renderHangar = function renderHangar() {
  const state = window.GameState;
  if (state.hangarTab === "medical") {
    state.hangarTab = "pilots";
    state.pilotHangarTab = "medical";
  }
  if (!["party", "mechs", "pilots"].includes(state.hangarTab)) state.hangarTab = "party";
  if (!["list", "mech-detail", "mech-assign", "pilot-assign", "pilot-detail"].includes(state.hangarView)) state.hangarView = "list";
  if (!["list", "medical"].includes(state.pilotHangarTab)) state.pilotHangarTab = "list";
  if (state.hangarTab !== "mechs" && state.hangarView === "mech-detail") state.hangarView = "list";
  if (state.hangarTab !== "party" && state.hangarView === "mech-assign") state.hangarView = "list";
  if (state.hangarTab !== "party" && state.hangarView === "pilot-assign") state.hangarView = "list";
  if (state.hangarTab !== "pilots" && state.hangarView === "pilot-detail") state.hangarView = "list";
  if (state.hangarTab !== "pilots") state.pilotHangarTab = "list";
  if ((state.hangarView === "mech-assign" || state.hangarView === "pilot-assign") && !isValidPartySlot(state.assigningPartySlot)) {
    state.hangarView = "list";
    state.assigningPartySlot = null;
  }

  if (typeof window.ensureMechRosterState === "function") window.ensureMechRosterState();
  const ownedLimit = typeof window.getOwnedMechLimit === "function" ? window.getOwnedMechLimit() : 30;
  const selected = getMech(state.selectedMechId) || state.mechs[0];
  const assigningSlot = Number(state.assigningPartySlot);
  const assigningMech = getPartyMech(assigningSlot);
  const partyMechs = getPartyMechs();
  const sortieCount = partyMechs.filter((mech) => mech && getPilot(mech.pilotId)).length;
  window.App.root.innerHTML = `
    ${renderHeader("ハンガー", "HANGER")}
    <section class="hangar-tabs" role="tablist" aria-label="ハンガータブ">
      ${renderHangarTabButton("party", "パーティ編成")}
      ${renderHangarTabButton("mechs", "所持機体")}
      ${renderHangarTabButton("pilots", "パイロット")}
    </section>
    ${state.hangarTab === "party" ? `
      ${renderPartySetSelector("hangar")}
      ${state.hangarView === "mech-assign" ? renderMechAssignView(assigningSlot) : ""}
      ${state.hangarView === "pilot-assign" ? renderPilotAssignView(assigningMech, assigningSlot) : ""}
      ${state.hangarView === "list" ? `
        <section class="panel panel-pad">
          <div class="section-head"><h2>${getActivePartySet().name}</h2><span>出撃機体 ${sortieCount} / 4</span></div>
          <div class="hangar-party-grid">${Array.from({ length: 4 }, (_, index) => renderPartySlot(partyMechs[index], index)).join("")}</div>
        </section>
      ` : ""}
    ` : ""}
    ${state.hangarTab === "mechs" ? `
      ${state.hangarView === "mech-detail" && selected ? renderMechDetailV2(selected) : `
        <section class="panel panel-pad">
          <div class="section-head"><h2>所持機体一覧</h2><span>${state.mechs.length} / ${ownedLimit}</span></div>
          ${state.pendingGeneratedMech ? renderPendingGeneratedMechNotice() : ""}
          <div class="mech-list hangar-storage-list">${state.mechs.map((mech, index) => renderMechCard(mech, index)).join("")}</div>
        </section>
      `}
    ` : ""}
    ${state.hangarTab === "pilots" ? `
      ${state.hangarView === "pilot-detail" && getPilot(state.selectedPilotId) ? renderPilotDetailView(getPilot(state.selectedPilotId)) : renderPilotHangarView()}
    ` : ""}
  `;
};

function isValidPartySlot(slot) {
  const index = Number(slot);
  return Number.isInteger(index) && index >= 0 && index < 4;
}

function getPartyMechs() {
  if (typeof window.ensureMechRosterState === "function") window.ensureMechRosterState();
  const mechs = window.GameState.mechs || [];
  return getActivePartyIds().map((id) => mechs.find((mech) => mech.id === id) || null);
}

function getPartyMech(slot) {
  if (!isValidPartySlot(slot)) return null;
  const mechId = getActivePartyIds()[Number(slot)];
  return mechId ? getMech(mechId) : null;
}

function isMechInParty(mechId) {
  if (typeof window.ensureMechRosterState === "function") window.ensureMechRosterState();
  return getActivePartyIds().includes(mechId);
}

function partyMechCount() {
  if (typeof window.ensureMechRosterState === "function") window.ensureMechRosterState();
  return getActivePartyIds().filter(Boolean).length;
}

function getActivePartySet() {
  if (typeof window.ensureMechRosterState === "function") window.ensureMechRosterState();
  const state = window.GameState;
  return state.partySets?.[state.activePartyIndex || 0] || { name: "パーティ1", mechIds: state.partyMechIds || [] };
}

function getActivePartyIds() {
  return getActivePartySet().mechIds || [];
}

function setActivePartyIds(ids) {
  if (typeof window.ensureMechRosterState === "function") window.ensureMechRosterState();
  const state = window.GameState;
  const index = state.activePartyIndex || 0;
  if (!state.partySets?.[index]) return;
  state.partySets[index].mechIds = ids;
  state.partyMechIds = [...ids];
}

function renderPartySetSelector(context = "hangar") {
  if (typeof window.ensureMechRosterState === "function") window.ensureMechRosterState();
  const state = window.GameState;
  return `
    <section class="hangar-tabs party-set-tabs" role="tablist" aria-label="パーティ選択">
      ${(state.partySets || []).map((party, index) => {
        const active = context === "quest" ? Number(state.selectedQuestPartyIndex || 0) === index : Number(state.activePartyIndex || 0) === index;
        const action = context === "quest" ? "select-quest-party-set" : "select-party-set";
        return `<button class="button hangar-tab-button ${active ? "active" : ""}" data-action="${action}" data-party-index="${index}" type="button" role="tab" aria-selected="${active}">${party.name || `パーティ${index + 1}`}</button>`;
      }).join("")}
    </section>
  `;
}

window.renderPartySetSelector = renderPartySetSelector;

function renderPendingGeneratedMechNotice() {
  const pending = window.GameState.pendingGeneratedMech;
  if (!pending) return "";
  const ownedLimit = typeof window.getOwnedMechLimit === "function" ? window.getOwnedMechLimit() : 30;
  const full = (window.GameState.mechs || []).length >= ownedLimit;
  return `
    <div class="panel panel-pad pending-mech-panel">
      <div class="section-head"><h3>保存待ち機体</h3><span>${pending.name || "Machine"}</span></div>
      <div class="muted">${full ? "格納庫が満杯です。削除して空きを作ってください。" : "生成完了後の一時保存機体です。"}</div>
      <div class="synth-actions" style="margin-top:8px">
        <button class="button" data-action="confirm-pending-mech" ${full ? "disabled" : ""} type="button">格納庫へ保存</button>
        <button class="button danger" data-action="discard-pending-mech" type="button">破棄</button>
      </div>
    </div>
  `;
}

function renderHangarTabButton(tab, label) {
  const active = window.GameState.hangarTab === tab;
  return `<button class="button hangar-tab-button ${active ? "active" : ""}" data-action="change-hangar-tab" data-tab="${tab}" type="button" role="tab" aria-selected="${active}">${label}</button>`;
}

function renderPilotHangarView() {
  const state = window.GameState;
  return `
    <section class="hangar-tabs pilot-hangar-tabs" role="tablist" aria-label="パイロットタブ">
      ${renderPilotHangarTabButton("list", "一覧")}
      ${renderPilotHangarTabButton("medical", "医務室")}
    </section>
    ${state.pilotHangarTab === "medical" ? renderMedicalRoomView() : `
      <section class="panel panel-pad">
        <div class="section-head"><h2>パイロット</h2><span>雇用中 ${state.pilots.length} / 4</span></div>
        <div class="storage-grid">${state.pilots.map(renderStoredPilot).join("")}</div>
      </section>
    `}
  `;
}

function renderPilotHangarTabButton(tab, label) {
  const active = window.GameState.pilotHangarTab === tab;
  return `<button class="button hangar-tab-button ${active ? "active" : ""}" data-action="change-pilot-hangar-tab" data-tab="${tab}" type="button" role="tab" aria-selected="${active}">${label}</button>`;
}

function renderMechCard(mech, index) {
  const pilot = displayPilot(mech.pilotId);
  const realPilot = getPilot(mech.pilotId);
  const salePrice = getMechSalePrice(mech);
  if (typeof window.normalizeMachineStatus === "function") window.normalizeMachineStatus(mech);
  const unitStats = typeof window.calculateUnitStats === "function" ? window.calculateUnitStats(realPilot || null, mech) : (mech.stats || {});
  const mainWeapon = typeof window.getMainWeapon === "function" ? window.getMainWeapon(mech) : mech.mainWeapon;
  const attackPower = typeof window.calculateWeaponAttackPower === "function" ? window.calculateWeaponAttackPower(realPilot || null, mech, mainWeapon) : Math.max(unitStats.sAtk || 0, unitStats.mAtk || 0, unitStats.lAtk || 0);
  const inParty = isMechInParty(mech.id);
  const partyFull = partyMechCount() >= (typeof window.getPartyMechLimit === "function" ? window.getPartyMechLimit() : 4);
  return `
    <article class="mech-card panel ${window.GameState.selectedMechId === mech.id ? "selected" : ""}">
      <div class="section-head"><h3>${String(index + 1).padStart(2, "0")} ${mech.name}</h3><span class="tag">${inParty ? "編成中" : mech.size}</span></div>
      <div class="pilot-overlay-anchor pilot-overlay-anchor--hangar-list">
        ${window.renderMechImage(mech, "card")}
        ${realPilot ? window.renderPilotPortraitImage(realPilot, "pilot-portrait--hangar") : ""}
      </div>
      <div class="tag-row">
        ${renderMachineTags(mech)}
        <span class="tag">RANK ${mech.rank || mech.rarity || "-"}</span>
      </div>
      <div>HP ${formatNumber(mech.hp)} / ${formatNumber(mech.maxHp)}</div>
      <div class="bar" style="--value:${Math.max(0, (mech.hp / Math.max(1, mech.maxHp)) * 100)}%"><span></span></div>
      <div class="stat-row"><span>MAIN</span><strong>${mainWeapon?.name || "なし"}</strong></div>
      <div class="stat-row"><span>POWER</span><strong>${formatNumber(attackPower)}</strong></div>
      <div class="stat-row"><span>SPEED</span><strong>${formatNumber(unitStats.speed || 0)}</strong></div>
      <div class="material-row"><span>搭乗者</span><strong>${pilot.name}</strong></div>
      <div class="hangar-storage-actions">
        <button class="button" data-action="open-mech-detail" data-mech="${mech.id}" type="button">詳細</button>
        ${inParty
          ? `<button class="button" data-action="remove-mech-from-party" data-mech="${mech.id}" type="button">編成から外す</button>`
          : `<button class="button" data-action="add-mech-to-party" data-mech="${mech.id}" ${partyFull ? "disabled" : ""} type="button">編成に入れる</button>`}
        <button class="button danger" data-action="delete-mech" data-mech="${mech.id}" ${canDeleteMech(mech.id) ? "" : "disabled"} type="button">削除</button>
      </div>
    </article>
  `;
}

function renderMechDetailV2(mech) {
  const pilot = displayPilot(mech.pilotId);
  const realPilot = getPilot(mech.pilotId);
  if (typeof window.normalizeMachineStatus === "function") window.normalizeMachineStatus(mech);
  const unitStats = typeof window.calculateUnitStats === "function" ? window.calculateUnitStats(realPilot || null, mech) : {};
  const mainWeapon = typeof window.getMainWeapon === "function" ? window.getMainWeapon(mech) : (mech.mainWeapon || null);
  const pilotName = realPilot ? pilot.name : "パイロット未搭乗";
  const pilotRank = realPilot ? `RANK ${pilot.rank || "-"}` : "なし";
  return `
    <div class="panel panel-pad">
      <div class="section-head">
        <h2>機体詳細</h2>
        <button class="button" data-action="close-mech-detail" type="button">戻る</button>
      </div>
      <div class="muted">${mech.unique ? "固有機体" : "通常機体"} / ${mech.customizable ? "カスタム可" : "カスタム不可"}</div>
      <div class="mech-detail-name-row">
        <h3>${mech.name || "Machine"}</h3>
        <button class="button" data-action="rename-mech" data-mech="${mech.id}" type="button">名称変更</button>
      </div>
      <div class="pilot-overlay-anchor pilot-overlay-anchor--hangar-detail">
        ${window.renderMechImage(mech, "detail")}
        ${realPilot ? window.renderPilotPortraitImage(realPilot, "pilot-portrait--hangar") : ""}
      </div>
      <div class="tag-row">
        <span class="tag">SIZE ${mech.size || "-"}</span>
        <span class="tag">RANK ${mech.rank || mech.rarity || "-"}</span>
      </div>
      <div class="section-head" style="margin-top:10px"><h3>搭乗パイロット</h3></div>
      <div class="material-row"><span>${pilotName}</span><strong>${pilotRank}</strong></div>
      ${renderMachineCompatibilityRows(realPilot, mech)}
      <div class="section-head" style="margin-top:10px"><h3>UNIT STATUS</h3></div>
      <div class="compact-list">${renderUnitStatRows(unitStats)}</div>
      <div class="section-head" style="margin-top:10px"><h3>MAIN WEAPON</h3></div>
      <div class="compact-list">${renderMainWeaponRows(mainWeapon)}</div>
      ${renderEquipmentSlots(mech)}
      <div class="section-head" style="margin-top:10px"><h3>BATTLE PROGRAM</h3></div>
      <div class="compact-list">${renderBattleProgramPreview(mech, realPilot)}</div>
      <div class="section-head" style="margin-top:10px"><h3>OPTIONS</h3></div>
      <div class="compact-list">${renderMachineOptions(mech)}</div>
      <div class="section-head" style="margin-top:10px"><h3>TAGS</h3></div>
      <div class="tag-row">${renderMachineTags(mech)}</div>
      <div class="section-head" style="margin-top:10px"><h3>削除</h3></div>
      <button class="button danger" data-action="delete-mech" data-mech="${mech.id}" ${canDeleteMech(mech.id) ? "" : "disabled"} style="width:100%;margin-top:8px">この機体を削除</button>
      <p class="muted">${mech.description || ""}</p>
    </div>
    ${renderEquipmentModal(mech)}
  `;
}

function renderBattleProgramPreview(mech, pilot) {
  const classId = window.normalizePilotClassId ? window.normalizePilotClassId(pilot?.classId) : pilot?.classId;
  const customProgram = Array.isArray(mech?.battleProgram) && mech.battleProgram.length ? mech.battleProgram : null;
  const rows = customProgram || (Array.isArray(window.masterData?.classBattleProgramMaster)
    ? window.masterData.classBattleProgramMaster.filter((row) => row.classId === classId || row.classId === pilot?.classId)
    : []);
  const sorted = rows
    .map((row) => ({ ...row, slot: Number(row.slot || 0) }))
    .sort((a, b) => Number(a.slot || 0) - Number(b.slot || 0))
    .slice(0, 4);
  if (!sorted.length) return `<div class="material-row"><span>Default</span><strong>通常攻撃</strong></div>`;
  return sorted.map((row) => {
    const condition = window.getMasterById?.("battleConditionMaster", "conditionId", row.conditionId);
    const action = window.getMasterById?.("battleActionMaster", "actionId", row.actionId);
    return `<div class="material-row"><span>${row.slot || "-"}: ${condition?.name || row.conditionId}</span><strong>${action?.name || row.actionId}</strong></div>`;
  }).join("");
}

function renderMachineCompatibilityRows(pilot, mech) {
  if (!pilot || !mech) return "";
  const tagMultiplier = typeof window.getMachineTagCompatibilityMultiplier === "function" ? window.getMachineTagCompatibilityMultiplier(pilot, mech) : 1;
  const rankMultiplier = typeof window.getRankCompatibilityMultiplier === "function" ? window.getRankCompatibilityMultiplier(pilot, mech) : 1;
  const compatibility = window.getPilotMechCompatibility(pilot, mech);
  const rows = [];
  if (compatibility.matched) rows.push(`<div class="material-row"><span>才能</span><strong>${compatibility.label}</strong></div>`);
  if (tagMultiplier !== 1) rows.push(`<div class="material-row"><span>タグ相性</span><strong>x${tagMultiplier.toFixed(1)}</strong></div>`);
  if (rankMultiplier !== 1) rows.push(`<div class="material-row"><span>ランク差補正</span><strong>x${rankMultiplier.toFixed(2)}</strong></div>`);
  return rows.length ? `<div class="compact-list" style="margin-top:6px">${rows.join("")}</div>` : "";
}

function getMechSalePrice(mech) {
  const rarityRates = { N: 1, R: 1.4, SR: 2, SSR: 3, UR: 4, E: 0.7, D: 1, C: 1.2, B: 1.6, A: 2.2, S: 3 };
  const rank = mech.rarity || mech.rank || "D";
  const statValue = Number(mech.maxHp || mech.hp || 0) * 0.5 + Number(mech.atk || 0) * 8 + Number(mech.def || 0) * 7 + Number(mech.mobility || 0) * 5;
  const generatedBonus = mech.coreId ? 500 : 0;
  return Math.max(100, Math.round((statValue + generatedBonus) * (rarityRates[rank] || 1)));
}

function canSellMech(mechId) {
  const state = window.GameState;
  return Boolean(getMech(mechId)) && state.mechs.length > 1;
}

function canDeleteMech(mechId) {
  const state = window.GameState;
  return Boolean(getMech(mechId)) && state.mechs.length > 1;
}

window.sellMech = function sellMech(mechId) {
  const state = window.GameState;
  const mech = getMech(mechId);
  if (!mech) return;
  if (!canSellMech(mechId)) {
    logMessage("bar", "最後の1機は売却できません。", "danger");
    renderCurrentScene();
    return;
  }
  const salePrice = getMechSalePrice(mech);
  const confirmed = window.confirm ? window.confirm(`${mech.name}を${formatNumber(salePrice)}Gで売却しますか？`) : true;
  if (!confirmed) return;

  state.mechs = state.mechs.filter((item) => item.id !== mechId);
  state.partySets = (state.partySets || []).map((party) => ({ ...party, mechIds: (party.mechIds || []).map((id) => id === mechId ? null : id) }));
  state.partyMechIds = (state.partyMechIds || []).map((id) => id === mechId ? null : id);
  if (mech.imageId && typeof window.deleteMechImageBlob === "function") {
    window.deleteMechImageBlob(mech.imageId).catch(() => false);
  }
  state.money += salePrice;
  if (state.selectedMechId === mechId) {
    state.selectedMechId = state.mechs[0]?.id || null;
  }
  logMessage("bar", `${mech.name}を${formatNumber(salePrice)}Gで売却しました。`, "good");
  window.savePlayerData();
  renderCurrentScene();
};

window.deleteMech = async function deleteMech(mechId) {
  const state = window.GameState;
  const mech = getMech(mechId);
  if (!mech || !canDeleteMech(mechId)) {
    logMessage("bar", "最後の1機は削除できません。", "danger");
    window.savePlayerData();
    renderCurrentScene();
    return;
  }
  const confirmed = window.confirm ? window.confirm(`${mech.name || "Machine"}を削除しますか？`) : true;
  if (!confirmed) return;
  state.mechs = state.mechs.filter((item) => item.id !== mechId);
  state.partySets = (state.partySets || []).map((party) => ({ ...party, mechIds: (party.mechIds || []).map((id) => id === mechId ? null : id) }));
  state.partyMechIds = (state.partyMechIds || []).map((id) => id === mechId ? null : id);
  if (state.selectedMechId === mechId) state.selectedMechId = state.mechs[0]?.id || null;
  if (mech.imageId && typeof window.deleteMechImageBlob === "function") {
    await window.deleteMechImageBlob(mech.imageId).catch(() => false);
  }
  if (typeof window.ensureMechRosterState === "function") window.ensureMechRosterState();
  logMessage("bar", `${mech.name || "Machine"}を削除しました。`, "warn");
  window.savePlayerData();
  renderCurrentScene();
};

window.renameMech = function renameMech(mechId) {
  const mech = getMech(mechId);
  if (!mech) return;
  const currentName = String(mech.name || "Machine");
  const nextName = window.prompt ? window.prompt("機体の表示名を入力してください。", currentName) : currentName;
  if (nextName === null) return;
  const trimmedName = String(nextName).trim();
  if (!trimmedName) {
    logMessage("bar", "機体名は空にできません。", "danger");
    renderCurrentScene();
    return;
  }
  mech.name = trimmedName.slice(0, 24);
  window.GameState.selectedMechId = mech.id;
  logMessage("bar", `${currentName}の表示名を${mech.name}に変更しました。`, "good");
  window.savePlayerData();
  renderCurrentScene();
};

function renderMechThumb(mech) {
  return window.renderMechImage(mech, "card");
}

function renderPartSlots(mech) {
  const slots = mech.slotCounts || { weapon: 0, armor: 0, core: 0, option: 0 };
  return Object.entries(slots).map(([slot, count]) => {
    const value = mech.customizable ? `${count}枠 / ${mech.parts?.[slot] || "未装備"}` : "使用不可";
    return `<div class="material-row"><span>${slotLabel(slot)}</span><strong>${value}</strong></div>`;
  }).join("");
}

function renderStoredPilot(pilot) {
  if (typeof window.normalizePilotStatus === "function") window.normalizePilotStatus(pilot);
  const className = window.getPilotClassDisplayName(pilot.classId);
  const conditionLabel = typeof window.getPilotConditionLabel === "function" ? window.getPilotConditionLabel(pilot) : pilot.survival?.condition || "健康";
  return `
    <button class="storage-card pilot-storage-card panel" data-action="open-pilot-detail" data-pilot="${pilot.id}" type="button">
      <div class="pilot-face-frame">${window.renderPilotPortraitImage(pilot, "pilot-portrait--face")}</div>
      <strong>${pilot.name}</strong><br>
      <span class="muted">RANK ${pilot.rank}</span><br>
      <span class="muted pilot-class-name">${className}</span><br>
      <span class="tag">${conditionLabel}</span>
    </button>
  `;
}

function renderMedicalRoomView() {
  const pilots = (window.GameState.pilots || []).filter((pilot) => {
    if (typeof window.normalizePilotStatus === "function") window.normalizePilotStatus(pilot);
    return typeof window.isPilotConditionActive === "function" ? window.isPilotConditionActive(pilot) : pilot.survival?.condition !== "healthy";
  });
  const ship = typeof window.ensureShipState === "function" ? window.ensureShipState() : window.GameState.ship || {};
  const medicalUnlocked = typeof window.isLifelineTreeUnlocked === "function" ? window.isLifelineTreeUnlocked("medical", ship) : false;
  return `
    <section class="panel panel-pad">
      <div class="section-head"><h2>医務室</h2><span>${pilots.length}名隔離中</span></div>
      <div class="muted" style="margin-bottom:8px">怪我・感染症は医務室にいる時だけ治療が進みます。感染症の治療には医療ツリー解放が必要です。</div>
      ${medicalUnlocked ? "" : `<div class="material-row danger"><span>医療ツリー</span><strong>未解放</strong></div>`}
      <div class="compact-list">${pilots.length ? pilots.map(renderMedicalRoomPilotRow).join("") : `<div class="muted">治療対象のパイロットはいません。</div>`}</div>
    </section>
  `;
}

function renderMedicalRoomPilotRow(pilot) {
  const conditionLabel = typeof window.getPilotConditionLabel === "function" ? window.getPilotConditionLabel(pilot) : pilot.survival?.condition || "-";
  const severity = pilot.survival?.severity || "none";
  const recoveryDays = Math.max(0, Number(pilot.survival?.recoveryDays || 0));
  const inMedicalRoom = Boolean(pilot.survival?.inMedicalRoom);
  const canRecover = typeof window.canRecoverPilotCondition === "function" && window.canRecoverPilotCondition(pilot);
  const assignedMech = (window.GameState.mechs || []).find((mech) => mech.pilotId === pilot.id);
  const statusText = inMedicalRoom ? (canRecover ? "治療中" : "治療停止") : "強行出撃中";
  return `
    <article class="material-row medical-room-row">
      <span style="flex:1">${pilot.name || "Pilot"}<br><span class="muted">${conditionLabel} / ${conditionSeverityLabelLocal(severity)} / 残り${formatNumber(recoveryDays)}日 / ${assignedMech?.name || "未搭乗"}</span></span>
      <strong>${statusText}</strong>
      ${inMedicalRoom
        ? `<button class="button danger" data-action="force-sortie-pilot" data-pilot="${pilot.id}" type="button">強行出撃</button>`
        : `<button class="button" data-action="return-pilot-medical" data-pilot="${pilot.id}" type="button">医務室へ戻す</button>`}
    </article>
  `;
}

function conditionSeverityLabelLocal(severity) {
  return { minor: "軽症", moderate: "中等症", severe: "重症", none: "-" }[severity] || severity || "-";
}

function renderPilotDetailView(pilot) {
  if (typeof window.normalizePilotStatus === "function") window.normalizePilotStatus(pilot);
  const mode = window.GameState.pilotDetailMode === "skill-tree" ? "skill-tree" : "detail";
  const className = window.getPilotClassDisplayName(pilot.classId);
  const classRole = window.getPilotClassRole(pilot.classId);
  const pilotSkills = typeof window.getLearnedPilotSkills === "function" ? window.getLearnedPilotSkills(pilot) : [];
  const skillTags = pilotSkills.map((skill) => skill.name);
  const skills = skillTags;
  const nextClassSkill = typeof window.getNextClassSkill === "function" ? window.getNextClassSkill(pilot) : null;
  const assignedMech = window.GameState.mechs.find((mech) => mech.pilotId === pilot.id);
  const stats = pilot.stats || {};
  const levelCap = typeof window.getPilotLevelCap === "function" ? window.getPilotLevelCap(pilot.rank) : 50;
  const classId = typeof window.normalizePilotClassId === "function" ? window.normalizePilotClassId(pilot.classId) : pilot.classId;
  const classSkillTotal = Array.isArray(window.ClassSkillMaster) ? window.ClassSkillMaster.filter((skill) => skill.classId === classId).length : 0;
  const learnedClassSkillCount = typeof window.getLearnedClassSkills === "function" ? window.getLearnedClassSkills(pilot).length : 0;
  const rankMultiplier = assignedMech && typeof window.getRankCompatibilityMultiplier === "function" ? window.getRankCompatibilityMultiplier(pilot, assignedMech) : 1;
  return `
    <section class="panel panel-pad pilot-detail-panel">
      <div class="section-head">
        <h2>${pilot.name}</h2>
        <button class="button" data-action="close-pilot-detail" type="button">戻る</button>
      </div>
      <div class="sub-tabs" style="margin-bottom:10px">
        <button class="button ${mode === "detail" ? "active" : ""}" data-action="pilot-detail-mode" data-mode="detail" type="button">詳細</button>
        <button class="button ${mode === "skill-tree" ? "active" : ""}" data-action="pilot-detail-mode" data-mode="skill-tree" type="button">スキルツリー</button>
      </div>
      ${mode === "skill-tree" ? renderPilotSkillTreeView(pilot) : `
      <div class="pilot-detail-layout">
        <div class="pilot-detail-portrait">
          ${window.renderPilotPortraitImage(pilot, "pilot-portrait--detail")}
        </div>
        <div class="compact-list">
          <div class="material-row"><span>P-RANK</span><strong>${pilot.rank}</strong></div>
          <div class="material-row"><span>CLASS</span><strong>${className}</strong></div>
          <div class="material-row"><span>ROLE</span><strong>${classRole || "-"}</strong></div>
          <div class="material-row"><span>P-LV</span><strong>${pilot.level || 1} / ${levelCap}</strong></div>
          <div class="material-row"><span>EXP</span><strong>${formatNumber(pilot.exp || 0)} / ${formatNumber(pilot.nextExp || 0)}</strong></div>
          <div class="material-row"><span>SP</span><strong>${formatNumber(pilot.skillPoints || 0)}</strong></div>
          <div class="material-row"><span>GROWTH</span><strong>${typeof window.getGrowthTypeLabel === "function" ? window.getGrowthTypeLabel(pilot.growthType) : pilot.growthType || "-"}</strong></div>
          <div class="material-row"><span>MECH</span><strong>${assignedMech?.name || "未搭乗"}</strong></div>
          <div class="material-row"><span>RANK PENALTY</span><strong>${assignedMech ? `x${rankMultiplier.toFixed(2)}` : "なし"}</strong></div>
        </div>
      </div>
      <div class="section-head" style="margin-top:10px"><h3>status</h3></div>
      <div class="compact-list">${renderUnitStatRows(stats)}</div>
      <div class="section-head" style="margin-top:10px"><h3>スキル / 才能</h3></div>
      <div class="tag-row">${skills.length ? skills.map((skill) => `<span class="tag">${skill}</span>`).join("") : `<span class="tag">初期スキルなし</span>`}</div>
      <div class="material-row"><span>SKILL TREE</span><strong>${formatNumber(learnedClassSkillCount)} / ${formatNumber(classSkillTotal)}</strong></div>
      <div class="section-head" style="margin-top:10px"><h3>next skill</h3></div>
      <div class="material-row"><span>${nextClassSkill ? nextClassSkill.name : "None"}</span><strong>${nextClassSkill ? `LV ${nextClassSkill.learnLevel}` : "-"}</strong></div>
      `}
    </section>
  `;
}

function renderPilotSkillTreeView(pilot) {
  const skills = typeof window.getPilotSkillTree === "function" ? window.getPilotSkillTree(pilot.classId) : [];
  const className = window.getPilotClassDisplayName(pilot.classId);
  return `
    <div class="material-row"><span>${className || "-"}</span><strong>SP ${formatNumber(pilot.skillPoints || 0)}</strong></div>
    <div class="compact-list" style="margin-top:8px">${skills.length ? skills.map((skill) => renderPilotSkillTreeCard(pilot, skill)).join("") : `<div class="muted">スキル定義がありません。</div>`}</div>
  `;
}

function renderPilotSkillTreeCard(pilot, skill) {
  const skillId = skill.skillId || skill.id || "";
  const state = typeof window.getPilotSkillLearnState === "function" ? window.getPilotSkillLearnState(pilot, skill) : { state: "locked", label: "条件不足", reasons: [] };
  const prerequisiteText = skill.prerequisiteSkillIds?.length ? skill.prerequisiteSkillIds.join(", ") : "なし";
  const description = skill.description || skill.type || "";
  const requiredLevel = Number(skill.requiredLevel ?? skill.learnLevel ?? 1);
  const spCost = Number(skill.spCost ?? skill.cost ?? 1);
  return `
    <article class="panel panel-pad skill-tree-card">
      <div class="section-head"><h3>${skill.name || skillId || "Skill"}</h3><span class="tag">${state.label}</span></div>
      <p class="muted">${description}</p>
      <div class="compact-list">
        <div class="material-row"><span>必要Lv</span><strong>${requiredLevel}</strong></div>
        <div class="material-row"><span>必要SP</span><strong>${spCost}</strong></div>
        <div class="material-row"><span>前提スキル</span><strong>${prerequisiteText}</strong></div>
        <div class="material-row"><span>状態</span><strong>${state.reasons?.length ? state.reasons.join(" / ") : state.label}</strong></div>
      </div>
      <button class="button tavern-wide-action" data-action="learn-pilot-skill" data-pilot="${pilot.id}" data-skill="${skillId}" ${state.state === "available" ? "" : "disabled"} type="button">習得</button>
    </article>
  `;
}

function renderPartySlot(mech, index) {
  const hasMech = Boolean(mech);
  const pilot = hasMech ? displayPilot(mech.pilotId) : { name: "未搭乗" };
  const realPilot = hasMech ? getPilot(mech.pilotId) : null;
  const pilotRank = realPilot?.rank || "-";
  const pilotLevel = realPilot?.level || "-";
  return `
    <article class="party-slot panel hangar-party-card">
      <div class="hangar-card-head">
        <span>${String(index + 1).padStart(2, "0")}</span>
        <strong>${hasMech ? mech.name || "Machine" : "空き枠"}</strong>
      </div>
      ${hasMech ? `
        <button class="hangar-party-mech pilot-overlay-anchor mech-image-button" data-action="open-mech-detail" data-mech="${mech.id}" type="button" aria-label="${mech.name || "Machine"} 詳細">
          ${window.renderMechImage(mech, "card")}
          ${realPilot ? window.renderPilotPortraitImage(realPilot, "pilot-portrait--hangar") : ""}
        </button>
      ` : `
        <div class="hangar-party-mech hangar-empty-slot"><span>NO MECH</span></div>
      `}
      <div class="hangar-party-pilot">
        <strong>${pilot.name}</strong>
      </div>
      <div class="hangar-party-rank">
        <span>RANK ${pilotRank}</span>
        <span>LV ${pilotLevel}</span>
      </div>
      <div class="hangar-card-actions">
        <button class="button" data-action="open-mech-assign" data-slot="${index}" type="button">機体<br>変更</button>
        <button class="button" data-action="open-pilot-assign" data-slot="${index}" ${hasMech ? "" : "disabled"} type="button">パイロット<br>変更</button>
      </div>
    </article>
  `;
}

function renderUnitStatRows(stats) {
  const labels = { hp: "HP", pp: "PP", sAtk: "S-ATK", mAtk: "M-ATK", lAtk: "L-ATK", sDef: "S-DEF", mDef: "M-DEF", lDef: "L-DEF", speed: "SPEED" };
  return Object.entries(labels).map(([key, label]) => `<div class="material-row"><span>${label}</span><strong>${formatNumber(stats[key] || 0)}</strong></div>`).join("");
}

function weaponTypeLabel(weaponType) {
  const normalized = typeof window.normalizeWeaponType === "function" ? window.normalizeWeaponType(weaponType) : String(weaponType || "melee");
  const master = typeof window.getMasterById === "function" ? window.getMasterById("weaponTypeMaster", "weaponType", normalized) : null;
  if (master?.displayName) return master.displayName;
  return { melee: "近接", ranged: "遠距離", magic: "魔法" }[normalized] || "近接";
}

function renderMainWeaponRows(weapon) {
  const safeWeapon = weapon || { name: "なし", weaponType: "melee", power: 0, ppCost: 0 };
  return `
    <div class="material-row"><span>武器名</span><strong>${safeWeapon.name || "なし"}</strong></div>
    <div class="material-row"><span>weaponType</span><strong>${weaponTypeLabel(safeWeapon.weaponType)}</strong></div>
    <div class="material-row"><span>power</span><strong>${formatNumber(safeWeapon.power || 0)}</strong></div>
    <div class="material-row"><span>ppCost</span><strong>${formatNumber(safeWeapon.ppCost || 0)}</strong></div>
  `;
}

function renderEquipmentSlots(machine) {
  const mainWeapon = typeof window.getMainWeapon === "function" ? window.getMainWeapon(machine) : machine.mainWeapon;
  const subWeapon = Array.isArray(machine.subWeapons) ? machine.subWeapons[0] : null;
  const options = Array.isArray(machine.options) ? machine.options : [];
  return `
    <div class="section-head" style="margin-top:10px"><h3>EQUIPMENT</h3></div>
    <div class="compact-list">
      ${renderEquipmentSlotButton(machine.id, "mainWeapon", 0, "主武器", mainWeapon?.name || "なし", mainWeapon?.rank || mainWeapon?.rarity || "-")}
      ${renderEquipmentSlotButton(machine.id, "subWeapon", 0, "副武器", subWeapon?.name || "なし", subWeapon?.rank || subWeapon?.rarity || "-")}
      ${[0, 1, 2].map((index) => renderEquipmentSlotButton(machine.id, "option", index, `OPTION${index + 1}`, options[index]?.name || "なし", options[index]?.rank || options[index]?.rarity || "-")).join("")}
    </div>
  `;
}

function renderEquipmentSlotButton(mechId, slotType, slotIndex, label, value, rank) {
  return `
    <button class="material-row equipment-slot-button" data-action="open-equip-slot" data-mech="${mechId}" data-slot-type="${slotType}" data-slot-index="${slotIndex}" type="button">
      <span style="flex:1;text-align:left">${label}<br><span class="muted">RANK ${rank}</span></span>
      <strong>${value}</strong>
    </button>
  `;
}

function weaponCandidateList() {
  const inventory = typeof window.ensureInventoryState === "function" ? window.ensureInventoryState() : window.GameState.inventory || {};
  const owned = Object.values(inventory.weapons || {}).filter((weapon) => weapon && typeof weapon === "object");
  const masters = Array.isArray(window.masterData?.weaponMaster) ? window.masterData.weaponMaster.slice(0, 12).map((weapon) => ({ ...weapon, id: weapon.weaponId })) : [];
  return [...owned, ...masters].filter((weapon, index, weapons) => weapon?.id && weapons.findIndex((item) => item.id === weapon.id) === index);
}

function optionFromMaster(row) {
  if (!row) return null;
  return {
    id: row.optionId || row.id,
    optionId: row.optionId || row.id,
    name: row.name,
    type: row.type || "general",
    rank: row.rank || "N",
    stats: {
      hp: Number(row.hp || 0), pp: Number(row.pp || 0), sAtk: Number(row.sAtk || 0), mAtk: Number(row.mAtk || 0), lAtk: Number(row.lAtk || 0),
      sDef: Number(row.sDef || 0), mDef: Number(row.mDef || 0), lDef: Number(row.lDef || 0), speed: Number(row.speed || 0)
    },
    subWeapon: row.subWeaponId && typeof window.getWeaponMaster === "function" ? { ...window.getWeaponMaster(row.subWeaponId), id: row.subWeaponId } : null
  };
}

function optionCandidateList() {
  const inventory = typeof window.ensureInventoryState === "function" ? window.ensureInventoryState() : window.GameState.inventory || {};
  return Object.entries(inventory.options || {}).filter(([, count]) => Number(count) > 0).map(([id]) => optionFromMaster(window.getMasterById?.("optionMaster", "optionId", id))).filter(Boolean);
}

function renderEquipmentModal(machine) {
  const selector = window.GameState.equipmentSelector;
  if (!selector || selector.mechId !== machine.id) return "";
  const isOption = selector.slotType === "option";
  const candidates = isOption ? optionCandidateList() : weaponCandidateList();
  return `
    <div class="modal-backdrop equipment-modal-backdrop">
      <section class="quest-materials-modal panel panel-pad" role="dialog" aria-modal="true" aria-label="装備変更">
        <div class="section-head">
          <h2>${isOption ? `OPTION${Number(selector.slotIndex || 0) + 1}` : selector.slotType === "subWeapon" ? "副武器" : "主武器"}</h2>
          <button class="button mini-map-close" data-action="close-equip-modal" type="button">閉じる</button>
        </div>
        <div class="compact-list">${candidates.length ? candidates.map((item) => renderEquipmentCandidate(machine, selector, item)).join("") : `<div class="muted">装備候補がありません。</div>`}</div>
      </section>
    </div>
  `;
}

function renderEquipmentCandidate(machine, selector, item) {
  const currentId = selector.slotType === "option" ? machine.options?.[selector.slotIndex]?.id : selector.slotType === "subWeapon" ? machine.subWeapons?.[0]?.id : machine.mainWeapon?.id;
  const itemId = item.id || item.weaponId || item.optionId;
  const isActive = currentId === itemId;
  const stats = item.stats ? Object.entries(item.stats).filter(([, value]) => Number(value)).map(([key, value]) => `${key}+${value}`).join(" ") : `power ${formatNumber(item.power || 0)}`;
  const action = selector.slotType === "option" ? "equip-option-slot" : "equip-weapon-slot";
  return `
    <button class="material-row ${isActive ? "active" : ""}" data-action="${action}" data-mech="${machine.id}" data-slot-type="${selector.slotType}" data-slot-index="${selector.slotIndex || 0}" data-equip-id="${itemId}" type="button">
      <div class="material-icon"></div>
      <span style="flex:1;text-align:left">${item.name || itemId}<br><span class="muted">RANK ${item.rank || item.rarity || "-"} / ${item.weaponCategory || item.weaponType || item.type || "-"}</span><br><span class="muted">${stats}</span></span>
      <strong>${isActive ? "装備中" : "装備"}</strong>
    </button>
  `;
}
function renderMachineOptions(machine) {
  if (typeof window.normalizeMachineOptions === "function") window.normalizeMachineOptions(machine);
  const options = Array.isArray(machine?.equippedOptions) ? machine.equippedOptions : Array.isArray(machine?.options) ? machine.options : [];
  if (!options.length) return `<div class="material-row"><span>装備中オプション</span><strong>なし</strong></div>`;
  return options.map((option) => {
    const subWeapon = option.subWeapon ? ` / ${option.subWeapon.name || "Sub Weapon"} ${weaponTypeLabel(option.subWeapon.weaponType)} power ${formatNumber(option.subWeapon.power || 0)}` : "";
    return `<div class="material-row"><span>${option.name || "Option"}</span><strong>${option.type || "general"}${subWeapon}</strong></div>`;
  }).join("");
}

function renderMachineTags(machine) {
  const labels = typeof window.getMachineTagLabels === "function" ? window.getMachineTagLabels(machine) : ["汎用"];
  return labels.map((label) => `<span class="tag">${label}</span>`).join("");
}

function renderMechAssignView(slot) {
  const mechs = window.GameState.mechs || [];
  const currentMech = getPartyMech(slot);
  return `
    <section class="panel panel-pad">
      <div class="section-head">
        <h2>機体変更</h2>
        <button class="button" data-action="close-party-assign" type="button">戻る</button>
      </div>
      <div class="material-row"><span>対象枠</span><strong>${String(Number(slot) + 1).padStart(2, "0")}</strong></div>
      <div class="compact-list">${mechs.length ? mechs.map((candidate, index) => renderMechAssignCandidate(candidate, index, slot, currentMech)).join("") : `<div class="muted">所持機体がありません。</div>`}</div>
    </section>
  `;
}

function renderMechAssignCandidate(mech, index, slot, currentMech) {
  if (!mech) return "";
  const isCurrent = currentMech?.id === mech.id;
  const isPartyAssigned = isMechInParty(mech.id) && !isCurrent;
  const pilot = getPilot(mech.pilotId);
  const status = isCurrent ? "この枠" : isPartyAssigned ? "別枠で編成中" : "未編成";
  return `
    <article class="material-row hangar-assign-row">
      <span style="flex:1">${mech.name || "Machine"}<br><span class="muted">RANK ${mech.rank || mech.rarity || "-"} / ${pilot ? pilot.name : "未搭乗"} / ${status}</span></span>
      <button class="button" data-action="assign-mech-to-party-slot" data-slot="${slot}" data-mech="${mech.id}" ${isCurrent || isPartyAssigned ? "disabled" : ""} type="button">${isCurrent ? "設定中" : "設定"}</button>
    </article>
  `;
}

function renderPilotAssignView(mech, slot) {
  const pilots = window.GameState.pilots;
  const currentPilot = getPilot(mech?.pilotId);
  if (!mech) {
    return `
      <section class="panel panel-pad">
        <div class="section-head"><h2>パイロット変更</h2><button class="button" data-action="close-party-assign" type="button">戻る</button></div>
        <div class="muted">先に機体を設定してください。</div>
      </section>
    `;
  }
  return `
    <section class="panel panel-pad">
      <div class="section-head">
        <h2>パイロット変更</h2>
        <button class="button" data-action="close-party-assign" type="button">戻る</button>
      </div>
      <div class="material-row"><span>対象機体</span><strong>${mech.name || "Machine"}</strong></div>
      <div class="material-row">
        <span>現在の搭乗者</span>
        <strong>${currentPilot ? currentPilot.name : "未搭乗"}</strong>
        <button class="button danger" data-action="unassign-pilot" data-mech="${mech.id}" ${currentPilot ? "" : "disabled"} type="button">機体から外す</button>
      </div>
      <div class="compact-list">${pilots.length ? pilots.map((pilot) => renderPilotAssignCandidate(pilot, mech, slot)).join("") : `<div class="muted">雇用中のパイロットがいません。</div>`}</div>
    </section>
  `;
}

function renderPilotAssignCandidate(pilot, mech, slot) {
  const currentMech = window.GameState.mechs.find((item) => item.pilotId === pilot.id);
  const isCurrent = mech.pilotId === pilot.id;
  const isAssignedElsewhere = currentMech && !isCurrent;
  const compatibility = getPilotMechCompatibility(pilot, mech);
  const className = window.getPilotClassDisplayName(pilot.classId);
  const status = isCurrent ? "この機体に搭乗中" : isAssignedElsewhere ? "別機体に搭乗中" : "未編成";
  const actionLabel = isCurrent ? "搭乗中" : isAssignedElsewhere ? "入れ替え" : "乗せる";
  const conditionLabel = typeof window.getPilotConditionLabel === "function" ? window.getPilotConditionLabel(pilot) : "健康";
  return `
    <article class="pilot-card pilot-assign-card panel">
      <div class="pilot-card-portrait">${window.renderPilotPortraitImage(pilot, "pilot-portrait--tavern-card")}</div>
      <div class="pilot-meta">
        <h3>${pilot.name}</h3>
        <div>RANK <strong>${pilot.rank}</strong></div>
        <div class="muted pilot-class-name">${className}</div>
        <div class="tag-row"><span class="tag">${status}</span><span class="tag">${compatibility.label}</span><span class="tag">${conditionLabel}</span></div>
      </div>
      <div class="cost-box">
        <button class="button" data-action="assign-pilot" data-slot="${slot}" data-mech="${mech.id}" data-pilot="${pilot.id}" type="button" ${isCurrent ? "disabled" : ""}>${actionLabel}</button>
      </div>
    </article>
  `;
}

window.assignMechToPartySlot = function assignMechToPartySlot(slot, mechId) {
  const state = window.GameState;
  const targetIndex = Number(slot);
  const selected = getMech(mechId);
  if (!isValidPartySlot(targetIndex) || !selected) return false;
  if (typeof window.ensureMechRosterState === "function") window.ensureMechRosterState();
  const activeIds = getActivePartyIds();
  if (isMechInParty(mechId) && activeIds[targetIndex] !== mechId) return false;
  const nextIds = Array.from({ length: typeof window.getPartyMechLimit === "function" ? window.getPartyMechLimit() : 4 }, (_, index) => activeIds[index] || null);
  nextIds[targetIndex] = mechId;
  setActivePartyIds(nextIds);
  state.selectedMechId = selected.id;
  state.assigningPartySlot = null;
  state.hangarView = "list";
  window.savePlayerData();
  window.renderCurrentScene();
  return true;
};

window.addMechToParty = function addMechToParty(mechId) {
  const state = window.GameState;
  const mech = getMech(mechId);
  if (!mech) return false;
  if (typeof window.ensureMechRosterState === "function") window.ensureMechRosterState();
  const limit = typeof window.getPartyMechLimit === "function" ? window.getPartyMechLimit() : 4;
  if (isMechInParty(mechId) || partyMechCount() >= limit) {
    logMessage("bar", "編成枠は最大4機です。", "danger");
    window.savePlayerData();
    window.renderCurrentScene();
    return false;
  }
  const activeIds = getActivePartyIds();
  const targetIndex = Array.from({ length: limit }, (_, index) => activeIds[index] || null).findIndex((id) => !id);
  const nextIds = Array.from({ length: limit }, (_, index) => activeIds[index] || null);
  nextIds[targetIndex] = mechId;
  setActivePartyIds(nextIds);
  state.selectedMechId = mechId;
  logMessage("bar", `${mech.name || "Machine"}を編成に入れました。`, "good");
  window.savePlayerData();
  window.renderCurrentScene();
  return true;
};

window.removeMechFromParty = function removeMechFromParty(mechId) {
  const state = window.GameState;
  const mech = getMech(mechId);
  setActivePartyIds(getActivePartyIds().map((id) => id === mechId ? null : id));
  logMessage("bar", `${mech?.name || "Machine"}を編成から外しました。`, "warn");
  window.savePlayerData();
  window.renderCurrentScene();
  return true;
};

window.selectPartySet = function selectPartySet(index) {
  const state = window.GameState;
  if (typeof window.ensureMechRosterState === "function") window.ensureMechRosterState();
  const parsedIndex = Math.floor(Number(index));
  const nextIndex = Math.max(0, Math.min((state.partySets || []).length - 1, Number.isFinite(parsedIndex) ? parsedIndex : 0));
  state.activePartyIndex = nextIndex;
  state.partyMechIds = [...(state.partySets[nextIndex]?.mechIds || [])];
  state.assigningPartySlot = null;
  state.hangarView = "list";
  window.savePlayerData();
  window.renderCurrentScene();
};

window.confirmPendingGeneratedMech = function confirmPendingGeneratedMech() {
  const state = window.GameState;
  const pending = state.pendingGeneratedMech;
  if (!pending) return false;
  const ownedLimit = typeof window.getOwnedMechLimit === "function" ? window.getOwnedMechLimit() : 30;
  if ((state.mechs || []).length >= ownedLimit) {
    logMessage("synthesis", "格納庫が満杯です。機体を削除して空きを作ってください。", "danger");
    window.savePlayerData();
    window.renderCurrentScene();
    return false;
  }
  state.mechs.push(pending);
  state.pendingGeneratedMech = null;
  state.selectedMechId = pending.id;
  if (typeof window.ensureMechRosterState === "function") window.ensureMechRosterState();
  logMessage("synthesis", `${pending.name || "Machine"}を格納庫へ保存しました。`, "good");
  window.savePlayerData();
  window.renderCurrentScene();
  return true;
};

window.discardPendingGeneratedMech = async function discardPendingGeneratedMech() {
  const state = window.GameState;
  const pending = state.pendingGeneratedMech;
  if (!pending) return false;
  if (pending.imageId && typeof window.deleteMechImageBlob === "function") {
    await window.deleteMechImageBlob(pending.imageId).catch(() => false);
  }
  state.pendingGeneratedMech = null;
  logMessage("synthesis", `${pending.name || "Machine"}を破棄しました。`, "warn");
  window.savePlayerData();
  window.renderCurrentScene();
  return true;
};

window.assignPilotToMech = function assignPilotToMech(mechId, pilotId) {
  const state = window.GameState;
  const mech = getMech(mechId);
  const pilot = getPilot(pilotId);
  if (!mech || !pilot) return;
  if (typeof window.normalizePilotStatus === "function") window.normalizePilotStatus(pilot);
  if (typeof window.isPilotConditionActive === "function" && window.isPilotConditionActive(pilot) && pilot.survival?.inMedicalRoom) {
    const conditionLabel = typeof window.getPilotConditionLabel === "function" ? window.getPilotConditionLabel(pilot) : "負傷";
    const confirmed = window.confirm
      ? window.confirm(`${pilot.name}は${conditionLabel}で医務室に隔離中です。強行出撃させますか？ 戦闘不能になるとロストします。`)
      : true;
    if (!confirmed) return;
    pilot.survival.inMedicalRoom = false;
    pilot.survival.forceSortie = true;
  }
  const currentMech = state.mechs.find((item) => item.pilotId === pilotId);
  if (currentMech && currentMech.id !== mech.id) {
    const existingPilot = getPilot(mech.pilotId);
    const confirmed = window.confirm
      ? window.confirm(`${pilot.name}は${currentMech.name || "別機体"}に搭乗中です。${mech.name || "この機体"}へ入れ替えますか？`)
      : true;
    if (!confirmed) return;
    currentMech.pilotId = existingPilot ? existingPilot.id : null;
  }
  mech.pilotId = pilotId;
  state.assigningPartySlot = null;
  state.hangarView = "list";
  window.savePlayerData();
  renderCurrentScene();
};

window.forceSortiePilot = function forceSortiePilot(pilotId) {
  const pilot = getPilot(pilotId);
  if (!pilot) return false;
  if (typeof window.normalizePilotStatus === "function") window.normalizePilotStatus(pilot);
  if (!(typeof window.isPilotConditionActive === "function" && window.isPilotConditionActive(pilot))) return false;
  const confirmed = window.confirm
    ? window.confirm(`${pilot.name}を医務室から出しますか？ この状態で戦闘不能になるとロストします。`)
    : true;
  if (!confirmed) return false;
  pilot.survival.inMedicalRoom = false;
  pilot.survival.forceSortie = true;
  logMessage("bar", `${pilot.name}を強行出撃可能にしました。`, "warn");
  window.savePlayerData();
  renderCurrentScene();
  return true;
};

window.returnPilotToMedicalRoom = function returnPilotToMedicalRoom(pilotId) {
  const pilot = getPilot(pilotId);
  if (!pilot) return false;
  if (typeof window.normalizePilotStatus === "function") window.normalizePilotStatus(pilot);
  if (!(typeof window.isPilotConditionActive === "function" && window.isPilotConditionActive(pilot))) return false;
  pilot.survival.inMedicalRoom = true;
  pilot.survival.forceSortie = false;
  logMessage("bar", `${pilot.name}を医務室へ戻しました。`, "good");
  window.savePlayerData();
  renderCurrentScene();
  return true;
};

window.unassignPilotFromMech = function unassignPilotFromMech(mechId) {
  const mech = getMech(mechId);
  if (!mech) return;
  const pilot = getPilot(mech.pilotId);
  mech.pilotId = null;
  window.GameState.assigningPartySlot = null;
  window.GameState.hangarView = "list";
  logMessage("bar", `${mech.name || "Machine"}から${pilot?.name || "パイロット"}を外しました。`, "warn");
  window.savePlayerData();
  renderCurrentScene();
};

window.cyclePilot = function cyclePilot(mechId) {
  const state = window.GameState;
  const mech = getMech(mechId);
  if (!mech || !state.pilots.length) return;
  const index = state.pilots.findIndex((pilot) => pilot.id === mech.pilotId);
  mech.pilotId = state.pilots[(index + 1) % state.pilots.length].id;
  window.savePlayerData();
  renderCurrentScene();
};

window.setPilotDetailMode = function setPilotDetailMode(mode) {
  window.GameState.pilotDetailMode = mode === "skill-tree" ? "skill-tree" : "detail";
  renderCurrentScene();
};

window.learnPilotSkillById = function learnPilotSkillById(pilotId, skillId) {
  const pilot = getPilot(pilotId);
  if (!pilot || typeof window.learnPilotSkill !== "function" || !window.learnPilotSkill(pilot, skillId)) {
    logMessage("bar", "スキル習得条件を満たしていません。", "danger");
    renderCurrentScene();
    return;
  }
  logMessage("bar", `${pilot.name}がスキルを習得しました。`, "good");
  renderCurrentScene();
};

window.openEquipmentSelector = function openEquipmentSelector(mechId, slotType, slotIndex = 0) {
  if (!getMech(mechId)) return;
  window.GameState.equipmentSelector = { mechId, slotType, slotIndex: Number(slotIndex || 0) };
  renderCurrentScene();
};

window.closeEquipmentSelector = function closeEquipmentSelector() {
  window.GameState.equipmentSelector = null;
  renderCurrentScene();
};

function findWeaponCandidate(equipId) {
  return weaponCandidateList().find((weapon) => (weapon.id || weapon.weaponId) === equipId) || null;
}

function findOptionCandidate(equipId) {
  return optionCandidateList().find((option) => (option.id || option.optionId) === equipId) || null;
}

window.equipWeaponSlot = function equipWeaponSlot(mechId, slotType, equipId) {
  const mech = getMech(mechId);
  const weapon = findWeaponCandidate(equipId);
  if (!mech || !weapon) return false;
  const normalized = {
    id: weapon.id || weapon.weaponId,
    weaponId: weapon.weaponId || weapon.id,
    name: weapon.name,
    rank: weapon.rank || weapon.rarity || "N",
    rarity: weapon.rarity || weapon.rank || "N",
    weaponCategory: weapon.weaponCategory || weapon.weaponType,
    weaponType: typeof window.normalizeWeaponType === "function" ? window.normalizeWeaponType(weapon.weaponType) : weapon.weaponType,
    element: typeof window.normalizeElement === "function" ? window.normalizeElement(weapon.element) : weapon.element || "none",
    power: Number(weapon.power || 0),
    ppCost: Number(weapon.ppCost || 0),
    overdrive: weapon.overdrive || weapon.overdriveId || null
  };
  if (slotType === "subWeapon") {
    mech.subWeapons = [normalized];
    mech.subWeaponId = normalized.id;
  } else {
    mech.mainWeapon = normalized;
    mech.weaponId = normalized.id;
  }
  window.GameState.equipmentSelector = null;
  window.savePlayerData();
  renderCurrentScene();
  return true;
};

window.equipOptionSlot = function equipOptionSlot(mechId, slotIndex, equipId) {
  const mech = getMech(mechId);
  const option = findOptionCandidate(equipId);
  const index = Number(slotIndex || 0);
  if (!mech || !option || index < 0 || index > 2) return false;
  mech.optionSlots = Math.max(3, Number(mech.optionSlots || 0));
  if (typeof window.normalizeMachineOptions === "function") window.normalizeMachineOptions(mech);
  const options = Array.isArray(mech.options) ? [...mech.options] : [];
  options[index] = typeof window.normalizeOption === "function" ? window.normalizeOption(option, option.id) : option;
  mech.options = options.slice(0, 3).filter(Boolean);
  mech.equippedOptions = mech.options;
  window.GameState.equipmentSelector = null;
  window.savePlayerData();
  renderCurrentScene();
  return true;
};

window.App.scenes.hangar = window.renderHangar;

