import express from 'express';
import path from 'path';
import { promises as fs } from 'fs';
import auth from '../middleware/auth.js';

const router = express.Router();

// Upload file
router.post('/', auth, async (req, res) => {
  try {
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({ message: 'No files were uploaded' });
    }

    const file = req.files.file;
    const allowedTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf', 'text/plain', 'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];

    if (!allowedTypes.includes(file.mimetype)) {
      return res.status(400).json({ message: 'File type not allowed' });
    }

    // Create unique filename
    const timestamp = Date.now();
    const extension = path.extname(file.name);
    const filename = `${req.userId}_${timestamp}${extension}`;
    const uploadPath = path.join(process.cwd(), 'server/uploads', filename);

    // Ensure uploads directory exists
    const uploadsDir = path.join(process.cwd(), 'server/uploads');
    try {
      await fs.access(uploadsDir);
    } catch {
      await fs.mkdir(uploadsDir, { recursive: true });
    }

    // Move file to uploads directory
    await file.mv(uploadPath);

    const fileInfo = {
      filename,
      originalName: file.name,
      url: `/uploads/${filename}`,
      type: file.mimetype,
      size: file.size,
      uploadedAt: new Date()
    };

    res.json(fileInfo);
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Upload failed' });
  }
});

// Delete file
router.delete('/:filename', auth, async (req, res) => {
  try {
    const filename = req.params.filename;
    
    // Security check: ensure filename belongs to user
    if (!filename.startsWith(`${req.userId}_`)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const filePath = path.join(process.cwd(), 'server/uploads', filename);

    try {
      await fs.unlink(filePath);
      res.json({ message: 'File deleted successfully' });
    } catch (error) {
      if (error.code === 'ENOENT') {
        res.status(404).json({ message: 'File not found' });
      } else {
        throw error;
      }
    }
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({ message: 'Delete failed' });
  }
});

// Get file info
router.get('/:filename', auth, async (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(process.cwd(), 'server/uploads', filename);

    try {
      const stats = await fs.stat(filePath);
      res.json({
        filename,
        size: stats.size,
        uploadedAt: stats.birthtime,
        url: `/uploads/${filename}`
      });
    } catch (error) {
      if (error.code === 'ENOENT') {
        res.status(404).json({ message: 'File not found' });
      } else {
        throw error;
      }
    }
  } catch (error) {
    console.error('Get file info error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;