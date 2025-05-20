import fs from 'fs';
const dbFile = './json_sqlite/db.json';

let data = {};
if (fs.existsSync(dbFile)) {
  data = JSON.parse(fs.readFileSync(dbFile));
}

process.on('exit', () => fs.writeFileSync(dbFile, JSON.stringify(data, null, 2)));
process.on('SIGINT', () => {
  fs.writeFileSync(dbFile, JSON.stringify(data, null, 2));
  process.exit();
});

export default data;
