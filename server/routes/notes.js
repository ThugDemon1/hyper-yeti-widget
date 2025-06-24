import express from 'express';
import Note from '../models/Note.js';
import Notebook from '../models/Notebook.js';
import auth from '../middleware/auth.js';
import Tag from '../models/Tag.js';
import path from 'path';
import { promises as fs } from 'fs';
import multer from 'multer';

const router = express.Router();
const upload = multer({ dest: 'server/uploads/' });

// Get all notes
router.get('/', auth, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      sortBy = 'updatedAt', 
      sortOrder = 'desc',
      notebook,
      tags,
      search,
      pinned,
      deleted = false
    } = req.query;

    const query = { 
      userId: req.userId,
      isDeleted: deleted === 'true'
    };

    if (notebook) query.notebookId = notebook;
    if (tags) query.tags = { $in: tags.split(',') };
    if (pinned !== undefined) query.isPinned = pinned === 'true';
    if (search) {
      query.$text = { $search: search };
    }
    // Additional filters
    if (req.query.createdFrom || req.query.createdTo) {
      query.createdAt = {};
      if (req.query.createdFrom) {
        query.createdAt.$gte = new Date(req.query.createdFrom);
      }
      if (req.query.createdTo) {
        query.createdAt.$lte = new Date(req.query.createdTo);
      }
    }
    if (req.query.hasReminders) {
      query.reminderDate = { $ne: null };
    }
    if (req.query.hasAttachments) {
      query['attachments.0'] = { $exists: true };
    }

    const notes = await Note.find(query)
      .populate('notebookId', 'name color')
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Note.countDocuments(query);

    res.json({
      notes,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get notes error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single note
router.get('/:id', auth, async (req, res) => {
  try {
    const note = await Note.findOne({
      _id: req.params.id,
      userId: req.userId
    }).populate('notebookId', 'name color');

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    // Update last viewed
    note.lastViewedAt = new Date();
    await note.save();

    res.json(note);
  } catch (error) {
    console.error('Get note error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create note
router.post('/', auth, async (req, res) => {
  try {
    const { title, content, plainTextContent, notebookId, tags } = req.body;

    // Get default notebook if none specified
    let targetNotebookId = notebookId;
    if (!targetNotebookId) {
      let defaultNotebook = await Notebook.findOne({
        userId: req.userId,
        isDefault: true
      });
      
      // If no default notebook exists, create one
      if (!defaultNotebook) {
        console.log('No default notebook found, creating one for user:', req.userId);
        defaultNotebook = new Notebook({
          name: 'My Notes',
          userId: req.userId,
          isDefault: true,
          color: '#3B82F6'
        });
        await defaultNotebook.save();
      }
      
      targetNotebookId = defaultNotebook._id;
    }

    const note = new Note({
      title: title || 'Untitled',
      content: content || '',
      plainTextContent: plainTextContent || '',
      userId: req.userId,
      notebookId: targetNotebookId,
      tags: tags || []
    });

    await note.save();
    await note.populate('notebookId', 'name color');

    // Update notebook note count
    await Notebook.findByIdAndUpdate(targetNotebookId, {
      $inc: { noteCount: 1 }
    });

    // Increment noteCount for each tag
    if (tags && tags.length > 0) {
      await Tag.updateMany({ _id: { $in: tags } }, { $inc: { noteCount: 1 } });
    }

    // Emit real-time update
    req.io.emit('note-created', { note, userId: req.userId });

    res.status(201).json(note);
  } catch (error) {
    console.error('Create note error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update note
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, content, plainTextContent, notebookId, tags, isPinned, reminderDate } = req.body;

    const note = await Note.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    const oldNotebookId = note.notebookId;
    const oldTags = note.tags.map(t => t.toString());

    // Save current version to history before updating
    note.history = note.history || [];
    note.history.push({
      title: note.title,
      content: note.content,
      plainTextContent: note.plainTextContent,
      attachments: note.attachments,
      tags: note.tags,
      updatedAt: note.updatedAt,
      version: note.version
    });
    note.version = (note.version || 1) + 1;

    // Update note
    Object.assign(note, {
      title: title !== undefined ? title : note.title,
      content: content !== undefined ? content : note.content,
      plainTextContent: plainTextContent !== undefined ? plainTextContent : note.plainTextContent,
      notebookId: notebookId !== undefined ? notebookId : note.notebookId,
      tags: tags !== undefined ? tags : note.tags,
      isPinned: isPinned !== undefined ? isPinned : note.isPinned,
      reminderDate: reminderDate !== undefined ? reminderDate : note.reminderDate
    });

    await note.save();
    await note.populate('notebookId', 'name color');

    // Update notebook counts if notebook changed
    if (notebookId && oldNotebookId.toString() !== notebookId) {
      await Notebook.findByIdAndUpdate(oldNotebookId, { $inc: { noteCount: -1 } });
      await Notebook.findByIdAndUpdate(notebookId, { $inc: { noteCount: 1 } });
    }

    // Update tag noteCounts
    if (tags) {
      const newTags = tags.map(t => t.toString());
      const addedTags = newTags.filter(t => !oldTags.includes(t));
      const removedTags = oldTags.filter(t => !newTags.includes(t));
      if (addedTags.length > 0) {
        await Tag.updateMany({ _id: { $in: addedTags } }, { $inc: { noteCount: 1 } });
      }
      if (removedTags.length > 0) {
        await Tag.updateMany({ _id: { $in: removedTags } }, { $inc: { noteCount: -1 } });
      }
    }

    // Emit real-time update
    req.io.emit('note-updated', { note, userId: req.userId });

    res.json(note);
  } catch (error) {
    console.error('Update note error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get note history
router.get('/:id/history', auth, async (req, res) => {
  try {
    const note = await Note.findOne({
      _id: req.params.id,
      userId: req.userId
    });
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }
    res.json(note.history || []);
  } catch (error) {
    console.error('Get note history error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Restore note version
router.post('/:id/history/restore', auth, async (req, res) => {
  try {
    const { historyIndex } = req.body;
    const note = await Note.findOne({
      _id: req.params.id,
      userId: req.userId
    });
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }
    if (!note.history || historyIndex < 0 || historyIndex >= note.history.length) {
      return res.status(400).json({ message: 'Invalid history index' });
    }
    const version = note.history[historyIndex];
    // Save current version to history before restoring
    note.history.push({
      title: note.title,
      content: note.content,
      plainTextContent: note.plainTextContent,
      attachments: note.attachments,
      tags: note.tags,
      updatedAt: note.updatedAt,
      version: note.version
    });
    note.title = version.title;
    note.content = version.content;
    note.plainTextContent = version.plainTextContent;
    note.attachments = version.attachments;
    note.tags = version.tags;
    note.version = (note.version || 1) + 1;
    await note.save();
    res.json(note);
  } catch (error) {
    console.error('Restore note version error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete note (move to trash)
router.delete('/:id', auth, async (req, res) => {
  try {
    const note = await Note.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    note.isDeleted = true;
    note.deletedAt = new Date();
    await note.save();

    // Update notebook note count
    await Notebook.findByIdAndUpdate(note.notebookId, {
      $inc: { noteCount: -1 }
    });

    // Decrement noteCount for each tag
    if (note.tags && note.tags.length > 0) {
      await Tag.updateMany({ _id: { $in: note.tags } }, { $inc: { noteCount: -1 } });
    }

    // Emit real-time update
    req.io.emit('note-deleted', { noteId: req.params.id, userId: req.userId });

    res.json({ message: 'Note moved to trash' });
  } catch (error) {
    console.error('Delete note error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Restore note from trash
router.post('/:id/restore', auth, async (req, res) => {
  try {
    const note = await Note.findOne({
      _id: req.params.id,
      userId: req.userId,
      isDeleted: true
    });

    if (!note) {
      return res.status(404).json({ message: 'Note not found in trash' });
    }

    note.isDeleted = false;
    note.deletedAt = undefined;
    await note.save();

    // Update notebook note count
    await Notebook.findByIdAndUpdate(note.notebookId, {
      $inc: { noteCount: 1 }
    });

    // Emit real-time update
    req.io.emit('note-restored', { note, userId: req.userId });

    res.json({ message: 'Note restored' });
  } catch (error) {
    console.error('Restore note error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Permanently delete note
router.delete('/:id/permanent', auth, async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
      isDeleted: true
    });

    if (!note) {
      return res.status(404).json({ message: 'Note not found in trash' });
    }

    // Emit real-time update
    req.io.emit('note-permanently-deleted', { noteId: req.params.id, userId: req.userId });

    res.json({ message: 'Note permanently deleted' });
  } catch (error) {
    console.error('Permanent delete error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Duplicate note
router.post('/:id/duplicate', auth, async (req, res) => {
  try {
    const originalNote = await Note.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!originalNote) {
      return res.status(404).json({ message: 'Note not found' });
    }

    const duplicatedNote = new Note({
      title: `${originalNote.title} (Copy)`,
      content: originalNote.content,
      plainTextContent: originalNote.plainTextContent,
      userId: req.userId,
      notebookId: originalNote.notebookId,
      tags: [...originalNote.tags]
    });

    await duplicatedNote.save();
    await duplicatedNote.populate('notebookId', 'name color');

    // Update notebook note count
    await Notebook.findByIdAndUpdate(originalNote.notebookId, {
      $inc: { noteCount: 1 }
    });

    res.status(201).json(duplicatedNote);
  } catch (error) {
    console.error('Duplicate note error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Bulk operations
router.post('/bulk', auth, async (req, res) => {
  try {
    const { action, noteIds, data } = req.body;

    const query = {
      _id: { $in: noteIds },
      userId: req.userId
    };

    let result;
    switch (action) {
      case 'delete':
        result = await Note.updateMany(query, {
          isDeleted: true,
          deletedAt: new Date()
        });
        break;
      case 'restore':
        result = await Note.updateMany(
          { ...query, isDeleted: true },
          { isDeleted: false, $unset: { deletedAt: 1 } }
        );
        break;
      case 'move':
        result = await Note.updateMany(query, {
          notebookId: data.notebookId
        });
        break;
      case 'tag':
        result = await Note.updateMany(query, {
          $addToSet: { tags: { $each: data.tags } }
        });
        break;
      case 'pin':
        result = await Note.updateMany(query, {
          isPinned: data.isPinned
        });
        break;
      default:
        return res.status(400).json({ message: 'Invalid action' });
    }

    res.json({ message: `Bulk ${action} completed`, modifiedCount: result.modifiedCount });
  } catch (error) {
    console.error('Bulk operation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all upcoming reminders for the user
router.get('/reminders/upcoming', auth, async (req, res) => {
  try {
    const now = new Date();
    const reminders = await Note.find({
      userId: req.userId,
      isDeleted: false,
      reminderDate: { $gte: now },
      reminderCompleted: false
    })
      .sort({ reminderDate: 1 })
      .limit(50);
    res.json(reminders);
  } catch (error) {
    console.error('Get upcoming reminders error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Set, update, or clear a reminder for a note
router.patch('/:id/reminder', auth, async (req, res) => {
  try {
    const { reminderDate, reminderRecurring } = req.body;
    const note = await Note.findOne({ _id: req.params.id, userId: req.userId });
    if (!note) return res.status(404).json({ message: 'Note not found' });
    note.reminderDate = reminderDate || null;
    note.reminderCompleted = false;
    if (reminderRecurring) note.reminderRecurring = reminderRecurring;
    await note.save();
    res.json(note);
  } catch (error) {
    console.error('Set reminder error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update recurring reminder settings only
router.patch('/:id/reminder/recurring', auth, async (req, res) => {
  try {
    const { reminderRecurring } = req.body;
    const note = await Note.findOne({ _id: req.params.id, userId: req.userId });
    if (!note) return res.status(404).json({ message: 'Note not found' });
    note.reminderRecurring = reminderRecurring;
    await note.save();
    res.json(note);
  } catch (error) {
    console.error('Set recurring reminder error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark a reminder as completed (and reschedule if recurring)
router.patch('/:id/reminder/complete', auth, async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, userId: req.userId });
    if (!note) return res.status(404).json({ message: 'Note not found' });
    if (note.reminderRecurring && note.reminderRecurring.frequency && note.reminderRecurring.frequency !== 'none' && note.reminderDate) {
      // Calculate next occurrence
      let nextDate = new Date(note.reminderDate);
      const freq = note.reminderRecurring.frequency;
      const interval = note.reminderRecurring.interval || 1;
      if (freq === 'daily') {
        nextDate.setDate(nextDate.getDate() + interval);
      } else if (freq === 'weekly') {
        nextDate.setDate(nextDate.getDate() + 7 * interval);
      } else if (freq === 'monthly') {
        nextDate.setMonth(nextDate.getMonth() + interval);
      } else if (freq === 'yearly') {
        nextDate.setFullYear(nextDate.getFullYear() + interval);
      }
      note.reminderDate = nextDate;
      note.reminderCompleted = false;
    } else {
      note.reminderCompleted = true;
    }
    await note.save();
    res.json(note);
  } catch (error) {
    console.error('Complete reminder error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Share a note with another user
router.post('/:id/share', auth, async (req, res) => {
  try {
    const { collaboratorId, permission } = req.body;
    const note = await Note.findOne({ _id: req.params.id, userId: req.userId });
    if (!note) return res.status(404).json({ message: 'Note not found' });
    if (!note.collaborators) note.collaborators = [];
    if (note.collaborators.some(c => c.userId.toString() === collaboratorId)) {
      return res.status(400).json({ message: 'User already a collaborator' });
    }
    note.collaborators.push({ userId: collaboratorId, permission });
    await note.save();
    res.json(note);
  } catch (error) {
    console.error('Share note error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update collaborator permission
router.patch('/:id/share', auth, async (req, res) => {
  try {
    const { collaboratorId, permission } = req.body;
    const note = await Note.findOne({ _id: req.params.id, userId: req.userId });
    if (!note) return res.status(404).json({ message: 'Note not found' });
    const collab = note.collaborators.find(c => c.userId.toString() === collaboratorId);
    if (!collab) return res.status(404).json({ message: 'Collaborator not found' });
    collab.permission = permission;
    await note.save();
    res.json(note);
  } catch (error) {
    console.error('Update collaborator error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove collaborator
router.delete('/:id/share/:userId', auth, async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, userId: req.userId });
    if (!note) return res.status(404).json({ message: 'Note not found' });
    note.collaborators = note.collaborators.filter(c => c.userId.toString() !== req.params.userId);
    await note.save();
    res.json(note);
  } catch (error) {
    console.error('Remove collaborator error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// List notes shared with the user
router.get('/shared/with-me', auth, async (req, res) => {
  try {
    const notes = await Note.find({
      'collaborators.userId': req.userId,
      isDeleted: false
    }).populate('userId', 'name email');
    res.json(notes);
  } catch (error) {
    console.error('List shared with me error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// List notes shared by the user
router.get('/shared/by-me', auth, async (req, res) => {
  try {
    const notes = await Note.find({
      userId: req.userId,
      'collaborators.0': { $exists: true },
      isDeleted: false
    }).populate('collaborators.userId', 'name email');
    res.json(notes);
  } catch (error) {
    console.error('List shared by me error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Bulk permanent delete
router.post('/bulk-permanent', auth, async (req, res) => {
  try {
    const { noteIds } = req.body;
    if (!Array.isArray(noteIds) || noteIds.length === 0) {
      return res.status(400).json({ message: 'No noteIds provided' });
    }
    const result = await Note.deleteMany({
      _id: { $in: noteIds },
      userId: req.userId,
      isDeleted: true
    });
    res.json({ message: 'Notes permanently deleted', deletedCount: result.deletedCount });
  } catch (error) {
    console.error('Bulk permanent delete error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add attachment to a note
router.post('/:id/attachments', auth, async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, userId: req.userId });
    if (!note) return res.status(404).json({ message: 'Note not found' });
    const { attachment } = req.body; // expects { filename, originalName, url, type, size, uploadedAt }
    if (!attachment || !attachment.filename) {
      return res.status(400).json({ message: 'Invalid attachment data' });
    }
    note.attachments.push(attachment);
    await note.save();
    res.json(note.attachments);
  } catch (error) {
    console.error('Add attachment error:', error);
    res.status(500).json({ message: 'Failed to add attachment' });
  }
});

// Remove attachment from a note
router.delete('/:id/attachments/:filename', auth, async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, userId: req.userId });
    if (!note) return res.status(404).json({ message: 'Note not found' });
    const filename = req.params.filename;
    const attachmentIndex = note.attachments.findIndex(att => att.filename === filename);
    if (attachmentIndex === -1) {
      return res.status(404).json({ message: 'Attachment not found' });
    }
    // Remove from array
    note.attachments.splice(attachmentIndex, 1);
    await note.save();
    // Optionally delete file from disk
    const filePath = path.join(process.cwd(), 'server/uploads', filename);
    try {
      await fs.unlink(filePath);
    } catch (err) {
      // Ignore if file doesn't exist
    }
    res.json(note.attachments);
  } catch (error) {
    console.error('Remove attachment error:', error);
    res.status(500).json({ message: 'Failed to remove attachment' });
  }
});

// Get backlinks for a note
router.get('/:id/backlinks', auth, async (req, res) => {
  try {
    const noteId = req.params.id;
    // Find notes that link to this note (by noteId in content)
    // Looks for /notes?note=NOTE_ID or data-note-id="NOTE_ID"
    const regex = new RegExp(`(\\?note=${noteId}|data-note-id=\\"${noteId}\\")`, 'i');
    const backlinks = await Note.find({
      userId: req.userId,
      isDeleted: false,
      content: { $regex: regex }
    }, 'title _id');
    res.json(backlinks);
  } catch (error) {
    console.error('Get backlinks error:', error);
    res.status(500).json({ message: 'Failed to fetch backlinks' });
  }
});

// Export notes
router.post('/export', auth, async (req, res) => {
  try {
    const { noteIds, format } = req.body;
    if (!Array.isArray(noteIds) || !format) {
      return res.status(400).json({ message: 'Missing noteIds or format' });
    }
    const notes = await Note.find({ _id: { $in: noteIds }, userId: req.userId });
    let data, mime, ext;
    if (format === 'json') {
      data = JSON.stringify(notes, null, 2);
      mime = 'application/json';
      ext = 'json';
    } else if (format === 'txt') {
      data = notes.map(n => `${n.title}\n${n.plainTextContent}`).join('\n\n---\n\n');
      mime = 'text/plain';
      ext = 'txt';
    } else if (format === 'md') {
      data = notes.map(n => `# ${n.title}\n\n${n.plainTextContent}`).join('\n\n---\n\n');
      mime = 'text/markdown';
      ext = 'md';
    } else {
      return res.status(400).json({ message: 'Unsupported format' });
    }
    res.setHeader('Content-Disposition', `attachment; filename=notes-export.${ext}`);
    res.setHeader('Content-Type', mime);
    res.send(data);
  } catch (error) {
    console.error('Export notes error:', error);
    res.status(500).json({ message: 'Failed to export notes' });
  }
});

// Import notes
router.post('/import', auth, upload.single('file'), async (req, res) => {
  try {
    const { format } = req.body;
    const file = req.file;
    if (!file || !format) {
      return res.status(400).json({ message: 'Missing file or format' });
    }
    const content = await fs.readFile(file.path, 'utf-8');
    let notes = [];
    if (format === 'json') {
      notes = JSON.parse(content);
    } else if (format === 'txt' || format === 'md') {
      // Split by ---
      const rawNotes = content.split(/\n---\n/);
      notes = rawNotes.map(raw => {
        const [title, ...body] = raw.trim().split('\n');
        return {
          title: title.replace(/^# /, '').trim() || 'Untitled',
          content: body.join('\n').trim(),
          plainTextContent: body.join('\n').trim(),
        };
      });
    } else {
      return res.status(400).json({ message: 'Unsupported format' });
    }
    // Create notes for user
    for (const n of notes) {
      await Note.create({
        title: n.title || 'Untitled',
        content: n.content || '',
        plainTextContent: n.plainTextContent || '',
        userId: req.userId,
        notebookId: n.notebookId || undefined,
        tags: n.tags || [],
      });
    }
    // Remove uploaded file
    await fs.unlink(file.path);
    res.json({ message: 'Notes imported successfully', count: notes.length });
  } catch (error) {
    console.error('Import notes error:', error);
    res.status(500).json({ message: 'Failed to import notes' });
  }
});

export default router;