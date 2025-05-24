import { SlashCommandBuilder } from 'discord.js';
export default {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Displays a list of available commands'),
  async execute(interaction) {
    const commands = interaction.client.commands;
    const helpText = Array.from(commands.values())
      .map(cmd => `• **/${cmd.data.name}** - ${cmd.data.description}`)
      .join('\n');
    await interaction.reply({ content: `📜 **Available Commands:**\n${helpText}`, ephemeral: true });
  }
};
