const { User, StudentProfile, CompanyProfile, Internship, Application, Offer } = require('../models');
const { Op } = require('sequelize');

// GET overview counts
const getOverview = async (req, res) => {
  try {
    const [
      total_students,
      total_companies,
      total_internships,
      total_applications,
      total_offers,
      pending_approvals,
    ] = await Promise.all([
      User.count({ where: { role: 'student' } }),
      User.count({ where: { role: 'company' } }),
      Internship.count(),
      Application.count(),
      Offer.count(),
      Internship.count({ where: { approved_by_admin: false, status: 'open' } }),
    ]);

    return res.status(200).json({
      overview: {
        total_students,
        total_companies,
        total_internships,
        total_applications,
        total_offers,
        pending_approvals,
      },
    });
  } catch (error) {
    console.error('getOverview error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// GET all users with search and filter
const getAllUsers = async (req, res) => {
  try {
    const { role, search, page = 1, limit = 10 } = req.query;
    const where = {};

    if (role) where.role = role;
    if (search) {
      where.email = { [Op.like]: `%${search}%` };
    }

    const offset = (page - 1) * limit;

    const { count, rows: users } = await User.findAndCountAll({
      where,
      attributes: ['id', 'email', 'role', 'is_verified', 'created_at'],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']],
    });

    return res.status(200).json({
      users,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        total_pages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.error('getAllUsers error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// SUSPEND or ACTIVATE a user
const updateUserStatus = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Prevent admin from suspending themselves
    if (Number(user.id) === Number(req.user.id)) {
      return res.status(400).json({ message: 'Cannot modify your own account' });
    }

    const { is_verified } = req.body;
    await user.update({ is_verified });

    return res.status(200).json({
      message: `User ${is_verified ? 'activated' : 'suspended'} successfully`,
      user: { id: user.id, email: user.email, is_verified: user.is_verified },
    });
  } catch (error) {
    console.error('updateUserStatus error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// GET all internships (with approval filter)
const getAllInternships = async (req, res) => {
  try {
    const { status, approved, page = 1, limit = 10 } = req.query;
    const where = {};

    if (status) where.status = status;
    if (approved !== undefined) where.approved_by_admin = approved === 'true';

    const offset = (page - 1) * limit;

    const { count, rows: internships } = await Internship.findAndCountAll({
      where,
      include: [{
        model: CompanyProfile,
        as: 'company',
        attributes: ['company_name', 'industry'],
      }],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']],
    });

    return res.status(200).json({
      internships,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        total_pages: Math.ceil(count / limit),
      },
    });
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

// VERIFY company
const verifyCompany = async (req, res) => {
  try {
    const company = await CompanyProfile.findOne({
      where: { user_id: req.params.userId },
    });
    if (!company) return res.status(404).json({ message: 'Company not found' });

    await company.update({ verified_by_admin: true });

    return res.status(200).json({
      message: 'Company verified successfully',
      company,
    });
  } catch (error) {
    console.error('verifyCompany error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getOverview,
  getAllUsers,
  updateUserStatus,
  getAllInternships,
  updateInternshipApproval,
  verifyCompany,
};