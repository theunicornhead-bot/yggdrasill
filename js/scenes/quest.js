"use strict";

const QUEST_DIRS = {
  N: { dx: 0, dy: -1, left: "W", right: "E", label: "北" },
  E: { dx: 1, dy: 0, left: "N", right: "S", label: "東" },
  S: { dx: 0, dy: 1, left: "E", right: "W", label: "南" },
  W: { dx: -1, dy: 0, left: "S", right: "N", label: "西" }
};

const QUEST_EVENT_LABELS = { empty: ".", enemy: "E", fuel: "F", treasure: "T", trap: "!", stairs: "S", wall: "#" };
const QUEST_BACKGROUND_ASSETS = {
  planet_001: {
    open: "ui/gaea_001.png",
    blocked: "ui/gaea_002.png"
  }
};

const FALLBACK_PLANET_MASTER = [
  { id: "planet_001", name: "ガイア", description: "森林平原と岩場が広がる標準探索惑星。初期探索に適している。", difficulty: 1, recommendedRank: "E", maxFloor: 20, availableTerrains: ["plain", "forest", "rocky"], enemyPool: ["shell", "wing"], materialPool: ["broken_shell", "thin_membrane", "brittle_bone", "aged_scale"], fuelModifier: 1.0, unlockCondition: null, promptThemes: ["organic armor", "natural frame"] },
  { id: "planet_002", name: "サンドリア", description: "砂漠と岩場に覆われた乾燥惑星。燃料消費と罠に注意。", difficulty: 2, recommendedRank: "D", maxFloor: 30, availableTerrains: ["desert", "rocky"], enemyPool: ["shell", "bone"], materialPool: ["broken_shell", "brittle_bone", "aged_scale"], fuelModifier: 1.12, unlockCondition: { maxReachedFloor: 5 }, promptThemes: ["desert armor", "sand worn frame"] },
  { id: "planet_003", name: "アビス", description: "水場と水中領域を含む高圧惑星。希少な生体素材が眠る。", difficulty: 3, recommendedRank: "C", maxFloor: 40, availableTerrains: ["waterside", "underwater"], enemyPool: ["nerve", "organ", "wing"], materialPool: ["thin_membrane", "dry_nerve", "wilted_bloodfilm"], fuelModifier: 1.25, unlockCondition: { maxReachedFloor: 10 }, promptThemes: ["deep sea armor", "bioluminescent", "tentacle frame"] },
  { id: "planet_004", name: "イグニス", description: "火山帯と岩盤層で構成される高熱惑星。高出力素材の反応が強い。", difficulty: 4, recommendedRank: "B", maxFloor: 45, availableTerrains: ["volcanic", "rocky"], enemyPool: ["shell", "organ"], materialPool: ["broken_shell", "aged_scale", "wilted_bloodfilm"], fuelModifier: 1.38, unlockCondition: { maxReachedFloor: 15 }, promptThemes: ["living reactor", "volcanic armor", "molten core"] },
  { id: "planet_005", name: "エデン", description: "遺跡市街地と古代施設が残る終盤惑星。宝物と危険イベントが多い。", difficulty: 5, recommendedRank: "A", maxFloor: 50, availableTerrains: ["ruins_city", "ancient_facility"], enemyPool: ["nerve", "organ", "shell"], materialPool: ["dry_nerve", "wilted_bloodfilm", "aged_scale"], fuelModifier: 1.5, unlockCondition: { maxReachedFloor: 20 }, promptThemes: ["ancient machine frame", "ruined city armor"] }
];
window.PlanetMaster = Array.isArray(window.PlanetMaster) && window.PlanetMaster.length ? window.PlanetMaster : FALLBACK_PLANET_MASTER;

const QUEST_TERRAIN_CONFIG = {
  plain: { label: "森林平原", fuelMultiplier: 1.0, wallChance: 0.12, enemyRate: 0.06, trapRate: 0.07, treasureRate: 0.07, fuelSpotRate: 0.08, description: "森林平原。見通しがよく、燃料消費も安定している。", text: "低い草と巨大樹の影がコックピット越しに広がっている", materialCategories: [] },
  forest: { label: "森林", fuelMultiplier: 1.08, wallChance: 0.22, enemyRate: 0.08, trapRate: 0.08, treasureRate: 0.08, fuelSpotRate: 0.07, description: "森林。遮蔽物が多く、敵や素材反応が密集しやすい。", text: "巨大な樹木が視界を覆っている", materialCategories: ["wing", "organ"] },
  desert: { label: "砂漠", fuelMultiplier: 1.3, wallChance: 0.1, enemyRate: 0.07, trapRate: 0.12, treasureRate: 0.06, fuelSpotRate: 0.04, description: "砂漠。砂嵐でセンサーが乱れ、燃料消費も重い。", text: "砂嵐がセンサーを乱している", materialCategories: ["bone", "shell"] },
  rocky: { label: "岩場", fuelMultiplier: 1.1, wallChance: 0.25, enemyRate: 0.08, trapRate: 0.08, treasureRate: 0.04, fuelSpotRate: 0.07, description: "岩場。壁が多く、進路が限定されやすい。", text: "巨大な岩壁と甲殻片が進路を狭めている", materialCategories: ["shell", "bone"] },
  ruins_city: { label: "遺跡市街地", fuelMultiplier: 1.0, wallChance: 0.18, enemyRate: 0.09, trapRate: 0.11, treasureRate: 0.12, fuelSpotRate: 0.07, description: "遺跡市街地。宝物反応が多いが、罠も多い。", text: "崩壊した構造物が前方に広がる", materialCategories: ["nerve", "organ"] },
  waterside: { label: "水場", fuelMultiplier: 1.15, wallChance: 0.14, enemyRate: 0.08, trapRate: 0.07, treasureRate: 0.08, fuelSpotRate: 0.11, description: "水場。燃料補給反応が比較的見つかりやすい。", text: "足元の水音が機体フレームを通して響いている", materialCategories: ["wing", "organ"] },
  underwater: { label: "水中", fuelMultiplier: 1.5, wallChance: 0.16, enemyRate: 0.1, trapRate: 0.09, treasureRate: 0.09, fuelSpotRate: 0.04, description: "水中。高水圧で燃料消費が大きい。", text: "高水圧警報が表示されている", materialCategories: ["organ", "nerve", "wing"] },
  volcanic: { label: "火山", fuelMultiplier: 1.45, wallChance: 0.2, enemyRate: 0.1, trapRate: 0.13, treasureRate: 0.1, fuelSpotRate: 0.05, description: "火山。熱源反応が多く、危険イベントが増える。", text: "熱源反応が急速に増加している", materialCategories: ["shell", "organ"] },
  ancient_facility: { label: "古代施設", fuelMultiplier: 1.22, wallChance: 0.24, enemyRate: 0.11, trapRate: 0.14, treasureRate: 0.14, fuelSpotRate: 0.06, description: "古代施設。高価値反応と罠が密集している。", text: "古代施設の隔壁が暗い通路を形作っている", materialCategories: ["nerve", "organ", "shell"] }
};

window.getTerrainConfig = function getTerrainConfig(terrain) {
  return QUEST_TERRAIN_CONFIG[terrain] || QUEST_TERRAIN_CONFIG.plain;
};

window.getTerrainFuelRate = function getTerrainFuelRate(terrain) {
  const planet = window.getSelectedPlanet ? window.getSelectedPlanet() : null;
  return window.getTerrainConfig(terrain).fuelMultiplier * (planet?.fuelModifier || 1);
};

window.getPlanetById = function getPlanetById(planetId) {
  return window.PlanetMaster.find((planet) => planet.id === planetId) || null;
};

window.getSelectedPlanet = function getSelectedPlanet() {
  const state = window.GameState;
  return window.getPlanetById(state.quest?.currentPlanetId || state.quest?.planetId || state.quest?.selectedPlanetId || state.selectedPlanetId) || null;
};

window.isPlanetUnlocked = function isPlanetUnlocked(planet) {
  if (!planet || !planet.unlockCondition) return true;
  return (window.GameState.player?.maxReachedFloor || 1) >= Number(planet.unlockCondition.maxReachedFloor || 1);
};

function weightedPick(table, keyName) {
  let roll = Math.random() * table.reduce((sum, item) => sum + item.weight, 0);
  for (const item of table) {
    roll -= item.weight;
    if (roll <= 0) return item[keyName];
  }
  return table[0][keyName];
}

window.rollDungeonSizeByFloor = function rollDungeonSizeByFloor(floor) {
  const table = floor <= 3
    ? [{ size: "XS", weight: 80 }, { size: "S", weight: 20 }]
    : floor <= 7
      ? [{ size: "XS", weight: 35 }, { size: "S", weight: 45 }, { size: "M", weight: 20 }]
      : floor <= 15
        ? [{ size: "S", weight: 25 }, { size: "M", weight: 50 }, { size: "L", weight: 25 }]
        : [{ size: "M", weight: 25 }, { size: "L", weight: 50 }, { size: "XL", weight: 25 }];
  return weightedPick(table, "size");
};

window.getMapDimension = function getMapDimension(size) {
  return { XS: 4, S: 6, M: 8, L: 10, XL: 12 }[size] || 4;
};

window.rollTerrainByFloor = function rollTerrainByFloor(floor) {
  const planet = window.getSelectedPlanet() || window.PlanetMaster[0];
  return rollTerrainForPlanet(planet, floor);
};

function rollTerrainForPlanet(planet, floor) {
  const terrains = planet.availableTerrains || ["plain"];
  const table = terrains.map((terrain, index) => ({ terrain, weight: 30 + index * 6 + Math.max(0, floor - 1) * (index + 1) }));
  return weightedPick(table, "terrain");
}

window.ensureQuestFloor = function ensureQuestFloor() {
  const state = window.GameState;
  if (!state.quest?.currentPlanetId && !state.quest?.planetId) return;
  if (!state.quest || !state.quest.map || !state.quest.map.length) {
    window.generateDungeonFloor(state.quest?.floor || 1, state.quest?.currentPlanetId || state.quest?.planetId);
  }
  state.quest.terrain = state.quest.terrain || "plain";
  state.fuel = state.quest.fuel;
};

window.generateDungeonFloor = function generateDungeonFloor(floor, planetId = null) {
  const state = window.GameState;
  const planet = window.getPlanetById(planetId || state.quest?.currentPlanetId || state.quest?.selectedPlanetId || state.selectedPlanetId || state.quest?.planetId) || window.PlanetMaster[0];
  state.selectedPlanetId = planet.id;
  state.maxFloor = planet.maxFloor;
  const size = window.rollDungeonSizeByFloor(floor);
  const terrain = rollTerrainForPlanet(planet, floor);
  const dimension = window.getMapDimension(size);
  const startPosition = { x: Math.floor(dimension / 2), y: dimension - 1 };
  let map = null;
  let reachable = [];

  for (let attempt = 0; attempt < 30; attempt += 1) {
    map = window.createRandomMap(dimension, dimension, terrain);
    map[startPosition.y][startPosition.x] = createCell("empty");
    clearStartArea(map, startPosition);
    reachable = window.getReachableCells(map, startPosition);
    if (reachable.length >= Math.ceil(dimension * dimension * 0.6)) break;
  }
  if (!reachable.length || reachable.length < Math.ceil(dimension * dimension * 0.6)) {
    map = createOpenMap(dimension, dimension);
    reachable = window.getReachableCells(map, startPosition);
  }

  placeEvents(map, reachable, startPosition, floor, terrain, planet);
  const stairsPosition = window.placeStairs(map, startPosition);
  state.quest = {
    selectedPlanetId: state.quest?.selectedPlanetId || planet.id,
    currentPlanetId: planet.id,
    planetId: planet.id,
    planetName: planet.name,
    floor,
    size,
    terrain,
    width: dimension,
    height: dimension,
    map,
    player: { x: startPosition.x, y: startPosition.y, direction: "N" },
    fuel: state.quest?.fuel ?? 100,
    maxFuel: 100,
    discovered: {},
    foundStairs: false,
    stairsPosition,
    log: [],
    planetDifficulty: planet.difficulty,
    materialPool: planet.materialPool,
    promptThemes: planet.promptThemes,
    battleTacticId: state.quest?.battleTacticId || "standard",
    pendingFieldEnemy: null,
    fieldEnemies: [],
    nextFieldEnemySerial: 1,
    bossAlive: floor % 10 === 0,
    bossDefeated: false,
    stairsLocked: floor % 10 === 0,
    stairBossEnemy: null
  };
  if (state.quest.stairsLocked) {
    const stairBossEnemy = buildFieldEnemy(stairsPosition, planet, floor, "boss");
    if (stairBossEnemy) {
      state.quest.stairBossEnemy = stairBossEnemy;
      state.quest.fieldEnemies.push(stairBossEnemy);
      map[stairsPosition.y][stairsPosition.x] = createCell("stairs", {
        fieldEnemyId: stairBossEnemy.id,
        enemyId: stairBossEnemy.enemyId,
        colorId: stairBossEnemy.colorId,
        behavior: "guard"
      });
    } else {
      state.quest.bossAlive = false;
      state.quest.bossDefeated = true;
      state.quest.stairsLocked = false;
    }
  }
  seedFieldEnemies(map, planet, floor, startPosition);
  if (state.quest.stairBossEnemy && !(state.quest.fieldEnemies || []).some((enemy) => enemy.id === state.quest.stairBossEnemy.id)) {
    state.quest.fieldEnemies.push(state.quest.stairBossEnemy);
  }
  discoverAround(startPosition.x, startPosition.y);
  addQuestLog(`${planet.name} ${floor}Fに到達した。${size}級 / ${window.getTerrainConfig(terrain).label}区画を生成。`);
  state.floor = floor;
  state.fuel = state.quest.fuel;
};

window.createRandomMap = function createRandomMap(width, height, terrain = "plain") {
  const terrainConfig = window.getTerrainConfig(terrain);
  const startX = Math.floor(width / 2);
  const startY = height - 1;
  return Array.from({ length: height }, (_, y) => (
    Array.from({ length: width }, (_, x) => {
      const edgeStartSafe = Math.abs(x - startX) <= 1 && y >= startY - 1;
      return createCell(!edgeStartSafe && Math.random() < terrainConfig.wallChance ? "wall" : "empty");
    })
  ));
};

function createOpenMap(width, height) {
  return Array.from({ length: height }, () => Array.from({ length: width }, () => createCell("empty")));
}

function createCell(type, extra = {}) {
  return { type, consumed: false, ...extra };
}

function clearStartArea(map, start) {
  for (let y = Math.max(0, start.y - 1); y <= Math.min(map.length - 1, start.y + 1); y += 1) {
    for (let x = Math.max(0, start.x - 1); x <= Math.min(map[0].length - 1, start.x + 1); x += 1) {
      map[y][x] = createCell("empty");
    }
  }
}

function placeEvents(map, reachable, start, floor, terrain, planet) {
  const terrainConfig = window.getTerrainConfig(terrain);
  const depthBonus = Math.min(0.08, floor * 0.002);
  const enemyRate = Math.min(0.22, terrainConfig.enemyRate + planet.difficulty * 0.01 + depthBonus);
  const treasureRate = Math.min(0.2, terrainConfig.treasureRate + floor * 0.0015);
  const trapRate = Math.min(0.2, terrainConfig.trapRate + planet.difficulty * 0.006);
  reachable.forEach((pos) => {
    const distance = Math.abs(pos.x - start.x) + Math.abs(pos.y - start.y);
    if (distance <= 1) return;
    const roll = Math.random();
    if (roll < enemyRate) map[pos.y][pos.x] = createCell("enemy");
    else if (roll < enemyRate + terrainConfig.fuelSpotRate) map[pos.y][pos.x] = createCell("fuel");
    else if (roll < enemyRate + terrainConfig.fuelSpotRate + treasureRate) map[pos.y][pos.x] = createCell("treasure");
    else if (roll < enemyRate + terrainConfig.fuelSpotRate + treasureRate + trapRate) map[pos.y][pos.x] = createCell("trap");
  });
  if (false && floor % 10 === 0) {
    const bossCandidates = reachable.filter((pos) => Math.abs(pos.x - start.x) + Math.abs(pos.y - start.y) >= Math.max(2, Math.floor(map.length / 2)));
    const pos = bossCandidates[Math.floor(Math.random() * bossCandidates.length)] || reachable.find((cellPos) => Math.abs(cellPos.x - start.x) + Math.abs(cellPos.y - start.y) > 1);
    if (pos) map[pos.y][pos.x] = createCell("enemy");
  }
}

function questRows(masterName) {
  const rows = window.masterData?.[masterName];
  return Array.isArray(rows) ? rows : [];
}

function questWeightedPick(rows, weightKey = "weight") {
  const pool = (rows || []).filter(Boolean);
  if (!pool.length) return null;
  let roll = Math.random() * pool.reduce((sum, row) => sum + Math.max(0, Number(row[weightKey] || 1)), 0);
  for (const row of pool) {
    roll -= Math.max(0, Number(row[weightKey] || 1));
    if (roll <= 0) return row;
  }
  return pool[0];
}

function selectFieldEnemyTemplate(planet, floor, spawnType) {
  const rows = questRows("planetEnemyTable").filter((row) => (
    row.planetId === planet?.id
    && row.spawnType === spawnType
    && floor >= Number(row.startFloor || 1)
    && floor <= Number(row.endFloor || row.startFloor || 1)
  ));
  const picked = questWeightedPick(rows, "weight");
  if (picked && typeof window.getEnemyMaster === "function") return window.getEnemyMaster(picked.enemyId);
  return null;
}

function getEnemyFieldRule(planetId, floor) {
  return questRows("enemyFieldRuleMaster").find((row) => (
    row.planetId === planetId
    && floor >= Number(row.startFloor || 1)
    && floor <= Number(row.endFloor || row.startFloor || 1)
  )) || { spawnCountMin: "1", spawnCountMax: "3", bossSpawnMode: "floorBossOnly", defaultBehavior: "wander", rareBehavior: "flee" };
}

function behaviorForFieldEnemy(enemy, colorId, rule) {
  if (enemy?.role === "boss" || enemy?.enemyTier === "boss") return "guard";
  if (colorId === "gold" || colorId === "white") return rule.rareBehavior || "flee";
  if (colorId === "black") return "chase";
  return rule.defaultBehavior || "wander";
}

function getEnemyBehaviorConfig(behaviorId) {
  return window.getMasterById?.("enemyBehaviorMaster", "behaviorId", behaviorId)
    || { behaviorId: behaviorId || "wander", moveType: behaviorId || "wander", detectionRange: "2", moveInterval: "1" };
}

function buildFieldEnemy(pos, planet, floor, spawnType) {
  const template = selectFieldEnemyTemplate(planet, floor, spawnType);
  if (!template) return null;
  const colorId = typeof window.rollEnemyColor === "function" ? window.rollEnemyColor(planet?.id || "planet_001", floor) : "blue";
  const rule = getEnemyFieldRule(planet?.id, floor);
  const quest = window.GameState.quest;
  const id = `field_enemy_${quest.nextFieldEnemySerial || 1}`;
  const behavior = behaviorForFieldEnemy(template, colorId, rule);
  const behaviorConfig = getEnemyBehaviorConfig(behavior);
  quest.nextFieldEnemySerial = (quest.nextFieldEnemySerial || 1) + 1;
  return {
    id,
    enemyId: template.enemyId,
    name: template.name,
    planetId: planet?.id || template.planetId,
    floor,
    colorId,
    spawnType,
    behavior,
    moveType: behaviorConfig.moveType || behavior,
    detectionRange: Number(behaviorConfig.detectionRange || 2),
    moveInterval: Math.max(1, Number(behaviorConfig.moveInterval || 1)),
    lastMoveTurn: 0,
    x: pos.x,
    y: pos.y,
    isDefeated: false
  };
}

function seedFieldEnemies(map, planet, floor, start) {
  const quest = window.GameState.quest;
  const enemies = [];
  for (let y = 0; y < map.length; y += 1) {
    for (let x = 0; x < (map[y] || []).length; x += 1) {
      if (map[y][x].type !== "enemy") continue;
      const spawnType = floor % 10 === 0 && Math.abs(x - start.x) + Math.abs(y - start.y) >= Math.max(2, Math.floor(map.length / 2)) ? "boss" : "normal";
      const fieldEnemy = buildFieldEnemy({ x, y }, planet, floor, spawnType);
      if (!fieldEnemy) continue;
      enemies.push(fieldEnemy);
      map[y][x].fieldEnemyId = fieldEnemy.id;
      map[y][x].colorId = fieldEnemy.colorId;
      map[y][x].behavior = fieldEnemy.behavior;
      map[y][x].enemyId = fieldEnemy.enemyId;
    }
  }
  quest.fieldEnemies = enemies;
}

window.placeStairs = function placeStairs(map, startPosition) {
  const reachable = window.getReachableCells(map, startPosition)
    .filter((pos) => Math.abs(pos.x - startPosition.x) + Math.abs(pos.y - startPosition.y) >= Math.max(3, Math.floor(map.length / 2)));
  const candidates = reachable.length ? reachable : window.getReachableCells(map, startPosition);
  const pos = candidates[Math.floor(Math.random() * candidates.length)] || startPosition;
  map[pos.y][pos.x] = createCell("stairs");
  return { x: pos.x, y: pos.y };
};

window.isReachable = function isReachable(map, startPosition, targetPosition) {
  return window.getReachableCells(map, startPosition).some((pos) => pos.x === targetPosition.x && pos.y === targetPosition.y);
};

window.getReachableCells = function getReachableCells(map, startPosition) {
  const height = map.length;
  const width = map[0]?.length || 0;
  const seen = new Set();
  const queue = [startPosition];
  const result = [];
  while (queue.length) {
    const pos = queue.shift();
    const key = `${pos.x},${pos.y}`;
    if (seen.has(key)) continue;
    if (!isInside(pos.x, pos.y, width, height) || map[pos.y][pos.x].type === "wall") continue;
    seen.add(key);
    result.push(pos);
    Object.values(QUEST_DIRS).forEach((dir) => queue.push({ x: pos.x + dir.dx, y: pos.y + dir.dy }));
  }
  return result;
};

function isInside(x, y, width, height) {
  return x >= 0 && y >= 0 && x < width && y < height;
}

window.renderQuest = function renderQuest() {
  const state = window.GameState;
  if (!state.quest?.currentPlanetId && !state.quest?.planetId) {
    renderPlanetSelect();
    return;
  }
  window.ensureQuestFloor();
  const quest = state.quest;
  const planet = window.getSelectedPlanet();
  const terrain = window.getTerrainConfig(quest.terrain);
  window.App.root.innerHTML = `
    ${renderQuestHeader(planet, quest)}
    ${renderCockpitView()}
    ${renderQuestReadout(terrain)}
    ${renderQuestCommands()}
    <section class="explore-lower">
      <div class="panel panel-pad quest-party-panel">
        <div class="party-list quest-party-grid">${(typeof window.getSortieUnits === "function" ? window.getSortieUnits() : state.mechs.filter((mech) => getPilot(mech.pilotId)).slice(0, 4)).map(renderPartyUnit).join("")}</div>
      </div>
    </section>
    ${renderMiniMapModal()}
    ${renderQuestMaterialsModal()}
    ${renderExploreItemModal()}
  `;
};

function renderQuestHeader(planet, quest) {
  return `
    <div class="top-bar quest-top-bar">
      <div class="title-block">
        <div class="quest-title-row">
          <span class="title-ja">${planet.name}</span>
          <span class="quest-floor-badge"><small>階層</small><strong>${quest.floor}F / ${planet.maxFloor}F</strong></span>
        </div>
        <span class="title-en">EXPLORE</span>
      </div>
      <div class="resource-row quest-resource-row">
        <button class="resource quest-material-button" data-action="open-quest-materials" type="button"><small>所持素材</small><strong>${totalMaterials()} / 100</strong></button>
      </div>
    </div>
  `;
}

function renderQuestReadout(terrain) {
  const front = getFrontCell();
  const currentCell = window.GameState.quest.map[window.GameState.quest.player.y][window.GameState.quest.player.x];
  const tactic = getCurrentBattleTactic();
  return `
    <section class="quest-readout panel panel-pad">
      <div class="quest-flavor">${terrain.text}</div>
      <div class="quest-sensor-line">${describeFrontCell(front)} <span class="muted">${describeCurrentCell(currentCell)}</span></div>
      <div class="quest-sensor-line"><span class="muted">戦闘方針</span> ${tactic.name || tactic.tacticId}</div>
      <div class="quest-log-scroll">${questLogHtml()}</div>
    </section>
  `;
}

function renderQuestCommands() {
  const quest = window.GameState.quest;
  const tactics = getBattleTactics();
  return `
    <section class="quest-command-panel panel panel-pad">
      <div class="quest-special-row">
        <button class="button quest-utility-button" data-action="quest-next-floor" ${quest.foundStairs ? "" : "disabled"}>↓ 下の階へ</button>
        <button class="button quest-utility-button" data-action="open-explore-items" type="button">アイテム</button>
        <button class="button quest-utility-button subdued danger" data-action="return-base">⌂ 帰還</button>
      </div>
      <div class="quest-command-layout">
        ${renderFuelMeter(quest)}
        <div class="quest-command-main">
          <button class="button quest-command-button" data-action="quest-left"><span class="cmd-icon">↶</span>左旋回</button>
          <button class="button quest-command-button primary" data-action="quest-forward"><span class="cmd-icon">↑</span>前進<br><span class="muted">🔥-1</span></button>
          <button class="button quest-command-button" data-action="quest-right"><span class="cmd-icon">↷</span>右旋回</button>
          <button class="button quest-command-button quest-search-button" data-action="quest-search"><span class="cmd-icon">◇</span><span>調べる<br><span class="muted">🔥-1</span></span></button>
        </div>
      </div>
      <div class="quest-tactic-row">
        ${tactics.map((tactic) => `<button class="button quest-tactic-button ${quest.battleTacticId === tactic.tacticId ? "active" : ""}" data-action="set-battle-tactic" data-tactic="${tactic.tacticId}" type="button">${tactic.name || tactic.tacticId}</button>`).join("")}
      </div>
    </section>
  `;
}

function getBattleTactics() {
  const rows = questRows("battleTacticMaster");
  return rows.length ? rows : [
    { tacticId: "standard", name: "標準", description: "通常の自動戦闘" },
    { tacticId: "attack", name: "攻撃重視", description: "弱点と追撃を優先" },
    { tacticId: "defense", name: "防御重視", description: "防御と回復を優先" },
    { tacticId: "escape", name: "撤退優先", description: "危険時に逃走" }
  ];
}

function getCurrentBattleTactic() {
  const quest = window.GameState.quest;
  return getBattleTactics().find((tactic) => tactic.tacticId === quest?.battleTacticId) || getBattleTactics()[0];
}

window.setBattleTactic = function setBattleTactic(tacticId) {
  const tactic = getBattleTactics().find((item) => item.tacticId === tacticId) || getBattleTactics()[0];
  if (!window.GameState.quest) return;
  window.GameState.quest.battleTacticId = tactic.tacticId;
  addQuestLog(`戦闘方針を「${tactic.name || tactic.tacticId}」に変更。`, "good");
  window.renderCurrentScene();
};

window.openExploreItemMenu = function openExploreItemMenu() {
  if (!window.GameState.quest) return;
  window.GameState.quest.itemMenuOpen = true;
  window.renderCurrentScene();
};

window.closeExploreItemMenu = function closeExploreItemMenu() {
  if (window.GameState.quest) window.GameState.quest.itemMenuOpen = false;
  window.renderCurrentScene();
};

window.getUsableExploreItems = function getUsableExploreItems() {
  const inventory = typeof window.ensureInventoryState === "function" ? window.ensureInventoryState() : window.GameState.inventory;
  const masters = Array.isArray(window.masterData?.itemMaster) && window.masterData.itemMaster.length
    ? window.masterData.itemMaster
    : [
      { itemId: "repair_kit_s", name: "応急修復キットS", effectType: "hpRecover", power: "300", target: "ally", description: "味方単体のHPを回復" },
      { itemId: "ether_pack_s", name: "PP補給パックS", effectType: "ppRecover", power: "20", target: "ally", description: "味方単体のPPを回復" },
      { itemId: "revive_cell_s", name: "再起動セルS", effectType: "revive", power: "250", target: "allyDefeated", description: "戦闘不能の味方を復帰" },
      { itemId: "ammo_pack_s", name: "弾薬補給パックS", effectType: "ammoRecover", power: "1", target: "ally", description: "サブウェポン残弾を回復" }
    ];
  return masters.map((item) => ({ ...item, count: inventory?.items?.[item.itemId] || 0 }));
};

function renderExploreItemModal() {
  const quest = window.GameState.quest;
  if (!quest?.itemMenuOpen) return "";
  const items = window.getUsableExploreItems();
  return `
    <div class="modal-backdrop explore-items-modal-backdrop">
      <section class="quest-materials-modal panel panel-pad" role="dialog" aria-modal="true" aria-label="アイテム">
        <div class="section-head">
          <h2>アイテム</h2>
          <button class="button mini-map-close" data-action="close-explore-items" type="button">閉じる</button>
        </div>
        <div class="compact-list">${items.length ? items.map(renderExploreItemBlock).join("") : `<div class="muted">使用可能なアイテムがありません。</div>`}</div>
      </section>
    </div>
  `;
}

function renderExploreItemBlock(item) {
  const targets = typeof window.getSortieUnits === "function" ? window.getSortieUnits() : (window.GameState.mechs || []);
  return `
    <article class="panel panel-pad">
      <div class="section-head"><h3>${item.name || item.itemId}</h3><span>x${item.count || 0}</span></div>
      <p class="muted">${item.description || item.effectType || ""}</p>
      <div class="compact-list">${targets.length ? targets.map((machine) => renderExploreItemTarget(item, machine)).join("") : `<div class="muted">使用対象が未準備です。</div>`}</div>
    </article>
  `;
}

function renderExploreItemTarget(item, machine) {
  const canUse = window.canUseExploreItem(item, machine);
  const pilot = displayPilot(machine.pilotId);
  return `
    <div class="material-row">
      <span style="flex:1">${machine.name || "Machine"}<br><span class="muted">${pilot.name} / HP ${formatNumber(machine.currentHp ?? machine.hp ?? 0)} / PP ${formatNumber(machine.currentPp ?? machine.pp ?? 0)}</span></span>
      <button class="button" data-action="use-explore-item" data-item="${item.itemId}" data-target="${machine.id}" ${canUse ? "" : "disabled"} type="button">使う</button>
    </div>
  `;
}

window.canUseExploreItem = function canUseExploreItem(item, targetUnit) {
  const inventory = typeof window.ensureInventoryState === "function" ? window.ensureInventoryState() : window.GameState.inventory;
  if (!item || !targetUnit || (inventory?.items?.[item.itemId] || 0) <= 0) return false;
  const effectType = item.effectType || item.type || "";
  if (effectType === "revive") return Boolean(targetUnit.isDefeated || Number(targetUnit.currentHp ?? targetUnit.hp ?? 0) <= 0);
  if (effectType === "hpRecover") return Number(targetUnit.currentHp ?? targetUnit.hp ?? 0) < Number(targetUnit.maxHp || targetUnit.stats?.hp || targetUnit.hp || 1);
  if (effectType === "ppRecover") return Number(targetUnit.currentPp ?? targetUnit.pp ?? 0) < Number(targetUnit.maxPp || targetUnit.stats?.pp || targetUnit.pp || 0);
  if (effectType === "ammoRecover") return true;
  return false;
};

window.useExploreItem = function useExploreItem(itemId, targetUnitId) {
  const item = window.getUsableExploreItems().find((entry) => entry.itemId === itemId);
  const target = getMech(targetUnitId);
  if (!window.canUseExploreItem(item, target)) {
    addQuestLog("アイテムを使用できません。", "warn");
    window.renderCurrentScene();
    return false;
  }
  const inventory = typeof window.ensureInventoryState === "function" ? window.ensureInventoryState() : window.GameState.inventory;
  const power = Number(item.power || 0);
  const stats = getRuntimeUnitStatsForMachine(target);
  target.maxHp = Math.max(1, Number(target.maxHp || stats.hp || target.hp || 1));
  target.maxPp = Math.max(0, Number(target.maxPp || stats.pp || target.pp || 0));
  const effectType = item.effectType || item.type || "";
  if (effectType === "revive") {
    target.isDefeated = false;
    target.currentHp = Math.min(target.maxHp, Math.max(1, power));
    target.hp = target.currentHp;
  } else if (effectType === "hpRecover") {
    target.currentHp = Math.min(target.maxHp, Number(target.currentHp ?? target.hp ?? target.maxHp) + power);
    target.hp = target.currentHp;
  } else if (effectType === "ppRecover") {
    target.currentPp = Math.min(target.maxPp, Number(target.currentPp ?? target.pp ?? target.maxPp) + power);
    target.pp = target.currentPp;
  } else if (effectType === "ammoRecover") {
    (target.subWeapons || []).forEach((weapon) => {
      weapon.ammo = weapon.maxAmmo ?? weapon.ammo ?? 0;
    });
  }
  inventory.items[itemId] = Math.max(0, (inventory.items[itemId] || 0) - 1);
  addQuestLog(`${item.name || itemId}を使用した。`, "good");
  window.renderCurrentScene();
  return true;
};

function renderFuelMeter(quest) {
  const fuelPercent = Math.max(0, Math.min(100, (quest.fuel / quest.maxFuel) * 100));
  const fuelTone = quest.fuel <= 15 ? "log-danger" : quest.fuel <= 30 ? "log-warn" : "";
  return `
    <div class="quest-fuel-meter">
      <span>燃料</span>
      <strong class="${fuelTone}">${quest.fuel.toFixed(1)}</strong>
      <small>現在</small>
      <div class="bar" style="--value:${fuelPercent}%"><span></span></div>
      <small>最大 ${quest.maxFuel}</small>
    </div>
  `;
}

function renderQuestPartySetupModal() {
  const state = window.GameState;
  if (!state.quest?.partySetupOpen) return "";
  const sortieIds = getQuestSortieIds();
  if (typeof window.ensureMechRosterState === "function") window.ensureMechRosterState();
  const mechs = state.mechs || [];
  const selectedSet = new Set(sortieIds.filter(Boolean));
  return `
    <div class="modal-backdrop quest-party-setup-modal-backdrop">
      <section class="quest-party-setup-modal panel panel-pad" role="dialog" aria-modal="true" aria-label="探索パーティ編成">
        <div class="section-head">
          <h2>探索パーティ編成</h2>
          <button class="button mini-map-close" data-action="close-quest-party-setup" type="button">閉じる</button>
        </div>
        ${state.quest.partyWarning ? `<div class="log-line log-danger">${state.quest.partyWarning}</div>` : ""}
        <div class="quest-party-setup-grid">
          <div>
            <div class="section-head"><h3>出撃メンバー</h3><span>ハンガー編成を初期表示</span></div>
            <div class="quest-party-slot-list">
              ${sortieIds.map((mechId, index) => renderQuestPartySlot(mechId, index)).join("")}
            </div>
          </div>
          <div>
            <div class="section-head"><h3>入れ替え候補</h3><span>${formatNumber(mechs.length)}機</span></div>
            <div class="quest-party-candidate-list">
              ${mechs.map((mech) => renderQuestPartyCandidate(mech, selectedSet)).join("") || `<div class="muted">機体がありません。</div>`}
            </div>
          </div>
        </div>
        <div class="quest-party-setup-actions">
          <button class="button" data-action="quest-rest-day" onclick="event.stopPropagation(); window.restQuestDay?.()" type="button">休息</button>
          <button class="button primary" data-action="depart-selected-planet-quest" onclick="event.stopPropagation(); window.departSelectedPlanetQuest?.()" type="button">探索へ出発</button>
        </div>
      </section>
    </div>
  `;
}

function renderQuestPartySlot(mechId, index) {
  const mech = mechId ? getMech(mechId) : null;
  const pilot = mech ? getPilot(mech.pilotId) : null;
  const vitality = pilot ? pilotVitality(pilot) : 0;
  return `
    <article class="quest-party-slot panel panel-pad ${pilot && vitality <= 0 ? "danger" : ""}">
      <div class="section-head"><h3>SLOT ${index + 1}</h3><span>${pilot ? `体力 ${formatNumber(vitality)}` : "-"}</span></div>
      ${mech ? `<div class="material-row"><span>${mech.name || mech.id}<br><span class="muted">${pilot?.name || "未搭乗"}</span></span><button class="button mini-map-close" data-action="remove-quest-sortie-slot" data-slot="${index}" type="button">外す</button></div>` : `<div class="muted">未編成</div>`}
    </article>
  `;
}

function renderQuestPartyCandidate(mech, selectedSet) {
  const pilot = getPilot(mech?.pilotId);
  const vitality = pilot ? pilotVitality(pilot) : 0;
  const selected = selectedSet.has(mech.id);
  return `
    <article class="quest-party-candidate panel panel-pad ${pilot && vitality <= 0 ? "danger" : ""}">
      <div class="section-head"><h3>${mech.name || mech.id}</h3><span>${selected ? "編成中" : "候補"}</span></div>
      <div class="material-row"><span>${pilot?.name || "未搭乗"}</span><strong>体力 ${pilot ? formatNumber(vitality) : "-"}</strong></div>
      <div class="quest-party-candidate-actions">
        ${getQuestSortieIds().map((_, index) => `<button class="button mini-map-close" data-action="assign-quest-sortie-slot" data-slot="${index}" data-mech="${mech.id}" ${selected ? "disabled" : ""} type="button">${index + 1}</button>`).join("")}
      </div>
    </article>
  `;
}

window.closeQuestPartySetup = function closeQuestPartySetup() {
  if (window.GameState.quest) window.GameState.quest.partySetupOpen = false;
  window.renderCurrentScene();
};

window.assignQuestSortieSlot = function assignQuestSortieSlot(slot, mechId) {
  const state = window.GameState;
  const index = Number(slot);
  const ids = getQuestSortieIds().map((id) => id === mechId ? null : id);
  if (!getMech(mechId) || index < 0 || index >= ids.length) return;
  ids[index] = mechId;
  state.quest.sortieMechIds = ids;
  state.quest.partyWarning = "";
  window.renderCurrentScene();
};

window.removeQuestSortieSlot = function removeQuestSortieSlot(slot) {
  const state = window.GameState;
  const ids = getQuestSortieIds();
  const index = Number(slot);
  if (index < 0 || index >= ids.length) return;
  ids[index] = null;
  state.quest.sortieMechIds = ids;
  state.quest.partyWarning = "";
  window.renderCurrentScene();
};

window.restQuestDay = function restQuestDay() {
  const state = window.GameState;
  state.quest = state.quest || {};
  state.currentScene = "quest";
  buildExploreReturnResult({
    materials: {},
    message: "探索を見送り、休息した。",
    consumeVitality: false
  });
  state.quest.partySetupOpen = false;
  state.quest.partyWarning = "";
  state.currentScene = "quest";
  if (typeof window.savePlayerData === "function") window.savePlayerData();
  window.renderCurrentScene();
};


function renderPlanetSelect() {
  const state = window.GameState;
  const fallbackPlanet = window.PlanetMaster.find((planet) => window.isPlanetUnlocked(planet)) || window.PlanetMaster[0];
  const selectedId = state.quest?.selectedPlanetId || state.selectedPlanetId || fallbackPlanet?.id || null;
  if (state.quest && selectedId) state.quest.selectedPlanetId = selectedId;
  if (selectedId) state.selectedPlanetId = selectedId;
  const selectedPlanet = window.getPlanetById(selectedId) || fallbackPlanet;
  const terrains = (selectedPlanet?.availableTerrains || []).map((terrain) => window.getTerrainConfig(terrain).label).join(" / ");
  const unlocked = window.isPlanetUnlocked(selectedPlanet);
  window.App.root.innerHTML = `
    ${renderHeader("惑星選択", "PLANET SELECT")}
    <section class="planet-select panel panel-pad">
      <div class="section-head"><h2>惑星選択</h2><span>PLANET SELECT</span></div>
      <div class="planet-card-scroll">${window.PlanetMaster.map(renderPlanetCard).join("")}</div>
      <div class="planet-detail panel panel-pad">
        <div class="section-head"><h2>${selectedPlanet.name}</h2><span class="tag">難易度 ${selectedPlanet.difficulty}</span></div>
        <div class="material-row"><span>地形</span><strong>${terrains}</strong></div>
        <div class="material-row"><span>推奨ランク</span><strong>${selectedPlanet.recommendedRank}</strong></div>
        <p class="muted">${selectedPlanet.description}</p>
      </div>
      ${state.quest?.startError ? `<div class="log-line log-danger">${state.quest.startError}</div>` : ""}
      <button class="button planet-start-button" data-action="start-selected-planet-quest" ${unlocked ? "" : "disabled"}>探索開始</button>
    </section>
    ${renderQuestPartySetupModal()}
    ${renderExploreReturnResultModal()}
  `;
}

function renderPlanetCard(planet) {
  const unlocked = window.isPlanetUnlocked(planet);
  const selected = (window.GameState.quest?.selectedPlanetId || window.GameState.selectedPlanetId) === planet.id;
  const terrains = planet.availableTerrains.map((terrain) => window.getTerrainConfig(terrain).label).join(" / ");
  const unlockText = planet.unlockCondition ? `到達 ${planet.unlockCondition.maxReachedFloor}F` : "初期開放";
  return `
    <button class="planet-card panel ${selected ? "selected" : ""} ${unlocked ? "" : "locked"}" data-action="select-planet" data-planet="${planet.id}" ${unlocked ? "" : "disabled"} type="button">
      <div class="section-head"><h3>${planet.name}</h3><span class="tag">難易度 ${planet.difficulty}</span></div>
      <p class="muted">${planet.description}</p>
      <div class="tag-row"><span class="tag">推奨 ${planet.recommendedRank}</span><span class="tag">${planet.maxFloor}F</span></div>
      <div class="material-row"><span>地形</span><strong>${terrains}</strong></div>
      <div class="material-row"><span>状態</span><strong>${unlocked ? "OPEN" : unlockText}</strong></div>
      <span class="tag">${unlocked ? "選択可能" : "LOCKED"}</span>
    </button>
  `;
}

window.selectPlanet = function selectPlanet(planetId) {
  const planet = window.getPlanetById(planetId);
  if (!planet || !window.isPlanetUnlocked(planet)) return;
  const state = window.GameState;
  state.selectedPlanetId = planet.id;
  if (state.quest) state.quest.selectedPlanetId = planet.id;
  window.renderCurrentScene();
};

function pilotVitality(pilot) {
  if (!pilot) return 0;
  if (typeof window.normalizePilotStatus === "function") window.normalizePilotStatus(pilot);
  return Math.max(0, Math.min(100, Math.floor(Number(pilot.survival?.vitality ?? 100))));
}

function initializeQuestSortieParty() {
  const state = window.GameState;
  const limit = typeof window.getPartyMechLimit === "function" ? window.getPartyMechLimit() : 4;
  const ids = Array.from({ length: limit }, (_, index) => (state.partyMechIds || [])[index] || null);
  state.quest = state.quest || {};
  state.quest.sortieMechIds = ids;
  state.quest.partySetupOpen = true;
  state.quest.partyWarning = "";
  return ids;
}

function getQuestSortieIds() {
  const state = window.GameState;
  const limit = typeof window.getPartyMechLimit === "function" ? window.getPartyMechLimit() : 4;
  const source = Array.isArray(state.quest?.sortieMechIds) ? state.quest.sortieMechIds : state.partyMechIds || [];
  return Array.from({ length: limit }, (_, index) => source[index] || null);
}

window.getSortieUnits = function getSortieUnits() {
  if (typeof window.ensureMechRosterState === "function") window.ensureMechRosterState();
  const mechs = window.GameState.mechs || [];
  const partyIds = getQuestSortieIds();
  return partyIds
    .map((id) => mechs.find((mech) => mech.id === id) || null)
    .filter((mech) => mech && getPilot(mech.pilotId))
    .slice(0, typeof window.getPartyMechLimit === "function" ? window.getPartyMechLimit() : 4);
};

window.validateSortieParty = function validateSortieParty() {
  const state = window.GameState;
  const units = window.getSortieUnits();
  if (!units.length) {
    if (state.quest) state.quest.startError = "出撃可能な機体がありません。";
    logMessage("bar", "出撃可能な機体がありません。", "danger");
    return false;
  }
  const pilots = units.map((mech) => getPilot(mech.pilotId)).filter(Boolean);
  const exhausted = pilots.filter((pilot) => pilotVitality(pilot) <= 0);
  const availablePilots = (state.pilots || []).filter((pilot) => !pilot.lost && pilotVitality(pilot) > 0);
  if (pilots.length && exhausted.length === pilots.length && !availablePilots.length) {
    if (state.quest) state.quest.partyWarning = "全員の体力が0です。探索には出発できません。休息してください。";
    return false;
  }
  if (exhausted.length) {
    if (state.quest) state.quest.partyWarning = `体力0のメンバーがいます: ${exhausted.map((pilot) => pilot.name || pilot.id).join(" / ")}。外すか入れ替えてください。`;
    return false;
  }
  const isolated = pilots.filter((pilot) => {
    if (typeof window.normalizePilotStatus === "function") window.normalizePilotStatus(pilot);
    return typeof window.isPilotConditionActive === "function" && window.isPilotConditionActive(pilot) && pilot.survival?.inMedicalRoom;
  });
  if (isolated.length) {
    const confirmed = window.confirm
      ? window.confirm(`${isolated.map((pilot) => pilot.name || pilot.id).join(" / ")}は医務室に隔離中です。強行出撃させますか？ 戦闘不能になるとロストします。`)
      : true;
    if (!confirmed) {
      if (state.quest) state.quest.partyWarning = "医務室のパイロットを出撃させるには確認が必要です。";
      return false;
    }
    isolated.forEach((pilot) => {
      pilot.survival.inMedicalRoom = false;
      pilot.survival.forceSortie = true;
    });
  }
  if (state.quest) state.quest.startError = "";
  if (state.quest) state.quest.partyWarning = "";
  return true;
};

window.startSelectedPlanetQuest = function startSelectedPlanetQuest() {
  const state = window.GameState;
  const planet = window.getPlanetById(state.quest?.selectedPlanetId || state.selectedPlanetId);
  if (!planet || !window.isPlanetUnlocked(planet)) return false;
  state.selectedPlanetId = planet.id;
  state.currentScene = "quest";
  state.quest = state.quest || {};
  state.quest.selectedPlanetId = planet.id;
  initializeQuestSortieParty();
  window.renderCurrentScene();
  return true;
};

window.departSelectedPlanetQuest = function departSelectedPlanetQuest() {
  const state = window.GameState;
  const planet = window.getPlanetById(state.quest?.selectedPlanetId || state.selectedPlanetId);
  if (!planet || !window.isPlanetUnlocked(planet)) return false;
  if (!window.validateSortieParty()) {
    window.renderCurrentScene();
    return false;
  }
  state.selectedPlanetId = planet.id;
  if (state.quest) {
    state.quest.partySetupOpen = false;
    state.quest.partyWarning = "";
    state.quest.selectedPlanetId = planet.id;
    state.quest.currentPlanetId = planet.id;
    state.quest.planetId = planet.id;
    state.quest.map = [];
    state.quest.floor = 1;
    state.quest.fuel = state.quest.maxFuel || 100;
  }
  window.generateDungeonFloor(1, planet.id);
  window.renderCurrentScene();
  return true;
};
window.renderCockpitView = function renderCockpitView() {
  const quest = window.GameState.quest;
  const backgroundSrc = getQuestBackgroundImage();
  return `
    <section class="cockpit-view panel">
      ${backgroundSrc
        ? `<img class="cockpit-background-layer" src="${backgroundSrc}" alt="" aria-hidden="true">`
        : `<div class="cockpit-background-layer"></div>`}
      <img class="cockpit-frame-layer" src="ui/cockpit_frame.png" alt="" aria-hidden="true">
      ${renderMiniMapButton()}
    </section>
  `;
};

function getQuestBackgroundImage() {
  const quest = window.GameState.quest;
  const planetId = quest?.currentPlanetId || quest?.planetId || quest?.selectedPlanetId || window.GameState.selectedPlanetId;
  const planet = window.getPlanetById(planetId);
  if (planet?.openBackground || planet?.blockedBackground) {
    const front = window.getFrontCell();
    return (!front || front.type === "wall" || front.outOfBounds) ? (planet.blockedBackground || planet.openBackground || "") : (planet.openBackground || planet.blockedBackground || "");
  }
  const assets = QUEST_BACKGROUND_ASSETS[planetId];
  if (!assets) return "";
  const front = window.getFrontCell();
  return (!front || front.type === "wall" || front.outOfBounds) ? assets.blocked : assets.open;
}

function renderMiniMapButton() {
  return `
    <button class="mini-map mini-map-button panel panel-pad" data-action="open-mini-map" type="button" aria-label="ミニマップを開く">
      ${renderMiniMap()}
    </button>
  `;
}

window.openMiniMapModal = function openMiniMapModal() {
  if (!window.GameState.quest) return;
  window.GameState.quest.miniMapOpen = true;
  window.renderCurrentScene();
};

window.closeMiniMapModal = function closeMiniMapModal() {
  if (window.GameState.quest) window.GameState.quest.miniMapOpen = false;
  window.renderCurrentScene();
};

window.openQuestMaterialsModal = function openQuestMaterialsModal() {
  if (!window.GameState.quest) return;
  window.GameState.quest.materialsOpen = true;
  window.renderCurrentScene();
};

window.closeQuestMaterialsModal = function closeQuestMaterialsModal() {
  if (window.GameState.quest) window.GameState.quest.materialsOpen = false;
  window.renderCurrentScene();
};

window.getFrontCell = function getFrontCell() {
  const quest = window.GameState.quest;
  const dir = QUEST_DIRS[quest.player.direction];
  const x = quest.player.x + dir.dx;
  const y = quest.player.y + dir.dy;
  if (!isInside(x, y, quest.width, quest.height)) return { type: "wall", outOfBounds: true, x, y };
  return { ...quest.map[y][x], x, y };
};

function describeFrontCell(cell) {
  if (!cell || cell.type === "wall") return "前方は壁で塞がれている";
  if (cell.type === "enemy") return "前方に敵性反応がある";
  if (cell.type === "fuel") return "燃料補給反応を検知";
  if (cell.type === "treasure") return "金属質の素材反応がある";
  if (cell.type === "trap") return "床面に不自然な反応がある";
  if (cell.type === "stairs") return "次階層へ続く入口を発見";
  return "前方に通路が続いている";
}

function describeCurrentCell(cell) {
  if (cell.type === "stairs") return "足元に次階層への入口が開いている。";
  if (cell.type === "empty") return "コックピット表示は安定している。";
  return "現在区画に未処理反応がある。調査可能。";
}

function renderMiniMap() {
  const quest = window.GameState.quest;
  const cells = [];
  const directionMarkers = { N: "▲", E: "▶", S: "▼", W: "◀" };
  for (let y = 0; y < quest.height; y += 1) {
    for (let x = 0; x < quest.width; x += 1) {
      const key = cellKey(x, y);
      const isPlayer = quest.player.x === x && quest.player.y === y;
      const discovered = quest.discovered[key];
      const cell = quest.map[y][x];
      const fieldEnemy = getFieldEnemyById(cell.fieldEnemyId);
      const colorClass = fieldEnemy?.colorId ? `map-enemy-${fieldEnemy.colorId}` : "";
      const label = isPlayer ? directionMarkers[quest.player.direction] : discovered ? QUEST_EVENT_LABELS[cell.type] || "." : "?";
      const title = fieldEnemy ? `${fieldEnemy.name} / ${fieldEnemy.colorId} / ${fieldEnemy.behavior}` : "";
      cells.push(`<div class="quest-map-cell ${isPlayer ? "current" : ""} ${discovered ? `known ${cell.type}` : "unknown"} ${colorClass}" title="${title}">${label}</div>`);
    }
  }
  return `<div class="quest-map-grid" style="grid-template-columns:repeat(${quest.width},1fr)">${cells.join("")}</div>`;
}

function renderMiniMapModal() {
  const quest = window.GameState.quest;
  if (!quest?.miniMapOpen) return "";
  return `
    <div class="modal-backdrop mini-map-modal-backdrop">
      <section class="mini-map-modal panel panel-pad" role="dialog" aria-modal="true" aria-label="ミニマップ">
        <div class="section-head">
          <h2>ミニマップ</h2>
          <button class="button mini-map-close" data-action="close-mini-map" type="button">閉じる</button>
        </div>
        <div class="mini-map-modal-body">
          ${renderMiniMap()}
        </div>
      </section>
    </div>
  `;
}

function renderQuestMaterialsModal() {
  const quest = window.GameState.quest;
  if (!quest?.materialsOpen) return "";
  const entries = questMaterialEntries();
  const total = entries.reduce((sum, [, count]) => sum + Number(count || 0), 0);
  const unresolvedCount = entries.reduce((sum, [id, count]) => sum + (getMaterial(id) ? 0 : Number(count || 0)), 0);
  return `
    <div class="modal-backdrop quest-materials-modal-backdrop">
      <section class="quest-materials-modal panel panel-pad" role="dialog" aria-modal="true" aria-label="所持素材">
        <div class="section-head">
          <h2>所持素材</h2>
          <button class="button mini-map-close" data-action="close-quest-materials" type="button">閉じる</button>
        </div>
        <div class="muted" style="margin-bottom:8px">合計 ${formatNumber(total)} / 種類 ${entries.length}${unresolvedCount ? ` / 未解決 ${formatNumber(unresolvedCount)}` : ""}</div>
        <div class="quest-material-list">${renderQuestMaterialList(entries)}</div>
      </section>
    </div>
  `;
}

function questMaterialEntries() {
  return Object.entries(typeof window.exploreMaterialCounts === "function" ? window.exploreMaterialCounts() : window.GameState.runMaterials || {}).filter(([, count]) => count > 0);
}

function renderQuestMaterialList(entries = questMaterialEntries()) {
  if (!entries.length) return `<div class="muted">所持素材はありません。</div>`;
  return entries.map(([id, count]) => {
    const material = typeof window.displayMaterial === "function" ? window.displayMaterial(id) : getMaterial(id);
    if (!material) return `<div class="material-row"><div class="material-icon"></div><span style="flex:1">Unknown Material (${id})<br><span class="muted">RANK - / unresolved</span></span><strong>x${count}</strong></div>`;
    return `
      <div class="material-row">
        <div class="material-icon"></div>
        <span style="flex:1">${material.name}<br><span class="muted">RANK ${material.rank || material.rarity || "-"} / ${material.category}</span></span>
        <strong>x${count}</strong>
      </div>
    `;
  }).join("");
}

function resultMaterialName(id) {
  return (typeof window.displayMaterial === "function" ? window.displayMaterial(id) : null)?.name
    || (getMaterial(id) || window.getMechGenerationMaterial?.(id) || { name: id }).name;
}

function renderBattleResultExpRows(rows = []) {
  if (!rows.length) return `<div class="muted">EXP獲得なし</div>`;
  return rows.map((row) => {
    const leveled = Number(row.afterLevel || row.beforeLevel || 1) > Number(row.beforeLevel || 1);
    return `
      <div class="material-row">
        <span style="flex:1">${row.name || row.pilotId}<br><span class="muted">Lv ${row.beforeLevel || 1}${leveled ? ` -> ${row.afterLevel}` : ""}</span></span>
        <strong>+${formatNumber(row.exp || 0)} EXP</strong>
      </div>
    `;
  }).join("");
}

function renderBattleResultModal() {
  const result = window.GameState.lastBattleResult;
  if (!result) return "";
  const materialEntries = Object.entries(result.materials || {}).filter(([, count]) => Number(count || 0) > 0);
  const reserveRows = Array.isArray(result.reserveExpResults) ? result.reserveExpResults.filter((row) => Number(row.exp || 0) > 0) : [];
  return `
    <div class="modal-backdrop battle-result-modal-backdrop">
      <section class="quest-materials-modal battle-result-modal panel panel-pad" role="dialog" aria-modal="true" aria-label="バトルリザルト">
        <div class="section-head">
          <h2>バトルリザルト</h2>
          <button class="button mini-map-close" data-action="close-battle-result" type="button">閉じる</button>
        </div>
        <div class="battle-result-summary">
          <div class="stat-row"><span>撃破</span><strong>${result.enemyName || "Enemy"} Lv ${result.enemyLevel || 1}</strong></div>
          <div class="stat-row"><span>報酬</span><strong>食料 +${formatNumber(result.rewards?.food || 0)}</strong></div>
        </div>
        <div class="section-head battle-result-section"><h3>獲得EXP</h3></div>
        <div class="quest-material-list">${renderBattleResultExpRows(result.expResults || [])}</div>
        ${reserveRows.length ? `<div class="section-head battle-result-section"><h3>控えEXP</h3></div><div class="quest-material-list">${renderBattleResultExpRows(reserveRows)}</div>` : ""}
        <div class="section-head battle-result-section"><h3>獲得資材</h3></div>
        <div class="quest-material-list">
          ${materialEntries.length ? materialEntries.map(([id, count]) => `
            <div class="material-row">
              <div class="material-icon"></div>
              <span style="flex:1">${resultMaterialName(id)}</span>
              <strong>x${formatNumber(count)}</strong>
            </div>
          `).join("") : `<div class="muted">資材ドロップなし</div>`}
        </div>
      </section>
    </div>
  `;
}

window.closeBattleResultModal = function closeBattleResultModal() {
  window.GameState.lastBattleResult = null;
  window.renderCurrentScene();
};

function conditionSeverityLabel(severity) {
  return { minor: "軽症", moderate: "中等症", severe: "重症", none: "なし" }[severity] || severity || "-";
}

function rollExploreReturnInfections() {
  const state = window.GameState;
  const quest = state.quest;
  const ship = typeof window.ensureShipState === "function" ? window.ensureShipState() : state.ship || {};
  const planet = typeof window.getSelectedPlanet === "function" ? window.getSelectedPlanet() : null;
  const floor = Number(quest?.floor || 1);
  const difficulty = Number(planet?.difficulty || 1);
  const baseRate = Math.min(0.22, 0.035 + floor * 0.003 + difficulty * 0.012);
  const rate = Math.max(0.005, baseRate * (1 - Math.min(0.85, Number(ship.infectionRateReduction || 0))));
  const recoveryReduction = Math.min(0.6, Number(ship.diseaseRecoveryReduction || 0));
  const infections = [];
  const sortieUnits = typeof window.getSortieUnits === "function" ? window.getSortieUnits() : [];
  sortieUnits.forEach((mech) => {
    const pilot = typeof window.getPilot === "function" ? window.getPilot(mech.pilotId) : null;
    if (!pilot || pilot.lost) return;
    pilot.survival = pilot.survival && typeof pilot.survival === "object" ? pilot.survival : {};
    if (pilot.survival.condition && pilot.survival.condition !== "healthy") return;
    const fatigueBonus = Math.max(0, Number(pilot.survival.fatigue || 0) - 50) * 0.002;
    if (Math.random() >= rate + fatigueBonus) return;
    const severityRoll = Math.random();
    const severity = severityRoll < 0.12 ? "severe" : severityRoll < 0.38 ? "moderate" : "minor";
    const disease = typeof window.pickPilotDiseaseType === "function" ? window.pickPilotDiseaseType(difficulty) : null;
    const baseDays = disease?.baseDays?.[severity] || { minor: 2, moderate: 4, severe: 7 }[severity] || 2;
    const recoveryDays = Math.max(1, Math.ceil(baseDays * (1 - recoveryReduction)));
    pilot.survival.condition = "disease";
    pilot.survival.diseaseId = disease?.id || "disease";
    pilot.survival.diseaseName = disease?.name || "感染症";
    pilot.survival.severity = severity;
    pilot.survival.recoveryDays = recoveryDays;
    pilot.survival.inMedicalRoom = true;
    pilot.survival.forceSortie = false;
    infections.push({ pilotId: pilot.id, name: pilot.name || pilot.id, diseaseName: pilot.survival.diseaseName, severity, recoveryDays });
  });
  return infections;
}

function consumeSortieVitality(amount = 25) {
  const changes = [];
  const units = typeof window.getSortieUnits === "function" ? window.getSortieUnits() : [];
  units.forEach((mech) => {
    const pilot = getPilot(mech.pilotId);
    if (!pilot) return;
    if (typeof window.normalizePilotStatus === "function") window.normalizePilotStatus(pilot);
    const before = pilotVitality(pilot);
    const after = Math.max(0, before - amount);
    pilot.survival.vitality = after;
    changes.push({ pilotId: pilot.id, name: pilot.name || pilot.id, before, after });
  });
  return changes;
}

function buildExploreReturnResult({ materials, lostMaterials = {}, forced = false, message = "", consumeVitality = true }) {
  const state = window.GameState;
  const ship = typeof window.ensureShipState === "function" ? window.ensureShipState() : state.ship || {};
  const beforeDay = Math.max(1, Math.floor(Number(ship.driftDay || 1)));
  const infections = rollExploreReturnInfections();
  const vitalityChanges = consumeVitality ? consumeSortieVitality(25) : [];
  const dayResult = typeof window.advanceShipDriftDay === "function" ? window.advanceShipDriftDay() : null;
  const latestShip = typeof window.ensureShipState === "function" ? window.ensureShipState() : state.ship || ship;
  let afterDay = Math.floor(Number(latestShip.driftDay || beforeDay));
  if (afterDay <= beforeDay) {
    afterDay = beforeDay + 1;
    if (latestShip) latestShip.driftDay = afterDay;
  }
  state.lastExploreReturnResult = {
    forced,
    message,
    beforeDay,
    afterDay,
    materials: { ...(materials || {}) },
    lostMaterials: { ...(lostMaterials || {}) },
    infections,
    vitalityChanges,
    dayResult,
    createdAt: Date.now()
  };
}

function resetQuestAfterReturn() {
  const state = window.GameState;
  window.restoreAllMachineRuntimeStates();
  if (state.quest) {
    state.quest.floor = 1;
    state.quest.fuel = state.quest.maxFuel || 100;
    state.quest.map = [];
    state.quest.foundStairs = false;
    state.quest.discovered = {};
    state.quest.currentPlanetId = null;
    state.quest.planetId = null;
    state.quest.planetName = "";
  }
  state.fuel = 100;
  state.battle = null;
  state.currentScene = "quest";
}

function renderExploreReturnResultModal() {
  const result = window.GameState.lastExploreReturnResult;
  if (!result) return "";
  const materialEntries = Object.entries(result.materials || {}).filter(([, count]) => Number(count || 0) > 0);
  const lostEntries = Object.entries(result.lostMaterials || {}).filter(([, count]) => Number(count || 0) > 0);
  const survival = result.dayResult?.survival || {};
  const foodConsumed = Number(survival.foodConsumed ?? result.dayResult?.foodCost ?? 0);
  const medicineConsumed = Number(survival.medicineConsumed ?? 0);
  return `
    <div class="modal-backdrop explore-return-result-modal-backdrop">
      <section class="quest-materials-modal explore-return-result-modal panel panel-pad" role="dialog" aria-modal="true" aria-label="探索リザルト">
        <div class="section-head">
          <h2>探索リザルト</h2>
          <button class="button mini-map-close" data-action="close-explore-return-result" type="button">閉じる</button>
        </div>
        <div class="day-advance">
          <span>漂流 ${formatNumber(result.beforeDay)}日目</span>
          <strong>→</strong>
          <span>漂流 ${formatNumber(result.afterDay)}日目</span>
        </div>
        ${result.message ? `<div class="log-line ${result.forced ? "log-danger" : "log-good"}">${result.message}</div>` : ""}
        <div class="section-head battle-result-section"><h3>格納資材</h3></div>
        <div class="quest-material-list">
          ${materialEntries.length ? materialEntries.map(([id, count]) => `
            <div class="material-row">
              <div class="material-icon"></div>
              <span style="flex:1">${resultMaterialName(id)}</span>
              <strong>x${formatNumber(count)}</strong>
            </div>
          `).join("") : `<div class="muted">持ち帰った資材はありません</div>`}
        </div>
        ${lostEntries.length ? `
          <div class="section-head battle-result-section"><h3>失った資材</h3></div>
          <div class="quest-material-list">${lostEntries.map(([id, count]) => `
            <div class="material-row">
              <div class="material-icon"></div>
              <span style="flex:1">${resultMaterialName(id)}</span>
              <strong>x${formatNumber(count)}</strong>
            </div>
          `).join("")}</div>
        ` : ""}
        <div class="section-head battle-result-section"><h3>日次消費</h3></div>
        <div class="material-row"><span>食料</span><strong>-${formatNumber(foodConsumed)}</strong></div>
        <div class="material-row"><span>医療品</span><strong>-${formatNumber(medicineConsumed)}</strong></div>
        ${survival.foodShortage ? `<div class="material-row"><span>空腹</span><strong>${formatNumber(survival.foodShortage)}人</strong></div>` : ""}
        ${result.vitalityChanges?.length ? `
          <div class="section-head battle-result-section"><h3>体力消費</h3></div>
          <div class="quest-material-list">${result.vitalityChanges.map((entry) => `
            <div class="material-row">
              <span style="flex:1">${entry.name}</span>
              <strong>${formatNumber(entry.before)} -> ${formatNumber(entry.after)}</strong>
            </div>
          `).join("")}</div>
        ` : ""}
        <div class="section-head battle-result-section"><h3>健康状態</h3></div>
        <div class="quest-material-list">
          ${result.infections?.length ? result.infections.map((infection) => `
            <div class="material-row">
              <span style="flex:1">${infection.name}<br><span class="muted">感染症 / ${conditionSeverityLabel(infection.severity)}</span></span>
              <strong>${formatNumber(infection.recoveryDays)}日</strong>
            </div>
          `).join("") : `<div class="muted">新たな感染症は確認されませんでした</div>`}
        </div>
      </section>
    </div>
  `;
}

window.renderExploreReturnResultModal = renderExploreReturnResultModal;

window.closeExploreReturnResultModal = function closeExploreReturnResultModal() {
  window.GameState.lastExploreReturnResult = null;
  window.renderCurrentScene();
};

function renderPartyUnit(mech, index) {
  const pilot = displayPilot(mech.pilotId);
  const realPilot = getPilot(mech.pilotId);
  const portraitPilot = realPilot || window.GameState.pilots[index] || window.getDefaultPilotForPortrait();
  if (typeof window.normalizeMachineStatus === "function") window.normalizeMachineStatus(mech);
  const stats = realPilot && typeof window.calculateUnitStats === "function" ? window.calculateUnitStats(realPilot, mech) : (mech.stats || {});
  const maxHp = Math.max(1, Number(mech.maxHp || stats.hp || 1));
  const currentHp = Math.max(0, Math.min(maxHp, Number(mech.currentHp ?? mech.hp ?? maxHp)));
  const maxPp = Math.max(0, Number(mech.maxPp ?? stats.pp ?? 0));
  const currentPp = Math.max(0, Math.min(maxPp, Number(mech.currentPp ?? mech.pp ?? maxPp)));
  const overdrive = Math.max(0, Math.min(100, Number(mech.overdrive || 0)));
  const mechImage = typeof window.renderMechImage === "function"
    ? window.renderMechImage(mech, "quest")
    : `<div class="mech-thumb"></div>`;
  return `
    <div class="party-unit">
      <div class="pilot-overlay-anchor pilot-overlay-anchor--exploration">
        ${mechImage}
        ${window.renderPilotPortraitImage(portraitPilot, "pilot-portrait--exploration")}
      </div>
      <div class="party-unit-body">
        <strong>${mech.name}</strong>
        <span class="muted">${pilot.name}</span>
        <div>HP ${formatNumber(currentHp)} / ${formatNumber(maxHp)}</div>
        <div class="bar" style="--value:${Math.max(0, (currentHp / maxHp) * 100)}%"><span></span></div>
        <div class="muted">PP ${formatNumber(currentPp)} / ${formatNumber(maxPp)} / OD ${formatNumber(overdrive)}%</div>
      </div>
    </div>
  `;
}

function questLogHtml() {
  return window.GameState.quest.log.map((entry) => (
    `<div class="log-line ${entry.tone ? `log-${entry.tone}` : ""}"><span class="log-time">${entry.time}</span><span>${entry.message}</span></div>`
  )).join("");
}

function addQuestLog(message, tone = "") {
  const time = new Date().toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" });
  window.GameState.quest.log.unshift({ time, message, tone });
  window.GameState.quest.log = window.GameState.quest.log.slice(0, 24);
}

function cellKey(x, y) {
  return `${x},${y}`;
}

function discoverCell(x, y) {
  const quest = window.GameState.quest;
  if (isInside(x, y, quest.width, quest.height)) quest.discovered[cellKey(x, y)] = true;
}

function discoverAround(x, y) {
  discoverCell(x, y);
  Object.values(QUEST_DIRS).forEach((dir) => discoverCell(x + dir.dx, y + dir.dy));
}

window.consumeFuel = function consumeFuel(amount) {
  const quest = window.GameState.quest;
  quest.fuel = Math.max(0, +(quest.fuel - amount * window.getTerrainFuelRate(quest.terrain || "plain")).toFixed(1));
  window.GameState.fuel = quest.fuel;
  return window.checkFuelEmpty();
};

window.checkFuelEmpty = function checkFuelEmpty() {
  if (window.GameState.quest.fuel <= 0) {
    window.forceReturn("燃料が尽きた。強制帰還する。", true);
    return false;
  }
  return true;
};

function getFieldEnemyById(fieldEnemyId) {
  const enemies = window.GameState.quest?.fieldEnemies;
  return Array.isArray(enemies) ? enemies.find((enemy) => enemy.id === fieldEnemyId && !enemy.isDefeated) || null : null;
}

window.markFieldEnemyDefeated = function markFieldEnemyDefeated(fieldEnemyId) {
  const quest = window.GameState.quest;
  const fieldEnemy = getFieldEnemyById(fieldEnemyId);
  if (!quest || !fieldEnemy) return;
  fieldEnemy.isDefeated = true;
  if (quest.stairBossEnemy?.id === fieldEnemyId) {
    quest.bossAlive = false;
    quest.stairsLocked = false;
    quest.bossDefeated = true;
    quest.pendingFieldEnemy = null;
    if (quest.map?.[fieldEnemy.y]?.[fieldEnemy.x]) {
      quest.map[fieldEnemy.y][fieldEnemy.x] = createCell("stairs", { consumed: false });
    }
    quest.fieldEnemies = (quest.fieldEnemies || []).filter((enemy) => enemy.id !== fieldEnemyId);
    addQuestLog("ボスを撃破。階段が解放された。", "good");
    return;
  }
  if (quest.map?.[fieldEnemy.y]?.[fieldEnemy.x]?.fieldEnemyId === fieldEnemyId) {
    quest.map[fieldEnemy.y][fieldEnemy.x] = createCell("empty", { consumed: true });
  }
  quest.fieldEnemies = (quest.fieldEnemies || []).filter((enemy) => enemy.id !== fieldEnemyId);
};

function canFieldEnemyEnter(x, y, movingId = "") {
  const quest = window.GameState.quest;
  if (!isInside(x, y, quest.width, quest.height)) return false;
  const cell = quest.map[y][x];
  if (!cell || cell.type === "wall" || cell.type === "stairs") return false;
  if (cell.fieldEnemyId && cell.fieldEnemyId !== movingId) return false;
  return true;
}

function nextStepToward(from, to) {
  const dx = Math.sign(to.x - from.x);
  const dy = Math.sign(to.y - from.y);
  const options = Math.abs(to.x - from.x) >= Math.abs(to.y - from.y)
    ? [{ x: from.x + dx, y: from.y }, { x: from.x, y: from.y + dy }]
    : [{ x: from.x, y: from.y + dy }, { x: from.x + dx, y: from.y }];
  return options.find((pos) => canFieldEnemyEnter(pos.x, pos.y, from.id)) || null;
}

function nextStepAway(from, to) {
  const dx = Math.sign(from.x - to.x);
  const dy = Math.sign(from.y - to.y);
  const options = [{ x: from.x + dx, y: from.y }, { x: from.x, y: from.y + dy }];
  return options.find((pos) => canFieldEnemyEnter(pos.x, pos.y, from.id)) || null;
}

function randomFieldStep(enemy) {
  const dirs = Object.values(QUEST_DIRS).map((dir) => ({ x: enemy.x + dir.dx, y: enemy.y + dir.dy }));
  const candidates = dirs.filter((pos) => canFieldEnemyEnter(pos.x, pos.y, enemy.id));
  return candidates[Math.floor(Math.random() * candidates.length)] || null;
}

function moveFieldEnemy(enemy, nextPos) {
  const quest = window.GameState.quest;
  if (!enemy || !nextPos || (enemy.x === nextPos.x && enemy.y === nextPos.y)) return;
  if (quest.map?.[enemy.y]?.[enemy.x]?.fieldEnemyId === enemy.id) {
    quest.map[enemy.y][enemy.x] = createCell("empty");
  }
  enemy.x = nextPos.x;
  enemy.y = nextPos.y;
  quest.map[enemy.y][enemy.x] = createCell("enemy", {
    fieldEnemyId: enemy.id,
    colorId: enemy.colorId,
    behavior: enemy.behavior,
    enemyId: enemy.enemyId
  });
}

function startFieldEnemyBattle(fieldEnemy) {
  const quest = window.GameState.quest;
  quest.pendingFieldEnemy = fieldEnemy;
  addQuestLog(`${fieldEnemy.name || "敵"}が接触。自動戦闘を開始。`, "danger");
  if (typeof window.startBattle === "function" && window.startBattle({ fieldEnemy })) {
    window.GameState.currentScene = "battle";
    if (typeof window.runAutoBattle === "function") window.runAutoBattle();
  }
}

function updateFieldEnemiesAfterPlayerAction() {
  const state = window.GameState;
  const quest = state.quest;
  if (!quest || state.currentScene === "battle" || !Array.isArray(quest.fieldEnemies)) return;
  quest.enemyMoveTurn = Number(quest.enemyMoveTurn || 0) + 1;
  const player = quest.player;
  for (const enemy of [...quest.fieldEnemies]) {
    if (!enemy || enemy.isDefeated) continue;
    const behaviorConfig = getEnemyBehaviorConfig(enemy.behavior);
    const moveType = enemy.moveType || behaviorConfig.moveType || enemy.behavior;
    const detectionRange = Number(enemy.detectionRange || behaviorConfig.detectionRange || 2);
    const moveInterval = Math.max(1, Number(enemy.moveInterval || behaviorConfig.moveInterval || 1));
    if (quest.enemyMoveTurn - Number(enemy.lastMoveTurn || 0) < moveInterval) continue;
    const distance = Math.abs(enemy.x - player.x) + Math.abs(enemy.y - player.y);
    let nextPos = null;
    if (moveType === "chase" && distance <= detectionRange) nextPos = nextStepToward(enemy, player);
    else if (moveType === "flee" && distance <= detectionRange) nextPos = nextStepAway(enemy, player);
    else if (moveType === "random" && Math.random() < 0.75) nextPos = randomFieldStep(enemy);
    else if (moveType === "patrol" && Math.random() < 0.55) nextPos = randomFieldStep(enemy);
    else if (moveType === "ambush" && distance <= detectionRange) nextPos = nextStepToward(enemy, player);
    if (nextPos) moveFieldEnemy(enemy, nextPos);
    enemy.lastMoveTurn = quest.enemyMoveTurn;
    if (enemy.x === player.x && enemy.y === player.y) {
      startFieldEnemyBattle(enemy);
      return;
    }
  }
}

window.moveForward = function moveForward() {
  window.ensureQuestFloor();
  if (!window.consumeFuel(1)) return;
  const quest = window.GameState.quest;
  const front = window.getFrontCell();
  if (!front || front.type === "wall") {
    addQuestLog("前方は壁だ。進めない。", "warn");
    window.renderCurrentScene();
    return;
  }
  quest.player.x = front.x;
  quest.player.y = front.y;
  window.GameState.exploredSteps += 1;
  window.GameState.distance += 12 + Math.floor(Math.random() * 16);
  discoverAround(front.x, front.y);
  addQuestLog(`前進した。現在地 ${front.x}, ${front.y}`);
  processCurrentCell("enter");
  updateFieldEnemiesAfterPlayerAction();
  window.renderCurrentScene();
};

window.turnLeft = function turnLeft() {
  window.ensureQuestFloor();
  const quest = window.GameState.quest;
  quest.player.direction = QUEST_DIRS[quest.player.direction].left;
  discoverAround(quest.player.x, quest.player.y);
  addQuestLog(`左旋回。方角 ${QUEST_DIRS[quest.player.direction].label}`);
  updateFieldEnemiesAfterPlayerAction();
  window.renderCurrentScene();
};

window.turnRight = function turnRight() {
  window.ensureQuestFloor();
  const quest = window.GameState.quest;
  quest.player.direction = QUEST_DIRS[quest.player.direction].right;
  discoverAround(quest.player.x, quest.player.y);
  addQuestLog(`右旋回。方角 ${QUEST_DIRS[quest.player.direction].label}`);
  updateFieldEnemiesAfterPlayerAction();
  window.renderCurrentScene();
};

window.inspectCurrentCell = function inspectCurrentCell() {
  window.ensureQuestFloor();
  if (!window.consumeFuel(1)) return;
  processCurrentCell("inspect");
  updateFieldEnemiesAfterPlayerAction();
  window.renderCurrentScene();
};

function processCurrentCell(trigger) {
  const quest = window.GameState.quest;
  const cell = quest.map[quest.player.y][quest.player.x];
  discoverCell(quest.player.x, quest.player.y);
  if (recoverLostMaterialsAtCurrentCell()) return;
  if (cell.consumed && cell.type !== "stairs") {
    addQuestLog("調査済みの区画だ。");
    return;
  }
  if (cell.type === "empty") {
    addQuestLog(trigger === "inspect" ? "周囲を調べた。反応なし。" : "静かな通路だ。");
  } else if (cell.type === "enemy") {
    const fieldEnemy = getFieldEnemyById(cell.fieldEnemyId) || buildFieldEnemy({ x: quest.player.x, y: quest.player.y }, window.getSelectedPlanet(), quest.floor, "normal");
    quest.pendingFieldEnemy = fieldEnemy;
    addQuestLog(`${fieldEnemy?.name || "敵"}と接触。方針「${getCurrentBattleTactic().name || quest.battleTacticId}」で戦闘開始。`, "danger");
    cell.type = "empty";
    cell.consumed = true;
    if (typeof window.startBattle === "function") {
      if (window.startBattle({ fieldEnemy })) {
        window.GameState.currentScene = "battle";
        if (typeof window.runAutoBattle === "function") window.runAutoBattle();
      }
    }
  } else if (cell.type === "fuel") {
    const recovered = 30 + Math.floor(Math.random() * 21);
    quest.fuel = Math.min(quest.maxFuel, quest.fuel + recovered);
    window.GameState.fuel = quest.fuel;
    addQuestLog(`燃料補給スポット。燃料を${recovered}回復。`, "good");
    cell.type = "empty";
    cell.consumed = true;
  } else if (cell.type === "treasure") {
    openTreasure();
    cell.type = "empty";
    cell.consumed = true;
  } else if (cell.type === "trap") {
    window.triggerTrap();
    cell.type = "empty";
    cell.consumed = true;
  } else if (cell.type === "stairs") {
    if (quest.stairsLocked && quest.bossAlive && !quest.bossDefeated) {
      const fieldEnemy = getFieldEnemyById(cell.fieldEnemyId) || quest.stairBossEnemy;
      if (fieldEnemy) {
        quest.pendingFieldEnemy = fieldEnemy;
        addQuestLog(`${fieldEnemy.name || "ボス"}が階段を塞いでいる。`, "danger");
        window.AudioManager?.playSe("boss_detected");
        if (typeof window.startBattle === "function" && window.startBattle({ fieldEnemy })) {
          window.GameState.currentScene = "battle";
          if (typeof window.runAutoBattle === "function") window.runAutoBattle();
        }
        return;
      }
    }
    if (!quest.foundStairs) addQuestLog("次階層への入口を発見した。", "good");
    quest.foundStairs = true;
  }
}

function recoverLostMaterialsAtCurrentCell() {
  const state = window.GameState;
  const quest = state.quest;
  const death = state.deathLocation;
  if (!quest || !death || !death.lostItems) return false;
  const samePlace = death.planetId === (quest.currentPlanetId || quest.planetId)
    && Number(death.floor || 1) === Number(quest.floor || 1)
    && Number(death.x) === Number(quest.player.x)
    && Number(death.y) === Number(quest.player.y);
  if (!samePlace) return false;
  let recovered = 0;
  Object.entries(death.lostItems || {}).forEach(([id, count]) => {
    const added = typeof window.addExploreMaterial === "function" ? window.addExploreMaterial(id, count) : 0;
    recovered += Number(added || 0);
  });
  if (recovered > 0) {
    addQuestLog("失われた資材を発見した。", "good");
    state.deathLocation = null;
  } else {
    addQuestLog("失われた資材を発見したが、探索中インベントリが満杯です。", "warn");
  }
  return recovered > 0;
}

function openTreasure() {
  const state = window.GameState;
  if (Math.random() < 0.45) {
    const energy = 5 + Math.floor(Math.random() * 11);
    const ship = typeof window.ensureShipState === "function" ? window.ensureShipState() : state.ship;
    if (ship) ship.energy = Math.max(0, Number(ship.energy || 0) + energy);
    addQuestLog(`補助バッテリーを発見。エネルギー +${energy}。`, "good");
  } else {
    const material = pickMaterialByTerrain(state.quest.terrain, state.quest.planetId);
    if (typeof window.addExploreMaterial === "function" && !window.addExploreMaterial(material.id, 1)) {
      addQuestLog("探索中インベントリが満杯です。施設資材を持ち帰れません。", "warn");
      return;
    }
    addQuestLog(`保全コンテナから${material.name}を回収。`, "good");
  }
}

function pickMaterialByTerrain(terrain, planetId = null) {
  const planet = window.getPlanetById(planetId || window.GameState.quest?.planetId);
  const floor = window.GameState.quest?.floor || 1;
  const baseRows = Array.isArray(window.masterData?.materialBaseMaster) ? window.masterData.materialBaseMaster : [];
  if (baseRows.length && typeof window.buildGeneratedMaterial === "function") {
    const nonBoss = baseRows.filter((material) => material.sourceType !== "boss" && material.materialRole !== "boss_core" && material.materialRole !== "core");
    const planetKey = { planet_001: "gaea", planet_002: "sandria", planet_003: "abyss", planet_004: "ignis", planet_005: "eden" }[planet?.id || planet?.planetId] || "";
    const themed = nonBoss.filter((material) => !planetKey || String(material.materialBaseId || "").startsWith(`${planetKey}_`));
    const pool = themed.length ? themed : nonBoss;
    const base = pool[Math.floor(Math.random() * pool.length)];
    const colorId = typeof window.rollEnemyColor === "function" ? window.rollEnemyColor(planet?.id || planetId || "planet_001", floor) : "blue";
    const qualityId = typeof window.rollMaterialQuality === "function" ? window.rollMaterialQuality(floor) : "normal";
    const generated = window.buildGeneratedMaterial(base.materialBaseId, colorId, qualityId);
    if (generated) return generated;
  }
  const catalog = window.MaterialCatalog || [];
  if (!catalog.length) return { id: "broken_shell", name: "欠けた甲殻", rank: "E", value: 20, category: "shell", prompts: [] };
  const terrainCategories = window.getTerrainConfig(terrain).materialCategories;
  const planetPool = planet?.materialPool || [];
  const preferred = catalog.filter((material) => planetPool.includes(material.id) || terrainCategories.includes(material.category));
  if (preferred.length && Math.random() < 0.75) return preferred[Math.floor(Math.random() * preferred.length)];
  return catalog[Math.floor(Math.random() * catalog.length)];
}

window.triggerTrap = function triggerTrap() {
  const effects = ["fuel_plus", "fuel_minus", "money_plus", "money_minus", "material_gain", "enemy_log"];
  window.applyTrapEffect(effects[Math.floor(Math.random() * effects.length)]);
};

window.applyTrapEffect = function applyTrapEffect(effect) {
  const state = window.GameState;
  const quest = state.quest;
  if (effect === "fuel_plus") {
    quest.fuel = Math.min(quest.maxFuel, quest.fuel + 10);
    state.fuel = quest.fuel;
    addQuestLog("罠が逆作動し、燃料が10回復した。", "good");
  } else if (effect === "fuel_minus") {
    quest.fuel = Math.max(0, quest.fuel - 10);
    state.fuel = quest.fuel;
    addQuestLog("燃料管に衝撃。燃料 -10。", "danger");
    window.checkFuelEmpty();
  } else if (effect === "money_plus") {
    state.money += 100;
    addQuestLog("旧式キャッシュを発見。100G獲得。", "good");
  } else if (effect === "money_minus") {
    state.money = Math.max(0, state.money - 100);
    addQuestLog("電子罠で100Gを失った。", "danger");
  } else if (effect === "material_gain") {
    if (Math.random() < 0.5) {
      const energy = 3 + Math.floor(Math.random() * 8);
      const ship = typeof window.ensureShipState === "function" ? window.ensureShipState() : state.ship;
      if (ship) ship.energy = Math.max(0, Number(ship.energy || 0) + energy);
      addQuestLog(`罠の残留電力を回収。エネルギー +${energy}。`, "good");
    } else {
      const material = pickMaterialByTerrain(quest.terrain, quest.planetId);
      if (typeof window.addExploreMaterial === "function" && !window.addExploreMaterial(material.id, 1)) {
        addQuestLog("探索中インベントリが満杯です。施設資材を持ち帰れません。", "warn");
        return;
      }
      addQuestLog(`罠の残骸から${material.name}を回収。`, "good");
    }
  } else if (effect === "enemy_log") {
    addQuestLog("罠が敵性反応を呼び寄せた。周囲の気配が濃くなる。", "danger");
  }
};

window.goToNextFloor = function goToNextFloor() {
  window.ensureQuestFloor();
  const quest = window.GameState.quest;
  const planet = window.getSelectedPlanet();
  if (!quest.foundStairs) {
    addQuestLog("次階層への入口をまだ発見していない。", "warn");
    window.renderCurrentScene();
    return;
  }
  if (quest.floor >= planet.maxFloor) {
    addQuestLog(`${planet.name}の最深部に到達済みだ。`, "good");
    window.renderCurrentScene();
    return;
  }
  const nextFuel = quest.fuel;
  window.generateDungeonFloor(quest.floor + 1, planet.id);
  window.GameState.quest.fuel = nextFuel;
  window.GameState.fuel = nextFuel;
  addQuestLog("燃料を維持したまま次階層へ進入。", "warn");
  window.renderCurrentScene();
};

function getRuntimeUnitStatsForMachine(mech) {
  if (typeof window.normalizeMachineStatus === "function") window.normalizeMachineStatus(mech);
  const pilot = getPilot(mech?.pilotId);
  return pilot && typeof window.calculateUnitStats === "function" ? window.calculateUnitStats(pilot, mech) : (mech?.stats || {});
}

window.restoreMachineRuntimeState = function restoreMachineRuntimeState(mech) {
  if (!mech) return;
  const stats = getRuntimeUnitStatsForMachine(mech);
  const maxHp = Math.max(1, Math.floor(Number(stats.hp || mech.maxHp || mech.hp || 1)));
  const maxPp = Math.max(0, Math.floor(Number(stats.pp || mech.maxPp || mech.pp || 0)));
  mech.maxHp = maxHp;
  mech.hp = maxHp;
  mech.currentHp = maxHp;
  mech.maxPp = maxPp;
  mech.pp = maxPp;
  mech.currentPp = maxPp;
  mech.isDefeated = false;
  mech.statusAilments = [];
  mech.buffs = [];
  mech.overdrive = Math.max(0, Math.min(100, Number(mech.overdrive || 0)));
};

window.restoreAllMachineRuntimeStates = function restoreAllMachineRuntimeStates() {
  (window.GameState.mechs || []).forEach(window.restoreMachineRuntimeState);
};

function calculateDailyShipCosts(state) {
  const ship = typeof window.ensureShipState === "function" ? window.ensureShipState() : state.ship;
  const pilotCount = (state.pilots || []).length;
  const mechCount = (state.mechs || []).length;
  const foodCost = Math.max(0, Math.ceil(pilotCount * (1 - Number(ship?.foodCostReduction || 0))));
  const energyCost = Math.max(0, Math.ceil(mechCount * (1 - Number(ship?.energyCostReduction || 0))));
  return { ship, pilotCount, mechCount, foodCost, energyCost };
}

window.advanceShipDriftDay = function advanceShipDriftDay() {
  const state = window.GameState;
  const { ship, foodCost, energyCost } = calculateDailyShipCosts(state);
  if (!ship) return null;
  ship.driftDay = Math.max(1, Math.floor(Number(ship.driftDay || 1))) + 1;
  ship.food = Math.max(0, Math.floor(Number(ship.food || 0) - foodCost + Number(ship.foodProduction || 0)));
  ship.energy = Math.max(0, Math.floor(Number(ship.energy || 0) - energyCost + Number(ship.energyProduction || 0)));
  const message = `漂流${ship.driftDay}日目。生命維持コスト: 食料-${foodCost} / エネルギー-${energyCost}`;
  logMessage("bar", message, "warn");
  return { foodCost, energyCost, message };
};

window.returnBase = function returnBase() {
  const state = window.GameState;
  if (typeof window.syncBattleUnitsToMechs === "function") window.syncBattleUnitsToMechs();
  const exploreMaterials = typeof window.exploreMaterialCounts === "function" ? window.exploreMaterialCounts() : state.runMaterials || {};
  const returnedMaterials = { ...exploreMaterials };
  Object.entries(exploreMaterials).forEach(([id, count]) => {
    if (typeof window.addBaseMaterial === "function") window.addBaseMaterial(id, count);
    else state.materials[id] = (state.materials[id] || 0) + count;
  });
  state.runMaterials = {};
  if (state.exploreInventory) state.exploreInventory.materials = {};
  buildExploreReturnResult({
    materials: returnedMaterials,
    message: "探索から帰還し、資材を格納した。"
  });
  resetQuestAfterReturn();
  logMessage("bar", "探索から帰還し、素材を格納した。", "good");
  window.renderCurrentScene();
};

window.forceReturn = function forceReturn(message, loseMaterials) {
  const state = window.GameState;
  if (typeof window.syncBattleUnitsToMechs === "function") window.syncBattleUnitsToMechs();
  let lostItems = {};
  if (loseMaterials) {
    lostItems = { ...(typeof window.exploreMaterialCounts === "function" ? window.exploreMaterialCounts() : state.runMaterials || {}) };
    if (Object.keys(lostItems).length) {
      state.deathLocation = {
        planetId: state.quest?.currentPlanetId || state.quest?.planetId || null,
        floor: state.quest?.floor || 1,
        x: state.quest?.player?.x || 0,
        y: state.quest?.player?.y || 0,
        lostItems
      };
    }
    state.runMaterials = {};
    if (state.exploreInventory) state.exploreInventory.materials = {};
  }
  buildExploreReturnResult({
    materials: {},
    lostMaterials: lostItems,
    forced: true,
    message: `${message}${loseMaterials ? " 入手資材の一部を失った。" : ""}`
  });
  resetQuestAfterReturn();
  logMessage("bar", `${message}${loseMaterials ? " 入手素材の一部を失った。" : ""}`, "danger");
  window.renderCurrentScene();
};

window.questAction = function questAction(message, fuelCost) {
  if (message.includes("前進")) window.moveForward();
  else if (message.includes("左")) window.turnLeft();
  else if (message.includes("右")) window.turnRight();
  else window.inspectCurrentCell();
};

function latestQuestLogHtml() {
  const entry = window.GameState.quest?.log?.[0];
  if (!entry) return `<div class="log-line"><span class="log-time">--:--</span><span>ログはありません。</span></div>`;
  return `<div class="log-line ${entry.tone ? `log-${entry.tone}` : ""}"><span class="log-time">${entry.time}</span><span>${entry.message}</span></div>`;
}

function renderQuestLogModal() {
  const quest = window.GameState.quest;
  if (!quest?.logModalOpen) return "";
  return `
    <div class="modal-backdrop quest-log-modal-backdrop">
      <section class="quest-materials-modal panel panel-pad" role="dialog" aria-modal="true" aria-label="探索ログ">
        <div class="section-head">
          <h2>探索ログ</h2>
          <button class="button mini-map-close" data-action="close-quest-log" type="button">閉じる</button>
        </div>
        <div class="quest-log-history">${questLogHtml()}</div>
      </section>
    </div>
  `;
}

window.openQuestLogModal = function openQuestLogModal() {
  if (!window.GameState.quest) return;
  window.GameState.quest.logModalOpen = true;
  window.renderCurrentScene();
};

window.closeQuestLogModal = function closeQuestLogModal() {
  if (window.GameState.quest) window.GameState.quest.logModalOpen = false;
  window.renderCurrentScene();
};

function renderBattleTacticModal() {
  const quest = window.GameState.quest;
  if (!quest?.tacticModalOpen) return "";
  const tactics = getBattleTactics();
  return `
    <div class="modal-backdrop battle-tactic-modal-backdrop">
      <section class="quest-materials-modal panel panel-pad" role="dialog" aria-modal="true" aria-label="戦闘方針">
        <div class="section-head">
          <h2>戦闘方針</h2>
          <button class="button mini-map-close" data-action="close-battle-tactic-modal" type="button">閉じる</button>
        </div>
        <div class="quest-tactic-modal-list">
          ${tactics.map((tactic) => `<button class="button quest-tactic-button ${quest.battleTacticId === tactic.tacticId ? "active" : ""}" data-action="set-battle-tactic" data-tactic="${tactic.tacticId}" type="button">${tactic.name || tactic.tacticId}</button>`).join("")}
        </div>
      </section>
    </div>
  `;
}

window.openBattleTacticModal = function openBattleTacticModal() {
  if (!window.GameState.quest) return;
  window.GameState.quest.tacticModalOpen = true;
  window.renderCurrentScene();
};

window.closeBattleTacticModal = function closeBattleTacticModal() {
  if (window.GameState.quest) window.GameState.quest.tacticModalOpen = false;
  window.renderCurrentScene();
};

window.setBattleTactic = function setBattleTactic(tacticId) {
  const tactic = getBattleTactics().find((item) => item.tacticId === tacticId) || getBattleTactics()[0];
  if (!window.GameState.quest) return;
  window.GameState.quest.battleTacticId = tactic.tacticId;
  window.GameState.quest.tacticModalOpen = false;
  addQuestLog(`戦闘方針を「${tactic.name || tactic.tacticId}」に変更。`, "good");
  window.renderCurrentScene();
};

function renderQuestHeader(planet, quest) {
  const exploreTotal = typeof window.totalExploreMaterials === "function" ? window.totalExploreMaterials() : totalMaterials();
  return `
    <div class="top-bar quest-top-bar">
      <div class="title-block">
        <div class="quest-title-row">
          <span class="title-ja">${planet.name}</span>
          <span class="quest-floor-badge"><small>FLOOR</small><strong>${quest.floor}F / ${planet.maxFloor}F</strong></span>
        </div>
        <span class="title-en">EXPLORE</span>
      </div>
      <div class="resource-row quest-resource-row">
        <button class="resource quest-material-button" data-action="open-quest-materials" type="button"><small>探索素材</small><strong>${exploreTotal} / 100</strong></button>
      </div>
    </div>
  `;
}

function renderQuestReadout(terrain) {
  const front = getFrontCell();
  return `
    <section class="quest-readout panel panel-pad">
      <div class="quest-sensor-line">${describeFrontCell(front)}</div>
      <button class="quest-log-scroll quest-log-button" data-action="open-quest-log" type="button">${latestQuestLogHtml()}</button>
    </section>
  `;
}

function renderQuestCommands() {
  const quest = window.GameState.quest;
  return `
    <section class="quest-command-panel panel panel-pad">
      <div class="quest-special-row">
        <button class="button quest-utility-button" data-action="quest-next-floor" ${quest.foundStairs ? "" : "disabled"}>次の階層へ</button>
        <button class="button quest-utility-button" data-action="open-explore-items" type="button">アイテム</button>
        <button class="button quest-utility-button subdued danger" data-action="return-base">帰還</button>
      </div>
      <div class="quest-command-layout">
        ${renderFuelMeter(quest)}
        <div class="quest-command-main">
          <button class="button quest-command-button" data-action="quest-left"><span class="cmd-icon">&lt;</span>左旋回</button>
          <button class="button quest-command-button primary" data-action="quest-forward"><span class="cmd-icon">^</span>前進<br><span class="muted">燃料-1</span></button>
          <button class="button quest-command-button" data-action="quest-right"><span class="cmd-icon">&gt;</span>右旋回</button>
          <button class="button quest-command-button quest-search-button" data-action="quest-search"><span class="cmd-icon">*</span><span>調査<br><span class="muted">燃料-1</span></span></button>
        </div>
      </div>
    </section>
  `;
}

window.renderCockpitView = function renderCockpitView() {
  const backgroundSrc = getQuestBackgroundImage();
  const tactic = getCurrentBattleTactic();
  return `
    <section class="cockpit-view panel">
      ${backgroundSrc
        ? `<img class="cockpit-background-layer" src="${backgroundSrc}" alt="" aria-hidden="true">`
        : `<div class="cockpit-background-layer"></div>`}
      <img class="cockpit-frame-layer" src="ui/cockpit_frame.png" alt="" aria-hidden="true">
      ${renderMiniMapButton()}
      <button class="battle-tactic-chip panel" data-action="open-battle-tactic-modal" type="button">戦闘方針: ${tactic.name || tactic.tacticId}</button>
    </section>
  `;
};

window.moveForward = function moveForward() {
  window.ensureQuestFloor();
  const quest = window.GameState.quest;
  const front = window.getFrontCell();
  if (!front || front.type === "wall") {
    addQuestLog("前方は壁だ。進めない。", "warn");
    window.renderCurrentScene();
    return;
  }
  quest.player.x = front.x;
  quest.player.y = front.y;
  window.GameState.exploredSteps += 1;
  window.GameState.distance += 12 + Math.floor(Math.random() * 16);
  discoverAround(front.x, front.y);
  if (!window.consumeFuel(1)) return;
  addQuestLog(`前進した。現在地 ${front.x}, ${front.y}`);
  processCurrentCell("enter");
  updateFieldEnemiesAfterPlayerAction();
  window.savePlayerData();
  window.renderCurrentScene();
};

window.renderQuest = function renderQuest() {
  const state = window.GameState;
  if (!state.quest?.currentPlanetId && !state.quest?.planetId) {
    renderPlanetSelect();
    return;
  }
  window.ensureQuestFloor();
  const quest = state.quest;
  const planet = window.getSelectedPlanet();
  const terrain = window.getTerrainConfig(quest.terrain);
  window.App.root.innerHTML = `
    ${renderQuestHeader(planet, quest)}
    ${renderCockpitView()}
    ${renderQuestReadout(terrain)}
    ${renderQuestCommands()}
    <section class="explore-lower">
      <div class="panel panel-pad quest-party-panel">
        <div class="party-list quest-party-grid">${(typeof window.getSortieUnits === "function" ? window.getSortieUnits() : state.mechs.filter((mech) => getPilot(mech.pilotId)).slice(0, 4)).map(renderPartyUnit).join("")}</div>
      </div>
    </section>
    ${renderMiniMapModal()}
    ${renderQuestMaterialsModal()}
    ${renderQuestLogModal()}
    ${renderBattleTacticModal()}
    ${renderExploreItemModal()}
    ${renderBattleResultModal()}
    ${renderExploreReturnResultModal()}
  `;
};

window.App.scenes.quest = window.renderQuest;
