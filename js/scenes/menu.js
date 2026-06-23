"use strict";

window.renderMenu = function renderMenu() {
  const state = window.GameState;
  const scenario = typeof window.ensureScenarioState === "function" ? window.ensureScenarioState() : state.scenario || {};
  const prologueSeen = Boolean(scenario.seen?.prologue_001);
  window.App.root.innerHTML = `
    ${renderHeader("メニュー", "MENU")}
    <section class="menu-debug-layout">
      <section class="panel panel-pad">
        <div class="section-head">
          <h2>シナリオ確認</h2>
          <span>${prologueSeen ? "既読" : "未読"}</span>
        </div>
        <div class="compact-list">
          <div class="material-row"><span>テストシナリオ</span><strong>prologue_001</strong></div>
          <button class="button tavern-wide-action" data-action="scenario-start" data-scenario="prologue_001" data-return-scene="menu" type="button">プロローグを再生</button>
          <button class="button danger tavern-wide-action" data-action="scenario-reset-seen" data-scenario="prologue_001" type="button">プロローグ既読をリセット</button>
        </div>
      </section>
      <section class="placeholder-screen panel panel-pad">
      <div>
        <h2>メニュー</h2>
        <p class="muted">セーブ、設定、図鑑などの入口になる仮画面です。</p>
        <div class="material-row"><span>CSV読み込み</span><strong>${state.masterLoadMode || "pending"}</strong></div>
        <div class="material-row"><span>保存キー</span><strong>${window.PLAYER_SAVE_KEY}</strong></div>
        <div class="material-row"><span>保存状態</span><strong>${state.storage?.available ? "localStorage" : "unavailable"}</strong></div>
        <div class="material-row"><span>プレイヤー</span><strong>${state.player?.name || "-"}</strong></div>
        <div class="material-row"><span>パイロット</span><strong>${state.pilots.length} / 4</strong></div>
        <div class="material-row"><span>機体</span><strong>${state.mechs.length} / 4</strong></div>
      </div>
      </section>
    </section>
  `;
};

window.App.scenes.menu = window.renderMenu;
