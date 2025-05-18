import db from './db.js';

const cooldowns = new Map();

function getUser(userId) {
  let user = db.data.users.find(u => u.userId === userId);
  if (!user) {
    user = { userId, xp: 0, level: 1 };
    db.data.users.push(user);
  }
  return user;
}

function getXPToNextLevel(level) {
  if (level < 10) {
    return Math.floor(100 * Math.pow(1.2, level)); // gradual increase
  }
  const base = 2000;
  return base + (level - 10) * 500; // increases by 500 after XP crosses 2000
}

function canGainXP(userId) {
  const lastGained = cooldowns.get(userId) || 0;
  const now = Date.now();
  if (now - lastGained >= 30_000) {
    cooldowns.set(userId, now);
    return true;
  }
  return false;
}

function addXP(userId, amount = 10) {
  if (!canGainXP(userId)) return;

  const user = getUser(userId);
  user.xp += amount;

  let xpToNext = getXPToNextLevel(user.level);
  while (user.xp >= xpToNext) {
    user.xp -= xpToNext;
    user.level++;
    xpToNext = getXPToNextLevel(user.level);
  }

  db.write();
}

function getUserXP(userId) {
  const user = getUser(userId);
  const xpToNext = getXPToNextLevel(user.level);
  return { xp: user.xp, level: user.level, xpToNext };
}

function getLeaderboard() {
  return [...db.data.users]
    .sort((a, b) => b.level - a.level || b.xp - a.xp)
    .slice(0, 10);
}

export { addXP, getUserXP, getLeaderboard };
