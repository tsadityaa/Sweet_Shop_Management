'use strict';

const { StatusCodes } = require('http-status-codes');
const User = require('../models/User');
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../utils/tokens');
const { env } = require('../lib/env');

function cookieOptions() {
  return {
    httpOnly: true,
    secure: env.COOKIE_SECURE,
    sameSite: env.COOKIE_SAME_SITE,
    domain: env.COOKIE_DOMAIN || undefined,
    path: '/',
  };
}

const register = async (req, res) => {
  const { name, email, password } = req.body;
  
  if (!name || !email || !password) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Missing fields' });
  }

  const exists = await User.findOne({ email });
  if (exists) {
    return res.status(StatusCodes.CONFLICT).json({ message: 'Email already in use' });
  }
  
  const user = await User.create({ name, email, password, role: 'user' });
  
  const accessToken = signAccessToken({ id: user._id, role: user.role });
  
  const refreshToken = signRefreshToken({ id: user._id });
  
  user.refreshToken = refreshToken;
  await user.save();

  res
    .cookie('access_token', accessToken, { ...cookieOptions(), maxAge: 15 * 60 * 1000 })
    .cookie('refresh_token', refreshToken, { ...cookieOptions(), maxAge: 7 * 24 * 60 * 60 * 1000 })
    .status(StatusCodes.CREATED)
    .json({ 
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      token: accessToken 
    });
};

const login = async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Missing fields' });
  }

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Invalid credentials' });
  }

  const bcrypt = require('bcryptjs');
  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Invalid credentials' });
  }

  const accessToken = signAccessToken({ id: user._id, role: user.role });
  
  const refreshToken = signRefreshToken({ id: user._id });
  
  user.refreshToken = refreshToken;
  await user.save();

  const responseData = {
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
    token: accessToken 
  };
  
  res
    .cookie('access_token', accessToken, { ...cookieOptions(), maxAge: 15 * 60 * 1000 })
    .cookie('refresh_token', refreshToken, { ...cookieOptions(), maxAge: 7 * 24 * 60 * 60 * 1000 })
    .json(responseData);
};

const logout = async (req, res) => {
  const refreshToken = req.cookies && req.cookies.refresh_token;
  
  if (refreshToken) {
    const user = await User.findOne({ refreshToken });
    if (user) {
      user.refreshToken = undefined;
      await user.save();
    }
  }
  
  res.clearCookie('access_token');
  res.clearCookie('refresh_token');
  res.json({ message: 'Logged out' });
};

const me = async (req, res) => {
  if (!req.user) {
    return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Unauthorized' });
  }
  
  const user = await User.findById(req.user.id);
  if (!user) {
    return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Unauthorized' });
  }
  
  res.json({ 
    user: { 
      id: user._id, 
      name: user.name, 
      email: user.email, 
      role: user.role 
    } 
  });
};

const refresh = async (req, res) => {
  const token = req.cookies && req.cookies.refresh_token;
  
  if (!token) {
    return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Missing refresh token' });
  }

  try {
    const decoded = verifyRefreshToken(token);
    
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Invalid refresh token' });
    }
    
    if (user.refreshToken !== token) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Invalid refresh token' });
    }
    
    const accessToken = signAccessToken({ id: user._id, role: user.role });
    
    res.cookie('access_token', accessToken, { ...cookieOptions(), maxAge: 15 * 60 * 1000 });
    res.json({ token: accessToken });
  } catch (e) {
    return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Invalid refresh token' });
  }
};

module.exports = { register, login, logout, me, refresh };

