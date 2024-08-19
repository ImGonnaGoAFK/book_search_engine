const db = require('../config/connection');
const cleanDB = require('./cleanDB');


db.once('open', async () => {
  await cleanDB('User', 'Users');
  console.log('db cleared')
  process.exit(0);
  
});
