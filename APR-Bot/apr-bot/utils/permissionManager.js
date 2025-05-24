import fs from 'fs/promises';
import path from 'path';
const folderPath = path.join(process.cwd(), 'json_sqlite');
const filePath = path.join(folderPath, 'allowData.json');
export async function saveAllowData(guildId, data) {
  let json = {};
  try {
    await fs.mkdir(folderPath, { recursive: true });
  } catch (err) {
    console.error('Failed to create json_sqlite folder:', err);
  }
  try {
    const content = await fs.readFile(filePath, 'utf8');
    json = JSON.parse(content);
  } catch {
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
