import { SlashCommandBuilder } from 'discord.js';
import { getLeaderboard } from '../utils/xpManager.js';

export const data = new SlashCommandBuilder()
  .setName('leaderboard')
  .setDescription('Show the top 10 users by level in this server');

export async function execute(interaction) {
  const leaderboard = getLeaderboard(interaction.guild.id);
  if (leaderboard.length === 0) {
    await interaction.reply('No data yet!');
    return;
  }

  const lines = leaderboard.map((u, i) =>
    `${i + 1}. <@${u.userId}> — Level ${u.level}`
  );

  await interaction.reply(`🏆 Server Leaderboard 🏆\n${lines.join('\n')}`);
}
