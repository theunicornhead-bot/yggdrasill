"use strict";

(function setupUrTestGrant() {
  const UR_TEST_CORE = {
    id: "core_apex_ur",
    name: "Apex Yggdrasil Core",
    rarity: "UR",
    category: "melee",
    outputLimit: 260,
    prompts: ["mythic bio-reactor heart", "ancient living core", "apex organic knight silhouette"]
  };

  const UR_TEST_MATERIALS = [
    {
      id: "apex_bone_core",
      name: "Apex Bone Core",
      rarity: "UR",
      rank: "UR",
      category: "frame",
      value: 5000,
      stats: { hp: 260, pp: 20, sAtk: 32, mAtk: 16, lAtk: 18, sDef: 42, mDef: 30, lDef: 34, speed: 6 },
      outputCost: 34,
      tags: ["apex", "bone", "ancient"],
      prompts: ["colossal ancient bone frame", "sacred rib cage armor", "overgrown skeletal structure"]
    },
    {
      id: "world_tree_reactor",
      name: "World Tree Reactor",
      rarity: "UR",
      rank: "UR",
      category: "reactor",
      value: 5000,
      stats: { hp: 140, pp: 38, sAtk: 24, mAtk: 34, lAtk: 24, sDef: 22, mDef: 38, lDef: 24, speed: 8 },
      outputCost: 32,
      tags: ["apex", "reactor", "world-tree"],
      prompts: ["world tree bio-reactor", "glowing green reactor organs", "root-like energy vessels"]
    },
    {
      id: "seraph_nerve_crown",
      name: "Seraph Nerve Crown",
      rarity: "UR",
      rank: "UR",
      category: "control",
      value: 5000,
      stats: { hp: 80, pp: 28, sAtk: 20, mAtk: 24, lAtk: 36, sDef: 16, mDef: 24, lDef: 26, speed: 34 },
      outputCost: 30,
      tags: ["apex", "nerve", "crown"],
      prompts: ["halo-like nerve crown", "golden bio-circuit halo", "angelic sensory organs"]
    }
  ];

  function upsertById(list, entry) {
    if (!Array.isArray(list) || !entry?.id) return;
    const index = list.findIndex((item) => item?.id === entry.id);
    if (index >= 0) {
      list[index] = { ...list[index], ...entry };
      return;
    }
    list.push(entry);
  }

  function registerUrTestCatalog() {
    upsertById(window.MechCoreCatalog, UR_TEST_CORE);
    UR_TEST_MATERIALS.forEach((material) => {
      upsertById(window.MechMaterialCatalog, material);
      upsertById(window.MaterialCatalog, {
        id: material.id,
        name: material.name,
        rank: material.rank,
        value: material.value,
        category: material.category,
        prompts: material.prompts
      });
    });
  }

  window.grantUrTestMaterials = function grantUrTestMaterials() {
    const state = window.GameState;
    if (!state) return;
    registerUrTestCatalog();

    if (!state.materials || typeof state.materials !== "object") state.materials = {};
    UR_TEST_MATERIALS.forEach((material) => {
      state.materials[material.id] = Math.max(Number(state.materials[material.id] || 0), 3);
    });

    const inventory = typeof window.ensureInventoryState === "function"
      ? window.ensureInventoryState()
      : (state.inventory ||= { items: {}, options: {}, weapons: {}, cores: {} });
    if (!inventory.cores || typeof inventory.cores !== "object") inventory.cores = {};
    inventory.cores[UR_TEST_CORE.id] = Math.max(Number(inventory.cores[UR_TEST_CORE.id] || 0), 1);
  };

  registerUrTestCatalog();

  const originalLoadPlayerData = window.loadPlayerData;
  if (typeof originalLoadPlayerData === "function") {
    window.loadPlayerData = function loadPlayerDataWithUrTestGrant() {
      const loaded = originalLoadPlayerData();
      window.grantUrTestMaterials();
      return loaded;
    };
  }

  const originalLoadMasters = window.loadMasters;
  if (typeof originalLoadMasters === "function") {
    window.loadMasters = async function loadMastersWithUrTestGrant() {
      const loaded = await originalLoadMasters();
      window.grantUrTestMaterials();
      return loaded;
    };
  }
})();
