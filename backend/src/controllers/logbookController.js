const { Logbook, StudentProfile, User } = require('../models');
const { uploadFile } = require('../services/s3Service');
const { createNotification } = require('../utils/notificationHelper');


// CHAT with AI assistant to co-write the logbook entry
const chatWithAI = async (req, res) => {
  try {
    const student = await StudentProfile.findOne({ where: { user_id: req.user.id } });
    const logbook = await Logbook.findOne({
      where: { id: req.params.id, student_id: student.id },
    });
    if (!logbook) return res.status(404).json({ message: 'Logbook not found' });

    const { messages } = req.body; // [{ role: 'user'|'assistant', text }, ...]
    if (!messages || messages.length === 0) {
      return res.status(400).json({ message: 'No message provided' });
    }

    const systemContext = `You are a friendly writing assistant helping a student write their daily internship logbook entry.

Entry title: ${logbook.title}
Date: ${logbook.date}
Student's rough notes: ${logbook.notes || '(none yet)'}

Help the student turn their notes into a clear, professional, first-person logbook entry through conversation. Keep replies concise and friendly. When you write a full draft entry, present it clearly so the student can easily copy it. If the student asks for edits (shorter, more formal, add detail, etc.), revise the draft accordingly.`;

    const groqMessages = [
      { role: 'system', content: systemContext },
      ...messages.map(m => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.text,
      })),
    ];

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: groqMessages,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      console.error('Groq API error:', data);
      return res.status(500).json({ message: 'AI assistant is unavailable right now. Please try again.' });
    }

    const reply = data.choices[0].message.content;
    return res.status(200).json({ reply });
  } catch (error) {
    console.error('chatWithAI error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// CREATE logbook entry
const createLogbook = async (req, res) => {
  try {
    const student = await StudentProfile.findOne({ where: { user_id: req.user.id } });
    if (!student) return res.status(404).json({ message: 'Student profile not found' });

    const { date, title, notes } = req.body;

    const existing = await Logbook.findOne({
      where: { student_id: student.id, date },
    });
    if (existing) {
      return res.status(400).json({ message: 'Logbook entry for this date already exists' });
    }

    const logbook = await Logbook.create({
      student_id: student.id,
      date,
      title,
      notes,
      status: 'draft',
    });

    return res.status(201).json({ message: 'Logbook created', logbook });
  } catch (error) {
    console.error('createLogbook error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// GET my logbooks
const getMyLogbooks = async (req, res) => {
  try {
    const student = await StudentProfile.findOne({ where: { user_id: req.user.id } });
    if (!student) return res.status(404).json({ message: 'Student profile not found' });

    const logbooks = await Logbook.findAll({
      where: { student_id: student.id },
      order: [['date', 'DESC']],
    });

    return res.status(200).json({ logbooks });
  } catch (error) {
    console.error('getMyLogbooks error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// GET single logbook
const getLogbookById = async (req, res) => {
  try {
    const student = await StudentProfile.findOne({ where: { user_id: req.user.id } });
    const logbook = await Logbook.findOne({
      where: { id: req.params.id, student_id: student.id },
    });
    if (!logbook) return res.status(404).json({ message: 'Logbook not found' });
    return res.status(200).json({ logbook });
  } catch (error) {
    console.error('getLogbookById error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// UPDATE logbook
const updateLogbook = async (req, res) => {
  try {
    const student = await StudentProfile.findOne({ where: { user_id: req.user.id } });
    const logbook = await Logbook.findOne({
      where: { id: req.params.id, student_id: student.id },
    });
    if (!logbook) return res.status(404).json({ message: 'Logbook not found' });
    if (logbook.status === 'reviewed') {
      return res.status(400).json({ message: 'Cannot edit a reviewed logbook' });
    }

    const { title, notes, final_content } = req.body;
    await logbook.update({ title, notes, final_content });
    return res.status(200).json({ message: 'Logbook updated', logbook });
  } catch (error) {
    console.error('updateLogbook error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// GENERATE AI content using Groq
const generateAIContent = async (req, res) => {
  try {
    const student = await StudentProfile.findOne({ where: { user_id: req.user.id } });
    const logbook = await Logbook.findOne({
      where: { id: req.params.id, student_id: student.id },
    });
    if (!logbook) return res.status(404).json({ message: 'Logbook not found' });

    if (!logbook.notes) {
      return res.status(400).json({ message: 'Please add some notes first' });
    }

    const prompt = `You are helping a student write a professional internship daily logbook entry.

Title: ${logbook.title}
Date: ${logbook.date}
Student's rough notes: ${logbook.notes}

Please write a professional, detailed logbook entry based on these notes. The entry should:
1. Be written in first person
2. Be professional and formal
3. Include what was learned or accomplished today
4. Be between 200-400 words
5. Start with "Today," or "On this day,"

Write only the logbook entry content.`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Groq API error:', data);
      return res.status(500).json({ message: 'Failed to generate AI content. Please try again.' });
    }

    const aiContent = data.choices[0].message.content;

    await logbook.update({
      ai_generated_content: aiContent,
      final_content: aiContent,
    });

    return res.status(200).json({
      message: 'AI content generated successfully',
      ai_content: aiContent,
    });
  } catch (error) {
    console.error('generateAIContent error:', error);
    return res.status(500).json({ message: 'Failed to generate AI content. Please try again.' });
  }
};

// UPLOAD photo to logbook
const uploadLogbookPhoto = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const student = await StudentProfile.findOne({ where: { user_id: req.user.id } });
    const logbook = await Logbook.findOne({
      where: { id: req.params.id, student_id: student.id },
    });
    if (!logbook) return res.status(404).json({ message: 'Logbook not found' });

    const result = await uploadFile(req.file, 'logbook-photos');
    if (!result.success) return res.status(500).json({ message: 'Upload failed' });

    const photos = [...(logbook.photo_urls || []), result.url];
    await logbook.update({ photo_urls: photos });

    return res.status(200).json({ message: 'Photo uploaded', url: result.url, photos });
  } catch (error) {
    console.error('uploadLogbookPhoto error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// SUBMIT logbook
const submitLogbook = async (req, res) => {
  try {
    const student = await StudentProfile.findOne({ where: { user_id: req.user.id } });
    const logbook = await Logbook.findOne({
      where: { id: req.params.id, student_id: student.id },
    });
    if (!logbook) return res.status(404).json({ message: 'Logbook not found' });
    if (logbook.status === 'submitted') {
      return res.status(400).json({ message: 'Logbook already submitted' });
    }
    if (!logbook.final_content) {
      return res.status(400).json({ message: 'Please write or generate content before submitting' });
    }

    await logbook.update({ status: 'submitted' });

    // Notify all coordinators about the new submission
    const coordinators = await User.findAll({ where: { role: 'coordinator' } });
    for (const coordinator of coordinators) {
      await createNotification({
        user_id: coordinator.id,
        type: 'logbook_submitted',
        title: 'New logbook submitted',
        body: `${student.full_name} submitted a logbook entry: "${logbook.title}"`,
        related_entity_type: 'logbook',
        related_entity_id: logbook.id,
      });
    }

    return res.status(200).json({ message: 'Logbook submitted successfully', logbook });
  } catch (error) {
    console.error('submitLogbook error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// ADMIN — get all submitted logbooks
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

// ADMIN — review logbook
const reviewLogbook = async (req, res) => {
  try {
    const logbook = await Logbook.findByPk(req.params.id);
    if (!logbook) return res.status(404).json({ message: 'Logbook not found' });

    const { reviewer_comment } = req.body;
    await logbook.update({ status: 'reviewed', reviewer_comment });
    return res.status(200).json({ message: 'Logbook reviewed', logbook });
  } catch (error) {
    console.error('reviewLogbook error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createLogbook,
  getMyLogbooks,
  getLogbookById,
  updateLogbook,
  generateAIContent,
  chatWithAI,
  uploadLogbookPhoto,
  submitLogbook,
  getAllLogbooks,
  reviewLogbook,
};