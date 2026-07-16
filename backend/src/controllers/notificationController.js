const { Notification } = require('../models');

// GET my notifications
const getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.findAll({
      where: { user_id: req.user.id },
      order: [['created_at', 'DESC']],
      limit: 50,
    });

    const unread_count = notifications.filter(n => !n.is_read).length;

    return res.status(200).json({ notifications, unread_count });
  } catch (error) {
    console.error('getMyNotifications error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// MARK single notification as read
const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOne({
      where: { id: req.params.id, user_id: req.user.id },
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    await notification.update({ is_read: true });
    return res.status(200).json({ message: 'Marked as read', notification });
  } catch (error) {
    console.error('markAsRead error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// MARK all notifications as read
const markAllAsRead = async (req, res) => {
  try {
    await Notification.update(
      { is_read: true },
      { where: { user_id: req.user.id, is_read: false } }
    );

    return res.status(200).json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('markAllAsRead error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getMyNotifications, markAsRead, markAllAsRead };