"use strict";

function wrapLifelineRuntime() {
  if (window.__lifelineRuntimeWrapped) return;
  window.__lifelineRuntimeWrapped = true;

  const baseStartSelectedPlanetQuest = window.startSelectedPlanetQuest;
  if (typeof baseStartSelectedPlanetQuest === "function") {
    window.startSelectedPlanetQuest = function startSelectedPlanetQuestWithLifeline() {
      const state = window.GameState;
      const sortie = typeof window.applyLifelineSortieStart === "function" ? window.applyLifelineSortieStart() : null;
      const started = baseStartSelectedPlanetQuest();
      if (!started) return false;
      const ship = typeof window.ensureShipState === "function" ? window.ensureShipState() : state.ship || {};
      if (state.quest) {
        state.quest.shipFuelShortage = Number(ship.fuel || 0) <= 0;
        state.quest.activeSortieBuff = sortie?.buff || null;
      }
      if (typeof window.getSortieUnits === "function") {
        window.getSortieUnits().forEach((mech) => {
          const pilot = typeof window.getPilot === "function" ? window.getPilot(mech.pilotId) : null;
          if (!pilot) return;
          pilot.survival = pilot.survival && typeof pilot.survival === "object" ? pilot.survival : {};
          const fatigueReduction = sortie?.buff?.type === "fatigue" ? Number(sortie.buff.power || 0) : 0;
          pilot.survival.fatigue = Math.min(100, Math.max(0, Number(pilot.survival.fatigue || 0) + Math.round(18 * (1 - fatigueReduction))));
        });
      }
      if (sortie?.buff && typeof window.logMessage === "function") {
        window.logMessage("quest", `食事品質ボーナス: ${sortie.buff.type} +${Math.round(Number(sortie.buff.power || 0) * 100)}%`, "good");
      }
      if (state.quest?.shipFuelShortage && typeof window.logMessage === "function") {
        window.logMessage("quest", "船内燃料が不足したまま探索を開始します。", "warn");
      }
      return true;
    };
  }

  const baseConsumeFuel = window.consumeFuel;
  if (typeof baseConsumeFuel === "function") {
    window.consumeFuel = function consumeFuelWithLifeline(amount) {
      const quest = window.GameState.quest;
      const adjustedAmount = quest?.shipFuelShortage ? Number(amount || 0) * 1.25 : amount;
      return baseConsumeFuel(adjustedAmount);
    };
  }

  const baseAdvanceShipDriftDay = window.advanceShipDriftDay;
  if (typeof baseAdvanceShipDriftDay === "function") {
    window.advanceShipDriftDay = function advanceShipDriftDayWithLifeline() {
      const state = window.GameState;
      const ship = typeof window.ensureShipState === "function" ? window.ensureShipState() : state.ship;
      if (!ship || typeof window.applyDailySurvival !== "function") return baseAdvanceShipDriftDay();
      ship.driftDay = Math.max(1, Math.floor(Number(ship.driftDay || 1))) + 1;
      const survival = window.applyDailySurvival();
      const message = `漂流${ship.driftDay}日目。食糧-${survival.foodConsumed} / 医療品-${survival.medicineConsumed}${survival.foodShortage ? ` / 空腹 ${survival.foodShortage}人` : ""}`;
      if (typeof window.logMessage === "function") window.logMessage("bar", message, "warn");
      return { survival, message };
    };
  }

  const baseRenderQuest = window.renderQuest;
  if (typeof baseRenderQuest === "function") {
    window.renderQuest = function renderQuestWithLifeline() {
      if (typeof window.normalizeAllUnitStatuses === "function") window.normalizeAllUnitStatuses();
      return baseRenderQuest();
    };
    if (window.App?.scenes) window.App.scenes.quest = window.renderQuest;
  }
}

wrapLifelineRuntime();

