"use strict";

window.fallbackMasters = {
  classes: [
    { class_id: "fighter", class_name: "ファイター", role: "近接特化", main_stat: "atk", weapon_affinity: "slash", description: "近接攻撃に優れる前衛クラス" },
    { class_id: "gunner", class_name: "ガンナー", role: "遠距離特化", main_stat: "hit", weapon_affinity: "shoot", description: "射撃と命中に優れる後衛クラス" },
    { class_id: "healer", class_name: "ヒーラー", role: "回復特化", main_stat: "sp", weapon_affinity: "heal", description: "回復と修復に優れる支援クラス" },
    { class_id: "tank", class_name: "タンク", role: "防御特化", main_stat: "def", weapon_affinity: "guard", description: "防御と引き受けに優れる前衛クラス" },
    { class_id: "dragner", class_name: "ドラグナー", role: "砲撃特化", main_stat: "atk", weapon_affinity: "cannon", description: "重砲撃と範囲攻撃に優れるクラス" },
    { class_id: "supporter", class_name: "サポーター", role: "支援特化", main_stat: "sp", weapon_affinity: "support", description: "味方強化に優れる支援クラス" },
    { class_id: "hunter", class_name: "ハンター", role: "デバフ特化", main_stat: "dex", weapon_affinity: "pierce", description: "弱体化と部位狙いに優れるクラス" },
    { class_id: "seeker", class_name: "シーカー", role: "探索特化", main_stat: "luck", weapon_affinity: "scan", description: "探索と素材発見に優れるクラス" }
  ],
  traits: [
    { trait_id: "large_specialist", trait_name: "大型機特化", effect_type: "large_bonus", base_value: "5", rank_scaling: "3", description: "大型機搭乗時に性能上昇" },
    { trait_id: "medium_specialist", trait_name: "中型機特化", effect_type: "medium_bonus", base_value: "5", rank_scaling: "3", description: "中型機搭乗時に性能上昇" },
    { trait_id: "small_specialist", trait_name: "小型機特化", effect_type: "small_bonus", base_value: "5", rank_scaling: "3", description: "小型機搭乗時に性能上昇" },
    { trait_id: "fuel_saver", trait_name: "低燃費", effect_type: "fuel_cost_down", base_value: "3", rank_scaling: "2", description: "探索時の燃料消費を軽減" },
    { trait_id: "lucky", trait_name: "幸運", effect_type: "rare_drop_up", base_value: "2", rank_scaling: "2", description: "レア素材の入手率上昇" },
    { trait_id: "overdrive_specialist", trait_name: "必殺技特化", effect_type: "overdrive_bonus", base_value: "5", rank_scaling: "3", description: "必殺技の威力上昇" },
    { trait_id: "balanced", trait_name: "バランス型", effect_type: "all_bonus", base_value: "2", rank_scaling: "1", description: "全体的に少し能力上昇" }
  ],
  skills: [
    { skill_id: "fighter_001", class_id: "fighter", skill_name: "強襲斬り", tier: "1", cost: "3", effect_type: "slash_damage", power: "120", description: "近接斬撃ダメージ" },
    { skill_id: "gunner_001", class_id: "gunner", skill_name: "精密射撃", tier: "1", cost: "3", effect_type: "shoot_damage", power: "110", description: "命中率の高い射撃" },
    { skill_id: "healer_001", class_id: "healer", skill_name: "応急修復", tier: "1", cost: "4", effect_type: "heal", power: "100", description: "味方1機を回復" },
    { skill_id: "tank_001", class_id: "tank", skill_name: "防壁展開", tier: "1", cost: "3", effect_type: "guard_up", power: "30", description: "防御力上昇" },
    { skill_id: "dragner_001", class_id: "dragner", skill_name: "重砲撃", tier: "1", cost: "5", effect_type: "cannon_damage", power: "140", description: "砲撃ダメージ" },
    { skill_id: "supporter_001", class_id: "supporter", skill_name: "出力調整", tier: "1", cost: "4", effect_type: "atk_buff", power: "20", description: "味方攻撃力上昇" },
    { skill_id: "hunter_001", class_id: "hunter", skill_name: "神経攪乱", tier: "1", cost: "4", effect_type: "debuff_atk", power: "20", description: "敵攻撃力低下" },
    { skill_id: "seeker_001", class_id: "seeker", skill_name: "素材看破", tier: "1", cost: "3", effect_type: "drop_bonus", power: "15", description: "素材入手率上昇" }
  ],
  pilotNames: [
    { name: "レイ", gender: "male" }, { name: "ユイ", gender: "female" }, { name: "カナタ", gender: "male" }, { name: "ミナ", gender: "female" },
    { name: "クロウ", gender: "male" }, { name: "セラ", gender: "female" }, { name: "ノア", gender: "male" }, { name: "リゼ", gender: "female" },
    { name: "アイン", gender: "male" }, { name: "エル", gender: "female" }, { name: "ルカ", gender: "male" }, { name: "ミオ", gender: "female" }
  ]
};

window.parseCsv = function parseCsv(text) {
  const lines = text.trim().split(/\r?\n/).filter(Boolean);
  const headers = splitCsvLine(lines.shift());
  return lines.map((line) => {
    const values = splitCsvLine(line);
    return headers.reduce((row, header, index) => {
      row[header] = values[index] || "";
      return row;
    }, {});
  });
};

window.fallbackMasters.mechs = [
  { mech_id: "frame_s_001", mech_name: "簡易小型機", size: "S", type: "scout", rank: "E", hp: "420", atk: "55", def: "35", mobility: "70", fuel_cost_rate: "0.8", slot_weapon: "1", slot_armor: "1", slot_core: "1", slot_option: "1", overdrive_id: "", unique: "false", customizable: "true", description: "低層探索用の軽量な通常機" },
  { mech_id: "frame_m_001", mech_name: "標準中型機", size: "M", type: "hybrid", rank: "E", hp: "560", atk: "65", def: "50", mobility: "50", fuel_cost_rate: "1.0", slot_weapon: "1", slot_armor: "1", slot_core: "1", slot_option: "1", overdrive_id: "", unique: "false", customizable: "true", description: "扱いやすい標準的な通常機" },
  { mech_id: "frame_l_001", mech_name: "重装甲大型機", size: "L", type: "guard", rank: "D", hp: "760", atk: "70", def: "85", mobility: "25", fuel_cost_rate: "1.3", slot_weapon: "1", slot_armor: "2", slot_core: "1", slot_option: "1", overdrive_id: "", unique: "false", customizable: "true", description: "燃費は悪いが耐久に優れる大型機" },
  { mech_id: "unique_001", mech_name: "白殻機セラフィム", size: "XL", type: "unique", rank: "A", hp: "1400", atk: "130", def: "120", mobility: "55", fuel_cost_rate: "1.5", slot_weapon: "0", slot_armor: "0", slot_core: "0", slot_option: "0", overdrive_id: "seraphim_wing", unique: "true", customizable: "false", description: "最初から完成された固有機体。カスタマイズ不可" }
];

window.fallbackMasters.mechTraits = [
  { trait_id: "light_frame", trait_name: "軽量骨格", effect_type: "mobility_up", value: "10", description: "機動力が上昇する" },
  { trait_id: "heavy_armor", trait_name: "重甲殻", effect_type: "def_up", value: "15", description: "防御力が上昇する" },
  { trait_id: "poor_fuel", trait_name: "燃費悪化", effect_type: "fuel_cost_up", value: "10", description: "燃料消費が増える" },
  { trait_id: "fuel_efficient", trait_name: "低燃費", effect_type: "fuel_cost_down", value: "10", description: "燃料消費が減る" },
  { trait_id: "melee_frame", trait_name: "近接機構", effect_type: "atk_up", value: "10", description: "近接攻撃向きの機体" },
  { trait_id: "cannon_frame", trait_name: "砲撃機構", effect_type: "cannon_bonus", value: "10", description: "砲撃攻撃向きの機体" },
  { trait_id: "unstable_core", trait_name: "不安定炉", effect_type: "atk_up_def_down", value: "15", description: "攻撃力は上がるが防御が下がる" },
  { trait_id: "rough_body", trait_name: "粗製機体", effect_type: "all_down", value: "5", description: "低ランク素材で作られた粗い機体" }
];

window.fallbackMasters.overdrives = [
  { overdrive_id: "seraphim_wing", overdrive_name: "光翼展開", effect_type: "unique_damage", power: "250", fuel_cost: "10", description: "白殻機セラフィム専用の高出力必殺技" },
  { overdrive_id: "strike_burst", overdrive_name: "強襲連撃", effect_type: "damage", power: "180", fuel_cost: "8", description: "近接型機体向けの連続攻撃" },
  { overdrive_id: "cannon_blast", overdrive_name: "重砲一斉射", effect_type: "damage", power: "220", fuel_cost: "12", description: "砲撃型機体向けの高火力攻撃" },
  { overdrive_id: "guard_fortress", overdrive_name: "甲殻要塞", effect_type: "defense_buff", power: "0", fuel_cost: "6", description: "防御力を大きく上げる" },
  { overdrive_id: "scan_drive", overdrive_name: "索敵展開", effect_type: "drop_bonus", power: "0", fuel_cost: "5", description: "素材入手率を上げる" }
];

function splitCsvLine(line) {
  const result = [];
  let current = "";
  let quoted = false;
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '"' && line[i + 1] === '"') {
      current += '"';
      i += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

window.loadCsv = async function loadCsv(path) {
  const response = await fetch(path, { cache: "no-store" });
  if (!response.ok) throw new Error(`CSV load failed: ${path}`);
  return parseCsv(await response.text());
};

const MASTER_CSV_CONFIGS = [
  { masterName: "rankMaster", path: "data/rank_master.csv", idKey: "rankId" },
  { masterName: "tagMaster", path: "data/tag_master.csv", idKey: "tagId" },
  { masterName: "statKeyMaster", path: "data/stat_key_master.csv", idKey: "statKey" },
  { masterName: "elementMaster", path: "data/element_master.csv", idKey: "elementId" },
  { masterName: "weaponTypeMaster", path: "data/weapon_type_master.csv", idKey: "weaponType" },
  { masterName: "weaponMaster", path: "data/weapon_master.csv", idKey: "weaponId" },
  { masterName: "optionMaster", path: "data/option_master.csv", idKey: "optionId" },
  { masterName: "coreMaster", path: "data/core_master.csv", idKey: "coreId" },
  { masterName: "materialMaster", path: "data/material_master.csv", idKey: "materialId" },
  { masterName: "pilotClassMaster", path: "data/pilot_class_master.csv", idKey: "classId" },
  { masterName: "pilotGrowthMaster", path: "data/pilot_growth_master.csv", idKey: "growthType" },
  { masterName: "pilotSkillMaster", path: "data/pilot_skill_master.csv", idKey: "skillId" },
  { masterName: "machineRankPromptMaster", path: "data/machine_rank_prompt_master.csv", idKey: "rank" },
  { masterName: "enemyProfileMaster", path: "data/enemy_profile_master.csv", idKey: "profileId" },
  { masterName: "enemyMaster", path: "data/enemy_master.csv", idKey: "enemyId" },
  { masterName: "enemySkillMaster", path: "data/enemy_skill_master.csv", idKey: "skillId" },
  { masterName: "floorMaster", path: "data/floor_master.csv", idKey: "floorId" },
  { masterName: "floorEnemyMaster", path: "data/floor_enemy_master.csv", idKey: "floorId" },
  { masterName: "statusAilmentMaster", path: "data/status_ailment_master.csv", idKey: "ailmentId" },
  { masterName: "buffDebuffMaster", path: "data/buff_debuff_master.csv", idKey: "effectId" },
  { masterName: "overdriveMaster", path: "data/overdrive_master.csv", idKey: "overdriveId" }
];

function buildMasterMap(rows, idKey) {
  return new Map((rows || []).filter((row) => row[idKey]).map((row) => [row[idKey], row]));
}

async function loadCsvMasters() {
  const loaded = {};
  const maps = {};
  await Promise.all(MASTER_CSV_CONFIGS.map(async (config) => {
    try {
      const rows = await loadCsv(config.path);
      loaded[config.masterName] = rows;
      maps[config.masterName] = buildMasterMap(rows, config.idKey);
    } catch (error) {
      loaded[config.masterName] = [];
      maps[config.masterName] = new Map();
    }
  }));
  window.masterData = loaded;
  window.masterMaps = maps;
  applyCsvMastersToRuntime(loaded);
  return loaded;
}

function splitMasterList(value) {
  return String(value || "").split("|").map((item) => item.trim()).filter(Boolean);
}

function applyCsvMastersToRuntime(masterData) {
  if (Array.isArray(masterData.materialMaster) && masterData.materialMaster.length) {
    window.MaterialCatalog = masterData.materialMaster.map((item) => ({
      id: item.materialId,
      name: item.name,
      rank: item.rank,
      value: Number(item.value || 0),
      category: item.category,
      prompts: splitMasterList(item.prompts),
      description: item.description || item.name
    }));
  }
  if (Array.isArray(masterData.enemyMaster) && masterData.enemyMaster.length) {
    window.EnemyCatalog = masterData.enemyMaster.map((item) => ({
      id: item.enemyId,
      name: item.name,
      profileId: item.profileId,
      rank: item.rank,
      level: Number(item.level || 1),
      hp: Number(item.hp || 1),
      maxHp: Number(item.hp || 1),
      pp: Number(item.pp || 0),
      sAtk: Number(item.sAtk || 0),
      mAtk: Number(item.mAtk || 0),
      lAtk: Number(item.lAtk || 0),
      sDef: Number(item.sDef || 0),
      mDef: Number(item.mDef || 0),
      lDef: Number(item.lDef || 0),
      speed: Number(item.speed || 0),
      weaponType: item.weaponType || "melee",
      element: item.element || "none",
      weaponPower: Number(item.weaponPower || 1),
      drops: splitMasterList(item.dropMaterialIds),
      imagePath: item.imagePath || "",
      type: masterData.enemyProfileMaster?.find((profile) => profile.profileId === item.profileId)?.displayName || item.profileId || "enemy",
      description: item.description || ""
    }));
  }
  if (Array.isArray(masterData.pilotSkillMaster) && masterData.pilotSkillMaster.length) {
    window.ClassSkillMaster = masterData.pilotSkillMaster.map((item) => ({
      id: item.skillId,
      classId: item.classId,
      name: item.name,
      route: item.route,
      branchGroup: item.branchGroup,
      learnLevel: Number(item.learnLevel || 1),
      spCost: Number(item.spCost || 0),
      prerequisiteSkillIds: splitMasterList(item.prerequisiteSkillIds),
      type: item.type || "passive",
      rangeType: item.weaponType || "none",
      weaponType: item.weaponType || "none",
      power: Number(item.power || 0),
      ppCost: Number(item.ppCost || 0),
      target: item.target || "self",
      description: item.description || ""
    }));
  }
}

window.loadMasters = async function loadMasters() {
  const state = window.GameState;
  await loadCsvMasters();
  try {
    const [classes, traits, skills, pilotNames, mechs, mechTraits, overdrives] = await Promise.all([
      loadCsv("data/class_master.csv"),
      loadCsv("data/trait_master.csv"),
      loadCsv("data/skill_master.csv"),
      loadCsv("data/pilot_name_master.csv"),
      loadCsv("data/mech_master.csv"),
      loadCsv("data/mech_trait_master.csv"),
      loadCsv("data/overdrive_master.csv")
    ]);
    state.masters = { classes, traits, skills, pilotNames, mechs, mechTraits, overdrives };
    state.masterLoadMode = "csv";
  } catch (error) {
    state.masters = typeof structuredClone === "function" ? structuredClone(window.fallbackMasters) : JSON.parse(JSON.stringify(window.fallbackMasters));
    state.masterLoadMode = "fallback";
  }
  initializeStartingMechs();
};

window.getClassById = function getClassById(classId) {
  return window.GameState.masters.classes.find((item) => item.class_id === classId);
};

window.getTraitById = function getTraitById(traitId) {
  return window.GameState.masters.traits.find((item) => item.trait_id === traitId);
};

window.getSkillsByClass = function getSkillsByClass(classId) {
  return window.GameState.masters.skills.filter((skill) => skill.class_id === classId);
};

window.getInitialSkillForClass = function getInitialSkillForClass(classId) {
  return getSkillsByClass(classId).find((skill) => String(skill.tier) === "1") || getSkillsByClass(classId)[0];
};

window.getMechMasterById = function getMechMasterById(mechMasterId) {
  return window.GameState.masters.mechs.find((item) => item.mech_id === mechMasterId);
};

window.getMechTraitById = function getMechTraitById(traitId) {
  return window.GameState.masters.mechTraits.find((item) => item.trait_id === traitId);
};

window.getOverdriveById = function getOverdriveById(overdriveId) {
  if (!overdriveId) return null;
  return window.getMasterById("overdriveMaster", "overdriveId", overdriveId)
    || window.GameState.masters.overdrives.find((item) => item.overdrive_id === overdriveId || item.overdriveId === overdriveId)
    || null;
};

window.getMasterById = function getMasterById(masterName, idKey, id) {
  if (!masterName || !id) return null;
  const map = window.masterMaps?.[masterName];
  if (map instanceof Map && map.has(id)) return map.get(id);
  const rows = window.masterData?.[masterName];
  return Array.isArray(rows) ? rows.find((row) => row[idKey] === id) || null : null;
};

window.getTagMaster = function getTagMaster(tagId) {
  return window.getMasterById("tagMaster", "tagId", tagId);
};

window.getWeaponMaster = function getWeaponMaster(weaponId) {
  return window.getMasterById("weaponMaster", "weaponId", weaponId);
};

window.getOptionMaster = function getOptionMaster(optionId) {
  return window.getMasterById("optionMaster", "optionId", optionId);
};

window.getPilotClassMaster = function getPilotClassMaster(classId) {
  return window.getMasterById("pilotClassMaster", "classId", classId);
};

window.getPilotSkillMaster = function getPilotSkillMaster(skillId) {
  return window.getMasterById("pilotSkillMaster", "skillId", skillId);
};

window.getEnemyMaster = function getEnemyMaster(enemyId) {
  return window.getMasterById("enemyMaster", "enemyId", enemyId);
};

window.createMechFromMaster = function createMechFromMaster(mechMasterId) {
  const state = window.GameState;
  const master = getMechMasterById(mechMasterId);
  if (!master) return null;
  const serial = String(state.nextMechSerial || 1).padStart(3, "0");
  state.nextMechSerial = (state.nextMechSerial || 1) + 1;
  const unique = String(master.unique) === "true";
  const customizable = String(master.customizable) === "true";
  const hp = Number(master.hp);
  const atk = Number(master.atk);
  const def = Number(master.def);
  const mobility = Number(master.mobility);
  const typeTag = {
    assault: "melee",
    melee: "melee",
    scout: "scout",
    guard: "defense",
    defense: "defense",
    support: "command",
    healer: "supply",
    debuff: "jammer",
    magic: "magic",
    ranged: "ranged"
  }[String(master.type || "").toLowerCase()] || "general";
  const weaponType = typeTag === "scout" || typeTag === "command" ? "ranged" : typeTag === "magic" || typeTag === "supply" || typeTag === "jammer" ? "magic" : typeTag === "ranged" ? "ranged" : "melee";
  const optionSlots = Number(master.slot_option || 0);
  const mech = {
    id: `mech_${serial}`,
    baseId: master.mech_id,
    name: master.mech_name,
    size: master.size,
    type: master.type,
    rank: master.rank,
    level: 1,
    exp: 0,
    tags: ["general", typeTag].filter((tag, index, tags) => tag && tags.indexOf(tag) === index),
    stats: {
      hp,
      pp: 30,
      sAtk: weaponType === "melee" ? atk : Math.round(atk * 0.82),
      mAtk: weaponType === "magic" ? atk : Math.round(atk * 0.82),
      lAtk: weaponType === "ranged" ? atk : Math.round(atk * 0.82),
      sDef: def,
      mDef: Math.round(def * 0.95),
      lDef: Math.round(def),
      speed: mobility
    },
    hp,
    maxHp: hp,
    atk,
    def,
    mobility,
    mainWeapon: {
      id: `${master.mech_id}_main_weapon`,
      name: `${master.mech_name} Main Weapon`,
      rank: master.rank,
      weaponType,
      element: "none",
      power: Math.max(1, Math.round(atk * 0.65)),
      ppCost: 0,
      overdrive: null
    },
    subWeapons: [],
    optionSlots,
    equippedOptions: [],
    options: [],
    fuelCostRate: Number(master.fuel_cost_rate),
    slotCounts: {
      weapon: Number(master.slot_weapon),
      armor: Number(master.slot_armor),
      core: Number(master.slot_core),
      option: Number(master.slot_option)
    },
    optionalSlots: optionSlots,
    traits: [],
    parts: { weapon: null, armor: null, core: null, option: null },
    overdriveId: master.overdrive_id || null,
    pilotId: null,
    unique,
    customizable,
    promptTags: [],
    description: master.description
  };
  if (typeof window.normalizeMachineStatus === "function") window.normalizeMachineStatus(mech);
  return mech;
};

window.initializeStartingMechs = function initializeStartingMechs() {
  const state = window.GameState;
  const hasSavedMechs = state.storage?.loaded && Array.isArray(state.mechs) && state.mechs.length > 0;
  if (hasSavedMechs) return;
  const first = createMechFromMaster("frame_s_001");
  if (first && state.pilots[0]) first.pilotId = state.pilots[0].id;
  state.mechs = [first].filter(Boolean);
  if (typeof window.normalizeAllUnitStatuses === "function") window.normalizeAllUnitStatuses();
  state.selectedMechId = state.mechs[0]?.id || null;
};
