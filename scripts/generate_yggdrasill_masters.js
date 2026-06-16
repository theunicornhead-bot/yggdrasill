"use strict";

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const dataDir = path.join(root, "data");

function csvEscape(value) {
  const text = value === null || value === undefined ? "" : String(value);
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function writeCsv(fileName, headers, rows) {
  const body = [
    headers.join(","),
    ...rows.map((row) => headers.map((header) => csvEscape(row[header])).join(","))
  ].join("\n") + "\n";
  fs.writeFileSync(path.join(dataDir, fileName), body, "utf8");
}

const planets = [
  {
    planetId: "planet_001",
    key: "gaea",
    name: "ガイア",
    description: "森林平原と岩場が広がる生命惑星。初期探索に適している。",
    difficulty: 1,
    recommendedRank: "E",
    maxFloor: 50,
    availableTerrains: "plain|forest|rocky",
    fuelModifier: "1.00",
    unlockMaxReachedFloor: "",
    promptThemes: "organic armor|natural frame|vast grassland|gigantic trees",
    openBackground: "ui/gaea_001.png",
    blockedBackground: "ui/gaea_002.png",
    lowFloorEnemyScale: "0.80",
    finalFloorEnemyScale: "1.00",
    weakWeapon: "melee",
    weakAttributes: ["fire", "acid"],
    resistAttribute: "poison",
    colorBands: [
      "green:45|blue:20|yellow:15|red:10|pink:5|white:3|black:1|gold:1",
      "green:35|yellow:25|blue:15|red:10|pink:7|white:5|black:2|gold:1",
      "green:30|red:20|yellow:18|blue:12|pink:8|white:6|black:4|gold:2",
      "green:25|white:18|red:18|black:12|yellow:10|blue:8|pink:6|gold:3",
      "gold:8|black:18|white:18|green:18|red:14|yellow:10|blue:8|pink:6"
    ],
    enemies: [
      ["gaea_morizume_wolf", "モリヅメウルフ", 1, "attacker", "beast", "M", "melee", "poison", "緑の甲殻をまとった狼型", ["爪", "牙", "外皮", "神経"]],
      ["gaea_kokegara_beetle", "コケガラビートル", 1, "tank", "insect", "S", "melee", "acid", "苔むした甲殻虫", ["甲殻", "脚殻", "触角", "腺核"]],
      ["gaea_hanemaku_dori", "ハネマクドリ", 1, "speed", "wing", "S", "ranged", "sonic", "薄い翼膜を持つ鳥型", ["翼膜", "くちばし", "羽骨", "感覚眼"]],
      ["gaea_nezuru_snake", "ネヅルスネーク", 11, "debuffer", "serpent", "M", "magic", "poison", "根のような胴体の蛇型", ["触手", "外皮", "毒腺", "神経束"]],
      ["gaea_tsunogoke_boar", "ツノゴケボア", 21, "attacker", "beast", "M", "melee", "acid", "角と苔甲殻を持つ猪型", ["角", "甲殻", "牙", "筋繊維"]],
      ["gaea_kamakiri_gara", "カマキリガラ", 31, "speed", "insect", "M", "melee", "sonic", "鎌状の前脚を持つ虫型", ["鎌爪", "甲殻", "複眼", "関節殻"]],
      ["gaea_oojukara", "オオジュカラ", 41, "tank", "beast", "L", "melee", "poison", "樹木と甲殻が融合した大型獣", ["樹皮甲殻", "太牙", "古い神経", "生命核"]]
    ],
    bosses: [
      ["gaea_tsutagara_nushi", "ツタガラヌシ", 10, "ツタガラ森核"],
      ["gaea_ootsunomorigami", "オオツノモリガミ", 20, "大角森獣核"],
      ["gaea_jukai_no_haha", "ジュカイノハハ", 30, "樹海女王核"],
      ["gaea_kodaikiba_ookami", "コダイキバオオカミ", 40, "古狼生命核"],
      ["gaea_ou_gara", "ガイアオウガラ", 50, "ガイア王核"]
    ]
  },
  {
    planetId: "planet_002",
    key: "sandria",
    name: "サンドリア",
    description: "砂漠と岩場に覆われた乾燥惑星。砂棲生物と硬質素材が多い。",
    difficulty: 2,
    recommendedRank: "D",
    maxFloor: 50,
    availableTerrains: "desert|rocky",
    fuelModifier: "1.12",
    unlockMaxReachedFloor: 10,
    promptThemes: "desert armor|sand worn frame|dry shell|bone desert",
    openBackground: "",
    blockedBackground: "",
    lowFloorEnemyScale: "0.88",
    finalFloorEnemyScale: "1.00",
    weakWeapon: "ranged",
    weakAttributes: ["acid", "gravity"],
    resistAttribute: "fire",
    colorBands: [
      "yellow:45|red:20|white:15|green:8|blue:5|pink:4|black:2|gold:1",
      "yellow:35|white:22|red:18|green:8|pink:7|blue:5|black:4|gold:1",
      "red:28|yellow:24|white:18|black:10|green:8|pink:6|blue:4|gold:2",
      "white:24|black:18|red:18|yellow:16|pink:8|green:6|blue:5|gold:5",
      "gold:8|black:20|white:20|red:18|yellow:16|pink:8|green:5|blue:5"
    ],
    enemies: [
      ["sandria_sunakiba_worm", "スナキバワーム", 1, "attacker", "worm", "M", "melee", "gravity", "牙だらけの砂虫", ["牙", "砂皮", "体節殻", "胃袋"]],
      ["sandria_dokubari_sasori", "ドクバリサソリ", 1, "debuffer", "insect", "S", "melee", "poison", "毒針尾を持つ蠍型", ["毒針", "尾殻", "毒腺", "甲殻"]],
      ["sandria_honegara_lizard", "ホネガラリザード", 1, "tank", "lizard", "M", "melee", "fire", "骨板を背負う蜥蜴型", ["骨板", "牙", "乾燥外皮", "爪"]],
      ["sandria_sabikamakiri", "サビカマキリ", 11, "speed", "insect", "M", "melee", "acid", "錆色の鎌脚を持つ虫型", ["鎌脚", "複眼", "硬甲殻", "節足"]],
      ["sandria_sunatsuno_crab", "スナツノクラブ", 21, "tank", "crab", "M", "melee", "gravity", "角のある砂蟹型", ["角殻", "鋏", "甲殻", "砂腺"]],
      ["sandria_dry_viper", "ドライバイパー", 31, "debuffer", "serpent", "M", "magic", "poison", "乾燥した毒蛇型", ["毒牙", "乾皮", "神経束", "毒嚢"]],
      ["sandria_ganseki_balga", "ガンセキバルガ", 41, "tank", "beast", "L", "melee", "gravity", "岩のような大型甲殻獣", ["岩殻", "重骨", "大牙", "筋繊維"]]
    ],
    bosses: [
      ["sandria_sunagara_golem", "スナガラゴーレム", 10, "砂殻重核"],
      ["sandria_dokubari_ou", "ドクバリオウ", 20, "蠍王毒核"],
      ["sandria_honezuka_king", "ホネヅカキング", 30, "骨塚王核"],
      ["sandria_sajin_hydra", "サジンヒュドラ", 40, "砂塵再生核"],
      ["sandria_ou_gara", "サンドリアオウガラ", 50, "サンドリア王核"]
    ]
  },
  {
    planetId: "planet_003",
    key: "abyss",
    name: "アビス",
    description: "水場と水中領域を含む高圧惑星。深海由来の神経素材が眠る。",
    difficulty: 3,
    recommendedRank: "C",
    maxFloor: 50,
    availableTerrains: "waterside|underwater",
    fuelModifier: "1.25",
    unlockMaxReachedFloor: 20,
    promptThemes: "deep sea armor|bioluminescent|tentacle frame|abyssal shell",
    openBackground: "",
    blockedBackground: "",
    lowFloorEnemyScale: "0.94",
    finalFloorEnemyScale: "1.00",
    weakWeapon: "magic",
    weakAttributes: ["thunder", "nerve"],
    resistAttribute: "cooling",
    colorBands: [
      "blue:45|black:20|white:15|green:8|yellow:5|pink:4|red:2|gold:1",
      "blue:34|white:22|black:18|pink:9|green:7|yellow:5|red:3|gold:2",
      "black:28|blue:24|white:18|pink:10|green:7|yellow:5|red:4|gold:4",
      "white:24|black:22|blue:18|pink:12|gold:6|green:6|yellow:6|red:6",
      "gold:8|black:24|white:22|blue:18|pink:10|green:6|yellow:6|red:6"
    ],
    enemies: [
      ["abyss_fukame_fish", "フカメフィッシュ", 1, "balanced", "fish", "S", "ranged", "nerve", "大きな感覚眼を持つ魚型", ["感覚眼", "鱗", "水膜", "神経"]],
      ["abyss_noukurage", "ノウクラゲ", 1, "caster", "jellyfish", "M", "magic", "nerve", "神経束が透けるクラゲ型", ["神経束", "透明膜", "発光腺", "触手"]],
      ["abyss_kaigara_ray", "カイガラレイ", 1, "tank", "ray", "M", "ranged", "cooling", "貝殻を背負ったエイ型", ["貝殻", "翼膜", "鰭骨", "感覚器"]],
      ["abyss_numeri_arm", "ヌメリアーム", 11, "debuffer", "mollusk", "M", "magic", "nerve", "粘液触手を持つ軟体型", ["触手", "粘液腺", "吸盤", "神経"]],
      ["abyss_eye", "アビスアイ", 21, "caster", "eye", "M", "magic", "thunder", "巨大な眼球器官の浮遊体", ["深海眼", "視神経", "水晶体", "発光腺"]],
      ["abyss_kouatsu_manta", "コウアツマンタ", 31, "tank", "manta", "L", "ranged", "gravity", "高圧殻を持つ大型マンタ", ["高圧殻", "翼膜", "鰭骨", "水圧腺"]],
      ["abyss_nemuri_uogara", "ネムリウオガラ", 41, "debuffer", "fish", "M", "magic", "nerve", "睡眠毒を持つ深海魚型", ["睡眠毒腺", "黒鱗", "感覚眼", "神経核"]]
    ],
    bosses: [
      ["abyss_kaigara_nushi", "カイガラヌシ", 10, "水底貝核"],
      ["abyss_noukurage_ou", "ノウクラゲオウ", 20, "王神経核"],
      ["abyss_fukame_no_ou", "フカメノオウ", 30, "深眼王核"],
      ["abyss_ryuuguu_worm", "リュウグウワーム", 40, "竜宮高圧核"],
      ["abyss_ou_gara", "アビスオウガラ", 50, "アビス王核"]
    ]
  },
  {
    planetId: "planet_004",
    key: "ignis",
    name: "イグニス",
    description: "火山帯と岩盤層で構成される高熱惑星。炉心と高出力素材の反応が強い。",
    difficulty: 4,
    recommendedRank: "B",
    maxFloor: 50,
    availableTerrains: "volcanic|rocky",
    fuelModifier: "1.38",
    unlockMaxReachedFloor: 30,
    promptThemes: "living reactor|volcanic armor|molten core|burning veins",
    openBackground: "",
    blockedBackground: "",
    lowFloorEnemyScale: "0.98",
    finalFloorEnemyScale: "1.00",
    weakWeapon: "melee",
    weakAttributes: ["cooling", "gravity"],
    resistAttribute: "fire",
    colorBands: [
      "red:45|black:20|yellow:15|green:7|blue:5|pink:4|white:3|gold:1",
      "red:35|yellow:22|black:18|white:8|pink:7|green:5|blue:3|gold:2",
      "black:28|red:24|yellow:18|white:10|pink:7|blue:5|green:4|gold:4",
      "red:24|black:22|white:16|gold:8|yellow:14|pink:8|blue:4|green:4",
      "gold:8|black:24|red:22|white:16|yellow:14|pink:8|blue:4|green:4"
    ],
    enemies: [
      ["ignis_hizume_lizard", "ヒヅメリザード", 1, "attacker", "lizard", "M", "melee", "fire", "焼けた爪を持つ蜥蜴型", ["火爪", "鱗", "熱皮", "牙"]],
      ["ignis_yougan_beetle", "ヨウガンビートル", 1, "tank", "insect", "M", "melee", "fire", "溶岩を含む甲殻虫", ["溶岩殻", "熱腺", "脚殻", "触角"]],
      ["ignis_homura_bat", "ホムラバット", 1, "speed", "bat", "S", "ranged", "fire", "火膜の翼を持つ蝙蝠型", ["火翼膜", "牙", "発熱腺", "感覚耳"]],
      ["ignis_magma_worm", "マグマワーム", 11, "caster", "worm", "M", "magic", "fire", "炉心を抱えた火山虫", ["炉片", "熱皮", "体節殻", "火腺"]],
      ["ignis_yaketsuno_boar", "ヤケツノボア", 21, "attacker", "beast", "M", "melee", "fire", "焼けた角を持つ猪型", ["焼角", "厚皮", "牙", "筋繊維"]],
      ["ignis_enkamakiri", "エンカマキリ", 31, "speed", "insect", "M", "melee", "fire", "炎を帯びる鎌虫型", ["火鎌爪", "甲殻", "複眼", "熱神経"]],
      ["ignis_kaen_drake", "カエンドレイク", 41, "attacker", "dragon", "L", "melee", "fire", "竜骨と炉心を持つ小型竜", ["竜骨", "火炎炉", "竜鱗", "翼膜"]]
    ],
    bosses: [
      ["ignis_yougan_nushi", "ヨウガンヌシ", 10, "溶岩主核"],
      ["ignis_homura_chimera", "ホムラキメラ", 20, "火炎異形核"],
      ["ignis_kazan_core_gara", "カザンコアガラ", 30, "火山炉核"],
      ["ignis_akaryuu_gara", "アカリュウガラ", 40, "赤竜炉核"],
      ["ignis_ou_gara", "イグニスオウガラ", 50, "イグニス王核"]
    ]
  },
  {
    planetId: "planet_005",
    key: "eden",
    name: "エデン",
    description: "遺跡市街地と古代施設が残る終盤惑星。王種や古代種の反応が多い。",
    difficulty: 5,
    recommendedRank: "A",
    maxFloor: 50,
    availableTerrains: "ruins_city|ancient_facility",
    fuelModifier: "1.50",
    unlockMaxReachedFloor: 40,
    promptThemes: "ancient machine frame|ruined city armor|royal organism|lost bio facility",
    openBackground: "",
    blockedBackground: "",
    lowFloorEnemyScale: "1.02",
    finalFloorEnemyScale: "1.00",
    weakWeapon: "ranged",
    weakAttributes: ["erosion", "nerve", "sonic"],
    resistAttribute: "optical",
    colorBands: [
      "white:40|gold:16|black:18|blue:8|red:7|pink:5|yellow:4|green:2",
      "white:32|black:20|gold:18|blue:8|pink:7|red:6|yellow:5|green:4",
      "black:26|white:22|gold:20|pink:10|blue:8|red:6|yellow:5|green:3",
      "gold:24|white:22|black:22|pink:10|blue:7|red:6|yellow:5|green:4",
      "gold:14|black:24|white:24|pink:12|blue:8|red:8|yellow:5|green:5"
    ],
    enemies: [
      ["eden_iseki_kiba_dog", "イセキキバドッグ", 1, "attacker", "beast", "M", "melee", "erosion", "古代装甲をまとった犬型", ["牙", "古外皮", "装甲片", "神経"]],
      ["eden_kanmuri_gara", "カンムリガラ", 1, "tank", "insect", "M", "melee", "optical", "冠状の甲殻を持つ虫型", ["冠殻", "甲殻", "触角", "王腺"]],
      ["eden_nou_drone", "ノウドローン", 1, "caster", "drone", "S", "magic", "nerve", "神経冠で浮く小型生体兵器", ["神経冠", "感覚器", "浮遊膜", "炉片"]],
      ["eden_shiro_megan", "シロメガン", 11, "caster", "eye", "M", "magic", "optical", "白い巨大眼を持つ監視体", ["白眼", "視神経", "水晶体", "発光腺"]],
      ["eden_outsuno_beast", "オウツノビースト", 21, "attacker", "beast", "L", "melee", "sonic", "王種の角を持つ獣型", ["王角", "牙", "厚甲殻", "筋繊維"]],
      ["eden_tsugihagi_tender", "ツギハギテンダー", 31, "debuffer", "mender", "M", "magic", "erosion", "修復触手を持つ継ぎ接ぎ体", ["修復触手", "培養膜", "神経束", "再生腺"]],
      ["eden_seikotsu_guard", "セイコツガード", 41, "tank", "guardian", "L", "melee", "optical", "聖骨格を持つ守護兵", ["聖骨", "白甲殻", "神経核", "装甲片"]]
    ],
    bosses: [
      ["eden_iseki_guardian", "イセキガーディアン", 10, "遺跡守護核"],
      ["eden_kanmuri_oujuu", "カンムリオウジュウ", 20, "王冠獣核"],
      ["eden_seraph_gara", "セラフガラ", 30, "セラフ聖核"],
      ["eden_kodai_core_beast", "コダイコアビースト", 40, "古代炉心核"],
      ["eden_ou_gara", "エデンオウガラ", 50, "エデン王核"]
    ]
  }
];

writeCsv("planet_master.csv", [
  "planetId", "name", "description", "difficulty", "recommendedRank", "maxFloor", "availableTerrains", "fuelModifier", "unlockMaxReachedFloor", "promptThemes", "openBackground", "blockedBackground", "lowFloorEnemyScale", "finalFloorEnemyScale"
], planets.map((planet) => ({
  planetId: planet.planetId,
  name: planet.name,
  description: planet.description,
  difficulty: planet.difficulty,
  recommendedRank: planet.recommendedRank,
  maxFloor: planet.maxFloor,
  availableTerrains: planet.availableTerrains,
  fuelModifier: planet.fuelModifier,
  unlockMaxReachedFloor: planet.unlockMaxReachedFloor,
  promptThemes: planet.promptThemes,
  openBackground: planet.openBackground,
  blockedBackground: planet.blockedBackground,
  lowFloorEnemyScale: planet.lowFloorEnemyScale,
  finalFloorEnemyScale: planet.finalFloorEnemyScale
})));

writeCsv("color_master.csv", ["colorId", "name", "prefix", "imageSuffix", "hpRate", "atkRate", "defRate", "speedRate", "dropBonusRate", "description"], [
  ["blue", "青", "青い", "blue", "1.00", "0.98", "1.03", "1.00", "1.00", "防御寄り"],
  ["red", "赤", "赤い", "red", "0.98", "1.05", "0.98", "1.00", "1.00", "攻撃寄り"],
  ["yellow", "黄", "黄色い", "yellow", "0.98", "1.02", "0.98", "1.05", "1.00", "速度寄り"],
  ["green", "緑", "緑の", "green", "1.05", "0.98", "1.02", "0.98", "1.00", "生命力寄り"],
  ["pink", "ピンク", "桃色の", "pink", "1.00", "1.00", "1.00", "1.02", "1.05", "やや希少"],
  ["white", "白", "白い", "white", "1.02", "1.00", "1.05", "0.98", "1.08", "高品質素材が出やすい"],
  ["black", "黒", "黒い", "black", "0.98", "1.06", "1.00", "1.02", "1.10", "危険だが素材が良い"],
  ["gold", "金", "金色の", "gold", "1.05", "1.05", "1.05", "1.00", "1.20", "希少で強いが報酬が良い"]
].map(([colorId, name, prefix, imageSuffix, hpRate, atkRate, defRate, speedRate, dropBonusRate, description]) => ({ colorId, name, prefix, imageSuffix, hpRate, atkRate, defRate, speedRate, dropBonusRate, description })));

writeCsv("material_quality_master.csv", ["qualityId", "name", "qualityScore", "statMultiplier", "priceMultiplier", "baseDropWeight", "description"], [
  ["broken", "壊れた", 1, "0.65", "0.40", 100, "欠損が多く性能が低い素材"],
  ["cracked", "ひび割れた", 2, "0.80", "0.65", 80, "劣化やひびがある素材"],
  ["normal", "普通の", 3, "1.00", "1.00", 55, "標準的な品質の素材"],
  ["good", "良質な", 4, "1.18", "1.45", 30, "状態がよく性能が高い素材"],
  ["high", "高品質の", 5, "1.38", "2.20", 14, "希少で高性能な素材"],
  ["best", "最良な", 6, "1.65", "3.50", 5, "最高品質の素材"]
].map(([qualityId, name, qualityScore, statMultiplier, priceMultiplier, baseDropWeight, description]) => ({ qualityId, name, qualityScore, statMultiplier, priceMultiplier, baseDropWeight, description })));

writeCsv("floor_quality_table.csv", ["startFloor", "endFloor", "qualityWeights"], [
  [1, 10, "broken:45|cracked:35|normal:17|good:3|high:0|best:0"],
  [11, 20, "broken:25|cracked:35|normal:28|good:10|high:2|best:0"],
  [21, 30, "broken:10|cracked:25|normal:35|good:22|high:7|best:1"],
  [31, 40, "broken:4|cracked:14|normal:30|good:32|high:17|best:3"],
  [41, 50, "broken:1|cracked:7|normal:20|good:34|high:28|best:10"]
].map(([startFloor, endFloor, qualityWeights]) => ({ startFloor, endFloor, qualityWeights })));

const bands = [[1, 10], [11, 20], [21, 30], [31, 40], [41, 50]];
writeCsv("floor_color_table.csv", ["planetId", "startFloor", "endFloor", "colorWeights"], planets.flatMap((planet) => (
  bands.map(([startFloor, endFloor], index) => ({ planetId: planet.planetId, startFloor, endFloor, colorWeights: planet.colorBands[index] }))
)));

writeCsv("floor_enemy_power_master.csv", ["startFloor", "endFloor", "baseEnemyPower", "bossPower"], [
  [1, 10, 100, 220],
  [11, 20, 180, 380],
  [21, 30, 300, 620],
  [31, 40, 470, 920],
  [41, 50, 700, 1350]
].map(([startFloor, endFloor, baseEnemyPower, bossPower]) => ({ startFloor, endFloor, baseEnemyPower, bossPower })));

writeCsv("enemy_role_master.csv", ["role", "hpRate", "atkRate", "defRate", "speedRate", "description"], [
  ["balanced", "1.00", "1.00", "1.00", "1.00", "標準型"],
  ["attacker", "0.85", "1.25", "0.85", "1.05", "攻撃型"],
  ["tank", "1.25", "0.85", "1.25", "0.70", "耐久型"],
  ["speed", "0.75", "1.05", "0.75", "1.35", "高速型"],
  ["caster", "0.85", "1.10", "0.85", "1.00", "特殊攻撃型"],
  ["debuffer", "0.90", "0.90", "0.90", "1.10", "妨害型"],
  ["boss", "1.50", "1.25", "1.20", "0.90", "ボス型"]
].map(([role, hpRate, atkRate, defRate, speedRate, description]) => ({ role, hpRate, atkRate, defRate, speedRate, description })));

writeCsv("planet_combat_style_master.csv", ["planetId", "hpRate", "atkRate", "defRate", "speedRate", "specialRate", "description"], [
  ["planet_001", "1.08", "1.00", "1.00", "1.00", "1.00", "生命力が高い標準型"],
  ["planet_002", "1.10", "0.95", "1.15", "0.90", "1.00", "防御と毒に寄った重装型"],
  ["planet_003", "0.95", "0.95", "1.00", "1.08", "1.15", "神経・感覚器に寄った特殊型"],
  ["planet_004", "0.95", "1.18", "0.95", "1.00", "1.05", "攻撃と炉心出力に寄った火力型"],
  ["planet_005", "1.00", "1.05", "1.05", "1.00", "1.15", "万能かつ特殊行動が多い終盤型"]
].map(([planetId, hpRate, atkRate, defRate, speedRate, specialRate, description]) => ({ planetId, hpRate, atkRate, defRate, speedRate, specialRate, description })));

const materialIdByName = new Map();
let materialSerial = 1;
const categoryRules = [
  [/牙|爪|鎌|鋏|角|くちばし|針|尾|竜骨|聖骨|王角/, ["weapon", "fang"]],
  [/甲殻|殻|外皮|骨板|骨|鱗|皮|装甲|冠殻|貝殻/, ["frame", "shell"]],
  [/翼|膜|羽|浮遊/, ["wing", "wing"]],
  [/炉|核|腺|嚢|胃|神経|眼|感覚|水晶|器官|触手|筋|節|吸盤|髄/, ["reactor", "organ"]]
];

function materialId(name, planetKey = "") {
  const key = `${planetKey}:${name}`;
  if (materialIdByName.has(key)) return materialIdByName.get(key);
  const id = `${planetKey || "common"}_mat_${String(materialSerial).padStart(3, "0")}`;
  materialSerial += 1;
  materialIdByName.set(key, id);
  return id;
}

function materialShape(name) {
  const match = categoryRules.find(([regex]) => regex.test(name));
  return match ? match[1] : ["special", "organ"];
}

function materialStats(slotType, sourceType) {
  const boss = sourceType === "boss";
  const base = boss ? 180 : sourceType === "rare" ? 95 : 55;
  if (slotType === "weapon") return `sAtk:${Math.round(base * 0.55)};lAtk:${Math.round(base * 0.25)};hp:${Math.round(base * 0.8)}`;
  if (slotType === "frame") return `hp:${Math.round(base * 1.8)};sDef:${Math.round(base * 0.32)};lDef:${Math.round(base * 0.26)};speed:${boss ? 0 : -1}`;
  if (slotType === "wing") return `speed:${Math.round(base * 0.28)};lAtk:${Math.round(base * 0.22)};mDef:${Math.round(base * 0.18)}`;
  return `pp:${Math.round(base * 0.2)};mAtk:${Math.round(base * 0.35)};mDef:${Math.round(base * 0.2)}`;
}

function attributeForMaterial(name, planet) {
  if (/火|熱|炎|炉|竜|赤/.test(name)) return "fire";
  if (/神経|触手|睡眠|毒/.test(name)) return "nerve";
  if (/雷|電/.test(name)) return "thunder";
  if (/酸|腐/.test(name)) return "acid";
  if (/高圧|重|岩|砂/.test(name)) return "gravity";
  if (/白|聖|光|眼|感覚/.test(name)) return "optical";
  if (/古|遺跡|王|侵|再生|修復/.test(name)) return "erosion";
  if (/水|深海|冷/.test(name)) return "cooling";
  return planet.weakAttributes[0];
}

const materialBases = new Map();
function addMaterialBase(id, name, planet, sourceType, role) {
  if (materialBases.has(id)) return;
  const [slotType, category] = materialShape(name);
  materialBases.set(id, {
    materialBaseId: id,
    name,
    category,
    slotType,
    materialRole: role,
    sourceType,
    baseValue: sourceType === "boss" ? 450 : sourceType === "rare" ? 160 : 80,
    baseStatEffects: materialStats(slotType, sourceType),
    description: `${planet.name}由来の${name}`
  });
}

const enemyRows = [];
const tableRows = [];
const enemyMaterialRows = [];
const weaknessRows = [];
const resistanceRows = [];
const skillSetRows = [];

planets.forEach((planet) => {
  planet.enemies.forEach((enemy, index) => {
    const [enemyId, name, startFloor, role, tier, size, attackType, element, description, drops] = enemy;
    enemyRows.push({
      enemyId,
      planetId: planet.planetId,
      name,
      role,
      enemyTier: tier,
      size,
      attackType,
      element,
      description,
      profileId: tier,
      rank: startFloor >= 41 ? "SR" : startFloor >= 21 ? "R" : "N",
      level: startFloor,
      hp: "",
      pp: "",
      sAtk: "",
      mAtk: "",
      lAtk: "",
      sDef: "",
      mDef: "",
      lDef: "",
      speed: "",
      weaponType: attackType,
      weaponPower: "",
      dropMaterialIds: "",
      imagePath: "",
      promptParts: description,
      variantIds: "blue|red|yellow|green|pink|white|black|gold"
    });
    tableRows.push({
      planetId: planet.planetId,
      enemyId,
      startFloor,
      endFloor: 50,
      spawnType: "normal",
      weight: startFloor === 1 ? 30 : 20,
      repeatable: "true"
    });
    drops.forEach((drop, dropIndex) => {
      const id = materialId(drop, planet.key);
      const rare = dropIndex === drops.length - 1;
      addMaterialBase(id, drop, planet, rare ? "rare" : "normal", rare ? "rare_part" : "part");
      enemyMaterialRows.push({ enemyId, materialBaseId: id, dropType: rare ? "rare" : "normal", dropRate: rare ? 5 : 42 });
    });
    const elementWeakType = planet.weakAttributes[index % planet.weakAttributes.length];
    const weapon = index >= 5 ? ["melee", "ranged", "magic"][index % 3] : planet.weakWeapon;
    weaknessRows.push({ enemyId, weaponWeakType: weapon, elementWeakType, weaponWeakRate: "1.50", elementWeakRate: "1.50" });
    resistanceRows.push({ enemyId, weaponResistType: attackType === "magic" ? "ranged" : "magic", elementResistType: planet.resistAttribute, weaponResistRate: "0.75", elementResistRate: "0.75" });
    skillSetRows.push({ enemyId, skillId: `${planet.key}_skill_${(index % 4) + 1}`, weight: 60, unlockFloor: startFloor });
  });
  planet.bosses.forEach((boss, index) => {
    const [enemyId, name, floor, coreName] = boss;
    const element = floor === 50 ? planet.weakAttributes[0] : planet.weakAttributes[index % planet.weakAttributes.length];
    enemyRows.push({
      enemyId,
      planetId: planet.planetId,
      name,
      role: "boss",
      enemyTier: "boss",
      size: floor >= 40 ? "XL" : "L",
      attackType: planet.weakWeapon === "magic" ? "magic" : floor >= 30 ? "ranged" : "melee",
      element,
      description: `${planet.name}${floor}Fのボス。主素材は${coreName}。`,
      profileId: "boss",
      rank: floor >= 50 ? "SSR" : floor >= 30 ? "SR" : "R",
      level: floor,
      hp: "",
      pp: "",
      sAtk: "",
      mAtk: "",
      lAtk: "",
      sDef: "",
      mDef: "",
      lDef: "",
      speed: "",
      weaponType: planet.weakWeapon === "magic" ? "magic" : floor >= 30 ? "ranged" : "melee",
      weaponPower: "",
      dropMaterialIds: "",
      imagePath: "",
      promptParts: `${planet.name} boss ${coreName}`,
      variantIds: "blue|red|yellow|green|pink|white|black|gold"
    });
    tableRows.push({ planetId: planet.planetId, enemyId, startFloor: floor, endFloor: floor, spawnType: "boss", weight: 100, repeatable: "true" });
    const id = materialId(coreName, planet.key);
    addMaterialBase(id, coreName, planet, "boss", "boss_core");
    enemyMaterialRows.push({ enemyId, materialBaseId: id, dropType: "boss_core", dropRate: floor >= 50 ? 100 : 85 });
    weaknessRows.push({ enemyId, weaponWeakType: planet.weakWeapon, elementWeakType: floor === 50 ? planet.weakAttributes[0] : element, weaponWeakRate: "1.50", elementWeakRate: "1.50" });
    resistanceRows.push({ enemyId, weaponResistType: planet.weakWeapon === "melee" ? "ranged" : "magic", elementResistType: planet.resistAttribute, weaponResistRate: "0.75", elementResistRate: "0.75" });
    skillSetRows.push({ enemyId, skillId: `${planet.key}_boss_${Math.min(index + 1, 3)}`, weight: 90, unlockFloor: floor });
  });
});

writeCsv("enemy_master.csv", [
  "enemyId", "planetId", "name", "role", "enemyTier", "size", "attackType", "element", "description", "profileId", "rank", "level", "hp", "pp", "sAtk", "mAtk", "lAtk", "sDef", "mDef", "lDef", "speed", "weaponType", "weaponPower", "dropMaterialIds", "imagePath", "promptParts", "variantIds"
], enemyRows);
writeCsv("planet_enemy_table.csv", ["planetId", "enemyId", "startFloor", "endFloor", "spawnType", "weight", "repeatable"], tableRows);
writeCsv("material_base_master.csv", ["materialBaseId", "name", "category", "slotType", "materialRole", "sourceType", "baseValue", "baseStatEffects", "description"], [...materialBases.values()]);

writeCsv("element_master.csv", ["elementId", "displayName", "weakTo", "strongAgainst", "relatedAilmentId", "description"], [
  ["none", "無", "", "", "", "無属性"],
  ["fire", "火炎", "cooling", "poison", "burn", "燃焼や熱攻撃に関係する属性"],
  ["cooling", "冷却", "thunder", "fire", "freeze", "凍結や冷却攻撃に関係する属性"],
  ["thunder", "電撃", "poison", "cooling", "paralysis", "麻痺や電撃攻撃に関係する属性"],
  ["acid", "酸", "gravity", "fire", "armor_down", "装甲破壊に関係する属性"],
  ["poison", "毒", "fire", "thunder", "poison", "継続ダメージに関係する属性"],
  ["nerve", "神経", "sonic", "optical", "bind", "行動阻害や神経攻撃に関係する属性"],
  ["sonic", "音波", "optical", "nerve", "accuracy_down", "命中低下や攪乱に関係する属性"],
  ["gravity", "重力", "acid", "sonic", "speed_down", "速度低下や拘束に関係する属性"],
  ["optical", "光学", "erosion", "gravity", "blind", "幻惑や命中妨害に関係する属性"],
  ["erosion", "侵食", "fire", "optical", "heal_block", "回復阻害や再生阻害に関係する属性"]
].map(([elementId, displayName, weakTo, strongAgainst, relatedAilmentId, description]) => ({ elementId, displayName, weakTo, strongAgainst, relatedAilmentId, description })));

writeCsv("material_element_master.csv", ["materialBaseId", "weaponType", "elementId", "attackAffinity", "resistAffinity", "description"], [...materialBases.values()].map((base) => {
  const planet = planets.find((item) => base.materialBaseId.startsWith(`${item.key}_`)) || planets[0];
  const elementId = attributeForMaterial(base.name, planet);
  const weaponType = base.slotType === "weapon" ? planet.weakWeapon : base.slotType === "wing" ? "ranged" : base.slotType === "reactor" ? "magic" : "melee";
  return {
    materialBaseId: base.materialBaseId,
    weaponType,
    elementId,
    attackAffinity: base.sourceType === "boss" ? "1.35" : base.sourceType === "rare" ? "1.15" : "1.00",
    resistAffinity: base.sourceType === "boss" ? "0.35" : base.sourceType === "rare" ? "0.25" : "0.15",
    description: `${base.name}は${elementId}適性を持つ`
  };
}));

writeCsv("enemy_material_master.csv", ["enemyId", "materialBaseId", "dropType", "dropRate"], enemyMaterialRows);
const resistanceByEnemyId = new Map(resistanceRows.map((row) => [row.enemyId, row]));
writeCsv("enemy_affinity_master.csv", [
  "enemyId", "weaponWeakType", "elementWeakType", "weaponWeakRate", "elementWeakRate", "weaponResistType", "elementResistType", "weaponResistRate", "elementResistRate"
], weaknessRows.map((row) => {
  const resistance = resistanceByEnemyId.get(row.enemyId) || {};
  return {
    enemyId: row.enemyId,
    weaponWeakType: row.weaponWeakType,
    elementWeakType: row.elementWeakType,
    weaponWeakRate: row.weaponWeakRate,
    elementWeakRate: row.elementWeakRate,
    weaponResistType: resistance.weaponResistType || "",
    elementResistType: resistance.elementResistType || "",
    weaponResistRate: resistance.weaponResistRate || "",
    elementResistRate: resistance.elementResistRate || ""
  };
}));

writeCsv("status_effect_master.csv", ["statusEffectId", "displayName", "effectKind", "category", "statKey", "multiplier", "flatValue", "duration", "effectValue", "description"], [
  ["poison", "毒", "ailment", "damageOverTime", "", "1.00", "0", 3, "0.05", "毎ターンHP減少"],
  ["burn", "火傷", "ailment", "damageOverTime", "", "1.00", "0", 3, "0.06", "毎ターンHP減少"],
  ["shock", "感電", "ailment", "speedDown", "speed", "0.80", "0", 2, "0.20", "速度低下"],
  ["paralysis", "麻痺", "ailment", "actionDown", "", "1.00", "0", 1, "1.00", "行動阻害"],
  ["freeze", "凍結", "ailment", "actionDown", "", "1.00", "0", 1, "1.00", "行動阻害"],
  ["bind", "拘束", "ailment", "actionDown", "", "1.00", "0", 1, "1.00", "行動阻害"],
  ["accuracy_down", "命中低下", "debuff", "accuracyDown", "lAtk", "0.85", "0", 2, "0.20", "命中低下"],
  ["armor_down", "装甲低下", "debuff", "defenseDown", "allDef", "0.80", "0", 3, "0.20", "防御低下"],
  ["speed_down", "速度低下", "debuff", "speedDown", "speed", "0.75", "0", 2, "0.20", "速度低下"],
  ["blind", "幻惑", "ailment", "accuracyDown", "lAtk", "0.75", "0", 2, "0.25", "命中低下"],
  ["heal_block", "回復阻害", "ailment", "healBlock", "", "1.00", "0", 2, "1.00", "回復を阻害"],
  ["jammed", "妨害", "ailment", "ppCostUp", "", "1.00", "0", 3, "1.00", "PP消費増加"],
  ["atk_up_s", "近接強化", "buff", "statMultiplier", "sAtk", "1.20", "0", 3, "", "S-ATK上昇"],
  ["atk_up_l", "遠隔強化", "buff", "statMultiplier", "lAtk", "1.20", "0", 3, "", "L-ATK上昇"],
  ["atk_up_m", "魔法強化", "buff", "statMultiplier", "mAtk", "1.20", "0", 3, "", "M-ATK上昇"],
  ["def_up_all", "防御強化", "buff", "statMultiplier", "allDef", "1.15", "0", 3, "", "全防御上昇"],
  ["speed_up", "加速", "buff", "statMultiplier", "speed", "1.25", "0", 2, "", "速度上昇"],
  ["def_down_all", "防御低下", "debuff", "statMultiplier", "allDef", "0.85", "0", 3, "", "全防御低下"],
  ["regen", "再生", "buff", "regeneration", "hp", "1.00", "0", 3, "", "継続回復"]
].map(([statusEffectId, displayName, effectKind, category, statKey, multiplier, flatValue, duration, effectValue, description]) => ({ statusEffectId, displayName, effectKind, category, statKey, multiplier, flatValue, duration, effectValue, description })));

writeCsv("enemy_skill_master.csv", ["skillId", "name", "effectType", "power", "accuracy", "cooldown", "target", "elementId", "statusEffectId", "description"], [
  ["gaea_skill_1", "絡み根", "ailment", 24, 86, 2, "ally", "nerve", "bind", "", "拘束で行動を鈍らせる"],
  ["gaea_skill_2", "再生樹皮", "heal", 28, 100, 3, "self", "erosion", "", "regen", "自己回復する"],
  ["gaea_skill_3", "胞子煙", "debuff", 20, 82, 3, "allies", "sonic", "accuracy_down", "", "命中を下げる"],
  ["gaea_skill_4", "生命奔流", "buff", 20, 100, 4, "self", "poison", "", "def_up_all", "継戦能力を高める"],
  ["gaea_boss_1", "森核再生", "heal", 42, 100, 3, "self", "erosion", "", "regen", "ボス級の再生"],
  ["gaea_boss_2", "大樹拘束", "ailment", 38, 88, 3, "allies", "nerve", "bind", "", "全体拘束"],
  ["gaea_boss_3", "王核鼓動", "buff", 36, 100, 4, "self", "poison", "", "def_up_all", "耐久を上げる"],
  ["sandria_skill_1", "毒針", "ailment", 26, 88, 2, "ally", "poison", "poison", "", "毒を付与する"],
  ["sandria_skill_2", "砂煙", "debuff", 18, 82, 3, "allies", "sonic", "accuracy_down", "", "命中を下げる"],
  ["sandria_skill_3", "硬化殻", "buff", 20, 100, 3, "self", "acid", "", "def_up_all", "防御を上げる"],
  ["sandria_skill_4", "重砂圧", "attack", 30, 86, 2, "ally", "gravity", "", "", "重力属性攻撃"],
  ["sandria_boss_1", "砂塵再生", "heal", 36, 100, 3, "self", "poison", "", "regen", "砂をまとって再生する"],
  ["sandria_boss_2", "蠍王毒針", "ailment", 40, 88, 3, "ally", "poison", "poison", "", "強毒を付与する"],
  ["sandria_boss_3", "骨塚硬化", "buff", 34, 100, 4, "self", "gravity", "", "def_up_all", "大きく硬化する"],
  ["abyss_skill_1", "神経侵入", "ailment", 24, 86, 2, "ally", "nerve", "bind", "", "行動阻害"],
  ["abyss_skill_2", "深海麻痺", "ailment", 28, 84, 3, "ally", "thunder", "paralysis", "", "麻痺を狙う"],
  ["abyss_skill_3", "暗水攪乱", "debuff", 20, 82, 3, "allies", "sonic", "accuracy_down", "", "命中を下げる"],
  ["abyss_skill_4", "高圧波", "attack", 32, 88, 2, "ally", "gravity", "", "", "高圧攻撃"],
  ["abyss_boss_1", "王神経束", "ailment", 42, 90, 3, "allies", "nerve", "bind", "", "全体神経阻害"],
  ["abyss_boss_2", "深眼放電", "attack", 46, 90, 2, "ally", "thunder", "paralysis", "", "電撃攻撃"],
  ["abyss_boss_3", "竜宮圧壊", "attack", 48, 86, 3, "allies", "gravity", "", "", "全体高圧攻撃"],
  ["ignis_skill_1", "焼爪", "ailment", 30, 88, 2, "ally", "fire", "burn", "", "炎上を狙う"],
  ["ignis_skill_2", "炉心暴走", "attack", 42, 82, 3, "ally", "fire", "", "", "高火力攻撃"],
  ["ignis_skill_3", "赤熱反撃", "counter", 28, 100, 3, "self", "fire", "", "atk_up_s", "反撃態勢"],
  ["ignis_skill_4", "熱波", "attack", 30, 86, 2, "allies", "fire", "burn", "", "全体熱攻撃"],
  ["ignis_boss_1", "溶岩噴出", "attack", 46, 86, 2, "allies", "fire", "burn", "", "溶岩攻撃"],
  ["ignis_boss_2", "火炎異形化", "buff", 36, 100, 3, "self", "fire", "", "atk_up_s", "攻撃強化"],
  ["ignis_boss_3", "王炉心暴走", "attack", 56, 82, 4, "allies", "fire", "", "", "大火力攻撃"],
  ["eden_skill_1", "修復触手", "heal", 28, 100, 3, "self", "erosion", "", "regen", "自己修復"],
  ["eden_skill_2", "王種号令", "buff", 24, 100, 3, "self", "optical", "", "atk_up_l", "攻撃強化"],
  ["eden_skill_3", "白眼解除", "cleanse", 20, 100, 3, "self", "optical", "", "", "弱体を解除する"],
  ["eden_skill_4", "再構成", "heal", 34, 100, 4, "self", "erosion", "", "regen", "回復する"],
  ["eden_boss_1", "遺跡防壁", "buff", 38, 100, 3, "self", "optical", "", "def_up_all", "防御を上げる"],
  ["eden_boss_2", "セラフ再臨", "heal", 48, 100, 4, "self", "erosion", "", "regen", "大回復"],
  ["eden_boss_3", "エデン再構成", "buff", 42, 100, 4, "self", "erosion", "", "atk_up_l", "万能強化"]
].map(([skillId, name, effectType, power, accuracy, cooldown, target, elementId, primaryStatusEffectId, secondaryStatusEffectId, description]) => ({ skillId, name, effectType, power, accuracy, cooldown, target, elementId, statusEffectId: primaryStatusEffectId || secondaryStatusEffectId, description })));
writeCsv("enemy_skill_set_master.csv", ["enemyId", "skillId", "weight", "unlockFloor"], skillSetRows);

writeCsv("pilot_rankup_requirement_master.csv", ["fromRank", "toRank", "requiredQualityId", "requiredBossMaterialCount", "requiredMaterialCount", "allowAnyColor", "description"], [
  ["D", "C", "broken", 0, 3, "true", "ガイア素材でCへ昇格"],
  ["C", "B", "normal", 1, 5, "true", "普通以上の対応惑星素材とボス素材が必要"],
  ["B", "A", "good", 1, 7, "true", "良質以上の対応惑星素材とボス素材が必要"],
  ["A", "S", "high", 1, 10, "true", "高品質以上の対応惑星素材とボス素材が必要"]
].map(([fromRank, toRank, requiredQualityId, requiredBossMaterialCount, requiredMaterialCount, allowAnyColor, description]) => ({ fromRank, toRank, requiredQualityId, requiredBossMaterialCount, requiredMaterialCount, allowAnyColor, description })));

writeCsv("class_rank_planet_master.csv", ["classId", "fromRank", "toRank", "requiredPlanetId"], [
  ["striker", "C", "B", "planet_004"], ["striker", "B", "A", "planet_004"], ["striker", "A", "S", "planet_004"],
  ["gunner", "C", "B", "planet_003"], ["gunner", "B", "A", "planet_003"], ["gunner", "A", "S", "planet_003"],
  ["wizard", "C", "B", "planet_004"], ["wizard", "B", "A", "planet_004"], ["wizard", "A", "S", "planet_004"],
  ["engineer", "C", "B", "planet_005"], ["engineer", "B", "A", "planet_005"], ["engineer", "A", "S", "planet_005"],
  ["defender", "C", "B", "planet_002"], ["defender", "B", "A", "planet_002"], ["defender", "A", "S", "planet_002"],
  ["commander", "C", "B", "planet_005"], ["commander", "B", "A", "planet_005"], ["commander", "A", "S", "planet_005"],
  ["jammer", "C", "B", "planet_002"], ["jammer", "B", "A", "planet_002"], ["jammer", "A", "S", "planet_002"],
  ["scout", "C", "B", "planet_003"], ["scout", "B", "A", "planet_003"], ["scout", "A", "S", "planet_003"]
].map(([classId, fromRank, toRank, requiredPlanetId]) => ({ classId, fromRank, toRank, requiredPlanetId })));

console.log(`Generated ${enemyRows.length} enemies and ${materialBases.size} material bases.`);
