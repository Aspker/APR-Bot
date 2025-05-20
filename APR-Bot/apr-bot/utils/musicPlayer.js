import {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
  NoSubscriberBehavior,
} from '@discordjs/voice';
import play from 'play-dl';

const queue = new Map();

async function playSong(guildId) {
  const serverQueue = queue.get(guildId);
  if (!serverQueue) return;

  const song = serverQueue.songs[0];
  if (!song) {
    serverQueue.voiceConnection.destroy();
    queue.delete(guildId);
    return;
  }

  try {
    const stream = await play.stream(song.url);
    const resource = createAudioResource(stream.stream, {
      inputType: stream.type,
    });

    serverQueue.audioPlayer.play(resource);

    serverQueue.audioPlayer.once(AudioPlayerStatus.Idle, () => {
      serverQueue.songs.shift();
      playSong(guildId);
    });
  } catch (error) {
    console.error('Error playing song:', error);
    serverQueue.songs.shift();
    playSong(guildId);
  }
}

async function handlePlayCommand(interaction, song) {
  const guildId = interaction.guild.id;
  let serverQueue = queue.get(guildId);

  if (!serverQueue) {
    const voiceChannel = interaction.member.voice.channel;
    if (!voiceChannel) {
      await interaction.reply('You need to be in a voice channel to play music!');
      return;
    }

    const voiceConnection = joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId,
      adapterCreator: interaction.guild.voiceAdapterCreator,
    });

    const audioPlayer = createAudioPlayer({
      behaviors: {
        noSubscriber: NoSubscriberBehavior.Pause,
      },
    });

    voiceConnection.subscribe(audioPlayer);

    serverQueue = {
      voiceConnection,
      audioPlayer,
      songs: [],
    };
    queue.set(guildId, serverQueue);
  }

  serverQueue.songs.push(song);

  if (serverQueue.audioPlayer.state.status !== AudioPlayerStatus.Playing) {
    playSong(guildId);
  }

  await interaction.reply(`🎶 Added **${song.title}** to the queue!`);
}

async function skipSong(interaction) {
  const guildId = interaction.guild.id;
  const serverQueue = queue.get(guildId);
  if (!serverQueue) {
    await interaction.reply('There is no song playing right now!');
    return;
  }

  serverQueue.audioPlayer.stop();
  await interaction.reply('⏭️ Skipped the current song!');
}

async function stopPlayback(interaction) {
  const guildId = interaction.guild.id;
  const serverQueue = queue.get(guildId);
  if (!serverQueue) {
    await interaction.reply('There is no music playing to stop!');
    return;
  }

  serverQueue.songs = [];
  serverQueue.audioPlayer.stop();
  serverQueue.voiceConnection.destroy();
  queue.delete(guildId);

  await interaction.reply('🛑 Stopped playback and cleared the queue.');
}

function getQueue(guildId) {
  return queue.get(guildId);
}

function showQueue(interaction) {
  const serverQueue = queue.get(interaction.guild.id);

  if (!serverQueue || serverQueue.songs.length === 0) {
    return interaction.reply('❌ The queue is currently empty.');
  }

  const songList = serverQueue.songs
    .map((song, index) => `${index + 1}. **${song.title}**`)
    .join('\n');

  return interaction.reply(`📜 **Current Queue:**\n${songList}`);
}

export {
  handlePlayCommand,
  skipSong,
  stopPlayback,
  showQueue,
  getQueue,
};
