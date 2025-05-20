import '../keepalive/keepalive.js';
import { Client, Collection, GatewayIntentBits, REST, Routes } from 'discord.js';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';

config();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});
client.commands = new Collection();

const foldersPath = path.join(__dirname, '../commands');

async function loadCommands(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });

  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    if (file.isDirectory()) {
      await loadCommands(fullPath); 
    } else if (file.name.endsWith('.js')) {
      const command = await import(fullPath);
      if (command.default?.data && command.default?.execute) {
        client.commands.set(command.default.data.name, command.default);
      }
    }
  }
}

await loadCommands(foldersPath);

const commands = Array.from(client.commands.values()).map(command => command.data.toJSON());
const rest = new REST().setToken(process.env.TOKEN);

try {
  console.log('Started refreshing application (/) commands.');
  await rest.put(
    Routes.applicationCommands(process.env.CLIENT_ID),
    { body: commands },
  );
  console.log('Successfully reloaded application (/) commands.');
} catch (error) {
  console.error(error);
}

const eventsPath = path.join(__dirname, '../events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));
for (const file of eventFiles) {
  const event = await import(`../events/${file}`);
  const evt = event.default;
  if (evt.once) client.once(evt.name, (...args) => evt.execute(...args));
  else client.on(evt.name, (...args) => evt.execute(...args));
}

client.login(process.env.TOKEN);
