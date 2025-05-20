import { SlashCommandBuilder } from 'discord.js';
import { stopPlayback } from '../../utils/musicPlayer.js';

export default {
  data: new SlashCommandBuilder()
    .setName('stop')
    .setDescription('Stop music and clear the queue'),
  async execute(interaction) {
    await stopPlayback(interaction);
  },
};
