const mongoose = require('mongoose');
require('dotenv').config();  // Make sure this is at the top if it’s the entry file

const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/googlebooks';

mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    tls: true, // Enables TLS
    tlsCAFile: '/path/to/ca-certificate.crt' // Path to CA certificate file if you need to specify it
});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB using Mongoose');
});

module.exports = db;
