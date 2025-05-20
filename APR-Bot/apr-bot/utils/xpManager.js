import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const xpFilePath = path.join(__dirname, '../json_sqlite/db.json');
const globalXpFilePath = path.join(__dirname, '../json_sqlite/global_xp.json');

let xpData = JSON.parse(fs.readFileSync(xpFilePath, 'utf8'));
let globalXpData = JSON.parse(fs.existsSync(globalXpFilePath)
  ? fs.readFileSync(globalXpFilePath, 'utf8')
  : '{}');

const cooldowns = new Map(); 

function saveXpData() {
  fs.writeFileSync(xpFilePath, JSON.stringify(xpData, null, 2));
}

function saveGlobalXpData() {
  fs.writeFileSync(globalXpFilePath, JSON.stringify(globalXpData, null, 2));
}

function getRequiredXp(level) {
  if (level < 10) return Math.round(100 * Math.pow(1.5, level));
  return 2000 + (level - 10) * 300;
}

function addXp(userId, guildId, amount) {
  const now = Date.now();
  const lastTime = cooldowns.get(userId) || 0;
  if (now - lastTime < 30_000) return false; // 30s global cooldown

  cooldowns.set(userId, now);

  // Per-server XP
  if (!xpData[guildId]) xpData[guildId] = {};
  if (!xpData[guildId][userId]) xpData[guildId][userId] = { xp: 0, level: 0 };

  const userData = xpData[guildId][userId];
  userData.xp += amount;

  while (userData.xp >= getRequiredXp(userData.level)) {
    userData.xp -= getRequiredXp(userData.level);
    userData.level++;
  }

  // Global XP
  if (!globalXpData[userId]) globalXpData[userId] = { xp: 0 };
  globalXpData[userId].xp += amount;

  saveXpData();
  saveGlobalXpData();
  return true;
}

function getUserData(userId, guildId) {
  if (!xpData[guildId]) xpData[guildId] = {};
  if (!xpData[guildId][userId]) xpData[guildId][userId] = { xp: 0, level: 0 };
  return xpData[guildId][userId];
}

function getTopUsers(guildId, limit = 10) {
  if (!xpData[guildId]) return [];
  return Object.entries(xpData[guildId])
    .map(([userId, data]) => ({ userId, ...data }))
    .sort((a, b) => b.level - a.level || b.xp - a.xp)
    .slice(0, limit);
}

function getTopGlobalUsers(limit = 10) {
  return Object.entries(globalXpData)
    .map(([userId, data]) => ({ userId, ...data }))
    .sort((a, b) => b.xp - a.xp)
    .slice(0, limit);
}

export {
  addXp,
  getUserData,
  getTopUsers,
  getTopGlobalUsers,
  getRequiredXp,
};
