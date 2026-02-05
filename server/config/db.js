const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        let uri = process.env.MONGO_URI || 'mongodb://localhost:27017/service-marketplace';

        if (process.env.USE_MEMORY_DB === 'true') {
            const { MongoMemoryServer } = require('mongodb-memory-server');
            const mongod = await MongoMemoryServer.create();
            uri = mongod.getUri();
            console.log(`Using In-Memory MongoDB at ${uri}`);
        }

        const conn = await mongoose.connect(uri);

        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
