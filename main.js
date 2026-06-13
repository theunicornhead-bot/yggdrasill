"use strict";

document.addEventListener("DOMContentLoaded", async () => {
  window.App.root = document.getElementById("app");
  window.loadPlayerData();
  await window.loadMasters();
  window.renderBottomNav();
  window.renderCurrentScene();
  window.savePlayerData();
});

document.addEventListener("click", (event) => {
  const target = event.target.closest("button, [data-action]");
  if (!target) return;

  const scene = target.dataset.screen;
  const action = target.dataset.action;

  if (scene) {
    window.switchScene(scene);
    return;
  }

  if (action === "refresh-candidates") {
    window.generateTavernCandidates();
    window.renderCurrentScene();
  }
  if (action === "hire") window.hirePilot(target.dataset.pilot);
  if (action === "sell-material") window.sellMaterial(target.dataset.material);
  if (action === "select-mech") {
    window.GameState.selectedMechId = target.dataset.mech;
    window.renderCurrentScene();
  }
  if (action === "cycle-pilot") window.cyclePilot(target.dataset.mech);
  if (action === "auto-party") {
    window.logMessage("bar", "自動編成を実行した。", "good");
    window.renderCurrentScene();
  }
  if (action === "quest-forward") window.questAction("前進した。", 1);
  if (action === "quest-left") window.questAction("左へ旋回した。", 0.5);
  if (action === "quest-right") window.questAction("右へ旋回した。", 0.5);
  if (action === "quest-search") window.questAction("周囲を調べた。", 1);
  if (action === "quest-next-floor") window.goToNextFloor();
  if (action === "select-planet") window.selectPlanet(target.dataset.planet);
  if (action === "return-base") window.returnBase();
  if (action === "battle-attack") window.battleCommand("attack");
  if (action === "battle-skill") window.battleCommand("skill");
  if (action === "battle-defend") window.battleCommand("defend");
  if (action === "battle-overdrive") window.battleCommand("overdrive");
  if (action === "battle-run") window.battleCommand("run");
  if (action === "select-synth-material") window.selectSynthMaterial(target.dataset.material);
  if (action === "select-mech-core") window.selectMechCore(target.dataset.core);
  if (action === "add-synth-material") window.addSynthMaterial(target.dataset.material || window.GameState.selectedMaterialId);
  if (action === "remove-synth-material") window.removeSynthMaterial();
  if (action === "reset-synthesis") window.resetSynthesis();
  if (action === "start-synthesis") window.startSynthesisProcess();
  if (action === "select-synth-slot") {
    const materialId = window.GameState.synthesisSlots[Number(target.dataset.slot)];
    if (materialId) window.selectSynthMaterial(materialId);
  }

  window.savePlayerData();
});

window.addEventListener("beforeunload", () => {
  window.savePlayerData();
});
