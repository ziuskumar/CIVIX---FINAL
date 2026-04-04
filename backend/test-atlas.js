const mongoose = require('mongoose');
require('dotenv').config();

const testAtlasConnection = async () => {
    console.log('--- MongoDB Atlas Connection Test ---');
    console.log('URI from .env:', process.env.MONGO_URI ? 'Present' : 'Missing');

    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ SUCCESS: Connected to MongoDB Atlas');
        
        const dbName = mongoose.connection.name;
        console.log(`📡 Connected to Database: ${dbName}`);
        
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log(`📦 Collections found: ${collections.length}`);
        collections.forEach(c => console.log(`   - ${c.name}`));

        await mongoose.disconnect();
        console.log('🚪 Disconnected cleanly');
        process.exit(0);
    } catch (err) {
        console.error('❌ ERROR: Could not connect to MongoDB Atlas');
        console.error('Details:', err.message);
        process.exit(1);
    }
};

testAtlasConnection();
