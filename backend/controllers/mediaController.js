const Media = require('../models/Media');
const User = require('../models/User');
const cloudinary = require('../config/cloudinary');
const archiver = require('archiver');
const fs = require('fs');
const path = require('path');


const uploadMedia = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a file' });
    }

    const { title, description, tags, isShared } = req.body;

  
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'media-gallery',
    });

    
    const media = new Media({
      title,
      description,
      tags: tags ? tags.split(',') : [],
      imageUrl: result.secure_url,
      publicId: result.public_id,
      user: req.user.id,
      isShared: isShared === 'true',
    });

    await media.save();

    
    fs.unlinkSync(req.file.path);

    res.status(201).json(media);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};


const getMedia = async (req, res) => {
  try {
    const { search, tags } = req.query;
    let query = {};

   
    if (req.user.role === 'user') {
      query = {
        $or: [
          { user: req.user.id },
          { isShared: true },
        ],
      };
    }

  
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    
    if (tags) {
      query.tags = { $in: tags.split(',') };
    }

    const media = await Media.find(query)
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json(media);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};


const getSingleMedia = async (req, res) => {
  try {
    const media = await Media.findById(req.params.id).populate(
      'user',
      'name email'
    );

    if (!media) {
      return res.status(404).json({ message: 'Media not found' });
    }

  
    if (
      req.user.role === 'user' &&
      media.user._id.toString() !== req.user.id &&
      !media.isShared
    ) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    res.status(200).json(media);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

const updateMedia = async (req, res) => {
  try {
    const { title, description, tags, isShared } = req.body;

    const media = await Media.findById(req.params.id);

    if (!media) {
      return res.status(404).json({ message: 'Media not found' });
    }

   
    if (media.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized' });
    }

    media.title = title || media.title;
    media.description = description || media.description;
    media.tags = tags ? tags.split(',') : media.tags;
    media.isShared = isShared === 'true' ? true : isShared === 'false' ? false : media.isShared;

    await media.save();

    res.status(200).json(media);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

const deleteMedia = async (req, res) => {
  try {
    const media = await Media.findById(req.params.id);

    if (!media) {
      return res.status(404).json({ message: 'Media not found' });
    }

    
    if (media.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await cloudinary.uploader.destroy(media.publicId);

    await media.remove();

    res.status(200).json({ message: 'Media removed' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};


const downloadMedia = async (req, res) => {
  try {
    const { mediaIds } = req.body;

    if (!mediaIds || !Array.isArray(mediaIds) || mediaIds.length === 0) {
      return res.status(400).json({ message: 'Please select media to download' });
    }

    const media = await Media.find({
      _id: { $in: mediaIds },
      $or: [
        { user: req.user.id },
        { isShared: true },
      ],
    });

    if (media.length === 0) {
      return res.status(404).json({ message: 'No media found' });
    }

    const archive = archiver('zip', {
      zlib: { level: 9 }, 
    });

    res.attachment('media-gallery.zip');
    archive.pipe(res);

    for (const item of media) {
      const response = await fetch(item.imageUrl);
      const buffer = await response.buffer();
      archive.append(buffer, { name: `${item.title}.jpg` });
    }

    archive.finalize();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  uploadMedia,
  getMedia,
  getSingleMedia,
  updateMedia,
  deleteMedia,
  downloadMedia,
};