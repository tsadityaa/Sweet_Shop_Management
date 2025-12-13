#!/usr/bin/env node
'use strict';

const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Load environment variables
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  dotenv.config();
}

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('❌ MONGO_URI is not set in .env file!');
  process.exit(1);
}

async function setupDatabase() {
  try {
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 15000,
    });
    console.log('✅ Connected to MongoDB');

    const userSchema = new mongoose.Schema({
      name: { type: String, required: true },
      email: { type: String, required: true, unique: true, lowercase: true, index: true },
      password: { type: String, required: true },
      role: { type: String, enum: ['user', 'admin'], default: 'user' },
      refreshToken: { type: String },
    }, { timestamps: true });

    userSchema.pre('save', async function (next) {
      if (!this.isModified('password')) return next();
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
      next();
    });

    const User = mongoose.model('User', userSchema);

    const sweetSchema = new mongoose.Schema({
      name: { type: String, required: true, unique: true },
      description: { type: String },
      price: { type: Number, required: true, min: 0 },
      stock: { type: Number, default: 0 },
      imageUrl: { type: String },
      category: { type: String },
      createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    }, { timestamps: true });

    const Sweet = mongoose.model('Sweet', sweetSchema);

    // Create or update admin user
    const adminEmail = 't.s.aditya35@gmail.com';
    const adminPassword = 'Aditya@369';
    const adminName = 'Aditya';

    console.log('\n📝 Setting up admin user...');
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) {
      console.log('   ℹ️  Admin user already exists');
    } else {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(adminPassword, salt);
      
      await User.create({
        name: adminName,
        email: adminEmail,
        password: hashedPassword,
        role: 'admin',
      });
      
      console.log('   ✅ Admin user created successfully!');
    }

    console.log('\n   📋 Admin Details:');
    console.log(`      Email: ${adminEmail}`);
    console.log(`      Name: ${adminName}`);
    console.log(`      Role: admin`);
    console.log('\n   🔐 Login Credentials:');
    console.log(`      Email: ${adminEmail}`);
    console.log(`      Password: ${adminPassword}`);

    await mongoose.connection.close();
    console.log('\n✅ Database setup completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

setupDatabase();
