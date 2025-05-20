import { SlashCommandBuilder } from 'discord.js';
import { showQueue } from '../../utils/musicPlayer.js';

export default {
  data: new SlashCommandBuilder()
    .setName('queue')
    .setDescription('Show the current music queue'),
  async execute(interaction) {
    await showQueue(interaction);
  },
};
