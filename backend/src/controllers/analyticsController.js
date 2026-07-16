const { Application, Internship, Offer, User, sequelize } = require('../models');
const { Op } = require('sequelize');

// Applications over time
const getApplicationsOverTime = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const applications = await Application.findAll({
      where: {
        applied_at: { [Op.gte]: startDate },
      },
      attributes: [
        [sequelize.fn('DATE', sequelize.col('applied_at')), 'date'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
      ],
      group: [sequelize.fn('DATE', sequelize.col('applied_at'))],
      order: [[sequelize.fn('DATE', sequelize.col('applied_at')), 'ASC']],
      raw: true,
    });

    return res.status(200).json({ applications_over_time: applications });
  } catch (error) {
    console.error('getApplicationsOverTime error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Conversion funnel
const getConversionFunnel = async (req, res) => {
  try {
    const [
      applied,
      under_review,
      shortlisted,
      offered,
      accepted,
    ] = await Promise.all([
      Application.count(),
      Application.count({ where: { status: 'under_review' } }),
      Application.count({ where: { status: 'shortlisted' } }),
      Application.count({ where: { status: 'offered' } }),
      Offer.count({ where: { status: 'accepted' } }),
    ]);

    return res.status(200).json({
      funnel: [
        { stage: 'Applied', count: applied },
        { stage: 'Under Review', count: under_review },
        { stage: 'Shortlisted', count: shortlisted },
        { stage: 'Offered', count: offered },
        { stage: 'Accepted', count: accepted },
      ],
    });
  } catch (error) {
    console.error('getConversionFunnel error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Top skills demanded
const getTopSkills = async (req, res) => {
  try {
    const internships = await Internship.findAll({
      attributes: ['required_skills'],
      where: { status: 'open' },
      raw: true,
    });

    // Count skill frequency
    const skillCount = {};
    internships.forEach(internship => {
      const skills = internship.required_skills || [];
      const skillArray = typeof skills === 'string' ? JSON.parse(skills) : skills;
      skillArray.forEach(skill => {
        skillCount[skill] = (skillCount[skill] || 0) + 1;
      });
    });

    // Sort by count
    const topSkills = Object.entries(skillCount)
      .map(([skill, count]) => ({ skill, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return res.status(200).json({ top_skills: topSkills });
  } catch (error) {
    console.error('getTopSkills error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Company activity
const getCompanyActivity = async (req, res) => {
  try {
    const internships = await Internship.findAll({
      attributes: [
        'company_id',
        [sequelize.fn('COUNT', sequelize.col('Internship.id')), 'total_postings'],
        [sequelize.fn('SUM',
          sequelize.literal(`CASE WHEN status = 'filled' THEN 1 ELSE 0 END`)
        ), 'filled_postings'],
      ],
      include: [{
        model: require('../models').CompanyProfile,
        as: 'company',
        attributes: ['company_name'],
      }],
      group: ['company_id', 'company.id', 'company.company_name'],
      raw: false,
    });

    const activity = internships.map(i => ({
      company_name: i.company?.company_name,
      total_postings: parseInt(i.dataValues.total_postings),
      filled_postings: parseInt(i.dataValues.filled_postings) || 0,
      fill_rate: i.dataValues.total_postings > 0
        ? Math.round((i.dataValues.filled_postings / i.dataValues.total_postings) * 100)
        : 0,
    }));

    return res.status(200).json({ company_activity: activity });
  } catch (error) {
    console.error('getCompanyActivity error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Overall placement rate
const getPlacementRate = async (req, res) => {
  try {
    const total_applications = await Application.count();
    const total_accepted = await Offer.count({ where: { status: 'accepted' } });
    const total_students = await User.count({ where: { role: 'student' } });
    const students_placed = await Offer.count({
      where: { status: 'accepted' },
      distinct: true,
    });

    const placement_rate = total_students > 0
      ? Math.round((students_placed / total_students) * 100)
      : 0;

    const acceptance_rate = total_applications > 0
      ? Math.round((total_accepted / total_applications) * 100)
      : 0;

    return res.status(200).json({
      placement: {
        total_students,
        students_placed,
        placement_rate: `${placement_rate}%`,
        total_applications,
        total_accepted,
        acceptance_rate: `${acceptance_rate}%`,
      },
    });
  } catch (error) {
    console.error('getPlacementRate error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getApplicationsOverTime,
  getConversionFunnel,
  getTopSkills,
  getCompanyActivity,
  getPlacementRate,
};