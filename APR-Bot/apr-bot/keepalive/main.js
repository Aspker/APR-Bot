import '../keepalive/keepalive.js';
import { Client, Collection, GatewayIntentBits, PermissionFlagsBits } from 'discord.js';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';
config();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
});
client.commands = new Collection();
async function loadCommands(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    if (file.isDirectory()) {
      await loadCommands(fullPath);
    } else if (file.name.endsWith('.js')) {
      try {
        const command = await import(fullPath);
        if (command.default?.data && command.default?.execute) {
          if (client.commands.has(command.default.data.name)) {
            console.warn(`⚠️ Duplicate command name detected: ${command.default.data.name}`);
          }
          client.commands.set(command.default.data.name, command.default);
          console.log(`✅ Loaded command: ${command.default.data.name}`);
        }
      } catch (error) {
        console.error(`❌ Failed to load command ${file.name}:`, error);
      }
    }
  }
}
const commandsPath = path.join(__dirname, '../commands');
await loadCommands(commandsPath);
try {
  const allowCommandModule = await import('../commands/misc/allow.js');
  client.commands.set('allow', allowCommandModule.default);
} catch (error) {
  console.error('❌ Failed to load allow command module:', error);
}
const eventsPath = path.join(__dirname, '../events');
const eventFiles = fs.readdirSync(eventsPath).filter(f => f.endsWith('.js'));
for (const file of eventFiles) {
  try {
    const event = await import(`../events/${file}`);
    const evt = event.default;
    if (evt.once) client.once(evt.name, (...args) => evt.execute(...args, client));
    else client.on(evt.name, (...args) => evt.execute(...args, client));
  } catch (error) {
    console.error(`❌ Failed to load event ${file}:`, error);
  }
}
client.on('warn', info => console.log('Warning:', info));
client.on('error', error => console.error('Client error:', error));
process.on('unhandledRejection', error => {
  console.error('Unhandled promise rejection:', error);
});
client.login(process.env.TOKEN).catch(error => {
  console.error('❌ Failed to login:', error);
  process.exit(1);
});
