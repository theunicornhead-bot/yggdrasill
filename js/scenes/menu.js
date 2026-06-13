"use strict";

window.renderMenu = function renderMenu() {
  const state = window.GameState;
  window.App.root.innerHTML = `
    ${renderHeader("メニュー", "MENU")}
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
  `;
};

window.App.scenes.menu = window.renderMenu;
