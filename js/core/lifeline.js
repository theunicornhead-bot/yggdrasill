"use strict";

const LIFELINE_MAX_LEVEL = 20;

const LIFELINE_TREES = [
  { id: "power", name: "メイン動力炉", description: "全ライフラインの解放条件。各ツリーの上限Lvを開く。", unlockPowerLevel: 0, capBase: 20, costBase: 120, costStep: 80 },
  { id: "food", name: "食糧", description: "日次食糧生産、配給、食事品質を改善する。", unlockPowerLevel: 1, costBase: 80, costStep: 55 },
  { id: "medical", name: "医療", description: "回復、病気、医療品生産と消費を改善する。", unlockPowerLevel: 1, costBase: 90, costStep: 60 },
  { id: "engineer", name: "エンジニア", description: "武器、機体生成、強化、資材消費を改善する。", unlockPowerLevel: 2, costBase: 110, costStep: 70 },
  { id: "pilot", name: "パイロット", description: "経験値、待機訓練、基礎能力を改善する。", unlockPowerLevel: 3, costBase: 110, costStep: 70 },
  { id: "hull", name: "船体拡張", description: "格納庫、起床可能人数、倉庫、生命維持を拡張する。", unlockPowerLevel: 4, costBase: 130, costStep: 80 }
];

const LIFELINE_FACILITIES = {
  engine: { tree: "power", name: "メイン動力炉", description: "全ライフラインの解放条件。Lv1で食糧・医療、Lv2でエンジニア、Lv3でパイロット、Lv4で船体拡張を解放する。", effects: { powerCap: 1 } },
  foodPlant: { tree: "food", name: "食糧生産プラント", description: "1日経過ごとに食糧を生産する。", effects: { foodProduction: 3 } },
  wasteProcessor: { tree: "food", name: "廃棄物再処理システム", description: "廃棄物系素材を獲得した時、一定確率で食糧へ変換する。", effects: { wasteFoodChance: 0.015 } },
  mealQuality: { tree: "food", name: "品質改善", description: "出撃時に攻撃、防御、経験値、疲労軽減のいずれかのバフを抽選する。", effects: { sortieBuffChance: 0.02, sortieBuffPower: 0.01 } },
  satisfyingMeals: { tree: "food", name: "満足感のある食事", description: "日次食糧消費量を軽減する。", effects: { foodCostReduction: 0.015 } },
  shortRecovery: { tree: "medical", name: "短期回復", description: "体力枯渇後のクールタイムを短縮する。", effects: { shortRecoveryReduction: 0.04 } },
  diseaseTreatment: { tree: "medical", name: "感染症早期治療", description: "病気状態からの回復日数を短縮する。", effects: { diseaseRecoveryReduction: 0.05 } },
  medicalPlant: { tree: "medical", name: "医療生産プラント", description: "1日経過ごとに医療品を生産する。", effects: { medicineProduction: 1 } },
  medicalEfficiency: { tree: "medical", name: "医療効率化", description: "日次医療品消費量を軽減する。", effects: { medicineCostReduction: 0.015 } },
  weaponDevelopment: { tree: "engineer", name: "武器開発", description: "生成可能武器レベルの拡張ポイント。", effects: { weaponLevelBonus: 1 } },
  frameDevelopment: { tree: "engineer", name: "機体開発", description: "機体生成時の初期Lvを上げる。", effects: { generatedMechLevelBonus: 0.1 } },
  maintenanceKnowhow: { tree: "engineer", name: "整備ノウハウ", description: "機体強化時の獲得経験値を増加する。", effects: { machineEnhanceExpBonus: 0.02 } },
  materialSaving: { tree: "engineer", name: "資材節約", description: "機体強化時の資材消費軽減の拡張ポイント。", effects: { mechCostReduction: 0.015 } },
  learningComputer: { tree: "pilot", name: "学習型コンピューター", description: "戦闘経験値を増加する。", effects: { battleExpBonus: 0.02 } },
  sleepLearning: { tree: "pilot", name: "睡眠学習", description: "1日経過ごとにパイロット経験値を獲得する。", effects: { dailyTrainingExp: 2 } },
  simulatorTraining: { tree: "pilot", name: "シミュレーター訓練", description: "出撃していないパイロットにも経験値を付与する。", effects: { reservePilotExpRate: 0.015 } },
  pilotBaseTraining: { tree: "pilot", name: "ベース能力向上", description: "全パイロット基礎能力を底上げする。", effects: { pilotBaseBonus: 0.005 } },
  hangarExpansion: { tree: "hull", name: "格納庫拡張", description: "保有機体上限を増加する。", effects: { hangarBonus: 1 } },
  cryosleepWard: { tree: "hull", name: "コールドスリープ区画", description: "起床可能パイロット数上限を増加する。", effects: { pilotCapacityBonus: 1 } },
  warehouseExpansion: { tree: "hull", name: "倉庫拡張", description: "資材・食糧・医療品の保有上限を増加する。", effects: { storageCapBonus: 1 } },
  lifeSupportSystem: { tree: "hull", name: "生命維持設備", description: "乗員維持コストを軽減する。", effects: { lifeSupportCostReduction: 0.015 } }
};

const LIFELINE_EFFECT_LABELS = {
  powerCap: "ライフライン上限",
  foodProduction: "日次食糧生産",
  wasteFoodChance: "廃棄物変換率",
  sortieBuffChance: "出撃バフ率",
  sortieBuffPower: "出撃バフ効果",
  foodCostReduction: "食糧消費軽減",
  shortRecoveryReduction: "短期回復短縮",
  diseaseRecoveryReduction: "病気回復短縮",
  medicineProduction: "日次医療品生産",
  medicineCostReduction: "医療品消費軽減",
  weaponLevelBonus: "武器開発Lv",
  generatedMechLevelBonus: "生成機体初期Lv",
  machineEnhanceExpBonus: "機体強化EXP",
  mechCostReduction: "機体資材軽減",
  battleExpBonus: "戦闘EXP",
  dailyTrainingExp: "日次EXP",
  reservePilotExpRate: "待機訓練EXP",
  pilotBaseBonus: "基礎能力",
  hangarBonus: "機体上限",
  pilotCapacityBonus: "パイロット上限",
  storageCapBonus: "倉庫上限",
  lifeSupportCostReduction: "乗員維持軽減"
};

function lifelineNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function clampLifelineLevel(value) {
  return Math.max(0, Math.min(LIFELINE_MAX_LEVEL, Math.floor(lifelineNumber(value, 0))));
}

window.getLifelineTrees = function getLifelineTrees() {
  return LIFELINE_TREES;
};

window.getLifelineFacilities = function getLifelineFacilities() {
  return LIFELINE_FACILITIES;
};

window.getLifelineTree = function getLifelineTree(treeId) {
  return LIFELINE_TREES.find((tree) => tree.id === treeId) || null;
};

window.getLifelineFacility = function getLifelineFacility(facilityId) {
  return LIFELINE_FACILITIES[facilityId] || null;
};

window.getLifelineTreeCap = function getLifelineTreeCap(treeId, ship = null) {
  if (treeId === "power") return LIFELINE_MAX_LEVEL;
  const currentShip = ship || (typeof window.ensureShipState === "function" ? window.ensureShipState() : window.GameState?.ship || {});
  const powerLevel = clampLifelineLevel(currentShip.facilities?.engine || 0);
  return Math.max(0, Math.min(LIFELINE_MAX_LEVEL, powerLevel));
};

window.isLifelineTreeUnlocked = function isLifelineTreeUnlocked(treeId, ship = null) {
  const tree = window.getLifelineTree(treeId);
  if (!tree) return false;
  const currentShip = ship || (typeof window.ensureShipState === "function" ? window.ensureShipState() : window.GameState?.ship || {});
  return clampLifelineLevel(currentShip.facilities?.engine || 0) >= Number(tree.unlockPowerLevel || 0);
};

window.isLifelineFacilityUnlocked = function isLifelineFacilityUnlocked(facilityId, ship = null) {
  const facility = window.getLifelineFacility(facilityId);
  return Boolean(facility && window.isLifelineTreeUnlocked(facility.tree, ship));
};

window.getLifelineRepairCost = function getLifelineRepairCost(facilityId, ship = null) {
  const facility = window.getLifelineFacility(facilityId);
  const tree = window.getLifelineTree(facility?.tree);
  const currentShip = ship || (typeof window.ensureShipState === "function" ? window.ensureShipState() : window.GameState?.ship || {});
  const level = clampLifelineLevel(currentShip.facilities?.[facilityId] || 0);
  const reduction = Math.min(0.6, Math.max(0, lifelineNumber(currentShip.repairCostReduction, 0)));
  const base = lifelineNumber(tree?.costBase, 100);
  const step = lifelineNumber(tree?.costStep, 60);
  return Math.max(1, Math.round((base + level * step + Math.floor(level / 5) * step) * (1 - reduction)));
};

window.getLifelineMaterialStock = function getLifelineMaterialStock() {
  const state = window.GameState || {};
  const baseTotal = Object.values(state.materials || {}).reduce((sum, count) => sum + Math.max(0, Math.floor(Number(count || 0))), 0);
  const ship = typeof window.ensureShipState === "function" ? window.ensureShipState() : state.ship || {};
  return Math.max(baseTotal, Math.floor(Number(ship.materials || 0)));
};

window.consumeLifelineMaterials = function consumeLifelineMaterials(amount) {
  const state = window.GameState || {};
  const required = Math.max(0, Math.floor(Number(amount || 0)));
  if (window.getLifelineMaterialStock() < required) return false;
  let remaining = required;
  const entries = Object.entries(state.materials || {}).sort(([a], [b]) => String(a).localeCompare(String(b)));
  for (const [id, count] of entries) {
    if (remaining <= 0) break;
    const used = Math.min(remaining, Math.max(0, Math.floor(Number(count || 0))));
    if (used > 0 && typeof window.consumeBaseMaterial === "function") window.consumeBaseMaterial(id, used);
    else if (used > 0) state.materials[id] = Math.max(0, Number(state.materials[id] || 0) - used);
    remaining -= used;
  }
  if (remaining > 0) {
    const ship = typeof window.ensureShipState === "function" ? window.ensureShipState() : state.ship;
    ship.materials = Math.max(0, Number(ship.materials || 0) - remaining);
  }
  return true;
};

window.formatLifelineEffectValue = function formatLifelineEffectValue(key, value) {
  if (["foodProduction", "medicineProduction", "dailyTrainingExp", "weaponLevelBonus", "hangarBonus", "pilotCapacityBonus", "storageCapBonus", "powerCap"].includes(key)) return `+${Math.round(value)}`;
  if (["shortRecoveryReduction", "diseaseRecoveryReduction"].includes(key)) return `-${Math.round(value * 100)}%`;
  if (["generatedMechLevelBonus"].includes(key)) return `+${value.toFixed(1)}Lv`;
  return `${value >= 0 ? "+" : ""}${Math.round(value * 100)}%`;
};

window.renderLifelineEffectSummary = function renderLifelineEffectSummary(effects, level) {
  const entries = Object.entries(effects || {});
  if (!entries.length) return "-";
  return entries.map(([key, value]) => `${LIFELINE_EFFECT_LABELS[key] || key} ${window.formatLifelineEffectValue(key, lifelineNumber(value, 0) * Math.max(0, level))}`).join(" / ");
};

window.recalculateShipLifelineEffects = function recalculateShipLifelineEffects(ship = null) {
  const currentShip = ship || (typeof window.ensureShipState === "function" ? window.ensureShipState() : window.GameState?.ship || {});
  const resetKeys = [
    "foodProduction", "medicineProduction", "foodCostReduction", "medicineCostReduction", "energyCostReduction",
    "fuelCostReduction", "explorationFuelCostReduction", "foodStorageStability", "materialYieldBonus",
    "repairCostReduction", "mechCostReduction", "infectionRecoveryReduction", "infectionRateReduction",
    "medicineRecoveryBonus", "diseaseRecoveryReduction", "shortRecoveryReduction", "dailyTrainingExp",
    "reservePilotExpRate", "battleExpBonus", "sortieBuffChance", "sortieBuffPower", "pilotBaseBonus",
    "weaponLevelBonus", "generatedMechLevelBonus", "machineEnhanceExpBonus", "hangarBonus",
    "pilotCapacityBonus", "lifeSupportCostReduction"
  ];
  resetKeys.forEach((key) => { currentShip[key] = 0; });
  Object.entries(LIFELINE_FACILITIES).forEach(([facilityId, facility]) => {
    const level = clampLifelineLevel(currentShip.facilities?.[facilityId] || 0);
    Object.entries(facility.effects || {}).forEach(([key, value]) => {
      if (key === "powerCap" || key === "wasteFoodChance" || key === "storageCapBonus") return;
      currentShip[key] = lifelineNumber(currentShip[key], 0) + lifelineNumber(value, 0) * level;
    });
  });
  currentShip.resourceCaps = {
    food: 500 + clampLifelineLevel(currentShip.facilities?.warehouseExpansion || 0) * 75,
    medicine: 200 + clampLifelineLevel(currentShip.facilities?.warehouseExpansion || 0) * 35,
    fuel: 1000 + clampLifelineLevel(currentShip.facilities?.warehouseExpansion || 0) * 100,
    materials: 9999
  };
  currentShip.food = Math.min(currentShip.resourceCaps.food, Math.max(0, Math.floor(lifelineNumber(currentShip.food, 100))));
  currentShip.medicine = Math.min(currentShip.resourceCaps.medicine, Math.max(0, Math.floor(lifelineNumber(currentShip.medicine, 30))));
  currentShip.fuel = Math.min(currentShip.resourceCaps.fuel, Math.max(0, Math.floor(lifelineNumber(currentShip.fuel, 300))));
  window.GameState.maxOwnedMechs = Number(window.MAX_OWNED_MECHS || 30) + Math.floor(currentShip.hangarBonus || 0);
  currentShip.pilotCapacity = 4 + Math.floor(currentShip.pilotCapacityBonus || 0);
  return currentShip;
};

window.getPilotSortiePriority = function getPilotSortiePriority(pilot, index) {
  const rankScore = { S: 6, A: 5, B: 4, C: 3, D: 2, E: 1 }[String(pilot?.rank || "D").toUpperCase()] || 0;
  return pilot?.id === "tilia" ? 9999 : rankScore * 1000 - index;
};

window.applyLifelineSortieStart = function applyLifelineSortieStart() {
  const ship = typeof window.ensureShipState === "function" ? window.ensureShipState() : window.GameState?.ship;
  if (!ship) return null;
  const cost = Math.max(0, Math.round(100 * (1 - Math.min(0.75, lifelineNumber(ship.explorationFuelCostReduction, 0)))));
  ship.fuel = Math.max(0, Math.floor(lifelineNumber(ship.fuel, 0) - cost));
  const buffChance = Math.min(0.8, lifelineNumber(ship.sortieBuffChance, 0));
  ship.activeSortieBuff = null;
  if (Math.random() < buffChance) {
    const options = ["attack", "defense", "exp", "fatigue"];
    ship.activeSortieBuff = { type: options[Math.floor(Math.random() * options.length)], power: 0.05 + lifelineNumber(ship.sortieBuffPower, 0) };
  }
  return { fuelCost: cost, shortage: ship.fuel < 0, buff: ship.activeSortieBuff };
};

window.applyWasteFoodConversion = function applyWasteFoodConversion(materialId, count = 1) {
  const ship = typeof window.ensureShipState === "function" ? window.ensureShipState() : window.GameState?.ship;
  if (!ship) return 0;
  const level = clampLifelineLevel(ship.facilities?.wasteProcessor || 0);
  const chance = Math.min(0.6, level * 0.015);
  const isWaste = /waste|brittle|broken|wilted|shell|bone|膜|殻|骨/.test(String(materialId || ""));
  if (!isWaste || chance <= 0) return 0;
  let gained = 0;
  for (let i = 0; i < Number(count || 1); i += 1) if (Math.random() < chance) gained += 1;
  if (gained > 0) ship.food = Math.min(ship.resourceCaps?.food || 500, Math.max(0, Number(ship.food || 0) + gained));
  return gained;
};

window.applyDailySurvival = function applyDailySurvival() {
  const state = window.GameState;
  const ship = typeof window.ensureShipState === "function" ? window.ensureShipState() : state.ship;
  const pilots = Array.isArray(state.pilots) ? state.pilots : [];
  const orderedPilots = pilots
    .map((pilot, index) => ({ pilot, index, priority: window.getPilotSortiePriority(pilot, index) }))
    .sort((a, b) => b.priority - a.priority);
  const foodPerPilot = Math.max(0, 1 - Math.min(0.8, lifelineNumber(ship.foodCostReduction, 0) + lifelineNumber(ship.lifeSupportCostReduction, 0)));
  const totalFoodCost = Math.ceil(pilots.length * foodPerPilot);
  const fedLimit = totalFoodCost <= 0 ? pilots.length : Math.min(pilots.length, Math.floor(lifelineNumber(ship.food, 0) / Math.max(0.2, foodPerPilot)));
  ship.food = Math.max(0, Math.floor(lifelineNumber(ship.food, 0) - Math.min(lifelineNumber(ship.food, 0), totalFoodCost)));
  let fed = 0;
  orderedPilots.forEach(({ pilot }, index) => {
    pilot.survival = pilot.survival && typeof pilot.survival === "object" ? pilot.survival : {};
    if (index < fedLimit) {
      fed += 1;
      pilot.survival.hungerDays = 0;
      pilot.survival.hungry = false;
    } else {
      pilot.survival.hungry = true;
      pilot.survival.hungerDays = Math.max(0, Math.floor(Number(pilot.survival.hungerDays || 0))) + 1;
      if (pilot.survival.hungerDays >= 7) pilot.lost = true;
    }
  });
  const medicalCostBase = pilots.reduce((sum, pilot) => {
    const condition = pilot.survival?.condition;
    if (!condition || condition === "healthy") return sum;
    const severity = pilot.survival?.severity || "minor";
    return sum + ({ minor: 1, moderate: 3, severe: 5 }[severity] || 1);
  }, 0);
  const medicalCost = Math.max(0, Math.ceil(medicalCostBase * (1 - Math.min(0.8, lifelineNumber(ship.medicineCostReduction, 0)))));
  ship.medicine = Math.max(0, Math.floor(lifelineNumber(ship.medicine, 0) - medicalCost));
  ship.food = Math.min(ship.resourceCaps?.food || 500, Math.max(0, Math.floor(lifelineNumber(ship.food, 0) + lifelineNumber(ship.foodProduction, 0))));
  ship.medicine = Math.min(ship.resourceCaps?.medicine || 200, Math.max(0, Math.floor(lifelineNumber(ship.medicine, 0) + lifelineNumber(ship.medicineProduction, 0))));
  ship.energy = Math.max(0, Math.floor(lifelineNumber(ship.energy, 0) + lifelineNumber(ship.energyProduction, 0)));
  ship.fuel = Math.max(0, Math.floor(lifelineNumber(ship.fuel, 0) - Math.ceil(Object.values(ship.facilities || {}).reduce((sum, level) => sum + clampLifelineLevel(level), 0) * 0.2 * (1 - Math.min(0.6, lifelineNumber(ship.fuelCostReduction, 0))))));
  pilots.forEach((pilot) => {
    pilot.survival = pilot.survival && typeof pilot.survival === "object" ? pilot.survival : {};
    pilot.survival.fatigue = Math.max(0, Math.floor(Number(pilot.survival.fatigue || 0)) - 12);
    if (ship.dailyTrainingExp > 0 && typeof window.addPilotExp === "function" && !pilot.lost) window.addPilotExp(pilot, ship.dailyTrainingExp);
    if (pilot.survival.recoveryDays > 0) pilot.survival.recoveryDays = Math.max(0, pilot.survival.recoveryDays - 1);
    if (pilot.survival.condition && pilot.survival.condition !== "healthy" && pilot.survival.recoveryDays <= 0) {
      pilot.survival.condition = "healthy";
      pilot.survival.severity = "none";
    }
  });
  return { foodConsumed: fed, foodShortage: Math.max(0, pilots.length - fed), medicineConsumed: medicalCost };
};

window.markPilotInjuryFromDefeat = function markPilotInjuryFromDefeat(pilotId) {
  const pilot = typeof window.getPilot === "function" ? window.getPilot(pilotId) : null;
  if (!pilot || pilot.lost) return;
  pilot.survival = pilot.survival && typeof pilot.survival === "object" ? pilot.survival : {};
  if (pilot.survival.condition === "injury" || pilot.survival.condition === "disease") {
    pilot.lost = true;
    pilot.survival.lostReason = "怪我・病気状態で戦闘不能";
    return;
  }
  const roll = Math.random();
  if (roll < 0.35) {
    pilot.survival.condition = "injury";
    pilot.survival.severity = roll < 0.08 ? "severe" : roll < 0.18 ? "moderate" : "minor";
    pilot.survival.recoveryDays = { minor: 2, moderate: 4, severe: 7 }[pilot.survival.severity];
  }
};
