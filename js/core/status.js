"use strict";

const UNIT_STATUS_KEYS = ["hp", "pp", "sAtk", "mAtk", "lAtk", "sDef", "mDef", "lDef", "speed"];
const PILOT_RANKS = ["D", "C", "B", "A", "S"];
const MACHINE_RANKS = ["N", "R", "SR", "SSR", "UR"];
const PILOT_LEVEL_CAPS = { D: 10, C: 20, B: 30, A: 40, S: 50 };
const MACHINE_LEVEL_CAPS = { N: 10, R: 20, SR: 30, SSR: 40, UR: 50 };
window.MACHINE_ENHANCE_EXP_BY_RARITY = { N: 10, R: 50, SR: 200, SSR: 1000, UR: 5000 };
window.MACHINE_LEVEL_EXP_TABLE = { 1: 100, 2: 150, 3: 220, 4: 320, 5: 460 };
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
  ace: "melee",
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
  ace: { sAtk: 1.22, lAtk: 1.05, mAtk: 0.9, sDef: 1.1, lDef: 1.02, mDef: 0.95, speed: 1.08 },
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
const LEGACY_TALENT_ALIASES = {
  large_specialist: "size_l_specialist",
  medium_specialist: "size_m_specialist",
  small_specialist: "size_s_specialist"
};
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

window.calculateMachineNextExp = function calculateMachineNextExp(level) {
  const safeLevel = Math.max(1, statusNumber(level, 1));
  return Math.max(1, Math.floor(window.MACHINE_LEVEL_EXP_TABLE[safeLevel] || Math.round(100 * Math.pow(1.45, safeLevel - 1))));
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

function clampTalentRank(rank) {
  if (typeof rank === "string") {
    const letterRank = { E: 1, D: 1, C: 2, B: 3, A: 4, S: 5 }[rank.toUpperCase()];
    if (letterRank) return letterRank;
  }
  return Math.min(5, Math.max(1, Math.floor(statusNumber(rank, 1))));
}

function normalizeTalentId(talentId) {
  const id = String(talentId || "").trim();
  return LEGACY_TALENT_ALIASES[id] || id;
}

function makeTalentSkill(talent) {
  const master = window.getTalentMaster(talent.talentId);
  const value = window.getTalentEffectValue(talent);
  return {
    id: `trait:${talent.talentId}:${talent.rank}`,
    classId: "talent",
    name: `${master?.name || master?.trait_name || talent.talentId} R${talent.rank}`,
    description: master?.description || "",
    learnLevel: 1,
    type: "passive",
    rangeType: "none",
    power: value,
    ppCost: 0,
    target: "passive",
    source: "talent",
    talentId: talent.talentId,
    rank: talent.rank
  };
}

window.getPilotTalentLimitByRank = function getPilotTalentLimitByRank(rank) {
  return { D: 1, C: 2, B: 3, A: 4, S: 5 }[window.normalizePilotRank(rank)] || 1;
};

window.getPilotTalents = function getPilotTalents(pilot) {
  if (!pilot || typeof pilot !== "object") return [];
  if (!Array.isArray(pilot.talents)) window.normalizePilotStatus(pilot);
  return Array.isArray(pilot.talents) ? pilot.talents : [];
};

window.getTalentMaster = function getTalentMaster(talentId) {
  const id = normalizeTalentId(talentId);
  if (typeof window.getTalentMasterById === "function") return window.getTalentMasterById(id);
  return window.GameState?.masters?.talents?.find((item) => item.talentId === id || item.trait_id === id)
    || (typeof window.getTraitById === "function" ? window.getTraitById(id) : null)
    || null;
};

window.getTalentEffectValue = function getTalentEffectValue(talent) {
  const master = window.getTalentMaster(talent?.talentId || talent);
  const rank = clampTalentRank(talent?.rank || 1);
  const base = statusNumber(master?.value ?? master?.base_value, 0);
  const scaling = statusNumber(master?.rankScaling ?? master?.rank_scaling, 0);
  return base + scaling * (rank - 1);
};

window.hasPilotTalent = function hasPilotTalent(pilot, talentId) {
  const id = normalizeTalentId(talentId);
  return window.getPilotTalents(pilot).some((talent) => talent.talentId === id);
};

window.getAllowedTalentsForClass = function getAllowedTalentsForClass(classId) {
  const normalizedClassId = window.normalizePilotClassId(classId);
  const talents = window.GameState?.masters?.talents?.length ? window.GameState.masters.talents : (window.GameState?.masters?.traits || []);
  return talents.filter((talent) => {
    const raw = talent.allowedClasses ?? talent.allowed_classes ?? "";
    const allowed = String(raw || "all").split("|").map((item) => window.normalizePilotClassId(item.trim())).filter(Boolean);
    return !allowed.length || allowed.includes("all") || allowed.includes(normalizedClassId);
  });
};

window.rollTalentForPilot = function rollTalentForPilot(pilot) {
  const owned = new Set(window.getPilotTalents(pilot).map((talent) => talent.talentId));
  const classTalents = window.getAllowedTalentsForClass(pilot?.classId).filter((talent) => !owned.has(normalizeTalentId(talent.talentId || talent.trait_id)));
  const allTalents = (window.GameState?.masters?.talents || []).filter((talent) => {
    const raw = String(talent.allowedClasses || "all");
    return (raw === "" || raw === "all") && !owned.has(normalizeTalentId(talent.talentId || talent.trait_id));
  });
  const pool = classTalents.length ? classTalents : allTalents;
  const picked = pool[Math.floor(Math.random() * pool.length)];
  return picked ? { talentId: normalizeTalentId(picked.talentId || picked.trait_id), rank: 1 } : null;
};

window.addTalentToPilot = function addTalentToPilot(pilot, talent = null) {
  if (!pilot) return null;
  window.normalizePilotStatus(pilot);
  const limit = window.getPilotTalentLimitByRank(pilot.rank);
  if (pilot.talents.length >= limit) return null;
  const nextTalent = talent || window.rollTalentForPilot(pilot);
  if (!nextTalent || window.hasPilotTalent(pilot, nextTalent.talentId)) return null;
  pilot.talents.push({ talentId: normalizeTalentId(nextTalent.talentId), rank: clampTalentRank(nextTalent.rank) });
  window.normalizePilotStatus(pilot);
  return pilot.talents[pilot.talents.length - 1] || null;
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
  const talentMap = new Map();
  (Array.isArray(pilot.talents) ? pilot.talents : []).forEach((talent) => {
    const talentId = normalizeTalentId(talent?.talentId || talent?.traitId || talent?.id);
    if (!talentId || talentMap.has(talentId)) return;
    talentMap.set(talentId, { talentId, rank: clampTalentRank(talent.rank ?? talent.traitRank) });
  });
  if (pilot.traitId) {
    const talentId = normalizeTalentId(pilot.traitId);
    if (talentId && !talentMap.has(talentId)) talentMap.set(talentId, { talentId, rank: clampTalentRank(pilot.traitRank) });
  }
  pilot.talents = [...talentMap.values()].slice(0, window.getPilotTalentLimitByRank(pilot.rank));
  pilot.skills = pilot.skills.filter((skillId) => !String(skillId).startsWith("trait:"));
  pilot.learnedSkills = pilot.learnedSkills.filter((skillId) => !String(skillId).startsWith("trait:"));
  const talentSkills = window.getPilotTalentSkills(pilot);
  talentSkills.forEach((skill) => {
    if (!pilot.skills.includes(skill.id)) pilot.skills.push(skill.id);
    if (!pilot.learnedSkills.includes(skill.id)) pilot.learnedSkills.push(skill.id);
  });
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
  const talent = window.getPilotTalents(pilot)[0];
  return talent ? `trait:${talent.talentId}:${talent.rank}` : "";
};

window.getPilotTalentSkills = function getPilotTalentSkills(pilot) {
  return window.getPilotTalents(pilot).map(makeTalentSkill);
};

window.getPilotTraitSkill = function getPilotTraitSkill(pilot) {
  return window.getPilotTalentSkills(pilot)[0] || null;
};

window.hasPilotTraitSkill = function hasPilotTraitSkill(pilot, traitId) {
  if (!pilot || !traitId) return false;
  if (window.hasPilotTalent(pilot, traitId)) return true;
  const prefix = `trait:${normalizeTalentId(traitId)}:`;
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
  const aliases = { water: "cooling", wind: "sonic", light: "optical", dark: "erosion" };
  if (aliases[normalized]) return aliases[normalized];
  return ["none", "fire", "cooling", "thunder", "ice", "acid", "poison", "nerve", "sonic", "gravity", "optical", "erosion"].includes(normalized) ? normalized : "none";
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
  machine.exp = Math.max(0, Math.floor(statusNumber(machine.exp, 0)));
  machine.nextExp = window.calculateMachineNextExp(machine.level);
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

function elementResistanceMultiplier(defenderStats, elementId) {
  const element = String(elementId || "none");
  if (!element || element === "none") return 1;
  const resistValue = statusNumber(defenderStats?.resists?.[`${element}Resist`] ?? defenderStats?.[`${element}Resist`], 0);
  return Math.max(0, 1 - Math.min(100, resistValue) / 100);
}

window.calculateDamage = function calculateDamage(attackerStats, defenderStats, weapon, options = {}) {
  const normalizedWeapon = weapon || { weaponType: "melee", power: 0, element: "none" };
  const attack = window.getAttackStatByWeaponType(attackerStats, normalizedWeapon.weaponType) + statusNumber(normalizedWeapon.power, 0);
  const defense = window.getDefenseStatByWeaponType(defenderStats, normalizedWeapon.weaponType);
  const guardMultiplier = options.defending ? 0.8 : 1;
  const criticalMultiplier = options.critical ? 1.5 : 1;
  const skillMultiplier = statusNumber(options.multiplier, 1);
  const affinity = elementMultiplier(normalizedWeapon.element, options.defenderElement || defenderStats?.element);
  const weaknessMultiplier = typeof window.calculateWeaknessDamageMultiplier === "function" && (options.defenderEnemyId || defenderStats?.enemyId)
    ? window.calculateWeaknessDamageMultiplier(window.normalizeWeaponType(normalizedWeapon.weaponType), window.normalizeElement(normalizedWeapon.element), options.defenderEnemyId || defenderStats.enemyId)
    : 1;
  const resistMultiplier = elementResistanceMultiplier(defenderStats, normalizedWeapon.element);
  return Math.max(1, Math.floor((attack * skillMultiplier - defense) * affinity * weaknessMultiplier * resistMultiplier * guardMultiplier * criticalMultiplier));
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

function findFloorPowerRow(floor) {
  const rows = Array.isArray(window.masterData?.floorEnemyPowerMaster) ? window.masterData.floorEnemyPowerMaster : [];
  return rows.find((row) => floor >= Number(row.startFloor || 1) && floor <= Number(row.endFloor || row.startFloor || 1)) || null;
}

function planetEnemyScale(planet, floor) {
  const low = statusNumber(planet?.lowFloorEnemyScale, 1);
  const final = statusNumber(planet?.finalFloorEnemyScale, 1);
  return low + (final - low) * ((Math.max(1, floor) - 1) / 49);
}

function rateRow(masterName, idKey, id, fallback = {}) {
  if (typeof window.getMasterById === "function") return window.getMasterById(masterName, idKey, id) || fallback;
  return fallback;
}

window.generateEnemyStats = function generateEnemyStats(enemy, floor = 1) {
  const level = Math.max(1, Math.floor(statusNumber(enemy?.level, floor)));
  const planet = typeof window.getPlanetById === "function" ? window.getPlanetById(enemy?.planetId) : null;
  const isBoss = enemy?.spawnType === "boss" || enemy?.enemyTier === "boss" || enemy?.role === "boss";
  const powerRow = findFloorPowerRow(floor);
  const masterPower = statusNumber(isBoss ? powerRow?.bossPower : powerRow?.baseEnemyPower, 0);
  const role = rateRow("enemyRoleMaster", "role", enemy?.role || (isBoss ? "boss" : "balanced"), { hpRate: 1, atkRate: 1, defRate: 1, speedRate: 1 });
  const style = rateRow("planetCombatStyleMaster", "planetId", enemy?.planetId, { hpRate: 1, atkRate: 1, defRate: 1, speedRate: 1 });
  const color = rateRow("colorMaster", "colorId", enemy?.colorId, { hpRate: 1, atkRate: 1, defRate: 1, speedRate: 1 });
  const scale = planetEnemyScale(planet, floor);
  if (masterPower > 0) {
    const hpBase = masterPower * (isBoss ? 8.5 : 5.2);
    const atkBase = masterPower * 1.08;
    const defBase = masterPower * 0.52;
    const speedBase = 28 + masterPower * 0.12;
    const hp = Math.max(1, Math.round(hpBase * scale * statusNumber(role.hpRate, 1) * statusNumber(style.hpRate, 1) * statusNumber(color.hpRate, 1)));
    const atk = Math.max(1, Math.round(atkBase * scale * statusNumber(role.atkRate, 1) * statusNumber(style.atkRate, 1) * statusNumber(color.atkRate, 1)));
    const def = Math.max(0, Math.round(defBase * scale * statusNumber(role.defRate, 1) * statusNumber(style.defRate, 1) * statusNumber(color.defRate, 1)));
    const speed = Math.max(1, Math.round(speedBase * scale * statusNumber(role.speedRate, 1) * statusNumber(style.speedRate, 1) * statusNumber(color.speedRate, 1)));
    const type = window.normalizeWeaponType(enemy?.weaponType || enemy?.attackType || "melee");
    return {
      hp,
      pp: Math.max(0, Math.round(masterPower * 0.08)),
      sAtk: type === "melee" ? atk : Math.round(atk * 0.72),
      mAtk: type === "magic" ? atk : Math.round(atk * 0.72),
      lAtk: type === "ranged" ? atk : Math.round(atk * 0.72),
      sDef: def,
      mDef: Math.round(def * 0.95),
      lDef: Math.round(def),
      speed,
      enemyId: enemy?.id || enemy?.enemyId
    };
  }
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
    speed: Math.floor(statusNumber(enemy?.speed, level * 4)),
    enemyId: enemy?.id || enemy?.enemyId
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

window.getNextPilotRank = function getNextPilotRank(rank) {
  const normalized = window.normalizePilotRank(rank);
  const index = PILOT_RANKS.indexOf(normalized);
  return index >= 0 && index < PILOT_RANKS.length - 1 ? PILOT_RANKS[index + 1] : null;
};

window.getPilotRankUpRequirement = function getPilotRankUpRequirement(pilot) {
  const nextRank = window.getNextPilotRank(pilot?.rank);
  if (!nextRank) return { nextRank: null, materials: [], message: "最高ランクです。" };
  const fromRank = window.normalizePilotRank(pilot?.rank);
  const rows = Array.isArray(window.masterData?.pilotRankupRequirementMaster) ? window.masterData.pilotRankupRequirementMaster : [];
  const requirement = rows.find((row) => row.fromRank === fromRank && row.toRank === nextRank);
  if (!requirement) {
    const fallback = { C: [{ id: "thin_membrane", count: 2 }], B: [{ id: "dry_nerve", count: 2 }], A: [{ id: "aged_scale", count: 3 }], S: [{ id: "live_nerve", count: 2 }] }[nextRank] || [];
    return { nextRank, materials: fallback, message: fallback.length ? "" : "必要素材未設定" };
  }
  const classPlanetRows = Array.isArray(window.masterData?.classRankPlanetMaster) ? window.masterData.classRankPlanetMaster : [];
  const classPlanet = classPlanetRows.find((row) => row.classId === window.normalizePilotClassId(pilot?.classId) && row.fromRank === fromRank && row.toRank === nextRank);
  const requiredPlanetId = classPlanet?.requiredPlanetId || (nextRank === "C" ? "planet_001" : "");
  const requiredQuality = window.getMaterialQualityMaster ? window.getMaterialQualityMaster(requirement.requiredQualityId) : { qualityScore: 1 };
  return {
    nextRank,
    materials: [],
    generatedRequirement: {
      requiredPlanetId,
      requiredQualityId: requirement.requiredQualityId,
      requiredQualityScore: Number(requiredQuality.qualityScore || 1),
      requiredBossMaterialCount: Math.max(0, Number(requirement.requiredBossMaterialCount || 0)),
      requiredMaterialCount: Math.max(0, Number(requirement.requiredMaterialCount || 0)),
      allowAnyColor: String(requirement.allowAnyColor) === "true"
    },
    message: requirement.description || ""
  };
};

function generatedMaterialMeetsRankup(material, requirement) {
  if (!material || !requirement) return false;
  if (Number(material.qualityScore || 0) < Number(requirement.requiredQualityScore || 1)) return false;
  if (requirement.requiredPlanetId) {
    const planetKey = { planet_001: "gaea", planet_002: "sandria", planet_003: "abyss", planet_004: "ignis", planet_005: "eden" }[requirement.requiredPlanetId];
    if (planetKey && !String(material.materialBaseId || "").startsWith(`${planetKey}_`)) return false;
  }
  return true;
}

function countGeneratedRankupMaterials(inventory, requirement, bossOnly) {
  return Object.entries(inventory || {}).reduce((sum, [id, count]) => {
    const material = typeof window.getMaterial === "function" ? window.getMaterial(id) : null;
    if (!generatedMaterialMeetsRankup(material, requirement)) return sum;
    if (bossOnly && material.sourceType !== "boss") return sum;
    if (!bossOnly && material.sourceType === "boss") return sum;
    return sum + inventoryCount({ [id]: count }, id);
  }, 0);
}

function inventoryCount(source, id) {
  if (!source || !id) return 0;
  return Math.max(0, Math.floor(statusNumber(source[id], 0)));
}

window.canRankUpPilot = function canRankUpPilot(pilot, inventory = null) {
  if (!pilot) return false;
  const requirement = window.getPilotRankUpRequirement(pilot);
  if (!requirement.nextRank || (!requirement.generatedRequirement && !requirement.materials.length)) return false;
  const materials = inventory || window.GameState?.materials || {};
  if (requirement.generatedRequirement) {
    const normalCount = countGeneratedRankupMaterials(materials, requirement.generatedRequirement, false);
    const bossCount = countGeneratedRankupMaterials(materials, requirement.generatedRequirement, true);
    return normalCount >= requirement.generatedRequirement.requiredMaterialCount
      && bossCount >= requirement.generatedRequirement.requiredBossMaterialCount;
  }
  return requirement.materials.every((item) => inventoryCount(materials, item.id) >= item.count);
};

window.rankUpPilot = function rankUpPilot(pilot) {
  if (!window.canRankUpPilot(pilot, window.GameState?.materials)) return false;
  const requirement = window.getPilotRankUpRequirement(pilot);
  const beforeTalentLimit = window.getPilotTalentLimitByRank(pilot.rank);
  if (requirement.generatedRequirement) {
    consumeGeneratedRankupMaterials(window.GameState.materials, requirement.generatedRequirement, false, requirement.generatedRequirement.requiredMaterialCount);
    consumeGeneratedRankupMaterials(window.GameState.materials, requirement.generatedRequirement, true, requirement.generatedRequirement.requiredBossMaterialCount);
  } else {
    requirement.materials.forEach((item) => {
      window.GameState.materials[item.id] = Math.max(0, inventoryCount(window.GameState.materials, item.id) - item.count);
    });
  }
  pilot.rank = requirement.nextRank;
  const afterTalentLimit = window.getPilotTalentLimitByRank(pilot.rank);
  let gainedTalent = null;
  if (afterTalentLimit > beforeTalentLimit) {
    gainedTalent = window.addTalentToPilot(pilot);
  }
  pilot.lastGainedTalent = gainedTalent;
  const baseStats = window.getPilotBaseStats(pilot);
  pilot.stats = UNIT_STATUS_KEYS.reduce((stats, key) => {
    stats[key] = Math.max(statusNumber(pilot.stats?.[key], 0), baseStats[key] || 0);
    pilot[key] = stats[key];
    return stats;
  }, {});
  window.normalizePilotStatus(pilot);
  return true;
};

function consumeGeneratedRankupMaterials(inventory, requirement, bossOnly, needed) {
  let remaining = Math.max(0, Number(needed || 0));
  Object.keys(inventory || {}).forEach((id) => {
    if (remaining <= 0) return;
    const material = typeof window.getMaterial === "function" ? window.getMaterial(id) : null;
    if (!generatedMaterialMeetsRankup(material, requirement)) return;
    if (bossOnly && material.sourceType !== "boss") return;
    if (!bossOnly && material.sourceType === "boss") return;
    const used = Math.min(remaining, inventoryCount(inventory, id));
    inventory[id] = Math.max(0, inventoryCount(inventory, id) - used);
    remaining -= used;
  });
}

window.getLearnedClassSkills = function getLearnedClassSkills(pilot) {
  if (!pilot || !Array.isArray(window.ClassSkillMaster)) return [];
  window.normalizePilotStatus(pilot);
  const ids = new Set(pilot.skills || []);
  return window.ClassSkillMaster.filter((skill) => ids.has(skill.id));
};

window.getPilotSkillTree = function getPilotSkillTree(classId) {
  const normalized = window.normalizePilotClassId(classId);
  if (Array.isArray(window.ClassSkillMaster) && window.ClassSkillMaster.length) {
    return window.ClassSkillMaster
      .filter((skill) => skill.classId === normalized || skill.classId === classId)
      .map((skill) => ({
        ...skill,
        skillId: skill.id || skill.skillId,
        name: skill.name || skill.skill_name || skill.id,
        requiredLevel: Number(skill.requiredLevel ?? skill.learnLevel ?? skill.tier ?? 1),
        spCost: Number(skill.spCost ?? skill.cost ?? 1),
        prerequisiteSkillIds: Array.isArray(skill.prerequisiteSkillIds) ? skill.prerequisiteSkillIds : []
      }))
      .sort((a, b) => a.requiredLevel - b.requiredLevel || String(a.skillId).localeCompare(String(b.skillId)));
  }
  return (window.GameState?.masters?.skills || [])
    .filter((skill) => skill.class_id === classId)
    .map((skill) => ({
      skillId: skill.skill_id,
      id: skill.skill_id,
      classId: skill.class_id,
      name: skill.skill_name,
      description: skill.description || skill.effect_type || "",
      requiredLevel: Number(skill.tier || 1),
      spCost: Number(skill.cost || 1),
      prerequisiteSkillIds: []
    }));
};

window.getPilotSkillLearnState = function getPilotSkillLearnState(pilot, skill) {
  if (!pilot || !skill) return { state: "unavailable", label: "条件不足", reasons: ["対象未設定"] };
  window.normalizePilotStatus(pilot);
  const skillId = skill.skillId || skill.id;
  const learnedIds = new Set([...(pilot.learnedSkills || []), ...(pilot.skills || [])]);
  if (learnedIds.has(skillId)) return { state: "learned", label: "習得済み", reasons: [] };
  const reasons = [];
  const requiredLevel = Number(skill.requiredLevel ?? skill.learnLevel ?? 1);
  const spCost = Number(skill.spCost ?? skill.cost ?? 1);
  const prerequisites = Array.isArray(skill.prerequisiteSkillIds) ? skill.prerequisiteSkillIds : [];
  if ((pilot.level || 1) < requiredLevel) reasons.push(`Lv ${requiredLevel} 必要`);
  if ((pilot.skillPoints || 0) < spCost) reasons.push(`SP ${spCost} 必要`);
  const missing = prerequisites.filter((id) => id && !learnedIds.has(id));
  if (missing.length) reasons.push("前提未習得");
  return reasons.length ? { state: "locked", label: "条件不足", reasons } : { state: "available", label: "習得可能", reasons: [] };
};

window.canLearnPilotSkill = function canLearnPilotSkill(pilot, skill) {
  return window.getPilotSkillLearnState(pilot, skill).state === "available";
};

window.learnPilotSkill = function learnPilotSkill(pilot, skillId) {
  if (!pilot || !skillId) return false;
  const skill = window.getPilotSkillTree(pilot.classId).find((item) => (item.skillId || item.id) === skillId);
  if (!window.canLearnPilotSkill(pilot, skill)) return false;
  const cost = Number(skill.spCost ?? skill.cost ?? 1);
  pilot.skillPoints = Math.max(0, Math.floor(statusNumber(pilot.skillPoints, 0) - cost));
  if (!Array.isArray(pilot.skills)) pilot.skills = [];
  if (!Array.isArray(pilot.learnedSkills)) pilot.learnedSkills = [];
  if (!pilot.skills.includes(skillId)) pilot.skills.push(skillId);
  if (!pilot.learnedSkills.includes(skillId)) pilot.learnedSkills.push(skillId);
  return true;
};

window.getLearnedPilotSkills = function getLearnedPilotSkills(pilot) {
  if (!pilot) return [];
  window.normalizePilotStatus(pilot);
  const ids = new Set(pilot.skills || []);
  const classSkills = Array.isArray(window.ClassSkillMaster) ? window.ClassSkillMaster.filter((skill) => ids.has(skill.id)) : [];
  const talentSkills = window.getPilotTalentSkills(pilot).filter((skill) => ids.has(skill.id));
  const skills = [...talentSkills, ...classSkills];
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
    enemy.species = enemy.species || enemy.race || enemy.enemyType || enemy.enemyTier || enemy.profileId || "unknown";
    enemy.race = enemy.race || enemy.species;
    enemy.enemyType = enemy.enemyType || enemy.species;
    enemy.hp = statusNumber(enemy.hp, 0) > 1 ? statusNumber(enemy.hp, stats.hp) : stats.hp;
    enemy.maxHp = statusNumber(enemy.maxHp, 0) > 1 ? statusNumber(enemy.maxHp, stats.hp) : stats.hp;
    enemy.atk = Math.max(enemy.sAtk, enemy.mAtk, enemy.lAtk);
    enemy.def = Math.max(enemy.sDef, enemy.mDef, enemy.lDef);
    enemy.weaponType = window.normalizeWeaponType(enemy.weaponType || enemy.rangeType || "melee");
    enemy.element = window.normalizeElement(enemy.element);
  });
};
