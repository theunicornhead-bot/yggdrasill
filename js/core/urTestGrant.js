"use strict";

const DEBUG_GRANT_AMOUNT = 200;
const DEBUG_RANKS = ["N", "R", "SR", "SSR", "UR"];

function materialRarity(material) {
  return String(material?.rarity || material?.rank || "N").toUpperCase();
}

function pickDebugMaterialsBySlot(slotType) {
  const catalog = Array.isArray(window.MechMaterialCatalog) ? window.MechMaterialCatalog : [];
  return DEBUG_RANKS.map((rank) => (
    catalog.find((material) => material.slotType === slotType && materialRarity(material) === rank)
    || catalog.find((material) => material.slotType === slotType && materialRarity(material) !== "UR")
    || catalog.find((material) => material.slotType === slotType)
  )).filter(Boolean);
}

function getDebugGrantMaterialIds() {
  const recipeIds = (Array.isArray(window.masterData?.weaponRecipeMaster) ? window.masterData.weaponRecipeMaster : [])
    .flatMap((recipe) => String(recipe.materials || "").split("|").map((pair) => pair.split(":")[0]).filter(Boolean));
  const slotIds = ["weapon", "frame", "wing", "reactor", "special"].flatMap((slotType) => pickDebugMaterialsBySlot(slotType).map((material) => material.id));
  return [...new Set([...recipeIds, ...slotIds].filter((id) => typeof window.getMaterial === "function" && window.getMaterial(id)))];
}

window.grantDebugMaterials = function grantDebugMaterials() {
  const materialIds = getDebugGrantMaterialIds();
  materialIds.forEach((id) => window.addBaseMaterial?.(id, DEBUG_GRANT_AMOUNT));
  const inventory = typeof window.ensureInventoryState === "function" ? window.ensureInventoryState() : window.GameState.inventory;
  DEBUG_RANKS.forEach((rank) => {
    const id = `core_${rank.toLowerCase()}`;
    inventory.cores[id] = Math.max(Number(inventory.cores[id] || 0), DEBUG_GRANT_AMOUNT);
  });
  window.logMessage?.("synthesis", `DEBUG素材を実素材テーブルから${materialIds.length}種類振り込みました。`, "good");
  window.AudioManager?.playSe("decide");
  window.savePlayerData?.();
  window.renderCurrentScene?.();
};

window.resetDebugInventory = function resetDebugInventory() {
  const state = window.GameState;
  if (typeof window.ensureInventoryState === "function") window.ensureInventoryState();
  if (typeof window.ensureMaterialInventoryState === "function") window.ensureMaterialInventoryState();
  state.baseInventory.materials = {};
  state.materials = state.baseInventory.materials;
  state.exploreInventory.materials = {};
  state.runMaterials = state.exploreInventory.materials;
  if (state.exploration) state.exploration.temporaryMaterials = {};
  state.inventory.items = {};
  state.inventory.options = {};
  state.inventory.weapons = {};
  state.inventory.cores = {};
  if (typeof window.ensureInventoryState === "function") window.ensureInventoryState();
  if (typeof window.ensureMaterialInventoryState === "function") window.ensureMaterialInventoryState();
  window.logMessage?.("synthesis", "インベントリをリセットしました。", "warn");
  window.AudioManager?.playSe("cancel");
  window.savePlayerData?.();
  window.renderCurrentScene?.();
};

window.renderDebugMaterialGrant = function renderDebugMaterialGrant() {
  return `
    <section class="debug-grant-panel">
      <button class="button debug-grant-button" data-action="grant-debug-materials" type="button">DEBUG 素材振込</button>
      <button class="button debug-grant-button danger" data-action="reset-debug-inventory" type="button">DEBUG インベントリリセット</button>
    </section>
  `;
};
