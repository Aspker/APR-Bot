// utils/musicPlayer.js
import ytdl from 'ytdl-core';
import ytSearch from 'yt-search';
import {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
  getVoiceConnection
} from '@discordjs/voice';

export default {
  async play(interaction, query) {
    const voiceChannel = interaction.member.voice.channel;

    if (!voiceChannel) {
      await interaction.reply('❌ You need to be in a voice channel to play music.');
      return;
    }

    await interaction.deferReply(); // Defer in case fetching takes time

    let video;

    // Check if query is a YouTube URL
    if (ytdl.validateURL(query)) {
      const info = await ytdl.getInfo(query);
      video = { title: info.videoDetails.title, url: info.videoDetails.video_url };
    } else {
      const result = await ytSearch(query);
      video = result.videos.length ? result.videos[0] : null;
    }

    if (!video) {
      await interaction.editReply('❌ No results found.');
      return;
    }

    const stream = ytdl(video.url, {
      filter: 'audioonly',
      highWaterMark: 1 << 25,
    });

    const resource = createAudioResource(stream);
    const player = createAudioPlayer();

    const connection = joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId: voiceChannel.guild.id,
      adapterCreator: voiceChannel.guild.voiceAdapterCreator,
    });

    connection.subscribe(player);
    player.play(resource);

    player.on(AudioPlayerStatus.Idle, () => {
      connection.destroy();
    });

    await interaction.editReply(`🎶 Now playing: **${video.title}**`);
  }
};