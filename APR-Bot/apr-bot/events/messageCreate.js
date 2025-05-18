// events/messageCreate.js
import { addXP } from '../utils/xpManager.js';

export default {
  name: 'messageCreate',
  async execute(message) {
    if (!message.guild || message.author.bot) return;
    addXP(message.author.id);
  }
};
