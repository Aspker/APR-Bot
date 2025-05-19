import db from './db.js';

const cooldowns = new Map();

function getUser(guildId, userId) {
  if (!db.data.users) db.data.users = [];

  let user = db.data.users.find(u => u.guildId === guildId && u.userId === userId);
  if (!user) {
    user = { guildId, userId, xp: 0, level: 1 };
    db.data.users.push(user);
  }
  return user;
}

function getXPToNextLevel(level) {
  if (level < 10) {
    return Math.floor(100 * Math.pow(1.2, level)); // gradual increase
  }
  return 2000 + (level - 10) * 500;
}

function canGainXP(guildId, userId) {
  const key = `${guildId}-${userId}`;
  const lastGained = cooldowns.get(key) || 0;
  const now = Date.now();
  if (now - lastGained >= 30_000) {
    cooldowns.set(key, now);
    return true;
  }
  return false;
}

function addXP(guildId, userId, amount = 10) {
  if (!canGainXP(guildId, userId)) return;

  const user = getUser(guildId, userId);
  user.xp += amount;

  let xpToNext = getXPToNextLevel(user.level);
  while (user.xp >= xpToNext) {
    user.xp -= xpToNext;
    user.level++;
    xpToNext = getXPToNextLevel(user.level);
  }

  db.write();
}

function getUserXP(guildId, userId) {
  const user = getUser(guildId, userId);
  const xpToNext = getXPToNextLevel(user.level);
  return { xp: user.xp, level: user.level, xpToNext };
}

function getLeaderboard(guildId) {
  return db.data.users
    .filter(u => u.guildId === guildId)
    .sort((a, b) => b.level - a.level || b.xp - a.xp)
    .slice(0, 10);
}

export { addXP, getUserXP, getLeaderboard };