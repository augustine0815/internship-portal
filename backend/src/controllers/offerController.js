const { Offer, Application, Internship, CompanyProfile, StudentProfile, User } = require('../models');
const { createNotification } = require('../utils/notificationHelper');
// CREATE offer (company only)
const createOffer = async (req, res) => {
  try {
    const company = await CompanyProfile.findOne({ where: { user_id: req.user.id } });
    if (!company) return res.status(404).json({ message: 'Company profile not found' });

    const application = await Application.findByPk(req.params.applicationId, {
      include: [{ model: Internship, as: 'internship' }],
    });
    if (!application) return res.status(404).json({ message: 'Application not found' });

    // Make sure the internship belongs to this company
    if (Number(application.internship.company_id) !== Number(company.id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Check if offer already exists
    const existingOffer = await Offer.findOne({
      where: { application_id: req.params.applicationId },
    });
    if (existingOffer) {
      return res.status(400).json({ message: 'Offer already sent for this application' });
    }

    const { offered_stipend, start_date, end_date } = req.body;

    const offer = await Offer.create({
      application_id: req.params.applicationId,
      offered_stipend,
      start_date,
      end_date,
      status: 'pending',
    });

    // Update application status to offered
    await application.update({ status: 'offered' });
    // Notify student about new offer
    const studentProfile = await StudentProfile.findByPk(application.student_id);
    const studentUser = await User.findByPk(studentProfile.user_id);
    await createNotification({
      user_id: studentUser.id,
      type: 'new_offer',
      title: 'You Have a New Offer!',
      body: `You received an offer for your internship application. Stipend: RM${offered_stipend}`,
      related_entity_type: 'offer',
      related_entity_id: offer.id,
      email: studentUser.email,
    });

    return res.status(201).json({ message: 'Offer sent successfully', offer });
  } catch (error) {
    console.error('createOffer error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// GET student's received offers
const getMyOffers = async (req, res) => {
  try {
    const student = await StudentProfile.findOne({ where: { user_id: req.user.id } });
    if (!student) return res.status(404).json({ message: 'Student profile not found' });

    const applications = await Application.findAll({
      where: { student_id: student.id },
      include: [
        {
          model: Offer,
          as: 'offer',
          required: true,
        },
        {
          model: Internship,
          as: 'internship',
          include: [{
            model: CompanyProfile,
            as: 'company',
            attributes: ['company_name', 'logo_url'],
          }],
        },
      ],
    });

    const offers = applications.map(app => ({
      ...app.offer.toJSON(),
      internship: app.internship,
    }));

    return res.status(200).json({ offers });
  } catch (error) {
    console.error('getMyOffers error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// GET offers sent by company
const getCompanyOffers = async (req, res) => {
  try {
    const company = await CompanyProfile.findOne({ where: { user_id: req.user.id } });
    if (!company) return res.status(404).json({ message: 'Company profile not found' });

    const internships = await Internship.findAll({
      where: { company_id: company.id },
      include: [{
        model: Application,
        as: 'applications',
        include: [
          { model: Offer, as: 'offer', required: true },
          {
            model: StudentProfile,
            as: 'student',
            attributes: ['full_name', 'university', 'profile_photo_url'],
          },
        ],
      }],
    });

    const offers = [];
    internships.forEach(internship => {
      internship.applications.forEach(app => {
        if (app.offer) {
          offers.push({
            ...app.offer.toJSON(),
            student: app.student,
            internship_title: internship.title,
          });
        }
      });
    });

    return res.status(200).json({ offers });
  } catch (error) {
    console.error('getCompanyOffers error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// RESPOND to offer (student only — accept or decline)
const respondToOffer = async (req, res) => {
  try {
    const student = await StudentProfile.findOne({ where: { user_id: req.user.id } });
    if (!student) return res.status(404).json({ message: 'Student profile not found' });

    const offer = await Offer.findByPk(req.params.offerId, {
      include: [{
        model: Application,
        as: 'application',
      }],
    });
    if (!offer) return res.status(404).json({ message: 'Offer not found' });

    // Make sure this offer belongs to the student
    if (Number(offer.application.student_id) !== Number(student.id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (offer.status !== 'pending') {
      return res.status(400).json({ message: `Offer already ${offer.status}` });
    }

    const { decision } = req.body;
    if (!['accepted', 'declined'].includes(decision)) {
      return res.status(400).json({ message: 'Decision must be accepted or declined' });
    }

    await offer.update({
      status: decision,
      responded_at: new Date(),
    });

    if (decision === 'accepted') {
      await offer.application.update({ status: 'hired' });
    }
    // Notify company about student response
    const internship = await Internship.findByPk(offer.application.internship_id);
    const companyProfile = await CompanyProfile.findByPk(internship.company_id);
    const companyUser = await User.findByPk(companyProfile.user_id);
    await createNotification({
      user_id: companyUser.id,
      type: 'offer_response',
      title: `Offer ${decision.charAt(0).toUpperCase() + decision.slice(1)}`,
      body: `A student has ${decision} your internship offer for: ${internship.title}`,
      related_entity_type: 'offer',
      related_entity_id: offer.id,
      email: companyUser.email,
    });

    return res.status(200).json({
      message: `Offer ${decision} successfully`,
      offer,
    });
  } catch (error) {
    console.error('respondToOffer error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { createOffer, getMyOffers, getCompanyOffers, respondToOffer };