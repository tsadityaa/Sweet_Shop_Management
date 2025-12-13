'use strict';

const router = require('express').Router();
const { list, create, getById, update, remove, purchase, restock, search } = require('../controllers/sweets.controller');
const { auth } = require('../middleware/auth');

router.get('/', list);
router.get('/search', search);
router.post('/', auth(true), create);
router.get('/:id', getById);
router.put('/:id', auth(true), update);
router.delete('/:id', auth(true), remove);
router.post('/:id/purchase', auth(true), purchase);
router.post('/:id/restock', auth(true), restock);

module.exports = router;
