import fs from 'fs';

const dbFile = './json_sqlite/db.json';
const backupFile = './json_sqlite/db.backup.json';

let data = {};

function loadDatabase() {
  try {
    if (fs.existsSync(dbFile)) {
      data = JSON.parse(fs.readFileSync(dbFile));
    }
  } catch (error) {
    console.error('Error loading database:', error);
    if (fs.existsSync(backupFile)) {
      console.log('Attempting to restore from backup...');
      data = JSON.parse(fs.readFileSync(backupFile));
    }
  }
}

function saveDatabase() {
  try {
    // Create backup before saving
    if (fs.existsSync(dbFile)) {
      fs.copyFileSync(dbFile, backupFile);
    }
    fs.writeFileSync(dbFile, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error saving database:', error);
  }
}

loadDatabase();

process.on('exit', () => saveDatabase());
process.on('SIGINT', () => {
  saveDatabase();
  process.exit();
});
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  saveDatabase();
});

export default data;
