import mongoose from 'mongoose';

const sharedNoteSchema = new mongoose.Schema({
  noteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Note',
    required: true
  },
  sharedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sharedWith: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  permission: {
    type: String,
    enum: ['read', 'write', 'admin'],
    default: 'read'
  },
  shareToken: {
    type: String,
    unique: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  expiresAt: Date,
  lastAccessedAt: Date
}, {
  timestamps: true
});

// Indexes for better query performance
sharedNoteSchema.index({ noteId: 1, sharedWith: 1 });
sharedNoteSchema.index({ sharedWith: 1, isActive: 1 });

export default mongoose.model('SharedNote', sharedNoteSchema);