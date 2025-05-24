import { SlashCommandBuilder, PermissionFlagsBits, Routes } from 'discord.js';
import fs from 'fs/promises';
import path from 'path';
import { REST } from '@discordjs/rest';
const ALLOWED_PATH = path.join(process.cwd(), 'json_sqlite', 'allowedData.json');
const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
export default {
  data: new SlashCommandBuilder()
    .setName('commandpermissions')
    .setDescription('List all commands and their permissions (admin only)')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(interaction) {
    const guild = interaction.guild;
    if (!guild) {
      return interaction.reply({ content: 'This command can only be used in a server.', ephemeral: true });
    }
    try {
      const rest = new REST({ version: '10' }).setToken(TOKEN);
      const globalCommands = await rest.get(Routes.applicationCommands(CLIENT_ID));
      if (!globalCommands || globalCommands.length === 0) {
        return interaction.reply({ content: 'No commands found.', ephemeral: true });
      }
      let allowedData = {};
      try {
        const raw = await fs.readFile(ALLOWED_PATH, 'utf8');
        allowedData = JSON.parse(raw);
      } catch (err) {
        if (err.code !== 'ENOENT') throw err;
      }
      const guildAllowed = allowedData[guild.id] || {};
      const sortedCommands = globalCommands.sort((a, b) => a.name.localeCompare(b.name));
      let reply = `**Commands and Permissions in ${guild.name}:**\n`;
      for (const command of sortedCommands) {
        reply += `\n• **${command.name}**`;
        if (command.default_member_permissions) {
          const permsInt = BigInt(command.default_member_permissions);
          reply += ' — Requires Discord permissions';
        }
        const allowed = guildAllowed[command.name];
        if (allowed) {
          const userMentions = (allowed.users || []).map(id => `<@${id}>`).join(', ');
          const roleMentions = (allowed.roles || []).map(id => `<@&${id}>`).join(', ');
          if (userMentions || roleMentions) {
            reply += ' — Allowed: ';
            if (userMentions) reply += `Users: ${userMentions} `;
            if (roleMentions) reply += `Roles: ${roleMentions}`;
          }
        }
        if (
          !command.default_member_permissions &&
          (!allowed || ((!allowed.users || allowed.users.length === 0) && (!allowed.roles || allowed.roles.length === 0)))
        ) {
          reply += ' — Everyone can use';
        }
      }
      if (reply.length > 1900) {
        reply = reply.slice(0, 1900) + '\n...and more commands.';
      }
      return interaction.reply({ content: reply, ephemeral: true });
    } catch (error) {
      console.error('Error in /commandpermissions:', error);
      return interaction.reply({ content: 'An error occurred while fetching command permissions.', ephemeral: true });
    }
  },
};
