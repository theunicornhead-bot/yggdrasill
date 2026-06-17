"use strict";

function ensureDebugMaterialCatalog() {
  if (!Array.isArray(window.MaterialCatalog)) window.MaterialCatalog = [];
  const existingIds = new Set(window.MaterialCatalog.map((material) => material.id));
  const debugMaterials = [
    { id: "debug_mat_n", name: "Debug N Material", rarity: "N", rank: "N", value: 10, category: "debug", materialRole: "part" },
    { id: "debug_mat_r", name: "Debug R Material", rarity: "R", rank: "R", value: 50, category: "debug", materialRole: "part" },
    { id: "debug_mat_sr", name: "Debug SR Material", rarity: "SR", rank: "SR", value: 200, category: "debug", materialRole: "part" },
    { id: "debug_mat_ssr", name: "Debug SSR Material", rarity: "SSR", rank: "SSR", value: 1000, category: "debug", materialRole: "part" },
    { id: "debug_mat_ur", name: "Debug UR Material", rarity: "UR", rank: "UR", value: 5000, category: "debug", materialRole: "part" },
    { id: "debug_mech_core_n", name: "Debug N Mech Core", rarity: "N", rank: "N", value: 120, category: "core", materialRole: "core" },
    { id: "debug_mech_core_r", name: "Debug R Mech Core", rarity: "R", rank: "R", value: 180, category: "core", materialRole: "core" },
    { id: "debug_mech_core_sr", name: "Debug SR Mech Core", rarity: "SR", rank: "SR", value: 260, category: "core", materialRole: "core" },
    { id: "debug_mech_core_ssr", name: "Debug SSR Mech Core", rarity: "SSR", rank: "SSR", value: 360, category: "core", materialRole: "core" },
    { id: "debug_mech_core_ur", name: "Debug UR Mech Core", rarity: "UR", rank: "UR", value: 520, category: "core", materialRole: "core" },
    { id: "debug_weapon_core_n", name: "Debug N Weapon Core", rarity: "N", rank: "N", value: 100, category: "weapon_core", materialRole: "weapon_core" },
    { id: "debug_weapon_core_r", name: "Debug R Weapon Core", rarity: "R", rank: "R", value: 200, category: "weapon_core", materialRole: "weapon_core" },
    { id: "debug_weapon_core_sr", name: "Debug SR Weapon Core", rarity: "SR", rank: "SR", value: 400, category: "weapon_core", materialRole: "weapon_core" },
    { id: "debug_weapon_core_ssr", name: "Debug SSR Weapon Core", rarity: "SSR", rank: "SSR", value: 800, category: "weapon_core", materialRole: "weapon_core" },
    { id: "debug_weapon_core_ur", name: "Debug UR Weapon Core", rarity: "UR", rank: "UR", value: 1600, category: "weapon_core", materialRole: "weapon_core" },
    { id: "debug_boss_weapon_core_mat", name: "Debug Boss Weapon Core Material", rarity: "UR", rank: "UR", value: 5000, category: "bossWeaponMaterial", materialRole: "bossWeaponMaterial", sourceType: "boss" }
  ];
  debugMaterials.forEach((material) => {
    if (!existingIds.has(material.id)) window.MaterialCatalog.push({ prompts: [], ...material });
  });
}

window.grantDebugMaterials = function grantDebugMaterials() {
  ensureDebugMaterialCatalog();
  const amount = 99;
  ["debug_mat_n", "debug_mat_r", "debug_mat_sr", "debug_mat_ssr", "debug_mat_ur"].forEach((id) => window.addBaseMaterial?.(id, amount));
  ["debug_mech_core_n", "debug_mech_core_r", "debug_mech_core_sr", "debug_mech_core_ssr", "debug_mech_core_ur"].forEach((id) => window.addBaseMaterial?.(id, amount));
  ["debug_weapon_core_n", "debug_weapon_core_r", "debug_weapon_core_sr", "debug_weapon_core_ssr", "debug_weapon_core_ur", "debug_boss_weapon_core_mat"].forEach((id) => window.addBaseMaterial?.(id, amount));
  const inventory = typeof window.ensureInventoryState === "function" ? window.ensureInventoryState() : window.GameState.inventory;
  ["n", "r", "sr", "ssr", "ur"].forEach((rank) => {
    inventory.cores[`core_${rank}`] = Math.max(Number(inventory.cores[`core_${rank}`] || 0), amount);
  });
  window.logMessage?.("synthesis", "デバッグ素材を拠点所持素材へ99個ずつ振り込みました。", "good");
  window.savePlayerData?.();
  window.renderCurrentScene?.();
};

window.renderDebugMaterialGrant = function renderDebugMaterialGrant() {
  return `
    <section class="debug-grant-panel">
      <button class="button debug-grant-button" data-action="grant-debug-materials" type="button">DEBUG 素材99振込</button>
    </section>
  `;
};
