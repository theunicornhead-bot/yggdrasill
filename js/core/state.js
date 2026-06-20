"use strict";

window.MaterialCatalog = [
  { id: "broken_shell", name: "欠けた甲殻", rank: "E", value: 20, category: "shell", prompts: ["small shell", "rough armor", "damaged plating", "weak organic frame"] },
  { id: "thin_membrane", name: "薄い飛膜", rank: "D", value: 45, category: "wing", prompts: ["thin insect wing", "fragile membrane", "light organic part"] },
  { id: "dry_nerve", name: "乾いた神経束", rank: "C", value: 60, category: "nerve", prompts: ["thin organic cable", "dry nerve fiber", "minor bio circuit"] },
  { id: "brittle_bone", name: "脆い骨片", rank: "E", value: 30, category: "bone", prompts: ["small bone shard", "brittle frame", "pale organic plate"] },
  { id: "aged_scale", name: "劣化した外骨", rank: "C", value: 75, category: "shell", prompts: ["aged exoskeleton", "worn plating", "medium organic armor"] },
  { id: "wilted_bloodfilm", name: "朽ちた血管膜", rank: "D", value: 35, category: "organ", prompts: ["thin red membrane", "withered bio film", "minor vascular mesh"] }
,
  { id: "dragon_heart", name: "ドラゴンハート", rank: "UR", rarity: "UR", value: 5000, category: "bossWeaponMaterial", materialRole: "weapon_core", prompts: ["dragon heart", "weapon core"] },
  { id: "abyss_eye", name: "アビスアイ", rank: "UR", rarity: "UR", value: 5000, category: "bossWeaponMaterial", materialRole: "weapon_core", prompts: ["abyss eye", "weapon core"] },
  { id: "titan_bone", name: "タイタンボーン", rank: "UR", rarity: "UR", value: 5000, category: "bossWeaponMaterial", materialRole: "weapon_core", prompts: ["titan bone", "weapon core"] },
  { id: "ancient_core", name: "エンシェントコア", rank: "UR", rarity: "UR", value: 5000, category: "bossWeaponMaterial", materialRole: "weapon_core", prompts: ["ancient core", "weapon core"] }];

window.EnemyCatalog = [
  { name: "小型甲殻獣", level: 6, hp: 980, maxHp: 980, atk: 118, def: 48, type: "甲殻", species: "beast", race: "beast", enemyType: "beast", drops: ["broken_shell", "brittle_bone"] },
  { name: "飛膜蟲", level: 9, hp: 1260, maxHp: 1260, atk: 146, def: 58, type: "飛行型", species: "insect", race: "insect", enemyType: "insect", drops: ["thin_membrane", "broken_shell", "wilted_bloodfilm"] },
  { name: "神経喰らい", level: 12, hp: 1580, maxHp: 1580, atk: 172, def: 66, type: "神経型", species: "beast", race: "beast", enemyType: "beast", drops: ["dry_nerve", "wilted_bloodfilm", "aged_scale"] }
];

window.GameState = {
  saveVersion: 1,
  maxOwnedMechs: 30,
  maxPartyMechs: 4,
  player: {
    id: "local_player",
    name: "名無しの探索者",
    rank: "E",
    exp: 0,
    money: 12450,
    currentFloor: 1,
    maxReachedFloor: 1,
    createdAt: "",
    updatedAt: ""
  },
  money: 12450,
  pilots: [
    { id: "ray", name: "レイ・クロード", gender: "male", rank: "A", classId: "fighter", traitId: "large_specialist", traitRank: "A", talents: [{ talentId: "size_l_specialist", rank: 4 }], level: 1, exp: 0, skillPoints: 0, learnedSkills: ["fighter_001"], appearanceId: "fighter_male", hireCost: 1200, hired: true, hair: "#15181c", skin: "#9b725c" },
    { id: "sera", name: "セラ・ノクティス", gender: "female", rank: "B", classId: "gunner", traitId: "fuel_saver", traitRank: "B", talents: [{ talentId: "fuel_saver", rank: 3 }], level: 1, exp: 0, skillPoints: 0, learnedSkills: ["gunner_001"], appearanceId: "gunner_female", hireCost: 900, hired: true, hair: "#d7d9dd", skin: "#b99481" },
    { id: "glen", name: "グレン・バルド", gender: "male", rank: "B", classId: "supporter", traitId: "balanced", traitRank: "B", talents: [{ talentId: "tag_command_specialist", rank: 3 }], level: 1, exp: 0, skillPoints: 0, learnedSkills: ["supporter_001"], appearanceId: "supporter_male", hireCost: 800, hired: true, hair: "#8b4f2f", skin: "#a56e4e" }
  ],
  mechs: [
    {
      id: "raven",
      name: "レイヴン",
      rank: "SSR",
      level: 1,
      exp: 0,
      nextExp: 100,
      size: "中型",
      tags: ["general", "melee"],
      stats: { hp: 1280, pp: 40, sAtk: 412, mAtk: 300, lAtk: 330, sDef: 286, mDef: 246, lDef: 266, speed: 364 },
      mainWeapon: { id: "raven_main_weapon", name: "破砕ブレード", rank: "SSR", weaponType: "melee", element: "none", power: 55, ppCost: 0, overdrive: null },
      subWeapons: [],
      optionSlots: 2,
      equippedOptions: [],
      options: [],
      hp: 1280,
      maxHp: 1280,
      atk: 412,
      def: 286,
      mobility: 364,
      fuelCostRate: 1.0,
      traits: ["バランス型", "衝撃吸収フレーム"],
      pilotId: "ray",
      unique: false,
      parts: { rightArm: "破砕ブレード", leftArm: "衝撃クラッシャー", back: "標準スラスター", support: "クイックリペアユニット" },
      weaponType: "slash"
    },
    {
      id: "striker",
      name: "ストライカー",
      rank: "SR",
      level: 1,
      exp: 0,
      nextExp: 100,
      size: "大型",
      tags: ["general", "ranged", "defense"],
      stats: { hp: 1680, pp: 34, sAtk: 410, mAtk: 340, lAtk: 498, sDef: 352, mDef: 310, lDef: 352, speed: 228 },
      mainWeapon: { id: "striker_main_weapon", name: "重粒子砲", rank: "SR", weaponType: "ranged", element: "thunder", power: 72, ppCost: 8, overdrive: null },
      subWeapons: [],
      optionSlots: 2,
      equippedOptions: [],
      options: [],
      hp: 1680,
      maxHp: 1680,
      atk: 498,
      def: 352,
      mobility: 228,
      fuelCostRate: 0.8,
      traits: ["大型機特化", "重装甲"],
      pilotId: "sera",
      unique: true,
      parts: { rightArm: "重粒子砲", leftArm: "硬化シールド", back: "大型冷却炉", support: "弾道補正AI" },
      weaponType: "blunt"
    },
    {
      id: "valkyrie",
      name: "ヴァルキリー",
      rank: "SR",
      level: 1,
      exp: 0,
      nextExp: 100,
      size: "中型",
      tags: ["general", "ranged", "command"],
      stats: { hp: 1240, pp: 46, sAtk: 360, mAtk: 360, lAtk: 435, sDef: 270, mDef: 260, lDef: 290, speed: 392 },
      mainWeapon: { id: "valkyrie_main_weapon", name: "連装カノン", rank: "SR", weaponType: "ranged", element: "none", power: 64, ppCost: 5, overdrive: null },
      subWeapons: [],
      optionSlots: 2,
      equippedOptions: [],
      options: [],
      hp: 1240,
      maxHp: 1240,
      atk: 435,
      def: 290,
      mobility: 392,
      fuelCostRate: 1.1,
      traits: ["砲撃特化", "高出力炉"],
      pilotId: "glen",
      unique: false,
      parts: { rightArm: "連装カノン", leftArm: "針状ランス", back: "可変翼", support: "照準リンク" },
      weaponType: "pierce"
    },
    {
      id: "seeker",
      name: "シーカー",
      rank: "R",
      level: 1,
      exp: 0,
      nextExp: 100,
      size: "小型",
      tags: ["general", "scout", "ranged"],
      stats: { hp: 980, pp: 52, sAtk: 270, mAtk: 290, lAtk: 302, sDef: 190, mDef: 210, lDef: 210, speed: 512 },
      mainWeapon: { id: "seeker_main_weapon", name: "軽量ライフル", rank: "R", weaponType: "ranged", element: "none", power: 42, ppCost: 2, overdrive: null },
      subWeapons: [],
      optionSlots: 1,
      equippedOptions: [],
      options: [],
      hp: 980,
      maxHp: 980,
      atk: 302,
      def: 210,
      mobility: 512,
      fuelCostRate: 1.3,
      traits: ["小型機特化", "偵察強化"],
      pilotId: null,
      unique: false,
      parts: { rightArm: "軽量ライフル", leftArm: "捕獲ワイヤー", back: "静音ブースター", support: "地形スキャナ" },
      weaponType: "capture"
    }
  ],
  partyMechIds: ["raven", "striker", "valkyrie", "seeker"],
  pendingGeneratedMech: null,
  materials: { broken_shell: 12, thin_membrane: 8, dry_nerve: 6, brittle_bone: 10 },
  baseInventory: {
    materials: { broken_shell: 12, thin_membrane: 8, dry_nerve: 6, brittle_bone: 10 },
    materialLimit: 9999
  },
  exploreInventory: {
    materials: {},
    slotLimit: 100
  },
  deathLocation: null,
  inventory: {
    items: { repair_kit_s: 2, ether_pack_s: 1 },
    options: {},
    weapons: {},
    cores: { core_r: 1, core_sr: 1 }
  },
  market: {
    listings: []
  },
  exploration: {
    fuel: 100,
    maxFuel: 100,
    currentFloor: 1,
    temporaryMaterials: {},
    isExploring: false
  },
  ship: {
    driftDay: 1,
    food: 100,
    energy: 100,
    foodProduction: 0,
    energyProduction: 0,
    foodCostReduction: 0,
    energyCostReduction: 0,
    facilities: {
      foodStorage: 0,
      engine: 0,
      lifeSupport: 0,
      tacticalSupport: 0,
      mechDevelopment: 0
    },
    einTrace: 0,
    specialists: []
  },
  runMaterials: {},
  currentScene: "bar",
  tavernCandidates: [],
  masters: { classes: [], traits: [], talents: [], skills: [], pilotNames: [], mechs: [], mechTraits: [], overdrives: [] },
  fuel: 100,
  floor: 3,
  maxFloor: 20,
  selectedPlanetId: null,
  quest: {
    selectedPlanetId: null,
    currentPlanetId: null,
    planetId: null,
    planetName: "",
    floor: 1,
    size: "XS",
    terrain: "plain",
    width: 4,
    height: 4,
    map: [],
    player: { x: 0, y: 0, direction: "N" },
    fuel: 100,
    maxFuel: 100,
    discovered: {},
    foundStairs: false,
    log: [],
    battleTacticId: "standard",
    pendingFieldEnemy: null,
    fieldEnemies: [],
    nextFieldEnemySerial: 1
  },
  exploredSteps: 0,
  distance: 142,
  selectedMechId: "raven",
  nextMechSerial: 1,
  nextWeaponSerial: 1,
  selectedMaterialId: "broken_shell",
  synthesisSlots: [],
  synthSerial: 1,
  battle: null,
  logs: {
    bar: ["艦長: ブリッジへようこそ。ユグドラシルは現在、漂流状態です。"],
    quest: ["3Fに到達した……"],
    battle: [],
    synthesis: ["培養炉を起動。素材スロットは最大5枠。"]
  }
};

window.RankConfig = {
  ranks: ["E", "D", "C", "B", "A", "S"],
  hireCosts: { E: 300, D: 600, C: 1200, B: 2500, A: 5000, S: 10000 },
  rankWeights: [
    { rank: "E", weight: 30 },
    { rank: "D", weight: 25 },
    { rank: "C", weight: 20 },
    { rank: "B", weight: 15 },
    { rank: "A", weight: 8 },
    { rank: "S", weight: 2 }
  ]
};


