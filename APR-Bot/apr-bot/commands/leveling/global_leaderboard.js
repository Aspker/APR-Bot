import { SlashCommandBuilder } from 'discord.js';
import { getTopGlobalUsers } from '../../utils/xpManager.js';

export default {
  data: new SlashCommandBuilder()
    .setName('global_leaderboard')
    .setDescription('Show the global leaderboard (total XP across all servers)'),
  async execute(interaction) {
    const topUsers = getTopGlobalUsers(10);
    if (topUsers.length === 0) {
      await interaction.reply('🌍 No global XP data yet.');
      return;
    }

    const leaderboard = topUsers.map((user, index) =>
      `${index + 1}. <@${user.userId}> — ${user.xp} XP`
    ).join('\n');

    await interaction.reply(`🏆 **Global Leaderboard** 🏆\n${leaderboard}`);
  },
};
