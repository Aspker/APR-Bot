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
  try {
    const tempFile = xpFilePath + '.tmp';
    fs.writeFileSync(tempFile, JSON.stringify(xpData, null, 2));
    fs.renameSync(tempFile, xpFilePath);
  } catch (error) {
    console.error('Error saving XP data:', error);
  }
}

function saveGlobalXpData() {
  try {
    const tempFile = globalXpFilePath + '.tmp';
    fs.writeFileSync(tempFile, JSON.stringify(globalXpData, null, 2));
    fs.renameSync(tempFile, globalXpFilePath);
  } catch (error) {
    console.error('Error saving global XP data:', error);
  }
}

function getRequiredXp(level) {
  if (level < 10) return Math.round(100 * Math.pow(1.5, level));
  return 2000 + (level - 10) * 300;
}

function addXp(userId, guildId, amount) {
  try {
    if (!userId || !guildId || amount < 0) return false;

    const now = Date.now();
    const lastTime = cooldowns.get(userId) || 0;
    if (now - lastTime < 20_000) return false; 
    cooldowns.set(userId, now);

    if (!xpData[guildId]) xpData[guildId] = {};
    if (!xpData[guildId][userId]) xpData[guildId][userId] = { xp: 0, level: 0 };

    const userData = xpData[guildId][userId];
    userData.xp += amount;

    while (userData.xp >= getRequiredXp(userData.level)) {
      userData.xp -= getRequiredXp(userData.level);
      userData.level++;
    }

    if (!globalXpData[userId]) globalXpData[userId] = { xp: 0 };
    globalXpData[userId].xp += amount;

    saveXpData();
    saveGlobalXpData();
    return true;
  } catch (error) {
    console.error('Error adding XP:', error);
    return false;
  }
}
