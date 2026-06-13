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

window.PlanetMaster = [
  { id: "planet_001", name: "ガイア", description: "森林平原と岩場が広がる標準探索惑星。初期探索に適している。", difficulty: 1, recommendedRank: "E", maxFloor: 20, availableTerrains: ["plain", "forest", "rocky"], enemyPool: ["shell", "wing"], materialPool: ["broken_shell", "thin_membrane", "brittle_bone", "aged_scale"], fuelModifier: 1.0, unlockCondition: null, promptThemes: ["organic armor", "natural frame"] },
  { id: "planet_002", name: "サンドリア", description: "砂漠と岩場に覆われた乾燥惑星。燃料消費と罠に注意。", difficulty: 2, recommendedRank: "D", maxFloor: 30, availableTerrains: ["desert", "rocky"], enemyPool: ["shell", "bone"], materialPool: ["broken_shell", "brittle_bone", "aged_scale"], fuelModifier: 1.12, unlockCondition: { maxReachedFloor: 5 }, promptThemes: ["desert armor", "sand worn frame"] },
  { id: "planet_003", name: "アビス", description: "水場と水中領域を含む高圧惑星。希少な生体素材が眠る。", difficulty: 3, recommendedRank: "C", maxFloor: 40, availableTerrains: ["waterside", "underwater"], enemyPool: ["nerve", "organ", "wing"], materialPool: ["thin_membrane", "dry_nerve", "wilted_bloodfilm"], fuelModifier: 1.25, unlockCondition: { maxReachedFloor: 10 }, promptThemes: ["deep sea armor", "bioluminescent", "tentacle frame"] },
  { id: "planet_004", name: "イグニス", description: "火山帯と岩盤層で構成される高熱惑星。高出力素材の反応が強い。", difficulty: 4, recommendedRank: "B", maxFloor: 45, availableTerrains: ["volcanic", "rocky"], enemyPool: ["shell", "organ"], materialPool: ["broken_shell", "aged_scale", "wilted_bloodfilm"], fuelModifier: 1.38, unlockCondition: { maxReachedFloor: 15 }, promptThemes: ["living reactor", "volcanic armor", "molten core"] },
  { id: "planet_005", name: "エデン", description: "遺跡市街地と古代施設が残る終盤惑星。宝物と危険イベントが多い。", difficulty: 5, recommendedRank: "A", maxFloor: 50, availableTerrains: ["ruins_city", "ancient_facility"], enemyPool: ["nerve", "organ", "shell"], materialPool: ["dry_nerve", "wilted_bloodfilm", "aged_scale"], fuelModifier: 1.5, unlockCondition: { maxReachedFloor: 20 }, promptThemes: ["ancient machine frame", "ruined city armor"] }
];

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
    promptThemes: planet.promptThemes
  };
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

function createCell(type) {
  return { type, consumed: false };
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
        <div class="party-list quest-party-grid">${state.mechs.map(renderPartyUnit).join("")}</div>
      </div>
    </section>
    ${renderMiniMapModal()}
    ${renderQuestMaterialsModal()}
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
  return `
    <section class="quest-readout panel panel-pad">
      <div class="quest-flavor">${terrain.text}</div>
      <div class="quest-sensor-line">${describeFrontCell(front)} <span class="muted">${describeCurrentCell(currentCell)}</span></div>
      <div class="quest-log-scroll">${questLogHtml()}</div>
    </section>
  `;
}

function renderQuestCommands() {
  const quest = window.GameState.quest;
  return `
    <section class="quest-command-panel panel panel-pad">
      <div class="quest-special-row">
        <button class="button quest-utility-button" data-action="quest-next-floor" ${quest.foundStairs ? "" : "disabled"}>↓ 下の階へ</button>
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
    </section>
  `;
}

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
      <button class="button planet-start-button" data-action="start-selected-planet-quest" ${unlocked ? "" : "disabled"}>探索開始</button>
    </section>
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

window.startSelectedPlanetQuest = function startSelectedPlanetQuest() {
  const state = window.GameState;
  const planet = window.getPlanetById(state.quest?.selectedPlanetId || state.selectedPlanetId);
  if (!planet || !window.isPlanetUnlocked(planet)) return;
  state.selectedPlanetId = planet.id;
  if (state.quest) {
    state.quest.selectedPlanetId = planet.id;
    state.quest.currentPlanetId = planet.id;
    state.quest.planetId = planet.id;
    state.quest.map = [];
    state.quest.floor = 1;
    state.quest.fuel = state.quest.maxFuel || 100;
  }
  window.generateDungeonFloor(1, planet.id);
  window.renderCurrentScene();
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
      const label = isPlayer ? directionMarkers[quest.player.direction] : discovered ? QUEST_EVENT_LABELS[cell.type] || "." : "?";
      cells.push(`<div class="quest-map-cell ${isPlayer ? "current" : ""} ${discovered ? `known ${cell.type}` : "unknown"}">${label}</div>`);
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
  return `
    <div class="modal-backdrop quest-materials-modal-backdrop">
      <section class="quest-materials-modal panel panel-pad" role="dialog" aria-modal="true" aria-label="所持素材">
        <div class="section-head">
          <h2>所持素材</h2>
          <button class="button mini-map-close" data-action="close-quest-materials" type="button">閉じる</button>
        </div>
        <div class="quest-material-list">${renderQuestMaterialList()}</div>
      </section>
    </div>
  `;
}

function renderQuestMaterialList() {
  const entries = Object.entries(allMaterialCounts()).filter(([, count]) => count > 0);
  if (!entries.length) return `<div class="muted">所持素材はありません。</div>`;
  return entries.map(([id, count]) => {
    const material = getMaterial(id);
    if (!material) return "";
    return `
      <div class="material-row">
        <div class="material-icon"></div>
        <span style="flex:1">${material.name}<br><span class="muted">RANK ${material.rank} / ${material.category}</span></span>
        <strong>x${count}</strong>
      </div>
    `;
  }).join("");
}

function renderPartyUnit(mech) {
  const pilot = displayPilot(mech.pilotId);
  return `
    <div class="party-unit">
      <div class="mech-thumb"></div>
      <div class="party-unit-body">
        <strong>${mech.name}</strong>
        <span class="muted">${pilot.name}</span>
        <div>HP ${formatNumber(mech.hp)}</div>
        <div class="bar" style="--value:${Math.max(0, (mech.hp / mech.maxHp) * 100)}%"><span></span></div>
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
  window.renderCurrentScene();
};

window.turnLeft = function turnLeft() {
  window.ensureQuestFloor();
  const quest = window.GameState.quest;
  quest.player.direction = QUEST_DIRS[quest.player.direction].left;
  discoverAround(quest.player.x, quest.player.y);
  addQuestLog(`左旋回。方角 ${QUEST_DIRS[quest.player.direction].label}`);
  window.renderCurrentScene();
};

window.turnRight = function turnRight() {
  window.ensureQuestFloor();
  const quest = window.GameState.quest;
  quest.player.direction = QUEST_DIRS[quest.player.direction].right;
  discoverAround(quest.player.x, quest.player.y);
  addQuestLog(`右旋回。方角 ${QUEST_DIRS[quest.player.direction].label}`);
  window.renderCurrentScene();
};

window.inspectCurrentCell = function inspectCurrentCell() {
  window.ensureQuestFloor();
  if (!window.consumeFuel(1)) return;
  processCurrentCell("inspect");
  window.renderCurrentScene();
};

function processCurrentCell(trigger) {
  const quest = window.GameState.quest;
  const cell = quest.map[quest.player.y][quest.player.x];
  discoverCell(quest.player.x, quest.player.y);
  if (cell.consumed && cell.type !== "stairs") {
    addQuestLog("調査済みの区画だ。");
    return;
  }
  if (cell.type === "empty") {
    addQuestLog(trigger === "inspect" ? "周囲を調べた。反応なし。" : "静かな通路だ。");
  } else if (cell.type === "enemy") {
    addQuestLog("敵と遭遇した。", "danger");
    cell.type = "empty";
    cell.consumed = true;
    if (typeof window.startBattle === "function") {
      window.startBattle();
      window.GameState.currentScene = "battle";
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
    if (!quest.foundStairs) addQuestLog("次階層への入口を発見した。", "good");
    quest.foundStairs = true;
  }
}

function openTreasure() {
  const state = window.GameState;
  if (Math.random() < 0.45) {
    const money = 80 + Math.floor(Math.random() * 161);
    state.money += money;
    addQuestLog(`宝箱から${money}Gを回収。`, "good");
  } else {
    const material = pickMaterialByTerrain(state.quest.terrain, state.quest.planetId);
    state.runMaterials[material.id] = (state.runMaterials[material.id] || 0) + 1;
    addQuestLog(`宝箱から${material.name}を入手。`, "good");
  }
}

function pickMaterialByTerrain(terrain, planetId = null) {
  const catalog = window.MaterialCatalog || [];
  if (!catalog.length) return { id: "broken_shell", name: "欠けた甲殻", rank: "E", value: 20, category: "shell", prompts: [] };
  const planet = window.getPlanetById(planetId || window.GameState.quest?.planetId);
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
    const material = pickMaterialByTerrain(quest.terrain, quest.planetId);
    state.runMaterials[material.id] = (state.runMaterials[material.id] || 0) + 1;
    addQuestLog(`罠の残骸から${material.name}を回収。`, "good");
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

window.returnBase = function returnBase() {
  const state = window.GameState;
  Object.entries(state.runMaterials).forEach(([id, count]) => {
    state.materials[id] = (state.materials[id] || 0) + count;
  });
  state.runMaterials = {};
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
  state.currentScene = "quest";
  logMessage("bar", "探索から帰還し、素材を格納した。", "good");
  window.renderCurrentScene();
};

window.forceReturn = function forceReturn(message, loseMaterials) {
  const state = window.GameState;
  if (loseMaterials) {
    Object.entries(state.runMaterials).forEach(([id, count]) => {
      const kept = Math.floor(count / 2);
      if (kept > 0) state.materials[id] = (state.materials[id] || 0) + kept;
    });
    state.runMaterials = {};
  }
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
  logMessage("bar", `${message}${loseMaterials ? " 入手素材の一部を失った。" : ""}`, "danger");
  window.renderCurrentScene();
};

window.questAction = function questAction(message, fuelCost) {
  if (message.includes("前進")) window.moveForward();
  else if (message.includes("左")) window.turnLeft();
  else if (message.includes("右")) window.turnRight();
  else window.inspectCurrentCell();
};

window.App.scenes.quest = window.renderQuest;
