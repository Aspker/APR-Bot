import { SlashCommandBuilder } from 'discord.js';
import { handlePlayCommand } from '../../utils/musicPlayer.js';
import ytSearch from 'yt-search';

export default {
  data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('Plays a song from YouTube')
    .addStringOption(option =>
      option.setName('query')
        .setDescription('Song name or YouTube URL')
        .setRequired(true)
    ),
  async execute(interaction) {
    const query = interaction.options.getString('query');
    const result = await ytSearch(query);
    const video = result.videos[0];

    if (!video) {
      await interaction.reply('No results found.');
      return;
    }

    const song = {
      title: video.title,
      url: video.url,
    };

    await handlePlayCommand(interaction, song);
  },
};
