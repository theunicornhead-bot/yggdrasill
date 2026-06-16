"use strict";

(function defineClassSkillMaster() {
  const classPlans = {
    striker: { type: "attack", rangeType: "short", target: "enemy_single", names: ["Bone Break", "Rush Edge", "Iron Cleave", "Twin Fang", "Guard Split", "Assault Step", "Heavy Rend", "Crimson Arc", "Close Burst", "Brave Drive", "Armor Bite", "Meteor Slash", "Line Breaker", "War Cry", "Vital Strike", "Blade Cyclone", "Final Charge", "Over Slash", "King's Cut", "Zero Break"] },
    gunner: { type: "attack", rangeType: "long", target: "enemy_single", names: ["Aimed Shot", "Pierce Round", "Cover Fire", "Burst Shell", "Anchor Snipe", "Quick Draw", "Armor Shot", "Scatter Line", "Long Barrel", "Falcon Sight", "Breaker Round", "Cross Fire", "Dead Angle", "Suppress", "Rail Shot", "Wide Volley", "Zero Point", "Meteor Round", "Last Bullet", "Star Snipe"] },
    wizard: { type: "attack", rangeType: "magic", target: "enemy_single", names: ["Spark Rune", "Flame Sign", "Ice Needle", "Gravity Mark", "Mana Lance", "Arc Wave", "Void Pin", "Hex Bolt", "Nova Seed", "Ether Rain", "Rune Burst", "Abyss Flare", "Spirit Coil", "Prism Ray", "Meteor Sigil", "Mana Storm", "Stellar Gate", "Zero Chant", "Grand Nova", "World Rune"] },
    engineer: { type: "heal", rangeType: "none", target: "ally_single", names: ["Patch Kit", "Coolant Mist", "Repair Arm", "Circuit Balm", "Quick Weld", "Field Medic", "Barrier Patch", "Energy Feed", "Drone Mend", "Mass Tune", "Overhaul", "Rescue Link", "Nanite Cloud", "System Cleanse", "Reboot Aid", "Supply Drop", "Arc Repair", "Full Service", "Life Engine", "Miracle Fix"] },
    defender: { type: "guard", rangeType: "none", target: "self", names: ["Brace", "Shield Rise", "Iron Wall", "Cover Line", "Taunt Beacon", "Guard Pulse", "Bulwark", "Anchor Stance", "Fortress Step", "Damage Cut", "Shelter Field", "Hate Lock", "Steel Oath", "Wall Drive", "Aegis Ring", "Last Stand", "Citadel", "Guardian Roar", "Perfect Guard", "Absolute Wall"] },
    commander: { type: "buff", rangeType: "none", target: "ally_all", names: ["Rally", "Attack Order", "Guard Order", "Move Order", "Focus Call", "Morale Link", "Tactical Map", "Field Hymn", "Command Net", "Resupply Call", "All Hands", "Fire Plan", "Defense Plan", "Wing Signal", "Rapid Command", "Victory Path", "Strategic Eye", "Grand Order", "Limit Command", "Crown Signal"] },
    jammer: { type: "debuff", rangeType: "magic", target: "enemy_single", names: ["Noise", "Sensor Jam", "Slow Code", "Weak Signal", "Blind Net", "Virus Pin", "Armor Leak", "Power Drain", "Chaos Field", "Hack Pulse", "Lock Break", "Blackout", "Misfire", "Signal Rot", "Doom Mark", "System Snare", "Deep Virus", "Null Zone", "World Jam", "Total Silence"] },
    scout: { type: "scout", rangeType: "none", target: "field", names: ["Survey", "First Move", "Find Route", "Item Eye", "Trap Read", "Silent Step", "Quick Escape", "Weak Point", "Map Sync", "Loot Sense", "Dodge Call", "Ambush Read", "Smoke Trail", "Pathfinder", "Lucky Hand", "Scan Field", "Perfect Route", "Ghost Step", "Treasure Mark", "Horizon Eye"] }
  };

  const learnLevels = [1, 2, 3, 4, 5, 7, 9, 11, 13, 15, 18, 21, 24, 27, 30, 34, 38, 42, 46, 50];

  window.ClassSkillMaster = Object.entries(classPlans).flatMap(([classId, plan]) => {
    return plan.names.map((name, index) => {
      const isPassive = index === 19;
      const isArea = index === 15 || index === 18;
      return {
        id: `${classId}_${String(index + 1).padStart(3, "0")}`,
        classId,
        name,
        description: `${name} technique for ${classId}.`,
        learnLevel: learnLevels[index],
        type: isPassive ? "passive" : plan.type,
        rangeType: isPassive ? "none" : plan.rangeType,
        power: plan.type === "attack" || plan.type === "debuff" ? 105 + index * 7 : 20 + index * 3,
        ppCost: isPassive ? 0 : 4 + Math.floor(index / 3),
        target: isPassive ? "passive" : isArea ? (plan.target.startsWith("enemy") ? "enemy_all" : plan.target === "ally_single" ? "ally_all" : plan.target) : plan.target
      };
    });
  });
})();
