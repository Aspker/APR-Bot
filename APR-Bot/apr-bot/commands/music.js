import { SlashCommandBuilder } from 'discord.js';
import musicPlayer from '../utils/musicPlayer.js';

export const data = [
  new SlashCommandBuilder()
    .setName('play')
    .setDescription('Play a song from YouTube')
    .addStringOption(option =>
      option.setName('query')
        .setDescription('YouTube title or URL')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('author')
        .setDescription('(Optional) Author to improve search accuracy')
        .setRequired(false)),

  new SlashCommandBuilder()
    .setName('stop')
    .setDescription('Stop music and clear the queue'),

  new SlashCommandBuilder()
    .setName('skip')
    .setDescription('Skip to the next song in queue'),

  new SlashCommandBuilder()
    .setName('queue')
    .setDescription('View the current music queue'),
];

export async function execute(interaction) {
  const commandName = interaction.commandName;

  if (commandName === 'play') {
    const query = interaction.options.getString('query');
    const author = interaction.options.getString('author') || '';
    return musicPlayer.play(interaction, `${query} ${author}`.trim());
  }

  if (commandName === 'stop') {
    return musicPlayer.stop(interaction);
  }

  if (commandName === 'skip') {
    return musicPlayer.skip(interaction);
  }

  if (commandName === 'queue') {
    return musicPlayer.showQueue(interaction);
  }
}