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
          <h2>保存データ</h2>
          <p class="muted">表示が古い、初期機体がいない、画面が戻る場合はリセットしてください。</p>
          <div class="material-row"><span>CSV読み込み</span><strong>${state.masterLoadMode || "pending"}</strong></div>
          <div class="material-row"><span>保存キー</span><strong>${window.PLAYER_SAVE_KEY}</strong></div>
          <div class="material-row"><span>保存状態</span><strong>${state.storage?.available ? "localStorage" : "unavailable"}</strong></div>
          <div class="material-row"><span>プレイヤー</span><strong>${state.player?.name || "-"}</strong></div>
          <div class="material-row"><span>パイロット</span><strong>${state.pilots.length} / 4</strong></div>
          <div class="material-row"><span>機体</span><strong>${state.mechs.length} / 4</strong></div>
          <button class="button danger tavern-wide-action" data-action="reset-player-save" type="button">セーブデータをリセット</button>
        </div>
      </section>
    </section>
  `;
};

window.resetPlayerSaveAndReload = async function resetPlayerSaveAndReload() {
  const confirmed = window.confirm("セーブデータを削除して初期状態に戻します。よろしいですか？");
  if (!confirmed) return;
  try {
    if (typeof window.deletePlayerSave === "function") window.deletePlayerSave();
    else window.localStorage?.removeItem?.(window.PLAYER_SAVE_KEY);
    if (window.sessionStorage) window.sessionStorage.clear();
    if (window.caches?.keys) {
      const keys = await window.caches.keys();
      await Promise.all(keys.map((key) => window.caches.delete(key)));
    }
    if (window.navigator?.serviceWorker?.getRegistrations) {
      const registrations = await window.navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map((registration) => registration.unregister()));
    }
    if (typeof window.resetPlayerDataToStarter === "function") window.resetPlayerDataToStarter();
  } catch (error) {
    console.warn("Reset failed", error);
  }
  window.location.replace(`${window.location.pathname}?reset=${Date.now()}`);
};

window.App.scenes.menu = window.renderMenu;
