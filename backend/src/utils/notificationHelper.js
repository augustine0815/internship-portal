const { Notification } = require('../models');
const emailService = require('../services/emailService');

const createNotification = async ({
  user_id,
  type,
  title,
  body,
  related_entity_type = null,
  related_entity_id = null,
  email = null,
}) => {
  try {
    // Save notification to DB
    await Notification.create({
      user_id,
      type,
      title,
      body,
      related_entity_type,
      related_entity_id,
    });

    // Send email if email address provided
    if (email) {
      await emailService.sendEmail({ to: email, subject: title, body });
    }
  } catch (error) {
    console.error('createNotification error:', error);
  }
};

module.exports = { createNotification };