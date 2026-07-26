const {
  User, StudentProfile, CompanyProfile,
  Internship, Application, Logbook, Grade, Offer
} = require('../models');
const { Op } = require('sequelize');
const { createNotification } = require('../utils/notificationHelper');

// GET coordinator dashboard overview
const getDashboardOverview = async (req, res) => {
  try {
    const [
      total_students,
      total_applications,
      pending_logbooks,
      total_internships,
      pending_approvals,
      total_grades,
    ] = await Promise.all([
      User.count({ where: { role: 'student' } }),
      Application.count(),
      Logbook.count({ where: { status: 'submitted' } }),
      Internship.count({ where: { status: 'open' } }),
      Internship.count({ where: { approved_by_admin: false, status: 'open' } }),
      Grade.count(),
    ]);

    return res.status(200).json({
      overview: {
        total_students,
        total_applications,
        pending_logbooks,
        total_internships,
        pending_approvals,
        total_grades,
      },
    });
  } catch (error) {
    console.error('getDashboardOverview error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// GET all students with their applications
const getAllStudents = async (req, res) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;
    const where = {};
    if (search) where.email = { [Op.like]: `%${search}%` };

    const { count, rows: users } = await User.findAndCountAll({
      where: { ...where, role: 'student' },
      attributes: ['id', 'email', 'created_at'],
      include: [{
        model: StudentProfile,
        as: 'studentProfile',
        attributes: ['id', 'full_name', 'university', 'degree', 'skills', 'profile_photo_url'],
        include: [{
          model: Application,
          as: 'applications',
          attributes: ['id', 'status'],
        }],
      }],
      limit: parseInt(limit),
      offset: (page - 1) * limit,
      order: [['created_at', 'DESC']],
    });

    return res.status(200).json({
      students: users,
      pagination: {
        total: count,
        page: parseInt(page),
        total_pages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.error('getAllStudents error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// GET student detail
const getStudentDetail = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: ['id', 'email', 'created_at'],
      include: [{
        model: StudentProfile,
        as: 'studentProfile',
        include: [
          {
            model: Application,
            as: 'applications',
            include: [{
              model: Internship,
              as: 'internship',
              include: [{
                model: CompanyProfile,
                as: 'company',
                attributes: ['company_name'],
              }],
            }],
          },
          {
            model: Logbook,
            as: 'logbooks',
            order: [['date', 'DESC']],
          },
          {
            model: Grade,
            as: 'grades',
          },
        ],
      }],
    });

    if (!user) return res.status(404).json({ message: 'Student not found' });
    return res.status(200).json({ student: user });
  } catch (error) {
    console.error('getStudentDetail error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// GET all submitted logbooks
const getAllLogbooks = async (req, res) => {
  try {
    const logbooks = await Logbook.findAll({
      where: { status: ['submitted', 'reviewed'] },
      include: [{
        model: StudentProfile,
        as: 'student',
        attributes: ['full_name', 'university'],
        include: [{
          model: User,
          as: 'user',
          attributes: ['email'],
        }],
      }],
      order: [['date', 'DESC']],
    });
    return res.status(200).json({ logbooks });
  } catch (error) {
    console.error('getAllLogbooks error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// REVIEW logbook
const reviewLogbook = async (req, res) => {
  try {
    const logbook = await Logbook.findByPk(req.params.id);
    if (!logbook) return res.status(404).json({ message: 'Logbook not found' });

    const { reviewer_comment } = req.body;
    await logbook.update({ status: 'reviewed', reviewer_comment });

    // Notify the student their logbook was reviewed
    const student = await StudentProfile.findByPk(logbook.student_id);
    if (student) {
      await createNotification({
        user_id: student.user_id,
        type: 'logbook_reviewed',
        title: 'Your logbook was reviewed',
        body: `Your entry "${logbook.title}" has been reviewed by your coordinator.`,
        related_entity_type: 'logbook',
        related_entity_id: logbook.id,
      });
    }

    return res.status(200).json({ message: 'Logbook reviewed', logbook });
  } catch (error) {
    console.error('reviewLogbook error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// GRADE student
const gradeStudent = async (req, res) => {
  try {
    const {
      student_id, internship_id,
      performance_score, attitude_score,
      technical_score, comments,
    } = req.body;

    if (!student_id || isNaN(student_id)) {
      return res.status(400).json({ message: 'Please select a valid student' });
    }
    if ([performance_score, attitude_score, technical_score].some(
      v => v === undefined || v === null || isNaN(v)
    )) {
      return res.status(400).json({ message: 'All three scores are required' });
    }

    const studentExists = await StudentProfile.findByPk(student_id);
    if (!studentExists) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    // Calculate overall grade
    const average = Math.round((performance_score + attitude_score + technical_score) / 3);
    let overall_grade;
    if (average >= 90) overall_grade = 'A+';
    else if (average >= 80) overall_grade = 'A';
    else if (average >= 75) overall_grade = 'B+';
    else if (average >= 70) overall_grade = 'B';
    else if (average >= 65) overall_grade = 'C+';
    else if (average >= 60) overall_grade = 'C';
    else if (average >= 50) overall_grade = 'D';
    else overall_grade = 'F';

    // Check if grade already exists
    const existing = await Grade.findOne({
      where: { student_id, internship_id: internship_id || null },
    });

    let grade;
    if (existing) {
      await existing.update({
        performance_score, attitude_score,
        technical_score, overall_grade, comments,
        coordinator_id: req.user.id,
      });
      grade = existing;
    } else {
      grade = await Grade.create({
        student_id,
        coordinator_id: req.user.id,
        internship_id: internship_id || null,
        performance_score,
        attitude_score,
        technical_score,
        overall_grade,
        comments,
      });
    }

    // Notify the student they've been graded
    await createNotification({
      user_id: studentExists.user_id,
      type: 'grade_received',
      title: 'Your performance was graded',
      body: `Your coordinator gave you an overall grade of ${overall_grade}. Check "My Grades" for details.`,
      related_entity_type: 'grade',
      related_entity_id: grade.id,
    });

    return res.status(200).json({ message: 'Grade saved successfully', grade });
  } catch (error) {
    console.error('gradeStudent error:', error);
    return res.status(500).json({ message: error.message || 'Server error' });
  }
};

// GET all grades
const getAllGrades = async (req, res) => {
  try {
    const grades = await Grade.findAll({
      include: [{
        model: StudentProfile,
        as: 'student',
        attributes: ['full_name', 'university'],
      }],
      order: [['created_at', 'DESC']],
    });
    return res.status(200).json({ grades });
  } catch (error) {
    console.error('getAllGrades error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// GET all internships for approval
const getAllInternships = async (req, res) => {
  try {
    const { status, approved } = req.query;
    const where = {};
    if (status) where.status = status;
    if (approved !== undefined) where.approved_by_admin = approved === 'true';

    const internships = await Internship.findAll({
      where,
      include: [{
        model: CompanyProfile,
        as: 'company',
        attributes: ['company_name', 'industry', 'logo_url'],
      }],
      order: [['created_at', 'DESC']],
    });

    return res.status(200).json({ internships });
  } catch (error) {
    console.error('getAllInternships error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// APPROVE or REJECT internship
const updateInternshipApproval = async (req, res) => {
  try {
    const internship = await Internship.findByPk(req.params.id);
    if (!internship) return res.status(404).json({ message: 'Internship not found' });

    const { approved } = req.body;
    await internship.update({ approved_by_admin: approved });

    return res.status(200).json({
      message: `Internship ${approved ? 'approved' : 'rejected'} successfully`,
      internship,
    });
  } catch (error) {
    console.error('updateInternshipApproval error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// GET all applications
const getAllApplications = async (req, res) => {
  try {
    const applications = await Application.findAll({
      include: [
        {
          model: StudentProfile,
          as: 'student',
          attributes: ['full_name', 'university', 'profile_photo_url'],
        },
        {
          model: Internship,
          as: 'internship',
          include: [{
            model: CompanyProfile,
            as: 'company',
            attributes: ['company_name'],
          }],
        },
      ],
      order: [['applied_at', 'DESC']],
    });

    return res.status(200).json({ applications });
  } catch (error) {
    console.error('getAllApplications error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getDashboardOverview,
  getAllStudents,
  getStudentDetail,
  getAllLogbooks,
  reviewLogbook,
  gradeStudent,
  getAllGrades,
  getAllInternships,
  updateInternshipApproval,
  getAllApplications,
};