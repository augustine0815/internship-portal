import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { getConversations, getMessages } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

let socket;

const CompanyChat = () => {
  const { token, user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    socket = io('http://13.212.52.253:5000', { auth: { token } });
    socket.on('message_received', (msg) => {
      setMessages(prev => [...prev, msg]);
    });
    fetchConversations();
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

  const openConversation = async (conv) => {
    if (activeConv) socket.emit('leave_conversation', activeConv.id);
    setActiveConv(conv);
    socket.emit('join_conversation', conv.id);
    try {
      const res = await getMessages(conv.id);
      setMessages(res.data.messages);
    } catch (err) { console.error(err); }
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !activeConv) return;
    socket.emit('send_message', { conversation_id: activeConv.id, body: newMessage });
    setNewMessage('');
  };

  return (
    <div style={styles.container}>
      <div style={styles.sidebar}>
        <h3 style={styles.sidebarTitle}>Student Conversations</h3>
        {conversations.length === 0 ? (
          <p style={styles.empty}>No conversations yet.</p>
        ) : conversations.map(conv => (
          <div
            key={conv.id}
            style={{ ...styles.convItem, backgroundColor: activeConv?.id === conv.id ? '#e8f0fe' : 'white' }}
            onClick={() => openConversation(conv)}
          >
            <p style={styles.convName}>👤 {conv.student?.full_name || 'Student'}</p>
          </div>
        ))}
      </div>
      <div style={styles.chatArea}>
        {!activeConv ? (
          <div style={styles.placeholder}>Select a conversation</div>
        ) : (
          <>
            <div style={styles.chatHeader}>
              <h3>👤 {activeConv.student?.full_name}</h3>
            </div>
            <div style={styles.messages}>
              {messages.map((msg, i) => (
                <div key={i} style={{
                  ...styles.message,
                  alignSelf: msg.sender_id === user.id || msg.sender?.id === user.id ? 'flex-end' : 'flex-start',
                  backgroundColor: msg.sender_id === user.id || msg.sender?.id === user.id ? '#1a1a2e' : '#f0f2f5',
                  color: msg.sender_id === user.id || msg.sender?.id === user.id ? 'white' : '#333',
                }}>
                  {msg.body}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <div style={styles.inputArea}>
              <input
                style={styles.input}
                type="text"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              />
              <button style={styles.sendBtn} onClick={sendMessage}>Send</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: { display: 'flex', height: 'calc(100vh - 64px)' },
  sidebar: { width: '280px', borderRight: '1px solid #eee', padding: '1rem', overflowY: 'auto', backgroundColor: 'white' },
  sidebarTitle: { marginBottom: '1rem', color: '#1a1a2e' },
  empty: { color: '#888', fontSize: '0.9rem' },
  convItem: { padding: '0.75rem', borderRadius: '8px', cursor: 'pointer', marginBottom: '0.5rem', border: '1px solid #eee' },
  convName: { margin: 0, fontWeight: '600' },
  chatArea: { flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#f8f9fa' },
  placeholder: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888' },
  chatHeader: { padding: '1rem 1.5rem', borderBottom: '1px solid #eee', backgroundColor: 'white' },
  messages: { flex: 1, padding: '1rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  message: { padding: '0.6rem 1rem', borderRadius: '18px', maxWidth: '60%', fontSize: '0.95rem' },
  inputArea: { display: 'flex', padding: '1rem', gap: '0.75rem', backgroundColor: 'white', borderTop: '1px solid #eee' },
  input: { flex: 1, padding: '0.75rem', borderRadius: '20px', border: '1px solid #ddd', fontSize: '1rem' },
  sendBtn: { padding: '0.75rem 1.5rem', backgroundColor: '#1a1a2e', color: 'white', border: 'none', borderRadius: '20px', cursor: 'pointer' },
};

export default CompanyChat;