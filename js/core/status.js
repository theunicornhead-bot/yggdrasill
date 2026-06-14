"use strict";

const UNIT_STATUS_KEYS = ["hp", "pp", "sAtk", "mAtk", "lAtk", "sDef", "mDef", "lDef", "speed"];
const PILOT_RANKS = ["D", "C", "B", "A", "S"];
const MACHINE_RANKS = ["N", "R", "SR", "SSR", "UR"];
const PILOT_LEVEL_CAPS = { D: 10, C: 20, B: 30, A: 40, S: 50 };
const MACHINE_LEVEL_CAPS = { N: 10, R: 20, SR: 30, SSR: 40, UR: 50 };
const LEGACY_PILOT_RANK_ALIASES = { E: "D", D: "D", C: "C", B: "B", A: "A", S: "S", SS: "S", SSS: "S" };
const LEGACY_MACHINE_RANK_ALIASES = { E: "N", D: "N", C: "R", B: "SR", A: "SSR", S: "UR", N: "N", R: "R", SR: "SR", SSR: "SSR", UR: "UR" };
const TAG_LABELS = {
  general: "汎用",
  melee: "近接",
  ranged: "遠距離",
  magic: "魔法",
  supply: "補給",
  defense: "防衛",
  command: "指揮官",
  jammer: "電子戦",
  scout: "偵察"
};
const TAG_ALIASES = {
  assault: "melee",
  artillery: "ranged",
  shooter: "ranged",
  healer: "supply",
  support: "command",
  debuff: "jammer",
  recon: "scout"
};
const CLASS_TAG_COMPATIBILITY = {
  striker: "melee",
  fighter: "melee",
  gunner: "ranged",
  wizard: "magic",
  dragner: "magic",
  engineer: "supply",
  healer: "supply",
  defender: "defense",
  tank: "defense",
  commander: "command",
  supporter: "command",
  jammer: "jammer",
  hunter: "jammer",
  scout: "scout",
  seeker: "scout"
};
const PILOT_CLASS_ALIASES = { fighter: "striker", healer: "engineer", tank: "defender", dragner: "wizard", supporter: "commander", hunter: "jammer", seeker: "scout" };
const GROWTH_TYPE_LABELS = { early: "Early", normal: "Normal", late: "Late", superLate: "Super Late" };
const GROWTH_TYPE_FACTORS = { early: 0.9, normal: 1, late: 1.1, superLate: 1.2 };
const GROWTH_INITIAL_FACTORS = { early: 1.12, normal: 1, late: 0.92, superLate: 0.84 };
const CLASS_STATUS_PROFILES = {
  striker: { sAtk: 1.25, lAtk: 0.85, mAtk: 0.85, sDef: 1.2, lDef: 0.9, mDef: 0.9, speed: 1 },
  gunner: { sAtk: 0.85, lAtk: 1.25, mAtk: 0.85, sDef: 1, lDef: 1.2, mDef: 0.9, speed: 1 },
  wizard: { sAtk: 0.85, lAtk: 0.85, mAtk: 1.25, sDef: 0.9, lDef: 1, mDef: 1.2, speed: 1 },
  engineer: { sAtk: 0.85, lAtk: 0.85, mAtk: 1.15, sDef: 0.9, lDef: 0.9, mDef: 1, speed: 1 },
  defender: { sAtk: 1, lAtk: 0.85, mAtk: 0.85, sDef: 1.25, lDef: 1.25, mDef: 1.2, speed: 0.85 },
  commander: { sAtk: 0.85, lAtk: 1.15, mAtk: 0.85, sDef: 0.9, lDef: 1, mDef: 1, speed: 1 },
  jammer: { sAtk: 0.85, lAtk: 0.85, mAtk: 1.15, sDef: 0.9, lDef: 0.9, mDef: 1, speed: 1 },
  scout: { sAtk: 1, lAtk: 0.85, mAtk: 0.85, sDef: 0.9, lDef: 0.9, mDef: 0.9, speed: 1.25 }
};
const RANK_STATUS_FACTORS = { D: 0.94, C: 1, B: 1.08, A: 1.18, S: 1.3 };
const BASE_PILOT_STATS = { hp: 320, pp: 42, sAtk: 48, mAtk: 48, lAtk: 48, sDef: 34, mDef: 34, lDef: 34, speed: 40 };
const WEAPON_TYPE_ALIASES = {
  melee: "melee",
  short: "melee",
  s: "melee",
  slash: "melee",
  blunt: "melee",
  ranged: "ranged",
  range: "ranged",
  long: "ranged",
  l: "ranged",
  pierce: "ranged",
  shoot: "ranged",
  capture: "ranged",
  artillery: "ranged",
  magic: "magic",
  m: "magic",
  cannon: "magic"
};
const ELEMENT_WEAKNESS = {
  fire: { ice: 1.5, poison: 0.5 },
  ice: { thunder: 1.5, fire: 0.5 },
  thunder: { poison: 1.5, ice: 0.5 },
  poison: { fire: 1.5, thunder: 0.5 }
};

function statusNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function masterRows(masterName) {
  const rows = window.masterData?.[masterName];
  return Array.isArray(rows) ? rows : [];
}

function masterById(masterName, idKey, id) {
  if (!id) return null;
  if (typeof window.getMasterById === "function") return window.getMasterById(masterName, idKey, id);
  return masterRows(masterName).find((row) => row[idKey] === id) || null;
}

function rankMasterRow(category, rank) {
  const normalized = String(rank || "").toUpperCase();
  return masterRows("rankMaster").find((row) => row.category === category && String(row.rankId).toUpperCase() === normalized) || null;
}

function emptyStats() {
  return UNIT_STATUS_KEYS.reduce((stats, key) => {
    stats[key] = 0;
    return stats;
  }, {});
}

function copyStats(source = {}) {
  return UNIT_STATUS_KEYS.reduce((stats, key) => {
    stats[key] = Math.max(0, Math.floor(statusNumber(source[key], 0)));
    return stats;
  }, {});
}

function addStats(...sources) {
  return sources.reduce((total, source) => {
    UNIT_STATUS_KEYS.forEach((key) => {
      total[key] += statusNumber(source?.[key], 0);
    });
    return total;
  }, emptyStats());
}

function multiplyStats(source, multiplier) {
  return UNIT_STATUS_KEYS.reduce((stats, key) => {
    stats[key] = Math.max(0, Math.floor(statusNumber(source?.[key], 0) * multiplier));
    return stats;
  }, {});
}

window.normalizePilotRank = function normalizePilotRank(rank) {
  const candidate = String(rank || "D").toUpperCase();
  if (rankMasterRow("pilot", candidate)) return candidate;
  return LEGACY_PILOT_RANK_ALIASES[candidate] || "D";
};

window.normalizeMachineRank = function normalizeMachineRank(rank) {
  const candidate = String(rank || "N").toUpperCase();
  if (rankMasterRow("machine", candidate)) return candidate;
  return LEGACY_MACHINE_RANK_ALIASES[candidate] || "N";
};

window.getPilotRankIndex = function getPilotRankIndex(rank) {
  const normalized = window.normalizePilotRank(rank);
  const row = rankMasterRow("pilot", normalized);
  return row ? Math.max(0, statusNumber(row.order, 1) - 1) : PILOT_RANKS.indexOf(normalized);
};

window.getMachineRankIndex = function getMachineRankIndex(rank) {
  const normalized = window.normalizeMachineRank(rank);
  const row = rankMasterRow("machine", normalized);
  return row ? Math.max(0, statusNumber(row.order, 1) - 1) : MACHINE_RANKS.indexOf(normalized);
};

window.getPilotLevelCap = function getPilotLevelCap(rank) {
  const normalized = window.normalizePilotRank(rank);
  const row = rankMasterRow("pilot", normalized);
  return Math.max(1, Math.floor(statusNumber(row?.levelCap, PILOT_LEVEL_CAPS[normalized] || PILOT_LEVEL_CAPS.D)));
};

window.getMachineLevelCap = function getMachineLevelCap(rank) {
  const normalized = window.normalizeMachineRank(rank);
  const row = rankMasterRow("machine", normalized);
  return Math.max(1, Math.floor(statusNumber(row?.levelCap, MACHINE_LEVEL_CAPS[normalized] || MACHINE_LEVEL_CAPS.N)));
};

window.getRankCompatibilityMultiplier = function getRankCompatibilityMultiplier(pilot, machine) {
  if (!pilot || !machine) return 1;
  const diff = window.getMachineRankIndex(machine.rank || machine.rarity) - window.getPilotRankIndex(pilot.rank);
  if (diff <= 0) return 1;
  if (diff === 1) return 0.9;
  if (diff === 2) return 0.85;
  if (diff === 3) return 0.8;
  return 0.75;
};

window.normalizePilotClassId = function normalizePilotClassId(classId) {
  return PILOT_CLASS_ALIASES[classId] || classId || "striker";
};

window.getClassStatusProfile = function getClassStatusProfile(classId) {
  return CLASS_STATUS_PROFILES[window.normalizePilotClassId(classId)] || CLASS_STATUS_PROFILES.striker;
};

window.calculateNextExp = function calculateNextExp(level) {
  const safeLevel = Math.max(1, statusNumber(level, 1));
  return Math.floor(80 + safeLevel * safeLevel * 22 + safeLevel * 18);
};

window.getGrowthTypeLabel = function getGrowthTypeLabel(growthType) {
  return GROWTH_TYPE_LABELS[growthType] || GROWTH_TYPE_LABELS.normal;
};

window.getPilotBaseStats = function getPilotBaseStats(pilot) {
  const classId = window.normalizePilotClassId(pilot?.classId);
  const profile = window.getClassStatusProfile(classId);
  const rankFactor = RANK_STATUS_FACTORS[window.normalizePilotRank(pilot?.rank)] || 1;
  const growthType = pilot?.growthType || "normal";
  const growthFactor = GROWTH_INITIAL_FACTORS[growthType] || 1;
  return UNIT_STATUS_KEYS.reduce((stats, key) => {
    const profileFactor = profile[key] || 1;
    stats[key] = Math.max(1, Math.floor((BASE_PILOT_STATS[key] || 0) * rankFactor * growthFactor * profileFactor));
    return stats;
  }, {});
};

window.normalizePilotStatus = function normalizePilotStatus(pilot) {
  if (!pilot || typeof pilot !== "object") return pilot;
  pilot.rank = window.normalizePilotRank(pilot.rank);
  if (!pilot.growthType) pilot.growthType = "normal";
  const cap = window.getPilotLevelCap(pilot.rank);
  pilot.level = Math.min(cap, Math.max(1, Math.floor(statusNumber(pilot.level, 1))));
  pilot.exp = Math.max(0, Math.floor(statusNumber(pilot.exp, 0)));
  pilot.nextExp = Math.max(1, Math.floor(statusNumber(pilot.nextExp, window.calculateNextExp(pilot.level))));
  pilot.skillPoints = Math.max(0, Math.floor(statusNumber(pilot.skillPoints, 0)));
  if (!Array.isArray(pilot.skills)) pilot.skills = Array.isArray(pilot.learnedSkills) ? [...pilot.learnedSkills] : [];
  if (!Array.isArray(pilot.learnedSkills)) pilot.learnedSkills = [...pilot.skills];
  pilot.skills = pilot.skills.filter((skillId) => !String(skillId).startsWith("trait:"));
  pilot.learnedSkills = pilot.learnedSkills.filter((skillId) => !String(skillId).startsWith("trait:"));
  const traitSkill = window.getPilotTraitSkill(pilot);
  if (traitSkill && !pilot.skills.includes(traitSkill.id)) pilot.skills.push(traitSkill.id);
  if (traitSkill && !pilot.learnedSkills.includes(traitSkill.id)) pilot.learnedSkills.push(traitSkill.id);
  const baseStats = window.getPilotBaseStats(pilot);
  const sourceStats = pilot.stats && typeof pilot.stats === "object" ? pilot.stats : {};
  pilot.stats = UNIT_STATUS_KEYS.reduce((stats, key) => {
    stats[key] = Math.max(0, Math.floor(statusNumber(sourceStats[key] ?? pilot[key], baseStats[key])));
    pilot[key] = stats[key];
    return stats;
  }, {});
  window.learnClassSkillsByLevel(pilot);
  return pilot;
};

window.getPilotTraitSkillId = function getPilotTraitSkillId(pilot) {
  if (!pilot?.traitId) return "";
  return `trait:${pilot.traitId}:${pilot.traitRank || "N"}`;
};

window.getPilotTraitSkill = function getPilotTraitSkill(pilot) {
  const id = window.getPilotTraitSkillId(pilot);
  if (!id) return null;
  const trait = typeof window.getTraitById === "function" ? window.getTraitById(pilot.traitId) : null;
  const name = trait?.trait_name || pilot.traitId;
  return {
    id,
    classId: "trait",
    name: `${name} ${pilot.traitRank || ""}`.trim(),
    description: trait?.description || "",
    learnLevel: 1,
    type: "passive",
    rangeType: "none",
    power: Number(trait?.base_value || 0),
    ppCost: 0,
    target: "passive",
    source: "trait"
  };
};

window.hasPilotTraitSkill = function hasPilotTraitSkill(pilot, traitId) {
  if (!pilot || !traitId) return false;
  if (pilot.traitId === traitId) return true;
  const prefix = `trait:${traitId}:`;
  return Array.isArray(pilot.skills) && pilot.skills.some((skillId) => String(skillId).startsWith(prefix));
};

window.normalizeWeaponType = function normalizeWeaponType(weaponType) {
  const normalized = String(weaponType || "").toLowerCase();
  if (masterById("weaponTypeMaster", "weaponType", normalized)) return normalized;
  return WEAPON_TYPE_ALIASES[normalized] || "melee";
};

window.normalizeElement = function normalizeElement(element) {
  const normalized = String(element || "none").toLowerCase();
  if (masterById("elementMaster", "elementId", normalized)) return normalized;
  return ["none", "fire", "thunder", "ice", "poison"].includes(normalized) ? normalized : "none";
};

window.normalizeMachineTag = function normalizeMachineTag(tag) {
  const normalized = String(tag || "general").trim().toLowerCase();
  if (masterById("tagMaster", "tagId", normalized)) return normalized;
  return TAG_LABELS[normalized] ? normalized : (TAG_ALIASES[normalized] || "general");
};

window.normalizeMachineTags = function normalizeMachineTags(tags) {
  const list = Array.isArray(tags) && tags.length ? tags : ["general"];
  const normalized = list.map(window.normalizeMachineTag);
  return [...new Set(normalized.length ? normalized : ["general"])];
};

window.getMachineTagLabels = function getMachineTagLabels(machine) {
  const tags = window.normalizeMachineTags(machine?.tags);
  return tags.map((tag) => masterById("tagMaster", "tagId", tag)?.displayName || TAG_LABELS[tag] || TAG_LABELS.general);
};

window.getMachineTagCompatibilityMultiplier = function getMachineTagCompatibilityMultiplier(pilot, machine) {
  if (!pilot || !machine) return 1;
  const classId = window.normalizePilotClassId(pilot.classId);
  const expectedTag = CLASS_TAG_COMPATIBILITY[classId] || CLASS_TAG_COMPATIBILITY[pilot.classId];
  const tags = window.normalizeMachineTags(machine.tags);
  return expectedTag && tags.includes(expectedTag) ? 1.2 : 1;
};

window.normalizeMainWeapon = function normalizeMainWeapon(machineOrWeapon) {
  const machine = machineOrWeapon && machineOrWeapon.mainWeapon !== undefined ? machineOrWeapon : null;
  const current = machine ? (machine.mainWeapon && typeof machine.mainWeapon === "object" ? machine.mainWeapon : {}) : (machineOrWeapon || {});
  const machineId = machine?.id || "machine";
  const machineName = machine?.name || "Machine";
  const weaponType = window.normalizeWeaponType(current.weaponType || machine?.weaponRangeType || machine?.rangeType || machine?.weaponType || machine?.type);
  const defaultPower = Math.max(1, Math.floor(statusNumber(current.power ?? machine?.atk ?? machine?.stats?.sAtk, 1)));
  const weapon = {
    id: current.id || `${machineId}_main_weapon`,
    name: current.name || machine?.parts?.weapon || machine?.parts?.rightArm || `${machineName} Main Weapon`,
    rank: window.normalizeMachineRank(current.rank || machine?.rank || machine?.rarity),
    weaponType,
    element: window.normalizeElement(current.element),
    power: defaultPower,
    ppCost: Math.max(0, Math.floor(statusNumber(current.ppCost, 0))),
    overdrive: current.overdrive || null
  };
  if (machine) machine.mainWeapon = weapon;
  return weapon;
};

window.normalizeMachineWeapon = function normalizeMachineWeapon(machine) {
  return window.normalizeMainWeapon(machine);
};

window.normalizeSubWeapon = function normalizeSubWeapon(subWeapon, fallbackId = "sub_weapon") {
  if (!subWeapon || typeof subWeapon !== "object") return null;
  return {
    id: subWeapon.id || fallbackId,
    name: subWeapon.name || "Sub Weapon",
    rank: window.normalizeMachineRank(subWeapon.rank || "N"),
    weaponType: window.normalizeWeaponType(subWeapon.weaponType),
    element: window.normalizeElement(subWeapon.element),
    power: Math.max(1, Math.floor(statusNumber(subWeapon.power, 1))),
    ppCost: Math.max(0, Math.floor(statusNumber(subWeapon.ppCost, 0))),
    ammo: Math.max(0, Math.floor(statusNumber(subWeapon.ammo, subWeapon.maxAmmo ?? 0))),
    maxAmmo: Math.max(0, Math.floor(statusNumber(subWeapon.maxAmmo, subWeapon.ammo ?? 0)))
  };
};

window.normalizeSubWeapons = function normalizeSubWeapons(machine) {
  if (!machine || typeof machine !== "object") return [];
  const source = Array.isArray(machine.subWeapons) ? machine.subWeapons : [];
  machine.subWeapons = source.slice(0, 3).map((subWeapon, index) => window.normalizeSubWeapon(subWeapon, `${machine.id || "machine"}_sub_weapon_${index + 1}`)).filter(Boolean);
  return machine.subWeapons;
};

window.getOptionSlotCountByRank = function getOptionSlotCountByRank(rank) {
  const normalized = window.normalizeMachineRank(rank);
  if (normalized === "SR" || normalized === "SSR") return 2;
  if (normalized === "UR") return 3;
  return 1;
};

window.normalizeOption = function normalizeOption(option, fallbackId = "option") {
  const sourceStats = option?.stats && typeof option.stats === "object" ? option.stats : {};
  return {
    id: option?.id || fallbackId,
    name: option?.name || "Option",
    type: option?.type || "general",
    stats: copyStats(sourceStats),
    subWeapon: option?.subWeapon ? window.normalizeSubWeapon(option.subWeapon, `${fallbackId}_sub_weapon`) : null
  };
};

window.normalizeOptions = function normalizeOptions(machine) {
  if (!machine || typeof machine !== "object") return [];
  const rank = window.normalizeMachineRank(machine.rank || machine.rarity);
  const defaultSlots = window.getOptionSlotCountByRank(rank);
  machine.optionSlots = Math.max(0, Math.floor(statusNumber(machine.optionSlots ?? machine.optionalSlots ?? machine.slotCounts?.option, defaultSlots)));
  machine.optionalSlots = machine.optionSlots;
  const sourceOptions = Array.isArray(machine.equippedOptions)
    ? machine.equippedOptions
    : Array.isArray(machine.options) ? machine.options : [];
  const normalized = sourceOptions.slice(0, machine.optionSlots).map((option, index) => window.normalizeOption(option, `${machine.id || "machine"}_option_${index + 1}`));
  machine.equippedOptions = normalized;
  machine.options = normalized;
  return normalized;
};

window.normalizeMachineOptions = function normalizeMachineOptions(machine) {
  return window.normalizeOptions(machine);
};

window.normalizeMachineStatus = function normalizeMachineStatus(machine) {
  if (!machine || typeof machine !== "object") return machine;
  machine.rank = window.normalizeMachineRank(machine.rank || machine.rarity);
  machine.rarity = machine.rank;
  machine.level = Math.min(window.getMachineLevelCap(machine.rank), Math.max(1, Math.floor(statusNumber(machine.level, 1))));
  machine.tags = window.normalizeMachineTags(machine.tags);
  const sourceStats = machine.stats && typeof machine.stats === "object" ? machine.stats : {};
  const fallback = {
    hp: statusNumber(sourceStats.hp ?? machine.maxHp ?? machine.hp, 0),
    pp: statusNumber(sourceStats.pp, 0),
    sAtk: statusNumber(sourceStats.sAtk ?? sourceStats.attack ?? machine.atk, 0),
    mAtk: statusNumber(sourceStats.mAtk ?? sourceStats.attack ?? machine.atk, 0),
    lAtk: statusNumber(sourceStats.lAtk ?? sourceStats.attack ?? machine.atk, 0),
    sDef: statusNumber(sourceStats.sDef ?? sourceStats.armor ?? machine.def, 0),
    mDef: statusNumber(sourceStats.mDef ?? sourceStats.armor ?? machine.def, 0),
    lDef: statusNumber(sourceStats.lDef ?? sourceStats.armor ?? machine.def, 0),
    speed: statusNumber(sourceStats.speed ?? machine.mobility, 0)
  };
  machine.stats = UNIT_STATUS_KEYS.reduce((stats, key) => {
    stats[key] = Math.max(0, Math.floor(statusNumber(sourceStats[key], fallback[key])));
    return stats;
  }, {});
  machine.hp = Math.max(0, Math.floor(statusNumber(machine.hp, machine.stats.hp)));
  machine.maxHp = Math.max(machine.hp, Math.floor(statusNumber(machine.maxHp, machine.stats.hp)));
  machine.atk = Math.floor(statusNumber(machine.atk, Math.max(machine.stats.sAtk, machine.stats.mAtk, machine.stats.lAtk)));
  machine.def = Math.floor(statusNumber(machine.def, Math.max(machine.stats.sDef, machine.stats.mDef, machine.stats.lDef)));
  machine.mobility = Math.floor(statusNumber(machine.mobility, machine.stats.speed));
  window.normalizeMainWeapon(machine);
  window.normalizeSubWeapons(machine);
  window.normalizeOptions(machine);
  return machine;
};

window.calculateOptionStats = function calculateOptionStats(machine) {
  window.normalizeOptions(machine);
  return (machine?.options || []).reduce((stats, option) => {
    UNIT_STATUS_KEYS.forEach((key) => {
      stats[key] += statusNumber(option.stats?.[key], 0);
    });
    return stats;
  }, emptyStats());
};

window.calculateMachineStatsWithOptions = function calculateMachineStatsWithOptions(machine) {
  window.normalizeMachineStatus(machine);
  return addStats(machine?.stats, window.calculateOptionStats(machine));
};

window.calculateFinalUnitStats = function calculateFinalUnitStats(pilot, machine) {
  if (pilot) window.normalizePilotStatus(pilot);
  window.normalizeMachineStatus(machine);
  const pilotStats = pilot ? copyStats(pilot.stats) : emptyStats();
  const machineStats = window.calculateMachineStatsWithOptions(machine);
  const rankMultiplier = window.getRankCompatibilityMultiplier(pilot, machine);
  const adjustedMachineStats = multiplyStats(machineStats, rankMultiplier);
  return addStats(pilotStats, adjustedMachineStats);
};

window.calculateUnitStats = function calculateUnitStats(pilot, machine) {
  return window.calculateFinalUnitStats(pilot, machine);
};

window.getMainWeapon = function getMainWeapon(machine) {
  return window.normalizeMainWeapon(machine);
};

window.getAttackStatByWeaponType = function getAttackStatByWeaponType(unitStats, weaponType) {
  const type = window.normalizeWeaponType(weaponType);
  const statKey = masterById("weaponTypeMaster", "weaponType", type)?.attackStat;
  if (statKey) return statusNumber(unitStats?.[statKey], 0);
  if (type === "magic") return statusNumber(unitStats?.mAtk, 0);
  if (type === "ranged") return statusNumber(unitStats?.lAtk, 0);
  return statusNumber(unitStats?.sAtk, 0);
};

window.getDefenseStatByWeaponType = function getDefenseStatByWeaponType(unitStats, weaponType) {
  const type = window.normalizeWeaponType(weaponType);
  const statKey = masterById("weaponTypeMaster", "weaponType", type)?.defenseStat;
  if (statKey) return statusNumber(unitStats?.[statKey], 0);
  if (type === "magic") return statusNumber(unitStats?.mDef, 0);
  if (type === "ranged") return statusNumber(unitStats?.lDef, 0);
  return statusNumber(unitStats?.sDef, 0);
};

window.calculateWeaponAttackPower = function calculateWeaponAttackPower(pilot, machine, weapon) {
  const unitStats = window.calculateFinalUnitStats(pilot, machine);
  const normalizedWeapon = weapon || window.getMainWeapon(machine);
  return window.getAttackStatByWeaponType(unitStats, normalizedWeapon?.weaponType) + statusNumber(normalizedWeapon?.power, 0);
};

window.getAttackStatByRangeType = function getAttackStatByRangeType(stats, rangeType) {
  return window.getAttackStatByWeaponType(stats, rangeType);
};

window.getDefenseStatByRangeType = function getDefenseStatByRangeType(stats, rangeType) {
  return window.getDefenseStatByWeaponType(stats, rangeType);
};

function elementMultiplier(attackerElement, defenderElement) {
  const attack = window.normalizeElement(attackerElement);
  const defense = window.normalizeElement(defenderElement);
  if (attack === "none" || defense === "none") return 1;
  return ELEMENT_WEAKNESS[attack]?.[defense] || 1;
}

window.calculateDamage = function calculateDamage(attackerStats, defenderStats, weapon, options = {}) {
  const normalizedWeapon = weapon || { weaponType: "melee", power: 0, element: "none" };
  const attack = window.getAttackStatByWeaponType(attackerStats, normalizedWeapon.weaponType) + statusNumber(normalizedWeapon.power, 0);
  const defense = window.getDefenseStatByWeaponType(defenderStats, normalizedWeapon.weaponType);
  const guardMultiplier = options.defending ? 0.8 : 1;
  const criticalMultiplier = options.critical ? 1.5 : 1;
  const skillMultiplier = statusNumber(options.multiplier, 1);
  const affinity = elementMultiplier(normalizedWeapon.element, options.defenderElement || defenderStats?.element);
  return Math.max(1, Math.floor((attack * skillMultiplier - defense) * affinity * guardMultiplier * criticalMultiplier));
};

window.applyBuffDebuff = function applyBuffDebuff(target, effect) {
  if (!target || !effect) return target;
  if (!Array.isArray(target.buffs)) target.buffs = [];
  target.buffs.push({ ...effect, turns: Math.max(1, Math.floor(statusNumber(effect.turns, 1))) });
  return target;
};

window.applyStatusAilment = function applyStatusAilment(target, ailment) {
  if (!target || !ailment) return target;
  if (!Array.isArray(target.statusAilments)) target.statusAilments = [];
  target.statusAilments.push({ ...ailment, turns: Math.max(1, Math.floor(statusNumber(ailment.turns, 1))) });
  return target;
};

window.tickStatusAilments = function tickStatusAilments(target) {
  if (!target || !Array.isArray(target.statusAilments)) return [];
  target.statusAilments = target.statusAilments.map((ailment) => ({ ...ailment, turns: Math.max(0, Math.floor(statusNumber(ailment.turns, 0)) - 1) })).filter((ailment) => ailment.turns > 0);
  return target.statusAilments;
};

window.gainOverdrive = function gainOverdrive(unit, amount) {
  if (!unit) return 0;
  unit.overdrive = Math.max(0, Math.min(100, statusNumber(unit.overdrive, 0) + statusNumber(amount, 0)));
  return unit.overdrive;
};

window.canUseOverdrive = function canUseOverdrive(unit) {
  return statusNumber(unit?.overdrive, 0) >= 100;
};

window.canEquipMainWeapon = function canEquipMainWeapon(machine, weapon) {
  if (!machine || !weapon) return false;
  window.normalizeMachineStatus(machine);
  const weaponType = window.normalizeWeaponType(weapon.weaponType);
  const tags = window.normalizeMachineTags(machine.tags);
  return tags.includes("general") || tags.includes(weaponType);
};

window.equipMainWeapon = function equipMainWeapon(machine, weapon) {
  if (!window.canEquipMainWeapon(machine, weapon)) return false;
  machine.mainWeapon = window.normalizeMainWeapon(weapon);
  return true;
};

window.canEquipOption = function canEquipOption(machine, option) {
  if (!machine || !option) return false;
  window.normalizeOptions(machine);
  if (machine.options.length >= machine.optionSlots) return false;
  return !machine.options.some((equipped) => equipped.type === option.type);
};

window.equipOption = function equipOption(machine, option) {
  if (!window.canEquipOption(machine, option)) return false;
  machine.options.push(window.normalizeOption(option, option.id));
  machine.equippedOptions = machine.options;
  return true;
};

window.generateEnemyStats = function generateEnemyStats(enemy, floor = 1) {
  const level = Math.max(1, Math.floor(statusNumber(enemy?.level, floor)));
  const baseAtk = statusNumber(enemy?.atk, 60 + level * 8);
  const baseDef = statusNumber(enemy?.def, 28 + level * 4);
  return {
    hp: Math.max(1, Math.floor(statusNumber(enemy?.maxHp ?? enemy?.hp, 500 + level * 80))),
    pp: Math.max(0, Math.floor(statusNumber(enemy?.pp, 0))),
    sAtk: Math.floor(statusNumber(enemy?.sAtk, baseAtk)),
    mAtk: Math.floor(statusNumber(enemy?.mAtk, baseAtk)),
    lAtk: Math.floor(statusNumber(enemy?.lAtk, baseAtk)),
    sDef: Math.floor(statusNumber(enemy?.sDef, baseDef)),
    mDef: Math.floor(statusNumber(enemy?.mDef, baseDef)),
    lDef: Math.floor(statusNumber(enemy?.lDef, baseDef)),
    speed: Math.floor(statusNumber(enemy?.speed, level * 4))
  };
};

window.getEnemiesForFloor = function getEnemiesForFloor(floor = 1) {
  const catalog = Array.isArray(window.EnemyCatalog) ? window.EnemyCatalog : [];
  return catalog.map((enemy) => ({ ...enemy, ...window.generateEnemyStats(enemy, floor) }));
};

window.learnClassSkillsByLevel = function learnClassSkillsByLevel(pilot) {
  if (!pilot || !Array.isArray(window.ClassSkillMaster)) return [];
  const classId = window.normalizePilotClassId(pilot.classId);
  if (!Array.isArray(pilot.skills)) pilot.skills = [];
  const learned = [];
  window.ClassSkillMaster.filter((skill) => skill.classId === classId && skill.learnLevel <= pilot.level).forEach((skill) => {
    if (!pilot.skills.includes(skill.id)) {
      pilot.skills.push(skill.id);
      learned.push(skill.id);
    }
  });
  if (!Array.isArray(pilot.learnedSkills)) pilot.learnedSkills = [];
  pilot.skills.forEach((skillId) => {
    if (!pilot.learnedSkills.includes(skillId)) pilot.learnedSkills.push(skillId);
  });
  return learned;
};

window.levelUpPilot = function levelUpPilot(pilot) {
  window.normalizePilotStatus(pilot);
  const cap = window.getPilotLevelCap(pilot.rank);
  if (pilot.level >= cap) {
    pilot.exp = 0;
    pilot.nextExp = window.calculateNextExp(pilot.level);
    return [];
  }
  pilot.level += 1;
  pilot.skillPoints = Math.max(0, statusNumber(pilot.skillPoints, 0)) + 1;
  const profile = window.getClassStatusProfile(pilot.classId);
  const growthFactor = GROWTH_TYPE_FACTORS[pilot.growthType] || 1;
  UNIT_STATUS_KEYS.forEach((key) => {
    const baseGain = key === "hp" ? 22 : key === "pp" ? 3 : 4;
    const gain = Math.max(1, Math.floor(baseGain * (profile[key] || 1) * growthFactor));
    pilot.stats[key] += gain;
    pilot[key] = pilot.stats[key];
  });
  pilot.nextExp = window.calculateNextExp(pilot.level);
  return window.learnClassSkillsByLevel(pilot);
};

window.addPilotExp = function addPilotExp(pilot, expAmount) {
  if (!pilot) return [];
  window.normalizePilotStatus(pilot);
  pilot.exp += Math.max(0, statusNumber(expAmount, 0));
  const learned = [];
  while (pilot.level < window.getPilotLevelCap(pilot.rank) && pilot.exp >= pilot.nextExp) {
    pilot.exp -= pilot.nextExp;
    learned.push(...window.levelUpPilot(pilot));
  }
  if (pilot.level >= window.getPilotLevelCap(pilot.rank)) pilot.exp = 0;
  return learned;
};

window.getLearnedClassSkills = function getLearnedClassSkills(pilot) {
  if (!pilot || !Array.isArray(window.ClassSkillMaster)) return [];
  window.normalizePilotStatus(pilot);
  const ids = new Set(pilot.skills || []);
  return window.ClassSkillMaster.filter((skill) => ids.has(skill.id));
};

window.getLearnedPilotSkills = function getLearnedPilotSkills(pilot) {
  if (!pilot) return [];
  window.normalizePilotStatus(pilot);
  const ids = new Set(pilot.skills || []);
  const classSkills = Array.isArray(window.ClassSkillMaster) ? window.ClassSkillMaster.filter((skill) => ids.has(skill.id)) : [];
  const traitSkill = window.getPilotTraitSkill(pilot);
  const skills = traitSkill && ids.has(traitSkill.id) ? [traitSkill, ...classSkills] : classSkills;
  const knownIds = new Set(skills.map((skill) => skill.id));
  (pilot.learnedSkills || []).forEach((skillId) => {
    if (knownIds.has(skillId) || String(skillId).startsWith("trait:")) return;
    const legacySkill = window.GameState?.masters?.skills?.find((item) => item.skill_id === skillId);
    skills.push({
      id: skillId,
      name: legacySkill?.skill_name || skillId,
      description: legacySkill?.description || legacySkill?.effect_type || "",
      type: legacySkill?.effect_type || "passive",
      rangeType: "none",
      target: "passive",
      source: "legacy"
    });
  });
  return skills;
};

window.getNextClassSkill = function getNextClassSkill(pilot) {
  if (!pilot || !Array.isArray(window.ClassSkillMaster)) return null;
  window.normalizePilotStatus(pilot);
  const classId = window.normalizePilotClassId(pilot.classId);
  const ids = new Set(pilot.skills || []);
  return window.ClassSkillMaster.filter((skill) => skill.classId === classId && !ids.has(skill.id)).sort((a, b) => a.learnLevel - b.learnLevel)[0] || null;
};

window.getMachineCompatibilityMultiplier = function getMachineCompatibilityMultiplier(pilot, machine) {
  return window.getMachineTagCompatibilityMultiplier(pilot, machine) * window.getRankCompatibilityMultiplier(pilot, machine);
};

window.normalizeAllUnitStatuses = function normalizeAllUnitStatuses() {
  const state = window.GameState;
  if (!state) return;
  (state.pilots || []).forEach(window.normalizePilotStatus);
  (state.tavernCandidates || []).forEach(window.normalizePilotStatus);
  (state.mechs || []).forEach(window.normalizeMachineStatus);
  (window.EnemyCatalog || []).forEach((enemy) => {
    const stats = window.generateEnemyStats(enemy, state.quest?.floor || 1);
    Object.assign(enemy, stats);
    enemy.hp = statusNumber(enemy.hp, stats.hp);
    enemy.maxHp = statusNumber(enemy.maxHp, stats.hp);
    enemy.atk = Math.max(enemy.sAtk, enemy.mAtk, enemy.lAtk);
    enemy.def = Math.max(enemy.sDef, enemy.mDef, enemy.lDef);
    enemy.weaponType = window.normalizeWeaponType(enemy.weaponType || enemy.rangeType || "melee");
    enemy.element = window.normalizeElement(enemy.element);
  });
};
