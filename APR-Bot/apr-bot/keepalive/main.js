import 'dotenv/config';
import express from 'express';
import { Client, GatewayIntentBits, Collection } from 'discord.js';
import { token } from '../config/config.js';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

app.get('/', (req, res) => {
  res.send('Bot is alive!');
});

app.listen(3000, () => {
  console.log('Keepalive server running on port 3000');
});

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.MessageContent,
  ],
});

client.commands = new Collection();

// Load commands
const commandsPath = path.join(__dirname, '../commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = await import(filePath);
  // Register the command with its name from named export `data`
  client.commands.set(command.data.name, command);
}

// Load events
const eventsPath = path.join(__dirname, '../events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
  const filePath = path.join(eventsPath, file);
  const event = await import(filePath);
  const eventData = event.default;
  if (eventData.once) {
    client.once(eventData.name, (...args) => eventData.execute(...args, client));
  } else {
    client.on(eventData.name, (...args) => eventData.execute(...args, client));
  }
}

client.login(token);
