import mongoose from 'mongoose';

const shortcutSchema = new mongoose.Schema({
  name: {
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
  type: {
    type: String,
    enum: ['note', 'notebook', 'tag', 'search', 'url'],
    required: true
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'targetModel'
  },
  targetModel: {
    type: String,
    enum: ['Note', 'Notebook', 'Tag'],
    required: function() {
      return this.type !== 'url' && this.type !== 'search';
    }
  },
  url: {
    type: String,
    required: function() {
      return this.type === 'url';
    }
  },
  searchQuery: {
    type: String,
    required: function() {
      return this.type === 'search';
    }
  },
  icon: {
    type: String,
    default: 'link'
  },
  color: {
    type: String,
    default: '#6B7280'
  },
  sortOrder: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance
shortcutSchema.index({ userId: 1, isActive: 1 });
shortcutSchema.index({ userId: 1, sortOrder: 1 });

export default mongoose.model('Shortcut', shortcutSchema);