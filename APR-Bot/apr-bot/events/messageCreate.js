import { addXp } from '../utils/xpManager.js';
const cooldowns = new Map();
export default {
  name: 'messageCreate',
  async execute(message) {
    if (message.author.bot || !message.guild) return;
    const key = `${message.guild.id}-${message.author.id}`;
    const now = Date.now();
    if (cooldowns.has(key) && now - cooldowns.get(key) < 30000) return;
    cooldowns.set(key, now);
    addXp(message.author.id, message.guild.id, 10);
  },
};
