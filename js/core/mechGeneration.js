"use strict";

window.MechCoreCatalog = [
  { id: "core_melee_r", name: "Assault Ember Core", rarity: "R", category: "melee", outputLimit: 96, prompts: ["close combat reactor", "forward leaning armor silhouette"] },
  { id: "core_ranged_r", name: "Shooter Lynx Core", rarity: "R", category: "ranged", outputLimit: 88, prompts: ["precision targeting sensors", "rifle-ready mechanical frame"] },
  { id: "core_artillery_sr", name: "Artillery Atlas Core", rarity: "SR", category: "artillery", outputLimit: 126, prompts: ["heavy cannon backpack", "stabilizer legs"] },
  { id: "core_defense_sr", name: "Defender Bastion Core", rarity: "SR", category: "defense", outputLimit: 118, prompts: ["tower shield armor", "reinforced defensive frame"] },
  { id: "core_healer_r", name: "Medic Halo Core", rarity: "R", category: "healer", outputLimit: 82, prompts: ["repair drones", "white medical support markings"] },
  { id: "core_support_sr", name: "Support Relay Core", rarity: "SR", category: "support", outputLimit: 104, prompts: ["command antenna array", "support equipment racks"] },
  { id: "core_debuff_sr", name: "Hunter Venom Core", rarity: "SR", category: "debuff", outputLimit: 100, prompts: ["jamming emitters", "predatory angular head unit"] },
  { id: "core_scout_r", name: "Scout Wisp Core", rarity: "R", category: "scout", outputLimit: 78, prompts: ["light recon sensors", "slim high mobility frame"] }
];

window.MechMaterialCatalog = [
  {
    id: "broken_shell",
    name: "Cracked Shell Plate",
    rarity: "N",
    category: "armor",
    stats: { hp: 80, armor: 12, attack: 0, accuracy: 0, evasion: -2, speed: -1, fuelCost: 1, cargo: 3, scan: 0 },
    outputCost: 10,
    tags: ["organic", "rough"],
    prompts: ["cracked shell armor", "rough organic plating"]
  },
  {
    id: "thin_membrane",
    name: "Thin Wing Membrane",
    rarity: "R",
    category: "mobility",
    stats: { hp: 0, armor: 0, attack: 0, accuracy: 2, evasion: 10, speed: 8, fuelCost: -2, cargo: 0, scan: 4 },
    outputCost: 8,
    tags: ["light", "wing"],
    prompts: ["translucent wing fins", "lightweight membrane stabilizers"]
  },
  {
    id: "dry_nerve",
    name: "Dry Nerve Fiber",
    rarity: "R",
    category: "control",
    stats: { hp: 0, armor: 0, attack: 8, accuracy: 5, evasion: 4, speed: 6, fuelCost: 0, cargo: 0, scan: 3 },
    outputCost: 9,
    tags: ["bio", "cable"],
    prompts: ["exposed bio cables", "nerve-like control fibers"]
  },
  {
    id: "brittle_bone",
    name: "Brittle Bone Frame",
    rarity: "N",
    category: "frame",
    stats: { hp: 40, armor: 8, attack: 6, accuracy: 0, evasion: -1, speed: 0, fuelCost: 0, cargo: 2, scan: 0 },
    outputCost: 7,
    tags: ["bone", "pale"],
    prompts: ["pale bone frame", "ribbed skeletal armor"]
  },
  {
    id: "aged_scale",
    name: "Aged Scale Armor",
    rarity: "R",
    category: "armor",
    stats: { hp: 110, armor: 20, attack: 0, accuracy: 0, evasion: -3, speed: -2, fuelCost: 2, cargo: 5, scan: 0 },
    outputCost: 13,
    tags: ["scale", "medium"],
    prompts: ["overlapping scale armor", "aged exoskeleton plates"]
  },
  {
    id: "wilted_bloodfilm",
    name: "Wilted Bloodfilm",
    rarity: "R",
    category: "reactor",
    stats: { hp: 20, armor: 0, attack: 12, accuracy: 3, evasion: 0, speed: 1, fuelCost: 4, cargo: 0, scan: 2 },
    outputCost: 12,
    tags: ["red", "reactive"],
    prompts: ["thin red biofilm", "vascular red energy lines"]
  },
  {
    id: "volcano_steel",
    name: "Volcano Steel",
    rarity: "SR",
    category: "armor",
    stats: { hp: 130, armor: 30, attack: 10, accuracy: 0, evasion: -5, speed: -4, fuelCost: 5, cargo: 8, scan: 0 },
    outputCost: 18,
    tags: ["volcano", "heavy"],
    prompts: ["volcanic armor plating", "dark metal armor", "glowing magma energy lines"]
  }
];

const CORE_TYPE_MAP = {
  melee: "Assault",
  ranged: "Shooter",
  artillery: "Artillery",
  defense: "Defender",
  healer: "Medic",
  support: "Support",
  debuff: "Hunter",
  scout: "Scout"
};

const RARITY_SCORE = { N: 1, R: 2, SR: 3, SSR: 4, UR: 5 };
const SIZE_TABLE = [
  { size: "XS", minCost: 0, outputMultiplier: 0.65, stats: { hp: 380, armor: 38, attack: 58, accuracy: 74, evasion: 86, speed: 88, fuelCost: 58, cargo: 22, scan: 70 } },
  { size: "S", minCost: 24, outputMultiplier: 0.85, stats: { hp: 520, armor: 52, attack: 72, accuracy: 78, evasion: 76, speed: 76, fuelCost: 74, cargo: 34, scan: 74 } },
  { size: "M", minCost: 42, outputMultiplier: 1.0, stats: { hp: 700, armor: 72, attack: 88, accuracy: 74, evasion: 62, speed: 62, fuelCost: 92, cargo: 52, scan: 58 } },
  { size: "L", minCost: 66, outputMultiplier: 1.35, stats: { hp: 960, armor: 102, attack: 112, accuracy: 68, evasion: 42, speed: 44, fuelCost: 126, cargo: 76, scan: 44 } },
  { size: "XL", minCost: 92, outputMultiplier: 1.75, stats: { hp: 1320, armor: 138, attack: 142, accuracy: 60, evasion: 28, speed: 30, fuelCost: 168, cargo: 108, scan: 34 } }
];

const CATEGORY_MODIFIERS = {
  Assault: { hp: 1.05, armor: 1.05, attack: 1.18, accuracy: 0.95, evasion: 1.02, speed: 1.04, fuelCost: 1.04, cargo: 1.0, scan: 0.9 },
  Shooter: { hp: 0.96, armor: 0.95, attack: 1.1, accuracy: 1.22, evasion: 1.03, speed: 1.0, fuelCost: 1.0, cargo: 0.95, scan: 1.0 },
  Artillery: { hp: 1.08, armor: 1.08, attack: 1.32, accuracy: 1.06, evasion: 0.82, speed: 0.78, fuelCost: 1.18, cargo: 1.16, scan: 0.86 },
  Defender: { hp: 1.22, armor: 1.35, attack: 0.92, accuracy: 0.92, evasion: 0.82, speed: 0.82, fuelCost: 1.12, cargo: 1.1, scan: 0.88 },
  Medic: { hp: 1.0, armor: 0.96, attack: 0.82, accuracy: 1.02, evasion: 1.06, speed: 1.04, fuelCost: 0.96, cargo: 1.02, scan: 1.14 },
  Support: { hp: 1.02, armor: 1.0, attack: 0.9, accuracy: 1.08, evasion: 1.0, speed: 1.0, fuelCost: 0.98, cargo: 1.18, scan: 1.1 },
  Hunter: { hp: 0.94, armor: 0.92, attack: 1.08, accuracy: 1.12, evasion: 1.16, speed: 1.12, fuelCost: 1.02, cargo: 0.92, scan: 1.08 },
  Scout: { hp: 0.88, armor: 0.86, attack: 0.9, accuracy: 1.08, evasion: 1.28, speed: 1.3, fuelCost: 0.84, cargo: 0.92, scan: 1.38 }
};

window.getMechCore = function getMechCore(coreId) {
  return window.MechCoreCatalog.find((core) => core.id === coreId) || null;
};

window.getMechGenerationMaterial = function getMechGenerationMaterial(materialId) {
  return window.MechMaterialCatalog.find((material) => material.id === materialId) || null;
};

window.getOwnedCoreIds = function getOwnedCoreIds() {
  const state = window.GameState;
  if (Array.isArray(state.ownedCoreIds) && state.ownedCoreIds.length) return state.ownedCoreIds;
  return window.MechCoreCatalog.map((core) => core.id);
};

window.ensureMechGenerationState = function ensureMechGenerationState() {
  const state = window.GameState;
  if (state.selectedCoreId && !window.getMechCore(state.selectedCoreId)) state.selectedCoreId = null;
  if (!Array.isArray(state.synthesisSlots)) state.synthesisSlots = [];
  if (!state.generationStatus) state.generationStatus = { busy: false, message: "" };
  if (!state.synthesisStep) state.synthesisStep = "core";
};

function chooseGeneratedSize(materials) {
  const totalCost = materials.reduce((sum, material) => sum + material.outputCost, 0);
  return [...SIZE_TABLE].reverse().find((entry) => totalCost >= entry.minCost) || SIZE_TABLE[0];
}

function outputState(required, limit) {
  if (required <= limit * 0.75) return "stable";
  if (required <= limit) return "normal";
  if (required <= limit * 1.2) return "overloaded";
  return "failure";
}

function aggregateMaterialStats(materials) {
  return materials.reduce((stats, material) => {
    Object.entries(material.stats || {}).forEach(([key, value]) => {
      stats[key] = (stats[key] || 0) + Number(value || 0);
    });
    return stats;
  }, { hp: 0, armor: 0, attack: 0, accuracy: 0, evasion: 0, speed: 0, fuelCost: 0, cargo: 0, scan: 0 });
}

function applyCategoryModifiers(stats, type) {
  const modifiers = CATEGORY_MODIFIERS[type] || {};
  return Object.keys(stats).reduce((next, key) => {
    next[key] = Math.round(stats[key] * (modifiers[key] || 1));
    return next;
  }, {});
}

function addStats(base, bonus) {
  return Object.keys(base).reduce((next, key) => {
    next[key] = Math.round((base[key] || 0) + (bonus[key] || 0));
    return next;
  }, {});
}

function applyOutputStateModifiers(stats, stateName) {
  const next = { ...stats };
  if (stateName === "stable") {
    next.hp = Math.round(next.hp * 1.04);
    next.armor = Math.round(next.armor * 1.04);
    next.accuracy = Math.round(next.accuracy * 1.03);
    next.evasion = Math.round(next.evasion * 1.03);
    next.speed = Math.round(next.speed * 1.03);
    next.fuelCost = Math.max(1, Math.round(next.fuelCost * 0.9));
  }
  if (stateName === "overloaded") {
    next.hp = Math.round(next.hp * 0.95);
    next.armor = Math.round(next.armor * 0.9);
    next.attack = Math.round(next.attack * 0.88);
    next.accuracy = Math.round(next.accuracy * 0.88);
    next.evasion = Math.round(next.evasion * 0.82);
    next.speed = Math.round(next.speed * 0.82);
    next.scan = Math.round(next.scan * 0.9);
    next.fuelCost = Math.round(next.fuelCost * 1.28);
  }
  return next;
}

function clampFinalStats(stats) {
  return Object.keys(stats).reduce((next, key) => {
    next[key] = Math.max(key === "fuelCost" ? 1 : 0, Math.round(stats[key]));
    return next;
  }, {});
}

window.buildMechVisualPrompt = function buildMechVisualPrompt(core, materials, size, type, stateName) {
  const promptParts = [
    "full body original mecha concept art",
    `${size} size ${type} mech`,
    "three quarter view",
    "transparent background",
    "full body visible",
    "head fully visible",
    "feet visible",
    "extra margin around the entire body",
    "not cropped",
    "game asset style",
    "clean readable silhouette",
    "no text, no logo, no watermark",
    ...core.prompts,
    ...materials.flatMap((material) => material.prompts)
  ];
  if (stateName === "overloaded") promptParts.push("overloaded glowing reactor vents", "strained power conduits");
  if (stateName === "stable") promptParts.push("balanced reactor glow", "well integrated armor");
  return [...new Set(promptParts)].join(", ");
};

window.previewGeneratedMech = function previewGeneratedMech(coreId, materialIds) {
  const core = window.getMechCore(coreId);
  const materials = materialIds.map(window.getMechGenerationMaterial).filter(Boolean);
  if (!core || materials.length < 3 || materials.length > 5) return null;

  const materialStats = aggregateMaterialStats(materials);
  const sizeInfo = chooseGeneratedSize(materials);
  const rarityScore = Math.round((RARITY_SCORE[core.rarity] || 1) + materials.reduce((sum, material) => sum + (RARITY_SCORE[material.rarity] || 1), 0) / materials.length);
  const rarityEntry = Object.entries(RARITY_SCORE).find((entry) => entry[1] === Math.min(5, rarityScore));
  const rarity = rarityEntry ? rarityEntry[0] : "R";
  const materialOutputCost = materials.reduce((sum, material) => sum + material.outputCost, 0);
  const type = CORE_TYPE_MAP[core.category] || "Support";
  const categoryOutputCost = {
    Assault: 8,
    Shooter: 6,
    Artillery: 18,
    Defender: 14,
    Medic: 7,
    Support: 6,
    Hunter: 9,
    Scout: 4
  }[type] || 6;
  const required = Math.round((48 + materialOutputCost + categoryOutputCost + rarityScore * 4) * sizeInfo.outputMultiplier);
  const limit = core.outputLimit;
  const loadRate = required / limit;
  const stateName = outputState(required, limit);
  const rarityBonus = {
    hp: rarityScore * 35,
    armor: rarityScore * 5,
    attack: rarityScore * 6,
    accuracy: rarityScore * 3,
    evasion: rarityScore * 2,
    speed: rarityScore * 2,
    fuelCost: 0,
    cargo: rarityScore * 3,
    scan: rarityScore * 3
  };
  const sizeAndCategoryStats = applyCategoryModifiers(sizeInfo.stats, type);
  const stats = clampFinalStats(applyOutputStateModifiers(addStats(addStats(sizeAndCategoryStats, materialStats), rarityBonus), stateName));

  return {
    core,
    materials,
    rarity,
    size: sizeInfo.size,
    type,
    stats,
    output: {
      limit,
      required,
      margin: limit - required,
      loadRate: Number(loadRate.toFixed(2)),
      state: stateName
    },
    visualPrompt: window.buildMechVisualPrompt(core, materials, sizeInfo.size, type, stateName)
  };
};

window.createGeneratedMechData = function createGeneratedMechData(preview, materialIds) {
  const state = window.GameState;
  const serial = String(state.nextMechSerial || 1).padStart(3, "0");
  state.nextMechSerial = (state.nextMechSerial || 1) + 1;
  return {
    id: `mech_${serial}`,
    name: `${preview.type}-${serial}`,
    rarity: preview.rarity,
    rank: preview.rarity,
    size: preview.size,
    type: preview.type,
    coreId: preview.core.id,
    materialIds: [...materialIds],
    stats: preview.stats,
    output: preview.output,
    visualPrompt: preview.visualPrompt,
    imagePath: null,
    createdAt: new Date().toISOString(),
    hp: preview.stats.hp,
    maxHp: preview.stats.hp,
    atk: preview.stats.attack,
    def: preview.stats.armor,
    mobility: preview.stats.speed,
    fuelCostRate: Math.max(0.5, Number((preview.stats.fuelCost / 100).toFixed(2))),
    traits: [preview.type, preview.output.state],
    pilotId: null,
    unique: false,
    customizable: true,
    slotCounts: { weapon: 1, armor: 1, core: 1, option: 1 },
    parts: { weapon: null, armor: null, core: preview.core.name, option: null },
    promptTags: preview.materials.flatMap((material) => material.tags || []),
    description: preview.visualPrompt
  };
};
