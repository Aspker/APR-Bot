import { SlashCommandBuilder } from 'discord.js';
import { getLeaderboard } from '../utils/xpManager.js';

export const data = new SlashCommandBuilder()
  .setName('leaderboard')
  .setDescription('Show top XP earners');

export async function execute(interaction) {
  const leaderboard = getLeaderboard();

  const top = leaderboard
    .map((user, index) => `${index + 1}. <@${user.userId}> — Level ${user.level}`)
    .join('\n');

  await interaction.reply(`🏆 **Server Leaderboard** 🏆\n${top}`);
}
