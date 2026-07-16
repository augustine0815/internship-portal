const { Internship, CompanyProfile, Application, StudentProfile } = require('../models');
const { Op } = require('sequelize');

// CREATE internship (company only)
const createInternship = async (req, res) => {
  try {
    const company = await CompanyProfile.findOne({ where: { user_id: req.user.id } });
    if (!company) return res.status(404).json({ message: 'Company profile not found' });

    const {
      title, description, required_skills, location,
      is_remote, stipend, duration_weeks, openings, application_deadline,
    } = req.body;

    const internship = await Internship.create({
      company_id: company.id,
      title, description, required_skills, location,
      is_remote, stipend, duration_weeks, openings,
      application_deadline, status: 'draft',
    });

    return res.status(201).json({ message: 'Internship created', internship });
  } catch (error) {
    console.error('createInternship error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// GET ALL internships (public, open only, with filters)
const getAllInternships = async (req, res) => {
  try {
    const { skill, location, is_remote, search } = req.query;
    const where = { status: 'open' };

    if (location) where.location = { [Op.like]: `%${location}%` };
    if (is_remote !== undefined) where.is_remote = is_remote === 'true';
    if (search) where.title = { [Op.like]: `%${search}%` };

    const internships = await Internship.findAll({
      where,
      include: [{
        model: CompanyProfile,
        as: 'company',
        attributes: ['company_name', 'logo_url', 'industry'],
      }],
      order: [['created_at', 'DESC']],
    });

    return res.status(200).json({ internships });
  } catch (error) {
    console.error('getAllInternships error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// GET single internship
const getInternshipById = async (req, res) => {
  try {
    const internship = await Internship.findByPk(req.params.id, {
      include: [{
        model: CompanyProfile,
        as: 'company',
        attributes: ['company_name', 'logo_url', 'industry', 'website', 'description'],
      }],
    });

    if (!internship) return res.status(404).json({ message: 'Internship not found' });

    return res.status(200).json({ internship });
  } catch (error) {
    console.error('getInternshipById error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// UPDATE internship (company only, must own it)
const updateInternship = async (req, res) => {
  try {
    const company = await CompanyProfile.findOne({ where: { user_id: req.user.id } });
    if (!company) return res.status(404).json({ message: 'Company profile not found' });

    const internship = await Internship.findOne({
      where: { id: req.params.id, company_id: company.id },
    });
    if (!internship) return res.status(404).json({ message: 'Internship not found' });

    await internship.update(req.body);
    return res.status(200).json({ message: 'Internship updated', internship });
  } catch (error) {
    console.error('updateInternship error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// UPDATE status (open/close)
const updateInternshipStatus = async (req, res) => {
  try {
    const company = await CompanyProfile.findOne({ where: { user_id: req.user.id } });
    if (!company) return res.status(404).json({ message: 'Company profile not found' });

    const internship = await Internship.findOne({
      where: { id: req.params.id, company_id: company.id },
    });
    if (!internship) return res.status(404).json({ message: 'Internship not found' });

    const { status } = req.body;
    if (!['draft', 'open', 'closed', 'filled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    await internship.update({ status });
    return res.status(200).json({ message: 'Status updated', internship });
  } catch (error) {
    console.error('updateInternshipStatus error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// DELETE internship
const deleteInternship = async (req, res) => {
  try {
    const company = await CompanyProfile.findOne({ where: { user_id: req.user.id } });
    if (!company) return res.status(404).json({ message: 'Company profile not found' });

    const internship = await Internship.findOne({
      where: { id: req.params.id, company_id: company.id },
    });
    if (!internship) return res.status(404).json({ message: 'Internship not found' });

    await internship.destroy();
    return res.status(200).json({ message: 'Internship deleted' });
  } catch (error) {
    console.error('deleteInternship error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// GET company's own internships
const getMyInternships = async (req, res) => {
  try {
    const company = await CompanyProfile.findOne({ where: { user_id: req.user.id } });
    if (!company) return res.status(404).json({ message: 'Company profile not found' });

    const internships = await Internship.findAll({
      where: { company_id: company.id },
      order: [['created_at', 'DESC']],
    });

    return res.status(200).json({ internships });
  } catch (error) {
    console.error('getMyInternships error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createInternship,
  getAllInternships,
  getInternshipById,
  updateInternship,
  updateInternshipStatus,
  deleteInternship,
  getMyInternships,
};