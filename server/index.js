import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import fileUpload from 'express-fileupload';
import path from 'path';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cron from 'node-cron';
import nodemailer from 'nodemailer';
import Note from './models/Note.js';
import User from './models/User.js';

// Import routes
import authRoutes from './routes/auth.js';
import notesRoutes from './routes/notes.js';
import notebooksRoutes from './routes/notebooks.js';
import tagsRoutes from './routes/tags.js';
import sharingRoutes from './routes/sharing.js';
import remindersRoutes from './routes/reminders.js';
import searchRoutes from './routes/search.js';
import uploadRoutes from './routes/upload.js';
import usersRoutes from './routes/users.js';

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(fileUpload({
  createParentPath: true,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max file size
}));

// Serve uploaded files
app.use('/uploads', express.static(path.join(process.cwd(), 'server/uploads')));

// MongoDB connection
mongoose.connect('mongodb+srv://zeeshantidi259:hyperking@cluster0.s17pj.mongodb.net/evernote-clone?retryWrites=true&w=majority')
.then(() => console.log('MongoDB connected successfully'))
.catch(err => console.error('MongoDB connection error:', err));

// Socket.io for real-time features
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-note', (noteId) => {
    socket.join(`note-${noteId}`);
  });

  socket.on('note-update', (data) => {
    socket.to(`note-${data.noteId}`).emit('note-updated', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Make io available to routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Email transporter (use Ethereal for dev, or configure real SMTP)
const transporter = nodemailer.createTransport({
  host: 'smtp.ethereal.email',
  port: 587,
  auth: {
    user: process.env.ETHEREAL_USER,
    pass: process.env.ETHEREAL_PASS,
  },
});

// Scheduled job: check for due reminders every minute (optimized)
cron.schedule('* * * * *', async () => {
  try {
    const now = new Date();
    // Limit to 10 notes per minute
    const notes = await Note.find({
      reminderDate: { $lte: now },
      reminderCompleted: false,
      'reminderNotified': { $ne: true },
    }).populate('userId', 'email').limit(10);

    await Promise.all(notes.map(async (note) => {
      if (note.userId && note.userId.email) {
        await transporter.sendMail({
          from: 'no-reply@yourapp.com',
          to: note.userId.email,
          subject: `Reminder: ${note.title}`,
          text: `Your note "${note.title}" has a reminder due now.\n\nContent: ${note.plainTextContent?.slice(0, 200)}`,
        });
      }
      note.reminderNotified = true;
      await note.save();
    }));
  } catch (err) {
    console.error('Reminder notification error:', err);
  }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/notebooks', notebooksRoutes);
app.use('/api/tags', tagsRoutes);
app.use('/api/sharing', sharingRoutes);
app.use('/api/reminders', remindersRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/users', usersRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});