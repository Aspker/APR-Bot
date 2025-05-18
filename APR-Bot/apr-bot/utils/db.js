import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import path from 'path';
import { fileURLToPath } from 'url';

// Setup __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to db.json
const file = path.join(__dirname, '../json_sqlite/db.json');

// Use JSON file adapter for Lowdb
const adapter = new JSONFile(file);

// Provide default data as second argument to Low constructor
const defaultData = { users: [] };

const db = new Low(adapter, defaultData);

async function initDB() {
  await db.read();

  // If db.json is empty, initialize with default data
  if (!db.data) {
    db.data = defaultData;
  }

  await db.write();
}

await initDB();

export default db;
