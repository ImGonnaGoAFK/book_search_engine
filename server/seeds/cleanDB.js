const models = require('../models');
const db = require('../config/connection');

module.exports = async (modelName, collectionName) => {
  try {
    const modelExists = await models[modelName].db.db.listCollections({ name: collectionName }).toArray();
    if (modelExists.length) {
      await db.dropCollection(collectionName);
      console.log(`${collectionName} collection cleared.`);
    } else {
      console.log(`No collection named ${collectionName} exists.`);
    }
  } catch (err) {
    console.error(`Error clearing ${collectionName}:`, err.message);
    throw err;
  }
};