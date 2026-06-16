"use strict";

function battleNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function clampBattleValue(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

const ENEMY_VARIANTS = [
  { variantId: "normal", variantName: "通常個体", mainColor: "", accentColor: "", dropBias: [], promptParts: [], weight: 50 },
  { variantId: "red", variantName: "赤個体", mainColor: "red", accentColor: "orange", dropBias: ["fire", "red", "dragon", "weapon"], promptParts: ["red shell", "burning veins", "flame organ"], weight: 14 },
  { variantId: "blue", variantName: "青個体", mainColor: "blue", accentColor: "cyan", dropBias: ["ice", "blue", "aquatic", "lance"], promptParts: ["blue shell", "cold crystal organs", "icy veins"], weight: 12 },
  { variantId: "black", variantName: "黒個体", mainColor: "black", accentColor: "purple", dropBias: ["dark", "black", "king", "rare"], promptParts: ["black shell", "shadow organs", "dark crown"], weight: 9 },
  { variantId: "white", variantName: "白個体", mainColor: "white", accentColor: "gold", dropBias: ["holy", "white", "wing", "angel"], promptParts: ["white shell", "holy glow", "pale wings"], weight: 9 },
  { variantId: "purple", variantName: "紫個体", mainColor: "purple", accentColor: "purple", dropBias: ["poison", "purple", "demon", "reactor"], promptParts: ["purple shell", "poison veins", "warped reactor"], weight: 10 }
];
window.EnemyVariantCatalog = ENEMY_VARIANTS;

function uniqueBattleList(items) {
  return [...new Set((items || []).filter(Boolean))];
}

function weightedBattlePick(items, weightKey = "weight") {
  const table = (items || []).filter(Boolean);
  if (!table.length) return null;
  let roll = Math.random() * table.reduce((sum, item) => sum + Math.max(0, Number(item[weightKey] || 1)), 0);
  for (const item of table) {
    roll -= Math.max(0, Number(item[weightKey] || 1));
    if (roll <= 0) return item;
  }
  return table[0];
}

function splitBattleList(value) {
  if (Array.isArray(value)) return value.map((item) => String(item || "").trim()).filter(Boolean);
  return String(value || "").split("|").map((item) => item.trim()).filter(Boolean);
}

function rollEnemyVariant(template = {}) {
  const customVariants = splitBattleList(template.variantIds)
    .map((variantId) => ENEMY_VARIANTS.find((variant) => variant.variantId === variantId))
    .filter(Boolean);
  return weightedBattlePick(customVariants.length ? customVariants : ENEMY_VARIANTS) || ENEMY_VARIANTS[0];
}

function materialMatchesDropBias(material, bias) {
  if (!material || !bias) return false;
  const normalizedBias = String(bias).toLowerCase();
  const rarityScore = { N: 1, R: 2, SR: 3, SSR: 4, UR: 5 }[material.rarity || material.rank] || 1;
  if (normalizedBias === "rare") return rarityScore >= 4;
  const parts = [
    material.id,
    material.name,
    material.category,
    material.slotType,
    material.accentColor,
    ...(material.visualTags || []),
    ...(material.tags || []),
    ...(material.prompts || [])
  ].join(" ").toLowerCase();
  return parts.includes(normalizedBias);
}

function getVariantMaterialPool(variant, planet = null) {
  const catalog = window.MechMaterialCatalog || window.MaterialCatalog || [];
  const planetPool = planet?.materialPool || [];
  const biased = catalog.filter((material) => (
    (variant.dropBias || []).some((bias) => materialMatchesDropBias(material, bias))
  ));
  const planetPreferred = biased.filter((material) => planetPool.includes(material.id));
  return planetPreferred.length ? planetPreferred : biased;
}

function buildEnemyDropTable(template, variant, planet = null) {
  const floor = window.GameState?.quest?.floor || 1;
  const enemyMaterialRows = Array.isArray(window.masterData?.enemyMaterialMaster)
    ? window.masterData.enemyMaterialMaster.filter((row) => row.enemyId === (template.enemyId || template.id))
    : [];
  if (enemyMaterialRows.length && typeof window.buildGeneratedMaterial === "function") {
    const colorId = variant?.colorId || variant?.variantId || "blue";
    const color = typeof window.getColorMaster === "function" ? window.getColorMaster(colorId) : { dropBonusRate: 1 };
    return enemyMaterialRows.map((row) => {
      const qualityId = typeof window.rollMaterialQuality === "function" ? window.rollMaterialQuality(floor) : "normal";
      const material = window.buildGeneratedMaterial(row.materialBaseId, colorId, qualityId);
      return material ? {
        id: material.id,
        chance: Math.min(1, Math.max(0, Number(row.dropRate || 0) / 100 * Number(color.dropBonusRate || 1))),
        source: row.dropType || "normal"
      } : null;
    }).filter(Boolean);
  }
  const baseDrops = Array.isArray(template.drops) ? template.drops : [];
  const variantPool = getVariantMaterialPool(variant, planet);
  const variantDrops = uniqueBattleList(variantPool.map((material) => material.id)).slice(0, 8);
  const dropTable = [
    ...baseDrops.map((id) => ({ id, chance: 0.72, source: "base" })),
    ...variantDrops.map((id) => ({ id, chance: variant.variantId === "normal" ? 0.18 : 0.42, source: "variant" }))
  ];
  return dropTable.filter((drop, index, drops) => drop.id && drops.findIndex((item) => item.id === drop.id) === index);
}

function cloneBattleStats(stats = {}) {
  const cloned = {
    hp: Math.max(0, Math.floor(battleNumber(stats.hp, 0))),
    pp: Math.max(0, Math.floor(battleNumber(stats.pp, 0))),
    sAtk: Math.max(0, Math.floor(battleNumber(stats.sAtk, 0))),
    mAtk: Math.max(0, Math.floor(battleNumber(stats.mAtk, 0))),
    lAtk: Math.max(0, Math.floor(battleNumber(stats.lAtk, 0))),
    sDef: Math.max(0, Math.floor(battleNumber(stats.sDef, 0))),
    mDef: Math.max(0, Math.floor(battleNumber(stats.mDef, 0))),
    lDef: Math.max(0, Math.floor(battleNumber(stats.lDef, 0))),
    speed: Math.max(0, Math.floor(battleNumber(stats.speed, 0))),
    element: stats.element || "none",
    enemyId: stats.enemyId || "",
    resists: { ...(stats.resists || {}) }
  };
  ["fire", "cooling", "thunder", "acid", "poison", "nerve", "sonic", "gravity", "optical", "erosion"].forEach((elementId) => {
    const key = `${elementId}Resist`;
    if (stats[key] !== undefined) cloned[key] = Math.max(0, Math.floor(battleNumber(stats[key], 0)));
  });
  return cloned;
}

function createAllyBattleUnit(mech) {
  const pilot = getPilot(mech?.pilotId);
  if (!mech || !pilot) return null;
  if (typeof window.normalizeMachineStatus === "function") window.normalizeMachineStatus(mech);
  if (typeof window.normalizePilotStatus === "function") window.normalizePilotStatus(pilot);
  const stats = cloneBattleStats(typeof window.calculateUnitStats === "function" ? window.calculateUnitStats(pilot, mech) : mech.stats);
  stats.resists = { ...(mech.resists || {}), ...(stats.resists || {}) };
  const maxHp = Math.max(1, stats.hp);
  const maxPp = Math.max(0, stats.pp);
  const currentHp = clampBattleValue(Math.floor(battleNumber(mech.currentHp ?? mech.hp, maxHp)), 0, maxHp);
  const currentPp = clampBattleValue(Math.floor(battleNumber(mech.currentPp ?? mech.pp, maxPp)), 0, maxPp);
  const overdrive = clampBattleValue(Math.floor(battleNumber(mech.overdrive, 0)), 0, 100);
  return {
    id: `ally:${mech.id}`,
    side: "ally",
    sourceType: "machine",
    machineId: mech.id,
    pilotId: pilot.id,
    name: mech.name || "Machine",
    pilotName: pilot.name || "Pilot",
    stats,
    currentHp,
    maxHp,
    currentPp,
    maxPp,
    overdrive,
    statusAilments: [],
    buffs: [],
    isDefending: false,
    isDefeated: currentHp <= 0,
    weapon: typeof window.getMainWeapon === "function" ? window.getMainWeapon(mech) : mech.mainWeapon
  };
}

function createEnemyBattleUnit(template, floor, variant = ENEMY_VARIANTS[0], planet = null) {
  const colorId = variant?.colorId || variant?.variantId || template.colorId || "blue";
  const templateWithColor = { ...template, colorId };
  const stats = cloneBattleStats(typeof window.generateEnemyStats === "function" ? window.generateEnemyStats(templateWithColor, floor) : templateWithColor);
  const templateHp = battleNumber(template.maxHp ?? template.hp, 0);
  const maxHp = Math.max(1, Math.floor(templateHp > 1 ? templateHp : stats.hp));
  const currentHp = clampBattleValue(Math.floor(templateHp > 1 ? battleNumber(template.hp, maxHp) : maxHp), 0, maxHp);
  const dropTable = buildEnemyDropTable(template, variant, planet);
  const displayName = variant?.variantId && variant.variantId !== "normal"
    ? `${variant.variantName || variant.name || ""}${variant.variantName?.endsWith("個体") ? "・" : ""}${template.name || "Enemy"}`
    : template.name || "Enemy";
  const imagePath = template.imagePath || (typeof window.resolveEnemyImagePath === "function" ? window.resolveEnemyImagePath(template.planetId || planet?.id, template.enemyId || template.id, colorId) : "");
  return {
    id: "enemy:0",
    side: "enemy",
    sourceType: "enemy",
    enemyId: template.enemyId || template.id || template.name || "enemy",
    name: displayName,
    baseName: template.name || "Enemy",
    level: Math.max(1, Math.floor(battleNumber(template.level, floor))),
    type: template.type || "enemy",
    variant: { ...variant },
    variantId: variant?.variantId || "normal",
    variantName: variant?.variantName || "通常個体",
    fieldEnemyId: template.fieldEnemyId || "",
    colorId,
    imagePath,
    drops: uniqueBattleList(dropTable.map((drop) => drop.id)),
    dropTable,
    dropBias: [...(variant?.dropBias || [])],
    promptParts: [...(template.promptParts || []), ...(variant?.promptParts || [])],
    stats: { ...stats, element: template.element || "none", enemyId: template.enemyId || template.id },
    currentHp,
    maxHp,
    currentPp: Math.max(0, Math.floor(battleNumber(template.pp, stats.pp))),
    maxPp: Math.max(0, Math.floor(battleNumber(template.pp, stats.pp))),
    overdrive: 0,
    statusAilments: [],
    buffs: [],
    isDefending: false,
    isDefeated: currentHp <= 0,
    weapon: {
      id: `${template.id || "enemy"}_weapon`,
      name: template.weaponName || "敵攻撃",
      weaponType: typeof window.normalizeWeaponType === "function" ? window.normalizeWeaponType(template.weaponType || template.rangeType || "melee") : "melee",
      element: template.element || "none",
      power: Math.max(1, Math.floor(battleNumber(template.weaponPower, Math.max(1, (template.level || floor || 1) * 3)))),
      ppCost: 0
    }
  };
}

function masterBattleRows(masterName) {
  const rows = window.masterData?.[masterName];
  return Array.isArray(rows) ? rows : [];
}

function getBattleAction(actionId) {
  return window.getMasterById?.("battleActionMaster", "actionId", actionId) || { actionId: actionId || "attack_default", actionType: "attack", basePowerRate: "1", ppCost: "0" };
}

function getBattleProgramForUnit(unit) {
  const mech = getMech(unit?.machineId);
  if (Array.isArray(mech?.battleProgram) && mech.battleProgram.length) return mech.battleProgram;
  const pilot = getPilot(unit?.pilotId);
  const classId = window.normalizePilotClassId ? window.normalizePilotClassId(pilot?.classId) : pilot?.classId;
  const rows = masterBattleRows("classBattleProgramMaster").filter((row) => row.classId === classId || row.classId === pilot?.classId);
  if (rows.length) return rows.map((row) => ({ ...row, slot: Number(row.slot || 0), enabled: String(row.enabled) !== "false" })).sort((a, b) => Number(a.slot || 0) - Number(b.slot || 0));
  return [{ slot: 1, conditionId: "always", conditionValue: "", actionId: "attack_default", targetId: "enemy_default", enabled: true }];
}

function hpPercent(unit) {
  return Math.round((Number(unit?.currentHp || 0) / Math.max(1, Number(unit?.maxHp || 1))) * 100);
}

function ppPercent(unit) {
  return Math.round((Number(unit?.currentPp || 0) / Math.max(1, Number(unit?.maxPp || 1))) * 100);
}

function enemyMatchesValue(enemy, value, key) {
  return String(enemy?.[key] || enemy?.stats?.[key] || enemy?.weapon?.[key] || "").toLowerCase() === String(value || "").toLowerCase();
}

function battleConditionMet(unit, line, tacticId) {
  const value = line.conditionValue;
  const allies = getAliveBattleUnits("ally");
  const enemies = getAliveBattleUnits("enemy");
  if (tacticId === "escape" && line.actionId === "attack_default" && allies.some((ally) => hpPercent(ally) <= 35)) return false;
  switch (line.conditionId) {
    case "always": return true;
    case "ally_hp_below": return allies.some((ally) => hpPercent(ally) <= battleNumber(value, 50));
    case "ally_hp_above": return allies.some((ally) => hpPercent(ally) >= battleNumber(value, 50));
    case "self_hp_below": return hpPercent(unit) <= battleNumber(value, 50);
    case "self_pp_below": return ppPercent(unit) <= battleNumber(value, 30);
    case "ally_pp_below": return allies.some((ally) => ppPercent(ally) <= battleNumber(value, 30));
    case "enemy_hp_below": return enemies.some((enemy) => hpPercent(enemy) <= battleNumber(value, 30));
    case "enemy_hp_above": return enemies.some((enemy) => hpPercent(enemy) >= battleNumber(value, 30));
    case "enemy_is_boss": return enemies.some((enemy) => enemy.type === "boss" || enemy.variantId === "black" || enemy.enemyId?.includes("boss"));
    case "enemy_has_status": return enemies.some((enemy) => (enemy.statusAilments || []).some((status) => status.id === value || status.statusEffectId === value));
    case "ally_has_status": return allies.some((ally) => (ally.statusAilments || []).some((status) => status.id === value || status.statusEffectId === value));
    case "enemy_weak_to_weapon": return enemies.some((enemy) => window.getEnemyWeakness?.(enemy.enemyId)?.weaponWeakType === value);
    case "enemy_weak_to_element": return enemies.some((enemy) => window.getEnemyWeakness?.(enemy.enemyId)?.elementWeakType === value || enemyMatchesValue(enemy, value, "element"));
    case "enemy_resists_element": return enemies.some((enemy) => window.getEnemyResistance?.(enemy.enemyId)?.elementResistType === value);
    case "round_equals": return battleNumber(window.GameState.battle?.turn, 1) === battleNumber(value, 1);
    case "round_greater_equal": return battleNumber(window.GameState.battle?.turn, 1) >= battleNumber(value, 1);
    case "od_full": return battleNumber(unit?.overdrive, 0) >= 100;
    case "enemy_count_greater_equal": return enemies.length >= battleNumber(value, 1);
    case "ally_count_below": return allies.length <= battleNumber(value, 1);
    case "enemy_color_is": return enemies.some((enemy) => enemy.colorId === value);
    case "enemy_is_rare": return enemies.some((enemy) => ["gold", "white", "black"].includes(enemy.colorId));
    default: return false;
  }
}

function getConditionLabel(conditionId) {
  const row = window.getMasterById?.("battleConditionMaster", "conditionId", conditionId);
  return row?.name || conditionId || "condition";
}

function enemyHasProgramWeakness(enemy, line) {
  const value = line?.conditionValue || "";
  const weakness = window.getEnemyWeakness?.(enemy?.enemyId) || {};
  if (line?.conditionId === "enemy_weak_to_weapon") return weakness.weaponWeakType === value;
  if (line?.conditionId === "enemy_weak_to_element") return weakness.elementWeakType === value || enemyMatchesValue(enemy, value, "element");
  return Boolean(weakness.weaponWeakType || weakness.elementWeakType);
}

function normalizeBattleTargets(target) {
  return Array.isArray(target) ? target.filter(Boolean) : [target].filter(Boolean);
}

function selectBattleTarget(unit, targetId) {
  const allies = getAliveBattleUnits("ally");
  const enemies = getAliveBattleUnits("enemy");
  const byHpAsc = (a, b) => hpPercent(a) - hpPercent(b);
  const byAtkDesc = (a, b) => Math.max(b.stats.sAtk, b.stats.mAtk, b.stats.lAtk) - Math.max(a.stats.sAtk, a.stats.mAtk, a.stats.lAtk);
  if (targetId === "self") return unit;
  if (targetId === "ally_lowest_hp") return [...allies].sort(byHpAsc)[0] || unit;
  if (targetId === "ally_highest_atk") return [...allies].sort(byAtkDesc)[0] || unit;
  if (targetId === "ally_pp_lowest") return [...allies].sort((a, b) => ppPercent(a) - ppPercent(b))[0] || unit;
  if (targetId === "ally_status") return allies.find((ally) => (ally.statusAilments || []).length) || allies[0] || unit;
  if (targetId === "all_allies") return allies;
  if (targetId === "enemy_lowest_hp") return [...enemies].sort(byHpAsc)[0] || null;
  if (targetId === "enemy_highest_atk") return [...enemies].sort(byAtkDesc)[0] || null;
  if (targetId === "enemy_boss") return enemies.find((enemy) => enemy.type === "boss") || enemies[0] || null;
  if (targetId === "enemy_weak") return enemies.find((enemy) => enemyHasProgramWeakness(enemy, window.__currentBattleProgramLine)) || enemies[0] || null;
  if (targetId === "enemy_buffed") return enemies.find((enemy) => (enemy.buffs || []).length) || enemies[0] || null;
  if (targetId === "enemy_priority") return enemies.find((enemy) => enemy.type === "boss" || enemy.variantId === "black") || [...enemies].sort(byAtkDesc)[0] || null;
  if (targetId === "enemy_rare") return enemies.find((enemy) => ["gold", "white", "black"].includes(enemy.colorId)) || enemies[0] || null;
  if (targetId === "all_enemies") return enemies;
  return enemies[0] || null;
}

function canExecuteBattleAction(unit, line, tacticId) {
  const action = getBattleAction(line?.actionId);
  window.__currentBattleProgramLine = line;
  const target = selectBattleTarget(unit, line?.targetId || "enemy_default");
  window.__currentBattleProgramLine = null;
  if (!normalizeBattleTargets(target).length) return false;
  const role = action.requiredRole || "";
  const pilot = getPilot(unit?.pilotId);
  const classId = window.normalizePilotClassId ? window.normalizePilotClassId(pilot?.classId) : pilot?.classId;
  if (role && classId !== role) return false;
  const ppCost = Math.max(0, battleNumber(action.ppCost, 0));
  if (unit.currentPp < ppCost) return false;
  if ((action.actionType || "attack") === "overdrive" && battleNumber(unit.overdrive, 0) < 100) return false;
  if (tacticId === "conserve" && ppCost > 0 && line?.conditionId === "always") return false;
  return true;
}

function executeBattleProgramAction(unit, line, tacticId) {
  if (!canExecuteBattleAction(unit, line, tacticId)) return false;
  const action = getBattleAction(line.actionId);
  window.__currentBattleProgramLine = line;
  const target = selectBattleTarget(unit, line.targetId || "enemy_default");
  window.__currentBattleProgramLine = null;
  const targets = normalizeBattleTargets(target);
  if (!targets.length) return false;
  const role = action.requiredRole || "";
  const pilot = getPilot(unit.pilotId);
  const classId = window.normalizePilotClassId ? window.normalizePilotClassId(pilot?.classId) : pilot?.classId;
  if (role && classId !== role) return false;
  const ppCost = Math.max(0, battleNumber(action.ppCost, 0));
  if (!spendUnitPp(unit, ppCost)) return false;
  logMessage("battle", `条件[${getConditionLabel(line.conditionId)}] -> ${action.name || action.actionId}`, "");
  return targets.every((battleTarget) => executeSingleBattleProgramAction(unit, battleTarget, action));
}

function executeSingleBattleProgramAction(unit, target, action) {
  const actionType = action.actionType || "attack";
  if (actionType === "heal") {
    const amount = Math.max(1, Math.round((unit.stats.mAtk || unit.stats.sAtk || 1) * battleNumber(action.basePowerRate, 1)));
    target.currentHp = Math.min(target.maxHp, target.currentHp + amount);
    logMessage("battle", `${unit.name}: ${action.name || "修復"} -> ${target.name} +${amount}`, "good");
  } else if (actionType === "supply") {
    const amount = Math.max(1, Math.round((unit.stats.mAtk || 20) * 0.25 * battleNumber(action.basePowerRate, 1)));
    target.currentPp = Math.min(target.maxPp, target.currentPp + amount);
    logMessage("battle", `${unit.name}: ${action.name || "補給"} -> ${target.name} PP +${amount}`, "good");
  } else if (actionType === "defend" || actionType === "guard") {
    target.isDefending = true;
    gainUnitOverdrive(target, 5);
    logMessage("battle", `${unit.name}: ${action.name || "防御"}。`, "good");
  } else if (actionType === "buff") {
    window.applyBuffDebuff?.(target, { id: action.actionId, rate: 1.12, turns: 2 });
    logMessage("battle", `${unit.name}: ${action.name || "強化"} -> ${target.name}`, "good");
  } else if (actionType === "debuff" || actionType === "scan" || actionType === "cleanse") {
    window.applyStatusAilment?.(target, { id: action.actionId, turns: 2 });
    logMessage("battle", `${unit.name}: ${action.name || "解析"} -> ${target.name}`, "warn");
  } else if (actionType === "overdrive") {
    if (battleNumber(unit.overdrive, 0) < 100) return false;
    unit.overdrive = 0;
    const damage = window.calculateDamage(unit.stats, target.stats, unit.weapon, { multiplier: battleNumber(action.basePowerRate, 1.9), defenderElement: target.stats?.element, defenderEnemyId: target.enemyId });
    applyBattleDamage(target, damage);
    logMessage("battle", `${unit.name}: ${action.name || "OD"} -> ${target.name} ${damage}ダメージ`, "warn");
  } else {
    const damage = window.calculateDamage(unit.stats, target.stats, unit.weapon, { multiplier: battleNumber(action.basePowerRate, 1), defenderElement: target.stats?.element, defenderEnemyId: target.enemyId });
    applyBattleDamage(target, damage);
    gainUnitOverdrive(unit, 12);
    logMessage("battle", `${unit.name}: ${action.name || "攻撃"} -> ${target.name} ${damage}ダメージ`, damage > 520 ? "warn" : "");
  }
  syncBattleUnitToMech(unit);
  if (target.side === "ally") syncBattleUnitToMech(target);
  return true;
}

function tacticPriorityScore(line, tacticId) {
  const conditionId = line?.conditionId || "";
  const action = getBattleAction(line?.actionId);
  const actionType = action.actionType || "attack";
  let score = 0;
  if (tacticId === "defense") {
    if (["ally_hp_below", "self_hp_below", "ally_pp_below", "ally_has_status"].includes(conditionId)) score += 40;
    if (["heal", "supply", "defend", "guard", "cleanse"].includes(actionType)) score += 20;
  } else if (["offense", "weakness", "attack"].includes(tacticId)) {
    if (["enemy_weak_to_element", "enemy_weak_to_weapon", "enemy_hp_below"].includes(conditionId)) score += 40;
    if (["attack", "overdrive"].includes(actionType)) score += 20;
  } else if (tacticId === "boss") {
    if (conditionId === "enemy_is_boss") score += 50;
    if (line?.targetId === "enemy_boss" || line?.targetId === "enemy_priority") score += 20;
  } else if (tacticId === "rare" || tacticId === "material") {
    if (["enemy_is_rare", "enemy_color_is"].includes(conditionId)) score += 50;
    if (line?.targetId === "enemy_rare" || line?.targetId === "enemy_priority") score += 20;
  } else if (tacticId === "conserve") {
    score -= Math.max(0, battleNumber(action.ppCost, 0)) * 10;
    if (action.actionId === "attack_default") score += 20;
  }
  return score;
}

function chooseProgramLine(unit, tacticId) {
  const fallback = { conditionId: "always", actionId: "attack_default", targetId: "enemy_default", enabled: true, slot: 999 };
  const candidates = [...getBattleProgramForUnit(unit), fallback]
    .filter((line) => String(line.enabled) !== "false" && battleConditionMet(unit, line, tacticId))
    .sort((a, b) => tacticPriorityScore(b, tacticId) - tacticPriorityScore(a, tacticId) || Number(a.slot || 0) - Number(b.slot || 0));
  return candidates.find((line) => canExecuteBattleAction(unit, line, tacticId)) || fallback;
}

window.getUnitBattleProgram = getBattleProgramForUnit;
window.evaluateBattleCondition = battleConditionMet;
window.selectProgrammedAction = chooseProgramLine;
window.canExecuteBattleAction = canExecuteBattleAction;
window.executeProgrammedAction = executeBattleProgramAction;

function getBattleUnits() {
  return Array.isArray(window.GameState?.battle?.battleUnits) ? window.GameState.battle.battleUnits : [];
}

function getAliveBattleUnits(side = "") {
  return getBattleUnits().filter((unit) => (!side || unit.side === side) && !unit.isDefeated && unit.currentHp > 0);
}

function getPrimaryEnemyUnit() {
  return getAliveBattleUnits("enemy")[0] || getBattleUnits().find((unit) => unit.side === "enemy") || null;
}

function isBossFloor(floor) {
  return Number(floor || 1) % 10 === 0;
}

function enemyRowsForPlanetFloor(planet, floor, spawnType) {
  const table = Array.isArray(window.masterData?.planetEnemyTable) ? window.masterData.planetEnemyTable : [];
  const rows = table.filter((row) => (
    row.planetId === planet?.id
    && row.spawnType === spawnType
    && floor >= Number(row.startFloor || 1)
    && floor <= Number(row.endFloor || row.startFloor || 1)
  ));
  return rows.map((row) => {
    const enemy = typeof window.getEnemyMaster === "function" ? window.getEnemyMaster(row.enemyId) : null;
    const catalog = (window.EnemyCatalog || []).find((item) => item.id === row.enemyId || item.enemyId === row.enemyId);
    return enemy || catalog ? { ...(catalog || enemy), ...enemy, tableWeight: Number(row.weight || 1), spawnType: row.spawnType, repeatable: String(row.repeatable) === "true" } : null;
  }).filter(Boolean);
}

function selectEnemyTemplateForBattle(planet, floor) {
  const spawnType = isBossFloor(floor) ? "boss" : "normal";
  const tablePool = enemyRowsForPlanetFloor(planet, floor, spawnType);
  if (tablePool.length) return weightedBattlePick(tablePool, "tableWeight");
  const planetMaterials = planet?.materialPool || [];
  const candidates = planet?.id
    ? window.EnemyCatalog.filter((enemy) => enemy.planetId === planet.id)
    : planetMaterials.length
      ? window.EnemyCatalog.filter((enemy) => enemy.drops?.some((dropId) => planetMaterials.includes(dropId)))
      : window.EnemyCatalog;
  const pool = candidates.length ? candidates : window.EnemyCatalog;
  return pool[Math.floor(Math.random() * pool.length)];
}

function rollEnemyColorVariant(planet, floor) {
  if (typeof window.rollEnemyColor !== "function" || !Array.isArray(window.masterData?.colorMaster) || !window.masterData.colorMaster.length) {
    return rollEnemyVariant({});
  }
  const colorId = window.rollEnemyColor(planet?.id || "planet_001", floor);
  const color = typeof window.getColorMaster === "function" ? window.getColorMaster(colorId) : null;
  return {
    variantId: colorId,
    colorId,
    variantName: color?.prefix || color?.name || colorId,
    dropBias: [colorId],
    promptParts: [colorId],
    weight: 1
  };
}

function buildTurnQueue(units) {
  return units
    .filter((unit) => !unit.isDefeated && unit.currentHp > 0)
    .sort((a, b) => (b.stats?.speed || 0) - (a.stats?.speed || 0))
    .map((unit) => unit.id);
}

function refreshTurnQueue() {
  const battle = window.GameState.battle;
  if (!battle) return [];
  battle.turnQueue = buildTurnQueue(battle.battleUnits || []);
  return battle.turnQueue;
}

function mirrorEnemyForLegacyUi(enemyUnit) {
  if (!enemyUnit) return null;
  return {
    name: enemyUnit.name,
    enemyId: enemyUnit.enemyId,
    baseName: enemyUnit.baseName || enemyUnit.name,
    level: enemyUnit.level || 1,
    type: enemyUnit.type || "enemy",
    variant: enemyUnit.variant || null,
    variantId: enemyUnit.variantId || "normal",
    variantName: enemyUnit.variantName || "",
    drops: Array.isArray(enemyUnit.drops) ? enemyUnit.drops : [],
    dropTable: Array.isArray(enemyUnit.dropTable) ? enemyUnit.dropTable : [],
    hp: enemyUnit.currentHp,
    maxHp: enemyUnit.maxHp,
    pp: enemyUnit.currentPp,
    maxPp: enemyUnit.maxPp,
    sAtk: enemyUnit.stats?.sAtk || 0,
    mAtk: enemyUnit.stats?.mAtk || 0,
    lAtk: enemyUnit.stats?.lAtk || 0,
    sDef: enemyUnit.stats?.sDef || 0,
    mDef: enemyUnit.stats?.mDef || 0,
    lDef: enemyUnit.stats?.lDef || 0,
    speed: enemyUnit.stats?.speed || 0,
    atk: Math.max(enemyUnit.stats?.sAtk || 0, enemyUnit.stats?.mAtk || 0, enemyUnit.stats?.lAtk || 0),
    def: Math.max(enemyUnit.stats?.sDef || 0, enemyUnit.stats?.mDef || 0, enemyUnit.stats?.lDef || 0),
    weaponType: enemyUnit.weapon?.weaponType || "melee",
    element: enemyUnit.weapon?.element || "none"
  };
}

function syncBattleUnitToMech(unit) {
  if (!unit || unit.side !== "ally") return;
  const mech = getMech(unit.machineId);
  if (!mech) return;
  mech.currentHp = clampBattleValue(Math.floor(battleNumber(unit.currentHp, 0)), 0, unit.maxHp);
  mech.hp = mech.currentHp;
  mech.maxHp = Math.max(1, unit.maxHp);
  mech.currentPp = clampBattleValue(Math.floor(battleNumber(unit.currentPp, 0)), 0, unit.maxPp);
  mech.pp = mech.currentPp;
  mech.maxPp = Math.max(0, unit.maxPp);
  mech.overdrive = clampBattleValue(Math.floor(battleNumber(unit.overdrive, 0)), 0, 100);
  mech.isDefeated = Boolean(unit.isDefeated || unit.currentHp <= 0);
}

window.syncBattleUnitsToMechs = function syncBattleUnitsToMechs() {
  getBattleUnits().forEach(syncBattleUnitToMech);
};

function spendUnitPp(unit, amount) {
  const cost = Math.max(0, Math.floor(battleNumber(amount, 0)));
  if (cost <= 0) return true;
  if (unit.currentPp < cost) return false;
  unit.currentPp = Math.max(0, unit.currentPp - cost);
  syncBattleUnitToMech(unit);
  return true;
}

function gainUnitOverdrive(unit, amount) {
  if (!unit) return 0;
  if (typeof window.gainOverdrive === "function") return window.gainOverdrive(unit, amount);
  unit.overdrive = clampBattleValue(Math.floor(battleNumber(unit.overdrive, 0) + battleNumber(amount, 0)), 0, 100);
  return unit.overdrive;
}

function applyBattleDamage(target, damage) {
  const safeDamage = Math.max(1, Math.floor(battleNumber(damage, 1)));
  target.currentHp = Math.max(0, target.currentHp - safeDamage);
  target.isDefeated = target.currentHp <= 0;
  syncBattleUnitToMech(target);
  return safeDamage;
}

function clearDefending(side = "ally") {
  getBattleUnits().forEach((unit) => {
    if (!side || unit.side === side) unit.isDefending = false;
  });
}

window.startBattle = function startBattle(options = {}) {
  const state = window.GameState;
  const fallbackSortieUnits = () => {
    const ids = Array.isArray(state.partyMechIds) ? state.partyMechIds : [];
    return ids.map((id) => (state.mechs || []).find((mech) => mech.id === id)).filter(Boolean);
  };
  const allyUnits = (typeof window.getSortieUnits === "function" ? window.getSortieUnits() : fallbackSortieUnits())
    .map(createAllyBattleUnit)
    .filter(Boolean);
  if (!allyUnits.length || allyUnits.every((unit) => unit.isDefeated)) {
    logMessage("quest", "戦闘可能な味方機がありません。", "danger");
    return false;
  }

  const floor = state.quest?.floor || 1;
  const planet = typeof window.getSelectedPlanet === "function" ? window.getSelectedPlanet() : null;
  const fieldEnemy = options.fieldEnemy || state.quest?.pendingFieldEnemy || null;
  const fieldTemplate = fieldEnemy?.enemyId && typeof window.getEnemyMaster === "function" ? window.getEnemyMaster(fieldEnemy.enemyId) : null;
  const template = fieldTemplate ? { ...fieldTemplate, fieldEnemyId: fieldEnemy.id, colorId: fieldEnemy.colorId } : selectEnemyTemplateForBattle(planet, floor);
  const variant = fieldEnemy?.colorId
    ? { variantId: fieldEnemy.colorId, colorId: fieldEnemy.colorId, variantName: window.getColorMaster?.(fieldEnemy.colorId)?.prefix || fieldEnemy.colorId, dropBias: [fieldEnemy.colorId], promptParts: [fieldEnemy.colorId], weight: 1 }
    : rollEnemyColorVariant(planet, floor);
  const enemyUnit = createEnemyBattleUnit(template, floor, variant, planet);
  const battleUnits = [...allyUnits, enemyUnit];
  state.battle = {
    battleUnits,
    turnQueue: buildTurnQueue(battleUnits),
    turn: 1,
    tacticId: state.quest?.battleTacticId || "standard",
    fieldEnemyId: fieldEnemy?.id || "",
    message: "自動戦闘プログラム実行中",
    guarded: false,
    enemy: mirrorEnemyForLegacyUi(enemyUnit)
  };
  state.logs.battle = [];
  logMessage("battle", `${enemyUnit.name}と遭遇した。`, "danger");
  return true;
};

function selectEnemySkill(enemyUnit) {
  const floor = window.GameState?.quest?.floor || enemyUnit?.level || 1;
  const setRows = masterBattleRows("enemySkillSetMaster").filter((row) => (
    row.enemyId === enemyUnit?.enemyId && floor >= Number(row.unlockFloor || 1)
  ));
  const candidates = setRows.map((row) => {
    const skill = window.getMasterById?.("enemySkillMaster", "skillId", row.skillId);
    return skill ? { ...skill, weight: Number(row.weight || 1) } : null;
  }).filter(Boolean);
  return candidates.length ? weightedBattlePick(candidates, "weight") : null;
}

function selectEnemySkillTargets(enemyUnit, skill) {
  const allies = getAliveBattleUnits("ally");
  const enemies = getAliveBattleUnits("enemy");
  if (skill?.target === "self") return [enemyUnit];
  if (skill?.target === "allies") return allies;
  if (skill?.target === "enemy") return [enemies.find((unit) => unit.id !== enemyUnit.id) || enemyUnit];
  return [allies[Math.floor(Math.random() * allies.length)]].filter(Boolean);
}

function applyEnemySkill(enemyUnit, skill) {
  const targets = selectEnemySkillTargets(enemyUnit, skill);
  if (!skill || !targets.length || Math.random() * 100 > Number(skill.accuracy || 100)) return false;
  targets.forEach((target) => {
    const effectType = skill.effectType || "attack";
    if (effectType === "heal") {
      const amount = Math.max(1, Math.round(enemyUnit.maxHp * Number(skill.power || 20) / 100));
      target.currentHp = Math.min(target.maxHp, target.currentHp + amount);
      logMessage("battle", `${enemyUnit.name}: ${skill.name || skill.skillId} -> ${target.name} +${amount}`, "danger");
    } else if (effectType === "buff") {
      target.buffs = Array.isArray(target.buffs) ? target.buffs : [];
      target.buffs.push({ id: skill.statusEffectId || skill.skillId, turns: 3 });
      logMessage("battle", `${enemyUnit.name}: ${skill.name || skill.skillId} -> ${target.name}`, "danger");
    } else if (effectType === "debuff" || effectType === "ailment") {
      target.statusAilments = Array.isArray(target.statusAilments) ? target.statusAilments : [];
      target.statusAilments.push({ id: skill.statusEffectId || skill.skillId, turns: 3 });
      logMessage("battle", `${enemyUnit.name}: ${skill.name || skill.skillId} -> ${target.name}`, "danger");
    } else {
      const skillWeapon = { ...(enemyUnit.weapon || {}), element: skill.elementId || enemyUnit.weapon?.element || "none" };
      const damage = typeof window.calculateDamage === "function"
        ? window.calculateDamage(enemyUnit.stats, target.stats, skillWeapon, { defending: target.isDefending, multiplier: Number(skill.power || 30) / 30, critical: Math.random() < 0.05 })
        : Math.max(1, Math.floor(Number(skill.power || 20)));
      applyBattleDamage(target, damage);
      gainUnitOverdrive(target, 8);
      logMessage("battle", `${enemyUnit.name}: ${skill.name || skill.skillId} -> ${target.name} ${damage}ダメージ`, "danger");
    }
    syncBattleUnitToMech(target);
  });
  gainUnitOverdrive(enemyUnit, 8);
  return true;
}

function autoEnemyAct(enemyUnit) {
  const aliveAllies = getAliveBattleUnits("ally");
  if (!enemyUnit || !aliveAllies.length) return false;
  const skill = selectEnemySkill(enemyUnit);
  if (skill && applyEnemySkill(enemyUnit, skill)) return true;
  const target = aliveAllies[Math.floor(Math.random() * aliveAllies.length)];
  const damage = typeof window.calculateDamage === "function"
    ? window.calculateDamage(enemyUnit.stats, target.stats, enemyUnit.weapon, { defending: target.isDefending, critical: Math.random() < 0.05 })
    : Math.max(1, Math.floor(Math.max(enemyUnit.stats.sAtk, enemyUnit.stats.mAtk, enemyUnit.stats.lAtk)));
  applyBattleDamage(target, damage);
  gainUnitOverdrive(target, 8);
  gainUnitOverdrive(enemyUnit, 8);
  logMessage("battle", `${enemyUnit.name}: 反撃 -> ${target.name} ${damage}ダメージ`, "danger");
  return true;
}

window.runAutoBattle = function runAutoBattle() {
  const state = window.GameState;
  const battle = state.battle;
  if (!battle) return false;
  const tacticId = battle.tacticId || state.quest?.battleTacticId || "standard";
  const maxRounds = getPrimaryEnemyUnit()?.type === "boss" ? 12 : 8;
  for (let round = 1; round <= maxRounds; round += 1) {
    battle.turn = round;
    refreshTurnQueue();
    const units = battle.turnQueue.map((unitId) => getBattleUnits().find((unit) => unit.id === unitId)).filter(Boolean);
    for (const unit of units) {
      if (unit.isDefeated || unit.currentHp <= 0) continue;
      if (unit.side === "ally") {
        if (tacticId === "escape" && round === 1 && Math.random() < 0.78) {
          window.syncBattleUnitsToMechs();
          logMessage("battle", `${unit.name}: 撤退に成功。`, "warn");
          logMessage("quest", "戦闘から離脱した。", "warn");
          state.battle = null;
          state.currentScene = "quest";
          renderCurrentScene();
          return true;
        }
        const line = chooseProgramLine(unit, tacticId);
        executeBattleProgramAction(unit, line, tacticId);
      } else {
        autoEnemyAct(unit);
      }
      if (!getAliveBattleUnits("enemy").length) {
        winBattle();
        return true;
      }
      if (!getAliveBattleUnits("ally").length) {
        window.syncBattleUnitsToMechs();
        forceReturn("味方が全滅した。", true);
        return true;
      }
    }
    clearDefending("ally");
  }
  if (!getAliveBattleUnits("enemy").length) {
    winBattle();
  } else if (!getAliveBattleUnits("ally").length) {
    forceReturn("味方が全滅した。", true);
  } else {
    battle.message = "自動戦闘継続中";
    const enemy = getPrimaryEnemyUnit();
    if (enemy) {
      const damage = Math.max(1, Math.floor(enemy.maxHp * 0.08));
      applyBattleDamage(enemy, damage);
      logMessage("battle", `長期戦判定 -> ${enemy.name} ${damage}ダメージ`, "warn");
    }
    if (!getAliveBattleUnits("enemy").length) winBattle();
  }
  return true;
};

window.renderBattle = function renderBattle() {
  const state = window.GameState;
  if (!state.battle && !startBattle()) return;
  const battle = state.battle;
  const enemyUnit = getPrimaryEnemyUnit();
  if (!enemyUnit) {
    winBattle();
    return;
  }
  const allyUnits = getBattleUnits().filter((unit) => unit.side === "ally");
  const enemyHpPercent = Math.max(0, (enemyUnit.currentHp / Math.max(1, enemyUnit.maxHp)) * 100);
  window.App.root.innerHTML = `
    ${renderHeader("BATTLE", "戦闘中", `<div class="resource"><small>燃料残量</small><strong>${state.fuel.toFixed(1)} / 100</strong></div>`)}
    <section class="battle-view panel">
      <div class="cockpit-background-layer"></div>
      <div class="enemy-shape"></div>
      ${enemyUnit.imagePath ? `<img class="enemy-image" src="${enemyUnit.imagePath}" alt="${enemyUnit.name}" onerror="this.style.display='none'">` : ""}
      <img class="cockpit-frame-layer" src="ui/cockpit_frame.png" alt="" aria-hidden="true">
      <div class="enemy-card panel panel-pad">
        <div class="section-head"><h2>${enemyUnit.name}</h2><span>Lv. ${enemyUnit.level || 1}</span></div>
        <div>HP ${formatNumber(enemyUnit.currentHp)} / ${formatNumber(enemyUnit.maxHp)}</div>
        <div class="bar" style="--value:${enemyHpPercent}%"><span></span></div>
        <div class="tag-row" style="margin-top:8px"><span class="tag">${enemyUnit.variantName || "通常個体"}</span>${(enemyUnit.dropBias || []).slice(0, 3).map((bias) => `<span class="tag">${bias}</span>`).join("")}</div>
        <div class="tag-row" style="margin-top:8px"><span class="tag">${enemyUnit.type || "enemy"}</span><span class="tag">単体</span></div>
      </div>
    </section>
    <section class="battle-side">
      <div class="panel panel-pad">
        <div class="section-head"><h2>戦況ログ</h2><span>TURN ${String(battle.turn || 1).padStart(2, "0")}</span></div>
        <div class="log-panel">${logHtml("battle")}</div>
      </div>
      <div class="panel panel-pad">
        <div class="section-head"><h2>敵情報</h2><span>${enemyUnit.type || "enemy"}</span></div>
        <div class="stat-row"><span>攻撃力</span><strong>${formatNumber(Math.max(enemyUnit.stats.sAtk, enemyUnit.stats.mAtk, enemyUnit.stats.lAtk))}</strong></div>
        <div class="stat-row"><span>防御力</span><strong>${formatNumber(Math.max(enemyUnit.stats.sDef, enemyUnit.stats.mDef, enemyUnit.stats.lDef))}</strong></div>
        <div class="section-head" style="margin-top:10px"><h3>ドロップ情報</h3></div>
        ${(enemyUnit.drops || []).map((id) => {
          const material = getMaterial(id) || { name: id, rank: "-" };
          return `<div class="material-row"><span>${material.name}</span><span>${material.rank}</span></div>`;
        }).join("") || `<div class="material-row"><span>なし</span><span>-</span></div>`}
      </div>
    </section>
    <div class="command-grid">
      <button class="button" data-action="battle-attack"><span class="cmd-icon">◎</span>攻撃</button>
      <button class="button" data-action="battle-skill"><span class="cmd-icon">✶</span>スキル<br><span class="muted">PP消費</span></button>
      <button class="button" data-action="battle-defend"><span class="cmd-icon">□</span>防御</button>
      <button class="button" data-action="battle-overdrive"><span class="cmd-icon">◇</span>OD<br><span class="muted">100%</span></button>
      <button class="button danger" data-action="battle-run"><span class="cmd-icon">↪</span>逃走<br><span class="muted">70%</span></button>
    </div>
    <section class="panel panel-pad">
      <div class="section-head"><h2>味方${allyUnits.length}機</h2><span>${battle.message || ""}</span></div>
      <div class="ally-grid">${allyUnits.map(renderAllyCard).join("")}</div>
    </section>
  `;
};

function renderAllyCard(unit) {
  const hpPercent = Math.max(0, (unit.currentHp / Math.max(1, unit.maxHp)) * 100);
  const ppText = `${formatNumber(unit.currentPp)} / ${formatNumber(unit.maxPp)}`;
  const odText = `${formatNumber(unit.overdrive || 0)}%`;
  const statusText = unit.isDefeated ? "大破" : unit.isDefending ? "防御中" : "行動可能";
  return `
    <article class="ally-card panel">
      <div class="section-head"><h3>${unit.name || "Machine"}</h3><span class="status-pill">${statusText}</span></div>
      <div class="muted">${unit.pilotName || "パイロット未搭乗"}</div>
      <div>HP ${formatNumber(unit.currentHp)} / ${formatNumber(unit.maxHp)}</div>
      <div class="bar" style="--value:${hpPercent}%"><span></span></div>
      <div class="stat-row"><span>PP</span><strong>${ppText}</strong></div>
      <div class="stat-row"><span>OD</span><strong>${odText}</strong></div>
      <div class="stat-row"><span>SPEED</span><strong>${formatNumber(unit.stats?.speed || 0)}</strong></div>
    </article>
  `;
}

window.battleCommand = function battleCommand(type) {
  const state = window.GameState;
  if (!state.battle) return;
  const enemyUnit = getPrimaryEnemyUnit();
  if (!enemyUnit) {
    winBattle();
    return;
  }

  if (type === "run") {
    window.syncBattleUnitsToMechs();
    if (Math.random() < 0.7) {
      logMessage("quest", "戦闘から離脱した。", "warn");
      state.battle = null;
      state.currentScene = "quest";
      renderCurrentScene();
      return;
    }
    logMessage("battle", "逃走に失敗した。", "danger");
    enemyTurn();
    renderCurrentScene();
    return;
  }

  if (type === "defend") {
    getAliveBattleUnits("ally").forEach((unit) => {
      unit.isDefending = true;
      gainUnitOverdrive(unit, 5);
      syncBattleUnitToMech(unit);
    });
    state.battle.guarded = true;
    logMessage("battle", "全機、防御態勢を取った。", "good");
    enemyTurn();
    renderCurrentScene();
    return;
  }

  const multiplier = type === "overdrive" ? 1.9 : type === "skill" ? 1.35 : 1;
  const label = type === "overdrive" ? "オーバードライブ" : type === "skill" ? "スキル" : "攻撃";
  const queue = refreshTurnQueue();
  queue
    .map((unitId) => getBattleUnits().find((unit) => unit.id === unitId))
    .filter((unit) => unit?.side === "ally" && !unit.isDefeated && unit.currentHp > 0)
    .forEach((unit) => {
      const currentEnemy = getPrimaryEnemyUnit();
      if (!currentEnemy || currentEnemy.isDefeated) return;
      const weapon = unit.weapon || { weaponType: "melee", power: 0, ppCost: 0 };
      const ppCost = type === "skill" ? Math.max(4, battleNumber(weapon.ppCost, 0) + 4) : type === "attack" ? battleNumber(weapon.ppCost, 0) : 0;
      if (type === "overdrive") {
        const canUse = typeof window.canUseOverdrive === "function" ? window.canUseOverdrive(unit) : unit.overdrive >= 100;
        if (!canUse) {
          logMessage("battle", `${unit.name}はODゲージが足りない。`, "warn");
          return;
        }
        unit.overdrive = 0;
      }
      if (!spendUnitPp(unit, ppCost)) {
        logMessage("battle", `${unit.name}はPPが足りない。`, "warn");
        return;
      }
      const damage = typeof window.calculateDamage === "function"
        ? window.calculateDamage(unit.stats, currentEnemy.stats, weapon, { multiplier, critical: Math.random() < 0.05, defenderElement: currentEnemy.stats?.element, defenderEnemyId: currentEnemy.enemyId })
        : Math.max(1, Math.floor(Math.max(unit.stats.sAtk, unit.stats.mAtk, unit.stats.lAtk) * multiplier));
      applyBattleDamage(currentEnemy, damage);
      gainUnitOverdrive(unit, type === "skill" ? 18 : type === "attack" ? 12 : 8);
      syncBattleUnitToMech(unit);
      state.battle.enemy = mirrorEnemyForLegacyUi(currentEnemy);
      logMessage("battle", `${unit.name}の${label}。${damage}ダメージ。`, damage > 520 ? "warn" : "");
    });

  if (!getAliveBattleUnits("enemy").length) {
    winBattle();
    return;
  }
  enemyTurn();
  renderCurrentScene();
};

function enemyTurn() {
  const state = window.GameState;
  const battle = state.battle;
  const enemyUnit = getPrimaryEnemyUnit();
  const aliveAllies = getAliveBattleUnits("ally");
  if (!enemyUnit || !aliveAllies.length) {
    window.syncBattleUnitsToMechs();
    forceReturn("味方が全滅した。", true);
    return;
  }
  const queue = refreshTurnQueue();
  const enemyActs = queue.includes(enemyUnit.id);
  if (!enemyActs) return;
  const target = aliveAllies[Math.floor(Math.random() * aliveAllies.length)];
  const damage = typeof window.calculateDamage === "function"
    ? window.calculateDamage(enemyUnit.stats, target.stats, enemyUnit.weapon, { defending: target.isDefending, critical: Math.random() < 0.05 })
    : Math.max(1, Math.floor(Math.max(enemyUnit.stats.sAtk, enemyUnit.stats.mAtk, enemyUnit.stats.lAtk)));
  applyBattleDamage(target, damage);
  gainUnitOverdrive(target, 8);
  gainUnitOverdrive(enemyUnit, 8);
  logMessage("battle", `${enemyUnit.name}の反撃。${target.name}に${damage}ダメージ。`, "danger");
  clearDefending("ally");
  battle.guarded = false;
  battle.turn = Math.max(1, battleNumber(battle.turn, 1) + 1);
  battle.message = `TURN ${battle.turn}`;
  battle.enemy = mirrorEnemyForLegacyUi(enemyUnit);
  refreshTurnQueue();
  window.syncBattleUnitsToMechs();
  if (!getAliveBattleUnits("ally").length) forceReturn("味方が全滅した。", true);
}

function winBattle() {
  const state = window.GameState;
  const enemyUnit = getPrimaryEnemyUnit() || getBattleUnits().find((unit) => unit.side === "enemy");
  if (!enemyUnit) return;
  const obtained = [];
  const dropTable = Array.isArray(enemyUnit.dropTable) && enemyUnit.dropTable.length
    ? enemyUnit.dropTable
    : (enemyUnit.drops || []).map((id) => ({ id, chance: 0.72, source: "base" }));
  dropTable.forEach((drop) => {
    if (drop.id && Math.random() < Number(drop.chance || 0)) {
      const added = typeof window.addExploreMaterial === "function" ? window.addExploreMaterial(drop.id, 1) : 1;
      if (added) {
        if (typeof window.addExploreMaterial !== "function") state.runMaterials[drop.id] = (state.runMaterials[drop.id] || 0) + 1;
        obtained.push(drop.id);
      }
    }
  });
  getBattleUnits().filter((unit) => unit.side === "ally").forEach((unit) => {
    const pilot = getPilot(unit.pilotId);
    if (pilot && typeof window.addPilotExp === "function") window.addPilotExp(pilot, 35 + Number(enemyUnit.level || 1) * 8);
    unit.isDefending = false;
    syncBattleUnitToMech(unit);
  });
  const obtainedNames = uniqueBattleList(obtained).map((id) => (getMaterial(id) || window.getMechGenerationMaterial?.(id) || { name: id }).name).join(" / ");
  logMessage("battle", obtainedNames ? `入手素材: ${obtainedNames}` : "入手素材なし", obtainedNames ? "good" : "warn");
  logMessage("quest", `${enemyUnit.name}を撃破。素材を回収した。`, "good");
  if (enemyUnit.fieldEnemyId && typeof window.markFieldEnemyDefeated === "function") {
    window.markFieldEnemyDefeated(enemyUnit.fieldEnemyId);
  }
  if (state.quest) state.quest.pendingFieldEnemy = null;
  state.battle = null;
  state.currentScene = "quest";
  renderCurrentScene();
}

window.App.scenes.battle = window.renderBattle;
