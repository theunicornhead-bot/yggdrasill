"use strict";

const FALLBACK_MARKET_ITEMS = [
  { itemId: "repair_kit_s", name: "応急修復キットS", effectType: "hpRecover", power: "300", price: "120", target: "ally", description: "味方単体のHPを回復" },
  { itemId: "ether_pack_s", name: "PP補給パックS", effectType: "ppRecover", power: "20", price: "140", target: "ally", description: "味方単体のPPを回復" },
  { itemId: "revive_cell_s", name: "再起動セルS", effectType: "revive", power: "250", price: "360", target: "allyDefeated", description: "戦闘不能の味方を復帰" },
  { itemId: "ammo_pack_s", name: "弾薬補給パックS", effectType: "ammoRecover", power: "1", price: "160", target: "ally", description: "サブウェポン残弾を回復" }
];

function marketInventory() {
  return typeof window.ensureInventoryState === "function" ? window.ensureInventoryState() : (window.GameState.inventory || { items: {}, options: {}, weapons: {}, cores: {} });
}

function marketItems() {
  const csvItems = window.masterData?.itemMaster;
  return Array.isArray(csvItems) && csvItems.length ? csvItems : FALLBACK_MARKET_ITEMS;
}

function marketOptions() {
  const options = window.masterData?.optionMaster;
  return Array.isArray(options) ? options : [];
}

window.getPlayerMoney = function getPlayerMoney() {
  return typeof window.getMaterialCurrency === "function" ? window.getMaterialCurrency() : 0;
};

window.canBuyMarketItem = function canBuyMarketItem(item) {
  return Boolean(item) && window.getPlayerMoney() >= Number(item.price || 0);
};

window.buyMarketItem = function buyMarketItem(itemId) {
  const item = marketItems().find((entry) => entry.itemId === itemId);
  if (!window.canBuyMarketItem(item)) {
    logMessage("bar", "購入できません。資材🧱を確認してください。", "danger");
    renderCurrentScene();
    return false;
  }
  const inventory = marketInventory();
  if (!window.consumeMaterialCurrency(Number(item.price || 0))) return false;
  inventory.items[itemId] = (inventory.items[itemId] || 0) + 1;
  logMessage("bar", `${item.name}を購入しました。`, "good");
  renderCurrentScene();
  return true;
};

window.canBuyOption = function canBuyOption(option) {
  return Boolean(option) && window.getPlayerMoney() >= Number(option.price || 0);
};

window.buyOption = function buyOption(optionId) {
  const option = marketOptions().find((entry) => entry.optionId === optionId);
  if (!window.canBuyOption(option)) {
    logMessage("bar", "オプションを購入できません。", "danger");
    renderCurrentScene();
    return false;
  }
  const inventory = marketInventory();
  if (!window.consumeMaterialCurrency(Number(option.price || 0))) return false;
  inventory.options[optionId] = (inventory.options[optionId] || 0) + 1;
  logMessage("bar", `${option.name}を購入しました。`, "good");
  renderCurrentScene();
  return true;
};

window.renderMarket = function renderMarket() {
  const state = window.GameState;
  state.marketTab = state.marketTab === "options" ? "options" : "items";
  window.App.root.innerHTML = `
    ${renderHeader("マーケット", "MARKET")}
    <section class="sub-tabs">
      <button class="button ${state.marketTab === "items" ? "active" : ""}" data-action="change-market-tab" data-tab="items" type="button">アイテム</button>
      <button class="button ${state.marketTab === "options" ? "active" : ""}" data-action="change-market-tab" data-tab="options" type="button">オプションパーツ</button>
    </section>
    ${state.marketTab === "items" ? renderMarketItemTab() : renderMarketOptionTab()}
  `;
};

function renderMarketItemTab() {
  return `
    <section class="panel panel-pad">
      <div class="section-head"><h2>アイテム</h2><span>資材🧱 ${formatNumber(window.getPlayerMoney())}</span></div>
      <div class="compact-list">${marketItems().map(renderMarketItemRow).join("")}</div>
    </section>
  `;
}

function renderMarketItemRow(item) {
  const inventory = marketInventory();
  const owned = inventory.items[item.itemId] || 0;
  const canBuy = window.canBuyMarketItem(item);
  return `
    <article class="material-row">
      <span style="flex:1">${item.name || item.itemId}<br><span class="muted">${item.description || item.effectType || "効果未設定"}</span></span>
      <strong>🧱 ${formatNumber(Number(item.price || 0))}<br><span class="muted">x${owned}</span></strong>
      <button class="button" data-action="buy-market-item" data-item="${item.itemId}" ${canBuy ? "" : "disabled"} type="button">購入</button>
    </article>
  `;
}

function renderMarketOptionTab() {
  const options = marketOptions();
  return `
    <section class="panel panel-pad">
      <div class="section-head"><h2>オプションパーツ</h2><span>資材🧱 ${formatNumber(window.getPlayerMoney())}</span></div>
      <div class="compact-list">${options.length ? options.map(renderMarketOptionRow).join("") : `<div class="muted">option_master.csv が未読込です。</div>`}</div>
    </section>
  `;
}

function renderMarketOptionRow(option) {
  const inventory = marketInventory();
  const owned = inventory.options[option.optionId] || 0;
  const statText = ["hp", "pp", "sAtk", "mAtk", "lAtk", "sDef", "mDef", "lDef", "speed"]
    .filter((key) => Number(option[key] || 0) !== 0)
    .map((key) => `${key}+${option[key]}`)
    .join(" / ") || "補正なし";
  const canBuy = window.canBuyOption(option);
  return `
    <article class="material-row">
      <span style="flex:1">${option.name || option.optionId}<br><span class="muted">RANK ${option.rank || "-"} / ${option.type || "option"} / ${statText}</span></span>
      <strong>🧱 ${formatNumber(Number(option.price || 0))}<br><span class="muted">x${owned}</span></strong>
      <button class="button" data-action="buy-option" data-option="${option.optionId}" ${canBuy ? "" : "disabled"} type="button">購入</button>
    </article>
  `;
}

window.setMarketTab = function setMarketTab(tab) {
  window.GameState.marketTab = tab === "options" ? "options" : "items";
  renderCurrentScene();
};

window.App.scenes.market = window.renderMarket;
