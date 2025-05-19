import {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  entersState,
  AudioPlayerStatus,
  VoiceConnectionStatus,
} from '@discordjs/voice';
import ytdl from 'ytdl-core';
import ytSearch from 'yt-search';

const queues = new Map();

function getQueue(guildId) {
  if (!queues.has(guildId)) {
    queues.set(guildId, {
      songs: [],
      connection: null,
      player: createAudioPlayer(),
    });
  }
  return queues.get(guildId);
}

async function playNext(guildId) {
  const queue = getQueue(guildId);
  const song = queue.songs[0];
  if (!song) {
    queue.connection?.destroy();
    queues.delete(guildId);
    return;
  }

  const stream = ytdl(song.url, { filter: 'audioonly', highWaterMark: 1 << 25 });
  const resource = createAudioResource(stream);

  queue.player.play(resource);
  queue.connection.subscribe(queue.player);

  queue.player.once(AudioPlayerStatus.Idle, () => {
    queue.songs.shift();
    playNext(guildId);
  });
}

export default {
  async play(interaction, query) {
    const member = interaction.member;
    const voiceChannel = member.voice.channel;
    if (!voiceChannel) {
      return interaction.reply({ content: '❌ You must be in a voice channel!', ephemeral: true });
    }

    const searchResult = await ytSearch(query);
    const video = searchResult.videos.length ? searchResult.videos[0] : null;

    if (!video) {
      return interaction.reply({ content: '❌ No results found.', ephemeral: true });
    }

    const song = {
      title: video.title,
      url: video.url,
    };

    const queue = getQueue(interaction.guildId);
    queue.songs.push(song);

    if (!queue.connection) {
      const connection = joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: voiceChannel.guild.id,
        adapterCreator: voiceChannel.guild.voiceAdapterCreator,
      });

      queue.connection = connection;
      connection.subscribe(queue.player);

      try {
        await entersState(connection, VoiceConnectionStatus.Ready, 30_000);
        await interaction.reply(`🎶 Now playing: **${song.title}**`);
        playNext(interaction.guildId);
      } catch (error) {
        console.error(error);
        queues.delete(interaction.guildId);
        return interaction.reply({ content: '❌ Failed to connect to voice channel.', ephemeral: true });
      }
    } else {
      await interaction.reply(`🎵 Added to queue: **${song.title}**`);
    }
  },

  async stop(interaction) {
    const queue = queues.get(interaction.guildId);
    if (!queue) return interaction.reply('❌ No music is playing.');

    queue.player.stop();
    queue.connection.destroy();
    queues.delete(interaction.guildId);
    await interaction.reply('🛑 Music stopped and queue cleared.');
  },

  async skip(interaction) {
    const queue = queues.get(interaction.guildId);
    if (!queue || queue.songs.length < 2) {
      return interaction.reply('❌ No song to skip to.');
    }

    queue.player.stop(); // Automatically triggers next song
    await interaction.reply('⏭️ Skipped to the next song.');
  },

  async showQueue(interaction) {
    const queue = queues.get(interaction.guildId);
    if (!queue || queue.songs.length === 0) {
      return interaction.reply('📭 The queue is empty.');
    }

    const list = queue.songs
      .map((song, index) => `${index === 0 ? '▶️' : `${index + 1}.`} ${song.title}`)
      .join('\n');

    await interaction.reply(`🎵 Current Queue:\n${list}`);
  }
};