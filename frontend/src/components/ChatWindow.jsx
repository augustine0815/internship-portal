import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { getConversations, getMessages, startConversation, getChatableUsers } from '../services/api';
import { useAuth } from '../context/AuthContext';

let socket;

export default function ChatWindow() {
  const { token, user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [chatableUsers, setChatableUsers] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [showNewChat, setShowNewChat] = useState(false);
  const [searchUser, setSearchUser] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    socket = io(import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000', { auth: { token } });    socket.on('message_received', (msg) => {
      setMessages(prev => [...prev, msg]);
    });
    fetchConversations();
    fetchChatableUsers();
    return () => socket.disconnect();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchConversations = async () => {
    try {
      const res = await getConversations();
      setConversations(res.data.conversations);
    } catch (err) { console.error(err); }
  };

  const fetchChatableUsers = async () => {
    try {
      const res = await getChatableUsers();
      setChatableUsers(res.data.users);
    } catch (err) { console.error(err); }
  };

  const openConversation = async (conv) => {
    if (activeConv) socket.emit('leave_conversation', activeConv.id);
    setActiveConv(conv);
    socket.emit('join_conversation', conv.id);
    try {
      const res = await getMessages(conv.id);
      setMessages(res.data.messages);
    } catch (err) { console.error(err); }
  };

  const handleStartNewChat = async (targetUser) => {
    try {
      const res = await startConversation({ target_user_id: targetUser.id });
      setShowNewChat(false);
      setSearchUser('');
      await fetchConversations();
      openConversation(res.data.conversation);
    } catch (err) { console.error(err); }
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !activeConv) return;
    socket.emit('send_message', { conversation_id: activeConv.id, body: newMessage });
    setNewMessage('');
  };

  const getConvName = (conv) => {
    if (user.role === 'student') {
      return conv.company?.company_name || 'Coordinator';
    } else if (user.role === 'company') {
      return conv.student?.full_name || 'Coordinator';
    } else if (user.role === 'coordinator') {
      return conv.student?.full_name || conv.company?.company_name || 'Unknown';
    }
    return 'Unknown';
  };

  const getConvIcon = (conv) => {
    if (conv.student_id && conv.company_id) return '🏢';
    if (conv.coordinator_user_id && conv.student_id) return '👨‍🎓';
    if (conv.coordinator_user_id && conv.company_id) return '🏢';
    return '💬';
  };

  const filteredUsers = chatableUsers.filter(u =>
    u.name.toLowerCase().includes(searchUser.toLowerCase()) ||
    u.email.toLowerCase().includes(searchUser.toLowerCase())
  );

  const roleIcon = { student: '👨‍🎓', company: '🏢', coordinator: '👩‍💼' };

  return (
    <div style={styles.container}>
      {/* Sidebar */}
      <div style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <h3 style={styles.sidebarTitle}>Messages</h3>
          <button style={styles.newChatBtn} onClick={() => setShowNewChat(!showNewChat)}>
            {showNewChat ? '✕' : '✏️ New'}
          </button>
        </div>

        {/* New Chat Search */}
        {showNewChat && (
          <div style={styles.newChatPanel}>
            <input
              style={styles.searchInput}
              type="text"
              placeholder="Search by name or email..."
              value={searchUser}
              onChange={e => setSearchUser(e.target.value)}
              autoFocus
            />
            <div style={styles.userList}>
              {filteredUsers.length === 0 ? (
                <p style={styles.noUsers}>No users found</p>
              ) : filteredUsers.map(u => (
                <div
                  key={u.id}
                  style={styles.userItem}
                  onClick={() => handleStartNewChat(u)}
                >
                  <span style={styles.userIcon}>{roleIcon[u.role]}</span>
                  <div>
                    <p style={styles.userName}>{u.name}</p>
                    <p style={styles.userEmail}>{u.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Conversations List */}
        <div style={styles.convList}>
          {conversations.length === 0 ? (
            <p style={styles.noConv}>No conversations yet. Start a new chat!</p>
          ) : conversations.map(conv => (
            <div
              key={conv.id}
              style={{
                ...styles.convItem,
                backgroundColor: activeConv?.id === conv.id ? '#e8f0fe' : 'white',
              }}
              onClick={() => openConversation(conv)}
            >
              <span style={styles.convIcon}>{getConvIcon(conv)}</span>
              <div style={styles.convInfo}>
                <p style={styles.convName}>{getConvName(conv)}</p>
                <p style={styles.convLast}>
                  {conv.messages?.[0]?.body?.slice(0, 30) || 'No messages yet'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div style={styles.chatArea}>
        {!activeConv ? (
          <div style={styles.placeholder}>
            <p style={styles.placeholderIcon}>💬</p>
            <p style={styles.placeholderText}>Select a conversation or start a new chat</p>
            <button style={styles.startBtn} onClick={() => setShowNewChat(true)}>
              ✏️ Start New Chat
            </button>
          </div>
        ) : (
          <>
            <div style={styles.chatHeader}>
              <span style={styles.chatHeaderIcon}>{getConvIcon(activeConv)}</span>
              <h3 style={styles.chatHeaderName}>{getConvName(activeConv)}</h3>
            </div>

            <div style={styles.messages}>
              {messages.map((msg, i) => {
                const isMe = msg.sender_id === user.id || msg.sender?.id === user.id;
                return (
                  <div key={i} style={{ ...styles.msgRow, justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                    {!isMe && (
                      <div style={styles.msgAvatar}>
                        {roleIcon[msg.sender?.role] || '👤'}
                      </div>
                    )}
                    <div style={{
                      ...styles.msgBubble,
                      backgroundColor: isMe ? '#1a1a2e' : '#f0f2f5',
                      color: isMe ? 'white' : '#333',
                      borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                    }}>
                      {msg.body}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <div style={styles.inputArea}>
              <input
                style={styles.msgInput}
                type="text"
                placeholder="Type a message..."
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage()}
              />
              <button style={styles.sendBtn} onClick={sendMessage}>
                Send ➤
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: { display: 'flex', height: 'calc(100vh - 64px)', backgroundColor: '#f8f9fa' },
  sidebar: { width: '300px', borderRight: '1px solid #eee', backgroundColor: 'white', display: 'flex', flexDirection: 'column' },
  sidebarHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', borderBottom: '1px solid #eee' },
  sidebarTitle: { margin: 0, fontSize: '1.1rem', color: '#1a1a2e' },
  newChatBtn: { padding: '0.4rem 0.8rem', backgroundColor: '#1a1a2e', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' },
  newChatPanel: { padding: '0.75rem', borderBottom: '1px solid #eee', backgroundColor: '#f8f9fa' },
  searchInput: { width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #ddd', fontSize: '0.9rem', boxSizing: 'border-box', marginBottom: '0.5rem' },
  userList: { maxHeight: '200px', overflowY: 'auto' },
  noUsers: { color: '#888', fontSize: '0.85rem', textAlign: 'center', padding: '0.5rem' },
  userItem: { display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem', borderRadius: '6px', cursor: 'pointer', marginBottom: '0.25rem' },
  userIcon: { fontSize: '1.3rem' },
  userName: { margin: 0, fontWeight: '600', fontSize: '0.9rem', color: '#1a1a2e' },
  userEmail: { margin: 0, fontSize: '0.75rem', color: '#888', textTransform: 'capitalize' },
  convList: { flex: 1, overflowY: 'auto', padding: '0.5rem' },
  noConv: { color: '#888', fontSize: '0.85rem', textAlign: 'center', padding: '1rem' },
  convItem: { display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', borderRadius: '8px', cursor: 'pointer', marginBottom: '0.25rem', border: '1px solid #f0f0f0' },
  convIcon: { fontSize: '1.5rem', flexShrink: 0 },
  convInfo: { flex: 1, overflow: 'hidden' },
  convName: { margin: 0, fontWeight: '600', fontSize: '0.9rem', color: '#1a1a2e' },
  convLast: { margin: 0, fontSize: '0.75rem', color: '#888', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  chatArea: { flex: 1, display: 'flex', flexDirection: 'column' },
  placeholder: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#888' },
  placeholderIcon: { fontSize: '4rem', marginBottom: '0.5rem' },
  placeholderText: { fontSize: '1rem', marginBottom: '1rem' },
  startBtn: { padding: '0.75rem 1.5rem', backgroundColor: '#1a1a2e', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' },
  chatHeader: { display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem 1.5rem', borderBottom: '1px solid #eee', backgroundColor: 'white' },
  chatHeaderIcon: { fontSize: '1.5rem' },
  chatHeaderName: { margin: 0, fontSize: '1.1rem', color: '#1a1a2e' },
  messages: { flex: 1, padding: '1rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  msgRow: { display: 'flex', alignItems: 'flex-end', gap: '0.5rem' },
  msgAvatar: { fontSize: '1.2rem', flexShrink: 0 },
  msgBubble: { padding: '0.6rem 1rem', maxWidth: '60%', fontSize: '0.95rem', lineHeight: '1.4', wordBreak: 'break-word' },
  inputArea: { display: 'flex', padding: '1rem', gap: '0.75rem', backgroundColor: 'white', borderTop: '1px solid #eee' },
  msgInput: { flex: 1, padding: '0.75rem 1rem', borderRadius: '20px', border: '1px solid #ddd', fontSize: '1rem', outline: 'none' },
  sendBtn: { padding: '0.75rem 1.5rem', backgroundColor: '#1a1a2e', color: 'white', border: 'none', borderRadius: '20px', cursor: 'pointer', fontWeight: '600' },
};