"use strict";

window.PLAYER_SAVE_KEY = "yggdrasil_player_save_v1";
window.PLAYER_SAVE_VERSION = 2;
window.MAX_OWNED_MECHS = 30;
window.MAX_PARTY_MECHS = 4;

function nowIsoString() {
  return new Date().toISOString();
}

function clonePlain(value) {
  return JSON.parse(JSON.stringify(value));
}

function ensureInventoryState() {
  const state = window.GameState;
  const inventory = state.inventory && typeof state.inventory === "object" ? state.inventory : {};
  state.inventory = {
    items: inventory.items && typeof inventory.items === "object" ? inventory.items : {},
    options: inventory.options && typeof inventory.options === "object" ? inventory.options : {},
    weapons: inventory.weapons && typeof inventory.weapons === "object" ? inventory.weapons : {},
    cores: inventory.cores && typeof inventory.cores === "object" ? inventory.cores : {}
  };
  return state.inventory;
}

window.ensureInventoryState = ensureInventoryState;

function cloneMaterialCounts(source = {}) {
  return Object.entries(source || {}).reduce((counts, [id, count]) => {
    const safeCount = Math.max(0, Math.floor(Number(count || 0)));
    if (id && safeCount > 0) counts[id] = safeCount;
    return counts;
  }, {});
}

function mergeMaterialCounts(...sources) {
  return sources.reduce((merged, source) => {
    Object.entries(source || {}).forEach(([id, count]) => {
      const safeCount = Math.max(0, Math.floor(Number(count || 0)));
      if (id && safeCount > 0) merged[id] = Math.max(Number(merged[id] || 0), safeCount);
    });
    return merged;
  }, {});
}

function ensureMaterialInventoryState() {
  const state = window.GameState;
  const baseInventory = state.baseInventory && typeof state.baseInventory === "object" ? state.baseInventory : {};
  const exploreInventory = state.exploreInventory && typeof state.exploreInventory === "object" ? state.exploreInventory : {};
  const baseMaterials = mergeMaterialCounts(state.materials || {}, baseInventory.materials || {});
  const exploreMaterials = mergeMaterialCounts(state.runMaterials || {}, state.exploration?.temporaryMaterials || {}, exploreInventory.materials || {});
  state.baseInventory = {
    ...baseInventory,
    materials: cloneMaterialCounts(baseMaterials),
    materialLimit: Math.max(1, Number(baseInventory.materialLimit || 9999))
  };
  state.exploreInventory = {
    ...exploreInventory,
    materials: cloneMaterialCounts(exploreMaterials),
    slotLimit: Math.max(1, Number(exploreInventory.slotLimit || 100))
  };
  state.materials = state.baseInventory.materials;
  state.runMaterials = state.exploreInventory.materials;
  if (!state.deathLocation || typeof state.deathLocation !== "object") state.deathLocation = null;
  if (typeof window.enforceBaseMaterialLimit === "function") window.enforceBaseMaterialLimit();
  return { baseInventory: state.baseInventory, exploreInventory: state.exploreInventory };
}

window.ensureMaterialInventoryState = ensureMaterialInventoryState;

function ensureShipState() {
  const state = window.GameState;
  const ship = state.ship && typeof state.ship === "object" ? state.ship : {};
  const facilities = ship.facilities && typeof ship.facilities === "object" ? ship.facilities : {};
  state.ship = {
    driftDay: Math.max(1, Math.floor(Number(ship.driftDay || 1))),
    food: Math.max(0, Math.floor(Number(ship.food ?? 100))),
    energy: Math.max(0, Math.floor(Number(ship.energy ?? 100))),
    foodProduction: Math.max(0, Number(ship.foodProduction || 0)),
    energyProduction: Math.max(0, Number(ship.energyProduction || 0)),
    foodCostReduction: Math.max(0, Number(ship.foodCostReduction || 0)),
    energyCostReduction: Math.max(0, Number(ship.energyCostReduction || 0)),
    facilities: {
      foodStorage: Math.max(0, Math.floor(Number(facilities.foodStorage || 0))),
      engine: Math.max(0, Math.floor(Number(facilities.engine || 0))),
      lifeSupport: Math.max(0, Math.floor(Number(facilities.lifeSupport || 0))),
      tacticalSupport: Math.max(0, Math.floor(Number(facilities.tacticalSupport || 0))),
      mechDevelopment: Math.max(0, Math.floor(Number(facilities.mechDevelopment || 0)))
    },
    einTrace: Math.max(0, Math.min(100, Number(ship.einTrace || 0))),
    specialists: Array.isArray(ship.specialists) ? ship.specialists : []
  };
  return state.ship;
}

window.ensureShipState = ensureShipState;

function ensureMechRosterState() {
  const state = window.GameState;
  if (!Array.isArray(state.mechs)) state.mechs = [];
  state.maxOwnedMechs = Number(state.maxOwnedMechs || window.MAX_OWNED_MECHS);
  state.maxPartyMechs = Number(state.maxPartyMechs || window.MAX_PARTY_MECHS);
  const ownedIds = new Set(state.mechs.map((mech) => mech?.id).filter(Boolean));
  const sourceIds = Array.isArray(state.partyMechIds) && state.partyMechIds.length
    ? state.partyMechIds
    : state.mechs.slice(0, state.maxPartyMechs).map((mech) => mech?.id);
  const usedIds = new Set();
  const normalizedPartyIds = Array.from({ length: state.maxPartyMechs }, (_, index) => {
    const id = sourceIds[index];
    if (!id || !ownedIds.has(id) || usedIds.has(id)) return null;
    usedIds.add(id);
    return id;
  });
  const fallbackPartyIds = state.mechs.slice(0, state.maxPartyMechs).map((mech) => mech?.id || null);
  state.partyMechIds = normalizedPartyIds.some(Boolean) || !state.mechs.length
    ? normalizedPartyIds
    : Array.from({ length: state.maxPartyMechs }, (_, index) => fallbackPartyIds[index] || null);
  if (state.selectedMechId && !ownedIds.has(state.selectedMechId)) state.selectedMechId = state.mechs[0]?.id || null;
  return state.partyMechIds;
}

window.ensureMechRosterState = ensureMechRosterState;

window.getOwnedMechLimit = function getOwnedMechLimit() {
  return Number(window.GameState.maxOwnedMechs || window.MAX_OWNED_MECHS);
};

window.getPartyMechLimit = function getPartyMechLimit() {
  return Number(window.GameState.maxPartyMechs || window.MAX_PARTY_MECHS);
};

function canUseLocalStorage() {
  try {
    const key = "__yggdrasil_storage_test__";
    window.localStorage.setItem(key, "1");
    window.localStorage.removeItem(key);
    return true;
  } catch (error) {
    return false;
  }
}

window.syncPlayerFromRuntimeState = function syncPlayerFromRuntimeState() {
  const state = window.GameState;
  ensureInventoryState();
  ensureMaterialInventoryState();
  ensureShipState();
  if (!state.player) return;
  state.player.money = state.money;
  state.player.currentFloor = state.quest?.floor || state.exploration?.currentFloor || state.player.currentFloor || 1;
  state.player.maxReachedFloor = Math.max(state.player.maxReachedFloor || 1, state.player.currentFloor || 1);

  if (!state.exploration) return;
  state.exploration.fuel = state.quest?.fuel ?? state.fuel ?? state.exploration.fuel;
  state.exploration.maxFuel = state.quest?.maxFuel ?? state.exploration.maxFuel ?? 100;
  state.exploration.currentFloor = state.quest?.floor ?? state.exploration.currentFloor ?? 1;
  state.exploration.planetId = state.quest?.currentPlanetId ?? state.quest?.planetId ?? state.exploration.planetId ?? null;
  state.exploration.selectedPlanetId = state.quest?.selectedPlanetId ?? state.selectedPlanetId ?? state.exploration.selectedPlanetId ?? null;
  state.exploration.temporaryMaterials = clonePlain(state.exploreInventory?.materials || state.runMaterials || {});
  state.exploration.isExploring = Boolean(state.quest?.currentPlanetId || state.quest?.planetId) && (state.currentScene === "quest" || state.currentScene === "battle");
};

window.syncRuntimeStateFromPlayer = function syncRuntimeStateFromPlayer() {
  const state = window.GameState;
  ensureMaterialInventoryState();
  ensureShipState();
  if (state.player && Number.isFinite(Number(state.player.money))) {
    state.money = Number(state.player.money);
  }
  if (state.exploration) {
    state.fuel = Number(state.exploration.fuel ?? state.fuel ?? 100);
    state.runMaterials = clonePlain(state.exploration.temporaryMaterials || state.exploreInventory?.materials || {});
    if (state.exploreInventory) state.exploreInventory.materials = state.runMaterials;
    if (state.quest) {
      state.quest.floor = Number(state.exploration.currentFloor || state.quest.floor || 1);
      state.quest.fuel = Number(state.exploration.fuel ?? state.quest.fuel ?? 100);
      state.quest.maxFuel = Number(state.exploration.maxFuel ?? state.quest.maxFuel ?? 100);
      state.quest.currentPlanetId = state.exploration.isExploring ? (state.exploration.planetId || state.quest.currentPlanetId || null) : null;
      state.quest.planetId = state.quest.currentPlanetId;
      state.quest.selectedPlanetId = state.exploration.selectedPlanetId || state.selectedPlanetId || state.quest.selectedPlanetId || state.quest.currentPlanetId || null;
      state.selectedPlanetId = state.quest.selectedPlanetId;
    }
  }
};

window.createPlayerSavePayload = function createPlayerSavePayload() {
  const state = window.GameState;
  if (typeof window.syncBattleUnitsToMechs === "function") window.syncBattleUnitsToMechs();
  if (typeof window.normalizeAllUnitStatuses === "function") window.normalizeAllUnitStatuses();
  syncPlayerFromRuntimeState();
  ensureMechRosterState();
  ensureMaterialInventoryState();
  ensureShipState();
  state.player.createdAt = state.player.createdAt || nowIsoString();
  state.player.updatedAt = nowIsoString();

  return {
    saveVersion: window.PLAYER_SAVE_VERSION,
    player: clonePlain(state.player),
    pilots: clonePlain(state.pilots || []),
    mechs: clonePlain(state.mechs || []),
    partyMechIds: clonePlain(state.partyMechIds || []),
    pendingGeneratedMech: state.pendingGeneratedMech ? clonePlain(state.pendingGeneratedMech) : null,
    selectedMechId: state.selectedMechId || null,
    selectedPlanetId: state.selectedPlanetId || state.quest?.planetId || null,
    nextMechSerial: state.nextMechSerial || 1,
    nextWeaponSerial: state.nextWeaponSerial || 1,
    materials: clonePlain(state.materials || {}),
    baseInventory: clonePlain(state.baseInventory || { materials: {} }),
    exploreInventory: clonePlain(state.exploreInventory || { materials: {} }),
    deathLocation: state.deathLocation ? clonePlain(state.deathLocation) : null,
    ship: clonePlain(state.ship || {}),
    inventory: clonePlain(ensureInventoryState()),
    market: clonePlain(state.market || { listings: [] }),
    exploration: clonePlain(state.exploration || {}),
    currentScene: state.currentScene || "bar"
  };
};

window.applyPlayerSavePayload = function applyPlayerSavePayload(payload) {
  if (!payload || Number(payload.saveVersion) !== window.PLAYER_SAVE_VERSION) return false;
  const state = window.GameState;
  state.saveVersion = window.PLAYER_SAVE_VERSION;
  state.player = { ...state.player, ...(payload.player || {}) };
  state.pilots = Array.isArray(payload.pilots) ? payload.pilots : state.pilots;
  state.mechs = Array.isArray(payload.mechs) ? payload.mechs : state.mechs;
  state.partyMechIds = Array.isArray(payload.partyMechIds) ? payload.partyMechIds : state.partyMechIds;
  state.pendingGeneratedMech = payload.pendingGeneratedMech && typeof payload.pendingGeneratedMech === "object" ? payload.pendingGeneratedMech : null;
  state.selectedMechId = payload.selectedMechId || state.selectedMechId;
  state.selectedPlanetId = payload.selectedPlanetId || state.selectedPlanetId || payload.exploration?.planetId || null;
  state.nextMechSerial = Number(payload.nextMechSerial || state.nextMechSerial || 1);
  state.nextWeaponSerial = Number(payload.nextWeaponSerial || state.nextWeaponSerial || 1);
  state.materials = payload.materials && typeof payload.materials === "object" ? payload.materials : state.materials;
  state.baseInventory = payload.baseInventory && typeof payload.baseInventory === "object" ? payload.baseInventory : { ...(state.baseInventory || {}), materials: state.materials };
  state.exploreInventory = payload.exploreInventory && typeof payload.exploreInventory === "object" ? payload.exploreInventory : { ...(state.exploreInventory || {}), materials: state.runMaterials || payload.exploration?.temporaryMaterials || {} };
  state.deathLocation = payload.deathLocation && typeof payload.deathLocation === "object" ? payload.deathLocation : null;
  state.ship = payload.ship && typeof payload.ship === "object" ? { ...(state.ship || {}), ...payload.ship } : state.ship;
  state.inventory = payload.inventory && typeof payload.inventory === "object" ? payload.inventory : state.inventory;
  ensureInventoryState();
  ensureMaterialInventoryState();
  ensureShipState();
  state.market = payload.market && typeof payload.market === "object" ? payload.market : state.market;
  state.exploration = payload.exploration && typeof payload.exploration === "object" ? { ...state.exploration, ...payload.exploration } : state.exploration;
  state.currentScene = typeof payload.currentScene === "string" ? payload.currentScene : state.currentScene;
  ensureMechRosterState();
  if (typeof window.normalizeAllUnitStatuses === "function") window.normalizeAllUnitStatuses();
  syncRuntimeStateFromPlayer();
  return true;
};

window.loadPlayerData = function loadPlayerData() {
  const state = window.GameState;
  state.storage = { available: canUseLocalStorage(), loaded: false, lastError: "" };
  state.player.createdAt = state.player.createdAt || nowIsoString();
  state.player.updatedAt = state.player.updatedAt || state.player.createdAt;
  ensureInventoryState();
  ensureMaterialInventoryState();
  ensureShipState();
  ensureMechRosterState();
  if (typeof window.normalizeAllUnitStatuses === "function") window.normalizeAllUnitStatuses();
  syncPlayerFromRuntimeState();

  if (!state.storage.available) return false;
  try {
    const raw = window.localStorage.getItem(window.PLAYER_SAVE_KEY);
    if (!raw) {
      savePlayerData();
      return false;
    }
    const loaded = applyPlayerSavePayload(JSON.parse(raw));
    if (!loaded) savePlayerData();
    state.storage.loaded = loaded;
    return loaded;
  } catch (error) {
    state.storage.lastError = error.message || String(error);
    return false;
  }
};

window.savePlayerData = function savePlayerData() {
  const state = window.GameState;
  if (!state.storage) state.storage = { available: canUseLocalStorage(), loaded: false, lastError: "" };
  if (!state.storage.available) return false;
  try {
    window.localStorage.setItem(window.PLAYER_SAVE_KEY, JSON.stringify(createPlayerSavePayload()));
    state.storage.lastError = "";
    return true;
  } catch (error) {
    state.storage.lastError = error.message || String(error);
    return false;
  }
};

window.deletePlayerSave = function deletePlayerSave() {
  if (!canUseLocalStorage()) return false;
  window.localStorage.removeItem(window.PLAYER_SAVE_KEY);
  return true;
};
