import mongoose from 'mongoose';

const reminderSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  noteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Note'
  },
  dueDate: {
    type: Date,
    required: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  completedAt: Date,
  repeatType: {
    type: String,
    enum: ['none', 'daily', 'weekly', 'monthly', 'yearly'],
    default: 'none'
  },
  repeatInterval: {
    type: Number,
    default: 1
  },
  snoozeUntil: Date,
  notificationSent: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes for better query performance
reminderSchema.index({ userId: 1, dueDate: 1 });
reminderSchema.index({ userId: 1, isCompleted: 1 });
reminderSchema.index({ dueDate: 1, notificationSent: 1 });

export default mongoose.model('Reminder', reminderSchema);