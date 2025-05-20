import { SlashCommandBuilder } from 'discord.js';
import { skipSong } from '../../utils/musicPlayer.js';

export default {
  data: new SlashCommandBuilder()
    .setName('skip')
    .setDescription('Skip the current song'),
  async execute(interaction) {
    await skipSong(interaction);
  },
};
