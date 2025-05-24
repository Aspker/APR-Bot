import { SlashCommandBuilder } from 'discord.js';
export default {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Show a list of available commands'),
  async execute(interaction) {
    try {
      const commands = interaction.client.commands;

      if (!commands || commands.size === 0) {
        return interaction.reply({ content: 'No commands found.', ephemeral: true });
      }
      const sortedCommands = Array.from(commands.values()).sort((a, b) => a.data.name.localeCompare(b.data.name));

      let helpMessage = '**Available commands:**\n\n';
      for (const command of sortedCommands) {
        helpMessage += `• \`/${command.data.name}\` — ${command.data.description}\n`;
      }
      if (helpMessage.length > 1900) {
        helpMessage = helpMessage.slice(0, 1900) + '\n...and more commands.';
      }
      await interaction.reply({ content: helpMessage, ephemeral: true });
    } catch (error) {
      console.error('Error in /help command:', error);
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({ content: '❌ An error occurred while running the help command.', ephemeral: true });
      }
    }
  }
};
