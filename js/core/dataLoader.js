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
  talents: [],
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
  { masterName: "weaponRecipeMaster", path: "data/weapon_recipe_master.csv", idKey: "id" },
  { masterName: "optionMaster", path: "data/option_master.csv", idKey: "optionId" },
  { masterName: "materialMaster", path: "data/material_master.csv", idKey: "materialId" },
  { masterName: "itemMaster", path: "data/item_master.csv", idKey: "itemId" },
  { masterName: "pilotClassMaster", path: "data/pilot_class_master.csv", idKey: "classId" },
  { masterName: "talentMaster", path: "data/talent_master.csv", idKey: "talentId" },
  { masterName: "pilotGrowthMaster", path: "data/pilot_growth_master.csv", idKey: "growthType" },
  { masterName: "pilotSkillMaster", path: "data/pilot_skill_master.csv", idKey: "skillId" },
  { masterName: "machineRankPromptMaster", path: "data/machine_rank_prompt_master.csv", idKey: "rank" },
  { masterName: "planetMaster", path: "data/planet_master.csv", idKey: "planetId" },
  { masterName: "materialQualityMaster", path: "data/material_quality_master.csv", idKey: "qualityId" },
  { masterName: "colorMaster", path: "data/color_master.csv", idKey: "colorId" },
  { masterName: "floorQualityTable", path: "data/floor_quality_table.csv", idKey: "startFloor" },
  { masterName: "floorColorTable", path: "data/floor_color_table.csv", idKey: "planetId" },
  { masterName: "floorEnemyPowerMaster", path: "data/floor_enemy_power_master.csv", idKey: "startFloor" },
  { masterName: "enemyRoleMaster", path: "data/enemy_role_master.csv", idKey: "role" },
  { masterName: "planetCombatStyleMaster", path: "data/planet_combat_style_master.csv", idKey: "planetId" },
  { masterName: "enemyProfileMaster", path: "data/enemy_profile_master.csv", idKey: "profileId" },
  { masterName: "enemyMaster", path: "data/enemy_master.csv", idKey: "enemyId" },
  { masterName: "enemySkillMaster", path: "data/enemy_skill_master.csv", idKey: "skillId" },
  { masterName: "planetEnemyTable", path: "data/planet_enemy_table.csv", idKey: "enemyId" },
  { masterName: "materialBaseMaster", path: "data/material_base_master.csv", idKey: "materialBaseId" },
  { masterName: "materialElementMaster", path: "data/material_element_master.csv", idKey: "materialBaseId" },
  { masterName: "enemyMaterialMaster", path: "data/enemy_material_master.csv", idKey: "enemyId" },
  { masterName: "enemyAffinityMaster", path: "data/enemy_affinity_master.csv", idKey: "enemyId" },
  { masterName: "enemySkillSetMaster", path: "data/enemy_skill_set_master.csv", idKey: "enemyId" },
  { masterName: "pilotRankupRequirementMaster", path: "data/pilot_rankup_requirement_master.csv", idKey: "fromRank" },
  { masterName: "classRankPlanetMaster", path: "data/class_rank_planet_master.csv", idKey: "classId" },
  { masterName: "statusEffectMaster", path: "data/status_effect_master.csv", idKey: "statusEffectId" },
  { masterName: "battleConditionMaster", path: "data/battle_condition_master.csv", idKey: "conditionId" },
  { masterName: "battleActionMaster", path: "data/battle_action_master.csv", idKey: "actionId" },
  { masterName: "battleTargetMaster", path: "data/battle_target_master.csv", idKey: "targetId" },
  { masterName: "classBattleProgramMaster", path: "data/class_battle_program_master.csv", idKey: "classId" },
  { masterName: "battleTacticMaster", path: "data/battle_tactic_master.csv", idKey: "tacticId" },
  { masterName: "enemyBehaviorMaster", path: "data/enemy_behavior_master.csv", idKey: "behaviorId" },
  { masterName: "enemyFieldRuleMaster", path: "data/enemy_field_rule_master.csv", idKey: "planetId" },
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

function parseMasterStatEffects(value) {
  if (!value) return {};
  return String(value).split(/[;|]/).reduce((stats, pair) => {
    const [rawKey, rawValue] = pair.split(":");
    const key = String(rawKey || "").trim();
    if (!key) return stats;
    stats[key] = Number(String(rawValue || "0").trim() || 0);
    return stats;
  }, {});
}

function masterRowsByName(masterName) {
  const rows = window.masterData?.[masterName];
  return Array.isArray(rows) ? rows : [];
}

function rowInFloorRange(row, floor) {
  const value = Number(floor || 1);
  return value >= Number(row.startFloor || 1) && value <= Number(row.endFloor || row.startFloor || 1);
}

window.parseWeightTable = function parseWeightTable(text) {
  if (Array.isArray(text)) return text;
  return String(text || "").split("|").map((pair) => {
    const [rawId, rawWeight] = pair.split(":");
    const id = String(rawId || "").trim();
    return id ? { id, weight: Math.max(0, Number(rawWeight || 0)) } : null;
  }).filter(Boolean);
};

window.pickWeighted = function pickWeighted(table) {
  const entries = (table || []).filter((entry) => entry && Number(entry.weight) > 0);
  if (!entries.length) return null;
  let roll = Math.random() * entries.reduce((sum, entry) => sum + Number(entry.weight || 0), 0);
  for (const entry of entries) {
    roll -= Number(entry.weight || 0);
    if (roll <= 0) return entry.id ?? entry;
  }
  return entries[0].id ?? entries[0];
};

window.getFloorQualityWeights = function getFloorQualityWeights(floor) {
  const row = masterRowsByName("floorQualityTable").find((item) => rowInFloorRange(item, floor));
  return window.parseWeightTable(row?.qualityWeights || "broken:45|cracked:35|normal:17|good:3|high:0|best:0");
};

window.rollMaterialQuality = function rollMaterialQuality(floor) {
  return window.pickWeighted(window.getFloorQualityWeights(floor)) || "normal";
};

window.getFloorColorWeights = function getFloorColorWeights(planetId, floor) {
  const row = masterRowsByName("floorColorTable").find((item) => item.planetId === planetId && rowInFloorRange(item, floor));
  return window.parseWeightTable(row?.colorWeights || "blue:20|red:20|yellow:15|green:20|pink:8|white:8|black:6|gold:3");
};

window.rollEnemyColor = function rollEnemyColor(planetId, floor) {
  return window.pickWeighted(window.getFloorColorWeights(planetId, floor)) || "blue";
};

window.getColorMaster = function getColorMaster(colorId) {
  return window.getMasterById("colorMaster", "colorId", colorId) || { colorId: colorId || "blue", name: "青", prefix: "青い", imageSuffix: colorId || "blue", hpRate: "1", atkRate: "1", defRate: "1", speedRate: "1", dropBonusRate: "1" };
};

window.getMaterialQualityMaster = function getMaterialQualityMaster(qualityId) {
  return window.getMasterById("materialQualityMaster", "qualityId", qualityId) || { qualityId: qualityId || "normal", name: "普通の", qualityScore: "3", statMultiplier: "1", priceMultiplier: "1", baseDropWeight: "55" };
};

window.getMaterialBaseMaster = function getMaterialBaseMaster(materialBaseId) {
  return window.getMasterById("materialBaseMaster", "materialBaseId", materialBaseId);
};

window.encodeGeneratedMaterialId = function encodeGeneratedMaterialId(materialBaseId, colorId, qualityId) {
  return [materialBaseId, colorId || "blue", qualityId || "normal"].join("__");
};

window.parseGeneratedMaterialId = function parseGeneratedMaterialId(materialId) {
  const parts = String(materialId || "").split("__");
  if (parts.length !== 3) return null;
  return { materialBaseId: parts[0], colorId: parts[1], qualityId: parts[2] };
};

function qualityScoreToMachineRarity(score) {
  if (score >= 6) return "UR";
  if (score >= 5) return "SSR";
  if (score >= 4) return "SR";
  if (score >= 3) return "R";
  return "N";
}

function elementRowsForMaterial(materialBaseId) {
  return masterRowsByName("materialElementMaster").filter((row) => row.materialBaseId === materialBaseId);
}

window.buildMaterialDisplayName = function buildMaterialDisplayName(materialBaseId, colorId, qualityId) {
  const base = window.getMaterialBaseMaster(materialBaseId);
  const color = window.getColorMaster(colorId);
  const quality = window.getMaterialQualityMaster(qualityId);
  return `${color.prefix || ""}${quality.name || ""}${base?.name || materialBaseId}`.trim();
};

window.buildGeneratedMaterial = function buildGeneratedMaterial(materialBaseId, colorId = "blue", qualityId = "normal") {
  const base = window.getMaterialBaseMaster(materialBaseId);
  if (!base) return null;
  const color = window.getColorMaster(colorId);
  const quality = window.getMaterialQualityMaster(qualityId);
  const qualityScore = Number(quality.qualityScore || 3);
  const statMultiplier = Number(quality.statMultiplier || 1);
  const priceMultiplier = Number(quality.priceMultiplier || 1);
  const stats = parseMasterStatEffects(base.baseStatEffects);
  Object.keys(stats).forEach((key) => {
    stats[key] = Math.round(Number(stats[key] || 0) * statMultiplier);
  });
  const elementRows = elementRowsForMaterial(materialBaseId);
  const resists = {};
  elementRows.forEach((row) => {
    const elementId = row.elementId;
    const resistKey = `${elementId}Resist`;
    resists[resistKey] = Math.min(100, Math.round(Number(row.resistAffinity || 0) * qualityScore * 20));
    if (elementId && row.weaponType) {
      stats[row.weaponType === "magic" ? "mAtk" : row.weaponType === "ranged" ? "lAtk" : "sAtk"] = Math.round((stats[row.weaponType === "magic" ? "mAtk" : row.weaponType === "ranged" ? "lAtk" : "sAtk"] || 0) + Number(row.attackAffinity || 1) * qualityScore * 4);
    }
  });
  const id = window.encodeGeneratedMaterialId(materialBaseId, colorId, qualityId);
  const rarity = qualityScoreToMachineRarity(qualityScore);
  const prompts = [base.description, color.name, quality.name, ...elementRows.map((row) => row.elementId)].filter(Boolean);
  return {
    id,
    materialBaseId,
    colorId,
    qualityId,
    qualityScore,
    name: window.buildMaterialDisplayName(materialBaseId, colorId, qualityId),
    baseName: base.name,
    rarity,
    rank: rarity,
    category: base.category || "organ",
    slotType: base.slotType || "special",
    materialRole: base.materialRole || "part",
    sourceType: base.sourceType || "normal",
    value: Math.max(1, Math.round(Number(base.baseValue || 0) * priceMultiplier)),
    stats,
    statEffects: stats,
    resists,
    outputCost: Math.max(4, Math.round(Number(base.baseValue || 40) / 10 * statMultiplier)),
    tags: [base.category, base.materialRole, base.sourceType, ...elementRows.map((row) => row.elementId)].filter(Boolean),
    visualTags: [base.category, ...elementRows.map((row) => row.elementId)].filter(Boolean),
    accentColor: colorId,
    prompts,
    promptText: prompts.join("|"),
    description: base.description || base.name
  };
};

window.resolveEnemyImagePath = function resolveEnemyImagePath(planetId, enemyId, colorId) {
  if (!planetId || !enemyId || !colorId) return "";
  return `img/enemies/${planetId}/${enemyId}_${colorId}.webp`;
};

window.getEnemyWeakness = function getEnemyWeakness(enemyId) {
  return window.getMasterById("enemyAffinityMaster", "enemyId", enemyId) || null;
};

window.getEnemyResistance = function getEnemyResistance(enemyId) {
  return window.getMasterById("enemyAffinityMaster", "enemyId", enemyId) || null;
};

window.calculateWeaknessDamageMultiplier = function calculateWeaknessDamageMultiplier(weaponType, elementId, enemyId) {
  let multiplier = 1;
  const weakness = window.getEnemyWeakness(enemyId);
  const resistance = window.getEnemyResistance(enemyId);
  if (weakness?.weaponWeakType && weakness.weaponWeakType === weaponType) multiplier *= Number(weakness.weaponWeakRate || 1.5);
  const weakElement = weakness?.elementWeakType;
  const weakRate = weakness?.elementWeakRate || 1.5;
  if (weakElement && weakElement === elementId) multiplier *= Number(weakRate);
  if (resistance?.weaponResistType && resistance.weaponResistType === weaponType) multiplier *= Number(resistance.weaponResistRate || 0.75);
  const resistElement = resistance?.elementResistType;
  const resistRate = resistance?.elementResistRate || 0.75;
  if (resistElement && resistElement === elementId) multiplier *= Number(resistRate);
  return multiplier;
};

function applyCsvMastersToRuntime(masterData) {
  if (Array.isArray(masterData.planetMaster) && masterData.planetMaster.length) {
    window.PlanetMaster = masterData.planetMaster.map((item) => ({
      id: item.planetId,
      planetId: item.planetId,
      name: item.name,
      description: item.description,
      difficulty: Number(item.difficulty || 1),
      recommendedRank: item.recommendedRank || "E",
      maxFloor: Number(item.maxFloor || 50),
      availableTerrains: splitMasterList(item.availableTerrains),
      enemyPool: [],
      materialPool: [],
      fuelModifier: Number(item.fuelModifier || 1),
      unlockCondition: item.unlockMaxReachedFloor ? { maxReachedFloor: Number(item.unlockMaxReachedFloor || 1) } : null,
      promptThemes: splitMasterList(item.promptThemes),
      openBackground: item.openBackground || "",
      blockedBackground: item.blockedBackground || "",
      lowFloorEnemyScale: Number(item.lowFloorEnemyScale || 1),
      finalFloorEnemyScale: Number(item.finalFloorEnemyScale || 1)
    }));
  }
  if (Array.isArray(masterData.materialMaster) && masterData.materialMaster.length) {
    window.MaterialCatalog = masterData.materialMaster.map((item) => ({
      id: item.materialId,
      name: item.name,
      rank: item.rank || item.rarity,
      value: Number(item.value || 0),
      category: item.category,
      materialRole: item.materialRole || item.category || "",
      sourceType: item.sourceType || "",
      slotType: item.slotType || "",
      accentColor: item.accentColor || "",
      visualTags: splitMasterList(item.visualTags),
      prompts: splitMasterList(item.prompts || item.promptText),
      description: item.description || item.name
    }));
    if (Array.isArray(window.MechMaterialCatalog)) {
      window.MechMaterialCatalog = masterData.materialMaster.map((item) => ({
        id: item.materialId,
        name: item.name,
        rarity: item.rarity || item.rank || "N",
        rank: item.rarity || item.rank || "N",
        category: item.category || "organ",
        materialRole: item.materialRole || "part",
        sourceType: item.sourceType || "normal",
        stats: parseMasterStatEffects(item.statEffects),
        statEffects: parseMasterStatEffects(item.statEffects),
        outputCost: Math.max(1, Math.round(Number(item.value || 0) / 10)),
        tags: [item.category].filter(Boolean),
        slotType: item.slotType || "",
        accentColor: item.accentColor || "",
        visualTags: splitMasterList(item.visualTags),
        prompts: splitMasterList(item.promptText || item.prompts),
        promptText: item.promptText || item.prompts || "",
        description: item.description || item.name
      }));
    }
  }
  if (Array.isArray(masterData.enemyMaster) && masterData.enemyMaster.length) {
    window.EnemyCatalog = masterData.enemyMaster.map((item) => ({
      id: item.enemyId,
      enemyId: item.enemyId,
      planetId: item.planetId || "",
      name: item.name,
      role: item.role || "balanced",
      enemyTier: item.enemyTier || item.profileId || "normal",
      species: item.species || item.race || item.enemyType || item.enemyTier || item.profileId || "unknown",
      race: item.race || item.species || item.enemyTier || item.profileId || "unknown",
      enemyType: item.enemyType || item.species || item.enemyTier || item.profileId || "unknown",
      size: item.size || "M",
      profileId: item.profileId || item.enemyTier || item.role,
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
      weaponType: item.weaponType || item.attackType || "melee",
      attackType: item.attackType || item.weaponType || "melee",
      element: item.element || "none",
      weaponPower: Number(item.weaponPower || 1),
      drops: splitMasterList(item.dropMaterialIds),
      variantIds: item.variantIds || "",
      promptParts: splitMasterList(item.promptParts),
      imagePath: item.imagePath || "",
      spawnType: item.enemyTier === "boss" || item.role === "boss" ? "boss" : "normal",
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

function buildRuntimePilotClasses() {
  const rows = masterRowsByName("pilotClassMaster");
  if (!rows.length) return [];
  return rows.map((item) => ({
    class_id: item.classId,
    class_name: item.displayName,
    role: item.role,
    main_stat: item.mainStat,
    weapon_affinity: item.weaponAffinity,
    description: item.description || ""
  }));
}

function buildRuntimePilotSkills() {
  const rows = masterRowsByName("pilotSkillMaster");
  if (!rows.length) return [];
  return rows.map((item) => ({
    skill_id: item.skillId,
    class_id: item.classId,
    skill_name: item.name,
    tier: item.learnLevel || "1",
    cost: item.spCost || "0",
    effect_type: item.type,
    power: item.power || "0",
    description: item.description || ""
  }));
}

function buildRuntimeTalents() {
  const rows = masterRowsByName("talentMaster");
  if (!rows.length) return [];
  return rows.map((item) => ({
    talentId: item.talentId,
    name: item.name,
    category: item.category,
    effectType: item.effectType,
    value: item.value,
    rankScaling: item.rankScaling,
    allowedClasses: item.allowedClasses,
    targetType: item.targetType,
    targetValue: item.targetValue,
    description: item.description,
    trait_id: item.talentId,
    trait_name: item.name,
    effect_type: item.effectType,
    base_value: item.value,
    rank_scaling: item.rankScaling
  }));
}

window.loadMasters = async function loadMasters() {
  const state = window.GameState;
  await loadCsvMasters();
  try {
    const [traits, pilotNames, mechs, mechTraits, overdrives] = await Promise.all([
      loadCsv("data/trait_master.csv"),
      loadCsv("data/pilot_name_master.csv"),
      loadCsv("data/mech_master.csv"),
      loadCsv("data/mech_trait_master.csv"),
      loadCsv("data/overdrive_master.csv")
    ]);
    const classes = buildRuntimePilotClasses();
    const skills = buildRuntimePilotSkills();
    const talents = buildRuntimeTalents();
    const compatibleTraits = talents.length
      ? [...talents, ...traits.filter((trait) => !talents.some((talent) => talent.trait_id === trait.trait_id))]
      : traits;
    state.masters = { classes, traits: compatibleTraits, talents, skills, pilotNames, mechs, mechTraits, overdrives };
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
  return window.GameState.masters.traits.find((item) => item.trait_id === traitId || item.talentId === traitId);
};

window.getTalentMasterById = function getTalentMasterById(talentId) {
  return window.GameState.masters.talents?.find((item) => item.talentId === talentId || item.trait_id === talentId)
    || window.getTraitById(talentId)
    || null;
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

window.getItemMaster = function getItemMaster(itemId) {
  return window.getMasterById("itemMaster", "itemId", itemId);
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
    nextExp: typeof window.calculateMachineNextExp === "function" ? window.calculateMachineNextExp(1) : 100,
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
  const hasInitialMechs = Array.isArray(state.mechs) && state.mechs.length > 0;
  if (hasInitialMechs) {
    if (typeof window.ensureMechRosterState === "function") window.ensureMechRosterState();
    if (!state.selectedMechId || !state.mechs.some((mech) => mech.id === state.selectedMechId)) {
      state.selectedMechId = state.mechs[0]?.id || null;
    }
    return;
  }
  const first = createMechFromMaster("frame_s_001");
  if (first && state.pilots[0]) first.pilotId = state.pilots[0].id;
  state.mechs = [first].filter(Boolean);
  if (typeof window.ensureMechRosterState === "function") window.ensureMechRosterState();
  if (typeof window.normalizeAllUnitStatuses === "function") window.normalizeAllUnitStatuses();
  state.selectedMechId = state.mechs[0]?.id || null;
};
