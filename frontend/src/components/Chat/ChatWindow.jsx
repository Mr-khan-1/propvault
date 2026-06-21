import React, { useState, useEffect, useRef } from 'react';
import { Phone, Video, X, Paperclip, Send, MoreVertical, MessageSquare, Loader2 } from 'lucide-react';
import io from 'socket.io-client';
import MessageInput from './MessageInput';
import CallModal from './CallModal';
import { chatAPI } from '../../utils/api';

const ChatWindow = ({ currentUser, chatPartner, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [socket, setSocket] = useState(null);
  const [activeCall, setActiveCall] = useState(null); // 'audio' | 'video' | null
  const messagesEndRef = useRef(null);

  // Fetch Chat History
  useEffect(() => {
    setIsLoadingHistory(true);
    chatAPI.getHistory(chatPartner._id)
      .then(res => setMessages(res.data))
      .catch(console.error)
      .finally(() => setIsLoadingHistory(false));
  }, [chatPartner._id]);

  // Initialize Socket Connection
  useEffect(() => {
    // Get the base URL (stripping '/api' if present since socket runs on root)
    const backendUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace('/api', '');
    
    // Connect to the backend socket server
    const newSocket = io(backendUrl, {
      query: { userId: currentUser._id }
    });
    
    setSocket(newSocket);

    // Socket Event Listeners
    newSocket.on('receive_message', (message) => {
      setMessages((prev) => [...prev, message]);
    });

    newSocket.on('typing', (data) => {
      if (data.userId === chatPartner._id) {
        setIsTyping(true);
      }
    });

    newSocket.on('stop_typing', (data) => {
      if (data.userId === chatPartner._id) {
        setIsTyping(false);
      }
    });
    
    newSocket.on('incoming_call', (data) => {
      if (!activeCall) {
        setActiveCall({ type: data.type, incoming: true, callerId: data.callerId });
      }
    });

    return () => newSocket.close();
  }, [currentUser, chatPartner]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = (text, fileUrl) => {
    if (!text && !fileUrl) return;
    
    const newMessage = {
      senderId: currentUser._id,
      receiverId: chatPartner._id,
      text,
      fileUrl,
      timestamp: new Date().toISOString(),
    };
    
    socket.emit('send_message', newMessage);
    setMessages((prev) => [...prev, newMessage]);
  };

  const handleTyping = (typing) => {
    if (socket) {
      if (typing) {
        socket.emit('typing', { receiverId: chatPartner._id, userId: currentUser._id });
      } else {
        socket.emit('stop_typing', { receiverId: chatPartner._id, userId: currentUser._id });
      }
    }
  };

  const initiateCall = (type) => {
    setActiveCall({ type, incoming: false });
    socket.emit('call_user', { userToCall: chatPartner._id, signalData: {}, from: currentUser._id, type });
  };

  return (
    <div className="fixed bottom-0 right-4 w-96 h-[500px] ultra-glass rounded-t-2xl flex flex-col shadow-2xl shadow-vault-gold/10 z-50">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-vault-950/80 backdrop-blur-xl border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 bg-vault-gold/20 border border-vault-gold/30 rounded-full flex items-center justify-center text-vault-gold font-bold">
              {chatPartner.name?.charAt(0) || 'U'}
            </div>
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-slate-800 rounded-full"></div>
          </div>
          <div>
            <h3 className="font-semibold text-white text-sm">{chatPartner.name}</h3>
            <p className="text-xs text-slate-400">{chatPartner.company || 'User'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-slate-400">
          <button onClick={() => initiateCall('audio')} className="p-1.5 hover:text-white hover:bg-slate-700 rounded-lg transition-colors">
            <Phone size={18} />
          </button>
          <button onClick={() => initiateCall('video')} className="p-1.5 hover:text-white hover:bg-slate-700 rounded-lg transition-colors">
            <Video size={18} />
          </button>
          <button className="p-1.5 hover:text-white hover:bg-slate-700 rounded-lg transition-colors">
            <MoreVertical size={18} />
          </button>
          <button onClick={onClose} className="p-1.5 hover:text-white hover:bg-red-500/20 hover:text-red-400 rounded-lg transition-colors ml-1">
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {isLoadingHistory ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-2">
            <Loader2 size={32} className="animate-spin text-vault-gold" />
            <p className="text-sm text-slate-400">Loading messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-2">
            <MessageSquare size={32} className="opacity-50 text-vault-gold" />
            <p className="text-sm text-slate-400">No messages yet. Say hi!</p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isMe = msg.senderId === currentUser._id;
            return (
              <div key={index} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                  isMe ? 'bg-vault-gold text-vault-950 rounded-br-none shadow-lg shadow-vault-gold/20' : 'glass border border-white/10 text-slate-200 rounded-bl-none'
                }`}>
                  {msg.fileUrl && (
                    <img src={msg.fileUrl} alt="attachment" className="rounded-lg mb-2 max-w-full" />
                  )}
                  {msg.text && <p className="text-sm font-medium">{msg.text}</p>}
                  <p className={`text-[10px] mt-1 ${isMe ? 'text-vault-900/70 font-semibold' : 'text-slate-500'} text-right`}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            );
          })
        )}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="glass border border-white/10 rounded-2xl rounded-bl-none px-4 py-3 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-vault-gold rounded-full animate-bounce"></span>
              <span className="w-1.5 h-1.5 bg-vault-gold rounded-full animate-bounce delay-75"></span>
              <span className="w-1.5 h-1.5 bg-vault-gold rounded-full animate-bounce delay-150"></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <MessageInput onSendMessage={handleSendMessage} onTyping={handleTyping} />

      {/* WebRTC Call Modal Overlay */}
      {activeCall && (
        <CallModal 
          callData={activeCall} 
          socket={socket} 
          currentUser={currentUser} 
          chatPartner={chatPartner} 
          onClose={() => setActiveCall(null)} 
        />
      )}
    </div>
  );
};

export default ChatWindow;
