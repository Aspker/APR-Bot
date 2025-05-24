import fs from 'fs/promises';
import path from 'path';

const filePath = path.join(process.cwd(), 'json_sqlite', 'allowData.json');

export async function saveAllowData(guildId, data) {
  let json = {};
  try {
    const content = await fs.readFile(filePath, 'utf8');
    json = JSON.parse(content);
  } catch {
    // file may not exist yet
  }
  json[guildId] = data;
  await fs.writeFile(filePath, JSON.stringify(json, null, 2));
}

export async function getAllowData(guildId) {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    const json = JSON.parse(content);
    return json[guildId] || null;
  } catch {
    return null;
  }
}
