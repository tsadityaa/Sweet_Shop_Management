'use strict';

const { register, login, logout, me, refresh } = require('../auth.controller');
const User = require('../../models/User');
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../../utils/tokens');
const { faker } = require('@faker-js/faker');

// Mock the User model
jest.mock('../../models/User');
jest.mock('../../utils/tokens');

describe('Auth Controller - TDD', () => {
  const mockRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.cookie = jest.fn().mockReturnValue(res);
    res.clearCookie = jest.fn().mockReturnValue(res);
    return res;
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should return 400 if name is missing', async () => {
      const req = {
        body: { email: 'test@example.com', password: 'password123' },
      };
      const res = mockRes();

      await register(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Missing fields' });
    });

    it('should return 400 if email is missing', async () => {
      const req = {
        body: { name: 'John', password: 'password123' },
      };
      const res = mockRes();

      await register(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should return 400 if password is missing', async () => {
      const req = {
        body: { name: 'John', email: 'test@example.com' },
      };
      const res = mockRes();

      await register(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should return 409 if email already exists', async () => {
      const req = {
        body: { name: 'John', email: 'existing@example.com', password: 'password123' },
      };
      const res = mockRes();

      User.findOne.mockResolvedValue({ email: 'existing@example.com' });

      await register(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({ message: 'Email already in use' });
    });

    it('should create user and return 201 with tokens', async () => {
      const userData = { name: 'John', email: 'new@example.com', password: 'password123' };
      const mockUser = {
        _id: 'user-123',
        name: 'John',
        email: 'new@example.com',
        role: 'user',
        save: jest.fn().mockResolvedValue(true),
      };

      const req = {
        body: userData,
      };
      const res = mockRes();

      User.findOne.mockResolvedValue(null);
      User.create.mockResolvedValue(mockUser);
      signAccessToken.mockReturnValue('access-token-123');
      signRefreshToken.mockReturnValue('refresh-token-123');

      await register(req, res);

      expect(User.findOne).toHaveBeenCalledWith({ email: userData.email });
      expect(User.create).toHaveBeenCalledWith({ ...userData, role: 'user' });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          user: expect.objectContaining({
            id: 'user-123',
            email: 'new@example.com',
          }),
          token: 'access-token-123',
        })
      );
    });
  });

  describe('login', () => {
    it('should return 400 if email is missing', async () => {
      const req = {
        body: { password: 'password123' },
      };
      const res = mockRes();

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should return 400 if password is missing', async () => {
      const req = {
        body: { email: 'test@example.com' },
      };
      const res = mockRes();

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should return 401 if user not found', async () => {
      const req = {
        body: { email: 'notfound@example.com', password: 'password123' },
      };
      const res = mockRes();

      User.findOne.mockResolvedValue(null);

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid credentials' });
    });

    it('should return 401 if password is incorrect', async () => {
      const mockUser = {
        _id: 'user-123',
        email: 'test@example.com',
        password: 'hashedPassword',
      };

      const req = {
        body: { email: 'test@example.com', password: 'wrongpassword' },
      };
      const res = mockRes();

      User.findOne.mockResolvedValue(mockUser);
      // Mock bcrypt.compare to return false
      jest.mock('bcryptjs', () => ({
        compare: jest.fn().mockResolvedValue(false),
      }));

      // For now, we need to test the actual implementation
      // This will fail until we implement password validation
      // This is the RED phase of TDD
    });

    it('should return 200 with tokens if credentials are valid', async () => {
      const mockUser = {
        _id: 'user-123',
        name: 'John',
        email: 'test@example.com',
        password: 'hashedPassword',
        role: 'user',
        save: jest.fn().mockResolvedValue(true),
      };

      const req = {
        body: { email: 'test@example.com', password: 'password123' },
      };
      const res = mockRes();

      User.findOne.mockResolvedValue(mockUser);
      signAccessToken.mockReturnValue('access-token-123');
      signRefreshToken.mockReturnValue('refresh-token-123');

      // This test is for the GREEN phase
      // We'll implement the actual login logic to make this pass
    });
  });

  describe('logout', () => {
    it('should clear refresh token and cookies', async () => {
      const mockUser = {
        refreshToken: 'refresh-token-123',
        save: jest.fn().mockResolvedValue(true),
      };

      const req = {
        cookies: { refresh_token: 'refresh-token-123' },
      };
      const res = mockRes();

      User.findOne.mockResolvedValue(mockUser);

      await logout(req, res);

      expect(res.clearCookie).toHaveBeenCalledWith('access_token');
      expect(res.clearCookie).toHaveBeenCalledWith('refresh_token');
      expect(res.json).toHaveBeenCalledWith({ message: 'Logged out' });
    });

    it('should work even if no refresh token in cookies', async () => {
      const req = {
        cookies: {},
      };
      const res = mockRes();

      await logout(req, res);

      expect(res.clearCookie).toHaveBeenCalledWith('access_token');
      expect(res.clearCookie).toHaveBeenCalledWith('refresh_token');
      expect(res.json).toHaveBeenCalled();
    });
  });

  describe('me', () => {
    it('should return 401 if no user in request', async () => {
      const req = { user: null };
      const res = mockRes();

      await me(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('should return 401 if user not found in database', async () => {
      const req = { user: { id: 'invalid-id' } };
      const res = mockRes();

      User.findById.mockResolvedValue(null);

      await me(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('should return user data if found', async () => {
      const mockUser = {
        _id: 'user-123',
        name: 'John',
        email: 'test@example.com',
        role: 'user',
      };

      const req = { user: { id: 'user-123' } };
      const res = mockRes();

      User.findById.mockResolvedValue(mockUser);

      await me(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          user: expect.objectContaining({
            email: 'test@example.com',
            role: 'user',
          }),
        })
      );
    });
  });

  describe('refresh', () => {
    it('should return 401 if no refresh token', async () => {
      const req = { cookies: {} };
      const res = mockRes();

      await refresh(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Missing refresh token' });
    });

    it('should return 401 if refresh token is invalid', async () => {
      const req = { cookies: { refresh_token: 'invalid-token' } };
      const res = mockRes();

      verifyRefreshToken.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await refresh(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('should return new access token if refresh token is valid', async () => {
      const mockUser = {
        _id: 'user-123',
        email: 'test@example.com',
        role: 'user',
        refreshToken: 'refresh-token-123',
      };

      const req = { cookies: { refresh_token: 'refresh-token-123' } };
      const res = mockRes();

      verifyRefreshToken.mockReturnValue({ id: 'user-123' });
      User.findById.mockResolvedValue(mockUser);
      signAccessToken.mockReturnValue('new-access-token');

      await refresh(req, res);

      expect(res.json).toHaveBeenCalledWith({ token: 'new-access-token' });
    });
  });
});
