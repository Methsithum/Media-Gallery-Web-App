const express = require('express');
const router = express.Router();
const {
  submitContactForm,
  getUserMessages,
  updateMessage,
  deleteMessage,
  getAllMessages,
  adminDeleteMessage,
} = require('../controllers/contactController');
const { protect, admin } = require('../middlewares/auth');

router.post('/', protect, submitContactForm);
router.get('/my-messages', protect, getUserMessages);
router.put('/:id', protect, updateMessage);
router.delete('/:id', protect, deleteMessage);

// Admin routes
router.get('/admin/contact', protect, admin, getAllMessages);
router.delete('/admin/contact/:id', protect, admin, adminDeleteMessage);

module.exports = router;