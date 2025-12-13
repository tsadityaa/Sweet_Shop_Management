'use strict';

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) dotenv.config({ path: envPath }); else dotenv.config();

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('❌ MONGO_URI is not set in .env file!');
  process.exit(1);
}

const User = require('./models/User');
const Sweet = require('./models/Sweet');

const authRoutes = require('./routes/auth.routes');
const sweetsRoutes = require('./routes/sweets.routes');

const { auth } = require('./middleware/auth');

mongoose.set('strictQuery', true);
mongoose.connect(MONGO_URI, { 
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 30000,
}).then(async () => {
  // Ensure admin user exists and always update password
  try {
    const adminEmail = 't.s.aditya35@gmail.com';
    const adminPassword = 'Aditya@369';
    const adminName = 'Admin';
    // Always update admin user password and details
    let admin = await User.findOne({ email: adminEmail });
    if (!admin) {
      admin = await User.create({
        name: adminName,
        email: adminEmail,
        password: adminPassword, // assign plain password, let Mongoose hash it
        role: 'admin',
      });
    } else {
      admin.password = adminPassword; // assign plain password, let Mongoose hash it
      admin.name = adminName;
      admin.role = 'admin';
      await admin.save();
    }
  } catch (err) {
    console.error('⚠️ Error with admin user:', err.message);
  }
}).catch((e) => {
  console.error('❌ MongoDB connection failed:', e.message);
  process.exit(1);
});

const app = express();

app.use(cors({
  origin: (origin, callback) => callback(null, true),
  credentials: true,
}));
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/sweets', sweetsRoutes);

app.use((req, res) => {
  res.status(404).json({ message: 'Not Found' });
});

app.use((err, req, res, next) => {
  console.error('❌ Error:', err);
  res.status(500).json({ message: 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server listening on http://localhost:${PORT}`);
});

module.exports = app;
