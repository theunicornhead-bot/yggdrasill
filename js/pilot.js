"use strict";

const PILOT_CLASS_IMAGE_MAP = {
  ace: {
    classId: "ace",
    className: "エース",
    role: "専用万能",
    maleImage: "character/character_1000.png",
    femaleImage: "character/character_1000.png",
    imageIndexMale: 1000,
    imageIndexFemale: 1000
  },
  striker: {
    classId: "striker",
    className: "ストライカー",
    role: "近接攻撃特化",
    maleImage: "character/character_0000.png",
    femaleImage: "character/character_0001.png",
    imageIndexMale: 0,
    imageIndexFemale: 1
  },
  gunner: {
    classId: "gunner",
    className: "ガンナー",
    role: "遠距離攻撃特化",
    maleImage: "character/character_0002.png",
    femaleImage: "character/character_0003.png",
    imageIndexMale: 2,
    imageIndexFemale: 3
  },
  engineer: {
    classId: "engineer",
    className: "エンジニア",
    role: "回復特化",
    maleImage: "character/character_0004.png",
    femaleImage: "character/character_0005.png",
    imageIndexMale: 4,
    imageIndexFemale: 5
  },
  defender: {
    classId: "defender",
    className: "ディフェンダー",
    role: "防御特化",
    maleImage: "character/character_0006.png",
    femaleImage: "character/character_0007.png",
    imageIndexMale: 6,
    imageIndexFemale: 7
  },
  wizard: {
    classId: "wizard",
    className: "ウィザード",
    role: "砲撃特化",
    maleImage: "character/character_0008.png",
    femaleImage: "character/character_0009.png",
    imageIndexMale: 8,
    imageIndexFemale: 9
  },
  commander: {
    classId: "commander",
    className: "コマンダー",
    role: "バフ特化",
    maleImage: "character/character_0010.png",
    femaleImage: "character/character_0011.png",
    imageIndexMale: 10,
    imageIndexFemale: 11
  },
  jammer: {
    classId: "jammer",
    className: "ジャマー",
    role: "デバフ特化",
    maleImage: "character/character_0012.png",
    femaleImage: "character/character_0013.png",
    imageIndexMale: 12,
    imageIndexFemale: 13
  },
  scout: {
    classId: "scout",
    className: "スカウト",
    role: "探索特化",
    maleImage: "character/character_0014.png",
    femaleImage: "character/character_0015.png",
    imageIndexMale: 14,
    imageIndexFemale: 15
  }
};

const PILOT_CLASS_IMAGE_ALIASES = {
  fighter: "striker",
  healer: "engineer",
  tank: "defender",
  dragner: "wizard",
  supporter: "commander",
  hunter: "jammer",
  seeker: "scout"
};

window.PILOT_CLASS_IMAGE_MAP = PILOT_CLASS_IMAGE_MAP;

window.getPilotClassImageDefinition = function getPilotClassImageDefinition(classId) {
  const normalizedClassId = PILOT_CLASS_IMAGE_ALIASES[classId] || classId;
  return PILOT_CLASS_IMAGE_MAP[normalizedClassId] || null;
};

window.getPilotClassDisplayName = function getPilotClassDisplayName(classId) {
  const normalizedClassId = PILOT_CLASS_IMAGE_ALIASES[classId] || classId;
  const master = typeof window.getPilotClassMaster === "function" ? window.getPilotClassMaster(normalizedClassId) : null;
  if (master?.displayName) return master.displayName;
  const imageSet = window.getPilotClassImageDefinition(classId);
  return imageSet?.className || classId || "";
};

window.getPilotClassRole = function getPilotClassRole(classId) {
  const normalizedClassId = PILOT_CLASS_IMAGE_ALIASES[classId] || classId;
  const master = typeof window.getPilotClassMaster === "function" ? window.getPilotClassMaster(normalizedClassId) : null;
  if (master?.role) return master.role;
  const imageSet = window.getPilotClassImageDefinition(classId);
  return imageSet?.role || "";
};

window.getPilotPortraitImage = function getPilotPortraitImage(classId, gender = "male") {
  const imageSet = window.getPilotClassImageDefinition(classId);
  if (!imageSet) return null;
  return gender === "female" ? imageSet.femaleImage : imageSet.maleImage;
};

window.renderPilotPortraitImage = function renderPilotPortraitImage(pilot, modifierClass = "") {
  if (!pilot) return "";
  const src = window.getPilotPortraitImage(pilot.classId, pilot.gender);
  if (!src) return "";
  const classes = ["pilot-portrait", modifierClass].filter(Boolean).join(" ");
  const alt = pilot.name ? `${pilot.name} portrait` : "";
  return `<img class="${classes}" src="${src}" alt="${alt}" loading="lazy" onerror="this.remove()">`;
};

window.getDefaultPilotForPortrait = function getDefaultPilotForPortrait() {
  const state = window.GameState;
  return state?.tavernCandidates?.[0] || state?.pilots?.[0] || { classId: "striker", gender: "male", name: "" };
};
