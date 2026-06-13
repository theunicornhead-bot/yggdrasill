"use strict";

function pickRandom(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function rollWeighted(entries, valueKey = "rank") {
  const total = entries.reduce((sum, item) => sum + item.weight, 0);
  let roll = Math.random() * total;
  for (const item of entries) {
    roll -= item.weight;
    if (roll <= 0) return item[valueKey];
  }
  return entries[entries.length - 1][valueKey];
}

window.rollTraitRankByPilotRank = function rollTraitRankByPilotRank(pilotRank) {
  const table = {
    E: [{ rank: "E", weight: 70 }, { rank: "D", weight: 30 }],
    D: [{ rank: "E", weight: 35 }, { rank: "D", weight: 45 }, { rank: "C", weight: 20 }],
    C: [{ rank: "D", weight: 30 }, { rank: "C", weight: 50 }, { rank: "B", weight: 20 }],
    B: [{ rank: "C", weight: 35 }, { rank: "B", weight: 45 }, { rank: "A", weight: 20 }],
    A: [{ rank: "B", weight: 35 }, { rank: "A", weight: 50 }, { rank: "S", weight: 15 }],
    S: [{ rank: "B", weight: 15 }, { rank: "A", weight: 45 }, { rank: "S", weight: 40 }]
  };
  return rollWeighted(table[pilotRank] || table.C);
};

window.generateTavernCandidates = function generateTavernCandidates() {
  const state = window.GameState;
  const candidates = [];
  for (let i = 0; i < 3; i += 1) {
    const classMaster = pickRandom(state.masters.classes);
    const nameMaster = pickRandom(state.masters.pilotNames);
    const traitMaster = pickRandom(state.masters.traits);
    const rank = rollWeighted(window.RankConfig.rankWeights);
    const initialSkill = getInitialSkillForClass(classMaster.class_id);
    candidates.push({
      id: `candidate_${Date.now()}_${i}_${Math.floor(Math.random() * 9999)}`,
      name: nameMaster.name,
      gender: nameMaster.gender,
      rank,
      classId: classMaster.class_id,
      traitId: traitMaster.trait_id,
      traitRank: rollTraitRankByPilotRank(rank),
      level: 1,
      exp: 0,
      skillPoints: 0,
      learnedSkills: initialSkill ? [initialSkill.skill_id] : [],
      appearanceId: `${classMaster.class_id}_${nameMaster.gender}`,
      hireCost: window.RankConfig.hireCosts[rank],
      hired: false,
      hair: nameMaster.gender === "female" ? "#b9a0a8" : "#2a3037",
      skin: nameMaster.gender === "female" ? "#bd8f7e" : "#a9795d"
    });
  }
  state.tavernCandidates = candidates;
};

window.hirePilot = function hirePilot(candidateId) {
  const state = window.GameState;
  const candidate = state.tavernCandidates.find((pilot) => pilot.id === candidateId);
  if (!candidate) return;
  if (state.pilots.length >= 4) {
    logMessage("bar", "パイロットは4人以上雇えない。", "danger");
    renderCurrentScene();
    return;
  }
  if (state.money < candidate.hireCost) {
    logMessage("bar", "所持金が足りない。", "danger");
    renderCurrentScene();
    return;
  }
  state.money -= candidate.hireCost;
  state.pilots.push({ ...candidate, id: `pilot_${String(state.pilots.length + 1).padStart(3, "0")}`, hired: true });
  state.tavernCandidates = state.tavernCandidates.filter((pilot) => pilot.id !== candidateId);
  logMessage("bar", `${candidate.name}を雇用した。`, "good");
  renderCurrentScene();
};

window.renderBar = function renderBar() {
  const state = window.GameState;
  if (!state.tavernCandidates.length) generateTavernCandidates();
  window.App.root.innerHTML = `
    ${renderHeader("酒場", "TAVERN")}
    <section class="hero-visual panel">
      <div class="pilot-overlay-anchor pilot-overlay-anchor--tavern">
        ${window.renderPilotPortraitImage(window.getDefaultPilotForPortrait(), "pilot-portrait--tavern")}
      </div>
      <div class="speech">優秀なパイロットを揃えると探索が有利になるよ。</div>
    </section>
    <section class="panel panel-pad">
      <div class="section-head">
        <h2>雇用候補</h2>
        <button class="button" data-action="refresh-candidates">更新</button>
      </div>
      <div class="pilot-list">${state.tavernCandidates.map(renderCandidateCard).join("")}</div>
    </section>
    <section class="panel panel-pad">
      <div class="section-head"><h2>パーティ状況</h2><strong>${state.pilots.length} / 4</strong></div>
      <div class="party-grid">
        ${state.pilots.map((pilot, index) => `<div class="party-slot panel"><div class="portrait" ${pilotPortraitStyle(pilot)}></div><span>${String(index + 1).padStart(2, "0")}</span><br>${pilot.name}</div>`).join("")}
      </div>
    </section>
    <section class="panel panel-pad">
      <div class="section-head"><h2>所持素材（売却）</h2><span>${totalMaterials()} / 100</span></div>
      <div class="compact-list">${materialRows()}</div>
    </section>
  `;
};

function renderCandidateCard(pilot) {
  const traitMaster = getTraitById(pilot.traitId) || { trait_name: pilot.traitId };
  const skill = pilot.learnedSkills.map((id) => window.GameState.masters.skills.find((item) => item.skill_id === id)?.skill_name || id).join(", ");
  const className = window.getPilotClassDisplayName(pilot.classId);
  return `
    <article class="pilot-card panel">
      <div class="pilot-card-portrait">${window.renderPilotPortraitImage(pilot, "pilot-portrait--tavern-card")}</div>
      <div class="pilot-meta">
        <h3>${pilot.name}</h3>
        <div>RANK <strong>${pilot.rank}</strong></div>
        <div class="muted">${className}</div>
        <div class="tag-row">
          <span class="tag">${traitMaster.trait_name} ${pilot.traitRank}</span>
          <span class="tag">${skill || "初期スキルなし"}</span>
        </div>
      </div>
      <div class="cost-box">
        <span class="muted">雇用費用</span>
        <strong>${formatNumber(pilot.hireCost)} G</strong>
        <button class="button" data-action="hire" data-pilot="${pilot.id}" ${window.GameState.pilots.length >= 4 ? "disabled" : ""}>雇う</button>
      </div>
    </article>
  `;
}

window.App.scenes.bar = window.renderBar;
