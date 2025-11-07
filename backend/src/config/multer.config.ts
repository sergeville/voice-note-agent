import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure upload directories exist
const uploadDirs = [
  './uploads/audio',
  './uploads/processed',
  './uploads/exports',
  './uploads/temp'
];

uploadDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads/audio');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

export const upload = multer({ 
  storage,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB limit
  fileFilter: (req, file, cb) => {
    const allowedExtensions = /\.(mp3|wav|m4a|flac|ogg|webm)$/i;
    const hasValidExtension = allowedExtensions.test(file.originalname);

    if (hasValidExtension) {
      return cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed (mp3, wav, m4a, flac, ogg, webm)'));
    }
  }
});