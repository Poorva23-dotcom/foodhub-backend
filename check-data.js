const mongoose = require('mongoose');
require('dotenv').config();

async function checkData() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB\n');
        
        // Get all collection names
        const collections = await mongoose.connection.db.collections();
        
        for (let collection of collections) {
            const name = collection.collectionName;
            const count = await collection.countDocuments();
            const sample = await collection.findOne();
            
            console.log(`📁 Collection: ${name}`);
            console.log(`   Total records: ${count}`);
            console.log(`   Sample data:`, sample);
            console.log('---\n');
        }
        
        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
    }
}

checkData();