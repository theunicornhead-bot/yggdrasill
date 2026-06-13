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

window.renderHangar = function renderHangar() {
  const state = window.GameState;
  const selected = getMech(state.selectedMechId) || state.mechs[0];
  window.App.root.innerHTML = `
    ${renderHeader("ハンガー", "HANGER")}
    <section class="panel panel-pad">
      <div class="section-head"><h2>所持機体一覧</h2><span>${state.mechs.length} / 4</span></div>
      <div class="mech-list">${state.mechs.map((mech, index) => renderMechCard(mech, index)).join("")}</div>
    </section>
    <section class="details-layout">
      ${selected ? renderMechDetail(selected) : `<div class="panel panel-pad">機体がありません。</div>`}
      <div class="panel panel-pad">
        <div class="section-head"><h2>パイロット保管庫</h2><span>雇用中 ${state.pilots.length} / 4</span></div>
        <div class="storage-grid">${state.pilots.map(renderStoredPilot).join("")}</div>
      </div>
      <div class="panel panel-pad">
        <div class="section-head"><h2>パーティ編成欄</h2><span>出撃機体 ${state.mechs.length} / 4</span></div>
        <div class="party-grid">${state.mechs.map(renderPartySlot).join("")}</div>
      </div>
    </section>
  `;
};

function renderMechCard(mech, index) {
  const pilot = displayPilot(mech.pilotId);
  return `
    <article class="mech-card panel ${window.GameState.selectedMechId === mech.id ? "selected" : ""}" data-action="select-mech" data-mech="${mech.id}">
      <div class="section-head"><h3>${String(index + 1).padStart(2, "0")} ${mech.name}</h3><span class="tag">${mech.size}</span></div>
      ${renderMechThumb(mech)}
      <div class="tag-row">
        <span class="tag">${mech.type || "hybrid"}</span>
        <span class="tag">RANK ${mech.rank || "-"}</span>
      </div>
      <div>HP ${formatNumber(mech.hp)} / ${formatNumber(mech.maxHp)}</div>
      <div class="bar" style="--value:${(mech.hp / mech.maxHp) * 100}%"><span></span></div>
      <div class="stat-row"><span>ATK</span><strong>${mech.atk}</strong></div>
      <div class="stat-row"><span>DEF</span><strong>${mech.def}</strong></div>
      <div class="stat-row"><span>MOBILITY</span><strong>${mech.mobility}</strong></div>
      <div class="material-row"><span>搭乗者</span><strong>${pilot.name}</strong></div>
      <button class="button" data-action="select-mech" data-mech="${mech.id}" style="width:100%">詳細</button>
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
        <span>${mech.unique ? "固有機体" : "通常機体"} / ${mech.customizable ? "カスタム可" : "カスタム不可"}</span>
      </div>
      <h3>${mech.name}</h3>
      ${renderMechThumb(mech)}
      <div class="tag-row">
        <span class="tag">SIZE ${mech.size}</span>
        <span class="tag">${mech.type}</span>
        <span class="tag">RANK ${mech.rank}</span>
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
      <p class="muted">${mech.description || ""}</p>
    </div>
  `;
}

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
  if (!mech.imagePath) return `<div class="mech-thumb"></div>`;
  return `<div class="mech-thumb has-image"><img src="${mech.imagePath}" alt="${mech.name}"></div>`;
}

function renderPartSlots(mech) {
  const slots = mech.slotCounts || { weapon: 0, armor: 0, core: 0, option: 0 };
  return Object.entries(slots).map(([slot, count]) => {
    const value = mech.customizable ? `${count}枠 / ${mech.parts?.[slot] || "未装備"}` : "使用不可";
    return `<div class="material-row"><span>${slotLabel(slot)}</span><strong>${value}</strong></div>`;
  }).join("");
}

function renderStoredPilot(pilot) {
  const classMaster = getClassById(pilot.classId) || { class_name: pilot.classId };
  const traitMaster = getTraitById(pilot.traitId) || { trait_name: pilot.traitId };
  return `
    <div class="storage-card panel">
      <div class="portrait" ${pilotPortraitStyle(pilot)}></div>
      ${pilot.name}<br>
      <span class="muted">RANK ${pilot.rank}</span><br>
      <span class="muted">${classMaster.class_name}</span><br>
      <span class="muted">${traitMaster.trait_name} ${pilot.traitRank || ""}</span>
    </div>
  `;
}

function renderPartySlot(mech, index) {
  const pilot = displayPilot(mech.pilotId);
  return `<div class="party-slot panel"><div class="portrait" ${pilotPortraitStyle(pilot)}></div>${String(index + 1).padStart(2, "0")}<br>${pilot.name}</div>`;
}

window.cyclePilot = function cyclePilot(mechId) {
  const state = window.GameState;
  const mech = getMech(mechId);
  if (!mech || !state.pilots.length) return;
  const index = state.pilots.findIndex((pilot) => pilot.id === mech.pilotId);
  mech.pilotId = state.pilots[(index + 1) % state.pilots.length].id;
  renderCurrentScene();
};

window.App.scenes.hangar = window.renderHangar;
