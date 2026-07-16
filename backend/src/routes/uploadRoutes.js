const express = require('express');
const router = express.Router();
const multer = require('multer');
const { uploadFile } = require('../services/s3Service');
const { authenticate } = require('../middleware/auth');
const { StudentProfile, CompanyProfile } = require('../models');

// Store files in memory before uploading to S3
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// Upload resume (student only)
router.post('/resume', authenticate, upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const result = await uploadFile(req.file, 'resumes');
    if (!result.success) return res.status(500).json({ message: 'Upload failed' });

    // Update student profile with resume URL
    await StudentProfile.update(
      { resume_url: result.url },
      { where: { user_id: req.user.id } }
    );

    return res.status(200).json({ message: 'Resume uploaded', url: result.url });
  } catch (error) {
    console.error('Upload resume error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Upload company logo
router.post('/logo', authenticate, upload.single('logo'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const result = await uploadFile(req.file, 'logos');
    if (!result.success) return res.status(500).json({ message: 'Upload failed' });

    await CompanyProfile.update(
      { logo_url: result.url },
      { where: { user_id: req.user.id } }
    );

    return res.status(200).json({ message: 'Logo uploaded', url: result.url });
  } catch (error) {
    console.error('Upload logo error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;