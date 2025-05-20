import fs from 'fs';

const dbFile = './json_sqlite/db.json';
const backupDir = './json_sqlite/backups/';
let data = {};

if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

function createBackup() {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = `${backupDir}db.backup.${timestamp}.json`;
    if (fs.existsSync(dbFile)) {
      fs.copyFileSync(dbFile, backupFile);
      
      const backups = fs.readdirSync(backupDir).sort();
      while (backups.length > 5) {
        fs.unlinkSync(backupDir + backups.shift());
      }
    }
  } catch (error) {
    console.error('Error creating backup:', error);
  }
}

function loadDatabase() {
  try {
    if (fs.existsSync(dbFile)) {
      data = JSON.parse(fs.readFileSync(dbFile));
    }
  } catch (error) {
    console.error('Error loading database:', error);
    // Try to restore from latest backup
    const backups = fs.readdirSync(backupDir).sort().reverse();
    if (backups.length > 0) {
      console.log('Attempting to restore from latest backup...');
      data = JSON.parse(fs.readFileSync(backupDir + backups[0]));
    }
  }
}

function saveDatabase() {
  try {
    createBackup();
    fs.writeFileSync(dbFile, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error saving database:', error);
  }
}

setInterval(createBackup, 3600000);

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
