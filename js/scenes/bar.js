"use strict";

const TAVERN_HIRE_RANKS = ["E", "D", "C"];
const TAVERN_QUEST_TEMPLATES = [
  { type: "hunt", title: "エネミー討伐", description: "指定惑星で敵性反応を排除する。", reward: { money: 900, core: 1, rare: "低確率" } },
  { type: "delivery", title: "素材納品", description: "探索で指定素材を回収し、酒場へ納品する。", reward: { money: 650, core: 0, rare: "中確率" } },
  { type: "survey", title: "領域調査", description: "未踏階層の地形と資源反応を調査する。", reward: { money: 780, core: 1, rare: "低確率" } }
];

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
    C: [{ rank: "D", weight: 30 }, { rank: "C", weight: 50 }, { rank: "B", weight: 20 }]
  };
  return rollWeighted(table[pilotRank] || table.C);
};

window.generateTavernCandidates = function generateTavernCandidates() {
  const state = window.GameState;
  const rankWeights = window.RankConfig.rankWeights.filter((entry) => TAVERN_HIRE_RANKS.includes(entry.rank));
  const candidates = [];
  for (let i = 0; i < 3; i += 1) {
    const classMaster = pickRandom(state.masters.classes);
    const nameMaster = pickRandom(state.masters.pilotNames);
    const traitMaster = pickRandom(state.masters.traits);
    const rank = rollWeighted(rankWeights);
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

window.setBarView = function setBarView(view) {
  const state = window.GameState;
  state.barView = ["home", "hire", "quests", "candidate-detail"].includes(view) ? view : "home";
  if (state.barView !== "candidate-detail") state.selectedTavernCandidateId = null;
  window.renderCurrentScene();
};

window.openTavernCandidateDetail = function openTavernCandidateDetail(candidateId) {
  window.GameState.selectedTavernCandidateId = candidateId;
  window.GameState.barView = "candidate-detail";
  window.renderCurrentScene();
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
  state.barView = "hire";
  state.selectedTavernCandidateId = null;
  logMessage("bar", `${candidate.name}を雇用した。`, "good");
  renderCurrentScene();
};

window.acceptTavernQuest = function acceptTavernQuest(planetId) {
  const planet = window.getPlanetById(planetId);
  if (!planet || !window.isPlanetUnlocked(planet)) return;
  window.GameState.selectedPlanetId = planet.id;
  if (window.GameState.quest) window.GameState.quest.selectedPlanetId = planet.id;
  window.startSelectedPlanetQuest();
  window.GameState.currentScene = "quest";
  window.renderCurrentScene();
};

window.renderBar = function renderBar() {
  const state = window.GameState;
  state.barView = state.barView || "home";
  if (!state.tavernCandidates.length) generateTavernCandidates();
  const viewHtml = {
    home: renderBarHome,
    hire: renderHireView,
    quests: renderTavernQuests,
    "candidate-detail": renderCandidateDetail
  }[state.barView]();
  window.App.root.innerHTML = `
    ${renderHeader("酒場", "TAVERN")}
    ${viewHtml}
  `;
};

function renderBarHome() {
  return `
    <section class="tavern-master panel">
      <img class="tavern-master-image" src="bar/master_00.png" alt="酒場のマスター">
      <div class="speech tavern-speech">いらっしゃい。今日は何をする？</div>
    </section>
    <section class="tavern-menu">
      <button class="button tavern-menu-button" data-action="bar-view" data-view="hire" type="button">キャラクター雇用</button>
      <button class="button tavern-menu-button" data-action="bar-view" data-view="quests" type="button">クエスト受注</button>
    </section>
    <section class="panel panel-pad">
      <div class="section-head"><h2>酒場ログ</h2><span>INFO</span></div>
      <div class="log-scroll">${logHtml("bar")}</div>
    </section>
  `;
}

function renderHireView() {
  const state = window.GameState;
  return `
    <section class="panel panel-pad">
      <div class="section-head">
        <h2>雇用候補</h2>
        <button class="button" data-action="bar-view" data-view="home" type="button">戻る</button>
      </div>
      <div class="tavern-sub-actions">
        <span class="muted">RANK Cまでの候補のみ表示</span>
        <button class="button" data-action="refresh-candidates" type="button">候補更新</button>
      </div>
      <div class="pilot-list">${state.tavernCandidates.map(renderCandidateCard).join("")}</div>
    </section>
  `;
}

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
        <button class="button" data-action="open-tavern-candidate-detail" data-pilot="${pilot.id}" type="button">詳細</button>
        <button class="button" data-action="hire" data-pilot="${pilot.id}" ${window.GameState.pilots.length >= 4 ? "disabled" : ""} type="button">雇う</button>
      </div>
    </article>
  `;
}

function renderCandidateDetail() {
  const pilot = window.GameState.tavernCandidates.find((candidate) => candidate.id === window.GameState.selectedTavernCandidateId);
  if (!pilot) return renderHireView();
  const traitMaster = getTraitById(pilot.traitId) || { trait_name: pilot.traitId, description: "" };
  const className = window.getPilotClassDisplayName(pilot.classId);
  const classRole = window.getPilotClassRole(pilot.classId);
  const skills = pilot.learnedSkills.map((id) => window.GameState.masters.skills.find((item) => item.skill_id === id)).filter(Boolean);
  return `
    <section class="panel panel-pad pilot-detail-panel">
      <div class="section-head">
        <h2>${pilot.name}</h2>
        <button class="button" data-action="bar-view" data-view="hire" type="button">戻る</button>
      </div>
      <div class="pilot-detail-layout">
        <div class="pilot-detail-portrait">${window.renderPilotPortraitImage(pilot, "pilot-portrait--detail")}</div>
        <div class="compact-list">
          <div class="material-row"><span>RANK</span><strong>${pilot.rank}</strong></div>
          <div class="material-row"><span>CLASS</span><strong>${className}</strong></div>
          <div class="material-row"><span>ROLE</span><strong>${classRole || "-"}</strong></div>
          <div class="material-row"><span>LEVEL</span><strong>${pilot.level || 1}</strong></div>
          <div class="material-row"><span>TRAIT</span><strong>${traitMaster.trait_name} ${pilot.traitRank || ""}</strong></div>
          <div class="material-row"><span>COST</span><strong>${formatNumber(pilot.hireCost)} G</strong></div>
        </div>
      </div>
      <div class="section-head" style="margin-top:10px"><h3>特性</h3></div>
      <p class="muted">${traitMaster.description || "この候補が持つ固有適性です。"}</p>
      <div class="section-head" style="margin-top:10px"><h3>スキル</h3></div>
      <div class="compact-list">${skills.length ? skills.map(renderSkillDetail).join("") : `<div class="material-row"><span>初期スキル</span><strong>なし</strong></div>`}</div>
      <button class="button tavern-wide-action" data-action="hire" data-pilot="${pilot.id}" ${window.GameState.pilots.length >= 4 ? "disabled" : ""} type="button">このキャラクターを雇う</button>
    </section>
  `;
}

function renderSkillDetail(skill) {
  return `
    <div class="material-row">
      <span>${skill.skill_name}<br><span class="muted">${skill.description || skill.effect_type || ""}</span></span>
      <strong>Tier ${skill.tier || "-"}</strong>
    </div>
  `;
}

function renderTavernQuests() {
  const availablePlanets = window.PlanetMaster.filter((planet) => window.isPlanetUnlocked(planet));
  return `
    <section class="panel panel-pad">
      <div class="section-head">
        <h2>クエスト受注</h2>
        <button class="button" data-action="bar-view" data-view="home" type="button">戻る</button>
      </div>
      <div class="compact-list">${availablePlanets.map(renderTavernQuestCard).join("")}</div>
    </section>
  `;
}

function renderTavernQuestCard(planet, index) {
  const template = TAVERN_QUEST_TEMPLATES[index % TAVERN_QUEST_TEMPLATES.length];
  const targetMaterial = getMaterial(planet.materialPool?.[0]) || null;
  const rewardMoney = template.reward.money + planet.difficulty * 180;
  const coreReward = template.reward.core + (planet.difficulty >= 3 ? 1 : 0);
  const objective = template.type === "delivery" && targetMaterial
    ? `${targetMaterial.name}を入手して納品`
    : template.type === "hunt"
      ? `${planet.name}のエネミーを討伐`
      : `${planet.name}の探索領域を調査`;
  return `
    <article class="tavern-quest-card panel">
      <div class="section-head">
        <h3>${template.title}</h3>
        <span class="tag">推奨 ${planet.recommendedRank}</span>
      </div>
      <div class="material-row"><span>惑星</span><strong>${planet.name}</strong></div>
      <div class="material-row"><span>目的</span><strong>${objective}</strong></div>
      <p class="muted">${template.description}</p>
      <div class="tag-row">
        <span class="tag">${formatNumber(rewardMoney)} G</span>
        <span class="tag">コア x${coreReward}</span>
        <span class="tag">レア素材 ${template.reward.rare}</span>
      </div>
      <button class="button tavern-wide-action" data-action="accept-tavern-quest" data-planet="${planet.id}" type="button">受注して探索へ</button>
    </article>
  `;
}

window.App.scenes.bar = window.renderBar;
