import { SlashCommandBuilder } from 'discord.js';
import { getUserXP } from '../utils/xpManager.js';

export const data = new SlashCommandBuilder()
  .setName('level')
  .setDescription('Check your current level and XP');

export async function execute(interaction) {
  const { level, xp, xpToNext } = getUserXP(interaction.guild.id, interaction.user.id);
  await interaction.reply(`🌟 You are level ${level} with ${xp}/${xpToNext} XP.`);
}