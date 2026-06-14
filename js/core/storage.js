"use strict";

window.PLAYER_SAVE_KEY = "yggdrasil_player_save_v1";

function nowIsoString() {
  return new Date().toISOString();
}

function clonePlain(value) {
  return JSON.parse(JSON.stringify(value));
}

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
  state.exploration.temporaryMaterials = clonePlain(state.runMaterials || {});
  state.exploration.isExploring = Boolean(state.quest?.currentPlanetId || state.quest?.planetId) && (state.currentScene === "quest" || state.currentScene === "battle");
};

window.syncRuntimeStateFromPlayer = function syncRuntimeStateFromPlayer() {
  const state = window.GameState;
  if (state.player && Number.isFinite(Number(state.player.money))) {
    state.money = Number(state.player.money);
  }
  if (state.exploration) {
    state.fuel = Number(state.exploration.fuel ?? state.fuel ?? 100);
    state.runMaterials = clonePlain(state.exploration.temporaryMaterials || {});
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
  state.player.createdAt = state.player.createdAt || nowIsoString();
  state.player.updatedAt = nowIsoString();

  return {
    saveVersion: state.saveVersion || 1,
    player: clonePlain(state.player),
    pilots: clonePlain(state.pilots || []),
    mechs: clonePlain(state.mechs || []),
    selectedMechId: state.selectedMechId || null,
    selectedPlanetId: state.selectedPlanetId || state.quest?.planetId || null,
    nextMechSerial: state.nextMechSerial || 1,
    materials: clonePlain(state.materials || {}),
    market: clonePlain(state.market || { listings: [] }),
    exploration: clonePlain(state.exploration || {}),
    currentScene: state.currentScene || "bar"
  };
};

window.applyPlayerSavePayload = function applyPlayerSavePayload(payload) {
  if (!payload || Number(payload.saveVersion) !== 1) return false;
  const state = window.GameState;
  state.saveVersion = 1;
  state.player = { ...state.player, ...(payload.player || {}) };
  state.pilots = Array.isArray(payload.pilots) ? payload.pilots : state.pilots;
  state.mechs = Array.isArray(payload.mechs) ? payload.mechs : state.mechs;
  state.selectedMechId = payload.selectedMechId || state.selectedMechId;
  state.selectedPlanetId = payload.selectedPlanetId || state.selectedPlanetId || payload.exploration?.planetId || null;
  state.nextMechSerial = Number(payload.nextMechSerial || state.nextMechSerial || 1);
  state.materials = payload.materials && typeof payload.materials === "object" ? payload.materials : state.materials;
  state.market = payload.market && typeof payload.market === "object" ? payload.market : state.market;
  state.exploration = payload.exploration && typeof payload.exploration === "object" ? { ...state.exploration, ...payload.exploration } : state.exploration;
  state.currentScene = typeof payload.currentScene === "string" ? payload.currentScene : state.currentScene;
  if (typeof window.normalizeAllUnitStatuses === "function") window.normalizeAllUnitStatuses();
  syncRuntimeStateFromPlayer();
  return true;
};

window.loadPlayerData = function loadPlayerData() {
  const state = window.GameState;
  state.storage = { available: canUseLocalStorage(), loaded: false, lastError: "" };
  state.player.createdAt = state.player.createdAt || nowIsoString();
  state.player.updatedAt = state.player.updatedAt || state.player.createdAt;
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
