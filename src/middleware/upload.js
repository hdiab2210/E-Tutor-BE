// middleware/upload.js
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'src/uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  }
});

// Optional: file filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpg|jpeg|png/;
  const isValid = allowedTypes.test(file.mimetype);

  if (isValid) cb(null, true);
  else cb(new Error('Only images are allowed'));
};

const upload = multer({ storage, fileFilter });

module.exports = upload;