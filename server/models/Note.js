import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    default: 'Untitled'
  },
  content: {
    type: String,
    default: ''
  },
  plainTextContent: {
    type: String,
    default: ''
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  notebookId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Notebook',
    required: true
  },
  tags: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tag'
  }],
  attachments: [{
    filename: String,
    originalName: String,
    url: String,
    type: String,
    size: Number,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  isPinned: {
    type: Boolean,
    default: false
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: Date,
  reminderDate: Date,
  reminderCompleted: {
    type: Boolean,
    default: false
  },
  reminderNotified: {
    type: Boolean,
    default: false
  },
  wordCount: {
    type: Number,
    default: 0
  },
  lastViewedAt: {
    type: Date,
    default: Date.now
  },
  version: {
    type: Number,
    default: 1
  },
  collaborators: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    permission: {
      type: String,
      enum: ['read', 'write', 'admin'],
      default: 'read'
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  shareSettings: {
    isPublic: {
      type: Boolean,
      default: false
    },
    publicUrl: String,
    allowComments: {
      type: Boolean,
      default: false
    }
  },
  history: [{
    title: String,
    content: String,
    plainTextContent: String,
    attachments: [
      {
        filename: String,
        originalName: String,
        url: String,
        type: String,
        size: Number,
        uploadedAt: Date
      }
    ],
    tags: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tag' }],
    updatedAt: Date,
    version: Number
  }],
  reminderRecurring: {
    frequency: {
      type: String,
      enum: ['none', 'daily', 'weekly', 'monthly', 'yearly'],
      default: 'none'
    },
    interval: {
      type: Number,
      default: 1
    },
    daysOfWeek: [Number] // For weekly recurrence (0=Sunday, 6=Saturday)
  },
}, {
  timestamps: true
});

// Indexes for better query performance
noteSchema.index({ userId: 1, isDeleted: 1 });
noteSchema.index({ notebookId: 1, isDeleted: 1 });
noteSchema.index({ userId: 1, isPinned: 1 });
noteSchema.index({ userId: 1, lastViewedAt: -1 });
noteSchema.index({ userId: 1, updatedAt: -1 });
noteSchema.index({ tags: 1 });
noteSchema.index({ title: 'text', content: 'text', plainTextContent: 'text' });

// Virtual for excerpt
noteSchema.virtual('excerpt').get(function() {
  return this.plainTextContent.substring(0, 150) + (this.plainTextContent.length > 150 ? '...' : '');
});

// Pre-save middleware to update word count
noteSchema.pre('save', function(next) {
  if (this.plainTextContent) {
    this.wordCount = this.plainTextContent.trim().split(/\s+/).length;
  }
  next();
});

export default mongoose.model('Note', noteSchema);