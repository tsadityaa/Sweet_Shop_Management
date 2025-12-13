'use strict';

const router = require('express').Router();
const { register, login, logout, me, refresh } = require('../controllers/auth.controller');
const { auth } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', auth(true), me);
router.post('/refresh', refresh);

module.exports = router;
