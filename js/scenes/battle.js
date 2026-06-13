"use strict";

window.startBattle = function startBattle() {
  const planet = typeof window.getSelectedPlanet === "function" ? window.getSelectedPlanet() : null;
  const planetMaterials = planet?.materialPool || [];
  const candidates = planetMaterials.length
    ? window.EnemyCatalog.filter((enemy) => enemy.drops?.some((dropId) => planetMaterials.includes(dropId)))
    : window.EnemyCatalog;
  const pool = candidates.length ? candidates : window.EnemyCatalog;
  const template = pool[Math.floor(Math.random() * pool.length)];
  window.GameState.battle = {
    enemy: { ...template },
    turn: 1,
    message: "コマンドを選択してください",
    guarded: false
  };
  window.GameState.logs.battle = [];
  logMessage("battle", `${template.name}と遭遇した。`, "danger");
};

window.renderBattle = function renderBattle() {
  const state = window.GameState;
  if (!state.battle) startBattle();
  const battle = state.battle;
  const enemy = battle.enemy;
  const enemyHpPercent = Math.max(0, (enemy.hp / enemy.maxHp) * 100);
  window.App.root.innerHTML = `
    ${renderHeader("BATTLE", "戦闘中", `<div class="resource"><small>燃料残量</small><strong>${state.fuel.toFixed(1)} / 100</strong></div>`)}
    <section class="battle-view panel">
      <div class="cockpit-background-layer"></div>
      <div class="enemy-shape"></div>
      <img class="cockpit-frame-layer" src="ui/cockpit_frame.png" alt="" aria-hidden="true">
      <div class="enemy-card panel panel-pad">
        <div class="section-head"><h2>${enemy.name}</h2><span>Lv. ${enemy.level}</span></div>
        <div>HP ${formatNumber(enemy.hp)} / ${formatNumber(enemy.maxHp)}</div>
        <div class="bar" style="--value:${enemyHpPercent}%"><span></span></div>
        <div class="tag-row" style="margin-top:8px"><span class="tag">${enemy.type}</span><span class="tag">単体</span></div>
      </div>
    </section>
    <section class="battle-side">
      <div class="panel panel-pad">
        <div class="section-head"><h2>戦況ログ</h2><span>TURN ${String(battle.turn).padStart(2, "0")}</span></div>
        <div class="log-panel">${logHtml("battle")}</div>
      </div>
      <div class="panel panel-pad">
        <div class="section-head"><h2>敵情報</h2><span>${enemy.type}</span></div>
        <div class="stat-row"><span>攻撃力</span><strong>${enemy.atk}</strong></div>
        <div class="stat-row"><span>防御力</span><strong>${enemy.def}</strong></div>
        <div class="section-head" style="margin-top:10px"><h3>ドロップ情報</h3></div>
        ${enemy.drops.map((id) => {
          const material = getMaterial(id);
          return `<div class="material-row"><span>${material.name}</span><span>${material.rank}</span></div>`;
        }).join("")}
      </div>
    </section>
    <div class="command-grid">
      <button class="button" data-action="battle-attack"><span class="cmd-icon">◎</span>攻撃</button>
      <button class="button" data-action="battle-skill"><span class="cmd-icon">✶</span>スキル<br><span class="muted">燃料 -2</span></button>
      <button class="button" data-action="battle-defend"><span class="cmd-icon">□</span>防御</button>
      <button class="button" data-action="battle-overdrive"><span class="cmd-icon">◇</span>OD<br><span class="muted">燃料 -5</span></button>
      <button class="button danger" data-action="battle-run"><span class="cmd-icon">↪</span>逃走<br><span class="muted">70%</span></button>
    </div>
    <section class="panel panel-pad">
      <div class="section-head"><h2>味方${state.mechs.length}機</h2><span>${battle.message}</span></div>
      <div class="ally-grid">${state.mechs.map(renderAllyCard).join("")}</div>
    </section>
  `;
};

function renderAllyCard(mech) {
  const pilot = displayPilot(mech.pilotId);
  return `
    <article class="ally-card panel">
      <div class="section-head"><h3>${mech.name}</h3><span class="status-pill">${mech.hp > 0 ? "行動可能" : "大破"}</span></div>
      <div class="muted">${pilot.name}</div>
      <div>HP ${formatNumber(mech.hp)} / ${formatNumber(mech.maxHp)}</div>
      <div class="bar" style="--value:${Math.max(0, (mech.hp / mech.maxHp) * 100)}%"><span></span></div>
      <div class="stat-row"><span>攻撃力</span><strong>${mech.atk}</strong></div>
      <div class="stat-row"><span>防御力</span><strong>${mech.def}</strong></div>
      <div class="stat-row"><span>機動力</span><strong>${mech.mobility}</strong></div>
    </article>
  `;
}

window.battleCommand = function battleCommand(type) {
  const state = window.GameState;
  if (!state.battle) return;
  if (type === "run") {
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
  if (type === "skill" && !spendBattleFuel(2)) return;
  if (type === "overdrive" && !spendBattleFuel(5)) return;
  if (type === "defend") {
    state.battle.guarded = true;
    logMessage("battle", "全機、防御態勢を取った。", "good");
    enemyTurn();
    renderCurrentScene();
    return;
  }
  const multiplier = type === "overdrive" ? 1.9 : type === "skill" ? 1.35 : 1;
  const label = type === "overdrive" ? "オーバードライブ" : type === "skill" ? "スキル" : "攻撃";
  state.mechs.filter((mech) => mech.hp > 0).forEach((mech) => {
    const damage = Math.max(18, Math.floor((mech.atk * multiplier) - state.battle.enemy.def + Math.random() * 45));
    state.battle.enemy.hp = Math.max(0, state.battle.enemy.hp - damage);
    logMessage("battle", `${mech.name}の${label}。${damage}ダメージ。`, damage > 520 ? "warn" : "");
  });
  if (state.battle.enemy.hp <= 0) {
    winBattle();
    return;
  }
  enemyTurn();
  renderCurrentScene();
};

function spendBattleFuel(amount) {
  const state = window.GameState;
  if (state.fuel < amount) {
    logMessage("battle", "燃料が足りない。", "danger");
    renderCurrentScene();
    return false;
  }
  state.fuel = Math.max(0, +(state.fuel - amount).toFixed(1));
  return true;
}

function enemyTurn() {
  const state = window.GameState;
  const battle = state.battle;
  const alive = state.mechs.filter((mech) => mech.hp > 0);
  if (!alive.length) {
    forceReturn("味方が全滅した。", true);
    return;
  }
  const target = alive[Math.floor(Math.random() * alive.length)];
  const guardRate = battle.guarded ? 0.45 : 1;
  const damage = Math.max(8, Math.floor((battle.enemy.atk - target.def * 0.22 + Math.random() * 38) * guardRate));
  target.hp = Math.max(0, target.hp - damage);
  logMessage("battle", `${battle.enemy.name}の反撃。${target.name}に${damage}ダメージ。`, "danger");
  battle.guarded = false;
  battle.turn += 1;
  battle.message = `TURN ${battle.turn}`;
  if (state.mechs.every((mech) => mech.hp <= 0)) forceReturn("味方が全滅した。", true);
}

function winBattle() {
  const state = window.GameState;
  const enemy = state.battle.enemy;
  enemy.drops.forEach((id) => {
    if (Math.random() < 0.72) state.runMaterials[id] = (state.runMaterials[id] || 0) + 1;
  });
  logMessage("quest", `${enemy.name}を撃破。素材を回収した。`, "good");
  state.battle = null;
  state.currentScene = "quest";
  renderCurrentScene();
}

window.App.scenes.battle = window.renderBattle;
