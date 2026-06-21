"use strict";

const isEditableTouchTarget = (target) => {
  return Boolean(target?.closest?.("input, textarea, select, [contenteditable='true']"));
};

let lastTouchEndAt = 0;

document.addEventListener(
  "touchend",
  (event) => {
    if (isEditableTouchTarget(event.target)) return;

    const now = Date.now();
    if (now - lastTouchEndAt <= 300) {
      event.preventDefault();
    }
    lastTouchEndAt = now;
  },
  { passive: false }
);

document.addEventListener(
  "gesturestart",
  (event) => {
    if (isEditableTouchTarget(event.target)) return;
    event.preventDefault();
  },
  { passive: false }
);

document.addEventListener("DOMContentLoaded", async () => {
  window.App.root = document.getElementById("app");
  window.loadPlayerData();
  await window.loadMasters();
  window.renderBottomNav();
  window.renderCurrentScene();
  window.savePlayerData();
});

document.addEventListener("click", (event) => {
  window.AudioManager?.unlock();
  if (event.target.classList?.contains("mini-map-modal-backdrop")) {
    window.closeMiniMapModal();
    window.savePlayerData();
    return;
  }
  if (event.target.classList?.contains("quest-materials-modal-backdrop")) {
    window.closeQuestMaterialsModal();
    window.savePlayerData();
    return;
  }
  if (event.target.classList?.contains("quest-log-modal-backdrop")) {
    window.closeQuestLogModal();
    window.savePlayerData();
    return;
  }
  if (event.target.classList?.contains("battle-tactic-modal-backdrop")) {
    window.closeBattleTacticModal();
    window.savePlayerData();
    return;
  }
  if (event.target.classList?.contains("explore-items-modal-backdrop")) {
    window.closeExploreItemMenu();
    window.savePlayerData();
    return;
  }
  if (event.target.classList?.contains("base-inventory-modal-backdrop")) {
    window.closeBaseInventoryModal();
    window.savePlayerData();
    return;
  }
  if (event.target.classList?.contains("equipment-modal-backdrop")) {
    window.closeEquipmentSelector();
    window.savePlayerData();
    return;
  }
  if (event.target.classList?.contains("battle-modal-backdrop")) {
    window.closeBattleDetail();
    window.savePlayerData();
    return;
  }

  const target = event.target.closest("button, [data-action]");
  if (!target) return;

  const scene = target.dataset.screen;
  const action = target.dataset.action;
  if (action) window.AudioManager?.playSe("button");

  if (scene) {
    window.switchScene(scene);
    return;
  }

  if (action === "refresh-candidates") {
    window.generateTavernCandidates();
    window.renderCurrentScene();
  }
  if (action === "bar-view") window.setBarView(target.dataset.view);
  if (action === "bridge-menu") window.setBridgeMenu(target.dataset.menu);
  if (action === "open-tavern-candidate-detail") window.openTavernCandidateDetail(target.dataset.pilot);
  if (action === "accept-tavern-quest") window.acceptTavernQuest(target.dataset.planet);
  if (action === "hire") window.hirePilot(target.dataset.pilot);
  if (action === "rank-up-pilot") window.rankUpPilotById(target.dataset.pilot);
  if (action === "repair-ship-facility") window.repairShipFacility(target.dataset.facility);
  if (action === "sell-material") window.sellMaterial(target.dataset.material);
  if (action === "open-base-inventory") window.openBaseInventoryModal();
  if (action === "close-base-inventory") window.closeBaseInventoryModal();
  if (action === "sell-mech") window.sellMech(target.dataset.mech);
  if (action === "delete-mech") window.deleteMech(target.dataset.mech);
  if (action === "rename-mech") window.renameMech(target.dataset.mech);
  if (action === "open-equip-slot") window.openEquipmentSelector(target.dataset.mech, target.dataset.slotType, target.dataset.slotIndex);
  if (action === "close-equip-modal") window.closeEquipmentSelector();
  if (action === "equip-weapon-slot") window.equipWeaponSlot(target.dataset.mech, target.dataset.slotType, target.dataset.equipId);
  if (action === "equip-option-slot") window.equipOptionSlot(target.dataset.mech, target.dataset.slotIndex, target.dataset.equipId);
  if (action === "add-mech-to-party") window.addMechToParty(target.dataset.mech);
  if (action === "remove-mech-from-party") window.removeMechFromParty(target.dataset.mech);
  if (action === "confirm-pending-mech") window.confirmPendingGeneratedMech();
  if (action === "discard-pending-mech") window.discardPendingGeneratedMech();
  if (action === "change-hangar-tab") {
    window.GameState.hangarTab = target.dataset.tab || "party";
    window.GameState.hangarView = "list";
    window.GameState.assigningMechId = null;
    window.GameState.assigningPartySlot = null;
    window.renderCurrentScene();
  }
  if (action === "open-mech-detail") {
    window.GameState.selectedMechId = target.dataset.mech;
    window.GameState.hangarTab = "mechs";
    window.GameState.hangarView = "mech-detail";
    window.renderCurrentScene();
  }
  if (action === "close-mech-detail") {
    window.GameState.hangarView = "list";
    window.renderCurrentScene();
  }
  if (action === "open-mech-assign") {
    window.GameState.hangarTab = "party";
    window.GameState.assigningPartySlot = Number(target.dataset.slot);
    window.GameState.hangarView = "mech-assign";
    window.renderCurrentScene();
  }
  if (action === "open-pilot-assign") {
    window.GameState.hangarTab = "party";
    window.GameState.assigningPartySlot = Number(target.dataset.slot);
    window.GameState.hangarView = "pilot-assign";
    window.renderCurrentScene();
  }
  if (action === "close-pilot-assign") {
    window.GameState.assigningMechId = null;
    window.GameState.assigningPartySlot = null;
    window.GameState.hangarView = "list";
    window.renderCurrentScene();
  }
  if (action === "close-party-assign") {
    window.GameState.assigningPartySlot = null;
    window.GameState.hangarView = "list";
    window.renderCurrentScene();
  }
  if (action === "open-pilot-detail") {
    window.GameState.selectedPilotId = target.dataset.pilot;
    window.GameState.hangarTab = "pilots";
    window.GameState.hangarView = "pilot-detail";
    window.renderCurrentScene();
  }
  if (action === "close-pilot-detail") {
    window.GameState.hangarView = "list";
    window.renderCurrentScene();
  }
  if (action === "pilot-detail-mode") window.setPilotDetailMode(target.dataset.mode);
  if (action === "learn-pilot-skill") window.learnPilotSkillById(target.dataset.pilot, target.dataset.skill);
  if (action === "assign-mech-to-party-slot") window.assignMechToPartySlot(target.dataset.slot, target.dataset.mech);
  if (action === "assign-pilot") window.assignPilotToMech(target.dataset.mech, target.dataset.pilot);
  if (action === "unassign-pilot") window.unassignPilotFromMech(target.dataset.mech);
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
  if (action === "set-battle-tactic") window.setBattleTactic(target.dataset.tactic);
  if (action === "open-battle-tactic-modal") window.openBattleTacticModal();
  if (action === "close-battle-tactic-modal") window.closeBattleTacticModal();
  if (action === "open-quest-log") window.openQuestLogModal();
  if (action === "close-quest-log") window.closeQuestLogModal();
  if (action === "quest-next-floor") window.goToNextFloor();
  if (action === "open-mini-map") window.openMiniMapModal();
  if (action === "close-mini-map") window.closeMiniMapModal();
  if (action === "open-quest-materials") window.openQuestMaterialsModal();
  if (action === "close-quest-materials") window.closeQuestMaterialsModal();
  if (action === "open-explore-items") window.openExploreItemMenu();
  if (action === "close-explore-items") window.closeExploreItemMenu();
  if (action === "use-explore-item") window.useExploreItem(target.dataset.item, target.dataset.target);
  if (action === "select-planet") window.selectPlanet(target.dataset.planet);
  if (action === "start-selected-planet-quest") window.startSelectedPlanetQuest();
  if (action === "return-base") window.returnBase();
  if (action === "battle-attack") window.battleCommand("attack");
  if (action === "battle-skill") window.battleCommand("skill");
  if (action === "battle-defend") window.battleCommand("defend");
  if (action === "battle-overdrive") window.battleCommand("overdrive");
  if (action === "battle-run") window.battleCommand("run");
  if (action === "open-battle-enemy-detail") window.openBattleEnemyDetail();
  if (action === "open-battle-ally-detail") window.openBattleAllyDetail(target.dataset.unit);
  if (action === "open-battle-log") window.openBattleLogModal();
  if (action === "close-battle-detail") window.closeBattleDetail();
  if (action === "select-synth-material") window.selectSynthMaterial(target.dataset.material);
  if (action === "select-mech-core") window.selectMechCore(target.dataset.core);
  if (action === "change-synthesis-tab") window.setSynthesisTab(target.dataset.tab);
  if (action === "select-enhance-machine") window.selectEnhanceMachine(target.dataset.mech);
  if (action === "adjust-enhance-material") window.adjustEnhanceMaterial(target.dataset.material, target.dataset.delta);
  if (action === "clear-enhance-materials") window.clearEnhanceMaterials();
  if (action === "back-enhance-machines") window.backEnhanceMachines();
  if (action === "recommend-enhance-materials") window.recommendEnhanceMaterials();
  if (action === "execute-enhance-machine") window.enhanceMachineById(window.GameState.selectedEnhanceMachineId);
  if (action === "grant-debug-materials") window.grantDebugMaterials();
  if (action === "reset-debug-inventory") window.resetDebugInventory();
  if (action === "rank-up-machine") window.rankUpMachineById(target.dataset.mech);
  if (action === "generate-weapon") window.generateWeapon(target.dataset.weapon);
  if (action === "synthesis-next-step") window.goSynthesisNextStep();
  if (action === "synthesis-prev-step") window.goSynthesisPrevStep();
  if (action === "clear-synth-materials") window.clearSynthMaterials();
  if (action === "reset-synthesis") window.resetSynthesis();
  if (action === "start-synthesis") window.startSynthesisProcess();
  if (action === "select-synth-slot") {
    window.removeSynthMaterialAtSlot(Number(target.dataset.slot));
  }
  if (action === "change-market-tab") window.setMarketTab(target.dataset.tab);
  if (action === "buy-market-item") window.buyMarketItem(target.dataset.item);
  if (action === "buy-option") window.buyOption(target.dataset.option);

  window.savePlayerData();
});

window.addEventListener("beforeunload", () => {
  window.savePlayerData();
});
