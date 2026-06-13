"use strict";

function slotLabel(slot) {
  return { weapon: "武器", armor: "装甲", core: "コア", option: "補助" }[slot] || slot;
}

window.getPilotMechCompatibility = function getPilotMechCompatibility(pilot, mech) {
  if (!pilot || !mech) return { label: "未搭乗", bonusText: "パイロット未設定", matched: false };
  if (pilot.traitId === "large_specialist" && (mech.size === "L" || mech.size === "XL")) {
    return { label: "大型適性", bonusText: "大型機性能 +", matched: true };
  }
  if (pilot.traitId === "medium_specialist" && mech.size === "M") {
    return { label: "中型適性", bonusText: "中型機性能 +", matched: true };
  }
  if (pilot.traitId === "small_specialist" && mech.size === "S") {
    return { label: "小型適性", bonusText: "小型機性能 +", matched: true };
  }
  if (pilot.traitId === "fuel_saver") {
    return { label: "燃費補助", bonusText: "探索燃料消費を補助", matched: true };
  }
  if (pilot.traitId === "lucky") {
    return { label: "探索向き", bonusText: "素材発見に期待", matched: true };
  }
  return { label: "標準", bonusText: "特別な適性なし", matched: false };
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

  if (!mech?.imagePath) {
    return `<div class="mech-image mech-image-${safeVariant}"${styleAttr}></div>`;
  }

  return `<div class="mech-image mech-image-${safeVariant}"${styleAttr}><img src="${mech.imagePath}" alt="${mech.name}"></div>`;
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
          <div class="section-head"><h2>パーティ編成</h2><span>出撃機体 ${state.mechs.length} / 4</span></div>
          <div class="hangar-party-grid">${state.mechs.slice(0, 4).map(renderPartySlot).join("")}</div>
        </section>
      `}
    ` : ""}
    ${state.hangarTab === "mechs" ? `
      ${state.hangarView === "mech-detail" && selected ? renderMechDetail(selected) : `
        <section class="panel panel-pad">
          <div class="section-head"><h2>所持機体一覧</h2><span>${state.mechs.length} / 4</span></div>
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
  return `
    <article class="mech-card panel ${window.GameState.selectedMechId === mech.id ? "selected" : ""}">
      <div class="section-head"><h3>${String(index + 1).padStart(2, "0")} ${mech.name}</h3><span class="tag">${mech.size}</span></div>
      <div class="pilot-overlay-anchor pilot-overlay-anchor--hangar-list">
        ${window.renderMechImage(mech, "card")}
        ${realPilot ? window.renderPilotPortraitImage(realPilot, "pilot-portrait--hangar") : ""}
      </div>
      <div class="tag-row">
        <span class="tag">${mech.type || "hybrid"}</span>
        <span class="tag">RANK ${mech.rank || mech.rarity || "-"}</span>
      </div>
      <div>HP ${formatNumber(mech.hp)} / ${formatNumber(mech.maxHp)}</div>
      <div class="bar" style="--value:${(mech.hp / mech.maxHp) * 100}%"><span></span></div>
      <div class="stat-row"><span>ATK</span><strong>${mech.atk}</strong></div>
      <div class="stat-row"><span>DEF</span><strong>${mech.def}</strong></div>
      <div class="stat-row"><span>MOBILITY</span><strong>${mech.mobility}</strong></div>
      <div class="material-row"><span>搭乗者</span><strong>${pilot.name}</strong></div>
      <button class="button" data-action="open-mech-detail" data-mech="${mech.id}" style="width:100%">詳細</button>
      <button class="button danger" data-action="sell-mech" data-mech="${mech.id}" ${canSellMech(mech.id) ? "" : "disabled"} style="width:100%;margin-top:6px">売却 ${formatNumber(salePrice)} G</button>
    </article>
  `;
}

function renderMechDetail(mech) {
  const pilot = displayPilot(mech.pilotId);
  const realPilot = getPilot(mech.pilotId);
  const overdrive = getOverdriveById(mech.overdriveId);
  const compatibility = realPilot ? getPilotMechCompatibility(realPilot, mech) : null;
  const traitTags = (mech.traits && mech.traits.length ? mech.traits : ["特性なし"]).map((trait) => `<span class="tag">${trait}</span>`).join("");
  return `
    <div class="panel panel-pad">
      <div class="section-head">
        <h2>機体詳細</h2>
        <button class="button" data-action="close-mech-detail" type="button">戻る</button>
      </div>
      <div class="muted">${mech.unique ? "固有機体" : "通常機体"} / ${mech.customizable ? "カスタム可" : "カスタム不可"}</div>
      <h3>${mech.name}</h3>
      <div class="pilot-overlay-anchor pilot-overlay-anchor--hangar-detail">
        ${window.renderMechImage(mech, "detail")}
        ${realPilot ? window.renderPilotPortraitImage(realPilot, "pilot-portrait--hangar") : ""}
      </div>
      <div class="tag-row">
        <span class="tag">SIZE ${mech.size}</span>
        <span class="tag">${mech.type || "-"}</span>
        <span class="tag">RANK ${mech.rank || mech.rarity || "-"}</span>
      </div>
      <div class="stat-row"><span>HP</span><strong>${formatNumber(mech.hp)} / ${formatNumber(mech.maxHp)}</strong></div>
      <div class="stat-row"><span>ATK</span><strong>${mech.atk}</strong></div>
      <div class="stat-row"><span>DEF</span><strong>${mech.def}</strong></div>
      <div class="stat-row"><span>MOBILITY</span><strong>${mech.mobility}</strong></div>
      <div class="stat-row"><span>fuelCostRate</span><strong>${Number(mech.fuelCostRate).toFixed(1)}</strong></div>
      ${renderGeneratedStatRows(mech)}
      ${renderOutputRows(mech)}
      <div class="section-head" style="margin-top:10px"><h3>traits</h3></div>
      <div class="tag-row">${traitTags}</div>
      <div class="section-head" style="margin-top:10px"><h3>overdrive</h3></div>
      <div class="material-row"><span>${overdrive ? overdrive.overdrive_name : "なし"}</span><strong>${overdrive ? `燃料 ${overdrive.fuel_cost}` : "-"}</strong></div>
      <div class="section-head" style="margin-top:10px"><h3>搭乗パイロット</h3></div>
      <div class="material-row"><span>${pilot.name}</span><strong>RANK ${pilot.rank}</strong></div>
      ${compatibility ? `<div class="material-row"><span>${compatibility.label}</span><strong>${compatibility.bonusText}</strong></div>` : ""}
      <div class="section-head" style="margin-top:10px"><h3>パーツスロット</h3></div>
      <div class="compact-list">${renderPartSlots(mech)}</div>
      <div class="section-head" style="margin-top:10px"><h3>売却</h3></div>
      <div class="material-row"><span>売却価格</span><strong>${formatNumber(getMechSalePrice(mech))} G</strong></div>
      <button class="button danger" data-action="sell-mech" data-mech="${mech.id}" ${canSellMech(mech.id) ? "" : "disabled"} style="width:100%;margin-top:8px">この機体を売却</button>
      <p class="muted">${mech.description || ""}</p>
    </div>
  `;
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

function renderGeneratedStatRows(mech) {
  if (!mech.stats) return "";
  return `
    <div class="stat-row"><span>ACCURACY</span><strong>${mech.stats.accuracy}</strong></div>
    <div class="stat-row"><span>EVASION</span><strong>${mech.stats.evasion}</strong></div>
    <div class="stat-row"><span>SPEED</span><strong>${mech.stats.speed}</strong></div>
    <div class="stat-row"><span>FUEL COST</span><strong>${mech.stats.fuelCost}</strong></div>
    <div class="stat-row"><span>CARGO</span><strong>${mech.stats.cargo}</strong></div>
    <div class="stat-row"><span>SCAN</span><strong>${mech.stats.scan}</strong></div>
  `;
}

function renderOutputRows(mech) {
  if (!mech.output) return "";
  return `
    <div class="section-head" style="margin-top:10px"><h3>output</h3></div>
    <div class="stat-row"><span>STATE</span><strong>${mech.output.state}</strong></div>
    <div class="stat-row"><span>LIMIT / REQUIRED</span><strong>${mech.output.limit} / ${mech.output.required}</strong></div>
    <div class="stat-row"><span>MARGIN</span><strong>${mech.output.margin}</strong></div>
  `;
}

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
  const traitMaster = getTraitById(pilot.traitId) || { trait_name: pilot.traitId };
  const className = window.getPilotClassDisplayName(pilot.classId);
  return `
    <button class="storage-card pilot-storage-card panel" data-action="open-pilot-detail" data-pilot="${pilot.id}" type="button">
      <div class="pilot-face-frame">${window.renderPilotPortraitImage(pilot, "pilot-portrait--face")}</div>
      <strong>${pilot.name}</strong><br>
      <span class="muted">RANK ${pilot.rank}</span><br>
      <span class="muted">${className}</span><br>
      <span class="muted">${traitMaster.trait_name} ${pilot.traitRank || ""}</span>
    </button>
  `;
}

function renderPilotDetailView(pilot) {
  const traitMaster = getTraitById(pilot.traitId) || { trait_name: pilot.traitId };
  const className = window.getPilotClassDisplayName(pilot.classId);
  const classRole = window.getPilotClassRole(pilot.classId);
  const skills = pilot.learnedSkills.map((id) => window.GameState.masters.skills.find((item) => item.skill_id === id)?.skill_name || id);
  const assignedMech = window.GameState.mechs.find((mech) => mech.pilotId === pilot.id);
  return `
    <section class="panel panel-pad pilot-detail-panel">
      <div class="section-head">
        <h2>${pilot.name}</h2>
        <button class="button" data-action="close-pilot-detail" type="button">戻る</button>
      </div>
      <div class="pilot-detail-layout">
        <div class="pilot-detail-portrait">${window.renderPilotPortraitImage(pilot, "pilot-portrait--detail")}</div>
        <div class="compact-list">
          <div class="material-row"><span>RANK</span><strong>${pilot.rank}</strong></div>
          <div class="material-row"><span>CLASS</span><strong>${className}</strong></div>
          <div class="material-row"><span>ROLE</span><strong>${classRole || "-"}</strong></div>
          <div class="material-row"><span>LEVEL</span><strong>${pilot.level || 1}</strong></div>
          <div class="material-row"><span>TRAIT</span><strong>${traitMaster.trait_name} ${pilot.traitRank || ""}</strong></div>
          <div class="material-row"><span>MECH</span><strong>${assignedMech?.name || "未搭乗"}</strong></div>
        </div>
      </div>
      <div class="section-head" style="margin-top:10px"><h3>skills</h3></div>
      <div class="tag-row">${skills.length ? skills.map((skill) => `<span class="tag">${skill}</span>`).join("") : `<span class="tag">初期スキルなし</span>`}</div>
    </section>
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

window.App.scenes.hangar = window.renderHangar;
