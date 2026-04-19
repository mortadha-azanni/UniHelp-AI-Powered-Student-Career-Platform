// Script to directly test the AI roadmap generation API endpoint
// This simulates what the frontend does
import fetch from 'node-fetch';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from './models/User.js';

dotenv.config();

async function testGenerateEndpoint() {
    try {
        // Connect to DB to get a real user
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to DB');

        // Find any user
        const user = await User.findOne({});
        if (!user) {
            console.error('❌ No users found in DB. Please create a user first.');
            process.exit(1);
        }
        console.log(`✅ Found user: ${user.email}`);

        // Create a valid JWT
        const token = jwt.sign(
            { id: user._id, email: user.email },
            process.env.JWT_ACCESS_SECRET,
            { expiresIn: '1h' }
        );
        console.log('✅ Created JWT token');

        // Make the API call
        console.log('🚀 Calling /api/roadmaps/generate ...');
        const response = await fetch('http://localhost:5000/api/roadmaps/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ goal: 'Learn Node.js backend development' })
        });

        const data = await response.json();
        console.log('📡 Response status:', response.status);

        if (response.ok) {
            console.log('✅ SUCCESS! Roadmap created:', data.data?.title);
            console.log('Nodes:', data.data?.nodes?.length);
        } else {
            console.error('❌ FAILED! Error:', JSON.stringify(data, null, 2));
        }

        await mongoose.disconnect();
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        process.exit(1);
    }
}

testGenerateEndpoint();
