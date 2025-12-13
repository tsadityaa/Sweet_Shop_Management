'use strict';

const { list, create, getById, update, remove, purchase, restock, search } = require('../sweets.controller');
const Sweet = require('../../models/Sweet');
const { StatusCodes } = require('http-status-codes');
const { faker } = require('@faker-js/faker');

jest.mock('../../models/Sweet');

describe('Sweets Controller - TDD', () => {
  const mockRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  };

  const mockSweet = {
    _id: 'sweet-123',
    name: 'Chocolate Bar',
    category: 'chocolate',
    price: 5.99,
    stock: 100,
    description: 'Delicious chocolate',
    imageUrl: 'http://example.com/image.jpg',
    toString: () => 'sweet-123',
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should return empty array when no sweets exist', async () => {
      const req = {};
      const res = mockRes();

      Sweet.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue([]),
      });

      await list(req, res);

      expect(res.json).toHaveBeenCalledWith([]);
    });

    it('should return all sweets sorted by creation date', async () => {
      const req = {};
      const res = mockRes();

      const mockSweets = [
        { ...mockSweet, _id: 'sweet-1' },
        { ...mockSweet, _id: 'sweet-2' },
      ];

      Sweet.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockSweets),
      });

      await list(req, res);

      expect(Sweet.find).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(expect.arrayContaining([
        expect.objectContaining({ name: 'Chocolate Bar' }),
      ]));
    });

    it('should handle database errors gracefully', async () => {
      const req = {};
      const res = mockRes();

      Sweet.find.mockReturnValue({
        sort: jest.fn().mockRejectedValue(new Error('DB Error')),
      });

      await list(req, res);

      expect(res.status).toHaveBeenCalledWith(StatusCodes.INTERNAL_SERVER_ERROR);
    });
  });

  describe('create', () => {
    it('should return 400 if name is missing', async () => {
      const req = {
        body: { price: 5.99, stock: 100, category: 'chocolate' },
        user: { role: 'admin' },
      };
      const res = mockRes();

      await create(req, res);

      expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith({
        message: 'name, price, stock, and category are required',
      });
    });

    it('should return 400 if price is missing', async () => {
      const req = {
        body: { name: 'Candy', stock: 100, category: 'candy' },
        user: { role: 'admin' },
      };
      const res = mockRes();

      await create(req, res);

      expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
    });

    it('should return 400 if stock is missing', async () => {
      const req = {
        body: { name: 'Candy', price: 2.99, category: 'candy' },
        user: { role: 'admin' },
      };
      const res = mockRes();

      await create(req, res);

      expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
    });

    it('should return 400 if category is missing', async () => {
      const req = {
        body: { name: 'Candy', price: 2.99, stock: 50 },
        user: { role: 'admin' },
      };
      const res = mockRes();

      await create(req, res);

      expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
    });

    it('should return 403 if user is not admin', async () => {
      const req = {
        body: { name: 'Candy', price: 2.99, stock: 50, category: 'candy' },
        user: { role: 'user' },
      };
      const res = mockRes();

      await create(req, res);

      expect(res.status).toHaveBeenCalledWith(StatusCodes.FORBIDDEN);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Only admins can create sweets',
      });
    });

    it('should return 409 if sweet already exists', async () => {
      const req = {
        body: { name: 'Existing Candy', price: 2.99, stock: 50, category: 'candy' },
        user: { role: 'admin' },
      };
      const res = mockRes();

      Sweet.findOne.mockResolvedValue({ name: 'Existing Candy' });

      await create(req, res);

      expect(res.status).toHaveBeenCalledWith(StatusCodes.CONFLICT);
      expect(res.json).toHaveBeenCalledWith({ message: 'Sweet already exists' });
    });

    it('should create sweet and return 201', async () => {
      const sweetData = {
        name: 'New Candy',
        price: 2.99,
        stock: 50,
        category: 'candy',
        description: 'New sweet candy',
        imageUrl: 'http://example.com/candy.jpg',
      };

      const req = {
        body: sweetData,
        user: { role: 'admin' },
      };
      const res = mockRes();

      Sweet.findOne.mockResolvedValue(null);
      Sweet.create.mockResolvedValue({
        _id: 'sweet-new',
        ...sweetData,
      });

      await create(req, res);

      expect(Sweet.create).toHaveBeenCalledWith(expect.objectContaining(sweetData));
      expect(res.status).toHaveBeenCalledWith(StatusCodes.CREATED);
    });
  });

  describe('getById', () => {
    it('should return 404 if sweet not found', async () => {
      const req = { params: { id: 'invalid-id' } };
      const res = mockRes();

      Sweet.findById.mockResolvedValue(null);

      await getById(req, res);

      expect(res.status).toHaveBeenCalledWith(StatusCodes.NOT_FOUND);
    });

    it('should return sweet data if found', async () => {
      const req = { params: { id: 'sweet-123' } };
      const res = mockRes();

      Sweet.findById.mockResolvedValue(mockSweet);

      await getById(req, res);

      expect(Sweet.findById).toHaveBeenCalledWith('sweet-123');
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        name: 'Chocolate Bar',
        price: 5.99,
      }));
    });
  });

  describe('update', () => {
    it('should return 403 if user is not admin', async () => {
      const req = {
        params: { id: 'sweet-123' },
        body: { price: 7.99 },
        user: { role: 'user' },
      };
      const res = mockRes();

      await update(req, res);

      expect(res.status).toHaveBeenCalledWith(StatusCodes.FORBIDDEN);
    });

    it('should return 404 if sweet not found', async () => {
      const req = {
        params: { id: 'invalid-id' },
        body: { price: 7.99 },
        user: { role: 'admin' },
      };
      const res = mockRes();

      Sweet.findByIdAndUpdate.mockResolvedValue(null);

      await update(req, res);

      expect(res.status).toHaveBeenCalledWith(StatusCodes.NOT_FOUND);
    });

    it('should update sweet and return updated data', async () => {
      const req = {
        params: { id: 'sweet-123' },
        body: { price: 7.99, stock: 80 },
        user: { role: 'admin' },
      };
      const res = mockRes();

      Sweet.findByIdAndUpdate.mockResolvedValue({
        ...mockSweet,
        price: 7.99,
        stock: 80,
      });

      await update(req, res);

      expect(Sweet.findByIdAndUpdate).toHaveBeenCalledWith(
        'sweet-123',
        { $set: req.body },
        { new: true }
      );
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        price: 7.99,
        stock: 80,
      }));
    });
  });

  describe('remove', () => {
    it('should return 403 if user is not admin', async () => {
      const req = {
        params: { id: 'sweet-123' },
        user: { role: 'user' },
      };
      const res = mockRes();

      await remove(req, res);

      expect(res.status).toHaveBeenCalledWith(StatusCodes.FORBIDDEN);
    });

    it('should return 404 if sweet not found', async () => {
      const req = {
        params: { id: 'invalid-id' },
        user: { role: 'admin' },
      };
      const res = mockRes();

      Sweet.findByIdAndDelete.mockResolvedValue(null);

      await remove(req, res);

      expect(res.status).toHaveBeenCalledWith(StatusCodes.NOT_FOUND);
    });

    it('should delete sweet and return success message', async () => {
      const req = {
        params: { id: 'sweet-123' },
        user: { role: 'admin' },
      };
      const res = mockRes();

      Sweet.findByIdAndDelete.mockResolvedValue(mockSweet);

      await remove(req, res);

      expect(Sweet.findByIdAndDelete).toHaveBeenCalledWith('sweet-123');
      expect(res.json).toHaveBeenCalledWith({ message: 'Deleted' });
    });
  });

  describe('purchase', () => {
    it('should return 400 if quantity is invalid', async () => {
      const req = {
        params: { id: 'sweet-123' },
        body: { quantity: 0 },
        user: { id: 'user-123' },
      };
      const res = mockRes();

      await purchase(req, res);

      expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid quantity' });
    });

    it('should return 404 if sweet not found', async () => {
      const req = {
        params: { id: 'invalid-id' },
        body: { quantity: 5 },
        user: { id: 'user-123' },
      };
      const res = mockRes();

      Sweet.findById.mockResolvedValue(null);

      await purchase(req, res);

      expect(res.status).toHaveBeenCalledWith(StatusCodes.NOT_FOUND);
    });

    it('should return 400 if insufficient stock', async () => {
      const req = {
        params: { id: 'sweet-123' },
        body: { quantity: 150 },
        user: { id: 'user-123' },
      };
      const res = mockRes();

      Sweet.findById.mockResolvedValue({
        ...mockSweet,
        stock: 100,
        save: jest.fn(),
      });

      await purchase(req, res);

      expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith({ message: 'Insufficient stock' });
    });

    it('should process purchase and reduce stock', async () => {
      const req = {
        params: { id: 'sweet-123' },
        body: { quantity: 10 },
        user: { id: 'user-123' },
      };
      const res = mockRes();

      const mockSweetWithSave = {
        ...mockSweet,
        stock: 100,
        save: jest.fn().mockResolvedValue(true),
      };

      Sweet.findById.mockResolvedValue(mockSweetWithSave);

      await purchase(req, res);

      expect(mockSweetWithSave.stock).toBe(90);
      expect(mockSweetWithSave.save).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        stock: 90,
      }));
    });
  });

  describe('restock', () => {
    it('should return 403 if user is not admin', async () => {
      const req = {
        params: { id: 'sweet-123' },
        body: { quantity: 10 },
        user: { role: 'user' },
      };
      const res = mockRes();

      await restock(req, res);

      expect(res.status).toHaveBeenCalledWith(StatusCodes.FORBIDDEN);
    });

    it('should return 400 if quantity is invalid', async () => {
      const req = {
        params: { id: 'sweet-123' },
        body: { quantity: -5 },
        user: { role: 'admin' },
      };
      const res = mockRes();

      await restock(req, res);

      expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
    });

    it('should return 404 if sweet not found', async () => {
      const req = {
        params: { id: 'invalid-id' },
        body: { quantity: 10 },
        user: { role: 'admin' },
      };
      const res = mockRes();

      Sweet.findById.mockResolvedValue(null);

      await restock(req, res);

      expect(res.status).toHaveBeenCalledWith(StatusCodes.NOT_FOUND);
    });

    it('should increase stock and return updated sweet', async () => {
      const req = {
        params: { id: 'sweet-123' },
        body: { quantity: 50 },
        user: { role: 'admin' },
      };
      const res = mockRes();

      const mockSweetWithSave = {
        ...mockSweet,
        stock: 100,
        save: jest.fn().mockResolvedValue(true),
      };

      Sweet.findById.mockResolvedValue(mockSweetWithSave);

      await restock(req, res);

      expect(mockSweetWithSave.stock).toBe(150);
      expect(mockSweetWithSave.save).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        stock: 150,
      }));
    });
  });

  describe('search', () => {
    it('should return all sweets when no search params', async () => {
      const req = { query: {} };
      const res = mockRes();

      Sweet.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue([mockSweet]),
      });

      await search(req, res);

      expect(res.json).toHaveBeenCalledWith(expect.any(Array));
    });

    it('should filter by name query', async () => {
      const req = { query: { query: 'Chocolate' } };
      const res = mockRes();

      Sweet.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue([mockSweet]),
      });

      await search(req, res);

      const callArg = Sweet.find.mock.calls[0][0];
      expect(callArg.$or).toBeDefined();
    });

    it('should filter by category', async () => {
      const req = { query: { category: 'chocolate' } };
      const res = mockRes();

      Sweet.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue([mockSweet]),
      });

      await search(req, res);

      const callArg = Sweet.find.mock.calls[0][0];
      expect(callArg.category).toBe('chocolate');
    });

    it('should filter by price range', async () => {
      const req = { query: { minPrice: 2, maxPrice: 10 } };
      const res = mockRes();

      Sweet.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue([mockSweet]),
      });

      await search(req, res);

      const callArg = Sweet.find.mock.calls[0][0];
      expect(callArg.price).toBeDefined();
      expect(callArg.price.$gte).toBe(2);
      expect(callArg.price.$lte).toBe(10);
    });
  });
});
