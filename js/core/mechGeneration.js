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
  general: "General",
  melee: "Melee",
  ranged: "Ranged",
  magic: "Magic",
  supply: "Supply",
  defense: "Defense",
  command: "Command",
  jammer: "Jammer",
  scout: "Scout"
};
const CORE_TAG_MAP = {
  general: "general",
  melee: "melee",
  ranged: "ranged",
  artillery: "ranged",
  magic: "magic",
  supply: "supply",
  defense: "defense",
  healer: "supply",
  support: "command",
  command: "command",
  debuff: "jammer",
  jammer: "jammer",
  scout: "scout"
};
const CORE_WEAPON_TYPE_MAP = {
  general: "melee",
  melee: "melee",
  ranged: "ranged",
  artillery: "ranged",
  magic: "magic",
  supply: "magic",
  defense: "melee",
  healer: "magic",
  support: "ranged",
  command: "ranged",
  debuff: "magic",
  jammer: "magic",
  scout: "ranged"
};

const SYNTHESIS_SLOT_DEFS = [
  { key: "weapon", label: "武器", accepts: ["weapon"] },
  { key: "frame", label: "フレーム", accepts: ["frame"] },
  { key: "wing", label: "翼・外装", accepts: ["wing"] },
  { key: "reactor", label: "リアクター", accepts: ["reactor"] },
  { key: "free", label: "自由枠", accepts: ["weapon", "frame", "wing", "reactor", "special"] }
];
const VALID_MAIN_COLORS = ["black", "white", "red", "blue", "green", "purple", "gold", "silver"];
const VALID_ACCENT_COLORS = ["red", "blue", "green", "purple", "gold", "silver", "white", "black", "orange", "cyan"];
const MAIN_COLOR_PROMPTS = {
  black: ["dominant black armor", "black main color scheme", "black armor plating"],
  white: ["dominant white armor", "white main color scheme", "white armor plating"],
  red: ["dominant red armor", "red main color scheme", "red armor plating"],
  blue: ["dominant blue armor", "blue main color scheme", "blue armor plating"],
  green: ["dominant green armor", "green main color scheme", "green armor plating"],
  purple: ["dominant purple armor", "purple main color scheme", "purple armor plating"],
  gold: ["dominant gold armor", "gold main color scheme", "gold armor plating"],
  silver: ["dominant silver armor", "silver main color scheme", "silver armor plating"]
};
const ACCENT_COLOR_PROMPTS = {
  red: ["crimson red glowing accents", "red energy veins"],
  blue: ["blue glowing accents", "blue energy veins"],
  green: ["green glowing accents", "green energy veins"],
  purple: ["purple glowing accents", "purple energy veins"],
  gold: ["gold glowing accents", "gold energy veins"],
  silver: ["silver metallic accents", "silver bio-metal veins"],
  white: ["white glowing accents", "white energy veins"],
  black: ["black secondary plating", "dark organic accents"],
  orange: ["orange glowing accents", "orange energy veins"],
  cyan: ["cyan glowing accents", "cyan energy veins"]
};
const VISUAL_TAG_PROMPTS = {
  greatsword: ["massive organic greatsword", "living bone blade", "two-handed weapon"],
  sword: ["organic sword", "blade held in hand", "sharp living blade"],
  lance: ["organic lance", "long piercing weapon", "weapon held in hand"],
  hammer: ["massive organic hammer", "heavy striking weapon", "bone hammer head"],
  claw: ["oversized organic claws", "clawed combat arms", "predatory talons"],
  whip: ["living tendril whip", "flexible organic weapon", "whip held in hand"],
  rifle: ["organic rifle", "living ranged weapon", "rifle held in hand"],
  cannon: ["living cannon", "large cannon silhouette", "organic artillery weapon"],
  railgun: ["organic railgun", "living cannon", "large ranged weapon"],
  bone: ["exposed bone structure", "skeletal armor"],
  shell: ["thick shell armor", "chitin plating"],
  scale: ["overlapping scale armor", "scaled exterior"],
  muscle: ["visible muscle fibers", "organic tendon bundles"],
  armor: ["reinforced armor plates", "heavy organic plating"],
  wing: ["large organic wings", "expanded wing silhouette"],
  halo: ["organic halo structure", "floating halo ring"],
  horn: ["large horns", "horned head silhouette"],
  tail: ["long organic tail", "tail stabilizer"],
  tentacle: ["writhing organic tentacles", "tentacle appendages"],
  multiple_arms: ["multiple organic arms", "extra combat limbs"],
  fire: ["flame organ glow", "burning reactor veins"],
  ice: ["cold crystal growths", "icy translucent plating"],
  lightning: ["electric arcs", "lightning conduits"],
  holy: ["holy white glow", "sacred bio-mechanical silhouette"],
  dark: ["dark aura", "shadowy organic plating"],
  nature: ["plant-like organic growth", "living bark armor"],
  poison: ["poison sac details", "toxic purple veins"],
  aquatic: ["aquatic organic shell", "deep sea biological details"],
  angel: ["angelic wing silhouette", "white sacred armor"],
  demon: ["demonic horned silhouette", "dark warped armor"],
  dragon: ["draconic armor silhouette", "dragon bone structures"],
  insect: ["insectoid chitin structure", "compound sensor eyes"],
  plant: ["plant bio-organic details", "root-like cables"],
  beast: ["beast-like predatory posture", "animalistic armor form"],
  king: ["regal crown-like horns", "royal armor silhouette"]
};

const RARITY_SCORE = { N: 1, R: 2, SR: 3, SSR: 4, UR: 5 };
const SCORE_RARITY = { 1: "N", 2: "R", 3: "SR", 4: "SSR", 5: "UR" };
const MACHINE_COMMON_PROMPT = [
  "full body humanoid bio-organic mecha",
  "living machine",
  "grown from monster materials",
  "bone frame",
  "chitin armor",
  "muscle fiber structures",
  "nerve bundle cables",
  "bio-reactor core",
  "organic mechanical design",
  "dark fantasy sci-fi",
  "plain industrial hangar",
  "plain dark hangar background",
  "dim industrial hangar",
  "simple maintenance bay",
  "dark sci-fi garage",
  "subtle floor lights",
  "full body",
  "center composition",
  "front angle",
  "high detail",
  "1024x1024 game asset",
  "no pilot",
  "no human",
  "no text",
  "no logo",
  "no UI",
  "no cockpit",
  "no green screen",
  "no chroma key background",
  "no city background",
  "no battlefield background"
];
const RARITY_PROMPTS = {
  N: ["low rank machine", "crude organic frame", "thin armor", "unfinished bio-mechanical structure", "dim bio-reactor", "fragile silhouette", "patched shell", "weak appearance"],
  R: ["stable organic frame", "reinforced armor", "improved reactor", "visible biological adaptation", "balanced combat silhouette"],
  SR: ["advanced bio-mechanical frame", "specialized combat design", "large organic structures", "enhanced reactor output", "strong biological integration"],
  SSR: ["elite living machine", "massive organic adaptation", "multiple biological organs", "high-output reactor", "organic and machine perfectly fused"],
  UR: ["mythic living machine", "overgrown organic evolution", "multiple reactor organs", "massive biological structures", "machine and organism indistinguishable", "apex bio-mechanical weapon"]
};
const SIZE_TABLE = [
  { size: "XS", minCost: 0, outputMultiplier: 0.65, stats: { hp: 380, armor: 38, attack: 58, accuracy: 74, evasion: 86, speed: 88, fuelCost: 58, cargo: 22, scan: 70 } },
  { size: "S", minCost: 24, outputMultiplier: 0.85, stats: { hp: 520, armor: 52, attack: 72, accuracy: 78, evasion: 76, speed: 76, fuelCost: 74, cargo: 34, scan: 74 } },
  { size: "M", minCost: 42, outputMultiplier: 1.0, stats: { hp: 700, armor: 72, attack: 88, accuracy: 74, evasion: 62, speed: 62, fuelCost: 92, cargo: 52, scan: 58 } },
  { size: "L", minCost: 66, outputMultiplier: 1.35, stats: { hp: 960, armor: 102, attack: 112, accuracy: 68, evasion: 42, speed: 44, fuelCost: 126, cargo: 76, scan: 44 } },
  { size: "XL", minCost: 92, outputMultiplier: 1.75, stats: { hp: 1320, armor: 138, attack: 142, accuracy: 60, evasion: 28, speed: 30, fuelCost: 168, cargo: 108, scan: 34 } }
];

function uniqueList(items) {
  return [...new Set((items || []).map((item) => String(item || "").trim()).filter(Boolean))];
}

function normalizePromptList(value) {
  if (Array.isArray(value)) return uniqueList(value);
  return uniqueList(String(value || "").split("|"));
}

function normalizeColor(value, validColors, fallback) {
  const color = String(value || "").trim().toLowerCase();
  return validColors.includes(color) ? color : fallback;
}

function inferMainColor(core) {
  const text = [core?.category, core?.tagId, core?.promptText, ...(core?.prompts || [])].join(" ").toLowerCase();
  if (/black|dark|void|shadow|jammer|debuff/.test(text)) return "black";
  if (/white|holy|halo|heal|medic|supply/.test(text)) return "white";
  if (/red|ember|fire|assault|melee/.test(text)) return "red";
  if (/blue|ice|ranged|shooter/.test(text)) return "blue";
  if (/green|nature|support|scout/.test(text)) return "green";
  if (/purple|poison|venom|magic/.test(text)) return "purple";
  if (/gold|king|command/.test(text)) return "gold";
  return "silver";
}

function inferSlotType(material) {
  const text = [material?.slotType, material?.category, ...(material?.tags || []), material?.promptText, ...(material?.prompts || [])].join(" ").toLowerCase();
  if (/greatsword|sword|lance|hammer|claw|whip|rifle|cannon|railgun|weapon|blade|fang|armbone|tentacle/.test(text)) return "weapon";
  if (/frame|armor|shell|scale|bone|tendon|muscle|plate/.test(text)) return "frame";
  if (/wing|halo|horn|tail|multiple_arms|membrane|crown/.test(text)) return "wing";
  if (/reactor|core|organ|gland|bloodfilm|nerve|spark|furnace|void/.test(text)) return "reactor";
  return "special";
}

function inferAccentColor(material) {
  const text = [material?.accentColor, material?.category, ...(material?.tags || []), material?.promptText, ...(material?.prompts || [])].join(" ").toLowerCase();
  if (/red|crimson|blood|fire|flame|volcano/.test(text)) return "red";
  if (/blue|ice|frozen|deepsea|aqua/.test(text)) return "blue";
  if (/green|nature|plant|forest|worldtree/.test(text)) return "green";
  if (/purple|poison|toxic|demon|void/.test(text)) return "purple";
  if (/gold|king|royal/.test(text)) return "gold";
  if (/silver|mirror|steel/.test(text)) return "silver";
  if (/white|holy|angel|pure/.test(text)) return "white";
  if (/black|dark|shadow/.test(text)) return "black";
  if (/orange|ember|magma/.test(text)) return "orange";
  if (/cyan|lightning|electric|thunder/.test(text)) return "cyan";
  return "silver";
}

function inferVisualTags(material) {
  const text = [material?.category, ...(material?.tags || []), material?.promptText, ...(material?.prompts || [])].join(" ").toLowerCase();
  const tags = [];
  Object.keys(VISUAL_TAG_PROMPTS).forEach((tag) => {
    const search = tag.replace("_", " ");
    if (text.includes(tag) || text.includes(search)) tags.push(tag);
  });
  if (/fang|blade/.test(text)) tags.push("sword");
  if (/armbone|bone blade/.test(text)) tags.push("greatsword", "bone");
  if (/membrane/.test(text)) tags.push("wing");
  if (/shell|chitin/.test(text)) tags.push("shell");
  if (/reactor|organ|furnace/.test(text)) tags.push("reactor");
  return uniqueList(tags);
}

window.normalizeMechCore = function normalizeMechCore(core) {
  if (!core) return null;
  core.prompts = normalizePromptList(core.prompts || core.promptText);
  core.mainColor = normalizeColor(core.mainColor, VALID_MAIN_COLORS, inferMainColor(core));
  return core;
};

window.normalizeMechMaterial = function normalizeMechMaterial(material) {
  if (!material) return null;
  material.prompts = normalizePromptList(material.prompts || material.promptText);
  material.tags = uniqueList(material.tags || [material.category]);
  material.slotType = ["weapon", "frame", "wing", "reactor", "special"].includes(material.slotType) ? material.slotType : inferSlotType(material);
  material.accentColor = normalizeColor(material.accentColor, VALID_ACCENT_COLORS, inferAccentColor(material));
  material.visualTags = uniqueList(material.visualTags || inferVisualTags(material));
  return material;
};

window.getSynthesisSlotDefs = function getSynthesisSlotDefs() {
  return SYNTHESIS_SLOT_DEFS;
};

window.canMaterialFitSynthesisSlot = function canMaterialFitSynthesisSlot(material, slotIndex) {
  const normalized = window.normalizeMechMaterial(material);
  const slot = SYNTHESIS_SLOT_DEFS[slotIndex];
  if (!normalized || !slot) return false;
  return slot.accepts.includes(normalized.slotType);
};

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
  const generatedCore = typeof window.parseGeneratedMaterialId === "function" && typeof window.buildGeneratedMaterial === "function"
    ? (() => {
      const parsed = window.parseGeneratedMaterialId(coreId);
      const material = parsed ? window.buildGeneratedMaterial(parsed.materialBaseId, parsed.colorId, parsed.qualityId) : null;
      return material && (material.materialRole === "boss_core" || material.materialRole === "core") ? buildCoreFromMaterial(material) : null;
    })()
    : null;
  return window.normalizeMechCore(generatedCore || window.MechCoreCatalog.find((core) => core.id === coreId) || null);
};

function buildCoreFromMaterial(material) {
  const primaryElement = (material.tags || []).find((tag) => ["fire", "cooling", "thunder", "acid", "poison", "nerve", "sonic", "gravity", "optical", "erosion"].includes(tag)) || "none";
  const tag = material.slotType === "weapon"
    ? "melee"
    : material.slotType === "wing"
      ? "ranged"
      : material.slotType === "reactor"
        ? "magic"
        : primaryElement === "erosion"
          ? "command"
          : "general";
  const qualityScore = Number(material.qualityScore || 3);
  return {
    id: material.id,
    materialId: material.id,
    materialBaseId: material.materialBaseId,
    name: material.name,
    rarity: material.rarity || material.rank || "R",
    rank: material.rarity || material.rank || "R",
    category: tag,
    tagId: tag,
    outputLimit: Math.max(80, Math.round(Number(material.value || 120) * 0.35 + qualityScore * 32)),
    mainColor: material.colorId || material.accentColor || "",
    prompts: material.prompts || [],
    promptText: material.promptText || "",
    stats: material.stats || material.statEffects || {},
    sourceMaterial: material,
    isMaterialCore: true,
    description: material.description || material.name
  };
}

window.getMechGenerationMaterial = function getMechGenerationMaterial(materialId) {
  const generated = typeof window.parseGeneratedMaterialId === "function" && typeof window.buildGeneratedMaterial === "function"
    ? (() => {
      const parsed = window.parseGeneratedMaterialId(materialId);
      return parsed ? window.buildGeneratedMaterial(parsed.materialBaseId, parsed.colorId, parsed.qualityId) : null;
    })()
    : null;
  return window.normalizeMechMaterial(window.MechMaterialCatalog.find((material) => material.id === materialId) || generated || null);
};

window.getOwnedCoreIds = function getOwnedCoreIds() {
  const state = window.GameState;
  if (Array.isArray(state.ownedCoreIds) && state.ownedCoreIds.length) return state.ownedCoreIds;
  const materialCounts = typeof window.allMaterialCounts === "function" ? window.allMaterialCounts() : { ...(state.materials || {}), ...(state.runMaterials || {}) };
  const materialCoreIds = Object.entries(materialCounts)
    .filter(([, count]) => Number(count || 0) > 0)
    .map(([id]) => {
      if (typeof window.getMaterial === "function") return window.getMaterial(id);
      if (typeof window.parseGeneratedMaterialId === "function" && typeof window.buildGeneratedMaterial === "function") {
        const parsed = window.parseGeneratedMaterialId(id);
        return parsed ? window.buildGeneratedMaterial(parsed.materialBaseId, parsed.colorId, parsed.qualityId) : null;
      }
      return null;
    })
    .filter((material) => material && (material.materialRole === "boss_core" || material.materialRole === "core"))
    .map((material) => material.id);
  return materialCoreIds;
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
    Object.entries(material.stats || material.statEffects || {}).forEach(([key, value]) => {
      stats[key] = (stats[key] || 0) + Number(value || 0);
    });
    return stats;
  }, { hp: 0, pp: 0, sAtk: 0, mAtk: 0, lAtk: 0, sDef: 0, mDef: 0, lDef: 0, speed: 0 });
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

function calculateGeneratedRarity(core, materials) {
  const scores = [core, ...materials].map((item) => RARITY_SCORE[item.rarity || item.rank] || 1);
  const average = Math.floor(scores.reduce((sum, score) => sum + score, 0) / Math.max(1, scores.length));
  const score = Math.max(1, Math.min(5, average));
  return { rarity: SCORE_RARITY[score] || "N", score };
}

function getCoreTag(core) {
  return CORE_TAG_MAP[core?.tagId || core?.category] || core?.tagId || core?.category || "general";
}

function getRankPromptParts(rarity) {
  const rankRow = typeof window.getMasterById === "function"
    ? window.getMasterById("rankMaster", "rankId", rarity)
    : null;
  const csvPrompt = rankRow?.category === "machine" ? rankRow.promptText : "";
  if (csvPrompt) return csvPrompt.split("|").map((item) => item.trim()).filter(Boolean);
  return RARITY_PROMPTS[rarity] || RARITY_PROMPTS.N;
}

function createGeneratedUnitStats(core, materials, rarityScore, tag) {
  const materialStats = aggregateMaterialStats(materials);
  const coreStats = core.stats || {};
  const rarityBase = {
    hp: 520 + rarityScore * 120,
    pp: 24 + rarityScore * 6,
    sAtk: 48 + rarityScore * 12,
    mAtk: 48 + rarityScore * 12,
    lAtk: 48 + rarityScore * 12,
    sDef: 38 + rarityScore * 10,
    mDef: 38 + rarityScore * 10,
    lDef: 38 + rarityScore * 10,
    speed: 42 + rarityScore * 8
  };
  const tagBias = {
    melee: { sAtk: 1.22, sDef: 1.08, speed: 1.04 },
    ranged: { lAtk: 1.22, lDef: 1.08, speed: 1.03 },
    magic: { mAtk: 1.24, mDef: 1.12, pp: 1.12 },
    supply: { pp: 1.18, mDef: 1.12, speed: 1.04 },
    defense: { hp: 1.2, sDef: 1.2, mDef: 1.1, lDef: 1.16, speed: 0.88 },
    command: { pp: 1.12, lAtk: 1.1, speed: 1.08 },
    jammer: { mAtk: 1.14, mDef: 1.08, speed: 1.1 },
    scout: { speed: 1.28, lAtk: 1.1, hp: 0.9 }
  }[tag] || {};
  const keys = Object.keys(rarityBase);
  return keys.reduce((stats, key) => {
    const value = (rarityBase[key] || 0) + Number(coreStats[key] || 0) + Number(materialStats[key] || 0);
    stats[key] = Math.max(key === "hp" ? 1 : 0, Math.round(value * (tagBias[key] || 1)));
    return stats;
  }, {});
}

function aggregateGeneratedMaterialResists(materials) {
  return materials.reduce((resists, material) => {
    Object.entries(material.resists || {}).forEach(([key, value]) => {
      resists[key] = Math.min(100, Math.max(0, Math.round((resists[key] || 0) + Number(value || 0))));
    });
    return resists;
  }, {});
}

function chooseGeneratedWeaponElement(materials) {
  const counts = materials.reduce((result, material) => {
    (material.tags || []).forEach((tag) => {
      if (["fire", "cooling", "thunder", "acid", "poison", "nerve", "sonic", "gravity", "optical", "erosion"].includes(tag)) {
        result[tag] = (result[tag] || 0) + 1 + Number(material.qualityScore || 0) * 0.1;
      }
    });
    return result;
  }, {});
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || "none";
}

function convertGeneratedStatsToUnitStats(stats) {
  if ("sAtk" in stats || "mAtk" in stats || "lAtk" in stats) {
    return {
      hp: Math.max(1, Math.round(Number(stats.hp || 0))),
      pp: Math.max(0, Math.round(Number(stats.pp || 0))),
      sAtk: Math.max(0, Math.round(Number(stats.sAtk || 0))),
      mAtk: Math.max(0, Math.round(Number(stats.mAtk || 0))),
      lAtk: Math.max(0, Math.round(Number(stats.lAtk || 0))),
      sDef: Math.max(0, Math.round(Number(stats.sDef || 0))),
      mDef: Math.max(0, Math.round(Number(stats.mDef || 0))),
      lDef: Math.max(0, Math.round(Number(stats.lDef || 0))),
      speed: Math.max(0, Math.round(Number(stats.speed || 0)))
    };
  }
  const attack = Number(stats.attack || 0);
  const armor = Number(stats.armor || 0);
  return {
    hp: Math.max(1, Math.round(Number(stats.hp || 0))),
    pp: Math.max(0, Math.round(30 + Number(stats.scan || 0) * 0.2 - Number(stats.fuelCost || 0) * 0.05)),
    sAtk: Math.max(0, Math.round(attack)),
    mAtk: Math.max(0, Math.round(attack)),
    lAtk: Math.max(0, Math.round(attack)),
    sDef: Math.max(0, Math.round(armor * 1.05)),
    mDef: Math.max(0, Math.round(armor * 0.95)),
    lDef: Math.max(0, Math.round(armor)),
    speed: Math.max(0, Math.round(Number(stats.speed || 0)))
  };
}

function createLegacyPreviewStats(unitStats) {
  const attack = Math.max(unitStats.sAtk || 0, unitStats.mAtk || 0, unitStats.lAtk || 0);
  const armor = Math.max(unitStats.sDef || 0, unitStats.mDef || 0, unitStats.lDef || 0);
  return {
    hp: unitStats.hp,
    attack,
    armor,
    accuracy: Math.max(unitStats.lAtk || 0, unitStats.mAtk || 0),
    evasion: unitStats.speed,
    speed: unitStats.speed,
    fuelCost: Math.max(35, Math.round(120 - unitStats.speed * 0.12)),
    cargo: Math.round(unitStats.hp / 40),
    scan: Math.max(unitStats.lAtk || 0, unitStats.mAtk || 0)
  };
}

function roleBasedMaterialPromptParts(materials) {
  const parts = [];
  const normalizedMaterials = materials.map(window.normalizeMechMaterial).filter(Boolean);
  const grouped = normalizedMaterials.reduce((groups, material) => {
    const key = material.slotType || "special";
    groups[key] = groups[key] || [];
    groups[key].push(material);
    return groups;
  }, {});
  if ((grouped.weapon || []).length) {
    parts.push("clearly visible weapon", "weapon held in hand", "large weapon silhouette");
  }
  if ((grouped.wing || []).length) {
    parts.push("large organic wings", "expanded exterior silhouette", "visible back-mounted organic structures");
  }
  if ((grouped.reactor || []).length) {
    parts.push("glowing reactor organs", "colored energy veins", "visible bio-reactor core");
  }
  normalizedMaterials.forEach((material) => {
    parts.push(...(ACCENT_COLOR_PROMPTS[material.accentColor] || []));
    (material.visualTags || []).forEach((tag) => {
      parts.push(...(VISUAL_TAG_PROMPTS[tag] || []));
    });
  });
  return parts;
}

function buildSlotMaterialMap(materialIds) {
  return (materialIds || []).reduce((slots, materialId, index) => {
    const slot = SYNTHESIS_SLOT_DEFS[index];
    if (slot && materialId) slots[slot.key] = materialId;
    return slots;
  }, {});
}

window.buildMechVisualPrompt = function buildMechVisualPrompt(core, materials, size, type, stateName, rarity = "N") {
  const normalizedCore = window.normalizeMechCore(core);
  const normalizedMaterials = materials.map(window.normalizeMechMaterial).filter(Boolean);
  const promptParts = [
    ...MACHINE_COMMON_PROMPT,
    `${size} size ${type} mech`,
    ...getRankPromptParts(rarity),
    ...(MAIN_COLOR_PROMPTS[normalizedCore.mainColor] || []),
    ...normalizedCore.prompts,
    ...roleBasedMaterialPromptParts(normalizedMaterials),
    ...normalizedMaterials.flatMap((material) => material.prompts)
  ];
  if (stateName === "overloaded") promptParts.push("strong biological invasion", "strained power conduits");
  if (stateName === "stable") promptParts.push("balanced reactor glow", "well integrated armor");
  return [...new Set(promptParts)].join(", ");
};

window.previewGeneratedMech = function previewGeneratedMech(coreId, materialIds) {
  const core = window.getMechCore(coreId);
  const materials = materialIds.map(window.getMechGenerationMaterial).filter(Boolean);
  if (!core || materials.length < 3 || materials.length > 5) return null;

  const sizeInfo = chooseGeneratedSize(materials);
  const rarityResult = calculateGeneratedRarity(core, materials);
  const rarity = rarityResult.rarity;
  const rarityScore = rarityResult.score;
  const tag = getCoreTag(core);
  const type = CORE_TYPE_MAP[tag] || CORE_TYPE_MAP.general;
  const materialOutputCost = materials.reduce((sum, material) => sum + Number(material.outputCost || 0), 0);
  const required = Math.round((materialOutputCost + rarityScore * 12 + materials.length * 8) * sizeInfo.outputMultiplier);
  const limit = Number(core.outputLimit || 100);
  const loadRate = required / Math.max(1, limit);
  const stateName = loadRate <= 0.85 ? "stable" : loadRate <= 1.15 ? "normal" : "overloaded";
  const unitStats = createGeneratedUnitStats(core, materials, rarityScore, tag);
  const stats = createLegacyPreviewStats(unitStats);

  return {
    core,
    materials,
    rarity,
    rarityScore,
    tag,
    size: sizeInfo.size,
    type,
    stats,
    unitStats,
    output: {
      limit,
      required,
      margin: limit - required,
      loadRate: Number(loadRate.toFixed(2)),
      state: stateName
    },
    mainColor: core.mainColor,
    accentColors: uniqueList(materials.map((material) => material.accentColor)),
    visualTags: uniqueList(materials.flatMap((material) => material.visualTags || [])),
    slotMaterials: buildSlotMaterialMap(materialIds),
    visualPrompt: window.buildMechVisualPrompt(core, materials, sizeInfo.size, type, stateName, rarity)
  };
};

window.createGeneratedMechData = function createGeneratedMechData(preview, materialIds) {
  const state = window.GameState;
  const usedMaterialIds = (materialIds || []).filter(Boolean);
  const serial = String(state.nextMechSerial || 1).padStart(3, "0");
  state.nextMechSerial = (state.nextMechSerial || 1) + 1;
  const unitStats = convertGeneratedStatsToUnitStats(preview.unitStats || preview.stats);
  const optionSlots = typeof window.getOptionSlotCountByRank === "function" ? window.getOptionSlotCountByRank(preview.rarity) : 1;
  const mech = {
    id: `mech_${serial}`,
    name: `${preview.type}-${serial}`,
    rarity: preview.rarity,
    rank: preview.rarity,
    level: 1,
    size: preview.size,
    type: preview.type,
    coreId: preview.core.id,
    materialIds: [...usedMaterialIds],
    usedCore: preview.core.id,
    usedMaterials: [...usedMaterialIds],
    stats: unitStats,
    legacyStats: preview.stats,
    output: preview.output,
    mainColor: preview.mainColor || preview.core.mainColor || "silver",
    accentColors: [...(preview.accentColors || [])],
    visualTags: [...(preview.visualTags || [])],
    resists: aggregateGeneratedMaterialResists(preview.materials || []),
    slotMaterials: { ...(preview.slotMaterials || {}) },
    prompt: preview.visualPrompt,
    visualPrompt: preview.visualPrompt,
    imageId: `mech_image_${serial}`,
    imagePath: null,
    createdAt: new Date().toISOString(),
    hp: unitStats.hp,
    maxHp: unitStats.hp,
    atk: Math.max(unitStats.sAtk, unitStats.mAtk, unitStats.lAtk),
    def: Math.max(unitStats.sDef, unitStats.mDef, unitStats.lDef),
    mobility: unitStats.speed,
    mainWeapon: {
      id: `mech_${serial}_main_weapon`,
      name: `${preview.type} Main Weapon`,
      rank: preview.rarity,
      weaponType: CORE_WEAPON_TYPE_MAP[preview.tag || preview.core.category] || "melee",
      element: chooseGeneratedWeaponElement(preview.materials || []),
      power: Math.max(1, Math.round(Math.max(unitStats.sAtk, unitStats.mAtk, unitStats.lAtk) * 0.42)),
      ppCost: 0,
      overdrive: null
    },
    subWeapons: [],
    optionSlots,
    optionalSlots: optionSlots,
    equippedOptions: [],
    options: [],
    fuelCostRate: Math.max(0.5, Number((preview.stats.fuelCost / 100).toFixed(2))),
    traits: [preview.type, preview.output.state],
    pilotId: null,
    unique: false,
    customizable: true,
    slotCounts: { weapon: 1, armor: 1, core: 1, option: optionSlots },
    parts: { weapon: null, armor: null, core: preview.core.name, option: null },
    promptTags: preview.materials.flatMap((material) => material.tags || []),
    description: preview.visualPrompt
  };
  mech.tag = preview.tag || getCoreTag(preview.core);
  mech.tags = ["general", mech.tag].filter((tag, index, tags) => tag && tags.indexOf(tag) === index);
  if (typeof window.normalizeMachineStatus === "function") window.normalizeMachineStatus(mech);
  return mech;
};
