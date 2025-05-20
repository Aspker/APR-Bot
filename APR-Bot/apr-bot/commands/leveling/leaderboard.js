import { SlashCommandBuilder } from 'discord.js';
import { getTopUsers } from '../../utils/xpManager.js';

export default {
  data: new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('Show the server leaderboard'),
  async execute(interaction) {
    const guildId = interaction.guild.id;
    const topUsers = getTopUsers(guildId, 10);

    if (topUsers.length === 0) {
      await interaction.reply('📉 No XP data yet for this server.');
      return;
    }

    const leaderboard = topUsers.map((user, index) =>
      `${index + 1}. <@${user.userId}> — Level ${user.level} (${user.xp} XP)`
    ).join('\n');

    await interaction.reply(`🏆 Server Leaderboard 🏆\n${leaderboard}`);
  },
};
