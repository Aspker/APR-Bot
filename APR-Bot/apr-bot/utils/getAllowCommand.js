import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';
async function getCommandChoices(commandsDir) {
  const commandChoices = [];
  const files = fs.readdirSync(commandsDir, { withFileTypes: true });
  for (const file of files) {
    const fullPath = path.join(commandsDir, file.name);
    if (file.isDirectory()) {
      const nestedChoices = await getCommandChoices(fullPath);
      commandChoices.push(...nestedChoices);
    } else if (file.name.endsWith('.js')) {
      const module = await import(pathToFileURL(fullPath));
      if (module.default?.data && module.default.data.name !== 'allow') {
        commandChoices.push({ name: module.default.data.name, value: module.default.data.name });
      }
    }
  }
  return commandChoices;
}
export async function buildAllowCommand(commandsDir) {
  const commandChoices = await getCommandChoices(commandsDir);
  console.log('Allow command choices:', commandChoices);
  const builder = new SlashCommandBuilder()
    .setName('allow')
    .setDescription('Set allowed user or role to use restricted commands')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption(option => {
      option = option.setName('command').setDescription('Command to allow').setRequired(true);
      if (commandChoices.length > 0) {
        option = option.addChoices(...commandChoices);
      }
      return option;
    })
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User to allow')
        .setRequired(false)
    )
    .addRoleOption(option =>
      option.setName('role')
        .setDescription('Role to allow')
        .setRequired(false)
    );
  return builder;
}
