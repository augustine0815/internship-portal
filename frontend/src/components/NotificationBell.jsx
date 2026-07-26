import { useState, useEffect, useRef } from 'react';
import { getMyNotifications, markAllNotificationsRead, markNotificationRead } from '../services/api';

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchNotifications();
    // Auto refresh every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await getMyNotifications();
      setNotifications(res.data.notifications);
      setUnreadCount(res.data.unread_count);
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await markNotificationRead(id);
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const getNotificationIcon = (type) => {
    const icons = {
      new_application: '📋',
      application_status: '📊',
      new_offer: '🎉',
      offer_response: '✅',
      new_message: '💬',
    };
    return icons[type] || '🔔';
  };

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div style={styles.container} ref={dropdownRef}>
      {/* Bell Button */}
      <button
        style={styles.bellBtn}
        onClick={() => setIsOpen(!isOpen)}
      >
        🔔
        {unreadCount > 0 && (
          <span style={styles.badge}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div style={styles.dropdown}>
          {/* Header */}
          <div style={styles.dropdownHeader}>
            <h3 style={styles.dropdownTitle}>
              Notifications
              {unreadCount > 0 && (
                <span style={styles.unreadLabel}>{unreadCount} new</span>
              )}
            </h3>
            {unreadCount > 0 && (
              <button style={styles.markAllBtn} onClick={handleMarkAllRead}>
                Mark all read
              </button>
            )}
          </div>

          {/* Notification List */}
          <div style={styles.list}>
            {notifications.length === 0 ? (
              <div style={styles.empty}>
                <p>🔔</p>
                <p>No notifications yet</p>
              </div>
            ) : (
              notifications.slice(0, 10).map(notification => (
                <div
                  key={notification.id}
                  style={{
                    ...styles.item,
                    backgroundColor: notification.is_read ? 'white' : '#f0f7ff',
                    borderLeft: notification.is_read ? '3px solid transparent' : '3px solid #3498db',
                  }}
                  onClick={() => !notification.is_read && handleMarkRead(notification.id)}
                >
                  <div style={styles.itemIcon}>
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div style={styles.itemContent}>
                    <p style={styles.itemTitle}>{notification.title}</p>
                    <p style={styles.itemBody}>{notification.body}</p>
                    <p style={styles.itemTime}>
                      {getTimeAgo(notification.created_at)}
                    </p>
                  </div>
                  {!notification.is_read && <div style={styles.unreadDot} />}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 10 && (
            <div style={styles.footer}>
              <p style={styles.footerText}>
                Showing 10 of {notifications.length} notifications
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const styles = {
  container: { position: 'relative' },
  bellBtn: {
    position: 'relative',
    background: 'none',
    border: 'none',
    fontSize: '1.4rem',
    cursor: 'pointer',
    padding: '0.3rem',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: '-4px',
    right: '-4px',
    backgroundColor: '#e74c3c',
    color: 'white',
    borderRadius: '50%',
    minWidth: '18px',
    height: '18px',
    fontSize: '0.65rem',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 3px',
  },
  dropdown: {
  position: 'absolute',
  bottom: '45px',
  left: '0',
  width: '360px',
  maxWidth: 'calc(100vw - 2rem)',
  backgroundColor: 'white',
  borderRadius: '12px',
  boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
  zIndex: 1000,
  overflow: 'hidden',
},
  dropdownHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 1.25rem',
    borderBottom: '1px solid #eee',
    backgroundColor: '#f8f9fa',
  },
  dropdownTitle: {
    margin: 0,
    fontSize: '1rem',
    color: '#1a1a2e',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  unreadLabel: {
    backgroundColor: '#e74c3c',
    color: 'white',
    fontSize: '0.7rem',
    padding: '0.15rem 0.5rem',
    borderRadius: '20px',
  },
  markAllBtn: {
    background: 'none',
    border: 'none',
    color: '#3498db',
    cursor: 'pointer',
    fontSize: '0.85rem',
    fontWeight: '600',
  },
  list: {
  maxHeight: '55vh',
  overflowY: 'auto',
},
  empty: {
    textAlign: 'center',
    padding: '2rem',
    color: '#888',
    fontSize: '0.9rem',
  },
  item: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.75rem',
    padding: '0.85rem 1.25rem',
    borderBottom: '1px solid #f0f0f0',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  itemIcon: {
    fontSize: '1.3rem',
    flexShrink: 0,
    marginTop: '0.1rem',
  },
  itemContent: { flex: 1 },
  itemTitle: {
    margin: '0 0 0.2rem 0',
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#1a1a2e',
  },
  itemBody: {
    margin: '0 0 0.3rem 0',
    fontSize: '0.82rem',
    color: '#555',
    lineHeight: '1.4',
  },
  itemTime: {
    margin: 0,
    fontSize: '0.75rem',
    color: '#aaa',
  },
  unreadDot: {
    width: '8px',
    height: '8px',
    backgroundColor: '#3498db',
    borderRadius: '50%',
    flexShrink: 0,
    marginTop: '0.3rem',
  },
  footer: {
    padding: '0.75rem 1.25rem',
    borderTop: '1px solid #eee',
    backgroundColor: '#f8f9fa',
    textAlign: 'center',
  },
  footerText: {
    margin: 0,
    fontSize: '0.8rem',
    color: '#888',
  },
};

export default NotificationBell;