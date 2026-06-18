"use strict";

function ensureDebugMaterialCatalog() {
  if (!Array.isArray(window.MaterialCatalog)) window.MaterialCatalog = [];
  const existingIds = new Set(window.MaterialCatalog.map((material) => material.id));
  const debugMaterials = [
    { id: "debug_mat_n", name: "デバッグN素材", rarity: "N", rank: "N", value: 10, category: "debug", materialRole: "part" },
    { id: "debug_mat_r", name: "デバッグR素材", rarity: "R", rank: "R", value: 50, category: "debug", materialRole: "part" },
    { id: "debug_mat_sr", name: "デバッグSR素材", rarity: "SR", rank: "SR", value: 200, category: "debug", materialRole: "part" },
    { id: "debug_mat_ssr", name: "デバッグSSR素材", rarity: "SSR", rank: "SSR", value: 1000, category: "debug", materialRole: "part" },
    { id: "debug_mat_ur", name: "デバッグUR素材", rarity: "UR", rank: "UR", value: 5000, category: "debug", materialRole: "part" },
    { id: "debug_mech_core_n", name: "デバッグN機体コア", rarity: "N", rank: "N", value: 120, category: "core", materialRole: "core" },
    { id: "debug_mech_core_r", name: "デバッグR機体コア", rarity: "R", rank: "R", value: 180, category: "core", materialRole: "core" },
    { id: "debug_mech_core_sr", name: "デバッグSR機体コア", rarity: "SR", rank: "SR", value: 260, category: "core", materialRole: "core" },
    { id: "debug_mech_core_ssr", name: "デバッグSSR機体コア", rarity: "SSR", rank: "SSR", value: 360, category: "core", materialRole: "core" },
    { id: "debug_mech_core_ur", name: "デバッグUR機体コア", rarity: "UR", rank: "UR", value: 520, category: "core", materialRole: "core" },
    { id: "debug_weapon_core_n", name: "デバッグN武器コア", rarity: "N", rank: "N", value: 100, category: "weapon_core", materialRole: "weapon_core" },
    { id: "debug_weapon_core_r", name: "デバッグR武器コア", rarity: "R", rank: "R", value: 200, category: "weapon_core", materialRole: "weapon_core" },
    { id: "debug_weapon_core_sr", name: "デバッグSR武器コア", rarity: "SR", rank: "SR", value: 400, category: "weapon_core", materialRole: "weapon_core" },
    { id: "debug_weapon_core_ssr", name: "デバッグSSR武器コア", rarity: "SSR", rank: "SSR", value: 800, category: "weapon_core", materialRole: "weapon_core" },
    { id: "debug_weapon_core_ur", name: "デバッグUR武器コア", rarity: "UR", rank: "UR", value: 1600, category: "weapon_core", materialRole: "weapon_core" },
    { id: "debug_boss_weapon_core_mat", name: "デバッグボス武器コア素材", rarity: "UR", rank: "UR", value: 5000, category: "bossWeaponMaterial", materialRole: "bossWeaponMaterial", sourceType: "boss" }
  ];
  debugMaterials.forEach((material) => {
    if (!existingIds.has(material.id)) window.MaterialCatalog.push({ prompts: [], ...material });
  });
}

window.grantDebugMaterials = function grantDebugMaterials() {
  ensureDebugMaterialCatalog();
  const amount = 999;
  ["debug_mat_n", "debug_mat_r", "debug_mat_sr", "debug_mat_ssr", "debug_mat_ur"].forEach((id) => window.addBaseMaterial?.(id, amount));
  ["debug_mech_core_n", "debug_mech_core_r", "debug_mech_core_sr", "debug_mech_core_ssr", "debug_mech_core_ur"].forEach((id) => window.addBaseMaterial?.(id, amount));
  ["debug_weapon_core_n", "debug_weapon_core_r", "debug_weapon_core_sr", "debug_weapon_core_ssr", "debug_weapon_core_ur", "debug_boss_weapon_core_mat"].forEach((id) => window.addBaseMaterial?.(id, amount));
  const inventory = typeof window.ensureInventoryState === "function" ? window.ensureInventoryState() : window.GameState.inventory;
  ["n", "r", "sr", "ssr", "ur"].forEach((rank) => {
    inventory.cores[`core_${rank}`] = Math.max(Number(inventory.cores[`core_${rank}`] || 0), amount);
  });
  window.logMessage?.("synthesis", "デバッグ素材を拠点所持素材へ999個ずつ振り込みました。", "good");
  window.savePlayerData?.();
  window.renderCurrentScene?.();
};

window.renderDebugMaterialGrant = function renderDebugMaterialGrant() {
  ensureDebugMaterialCatalog();
  return `
    <section class="debug-grant-panel">
      <button class="button debug-grant-button" data-action="grant-debug-materials" type="button">DEBUG 素材999振込</button>
    </section>
  `;
};

const baseLoadMastersForDebugMaterials = window.loadMasters;
if (typeof baseLoadMastersForDebugMaterials === "function") {
  window.loadMasters = async function loadMastersWithDebugMaterials(...args) {
    const result = await baseLoadMastersForDebugMaterials.apply(this, args);
    ensureDebugMaterialCatalog();
    return result;
  };
}

ensureDebugMaterialCatalog();
