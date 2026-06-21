import React, { useState, useRef } from 'react';
import { Paperclip, Send, Image as ImageIcon } from 'lucide-react';

const MessageInput = ({ onSendMessage, onTyping }) => {
  const [text, setText] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const handleChange = (e) => {
    setText(e.target.value);
    
    // Emit typing event
    onTyping(true);
    
    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set new timeout to stop typing after 1.5s of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      onTyping(false);
    }, 1500);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    
    onSendMessage(text, null);
    setText('');
    onTyping(false);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      // In a real app, you would upload to Cloudinary/S3 here
      // const formData = new FormData();
      // formData.append('file', file);
      // const res = await api.uploadFile(formData);
      // onSendMessage('', res.data.url);
      
      // Mock upload for demonstration
      setTimeout(() => {
        const mockUrl = URL.createObjectURL(file);
        onSendMessage('Sent an attachment', mockUrl);
        setIsUploading(false);
      }, 1000);
    } catch (err) {
      console.error(err);
      setIsUploading(false);
    }
  };

  return (
    <div className="p-3 bg-vault-950/60 backdrop-blur-xl border-t border-white/10 rounded-b-xl">
      <form onSubmit={handleSubmit} className="flex items-end gap-2">
        <div className="flex-1 input-field py-2 px-3 flex items-center pr-2 relative group">
          <input
            type="text"
            value={text}
            onChange={handleChange}
            placeholder="Type a message..."
            className="w-full bg-transparent text-white px-2 outline-none text-sm placeholder-slate-500"
          />
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
            accept="image/*,.pdf,.doc,.docx"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="p-1.5 text-slate-400 hover:text-vault-gold transition-colors disabled:opacity-50"
            title="Attach file"
          >
            <Paperclip size={18} />
          </button>
        </div>
        <button
          type="submit"
          disabled={!text.trim() && !isUploading}
          className="p-3 bg-gradient-to-r from-vault-gold to-amber-400 text-vault-950 rounded-xl hover:shadow-lg hover:shadow-vault-gold/20 disabled:opacity-50 transition-all flex-shrink-0"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
};

export default MessageInput;
