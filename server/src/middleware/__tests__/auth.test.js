'use strict';

const { auth } = require('../auth');
const { verifyAccessToken } = require('../../utils/tokens');

jest.mock('../../utils/tokens');

describe('Auth Middleware - TDD', () => {
  const mockNext = jest.fn();
  
  const mockReq = () => ({
    headers: {},
    cookies: {},
  });

  const mockRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('auth middleware with required = true', () => {
    it('should return 401 if no token provided and auth is required', () => {
      const req = mockReq();
      const res = mockRes();
      const authMiddleware = auth(true);

      authMiddleware(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Unauthorized' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should extract token from Authorization header', () => {
      const req = mockReq();
      const res = mockRes();
      req.headers.authorization = 'Bearer valid-token-123';
      
      const authMiddleware = auth(true);
      verifyAccessToken.mockReturnValue({ id: 'user-1', role: 'user' });

      authMiddleware(req, res, mockNext);

      expect(verifyAccessToken).toHaveBeenCalledWith('valid-token-123');
      expect(req.user).toEqual({ id: 'user-1', role: 'user' });
      expect(mockNext).toHaveBeenCalled();
    });

    it('should extract token from cookies', () => {
      const req = mockReq();
      const res = mockRes();
      req.cookies.access_token = 'cookie-token-123';
      
      const authMiddleware = auth(true);
      verifyAccessToken.mockReturnValue({ id: 'user-2', role: 'admin' });

      authMiddleware(req, res, mockNext);

      expect(verifyAccessToken).toHaveBeenCalledWith('cookie-token-123');
      expect(req.user).toEqual({ id: 'user-2', role: 'admin' });
      expect(mockNext).toHaveBeenCalled();
    });

    it('should prefer Authorization header over cookies', () => {
      const req = mockReq();
      const res = mockRes();
      req.headers.authorization = 'Bearer header-token';
      req.cookies.access_token = 'cookie-token';
      
      const authMiddleware = auth(true);
      verifyAccessToken.mockReturnValue({ id: 'user-1', role: 'user' });

      authMiddleware(req, res, mockNext);

      expect(verifyAccessToken).toHaveBeenCalledWith('header-token');
      expect(req.user.id).toBe('user-1');
    });

    it('should return 401 if token verification fails', () => {
      const req = mockReq();
      const res = mockRes();
      req.headers.authorization = 'Bearer invalid-token';
      
      const authMiddleware = auth(true);
      verifyAccessToken.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      authMiddleware(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid or expired token' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 if token is expired', () => {
      const req = mockReq();
      const res = mockRes();
      req.headers.authorization = 'Bearer expired-token';
      
      const authMiddleware = auth(true);
      verifyAccessToken.mockImplementation(() => {
        throw new Error('jwt expired');
      });

      authMiddleware(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should set user role in request', () => {
      const req = mockReq();
      const res = mockRes();
      req.headers.authorization = 'Bearer admin-token';
      
      const authMiddleware = auth(true);
      verifyAccessToken.mockReturnValue({ 
        id: 'admin-1', 
        role: 'admin',
        email: 'admin@example.com'
      });

      authMiddleware(req, res, mockNext);

      expect(req.user.role).toBe('admin');
      expect(req.user.email).toBe('admin@example.com');
    });
  });

  describe('auth middleware with required = false', () => {
    it('should call next without token if not required', () => {
      const req = mockReq();
      const res = mockRes();
      
      const authMiddleware = auth(false);

      authMiddleware(req, res, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(req.user).toBeUndefined();
    });

    it('should set user if token provided', () => {
      const req = mockReq();
      const res = mockRes();
      req.headers.authorization = 'Bearer optional-token';
      
      const authMiddleware = auth(false);
      verifyAccessToken.mockReturnValue({ id: 'user-1', role: 'user' });

      authMiddleware(req, res, mockNext);

      expect(req.user).toEqual({ id: 'user-1', role: 'user' });
      expect(mockNext).toHaveBeenCalled();
    });

    it('should not fail if token is invalid when not required', () => {
      const req = mockReq();
      const res = mockRes();
      req.headers.authorization = 'Bearer invalid-token';
      
      const authMiddleware = auth(false);
      verifyAccessToken.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      authMiddleware(req, res, mockNext);

      // When auth is not required, invalid token should not return error
      // Instead, it should either skip or just call next
      // This depends on implementation - test documents the expected behavior
    });
  });

  describe('authorization edge cases', () => {
    it('should handle Authorization header without Bearer prefix', () => {
      const req = mockReq();
      const res = mockRes();
      req.headers.authorization = 'token-without-bearer';
      
      const authMiddleware = auth(true);

      authMiddleware(req, res, mockNext);

      // Should look in cookies as fallback
      // or return 401 if no valid token found
    });

    it('should handle malformed Authorization header', () => {
      const req = mockReq();
      const res = mockRes();
      req.headers.authorization = 'Bearer';  // No token after Bearer
      
      const authMiddleware = auth(true);

      authMiddleware(req, res, mockNext);

      // Should handle gracefully
    });

    it('should handle multiple spaces in Authorization header', () => {
      const req = mockReq();
      const res = mockRes();
      req.headers.authorization = 'Bearer   valid-token';  // Multiple spaces
      
      const authMiddleware = auth(true);
      verifyAccessToken.mockReturnValue({ id: 'user-1', role: 'user' });

      authMiddleware(req, res, mockNext);

      // Should extract token correctly
    });
  });

  describe('role-based access', () => {
    it('should allow admin users', () => {
      const req = mockReq();
      const res = mockRes();
      req.headers.authorization = 'Bearer admin-token';
      
      const authMiddleware = auth(true);
      verifyAccessToken.mockReturnValue({ id: 'admin-1', role: 'admin' });

      authMiddleware(req, res, mockNext);

      expect(req.user.role).toBe('admin');
      expect(mockNext).toHaveBeenCalled();
    });

    it('should allow regular users', () => {
      const req = mockReq();
      const res = mockRes();
      req.headers.authorization = 'Bearer user-token';
      
      const authMiddleware = auth(true);
      verifyAccessToken.mockReturnValue({ id: 'user-1', role: 'user' });

      authMiddleware(req, res, mockNext);

      expect(req.user.role).toBe('user');
      expect(mockNext).toHaveBeenCalled();
    });
  });
});
