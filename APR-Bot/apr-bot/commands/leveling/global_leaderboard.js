import { SlashCommandBuilder } from 'discord.js';
import { getTopGlobalUsers } from '../../utils/xpManager.js';
export default {
  data: new SlashCommandBuilder()
    .setName('global_leaderboard')
    .setDescription('Show the global leaderboard (total XP across all servers)')
    .addIntegerOption(option =>
      option.setName('limit')
        .setDescription('Number of users to show (default: 10, max: 25)')
        .setMinValue(1)
        .setMaxValue(25)
        .setRequired(false)
    ),
  async execute(interaction) {
    const limit = interaction.options.getInteger('limit') || 10;
    const topUsers = getTopGlobalUsers(limit);

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
