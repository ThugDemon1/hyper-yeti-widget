import mongoose from 'mongoose';

const savedSearchSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  query: {
    type: String,
    default: ''
  },
  filters: {
    type: Object,
    default: {}
  }
}, {
  timestamps: true
});

export default mongoose.model('SavedSearch', savedSearchSchema); 