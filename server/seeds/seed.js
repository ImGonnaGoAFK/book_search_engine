const db = require('../config/connection');
const cleanDB = require('./cleanDB');

db.once('open', async () => {
  try {
    await cleanDB('googlebooks', 'Users');
    console.log('Database cleared');
  } catch (error) {
    console.error('Failed to clear database:', error);
  } finally {
    process.exit(0);
  }
});
