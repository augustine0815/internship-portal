const { Conversation, Message, StudentProfile, CompanyProfile, User, Internship } = require('../models');

// START or GET existing conversation
const startConversation = async (req, res) => {
  try {
    const { internship_id } = req.body;
    let student_id, company_id;

    if (req.user.role === 'student') {
      const student = await StudentProfile.findOne({ where: { user_id: req.user.id } });
      if (!student) return res.status(404).json({ message: 'Student profile not found' });
      student_id = student.id;
      company_id = req.body.company_id;
    } else if (req.user.role === 'company') {
      const company = await CompanyProfile.findOne({ where: { user_id: req.user.id } });
      if (!company) return res.status(404).json({ message: 'Company profile not found' });
      company_id = company.id;
      student_id = req.body.student_id;
    }

    // Find existing or create new conversation
    let conversation = await Conversation.findOne({
      where: { student_id, company_id, internship_id: internship_id || null },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        student_id,
        company_id,
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
    let conversations;

    if (req.user.role === 'student') {
      const student = await StudentProfile.findOne({ where: { user_id: req.user.id } });
      if (!student) return res.status(404).json({ message: 'Student profile not found' });

      conversations = await Conversation.findAll({
        where: { student_id: student.id },
        include: [
          {
            model: CompanyProfile,
            as: 'company',
            attributes: ['company_name', 'logo_url'],
          },
          {
            model: Message,
            as: 'messages',
            limit: 1,
            order: [['sent_at', 'DESC']],
          },
        ],
        order: [['updated_at', 'DESC']],
      });
    } else if (req.user.role === 'company') {
      const company = await CompanyProfile.findOne({ where: { user_id: req.user.id } });
      if (!company) return res.status(404).json({ message: 'Company profile not found' });

      conversations = await Conversation.findAll({
        where: { company_id: company.id },
        include: [
          {
            model: StudentProfile,
            as: 'student',
            attributes: ['full_name', 'profile_photo_url'],
          },
          {
            model: Message,
            as: 'messages',
            limit: 1,
            order: [['sent_at', 'DESC']],
          },
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

    // Verify user belongs to this conversation
    if (req.user.role === 'student') {
      const student = await StudentProfile.findOne({ where: { user_id: req.user.id } });
      if (Number(conversation.student_id) !== Number(student.id)) {
        return res.status(403).json({ message: 'Access denied' });
      }
    } else if (req.user.role === 'company') {
      const company = await CompanyProfile.findOne({ where: { user_id: req.user.id } });
      if (Number(conversation.company_id) !== Number(company.id)) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    const messages = await Message.findAll({
      where: { conversation_id: req.params.id },
      include: [{
        model: User,
        as: 'sender',
        attributes: ['id', 'email', 'role'],
      }],
      order: [['sent_at', 'ASC']],
    });

    // Mark messages as read
    await Message.update(
      { is_read: true },
      { where: { conversation_id: req.params.id, sender_id: { [require('sequelize').Op.ne]: req.user.id } } }
    );

    return res.status(200).json({ messages });
  } catch (error) {
    console.error('getMessages error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { startConversation, getMyConversations, getMessages };