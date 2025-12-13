'use strict';

const Sweet = require('../models/Sweet');
const { StatusCodes } = require('http-status-codes');

const list = async (req, res) => {
  try {
    const sweets = await Sweet.find().sort({ createdAt: -1 });
    
    // Map backend fields to frontend expectations
    const mapped = sweets.map((sweet) => {
      return {
        id: sweet._id.toString(),
        name: sweet.name,
        category: sweet.category,
        price: sweet.price,
        stock: sweet.stock,
        description: sweet.description || '',
        imageUrl: sweet.imageUrl || '',
      };
    });
    
    res.json(mapped);
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Error fetching sweets' });
  }
};

const create = async (req, res) => {
  const { name, description, price, stock, imageUrl, category } = req.body;
  
  if (!name || price == null || stock == null || !category) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: 'name, price, stock, and category are required' });
  }
  
  // Only admins can create sweets
  if (req.user.role !== 'admin') {
    return res.status(StatusCodes.FORBIDDEN).json({ message: 'Only admins can create sweets' });
  }
  
  try {
    const exists = await Sweet.findOne({ name });
    if (exists) {
      return res.status(StatusCodes.CONFLICT).json({ message: 'Sweet already exists' });
    }
    
    const sweet = await Sweet.create({
      name,
      description: description || '',
      price,
      stock,
      imageUrl: imageUrl || '',
      category,
    });
    
    res.status(StatusCodes.CREATED).json({
      id: sweet._id.toString(),
      name: sweet.name,
      category: sweet.category,
      price: sweet.price,
      stock: sweet.stock,
      description: sweet.description,
      imageUrl: sweet.imageUrl,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(StatusCodes.CONFLICT).json({ message: 'Sweet name already exists' });
    }
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Error creating sweet' });
  }
};

const getById = async (req, res) => {
  try {
    const sweet = await Sweet.findById(req.params.id);
    if (!sweet) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: 'Not found' });
    }
    
    const mapped = {
      id: sweet._id.toString(),
      name: sweet.name,
      category: sweet.category,
      price: sweet.price,
      stock: sweet.stock,
      description: sweet.description || '',
      imageUrl: sweet.imageUrl || '',
    };
    res.json(mapped);
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Error fetching sweet' });
  }
};

const update = async (req, res) => {
  // Only admins can update sweets
  if (req.user.role !== 'admin') {
    return res.status(StatusCodes.FORBIDDEN).json({ message: 'Only admins can update sweets' });
  }
  
  try {
    const updated = await Sweet.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    
    if (!updated) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: 'Not found' });
    }
    
    res.json({
      id: updated._id.toString(),
      name: updated.name,
      category: updated.category,
      price: updated.price,
      stock: updated.stock,
      description: updated.description,
      imageUrl: updated.imageUrl,
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Error updating sweet' });
  }
};

const remove = async (req, res) => {
  // Only admins can delete sweets
  if (req.user.role !== 'admin') {
    return res.status(StatusCodes.FORBIDDEN).json({ message: 'Only admins can delete sweets' });
  }
  
  try {
    const deleted = await Sweet.findByIdAndDelete(req.params.id);
    
    if (!deleted) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: 'Not found' });
    }
    
    res.json({ message: 'Deleted' });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Error deleting sweet' });
  }
};

const purchase = async (req, res) => {
  const { quantity } = req.body;
  if (!quantity || quantity < 1) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Invalid quantity' });
  }
  
  try {
    const sweet = await Sweet.findById(req.params.id);
    if (!sweet) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: 'Not found' });
    }
    
    if (sweet.stock < quantity) {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Insufficient stock' });
    }
    
    sweet.stock -= quantity;
    await sweet.save();
    
    res.json({
      id: sweet._id.toString(),
      name: sweet.name,
      category: sweet.category,
      price: sweet.price,
      stock: sweet.stock,
      description: sweet.description,
      imageUrl: sweet.imageUrl,
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Error processing purchase' });
  }
};

const restock = async (req, res) => {
  // Only admins can restock
  if (req.user.role !== 'admin') {
    return res.status(StatusCodes.FORBIDDEN).json({ message: 'Only admins can restock sweets' });
  }
  
  const { quantity } = req.body;
  if (!quantity || quantity < 1) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Invalid quantity' });
  }
  
  try {
    const sweet = await Sweet.findById(req.params.id);
    if (!sweet) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: 'Not found' });
    }
    
    sweet.stock += quantity;
    await sweet.save();
    
    res.json({
      id: sweet._id.toString(),
      name: sweet.name,
      category: sweet.category,
      price: sweet.price,
      stock: sweet.stock,
      description: sweet.description,
      imageUrl: sweet.imageUrl,
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Error restocking sweet' });
  }
};

const search = async (req, res) => {
  const { query, category, minPrice, maxPrice } = req.query;
  
  try {
    const filter = {};
    
    if (query) {
      filter.$or = [
        { name: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } }
      ];
    }
    
    if (category) {
      filter.category = category;
    }
    
    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};
      if (minPrice !== undefined) {
        filter.price.$gte = parseFloat(minPrice);
      }
      if (maxPrice !== undefined) {
        filter.price.$lte = parseFloat(maxPrice);
      }
    }
    
    const sweets = await Sweet.find(filter).sort({ createdAt: -1 });
    
    const mapped = sweets.map((sweet) => {
      return {
        id: sweet._id.toString(),
        name: sweet.name,
        category: sweet.category,
        price: sweet.price,
        stock: sweet.stock,
        description: sweet.description || '',
        imageUrl: sweet.imageUrl || '',
      };
    });
    
    res.json(mapped);
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Error searching sweets' });
  }
};

module.exports = { list, create, getById, update, remove, purchase, restock, search };
