import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v10';
import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import 'dotenv/config';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const commandsPath = __dirname;
function buildAllowCommand(commandNames) {
  const choices = commandNames
    .filter(name => name !== 'allow')
    .map(name => ({ name, value: name }));
  return new SlashCommandBuilder()
    .setName('allow')
    .setDescription('Set allowed user or role to use restricted commands')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption(option =>
      option
        .setName('command')
        .setDescription('Command to allow')
        .setRequired(true)
        .addChoices(...choices))
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User to allow')
        .setRequired(false))
    .addRoleOption(option =>
      option.setName('role')
        .setDescription('Role to allow')
        .setRequired(false));
}
async function readCommands(dir) {
  const files = await fs.readdir(dir, { withFileTypes: true });
  let commands = [];
  for (const file of files) {
    if (file.isDirectory()) {
      const nested = await readCommands(path.join(dir, file.name));
      commands = commands.concat(nested);
    } else if (file.name.endsWith('.js') && file.name !== 'allow.js') {
      const filePath = path.join(dir, file.name);
      const commandModule = await import(filePath);
      if (commandModule.default?.data?.toJSON) {
        commands.push(commandModule.default.data.toJSON());
      }
    }
  }
  return commands;
}
async function deployCommands() {
  try {
    console.log('⏳ Reading commands from:', commandsPath);
    const regularCommands = await readCommands(commandsPath);
    const commandNames = regularCommands.map(cmd => cmd.name);
    const allowCommand = buildAllowCommand(commandNames);
    const fullCommands = [...regularCommands, allowCommand.toJSON()];
    console.log('Commands to register:', fullCommands.map(c => c.name));
    const rest = new REST({ version: '10' }).setToken(TOKEN);
    await rest.put(Routes.applicationCommands(CLIENT_ID), { body: fullCommands });
    console.log('✅ Successfully reloaded application (slash) commands.');
  } catch (error) {
    console.error('❌ Error deploying commands:', error);
  }
}
deployCommands();
