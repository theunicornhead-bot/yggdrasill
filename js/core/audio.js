"use strict";

const AUDIO_SE_PATHS = {
  button: "audio/se/button.mp3",
  decide: "audio/se/decide.mp3",
  cancel: "audio/se/cancel.mp3",
  battle_start: "audio/se/battle_start.mp3",
  attack: "audio/se/attack.mp3",
  skill: "audio/se/skill.mp3",
  warning: "audio/se/warning.mp3",
  overdrive_ready: "audio/se/overdrive_ready.mp3",
  boss_detected: "audio/se/boss_detected.mp3",
  victory: "audio/se/victory.mp3",
  defeat: "audio/se/defeat.mp3",
  mech_generate: "audio/se/mech_generate.mp3",
  rank_up: "audio/se/rank_up.mp3"
};

const AUDIO_BGM_PATHS = {
  bar: "audio/bgm/bar.mp3",
  hangar: "audio/bgm/hangar.mp3",
  quest: "audio/bgm/quest.mp3",
  battle: "audio/bgm/battle.mp3",
  boss: "audio/bgm/boss.mp3"
};

window.AudioManager = {
  unlocked: false,
  bgm: null,
  currentBgmId: "",
  unlock() {
    if (this.unlocked) return true;
    this.unlocked = true;
    return true;
  },
  playSe(id) {
    this.unlock();
    const path = AUDIO_SE_PATHS[id];
    if (!path) return false;
    try {
      const audio = new Audio(path);
      audio.volume = 0.55;
      audio.play().catch(() => {});
      return true;
    } catch (error) {
      return false;
    }
  },
  playBgm(id) {
    this.unlock();
    const path = AUDIO_BGM_PATHS[id];
    if (!path || this.currentBgmId === id) return false;
    this.stopBgm();
    try {
      const audio = new Audio(path);
      audio.loop = true;
      audio.volume = 0.35;
      this.bgm = audio;
      this.currentBgmId = id;
      audio.play().catch(() => {});
      return true;
    } catch (error) {
      this.bgm = null;
      this.currentBgmId = "";
      return false;
    }
  },
  stopBgm() {
    if (!this.bgm) return;
    try {
      this.bgm.pause();
      this.bgm.currentTime = 0;
    } catch (error) {
      // Audio may be unavailable in some WebViews.
    }
    this.bgm = null;
    this.currentBgmId = "";
  }
};
