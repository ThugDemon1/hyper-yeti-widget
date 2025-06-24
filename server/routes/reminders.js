import express from 'express';
import Reminder from '../models/Reminder.js';
import Note from '../models/Note.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Get all reminders
router.get('/', auth, async (req, res) => {
  try {
    const { 
      filter = 'all',
      page = 1,
      limit = 50,
      sortBy = 'dueDate',
      sortOrder = 'asc'
    } = req.query;

    let query = { userId: req.userId };
    const now = new Date();

    switch (filter) {
      case 'today':
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);
        query.dueDate = { $gte: startOfDay, $lt: endOfDay };
        query.isCompleted = false;
        break;
      case 'upcoming':
        query.dueDate = { $gt: now };
        query.isCompleted = false;
        break;
      case 'overdue':
        query.dueDate = { $lt: now };
        query.isCompleted = false;
        break;
      case 'completed':
        query.isCompleted = true;
        break;
      case 'all':
      default:
        // No additional filter
        break;
    }

    const reminders = await Reminder.find(query)
      .populate('noteId', 'title')
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Reminder.countDocuments(query);

    // Get counts for different categories
    const counts = {
      all: await Reminder.countDocuments({ userId: req.userId }),
      today: await Reminder.countDocuments({
        userId: req.userId,
        dueDate: {
          $gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
          $lt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
        },
        isCompleted: false
      }),
      upcoming: await Reminder.countDocuments({
        userId: req.userId,
        dueDate: { $gt: now },
        isCompleted: false
      }),
      overdue: await Reminder.countDocuments({
        userId: req.userId,
        dueDate: { $lt: now },
        isCompleted: false
      }),
      completed: await Reminder.countDocuments({
        userId: req.userId,
        isCompleted: true
      })
    };

    res.json({
      reminders,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
      counts
    });
  } catch (error) {
    console.error('Get reminders error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single reminder
router.get('/:id', auth, async (req, res) => {
  try {
    const reminder = await Reminder.findOne({
      _id: req.params.id,
      userId: req.userId
    }).populate('noteId', 'title');

    if (!reminder) {
      return res.status(404).json({ message: 'Reminder not found' });
    }

    res.json(reminder);
  } catch (error) {
    console.error('Get reminder error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create reminder
router.post('/', auth, async (req, res) => {
  try {
    const {
      title,
      description,
      dueDate,
      priority = 'medium',
      noteId,
      repeatType = 'none',
      repeatInterval = 1
    } = req.body;

    // Validate note if provided
    if (noteId) {
      const note = await Note.findOne({
        _id: noteId,
        userId: req.userId
      });
      if (!note) {
        return res.status(404).json({ message: 'Associated note not found' });
      }
    }

    const reminder = new Reminder({
      title,
      description: description || '',
      userId: req.userId,
      noteId: noteId || undefined,
      dueDate: new Date(dueDate),
      priority,
      repeatType,
      repeatInterval
    });

    await reminder.save();
    await reminder.populate('noteId', 'title');

    // Update note reminder if associated
    if (noteId) {
      await Note.findByIdAndUpdate(noteId, {
        reminderDate: new Date(dueDate)
      });
    }

    res.status(201).json(reminder);
  } catch (error) {
    console.error('Create reminder error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update reminder
router.put('/:id', auth, async (req, res) => {
  try {
    const {
      title,
      description,
      dueDate,
      priority,
      noteId,
      repeatType,
      repeatInterval,
      snoozeUntil
    } = req.body;

    const reminder = await Reminder.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!reminder) {
      return res.status(404).json({ message: 'Reminder not found' });
    }

    // Validate note if provided
    if (noteId && noteId !== reminder.noteId?.toString()) {
      const note = await Note.findOne({
        _id: noteId,
        userId: req.userId
      });
      if (!note) {
        return res.status(404).json({ message: 'Associated note not found' });
      }
    }

    // Update fields
    if (title !== undefined) reminder.title = title;
    if (description !== undefined) reminder.description = description;
    if (dueDate !== undefined) reminder.dueDate = new Date(dueDate);
    if (priority !== undefined) reminder.priority = priority;
    if (noteId !== undefined) reminder.noteId = noteId || undefined;
    if (repeatType !== undefined) reminder.repeatType = repeatType;
    if (repeatInterval !== undefined) reminder.repeatInterval = repeatInterval;
    if (snoozeUntil !== undefined) reminder.snoozeUntil = snoozeUntil ? new Date(snoozeUntil) : undefined;

    await reminder.save();
    await reminder.populate('noteId', 'title');

    // Update note reminder if associated
    if (reminder.noteId && dueDate !== undefined) {
      await Note.findByIdAndUpdate(reminder.noteId, {
        reminderDate: new Date(dueDate)
      });
    }

    res.json(reminder);
  } catch (error) {
    console.error('Update reminder error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark reminder as complete
router.put('/:id/complete', auth, async (req, res) => {
  try {
    const reminder = await Reminder.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!reminder) {
      return res.status(404).json({ message: 'Reminder not found' });
    }

    reminder.isCompleted = true;
    reminder.completedAt = new Date();

    // Handle recurring reminders
    if (reminder.repeatType !== 'none') {
      const nextDueDate = new Date(reminder.dueDate);
      
      switch (reminder.repeatType) {
        case 'daily':
          nextDueDate.setDate(nextDueDate.getDate() + reminder.repeatInterval);
          break;
        case 'weekly':
          nextDueDate.setDate(nextDueDate.getDate() + (7 * reminder.repeatInterval));
          break;
        case 'monthly':
          nextDueDate.setMonth(nextDueDate.getMonth() + reminder.repeatInterval);
          break;
        case 'yearly':
          nextDueDate.setFullYear(nextDueDate.getFullYear() + reminder.repeatInterval);
          break;
      }

      // Create new reminder for next occurrence
      const nextReminder = new Reminder({
        title: reminder.title,
        description: reminder.description,
        userId: reminder.userId,
        noteId: reminder.noteId,
        dueDate: nextDueDate,
        priority: reminder.priority,
        repeatType: reminder.repeatType,
        repeatInterval: reminder.repeatInterval
      });

      await nextReminder.save();
    }

    await reminder.save();
    await reminder.populate('noteId', 'title');

    // Update note reminder status if associated
    if (reminder.noteId) {
      await Note.findByIdAndUpdate(reminder.noteId, {
        reminderCompleted: true
      });
    }

    res.json(reminder);
  } catch (error) {
    console.error('Complete reminder error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark reminder as incomplete
router.put('/:id/incomplete', auth, async (req, res) => {
  try {
    const reminder = await Reminder.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!reminder) {
      return res.status(404).json({ message: 'Reminder not found' });
    }

    reminder.isCompleted = false;
    reminder.completedAt = undefined;

    await reminder.save();
    await reminder.populate('noteId', 'title');

    // Update note reminder status if associated
    if (reminder.noteId) {
      await Note.findByIdAndUpdate(reminder.noteId, {
        reminderCompleted: false
      });
    }

    res.json(reminder);
  } catch (error) {
    console.error('Mark incomplete error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Snooze reminder
router.put('/:id/snooze', auth, async (req, res) => {
  try {
    const { snoozeUntil } = req.body;

    const reminder = await Reminder.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!reminder) {
      return res.status(404).json({ message: 'Reminder not found' });
    }

    reminder.snoozeUntil = new Date(snoozeUntil);
    await reminder.save();
    await reminder.populate('noteId', 'title');

    res.json(reminder);
  } catch (error) {
    console.error('Snooze reminder error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete reminder
router.delete('/:id', auth, async (req, res) => {
  try {
    const reminder = await Reminder.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!reminder) {
      return res.status(404).json({ message: 'Reminder not found' });
    }

    // Remove reminder from associated note
    if (reminder.noteId) {
      await Note.findByIdAndUpdate(reminder.noteId, {
        $unset: { reminderDate: 1, reminderCompleted: 1 }
      });
    }

    await Reminder.findByIdAndDelete(req.params.id);

    res.json({ message: 'Reminder deleted' });
  } catch (error) {
    console.error('Delete reminder error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Bulk operations
router.post('/bulk', auth, async (req, res) => {
  try {
    const { action, reminderIds, data } = req.body;

    const query = {
      _id: { $in: reminderIds },
      userId: req.userId
    };

    let result;
    switch (action) {
      case 'complete':
        result = await Reminder.updateMany(query, {
          isCompleted: true,
          completedAt: new Date()
        });
        break;
      case 'incomplete':
        result = await Reminder.updateMany(query, {
          isCompleted: false,
          $unset: { completedAt: 1 }
        });
        break;
      case 'delete':
        result = await Reminder.deleteMany(query);
        break;
      case 'priority':
        result = await Reminder.updateMany(query, {
          priority: data.priority
        });
        break;
      default:
        return res.status(400).json({ message: 'Invalid action' });
    }

    res.json({ 
      message: `Bulk ${action} completed`, 
      modifiedCount: result.modifiedCount || result.deletedCount 
    });
  } catch (error) {
    console.error('Bulk reminder operation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;