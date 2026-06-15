"use strict";

(function setupUrTestGrant() {
  const UR_TEST_CORE = {
    id: "core_apex_ur",
    name: "Apex Yggdrasil Core",
    rarity: "UR",
    category: "melee",
    mainColor: "black",
    outputLimit: 260,
    prompts: ["mythic bio-reactor heart", "ancient living core", "apex organic knight silhouette"]
  };

  const TEST_MATERIALS = [
    {
      id: "apex_bone_core",
      name: "Apex Bone Core",
      rarity: "UR",
      rank: "UR",
      slotType: "frame",
      accentColor: "white",
      visualTags: ["bone", "armor", "king"],
      category: "frame",
      value: 5000,
      stats: { hp: 260, pp: 20, sAtk: 32, mAtk: 16, lAtk: 18, sDef: 42, mDef: 30, lDef: 34, speed: 6 },
      outputCost: 34,
      tags: ["apex", "bone", "ancient", "frame"],
      prompts: ["colossal ancient bone frame", "sacred rib cage armor", "overgrown skeletal structure"]
    },
    {
      id: "apex_dragon_fang",
      name: "Apex Dragon Fang",
      rarity: "UR",
      rank: "UR",
      slotType: "weapon",
      accentColor: "red",
      visualTags: ["greatsword", "dragon", "bone"],
      category: "weapon",
      value: 5000,
      stats: { hp: 80, pp: 14, sAtk: 58, mAtk: 16, lAtk: 20, sDef: 18, mDef: 14, lDef: 16, speed: 4 },
      outputCost: 33,
      tags: ["apex", "weapon", "greatsword", "dragon", "red"],
      prompts: ["massive living dragon fang greatsword", "weapon held in both hands", "crimson red glowing blade edge"]
    },
    {
      id: "apex_seraph_wing",
      name: "Apex Seraph Wing",
      rarity: "UR",
      rank: "UR",
      slotType: "wing",
      accentColor: "gold",
      visualTags: ["wing", "halo", "angel"],
      category: "wing",
      value: 5000,
      stats: { hp: 90, pp: 30, sAtk: 12, mAtk: 28, lAtk: 24, sDef: 18, mDef: 30, lDef: 20, speed: 28 },
      outputCost: 31,
      tags: ["apex", "wing", "halo", "angel", "gold"],
      prompts: ["large sacred organic wings", "golden halo-like exterior frame", "angelic wing silhouette"]
    },
    {
      id: "world_tree_reactor",
      name: "World Tree Reactor",
      rarity: "UR",
      rank: "UR",
      slotType: "reactor",
      accentColor: "green",
      visualTags: ["nature", "plant"],
      category: "reactor",
      value: 5000,
      stats: { hp: 140, pp: 38, sAtk: 24, mAtk: 34, lAtk: 24, sDef: 22, mDef: 38, lDef: 24, speed: 8 },
      outputCost: 32,
      tags: ["apex", "reactor", "world-tree", "green"],
      prompts: ["world tree bio-reactor", "glowing green reactor organs", "root-like energy vessels"]
    },
    {
      id: "seraph_nerve_crown",
      name: "Seraph Nerve Crown",
      rarity: "UR",
      rank: "UR",
      slotType: "special",
      accentColor: "gold",
      visualTags: ["halo", "angel", "holy"],
      category: "control",
      value: 5000,
      stats: { hp: 80, pp: 28, sAtk: 20, mAtk: 24, lAtk: 36, sDef: 16, mDef: 24, lDef: 26, speed: 34 },
      outputCost: 30,
      tags: ["apex", "nerve", "crown", "gold"],
      prompts: ["halo-like nerve crown", "golden bio-circuit halo", "angelic sensory organs"]
    },
    {
      id: "black_king_carapace",
      name: "Black King Carapace",
      rarity: "SSR",
      rank: "SSR",
      slotType: "frame",
      accentColor: "black",
      visualTags: ["shell", "armor", "king"],
      category: "frame",
      value: 3200,
      stats: { hp: 210, pp: 12, sAtk: 18, mAtk: 12, lAtk: 14, sDef: 36, mDef: 24, lDef: 32, speed: 2 },
      outputCost: 27,
      tags: ["ssr", "frame", "shell", "black", "king"],
      prompts: ["glossy black king carapace", "heavy royal chitin armor", "black reinforced shell plating"]
    },
    {
      id: "giant_bone_hammer",
      name: "Giant Bone Hammer",
      rarity: "SSR",
      rank: "SSR",
      slotType: "weapon",
      accentColor: "white",
      visualTags: ["hammer", "bone"],
      category: "weapon",
      value: 3200,
      stats: { hp: 110, pp: 8, sAtk: 46, mAtk: 8, lAtk: 10, sDef: 24, mDef: 12, lDef: 16, speed: -2 },
      outputCost: 28,
      tags: ["ssr", "weapon", "hammer", "bone", "white"],
      prompts: ["massive giant bone hammer", "heavy organic striking weapon", "white bone hammer held in hand"]
    },
    {
      id: "demon_wing_membrane",
      name: "Demon Wing Membrane",
      rarity: "SSR",
      rank: "SSR",
      slotType: "wing",
      accentColor: "purple",
      visualTags: ["wing", "demon", "dark"],
      category: "wing",
      value: 3200,
      stats: { hp: 70, pp: 22, sAtk: 12, mAtk: 30, lAtk: 18, sDef: 12, mDef: 22, lDef: 14, speed: 24 },
      outputCost: 26,
      tags: ["ssr", "wing", "demon", "purple"],
      prompts: ["large purple demon wing membrane", "dark organic wings", "torn bat-like exterior silhouette"]
    },
    {
      id: "thunder_core_organ",
      name: "Thunder Core Organ",
      rarity: "SSR",
      rank: "SSR",
      slotType: "reactor",
      accentColor: "cyan",
      visualTags: ["lightning"],
      category: "reactor",
      value: 3200,
      stats: { hp: 95, pp: 32, sAtk: 18, mAtk: 26, lAtk: 34, sDef: 16, mDef: 24, lDef: 18, speed: 18 },
      outputCost: 27,
      tags: ["ssr", "reactor", "lightning", "cyan"],
      prompts: ["cyan thunder reactor organ", "electric arcs across bio-reactor", "lightning energy conduits"]
    },
    {
      id: "void_jamming_eye",
      name: "Void Jamming Eye",
      rarity: "SSR",
      rank: "SSR",
      slotType: "special",
      accentColor: "purple",
      visualTags: ["dark", "insect"],
      category: "control",
      value: 3200,
      stats: { hp: 60, pp: 34, sAtk: 10, mAtk: 34, lAtk: 28, sDef: 12, mDef: 28, lDef: 18, speed: 20 },
      outputCost: 25,
      tags: ["ssr", "special", "jammer", "void", "purple"],
      prompts: ["void jamming eye organ", "multiple signal interference sensors", "purple electronic warfare glow"]
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

  function registerTestCatalog() {
    upsertById(window.MechCoreCatalog, UR_TEST_CORE);
    TEST_MATERIALS.forEach((material) => {
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
    registerTestCatalog();

    if (!state.materials || typeof state.materials !== "object") state.materials = {};
    TEST_MATERIALS.forEach((material) => {
      state.materials[material.id] = Math.max(Number(state.materials[material.id] || 0), 3);
    });

    const inventory = typeof window.ensureInventoryState === "function"
      ? window.ensureInventoryState()
      : (state.inventory ||= { items: {}, options: {}, weapons: {}, cores: {} });
    if (!inventory.cores || typeof inventory.cores !== "object") inventory.cores = {};
    inventory.cores[UR_TEST_CORE.id] = Math.max(Number(inventory.cores[UR_TEST_CORE.id] || 0), 1);
  };

  registerTestCatalog();

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
