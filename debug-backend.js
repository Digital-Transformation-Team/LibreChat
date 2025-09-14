// Debug version of backend startup to identify where it fails
require('dotenv').config();

console.log('🔍 DEBUG: Starting backend debug analysis...');
console.log('🔍 DEBUG: Current working directory:', process.cwd());

// Check environment variables
console.log('🔍 DEBUG: Environment variables:');
console.log('  - NODE_ENV:', process.env.NODE_ENV);
console.log('  - MONGO_URI:', process.env.MONGO_URI);
console.log('  - PORT:', process.env.PORT);
console.log('  - HOST:', process.env.HOST);

try {
  console.log('🔍 DEBUG: Loading required modules...');
  
  const mongoose = require('mongoose');
  console.log('✅ DEBUG: Mongoose loaded successfully');
  
  const express = require('express');
  console.log('✅ DEBUG: Express loaded successfully');
  
  // Test MongoDB connection string parsing
  const MONGO_URI = process.env.MONGO_URI;
  console.log('🔍 DEBUG: MONGO_URI value:', JSON.stringify(MONGO_URI));
  console.log('🔍 DEBUG: MONGO_URI length:', MONGO_URI?.length);
  console.log('🔍 DEBUG: MONGO_URI type:', typeof MONGO_URI);
  
  if (!MONGO_URI) {
    throw new Error('❌ DEBUG: MONGO_URI is not defined');
  }
  
  // Test URL parsing
  console.log('🔍 DEBUG: Testing URL parsing...');
  try {
    const url = new URL(MONGO_URI);
    console.log('✅ DEBUG: URL parsing successful:', {
      protocol: url.protocol,
      hostname: url.hostname,
      port: url.port,
      pathname: url.pathname
    });
  } catch (urlError) {
    console.log('❌ DEBUG: URL parsing failed:', urlError.message);
    console.log('🔍 DEBUG: Raw MONGO_URI bytes:', Array.from(Buffer.from(MONGO_URI || '')).map(b => b.toString(16)));
  }
  
  // Test MongoDB connection
  console.log('🔍 DEBUG: Testing MongoDB connection...');
  
  mongoose.connection.on('connecting', () => {
    console.log('🔍 DEBUG: MongoDB connecting...');
  });
  
  mongoose.connection.on('connected', () => {
    console.log('✅ DEBUG: MongoDB connected successfully');
  });
  
  mongoose.connection.on('error', (err) => {
    console.log('❌ DEBUG: MongoDB connection error:', err);
  });
  
  mongoose.connection.on('disconnected', () => {
    console.log('🔍 DEBUG: MongoDB disconnected');
  });
  
  // Attempt connection
  const connectStart = Date.now();
  mongoose.connect(MONGO_URI, {
    bufferCommands: false,
    serverSelectionTimeoutMS: 5000, // 5 second timeout for quick feedback
  }).then(() => {
    const connectTime = Date.now() - connectStart;
    console.log(`✅ DEBUG: MongoDB connection successful in ${connectTime}ms`);
    
    // Test creating express app
    console.log('🔍 DEBUG: Creating Express app...');
    const app = express();
    console.log('✅ DEBUG: Express app created successfully');
    
    // Test starting server
    console.log('🔍 DEBUG: Starting server on port 3090...');
    const server = app.listen(3090, () => {
      console.log('✅ DEBUG: Server started successfully on port 3090');
      console.log('🎉 DEBUG: All checks passed! Backend should work now.');
      
      // Graceful shutdown
      setTimeout(() => {
        console.log('🔍 DEBUG: Shutting down test server...');
        server.close();
        mongoose.connection.close();
        process.exit(0);
      }, 2000);
    });
    
    server.on('error', (err) => {
      console.log('❌ DEBUG: Server error:', err);
    });
    
  }).catch((err) => {
    const connectTime = Date.now() - connectStart;
    console.log(`❌ DEBUG: MongoDB connection failed after ${connectTime}ms:`, err);
  });
  
} catch (error) {
  console.log('❌ DEBUG: Fatal error during startup:', error);
  console.log('❌ DEBUG: Error stack:', error.stack);
}

// Handle uncaught errors
process.on('uncaughtException', (err) => {
  console.log('❌ DEBUG: Uncaught exception:', err);
  console.log('❌ DEBUG: Error stack:', err.stack);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.log('❌ DEBUG: Unhandled rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

