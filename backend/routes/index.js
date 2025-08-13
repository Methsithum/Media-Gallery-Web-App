const express = require('express');
const router = express.Router();
const authRoutes = require('./authRoutes');
const mediaRoutes = require('./mediaRoutes');
const contactRoutes = require('./contactRoutes');
const userRoutes = require('./userRoutes');

router.use('/api/auth', authRoutes);
router.use('/api/media', mediaRoutes);
router.use('/api', contactRoutes);
router.use('/api/admin/users', userRoutes);

module.exports = router;