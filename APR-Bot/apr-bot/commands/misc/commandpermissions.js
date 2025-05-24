import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
export default {
  data: new SlashCommandBuilder()
    .setName('commandpermissions')
    .setDescription('List all commands and their permissions (admin only)')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(interaction) {
    try {
      const guild = interaction.guild;
      if (!guild) {
        return interaction.reply({ content: 'This command can only be used in a server.', ephemeral: true });
      }
      const commands = await guild.commands.fetch();
      if (!commands.size) {
        return interaction.reply({ content: 'No commands found in this guild.', ephemeral: true });
      }
      const sortedCommands = Array.from(commands.values()).sort((a, b) => a.name.localeCompare(b.name));
      let reply = `**Commands and Permissions in ${guild.name}:**\n`;
      for (const command of sortedCommands) {
        reply += `\n• **${command.name}**`;
        if (command.defaultMemberPermissions) {
          reply += ` — Requires permissions: ${command.defaultMemberPermissions.toArray().join(', ')}`;
        } else {
          reply += ' — No special permissions (everyone can use)';
        }
        reply += '\n';
      }
      if (reply.length > 1900) {
        reply = 'There are many commands and permissions. Please check permissions in your developer portal or via API.';
      }
      return interaction.reply({ content: reply, ephemeral: true });
    } catch (error) {
      console.error('Error in /commandpermissions:', error);
      return interaction.reply({ content: 'An error occurred while fetching command permissions.', ephemeral: true });
    }
  }
};
