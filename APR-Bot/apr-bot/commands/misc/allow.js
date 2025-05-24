import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { saveAllowData } from '../../utils/permissionManager.js';
export default {
  data: new SlashCommandBuilder()
    .setName('allow')
    .setDescription('Set allowed user or role to use restricted commands')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User to allow')
        .setRequired(false))
    .addRoleOption(option =>
      option.setName('role')
        .setDescription('Role to allow')
        .setRequired(false)),
  async execute(interaction) {
    const user = interaction.options.getUser('user');
    const role = interaction.options.getRole('role');
    if (!user && !role) {
      return interaction.reply({ content: 'Please specify a user or a role.', ephemeral: true });
    }
    await saveAllowData(interaction.guild.id, {
      userId: user ? user.id : null,
      roleId: role ? role.id : null,
    });
    return interaction.reply({
      content: `Allowed ${user ? `user **${user.tag}**` : ''}${user && role ? ' and ' : ''}${role ? `role **${role.name}**` : ''} to use restricted commands.`,
      ephemeral: true,
    });
  }
};
