import mongoose from 'mongoose';

const tagSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  color: {
    type: String,
    default: '#10B981'
  },
  noteCount: {
    type: Number,
    default: 0
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  parentTag: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tag'
  }
}, {
  timestamps: true
});

// Compound index to ensure unique tag names per user
tagSchema.index({ name: 1, userId: 1 }, { unique: true });

export default mongoose.model('Tag', tagSchema);