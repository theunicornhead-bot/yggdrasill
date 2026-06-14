"use strict";

function battleNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function clampBattleValue(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function cloneBattleStats(stats = {}) {
  return {
    hp: Math.max(0, Math.floor(battleNumber(stats.hp, 0))),
    pp: Math.max(0, Math.floor(battleNumber(stats.pp, 0))),
    sAtk: Math.max(0, Math.floor(battleNumber(stats.sAtk, 0))),
    mAtk: Math.max(0, Math.floor(battleNumber(stats.mAtk, 0))),
    lAtk: Math.max(0, Math.floor(battleNumber(stats.lAtk, 0))),
    sDef: Math.max(0, Math.floor(battleNumber(stats.sDef, 0))),
    mDef: Math.max(0, Math.floor(battleNumber(stats.mDef, 0))),
    lDef: Math.max(0, Math.floor(battleNumber(stats.lDef, 0))),
    speed: Math.max(0, Math.floor(battleNumber(stats.speed, 0))),
    element: stats.element || "none"
  };
}

function createAllyBattleUnit(mech) {
  const pilot = getPilot(mech?.pilotId);
  if (!mech || !pilot) return null;
  if (typeof window.normalizeMachineStatus === "function") window.normalizeMachineStatus(mech);
  if (typeof window.normalizePilotStatus === "function") window.normalizePilotStatus(pilot);
  const stats = cloneBattleStats(typeof window.calculateUnitStats === "function" ? window.calculateUnitStats(pilot, mech) : mech.stats);
  const maxHp = Math.max(1, stats.hp);
  const maxPp = Math.max(0, stats.pp);
  const currentHp = clampBattleValue(Math.floor(battleNumber(mech.currentHp ?? mech.hp, maxHp)), 0, maxHp);
  const currentPp = clampBattleValue(Math.floor(battleNumber(mech.currentPp ?? mech.pp, maxPp)), 0, maxPp);
  const overdrive = clampBattleValue(Math.floor(battleNumber(mech.overdrive, 0)), 0, 100);
  return {
    id: `ally:${mech.id}`,
    side: "ally",
    sourceType: "machine",
    machineId: mech.id,
    pilotId: pilot.id,
    name: mech.name || "Machine",
    pilotName: pilot.name || "Pilot",
    stats,
    currentHp,
    maxHp,
    currentPp,
    maxPp,
    overdrive,
    statusAilments: [],
    buffs: [],
    isDefending: false,
    isDefeated: currentHp <= 0,
    weapon: typeof window.getMainWeapon === "function" ? window.getMainWeapon(mech) : mech.mainWeapon
  };
}

function createEnemyBattleUnit(template, floor) {
  const stats = cloneBattleStats(typeof window.generateEnemyStats === "function" ? window.generateEnemyStats(template, floor) : template);
  const maxHp = Math.max(1, Math.floor(battleNumber(template.maxHp ?? template.hp, stats.hp)));
  const currentHp = clampBattleValue(Math.floor(battleNumber(template.hp, maxHp)), 0, maxHp);
  return {
    id: "enemy:0",
    side: "enemy",
    sourceType: "enemy",
    enemyId: template.id || template.name || "enemy",
    name: template.name || "Enemy",
    level: Math.max(1, Math.floor(battleNumber(template.level, floor))),
    type: template.type || "enemy",
    drops: Array.isArray(template.drops) ? [...template.drops] : [],
    stats: { ...stats, element: template.element || "none" },
    currentHp,
    maxHp,
    currentPp: Math.max(0, Math.floor(battleNumber(template.pp, stats.pp))),
    maxPp: Math.max(0, Math.floor(battleNumber(template.pp, stats.pp))),
    overdrive: 0,
    statusAilments: [],
    buffs: [],
    isDefending: false,
    isDefeated: currentHp <= 0,
    weapon: {
      id: `${template.id || "enemy"}_weapon`,
      name: template.weaponName || "敵攻撃",
      weaponType: typeof window.normalizeWeaponType === "function" ? window.normalizeWeaponType(template.weaponType || template.rangeType || "melee") : "melee",
      element: template.element || "none",
      power: Math.max(1, Math.floor(battleNumber(template.weaponPower, Math.max(1, (template.level || floor || 1) * 3)))),
      ppCost: 0
    }
  };
}

function getBattleUnits() {
  return Array.isArray(window.GameState?.battle?.battleUnits) ? window.GameState.battle.battleUnits : [];
}

function getAliveBattleUnits(side = "") {
  return getBattleUnits().filter((unit) => (!side || unit.side === side) && !unit.isDefeated && unit.currentHp > 0);
}

function getPrimaryEnemyUnit() {
  return getAliveBattleUnits("enemy")[0] || getBattleUnits().find((unit) => unit.side === "enemy") || null;
}

function buildTurnQueue(units) {
  return units
    .filter((unit) => !unit.isDefeated && unit.currentHp > 0)
    .sort((a, b) => (b.stats?.speed || 0) - (a.stats?.speed || 0))
    .map((unit) => unit.id);
}

function refreshTurnQueue() {
  const battle = window.GameState.battle;
  if (!battle) return [];
  battle.turnQueue = buildTurnQueue(battle.battleUnits || []);
  return battle.turnQueue;
}

function mirrorEnemyForLegacyUi(enemyUnit) {
  if (!enemyUnit) return null;
  return {
    name: enemyUnit.name,
    level: enemyUnit.level || 1,
    type: enemyUnit.type || "enemy",
    drops: Array.isArray(enemyUnit.drops) ? enemyUnit.drops : [],
    hp: enemyUnit.currentHp,
    maxHp: enemyUnit.maxHp,
    pp: enemyUnit.currentPp,
    maxPp: enemyUnit.maxPp,
    sAtk: enemyUnit.stats?.sAtk || 0,
    mAtk: enemyUnit.stats?.mAtk || 0,
    lAtk: enemyUnit.stats?.lAtk || 0,
    sDef: enemyUnit.stats?.sDef || 0,
    mDef: enemyUnit.stats?.mDef || 0,
    lDef: enemyUnit.stats?.lDef || 0,
    speed: enemyUnit.stats?.speed || 0,
    atk: Math.max(enemyUnit.stats?.sAtk || 0, enemyUnit.stats?.mAtk || 0, enemyUnit.stats?.lAtk || 0),
    def: Math.max(enemyUnit.stats?.sDef || 0, enemyUnit.stats?.mDef || 0, enemyUnit.stats?.lDef || 0),
    weaponType: enemyUnit.weapon?.weaponType || "melee",
    element: enemyUnit.weapon?.element || "none"
  };
}

function syncBattleUnitToMech(unit) {
  if (!unit || unit.side !== "ally") return;
  const mech = getMech(unit.machineId);
  if (!mech) return;
  mech.currentHp = clampBattleValue(Math.floor(battleNumber(unit.currentHp, 0)), 0, unit.maxHp);
  mech.hp = mech.currentHp;
  mech.maxHp = Math.max(1, unit.maxHp);
  mech.currentPp = clampBattleValue(Math.floor(battleNumber(unit.currentPp, 0)), 0, unit.maxPp);
  mech.pp = mech.currentPp;
  mech.maxPp = Math.max(0, unit.maxPp);
  mech.overdrive = clampBattleValue(Math.floor(battleNumber(unit.overdrive, 0)), 0, 100);
  mech.isDefeated = Boolean(unit.isDefeated || unit.currentHp <= 0);
}

window.syncBattleUnitsToMechs = function syncBattleUnitsToMechs() {
  getBattleUnits().forEach(syncBattleUnitToMech);
};

function spendUnitPp(unit, amount) {
  const cost = Math.max(0, Math.floor(battleNumber(amount, 0)));
  if (cost <= 0) return true;
  if (unit.currentPp < cost) return false;
  unit.currentPp = Math.max(0, unit.currentPp - cost);
  syncBattleUnitToMech(unit);
  return true;
}

function gainUnitOverdrive(unit, amount) {
  if (!unit) return 0;
  if (typeof window.gainOverdrive === "function") return window.gainOverdrive(unit, amount);
  unit.overdrive = clampBattleValue(Math.floor(battleNumber(unit.overdrive, 0) + battleNumber(amount, 0)), 0, 100);
  return unit.overdrive;
}

function applyBattleDamage(target, damage) {
  const safeDamage = Math.max(1, Math.floor(battleNumber(damage, 1)));
  target.currentHp = Math.max(0, target.currentHp - safeDamage);
  target.isDefeated = target.currentHp <= 0;
  syncBattleUnitToMech(target);
  return safeDamage;
}

function clearDefending(side = "ally") {
  getBattleUnits().forEach((unit) => {
    if (!side || unit.side === side) unit.isDefending = false;
  });
}

window.startBattle = function startBattle() {
  const state = window.GameState;
  const allyUnits = (typeof window.getSortieUnits === "function" ? window.getSortieUnits() : state.mechs.slice(0, 4))
    .map(createAllyBattleUnit)
    .filter(Boolean);
  if (!allyUnits.length || allyUnits.every((unit) => unit.isDefeated)) {
    logMessage("quest", "戦闘可能な味方機がありません。", "danger");
    return false;
  }

  const planet = typeof window.getSelectedPlanet === "function" ? window.getSelectedPlanet() : null;
  const planetMaterials = planet?.materialPool || [];
  const candidates = planetMaterials.length
    ? window.EnemyCatalog.filter((enemy) => enemy.drops?.some((dropId) => planetMaterials.includes(dropId)))
    : window.EnemyCatalog;
  const pool = candidates.length ? candidates : window.EnemyCatalog;
  const template = pool[Math.floor(Math.random() * pool.length)];
  const floor = state.quest?.floor || 1;
  const enemyUnit = createEnemyBattleUnit(template, floor);
  const battleUnits = [...allyUnits, enemyUnit];
  state.battle = {
    battleUnits,
    turnQueue: buildTurnQueue(battleUnits),
    turn: 1,
    message: "コマンドを選択してください",
    guarded: false,
    enemy: mirrorEnemyForLegacyUi(enemyUnit)
  };
  state.logs.battle = [];
  logMessage("battle", `${enemyUnit.name}と遭遇した。`, "danger");
  return true;
};

window.renderBattle = function renderBattle() {
  const state = window.GameState;
  if (!state.battle && !startBattle()) return;
  const battle = state.battle;
  const enemyUnit = getPrimaryEnemyUnit();
  if (!enemyUnit) {
    winBattle();
    return;
  }
  const allyUnits = getBattleUnits().filter((unit) => unit.side === "ally");
  const enemyHpPercent = Math.max(0, (enemyUnit.currentHp / Math.max(1, enemyUnit.maxHp)) * 100);
  window.App.root.innerHTML = `
    ${renderHeader("BATTLE", "戦闘中", `<div class="resource"><small>燃料残量</small><strong>${state.fuel.toFixed(1)} / 100</strong></div>`)}
    <section class="battle-view panel">
      <div class="cockpit-background-layer"></div>
      <div class="enemy-shape"></div>
      <img class="cockpit-frame-layer" src="ui/cockpit_frame.png" alt="" aria-hidden="true">
      <div class="enemy-card panel panel-pad">
        <div class="section-head"><h2>${enemyUnit.name}</h2><span>Lv. ${enemyUnit.level || 1}</span></div>
        <div>HP ${formatNumber(enemyUnit.currentHp)} / ${formatNumber(enemyUnit.maxHp)}</div>
        <div class="bar" style="--value:${enemyHpPercent}%"><span></span></div>
        <div class="tag-row" style="margin-top:8px"><span class="tag">${enemyUnit.type || "enemy"}</span><span class="tag">単体</span></div>
      </div>
    </section>
    <section class="battle-side">
      <div class="panel panel-pad">
        <div class="section-head"><h2>戦況ログ</h2><span>TURN ${String(battle.turn || 1).padStart(2, "0")}</span></div>
        <div class="log-panel">${logHtml("battle")}</div>
      </div>
      <div class="panel panel-pad">
        <div class="section-head"><h2>敵情報</h2><span>${enemyUnit.type || "enemy"}</span></div>
        <div class="stat-row"><span>攻撃力</span><strong>${formatNumber(Math.max(enemyUnit.stats.sAtk, enemyUnit.stats.mAtk, enemyUnit.stats.lAtk))}</strong></div>
        <div class="stat-row"><span>防御力</span><strong>${formatNumber(Math.max(enemyUnit.stats.sDef, enemyUnit.stats.mDef, enemyUnit.stats.lDef))}</strong></div>
        <div class="section-head" style="margin-top:10px"><h3>ドロップ情報</h3></div>
        ${(enemyUnit.drops || []).map((id) => {
          const material = getMaterial(id) || { name: id, rank: "-" };
          return `<div class="material-row"><span>${material.name}</span><span>${material.rank}</span></div>`;
        }).join("") || `<div class="material-row"><span>なし</span><span>-</span></div>`}
      </div>
    </section>
    <div class="command-grid">
      <button class="button" data-action="battle-attack"><span class="cmd-icon">◎</span>攻撃</button>
      <button class="button" data-action="battle-skill"><span class="cmd-icon">✶</span>スキル<br><span class="muted">PP消費</span></button>
      <button class="button" data-action="battle-defend"><span class="cmd-icon">□</span>防御</button>
      <button class="button" data-action="battle-overdrive"><span class="cmd-icon">◇</span>OD<br><span class="muted">100%</span></button>
      <button class="button danger" data-action="battle-run"><span class="cmd-icon">↪</span>逃走<br><span class="muted">70%</span></button>
    </div>
    <section class="panel panel-pad">
      <div class="section-head"><h2>味方${allyUnits.length}機</h2><span>${battle.message || ""}</span></div>
      <div class="ally-grid">${allyUnits.map(renderAllyCard).join("")}</div>
    </section>
  `;
};

function renderAllyCard(unit) {
  const hpPercent = Math.max(0, (unit.currentHp / Math.max(1, unit.maxHp)) * 100);
  const ppText = `${formatNumber(unit.currentPp)} / ${formatNumber(unit.maxPp)}`;
  const odText = `${formatNumber(unit.overdrive || 0)}%`;
  const statusText = unit.isDefeated ? "大破" : unit.isDefending ? "防御中" : "行動可能";
  return `
    <article class="ally-card panel">
      <div class="section-head"><h3>${unit.name || "Machine"}</h3><span class="status-pill">${statusText}</span></div>
      <div class="muted">${unit.pilotName || "パイロット未搭乗"}</div>
      <div>HP ${formatNumber(unit.currentHp)} / ${formatNumber(unit.maxHp)}</div>
      <div class="bar" style="--value:${hpPercent}%"><span></span></div>
      <div class="stat-row"><span>PP</span><strong>${ppText}</strong></div>
      <div class="stat-row"><span>OD</span><strong>${odText}</strong></div>
      <div class="stat-row"><span>SPEED</span><strong>${formatNumber(unit.stats?.speed || 0)}</strong></div>
    </article>
  `;
}

window.battleCommand = function battleCommand(type) {
  const state = window.GameState;
  if (!state.battle) return;
  const enemyUnit = getPrimaryEnemyUnit();
  if (!enemyUnit) {
    winBattle();
    return;
  }

  if (type === "run") {
    window.syncBattleUnitsToMechs();
    if (Math.random() < 0.7) {
      logMessage("quest", "戦闘から離脱した。", "warn");
      state.battle = null;
      state.currentScene = "quest";
      renderCurrentScene();
      return;
    }
    logMessage("battle", "逃走に失敗した。", "danger");
    enemyTurn();
    renderCurrentScene();
    return;
  }

  if (type === "defend") {
    getAliveBattleUnits("ally").forEach((unit) => {
      unit.isDefending = true;
      gainUnitOverdrive(unit, 5);
      syncBattleUnitToMech(unit);
    });
    state.battle.guarded = true;
    logMessage("battle", "全機、防御態勢を取った。", "good");
    enemyTurn();
    renderCurrentScene();
    return;
  }

  const multiplier = type === "overdrive" ? 1.9 : type === "skill" ? 1.35 : 1;
  const label = type === "overdrive" ? "オーバードライブ" : type === "skill" ? "スキル" : "攻撃";
  const queue = refreshTurnQueue();
  queue
    .map((unitId) => getBattleUnits().find((unit) => unit.id === unitId))
    .filter((unit) => unit?.side === "ally" && !unit.isDefeated && unit.currentHp > 0)
    .forEach((unit) => {
      const currentEnemy = getPrimaryEnemyUnit();
      if (!currentEnemy || currentEnemy.isDefeated) return;
      const weapon = unit.weapon || { weaponType: "melee", power: 0, ppCost: 0 };
      const ppCost = type === "skill" ? Math.max(4, battleNumber(weapon.ppCost, 0) + 4) : type === "attack" ? battleNumber(weapon.ppCost, 0) : 0;
      if (type === "overdrive") {
        const canUse = typeof window.canUseOverdrive === "function" ? window.canUseOverdrive(unit) : unit.overdrive >= 100;
        if (!canUse) {
          logMessage("battle", `${unit.name}はODゲージが足りない。`, "warn");
          return;
        }
        unit.overdrive = 0;
      }
      if (!spendUnitPp(unit, ppCost)) {
        logMessage("battle", `${unit.name}はPPが足りない。`, "warn");
        return;
      }
      const damage = typeof window.calculateDamage === "function"
        ? window.calculateDamage(unit.stats, currentEnemy.stats, weapon, { multiplier, critical: Math.random() < 0.05, defenderElement: currentEnemy.stats?.element })
        : Math.max(1, Math.floor(Math.max(unit.stats.sAtk, unit.stats.mAtk, unit.stats.lAtk) * multiplier));
      applyBattleDamage(currentEnemy, damage);
      gainUnitOverdrive(unit, type === "skill" ? 18 : type === "attack" ? 12 : 8);
      syncBattleUnitToMech(unit);
      state.battle.enemy = mirrorEnemyForLegacyUi(currentEnemy);
      logMessage("battle", `${unit.name}の${label}。${damage}ダメージ。`, damage > 520 ? "warn" : "");
    });

  if (!getAliveBattleUnits("enemy").length) {
    winBattle();
    return;
  }
  enemyTurn();
  renderCurrentScene();
};

function enemyTurn() {
  const state = window.GameState;
  const battle = state.battle;
  const enemyUnit = getPrimaryEnemyUnit();
  const aliveAllies = getAliveBattleUnits("ally");
  if (!enemyUnit || !aliveAllies.length) {
    window.syncBattleUnitsToMechs();
    forceReturn("味方が全滅した。", true);
    return;
  }
  const queue = refreshTurnQueue();
  const enemyActs = queue.includes(enemyUnit.id);
  if (!enemyActs) return;
  const target = aliveAllies[Math.floor(Math.random() * aliveAllies.length)];
  const damage = typeof window.calculateDamage === "function"
    ? window.calculateDamage(enemyUnit.stats, target.stats, enemyUnit.weapon, { defending: target.isDefending, critical: Math.random() < 0.05 })
    : Math.max(1, Math.floor(Math.max(enemyUnit.stats.sAtk, enemyUnit.stats.mAtk, enemyUnit.stats.lAtk)));
  applyBattleDamage(target, damage);
  gainUnitOverdrive(target, 8);
  gainUnitOverdrive(enemyUnit, 8);
  logMessage("battle", `${enemyUnit.name}の反撃。${target.name}に${damage}ダメージ。`, "danger");
  clearDefending("ally");
  battle.guarded = false;
  battle.turn = Math.max(1, battleNumber(battle.turn, 1) + 1);
  battle.message = `TURN ${battle.turn}`;
  battle.enemy = mirrorEnemyForLegacyUi(enemyUnit);
  refreshTurnQueue();
  window.syncBattleUnitsToMechs();
  if (!getAliveBattleUnits("ally").length) forceReturn("味方が全滅した。", true);
}

function winBattle() {
  const state = window.GameState;
  const enemyUnit = getPrimaryEnemyUnit() || getBattleUnits().find((unit) => unit.side === "enemy");
  if (!enemyUnit) return;
  (enemyUnit.drops || []).forEach((id) => {
    if (Math.random() < 0.72) state.runMaterials[id] = (state.runMaterials[id] || 0) + 1;
  });
  getBattleUnits().filter((unit) => unit.side === "ally").forEach((unit) => {
    const pilot = getPilot(unit.pilotId);
    if (pilot && typeof window.addPilotExp === "function") window.addPilotExp(pilot, 35 + Number(enemyUnit.level || 1) * 8);
    unit.isDefending = false;
    syncBattleUnitToMech(unit);
  });
  logMessage("quest", `${enemyUnit.name}を撃破。素材を回収した。`, "good");
  state.battle = null;
  state.currentScene = "quest";
  renderCurrentScene();
}

window.App.scenes.battle = window.renderBattle;
