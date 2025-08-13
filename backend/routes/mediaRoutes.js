const express = require('express');
const router = express.Router();
const {
  uploadMedia,
  getMedia,
  getSingleMedia,
  updateMedia,
  deleteMedia,
  downloadMedia,
} = require('../controllers/mediaController');
const { protect } = require('../middlewares/auth');
const upload = require('../middlewares/upload');

router.post('/', protect, upload.single('image'), uploadMedia);
router.get('/', protect, getMedia);
router.get('/:id', protect, getSingleMedia);
router.put('/:id', protect, updateMedia);
router.delete('/:id', protect, deleteMedia);
router.post('/download', protect, downloadMedia);

module.exports = router;