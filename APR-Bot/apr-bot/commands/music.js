// commands/music.js
import { SlashCommandBuilder } from 'discord.js';
import musicPlayer from '../utils/musicPlayer.js';

export const data = new SlashCommandBuilder()
  .setName('play')
  .setDescription('Play a song from YouTube')
  .addStringOption(option =>
    option.setName('query')
      .setDescription('YouTube URL or search query')
      .setRequired(true)
  );

export async function execute(interaction) {
  const query = interaction.options.getString('query');
  await musicPlayer.play(interaction, query);
}