const { StudentProfile, User } = require('../models');
const { uploadFile } = require('../services/s3Service');

// GET my profile
const getMyProfile = async (req, res) => {
  try {
    const profile = await StudentProfile.findOne({
      where: { user_id: req.user.id },
      include: [{ model: User, as: 'user', attributes: ['email', 'created_at'] }],
    });

    if (!profile) return res.status(404).json({ message: 'Profile not found' });

    // Calculate profile completion
    const fields = ['full_name', 'phone', 'university', 'degree',
      'start_year', 'bio', 'resume_url', 'profile_photo_url'];
    const filled = fields.filter(f => profile[f]).length;
    const completion = Math.round((filled / fields.length) * 100);

    return res.status(200).json({ profile, completion });
  } catch (error) {
    console.error('getMyProfile error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// UPDATE my profile
const updateMyProfile = async (req, res) => {
  try {
    const profile = await StudentProfile.findOne({
      where: { user_id: req.user.id },
    });

    if (!profile) return res.status(404).json({ message: 'Profile not found' });

    const {
      full_name, phone, university, degree,
      start_year, bio, skills,
    } = req.body;

    await profile.update({
      full_name, phone, university, degree,
      start_year: start_year === '' ? null : start_year,
      bio, skills,
    });

    return res.status(200).json({ message: 'Profile updated', profile });
  } catch (error) {
    console.error('updateMyProfile error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// UPLOAD profile photo
const uploadProfilePhoto = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const result = await uploadFile(req.file, 'profile-photos');
    if (!result.success) return res.status(500).json({ message: 'Upload failed' });

    await StudentProfile.update(
      { profile_photo_url: result.url },
      { where: { user_id: req.user.id } }
    );

    return res.status(200).json({ message: 'Photo uploaded', url: result.url });
  } catch (error) {
    console.error('uploadProfilePhoto error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// GET public profile by student id
const getStudentProfile = async (req, res) => {
  try {
    const profile = await StudentProfile.findByPk(req.params.id, {
      attributes: ['full_name', 'university', 'degree',
        'skills', 'bio', 'profile_photo_url'],
    });

    if (!profile) return res.status(404).json({ message: 'Profile not found' });
    return res.status(200).json({ profile });
  } catch (error) {
    console.error('getStudentProfile error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// GET my grades
const getMyGrades = async (req, res) => {
  try {
    const { Grade, User } = require('../models');
    const profile = await StudentProfile.findOne({ where: { user_id: req.user.id } });
    if (!profile) return res.status(404).json({ message: 'Profile not found' });

    const grades = await Grade.findAll({
      where: { student_id: profile.id },
      include: [{ model: User, as: 'coordinator', attributes: ['email'] }],
      order: [['created_at', 'DESC']],
    });

    return res.status(200).json({ grades, student: profile });
  } catch (error) {
    console.error('getMyGrades error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getMyProfile,
  updateMyProfile,
  uploadProfilePhoto,
  getStudentProfile,
  getMyGrades,
};