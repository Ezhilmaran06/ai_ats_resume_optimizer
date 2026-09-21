const multer = require('multer');

// Memory storage for fast buffer processing without disk file clutter
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
    'text/plain'
  ];

  const allowedExtensions = ['.pdf', '.docx', '.txt'];
  const hasValidExt = allowedExtensions.some(ext => file.originalname.toLowerCase().endsWith(ext));

  if (allowedMimeTypes.includes(file.mimetype) || hasValidExt) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, DOCX, and TXT documents are allowed.'), false);
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5 MB limit
  },
  fileFilter
});

module.exports = upload;
