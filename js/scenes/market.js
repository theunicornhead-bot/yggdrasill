"use strict";

window.renderMarket = function renderMarket() {
  window.App.root.innerHTML = `
    ${renderHeader("マーケット", "MARKET")}
    <section class="placeholder-screen panel panel-pad">
      <div>
        <h2>マーケット</h2>
        <p class="muted">素材流通と装備購入の仮画面です。今回は素材売却だけ操作できます。</p>
        <div class="compact-list" style="margin-top:14px">${materialRows()}</div>
      </div>
    </section>
  `;
};

window.App.scenes.market = window.renderMarket;
