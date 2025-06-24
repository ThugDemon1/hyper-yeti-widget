import express from 'express';
import SharedNote from '../models/SharedNote.js';
import Note from '../models/Note.js';
import User from '../models/User.js';
import auth from '../middleware/auth.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Get shared content
router.get('/', auth, async (req, res) => {
  try {
    const { type = 'with-me' } = req.query;

    let sharedNotes = [];

    if (type === 'with-me') {
      // Notes shared with current user
      sharedNotes = await SharedNote.find({
        'sharedWith.userId': req.userId,
        'sharedWith.status': 'accepted'
      })
        .populate({
          path: 'noteId',
          populate: {
            path: 'notebookId',
            select: 'name color'
          }
        })
        .populate('ownerId', 'name email avatar');
    } else if (type === 'by-me') {
      // Notes shared by current user
      sharedNotes = await SharedNote.find({
        ownerId: req.userId
      })
        .populate({
          path: 'noteId',
          populate: {
            path: 'notebookId',
            select: 'name color'
          }
        })
        .populate('sharedWith.userId', 'name email avatar');
    } else if (type === 'pending') {
      // Pending invitations for current user
      sharedNotes = await SharedNote.find({
        'sharedWith.userId': req.userId,
        'sharedWith.status': 'pending'
      })
        .populate({
          path: 'noteId',
          populate: {
            path: 'notebookId',
            select: 'name color'
          }
        })
        .populate('ownerId', 'name email avatar');
    }

    res.json(sharedNotes);
  } catch (error) {
    console.error('Get shared content error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Share note
router.post('/notes/:noteId', auth, async (req, res) => {
  try {
    const { emails, permission = 'read', message } = req.body;
    const noteId = req.params.noteId;

    // Verify note ownership
    const note = await Note.findOne({
      _id: noteId,
      userId: req.userId
    });

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    // Find or create shared note record
    let sharedNote = await SharedNote.findOne({
      noteId,
      ownerId: req.userId
    });

    if (!sharedNote) {
      sharedNote = new SharedNote({
        noteId,
        ownerId: req.userId,
        sharedWith: []
      });
    }

    // Process each email
    const results = [];
    for (const email of emails) {
      try {
        // Find user by email
        const user = await User.findOne({ email: email.toLowerCase() });
        
        if (!user) {
          results.push({ email, status: 'user-not-found' });
          continue;
        }

        // Check if already shared
        const existingShare = sharedNote.sharedWith.find(
          share => share.userId.toString() === user._id.toString()
        );

        if (existingShare) {
          // Update permission if different
          if (existingShare.permission !== permission) {
            existingShare.permission = permission;
            results.push({ email, status: 'permission-updated' });
          } else {
            results.push({ email, status: 'already-shared' });
          }
        } else {
          // Add new share
          sharedNote.sharedWith.push({
            userId: user._id,
            email: email.toLowerCase(),
            permission,
            invitedAt: new Date(),
            status: 'pending'
          });
          results.push({ email, status: 'invited' });
        }
      } catch (err) {
        results.push({ email, status: 'error' });
      }
    }

    await sharedNote.save();

    // TODO: Send email notifications
    // This would integrate with an email service like SendGrid or Nodemailer

    res.json({
      message: 'Sharing invitations sent',
      results
    });
  } catch (error) {
    console.error('Share note error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Accept sharing invitation
router.post('/accept/:shareId', auth, async (req, res) => {
  try {
    const sharedNote = await SharedNote.findById(req.params.shareId);

    if (!sharedNote) {
      return res.status(404).json({ message: 'Sharing invitation not found' });
    }

    const shareIndex = sharedNote.sharedWith.findIndex(
      share => share.userId.toString() === req.userId && share.status === 'pending'
    );

    if (shareIndex === -1) {
      return res.status(404).json({ message: 'Invitation not found or already processed' });
    }

    sharedNote.sharedWith[shareIndex].status = 'accepted';
    sharedNote.sharedWith[shareIndex].acceptedAt = new Date();

    await sharedNote.save();

    res.json({ message: 'Invitation accepted' });
  } catch (error) {
    console.error('Accept invitation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Decline sharing invitation
router.post('/decline/:shareId', auth, async (req, res) => {
  try {
    const sharedNote = await SharedNote.findById(req.params.shareId);

    if (!sharedNote) {
      return res.status(404).json({ message: 'Sharing invitation not found' });
    }

    const shareIndex = sharedNote.sharedWith.findIndex(
      share => share.userId.toString() === req.userId && share.status === 'pending'
    );

    if (shareIndex === -1) {
      return res.status(404).json({ message: 'Invitation not found or already processed' });
    }

    sharedNote.sharedWith[shareIndex].status = 'declined';
    await sharedNote.save();

    res.json({ message: 'Invitation declined' });
  } catch (error) {
    console.error('Decline invitation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update permission
router.put('/permission/:shareId', auth, async (req, res) => {
  try {
    const { userId, permission } = req.body;

    const sharedNote = await SharedNote.findOne({
      _id: req.params.shareId,
      ownerId: req.userId
    });

    if (!sharedNote) {
      return res.status(404).json({ message: 'Shared note not found' });
    }

    const shareIndex = sharedNote.sharedWith.findIndex(
      share => share.userId.toString() === userId
    );

    if (shareIndex === -1) {
      return res.status(404).json({ message: 'User not found in sharing list' });
    }

    sharedNote.sharedWith[shareIndex].permission = permission;
    await sharedNote.save();

    res.json({ message: 'Permission updated' });
  } catch (error) {
    console.error('Update permission error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Revoke access
router.delete('/revoke/:shareId', auth, async (req, res) => {
  try {
    const { userId } = req.body;

    const sharedNote = await SharedNote.findOne({
      _id: req.params.shareId,
      ownerId: req.userId
    });

    if (!sharedNote) {
      return res.status(404).json({ message: 'Shared note not found' });
    }

    sharedNote.sharedWith = sharedNote.sharedWith.filter(
      share => share.userId.toString() !== userId
    );

    if (sharedNote.sharedWith.length === 0 && !sharedNote.isPublic) {
      await SharedNote.findByIdAndDelete(req.params.shareId);
    } else {
      await sharedNote.save();
    }

    res.json({ message: 'Access revoked' });
  } catch (error) {
    console.error('Revoke access error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create public link
router.post('/public/:noteId', auth, async (req, res) => {
  try {
    const noteId = req.params.noteId;

    // Verify note ownership
    const note = await Note.findOne({
      _id: noteId,
      userId: req.userId
    });

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    let sharedNote = await SharedNote.findOne({
      noteId,
      ownerId: req.userId
    });

    if (!sharedNote) {
      sharedNote = new SharedNote({
        noteId,
        ownerId: req.userId,
        sharedWith: []
      });
    }

    sharedNote.isPublic = true;
    sharedNote.publicUrl = uuidv4();

    await sharedNote.save();

    res.json({
      publicUrl: `${req.protocol}://${req.get('host')}/public/${sharedNote.publicUrl}`,
      shareId: sharedNote._id
    });
  } catch (error) {
    console.error('Create public link error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove public link
router.delete('/public/:shareId', auth, async (req, res) => {
  try {
    const sharedNote = await SharedNote.findOne({
      _id: req.params.shareId,
      ownerId: req.userId
    });

    if (!sharedNote) {
      return res.status(404).json({ message: 'Shared note not found' });
    }

    sharedNote.isPublic = false;
    sharedNote.publicUrl = undefined;

    if (sharedNote.sharedWith.length === 0) {
      await SharedNote.findByIdAndDelete(req.params.shareId);
    } else {
      await sharedNote.save();
    }

    res.json({ message: 'Public link removed' });
  } catch (error) {
    console.error('Remove public link error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;