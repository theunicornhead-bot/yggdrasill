"use strict";

function slotLabel(slot) {
  return { weapon: "武器", armor: "装甲", core: "コア", option: "補助" }[slot] || slot;
}

window.getPilotMechCompatibility = function getPilotMechCompatibility(pilot, mech) {
  if (!pilot || !mech) return { label: "未搭乗", bonusText: "パイロット未設定", matched: false };
  const hasTrait = typeof window.hasPilotTraitSkill === "function" ? (traitId) => window.hasPilotTraitSkill(pilot, traitId) : (traitId) => pilot.traitId === traitId;
  if (hasTrait("large_specialist") && (mech.size === "L" || mech.size === "XL")) {
    return { label: "大型適性", bonusText: "大型機性能 +", matched: true };
  }
  if (hasTrait("medium_specialist") && mech.size === "M") {
    return { label: "中型適性", bonusText: "中型機性能 +", matched: true };
  }
  if (hasTrait("small_specialist") && mech.size === "S") {
    return { label: "小型適性", bonusText: "小型機性能 +", matched: true };
  }
  if (hasTrait("fuel_saver")) {
    return { label: "燃費補助", bonusText: "探索燃料消費を補助", matched: true };
  }
  if (hasTrait("lucky")) {
    return { label: "探索向き", bonusText: "素材発見に期待", matched: true };
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

  return `<div class="mech-image mech-image-${safeVariant}"${styleAttr}><img src="${imagePath}" alt="${altText}" onerror="this.onerror=null;this.src='${BASE_MECH_IMAGE_PATH}'"></div>`;
};

window.renderHangar = function renderHangar() {
  const state = window.GameState;
  if (!["party", "mechs", "pilots"].includes(state.hangarTab)) state.hangarTab = "party";
  if (!["list", "mech-detail", "pilot-assign", "pilot-detail"].includes(state.hangarView)) state.hangarView = "list";
  if (state.hangarTab !== "mechs" && state.hangarView === "mech-detail") state.hangarView = "list";
  if (state.hangarTab !== "party" && state.hangarView === "pilot-assign") state.hangarView = "list";
  if (state.hangarTab !== "pilots" && state.hangarView === "pilot-detail") state.hangarView = "list";
  if (state.hangarView === "pilot-assign" && !getMech(state.assigningMechId)) {
    state.hangarView = "list";
    state.assigningMechId = null;
  }

  const selected = getMech(state.selectedMechId) || state.mechs[0];
  const assigningMech = getMech(state.assigningMechId);
  const sortieCount = typeof window.getSortieUnits === "function" ? window.getSortieUnits().length : state.mechs.filter((mech) => getPilot(mech.pilotId)).slice(0, 4).length;
  window.App.root.innerHTML = `
    ${renderHeader("ハンガー", "HANGER")}
    <section class="hangar-tabs" role="tablist" aria-label="ハンガータブ">
      ${renderHangarTabButton("party", "パーティ編成")}
      ${renderHangarTabButton("mechs", "所持機体")}
      ${renderHangarTabButton("pilots", "パイロット")}
    </section>
    ${state.hangarTab === "party" ? `
      ${state.hangarView === "pilot-assign" && assigningMech ? renderPilotAssignView(assigningMech) : `
        <section class="panel panel-pad">
          <div class="section-head"><h2>パーティ編成</h2><span>出撃機体 ${sortieCount} / 4</span></div>
          <div class="hangar-party-grid">${state.mechs.slice(0, 4).map(renderPartySlot).join("")}</div>
        </section>
      `}
    ` : ""}
    ${state.hangarTab === "mechs" ? `
      ${state.hangarView === "mech-detail" && selected ? renderMechDetailV2(selected) : `
        <section class="panel panel-pad">
          <div class="section-head"><h2>所持機体一覧</h2><span>${state.mechs.length} / 20</span></div>
          <div class="mech-list">${state.mechs.map((mech, index) => renderMechCard(mech, index)).join("")}</div>
        </section>
      `}
    ` : ""}
    ${state.hangarTab === "pilots" ? `
      ${state.hangarView === "pilot-detail" && getPilot(state.selectedPilotId) ? renderPilotDetailView(getPilot(state.selectedPilotId)) : `
        <section class="panel panel-pad">
          <div class="section-head"><h2>パイロット</h2><span>雇用中 ${state.pilots.length} / 4</span></div>
          <div class="storage-grid">${state.pilots.map(renderStoredPilot).join("")}</div>
        </section>
      `}
    ` : ""}
  `;
};

function renderHangarTabButton(tab, label) {
  const active = window.GameState.hangarTab === tab;
  return `<button class="button hangar-tab-button ${active ? "active" : ""}" data-action="change-hangar-tab" data-tab="${tab}" type="button" role="tab" aria-selected="${active}">${label}</button>`;
}

function renderMechCard(mech, index) {
  const pilot = displayPilot(mech.pilotId);
  const realPilot = getPilot(mech.pilotId);
  const salePrice = getMechSalePrice(mech);
  if (typeof window.normalizeMachineStatus === "function") window.normalizeMachineStatus(mech);
  const unitStats = typeof window.calculateUnitStats === "function" ? window.calculateUnitStats(realPilot || null, mech) : (mech.stats || {});
  const mainWeapon = typeof window.getMainWeapon === "function" ? window.getMainWeapon(mech) : mech.mainWeapon;
  const attackPower = typeof window.calculateWeaponAttackPower === "function" ? window.calculateWeaponAttackPower(realPilot || null, mech, mainWeapon) : Math.max(unitStats.sAtk || 0, unitStats.mAtk || 0, unitStats.lAtk || 0);
  return `
    <article class="mech-card panel ${window.GameState.selectedMechId === mech.id ? "selected" : ""}">
      <div class="section-head"><h3>${String(index + 1).padStart(2, "0")} ${mech.name}</h3><span class="tag">${mech.size}</span></div>
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
      <button class="button" data-action="open-mech-detail" data-mech="${mech.id}" style="width:100%">詳細</button>
      <button class="button danger" data-action="sell-mech" data-mech="${mech.id}" ${canSellMech(mech.id) ? "" : "disabled"} style="width:100%;margin-top:6px">売却 ${formatNumber(salePrice)} G</button>
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
      <h3>${mech.name || "Machine"}</h3>
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
      <div class="section-head" style="margin-top:10px"><h3>OPTIONS</h3></div>
      <div class="compact-list">${renderMachineOptions(mech)}</div>
      <div class="section-head" style="margin-top:10px"><h3>TAGS</h3></div>
      <div class="tag-row">${renderMachineTags(mech)}</div>
      <div class="section-head" style="margin-top:10px"><h3>売却</h3></div>
      <div class="material-row"><span>売却価格</span><strong>${formatNumber(getMechSalePrice(mech))} G</strong></div>
      <button class="button danger" data-action="sell-mech" data-mech="${mech.id}" ${canSellMech(mech.id) ? "" : "disabled"} style="width:100%;margin-top:8px">この機体を売却</button>
      <p class="muted">${mech.description || ""}</p>
    </div>
  `;
}

function renderMachineCompatibilityRows(pilot, mech) {
  if (!pilot || !mech) return "";
  const tagMultiplier = typeof window.getMachineTagCompatibilityMultiplier === "function" ? window.getMachineTagCompatibilityMultiplier(pilot, mech) : 1;
  const rankMultiplier = typeof window.getRankCompatibilityMultiplier === "function" ? window.getRankCompatibilityMultiplier(pilot, mech) : 1;
  const rows = [];
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
  state.money += salePrice;
  if (state.selectedMechId === mechId) {
    state.selectedMechId = state.mechs[0]?.id || null;
  }
  logMessage("bar", `${mech.name}を${formatNumber(salePrice)}Gで売却しました。`, "good");
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
  const pilotSkills = typeof window.getLearnedPilotSkills === "function" ? window.getLearnedPilotSkills(pilot) : [];
  const className = window.getPilotClassDisplayName(pilot.classId);
  return `
    <button class="storage-card pilot-storage-card panel" data-action="open-pilot-detail" data-pilot="${pilot.id}" type="button">
      <div class="pilot-face-frame">${window.renderPilotPortraitImage(pilot, "pilot-portrait--face")}</div>
      <strong>${pilot.name}</strong><br>
      <span class="muted">RANK ${pilot.rank}</span><br>
      <span class="muted">${className}</span><br>
      <span class="muted">${pilotSkills[0]?.name || "No skills"}</span>
    </button>
  `;
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
        <div class="pilot-detail-portrait pilot-overlay-anchor pilot-overlay-anchor--pilot-detail">
          ${assignedMech ? window.renderMechImage(assignedMech, "detail") : ""}
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
      <div class="section-head" style="margin-top:10px"><h3>skills</h3></div>
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
  const pilot = displayPilot(mech.pilotId);
  const realPilot = getPilot(mech.pilotId);
  const pilotRank = realPilot?.rank || "-";
  const pilotLevel = realPilot?.level || "-";
  return `
    <article class="party-slot panel hangar-party-card">
      <div class="hangar-card-head">
        <span>${String(index + 1).padStart(2, "0")}</span>
        <strong>${mech.name}</strong>
      </div>
      <div class="hangar-party-mech pilot-overlay-anchor">
        ${window.renderMechImage(mech, "card")}
        ${realPilot ? window.renderPilotPortraitImage(realPilot, "pilot-portrait--hangar") : ""}
      </div>
      <div class="hangar-party-pilot">
        <strong>${pilot.name}</strong>
      </div>
      <div class="hangar-party-rank">
        <span>RANK ${pilotRank}</span>
        <span>LV ${pilotLevel}</span>
      </div>
      <div class="hangar-card-actions">
        <button class="button" data-action="open-mech-detail" data-mech="${mech.id}" type="button">詳細</button>
        <button class="button" data-action="open-pilot-assign" data-mech="${mech.id}" type="button">変更</button>
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

function renderPilotAssignView(mech) {
  const pilots = window.GameState.pilots;
  return `
    <section class="panel panel-pad">
      <div class="section-head">
        <h2>パイロット変更</h2>
        <button class="button" data-action="close-pilot-assign" type="button">戻る</button>
      </div>
      <div class="material-row"><span>対象機体</span><strong>${mech.name}</strong></div>
      <div class="compact-list">${pilots.length ? pilots.map((pilot) => renderPilotAssignCandidate(pilot, mech)).join("") : `<div class="muted">雇用中のパイロットがいません。</div>`}</div>
    </section>
  `;
}

function renderPilotAssignCandidate(pilot, mech) {
  const currentMech = window.GameState.mechs.find((item) => item.pilotId === pilot.id);
  const isCurrent = mech.pilotId === pilot.id;
  const compatibility = getPilotMechCompatibility(pilot, mech);
  const className = window.getPilotClassDisplayName(pilot.classId);
  const status = isCurrent ? "搭乗中" : currentMech ? "別機体に搭乗中" : "待機中";
  return `
    <article class="pilot-card panel">
      <div class="portrait" ${pilotPortraitStyle(pilot)}>${window.renderPilotPortraitImage(pilot, "pilot-portrait--card")}</div>
      <div class="pilot-meta">
        <h3>${pilot.name}</h3>
        <div>RANK <strong>${pilot.rank}</strong> / ${className}</div>
        <div class="tag-row"><span class="tag">${status}</span><span class="tag">${compatibility.label}</span></div>
        <div class="muted">${compatibility.bonusText}</div>
      </div>
      <div class="cost-box">
        <button class="button" data-action="assign-pilot" data-mech="${mech.id}" data-pilot="${pilot.id}" type="button" ${isCurrent ? "disabled" : ""}>${isCurrent ? "搭乗中" : "乗せる"}</button>
      </div>
    </article>
  `;
}

window.assignPilotToMech = function assignPilotToMech(mechId, pilotId) {
  const state = window.GameState;
  const mech = getMech(mechId);
  const pilot = getPilot(pilotId);
  if (!mech || !pilot) return;
  state.mechs.forEach((item) => {
    if (item.pilotId === pilotId) item.pilotId = null;
  });
  mech.pilotId = pilotId;
  state.assigningMechId = null;
  state.hangarView = "list";
  renderCurrentScene();
};

window.unassignPilotFromMech = function unassignPilotFromMech(mechId) {
  const mech = getMech(mechId);
  if (!mech) return;
  mech.pilotId = null;
  renderCurrentScene();
};

window.cyclePilot = function cyclePilot(mechId) {
  const state = window.GameState;
  const mech = getMech(mechId);
  if (!mech || !state.pilots.length) return;
  const index = state.pilots.findIndex((pilot) => pilot.id === mech.pilotId);
  mech.pilotId = state.pilots[(index + 1) % state.pilots.length].id;
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

window.App.scenes.hangar = window.renderHangar;
