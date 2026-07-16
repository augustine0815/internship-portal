const { Application, Internship, StudentProfile, CompanyProfile, User } = require('../models');
const { createNotification } = require('../utils/notificationHelper');
// APPLY to internship (student only)
const applyToInternship = async (req, res) => {
  try {
    const student = await StudentProfile.findOne({ where: { user_id: req.user.id } });
    if (!student) return res.status(404).json({ message: 'Student profile not found' });

    const internship = await Internship.findByPk(req.params.id);
    if (!internship) return res.status(404).json({ message: 'Internship not found' });
    if (internship.status !== 'open') {
      return res.status(400).json({ message: 'Internship is not open for applications' });
    }

    // Check duplicate
    const existing = await Application.findOne({
      where: { internship_id: req.params.id, student_id: student.id },
    });
    if (existing) return res.status(400).json({ message: 'Already applied to this internship' });

    const application = await Application.create({
      internship_id: req.params.id,
      student_id: student.id,
      cover_letter: req.body.cover_letter || '',
      status: 'applied',
    });
    // Notify company about new application
    const companyUser = await User.findByPk(
      (await CompanyProfile.findByPk(internship.company_id)).user_id
    );
    await createNotification({
      user_id: companyUser.id,
      type: 'new_application',
      title: 'New Application Received',
      body: `A student applied to your internship: ${internship.title}`,
      related_entity_type: 'application',
      related_entity_id: application.id,
      email: companyUser.email,
    });

    return res.status(201).json({ message: 'Application submitted', application });
  } catch (error) {
    console.error('applyToInternship error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// GET student's own applications
const getMyApplications = async (req, res) => {
  try {
    const student = await StudentProfile.findOne({ where: { user_id: req.user.id } });
    if (!student) return res.status(404).json({ message: 'Student profile not found' });

    const applications = await Application.findAll({
      where: { student_id: student.id },
      include: [{
        model: Internship,
        as: 'internship',
        include: [{ model: CompanyProfile, as: 'company', attributes: ['company_name', 'logo_url'] }],
      }],
      order: [['applied_at', 'DESC']],
    });

    return res.status(200).json({ applications });
  } catch (error) {
    console.error('getMyApplications error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// GET all applicants for an internship (company only)
const getApplicantsForInternship = async (req, res) => {
  try {
    const company = await CompanyProfile.findOne({ where: { user_id: req.user.id } });
    if (!company) return res.status(404).json({ message: 'Company profile not found' });

    const internship = await Internship.findOne({
      where: { id: req.params.id, company_id: company.id },
    });
    if (!internship) return res.status(404).json({ message: 'Internship not found' });

    const applications = await Application.findAll({
      where: { internship_id: req.params.id },
      include: [{
        model: StudentProfile,
        as: 'student',
        attributes: ['full_name', 'university', 'degree', 'skills', 'resume_url', 'profile_photo_url'],
      }],
      order: [['applied_at', 'DESC']],
    });

    return res.status(200).json({ applications });
  } catch (error) {
    console.error('getApplicantsForInternship error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// UPDATE application status (company only)
const updateApplicationStatus = async (req, res) => {
  try {
    const company = await CompanyProfile.findOne({ where: { user_id: req.user.id } });
    if (!company) return res.status(404).json({ message: 'Company profile not found' });

    const application = await Application.findByPk(req.params.id, {
      include: [{ model: Internship, as: 'internship' }],
    });
    if (!application) return res.status(404).json({ message: 'Application not found' });
    if (application.internship.company_id !== company.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { status } = req.body;
    const allowed = ['under_review', 'shortlisted', 'rejected', 'offered'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    await application.update({ status });
    // Notify student about status change
    const studentUser = await User.findByPk(
      (await StudentProfile.findByPk(application.student_id)).user_id
    );
    await createNotification({
      user_id: studentUser.id,
      type: 'application_status',
      title: 'Application Status Updated',
      body: `Your application status changed to: ${status}`,
      related_entity_type: 'application',
      related_entity_id: application.id,
      email: studentUser.email,
    });
    return res.status(200).json({ message: 'Application status updated', application });
  } catch (error) {
    console.error('updateApplicationStatus error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// WITHDRAW application (student only)
const withdrawApplication = async (req, res) => {
  try {
    const student = await StudentProfile.findOne({ where: { user_id: req.user.id } });
    if (!student) return res.status(404).json({ message: 'Student profile not found' });

    const application = await Application.findOne({
      where: { id: req.params.id, student_id: student.id },
    });
    if (!application) return res.status(404).json({ message: 'Application not found' });
    if (application.status === 'withdrawn') {
      return res.status(400).json({ message: 'Application already withdrawn' });
    }

    await application.update({ status: 'withdrawn' });
    return res.status(200).json({ message: 'Application withdrawn' });
  } catch (error) {
    console.error('withdrawApplication error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  applyToInternship,
  getMyApplications,
  getApplicantsForInternship,
  updateApplicationStatus,
  withdrawApplication,
};