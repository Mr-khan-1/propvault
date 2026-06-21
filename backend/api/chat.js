const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const { protect } = require('../middleware/auth');

// Get chat history with a specific user
router.get('/:partnerId', protect, async (req, res) => {
  try {
    const { partnerId } = req.params;
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: partnerId },
        { senderId: partnerId, receiverId: myId }
      ]
    }).sort({ createdAt: 1 });

    // Transform messages to match frontend format
    const formattedMessages = messages.map(msg => ({
      senderId: msg.senderId.toString(),
      receiverId: msg.receiverId.toString(),
      text: msg.text,
      fileUrl: msg.fileUrl,
      timestamp: msg.createdAt
    }));

    res.json(formattedMessages);
  } catch (error) {
    console.error('Chat history error:', error);
    res.status(500).json({ message: 'Failed to fetch chat history' });
  }
});

module.exports = router;
