import fs from 'fs/promises';
import path from 'path';
import { SlashCommandBuilder } from 'discord.js';
const ALLOWED_PATH = './json_sqlite/allowed.json';
export default {
  data: new SlashCommandBuilder()
    .setName('allow')
    .setDescription('Allow a user or role to use a specific command')
    .addStringOption(option =>
      option.setName('command')
        .setDescription('The command to allow')
        .setRequired(true))
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User to allow')
        .setRequired(false))
    .addRoleOption(option =>
      option.setName('role')
        .setDescription('Role to allow')
        .setRequired(false)),
  async execute(interaction) {
    const command = interaction.options.getString('command');
    const user = interaction.options.getUser('user');
    const role = interaction.options.getRole('role');
    const guildId = interaction.guildId;
    if (!user && !role) {
      return interaction.reply({
        content: '❌ You must specify either a user or a role.',
        ephemeral: true
      });
    }
    try {
      let data = {};
      try {
        const fileData = await fs.readFile(ALLOWED_PATH, 'utf8');
        data = JSON.parse(fileData);
      } catch (err) {
        if (err.code !== 'ENOENT') throw err;
      }
      if (!data[guildId]) data[guildId] = {};
      if (!data[guildId][command]) data[guildId][command] = { users: [], roles: [] };
      if (user) {
        data[guildId][command].users.push(user.id);
      }
      if (role) {
        data[guildId][command].roles.push(role.id);
      }
      data[guildId][command].users = [...new Set(data[guildId][command].users)];
      data[guildId][command].roles = [...new Set(data[guildId][command].roles)];
      await fs.writeFile(ALLOWED_PATH, JSON.stringify(data, null, 2));
      await interaction.reply({
        content: `✅ Allowed ${user ? `<@${user.id}>` : `<@&${role.id}>`} to use \`/${command}\` in this server.`,
        ephemeral: true
      });
    } catch (error) {
      console.error('Error updating allow list:', error);
      await interaction.reply({
        content: '❌ Failed to update allow permissions.',
        ephemeral: true
      });
    }
  }
};
