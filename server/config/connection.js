const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
console.log('MongoDB URI:', process.env.MONGODB_URI);
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/googlebooks');

module.exports = mongoose.connection;