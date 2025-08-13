const Contact = require('../models/Contact');
const User = require('../models/User');

// @desc    Submit contact form
// @route   POST /api/contact
// @access  Public
const submitContactForm = async (req, res) => {
  try {
    const { name, email, message } = req.body;

    const contact = new Contact({
      name,
      email,
      message,
      user: req.user ? req.user.id : null,
    });

    await contact.save();

    res.status(201).json(contact);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get user's contact messages
// @route   GET /api/contact/my-messages
// @access  Private
const getUserMessages = async (req, res) => {
  try {
    const messages = await Contact.find({ user: req.user.id }).sort({
      createdAt: -1,
    });

    res.status(200).json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update contact message
// @route   PUT /api/contact/:id
// @access  Private
const updateMessage = async (req, res) => {
  try {
    const { message } = req.body;

    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Check if user owns the message
    if (contact.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    contact.message = message || contact.message;
    await contact.save();

    res.status(200).json(contact);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Delete contact message
// @route   DELETE /api/contact/:id
// @access  Private
const deleteMessage = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Check if user owns the message or is admin
    if (contact.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await contact.remove();

    res.status(200).json({ message: 'Message removed' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get all contact messages (admin only)
// @route   GET /api/admin/contact
// @access  Private/Admin
const getAllMessages = async (req, res) => {
  try {
    const messages = await Contact.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Delete any contact message (admin only)
// @route   DELETE /api/admin/contact/:id
// @access  Private/Admin
const adminDeleteMessage = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({ message: 'Message not found' });
    }

    await contact.remove();

    res.status(200).json({ message: 'Message removed' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  submitContactForm,
  getUserMessages,
  updateMessage,
  deleteMessage,
  getAllMessages,
  adminDeleteMessage,
};