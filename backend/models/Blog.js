// models/Blog.js
import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const blogSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  content: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  author: {
    type: String,
    default: 'Gifting Team',
  },
  category: {
    type: String,
    enum: ['Kinh nghiệm', 'Cách chọn quà', 'Ý tưởng quà tặng', 'Khác'],
    default: 'Khác',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default model('Blog', blogSchema);
