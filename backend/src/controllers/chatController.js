const { Conversation, Message, StudentProfile, CompanyProfile, User, Internship } = require('../models');
const { Op } = require('sequelize');

// START or GET existing conversation
const startConversation = async (req, res) => {
  try {
    const { target_user_id, internship_id } = req.body;
    const currentUser = req.user;

    // Get current user's profile id
    let student_id = null;
    let company_id = null;
    let coordinator_user_id = null;

    // Find target user role
    const targetUser = await User.findByPk(target_user_id);
    if (!targetUser) return res.status(404).json({ message: 'User not found' });

    // Determine conversation participants based on roles
    if (currentUser.role === 'student') {
      const student = await StudentProfile.findOne({ where: { user_id: currentUser.id } });
      student_id = student.id;
      if (targetUser.role === 'company') {
        const company = await CompanyProfile.findOne({ where: { user_id: target_user_id } });
        company_id = company.id;
      } else if (targetUser.role === 'coordinator') {
        coordinator_user_id = target_user_id;
      }
    } else if (currentUser.role === 'company') {
      const company = await CompanyProfile.findOne({ where: { user_id: currentUser.id } });
      company_id = company.id;
      if (targetUser.role === 'student') {
        const student = await StudentProfile.findOne({ where: { user_id: target_user_id } });
        student_id = student.id;
      } else if (targetUser.role === 'coordinator') {
        coordinator_user_id = target_user_id;
      }
    } else if (currentUser.role === 'coordinator') {
      coordinator_user_id = currentUser.id;
      if (targetUser.role === 'student') {
        const student = await StudentProfile.findOne({ where: { user_id: target_user_id } });
        student_id = student.id;
      } else if (targetUser.role === 'company') {
        const company = await CompanyProfile.findOne({ where: { user_id: target_user_id } });
        company_id = company.id;
      }
    }

    // Find or create conversation
    const where = {};
    if (student_id) where.student_id = student_id;
    if (company_id) where.company_id = company_id;
    if (coordinator_user_id) where.coordinator_user_id = coordinator_user_id;
    if (internship_id) where.internship_id = internship_id;

    let conversation = await Conversation.findOne({ where });

    if (!conversation) {
      conversation = await Conversation.create({
        student_id,
        company_id,
        coordinator_user_id,
        internship_id: internship_id || null,
      });
    }

    return res.status(200).json({ conversation });
  } catch (error) {
    console.error('startConversation error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// GET all my conversations
const getMyConversations = async (req, res) => {
  try {
    let conversations = [];
    const { role, id } = req.user;

    if (role === 'student') {
      const student = await StudentProfile.findOne({ where: { user_id: id } });
      if (!student) return res.status(404).json({ message: 'Profile not found' });

      conversations = await Conversation.findAll({
        where: { student_id: student.id },
        include: [
          { model: CompanyProfile, as: 'company', attributes: ['company_name', 'logo_url'] },
          { model: Message, as: 'messages', limit: 1, order: [['sent_at', 'DESC']] },
        ],
        order: [['updated_at', 'DESC']],
      });
    } else if (role === 'company') {
      const company = await CompanyProfile.findOne({ where: { user_id: id } });
      if (!company) return res.status(404).json({ message: 'Profile not found' });

      conversations = await Conversation.findAll({
        where: { company_id: company.id },
        include: [
          { model: StudentProfile, as: 'student', attributes: ['full_name', 'profile_photo_url'] },
          { model: Message, as: 'messages', limit: 1, order: [['sent_at', 'DESC']] },
        ],
        order: [['updated_at', 'DESC']],
      });
    } else if (role === 'coordinator') {
      conversations = await Conversation.findAll({
        where: { coordinator_user_id: id },
        include: [
          { model: StudentProfile, as: 'student', attributes: ['full_name', 'profile_photo_url'] },
          { model: CompanyProfile, as: 'company', attributes: ['company_name', 'logo_url'] },
          { model: Message, as: 'messages', limit: 1, order: [['sent_at', 'DESC']] },
        ],
        order: [['updated_at', 'DESC']],
      });
    }

    return res.status(200).json({ conversations });
  } catch (error) {
    console.error('getMyConversations error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// GET messages for a conversation
const getMessages = async (req, res) => {
  try {
    const conversation = await Conversation.findByPk(req.params.id);
    if (!conversation) return res.status(404).json({ message: 'Conversation not found' });

    const messages = await Message.findAll({
      where: { conversation_id: req.params.id },
      include: [{ model: User, as: 'sender', attributes: ['id', 'email', 'role'] }],
      order: [['sent_at', 'ASC']],
    });

    await Message.update(
      { is_read: true },
      { where: { conversation_id: req.params.id, sender_id: { [Op.ne]: req.user.id } } }
    );

    return res.status(200).json({ messages });
  } catch (error) {
    console.error('getMessages error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// GET all users I can chat with
const getChatableUsers = async (req, res) => {
  try {
    const { role, id } = req.user;
    let users = [];

    if (role === 'student') {
      // Students can chat with companies and coordinators
      const companies = await User.findAll({
        where: { role: 'company' },
        attributes: ['id', 'email'],
        include: [{ model: CompanyProfile, as: 'companyProfile', attributes: ['company_name', 'logo_url'] }],
      });
      const coordinators = await User.findAll({
        where: { role: 'coordinator' },
        attributes: ['id', 'email'],
      });
      users = [
        ...companies.map(u => ({ id: u.id, email: u.email, role: 'company', name: u.companyProfile?.company_name || u.email })),
        ...coordinators.map(u => ({ id: u.id, email: u.email, role: 'coordinator', name: u.email })),
      ];
    } else if (role === 'company') {
      // Companies can chat with students and coordinators
      const students = await User.findAll({
        where: { role: 'student' },
        attributes: ['id', 'email'],
        include: [{ model: StudentProfile, as: 'studentProfile', attributes: ['full_name'] }],
      });
      const coordinators = await User.findAll({
        where: { role: 'coordinator' },
        attributes: ['id', 'email'],
      });
      users = [
        ...students.map(u => ({ id: u.id, email: u.email, role: 'student', name: u.studentProfile?.full_name || u.email })),
        ...coordinators.map(u => ({ id: u.id, email: u.email, role: 'coordinator', name: u.email })),
      ];
    } else if (role === 'coordinator') {
      // Coordinators can chat with students and companies
      const students = await User.findAll({
        where: { role: 'student' },
        attributes: ['id', 'email'],
        include: [{ model: StudentProfile, as: 'studentProfile', attributes: ['full_name'] }],
      });
      const companies = await User.findAll({
        where: { role: 'company' },
        attributes: ['id', 'email'],
        include: [{ model: CompanyProfile, as: 'companyProfile', attributes: ['company_name'] }],
      });
      users = [
        ...students.map(u => ({ id: u.id, email: u.email, role: 'student', name: u.studentProfile?.full_name || u.email })),
        ...companies.map(u => ({ id: u.id, email: u.email, role: 'company', name: u.companyProfile?.company_name || u.email })),
      ];
    }

    return res.status(200).json({ users });
  } catch (error) {
    console.error('getChatableUsers error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { startConversation, getMyConversations, getMessages, getChatableUsers };