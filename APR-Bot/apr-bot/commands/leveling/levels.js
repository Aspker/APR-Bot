// commands/leveling/level.js
import { SlashCommandBuilder } from 'discord.js';
import { getUserData, getRequiredXp } from '../../utils/xpManager.js';

export default {
  data: new SlashCommandBuilder()
    .setName('level')
    .setDescription('Check your level and XP'),

  async execute(interaction) {
    const userId = interaction.user.id;
    const guildId = interaction.guild.id;
    const userData = getUserData(userId, guildId);
    const requiredXp = getRequiredXp(userData.level);

    await interaction.reply(
      `🌟 You are level ${userData.level} with ${userData.xp}/${requiredXp} XP.`
    );
  },
};
