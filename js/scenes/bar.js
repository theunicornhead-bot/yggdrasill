"use strict";

const TAVERN_HIRE_RANKS = ["E", "D", "C"];
const TAVERN_GROWTH_WEIGHTS = [
  { growthType: "early", weight: 25 },
  { growthType: "normal", weight: 45 },
  { growthType: "late", weight: 22 },
  { growthType: "superLate", weight: 8 }
];
const TAVERN_QUEST_TEMPLATES = [
  { type: "hunt", title: "エネミー討伐", description: "指定惑星で敵性反応を排除する。", reward: { money: 900, core: 1, rare: "低確率" } },
  { type: "delivery", title: "素材回収", description: "探索で指定資材を回収し、ブリッジへ報告する。", reward: { money: 650, core: 0, rare: "中確率" } },
  { type: "survey", title: "領域調査", description: "未踏階層の地形と資源反応を調査する。", reward: { money: 780, core: 1, rare: "低確率" } }
];
const BRIDGE_FACILITY_CONFIG = {
  foodStorage: { name: "食糧庫拡張", description: "食料上限・備蓄安定化。生命維持の食料効率を改善する。", cost: 300, effects: { foodCostReduction: 0.05 } },
  engine: { name: "エンジン拡張", description: "推進系と配電効率を改善する。", cost: 300, effects: { energyCostReduction: 0.05 } },
  lifeSupport: { name: "生命維持区画", description: "水耕槽と培養食料ラインを復旧する。", cost: 450, effects: { foodProduction: 1 } },
  tacticalSupport: { name: "発電区画", description: "補助発電とブリッジ系統を復旧する。", cost: 450, effects: { energyProduction: 1 } }
};

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
    const rank = rollWeighted(rankWeights);
    const initialSkill = getInitialSkillForClass(classMaster.class_id);
    const initialTalent = typeof window.rollTalentForPilot === "function"
      ? window.rollTalentForPilot({ classId: classMaster.class_id, rank, talents: [] })
      : null;
    const fallbackTrait = initialTalent ? null : pickRandom(state.masters.traits);
    const candidate = {
      id: `candidate_${Date.now()}_${i}_${Math.floor(Math.random() * 9999)}`,
      name: nameMaster.name,
      gender: nameMaster.gender,
      rank,
      classId: classMaster.class_id,
      growthType: rollWeighted(TAVERN_GROWTH_WEIGHTS, "growthType"),
      traitId: initialTalent?.talentId || fallbackTrait?.trait_id || "",
      traitRank: initialTalent?.rank || rollTraitRankByPilotRank(rank),
      talents: initialTalent ? [initialTalent] : [],
      level: 1,
      exp: 0,
      nextExp: typeof window.calculateNextExp === "function" ? window.calculateNextExp(1) : 120,
      skillPoints: 0,
      learnedSkills: initialSkill ? [initialSkill.skill_id] : [],
      skills: [],
      appearanceId: `${classMaster.class_id}_${nameMaster.gender}`,
      hireCost: window.RankConfig.hireCosts[rank],
      hired: false,
      hair: nameMaster.gender === "female" ? "#b9a0a8" : "#2a3037",
      skin: nameMaster.gender === "female" ? "#bd8f7e" : "#a9795d"
    };
    if (typeof window.normalizePilotStatus === "function") window.normalizePilotStatus(candidate);
    candidates.push(candidate);
  }
  state.tavernCandidates = candidates;
};

window.setBarView = function setBarView(view) {
  const state = window.GameState;
  state.barView = ["home", "hire", "rank-up", "quests", "lifeline", "ein-trace", "candidate-detail"].includes(view) ? view : "home";
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
    logMessage("bar", "起床パイロットは4人までに制限されています。", "danger");
    renderCurrentScene();
    return;
  }
  const ship = typeof window.ensureShipState === "function" ? window.ensureShipState() : state.ship;
  if (ship && Number(ship.food || 0) >= Number(candidate.hireCost || 0)) {
    ship.food = Math.max(0, Number(ship.food || 0) - Number(candidate.hireCost || 0));
  } else {
    if (state.money < candidate.hireCost) {
      logMessage("bar", "解除に必要な食料または資金が足りません。", "danger");
      renderCurrentScene();
      return;
    }
    state.money -= candidate.hireCost;
  }
  const hiredPilot = { ...candidate, id: `pilot_${String(state.pilots.length + 1).padStart(3, "0")}`, hired: true };
  if (typeof window.normalizePilotStatus === "function") window.normalizePilotStatus(hiredPilot);
  state.pilots.push(hiredPilot);
  state.tavernCandidates = state.tavernCandidates.filter((pilot) => pilot.id !== candidateId);
  state.barView = "hire";
  state.selectedTavernCandidateId = null;
  logMessage("bar", `${candidate.name}のコールドスリープを解除した。`, "good");
  renderCurrentScene();
};

window.acceptTavernQuest = function acceptTavernQuest(planetId) {
  const planet = window.getPlanetById(planetId);
  if (!planet || !window.isPlanetUnlocked(planet)) return;
  window.GameState.selectedPlanetId = planet.id;
  if (window.GameState.quest) window.GameState.quest.selectedPlanetId = planet.id;
  if (window.startSelectedPlanetQuest()) {
    window.GameState.currentScene = "quest";
    window.renderCurrentScene();
  }
};

window.renderBar = function renderBar() {
  const state = window.GameState;
  state.barView = state.barView || "home";
  if (!state.tavernCandidates.length) generateTavernCandidates();
  const viewHtml = {
    home: renderBarHome,
    hire: renderHireView,
    "rank-up": renderPilotRankUpView,
    quests: renderTavernQuests,
    lifeline: renderLifelineView,
    "ein-trace": renderEinTraceView,
    "candidate-detail": renderCandidateDetail
  }[state.barView]();
  window.App.root.innerHTML = `
    ${renderHeader("ブリッジ", "BRIDGE")}
    ${viewHtml}
  `;
};

function renderBarHome() {
  return `
    ${renderBridgeShipStatus()}
    <section class="tavern-master panel">
      <img class="tavern-master-image" src="bar/master_00.png" alt="艦長">
      <div class="speech tavern-speech">ブリッジへようこそ。現在、ユグドラシルは漂流状態です。誰を起こすか、どの区画を復旧するか。判断をお願いします。</div>
    </section>
    <section class="tavern-menu">
      <button class="button tavern-menu-button" data-action="bar-view" data-view="hire" type="button">コールドスリープ解除</button>
      <button class="button tavern-menu-button" data-action="bar-view" data-view="rank-up" type="button">パイロット強化</button>
      <button class="button tavern-menu-button" data-action="bar-view" data-view="lifeline" type="button">ライフライン復旧</button>
      <button class="button tavern-menu-button" data-action="bar-view" data-view="ein-trace" type="button">アイン追跡</button>
      <button class="button tavern-menu-button" data-action="bar-view" data-view="quests" type="button">出撃準備</button>
    </section>
    <section class="panel panel-pad">
      <div class="section-head"><h2>ブリッジログ</h2><span>INFO</span></div>
      <div class="log-scroll">${logHtml("bar")}</div>
    </section>
  `;
}

function renderBridgeShipStatus() {
  const state = window.GameState;
  const ship = typeof window.ensureShipState === "function" ? window.ensureShipState() : state.ship || {};
  return `
    <section class="panel panel-pad">
      <div class="section-head"><h2>船団ステータス</h2><span>YGGDRASILL</span></div>
      <div class="compact-list">
        <div class="material-row"><span>漂流</span><strong>${formatNumber(ship.driftDay || 1)}日目</strong></div>
        <div class="material-row"><span>食料</span><strong>${formatNumber(ship.food || 0)}</strong></div>
        <div class="material-row"><span>エネルギー</span><strong>${formatNumber(ship.energy || 0)}</strong></div>
        <div class="material-row"><span>起床パイロット</span><strong>${formatNumber((state.pilots || []).length)}名</strong></div>
        <div class="material-row"><span>稼働機体</span><strong>${formatNumber((state.mechs || []).length)}機</strong></div>
        <div class="material-row"><span>アイン追跡率</span><strong>${Math.floor(Number(ship.einTrace || 0))}%</strong></div>
      </div>
    </section>
  `;
}

function renderPilotRankUpView() {
  const pilots = window.GameState.pilots || [];
  return `
    <section class="panel panel-pad">
      <div class="section-head">
        <h2>パイロット強化</h2>
        <button class="button" data-action="bar-view" data-view="home" type="button">戻る</button>
      </div>
      <div class="compact-list">${pilots.length ? pilots.map(renderPilotRankUpCard).join("") : `<div class="muted">対象パイロットがいません。</div>`}</div>
    </section>
  `;
}

function renderPilotRankUpCard(pilot) {
  if (typeof window.normalizePilotStatus === "function") window.normalizePilotStatus(pilot);
  const className = window.getPilotClassDisplayName(pilot.classId);
  const cap = typeof window.getPilotLevelCap === "function" ? window.getPilotLevelCap(pilot.rank) : 10;
  const requirement = typeof window.getPilotRankUpRequirement === "function" ? window.getPilotRankUpRequirement(pilot) : { nextRank: null, materials: [], message: "必要素材未設定" };
  const canRankUp = typeof window.canRankUpPilot === "function" && window.canRankUpPilot(pilot, window.GameState.materials);
  const requirementText = requirement.materials?.length
    ? requirement.materials.map((item) => {
      const material = typeof window.getMaterial === "function" ? window.getMaterial(item.id) : null;
      const owned = window.GameState.materials?.[item.id] || 0;
      return `${material?.name || item.id} ${owned}/${item.count}`;
    }).join(" / ")
    : requirement.generatedRequirement
      ? formatGeneratedRankupRequirement(requirement.generatedRequirement)
    : (requirement.message || "必要素材未設定");
  return `
    <article class="panel panel-pad">
      <div class="section-head"><h3>${pilot.name || "Pilot"}</h3><span>${className || "-"}</span></div>
      <div class="compact-list">
        <div class="material-row"><span>現在Rank</span><strong>${pilot.rank || "-"}</strong></div>
        <div class="material-row"><span>現在Lv / 上限</span><strong>${pilot.level || 1} / ${cap}</strong></div>
        <div class="material-row"><span>次Rank</span><strong>${requirement.nextRank || "なし"}</strong></div>
        <div class="material-row"><span>必要素材</span><strong>${requirementText}</strong></div>
      </div>
      <button class="button tavern-wide-action" data-action="rank-up-pilot" data-pilot="${pilot.id}" ${canRankUp ? "" : "disabled"} type="button">強化</button>
    </article>
  `;
}

function formatGeneratedRankupRequirement(requirement) {
  const planet = typeof window.getPlanetById === "function" ? window.getPlanetById(requirement.requiredPlanetId) : null;
  const quality = typeof window.getMaterialQualityMaster === "function" ? window.getMaterialQualityMaster(requirement.requiredQualityId) : null;
  const owned = countOwnedGeneratedRankupMaterials(requirement, false);
  const ownedBoss = countOwnedGeneratedRankupMaterials(requirement, true);
  const bossText = requirement.requiredBossMaterialCount > 0 ? ` / ボス素材 ${ownedBoss}/${requirement.requiredBossMaterialCount}` : "";
  return `${planet?.name || "ガイア"} ${quality?.name || requirement.requiredQualityId}以上 ${owned}/${requirement.requiredMaterialCount}${bossText}`;
}

function countOwnedGeneratedRankupMaterials(requirement, bossOnly) {
  const planetKey = { planet_001: "gaea", planet_002: "sandria", planet_003: "abyss", planet_004: "ignis", planet_005: "eden" }[requirement.requiredPlanetId];
  return Object.entries(window.GameState.materials || {}).reduce((sum, [id, count]) => {
    const material = typeof window.getMaterial === "function" ? window.getMaterial(id) : null;
    if (!material || Number(material.qualityScore || 0) < Number(requirement.requiredQualityScore || 1)) return sum;
    if (planetKey && !String(material.materialBaseId || "").startsWith(`${planetKey}_`)) return sum;
    if (bossOnly && material.sourceType !== "boss") return sum;
    if (!bossOnly && material.sourceType === "boss") return sum;
    return sum + Number(count || 0);
  }, 0);
}

window.rankUpPilotById = function rankUpPilotById(pilotId) {
  const pilot = window.getPilot(pilotId);
  if (!pilot || typeof window.rankUpPilot !== "function" || !window.rankUpPilot(pilot)) {
    logMessage("bar", "ランクアップ条件を満たしていません。", "danger");
    renderCurrentScene();
    return;
  }
  logMessage("bar", `${pilot.name}のP-Rankが${pilot.rank}になりました。`, "good");
  if (pilot.lastGainedTalent) {
    const master = typeof window.getTalentMaster === "function" ? window.getTalentMaster(pilot.lastGainedTalent.talentId) : null;
    logMessage("bar", `${pilot.name}は才能『${master?.name || master?.trait_name || pilot.lastGainedTalent.talentId}』を獲得した。`, "good");
    delete pilot.lastGainedTalent;
  }
  renderCurrentScene();
};

function renderHireView() {
  const state = window.GameState;
  return `
    <section class="panel panel-pad">
      <div class="section-head">
        <h2>解除候補</h2>
        <button class="button" data-action="bar-view" data-view="home" type="button">戻る</button>
      </div>
      <div class="tavern-sub-actions">
        <span class="muted">低リスク解除候補のみ表示</span>
        <button class="button" data-action="refresh-candidates" type="button">候補更新</button>
      </div>
      <div class="pilot-list">${state.tavernCandidates.map(renderCandidateCard).join("")}</div>
    </section>
  `;
}

function renderCandidateCard(pilot) {
  if (typeof window.normalizePilotStatus === "function") window.normalizePilotStatus(pilot);
  const className = window.getPilotClassDisplayName(pilot.classId);
  return `
    <article class="pilot-card panel">
      <div class="pilot-card-portrait">${window.renderPilotPortraitImage(pilot, "pilot-portrait--tavern-card")}</div>
      <div class="pilot-meta">
        <h3>${pilot.name}</h3>
        <div>RANK <strong>${pilot.rank}</strong></div>
        <div class="muted pilot-class-name">${className}</div>
      </div>
      <div class="cost-box">
        <span class="muted">解除コスト</span>
        <strong>食料 ${formatNumber(pilot.hireCost)}</strong>
        <button class="button" data-action="open-tavern-candidate-detail" data-pilot="${pilot.id}" type="button">詳細</button>
        <button class="button" data-action="hire" data-pilot="${pilot.id}" ${window.GameState.pilots.length >= 4 ? "disabled" : ""} type="button">解除</button>
      </div>
    </article>
  `;
}

function renderCandidateDetail() {
  const pilot = window.GameState.tavernCandidates.find((candidate) => candidate.id === window.GameState.selectedTavernCandidateId);
  if (!pilot) return renderHireView();
  if (typeof window.normalizePilotStatus === "function") window.normalizePilotStatus(pilot);
  const className = window.getPilotClassDisplayName(pilot.classId);
  const classRole = window.getPilotClassRole(pilot.classId);
  const skills = typeof window.getLearnedPilotSkills === "function" ? window.getLearnedPilotSkills(pilot) : [];
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
          <div class="material-row"><span>解除コスト</span><strong>食料 ${formatNumber(pilot.hireCost)}</strong></div>
        </div>
      </div>
      <div class="section-head" style="margin-top:10px"><h3>スキル / 才能</h3></div>
      <div class="compact-list">${skills.length ? skills.map(renderSkillDetail).join("") : `<div class="material-row"><span>初期スキル</span><strong>なし</strong></div>`}</div>
      <button class="button tavern-wide-action" data-action="hire" data-pilot="${pilot.id}" ${window.GameState.pilots.length >= 4 ? "disabled" : ""} type="button">コールドスリープを解除</button>
    </section>
  `;
}

function renderSkillDetail(skill) {
  const name = skill.skill_name || skill.name || skill.id;
  const detail = skill.description || skill.effect_type || skill.type || "";
  const isTalent = skill.source === "trait" || skill.source === "talent";
  const tier = skill.tier || (isTalent ? "才能" : "-");
  return `
    <div class="material-row">
      <span>${name}<br><span class="muted">${detail}</span></span>
      <strong>${isTalent ? tier : `Tier ${tier}`}</strong>
    </div>
  `;
}

function renderTavernQuests() {
  const availablePlanets = window.PlanetMaster.filter((planet) => window.isPlanetUnlocked(planet));
  return `
    <section class="panel panel-pad">
      <div class="section-head">
        <h2>出撃準備</h2>
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
      <button class="button tavern-wide-action" data-action="accept-tavern-quest" data-planet="${planet.id}" type="button">出撃する</button>
    </article>
  `;
}

function renderLifelineView() {
  const ship = typeof window.ensureShipState === "function" ? window.ensureShipState() : window.GameState.ship || {};
  return `
    <section class="panel panel-pad">
      <div class="section-head">
        <h2>ライフライン復旧</h2>
        <button class="button" data-action="bar-view" data-view="home" type="button">戻る</button>
      </div>
      <div class="compact-list">
        ${Object.entries(BRIDGE_FACILITY_CONFIG).map(([facilityId, config]) => renderFacilityCard(facilityId, config, ship)).join("")}
      </div>
    </section>
  `;
}

function renderFacilityCard(facilityId, config, ship) {
  const level = Number(ship.facilities?.[facilityId] || 0);
  const cost = getFacilityRepairCost(facilityId);
  return `
    <article class="panel panel-pad">
      <div class="section-head"><h3>${config.name}</h3><span>Lv ${level}</span></div>
      <p class="muted">${config.description}</p>
      <div class="material-row"><span>復旧コスト</span><strong>${formatNumber(cost)} G</strong></div>
      <button class="button tavern-wide-action" data-action="repair-ship-facility" data-facility="${facilityId}" type="button">復旧する</button>
    </article>
  `;
}

function getFacilityRepairCost(facilityId) {
  const ship = typeof window.ensureShipState === "function" ? window.ensureShipState() : window.GameState.ship || {};
  const level = Number(ship.facilities?.[facilityId] || 0);
  return 300 + level * 200;
}

window.repairShipFacility = function repairShipFacility(facilityId) {
  const state = window.GameState;
  const ship = typeof window.ensureShipState === "function" ? window.ensureShipState() : state.ship;
  const config = BRIDGE_FACILITY_CONFIG[facilityId];
  if (!config || !ship) return;
  const cost = getFacilityRepairCost(facilityId);
  if (state.money < cost) {
    logMessage("bar", "復旧に必要な資金が足りません。", "danger");
    renderCurrentScene();
    return;
  }
  state.money -= cost;
  ship.facilities[facilityId] = Number(ship.facilities[facilityId] || 0) + 1;
  Object.entries(config.effects || {}).forEach(([key, value]) => {
    ship[key] = Number(ship[key] || 0) + Number(value || 0);
  });
  logMessage("bar", `${config.name}をLv${ship.facilities[facilityId]}へ復旧した。`, "good");
  renderCurrentScene();
};

function renderEinTraceView() {
  const ship = typeof window.ensureShipState === "function" ? window.ensureShipState() : window.GameState.ship || {};
  return `
    <section class="panel panel-pad">
      <div class="section-head">
        <h2>アイン追跡</h2>
        <button class="button" data-action="bar-view" data-view="home" type="button">戻る</button>
      </div>
      <div class="compact-list">
        <div class="material-row"><span>アイン追跡率</span><strong>${Math.floor(Number(ship.einTrace || 0))}%</strong></div>
        <div class="material-row"><span>現在の目的</span><strong>ガイア深層の信号痕跡を探索</strong></div>
      </div>
      <section class="panel panel-pad" style="margin-top:10px">
        <div class="section-head"><h3>解析ログ</h3><span>ZWEI</span></div>
        <p class="muted">アインの信号痕跡はまだ薄い。ガイア深層の探索が必要です。</p>
      </section>
    </section>
  `;
}

window.App.scenes.bar = window.renderBar;
