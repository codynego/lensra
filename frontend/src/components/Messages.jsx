import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  X, 
  RefreshCw,
  MessageCircle,
  User,
  Check,
  AlertCircle,
} from 'lucide-react';
import { format, isValid } from 'date-fns';
import { useAuth } from '../AuthContext';

const Messages = ({ theme = 'dark' }) => {
  const { apiFetch, user } = useAuth();
  const [threads, setThreads] = useState([]);
  const [selectedThread, setSelectedThread] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingThreads, setLoadingThreads] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [refreshingMessages, setRefreshingMessages] = useState(false);
  const [error, setError] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle responsive design
  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch threads on mount
  useEffect(() => {
    loadThreads();
  }, [apiFetch]);

  // Fetch messages when a thread is selected
  useEffect(() => {
    if (selectedThread) {
      loadMessages(selectedThread.id);
    }
  }, [selectedThread, apiFetch]);

  const loadThreads = async () => {
    try {
      setLoadingThreads(true);
      setError(null);
      const response = await apiFetch('/messages/threads/', {
        method: 'GET',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to load threads: ${response.status}`);
      }
      const data = await response.json();
      if (process.env.NODE_ENV === 'development') {
        console.log('📥 Threads response:', data);
      }
      setThreads(data);
    } catch (err) {
      setError(err.message || 'Failed to load conversations');
      setThreads([]);
    } finally {
      setLoadingThreads(false);
    }
  };

  const loadMessages = async (threadId, isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshingMessages(true);
      } else {
        setLoadingMessages(true);
      }
      setError(null);
      
      const response = await apiFetch(`/messages/threads/${threadId}/messages/`, {
        method: 'GET',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to load messages: ${response.status}`);
      }
      const data = await response.json();
      if (process.env.NODE_ENV === 'development') {
        console.log('📥 Messages response:', data);
      }
      setMessages(data);
      
      // Mark unread messages as read
      data.forEach((msg) => {
        if (!msg.is_read && msg.sender !== user?.id) {
          markMessageRead(msg.id);
        }
      });
    } catch (err) {
      setError(err.message || 'Failed to load messages');
      setMessages([]);
    } finally {
      setLoadingMessages(false);
      setRefreshingMessages(false);
    }
  };

  const markMessageRead = async (messageId) => {
    try {
      const response = await apiFetch(`/messages/messages/${messageId}/read/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        console.warn(`Failed to mark message ${messageId} as read: ${response.status}`);
      }
    } catch (err) {
      console.warn(`Error marking message ${messageId} as read:`, err);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedThread || !user) return;
    if (newMessage.trim().length > 1000) {
      setError('Message cannot exceed 1000 characters');
      return;
    }

    try {
      setSending(true);
      setError(null);
      const payload = {
        thread_id: selectedThread.id,
        content: newMessage.trim(),
      };
      
      const response = await apiFetch('/messages/messages/reply/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to send message: ${response.status}`);
      }
      
      setNewMessage('');
      await loadMessages(selectedThread.id);
      inputRef.current?.focus();
    } catch (err) {
      setError(err.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleRefreshMessages = () => {
    if (selectedThread) {
      loadMessages(selectedThread.id, true);
    }
  };

  const getParticipantDisplay = (thread) => {
    const senderName = thread.sender_user?.username || 'Unknown';
    const receiverName = thread.receiver_user?.username || 'Unknown';
    return `${receiverName}`;
  };

  const getInitials = (username) => {
    return username?.charAt(0).toUpperCase() || '?';
  };

  const formatTime = (dateString) => {
    if (!dateString || !isValid(new Date(dateString))) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return format(date, 'HH:mm');
    }
    return format(date, 'MMM dd');
  };

  return (
    <div className={`flex h-[600px] rounded-2xl shadow-xl overflow-hidden border ${
      theme === 'dark'
        ? 'bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 border-slate-700/60'
        : 'bg-gradient-to-br from-slate-50 via-white to-slate-100 border-gray-200'
    }`}>
      {/* Animated background effects (visible only in dark mode) */}
      {theme === 'dark' && (
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 -left-4 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute top-3/4 -right-4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-500" />
        </div>
      )}

      {/* Thread List - Mobile overlay or sidebar */}
      <div className={`
        relative z-10
        ${isMobileView && selectedThread ? 'hidden' : 'flex'}
        ${isMobileView ? 'w-full' : 'w-80'}
        flex-col
        ${theme === 'dark'
          ? 'bg-gradient-to-br from-slate-800/90 to-slate-900/90 border-r border-slate-700/60'
          : 'bg-white/90 border-r border-gray-200'}
      `}>
        {/* Header */}
        <div className={`p-4 sm:p-6 bg-gradient-to-r ${
          theme === 'dark' ? 'from-indigo-500 to-purple-600' : 'from-indigo-400 to-purple-500'
        } backdrop-blur-xl shadow-lg`}>
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-xl backdrop-blur-sm ${
              theme === 'dark' ? 'bg-white/20' : 'bg-white/50'
            }`}>
              <MessageCircle className={`w-5 h-5 ${theme === 'dark' ? 'text-white' : 'text-indigo-600'}`} />
            </div>
            <h1 className={`text-lg sm:text-xl font-semibold ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>Messages</h1>
          </div>
        </div>

        {/* Thread List */}
        <div className="flex-1 overflow-y-auto p-3">
          {loadingThreads ? (
            <div className="flex items-center justify-center p-8">
              <div className="flex items-center space-x-3">
                <div className={`animate-spin rounded-full h-6 w-6 border-2 ${
                  theme === 'dark' ? 'border-indigo-500 border-t-transparent' : 'border-indigo-600 border-t-transparent'
                }`}></div>
                <span className={theme === 'dark' ? 'text-slate-300' : 'text-gray-600'}>Loading conversations...</span>
              </div>
            </div>
          ) : threads.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <div className={`p-4 rounded-2xl mb-4 ${
                theme === 'dark' ? 'bg-slate-700/50' : 'bg-gray-100'
              }`}>
                <MessageCircle className={`w-12 h-12 ${theme === 'dark' ? 'text-slate-400' : 'text-gray-400'}`} />
              </div>
              <p className={`font-medium mb-1 ${theme === 'dark' ? 'text-slate-200' : 'text-gray-800'}`}>
                No conversations yet
              </p>
              <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>
                Start a new conversation
              </p>
            </div>
          ) : (
            threads.map((thread) => (
              <div
                key={thread.id}
                className={`
                  relative p-4 rounded-xl cursor-pointer transition-all duration-300 mb-2 group
                  ${selectedThread?.id === thread.id 
                    ? theme === 'dark'
                      ? 'bg-gradient-to-r from-indigo-500/20 to-purple-600/20 border-2 border-indigo-500/30 shadow-lg shadow-indigo-500/10'
                      : 'bg-indigo-50/80 border-2 border-indigo-300 shadow-lg shadow-indigo-300/10'
                    : theme === 'dark'
                      ? 'hover:bg-slate-700/50 border-2 border-transparent hover:border-slate-600/30'
                      : 'hover:bg-gray-50 border-2 border-transparent hover:border-gray-200/50'
                  }
                `}
                onClick={() => setSelectedThread(thread)}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg ${
                      theme === 'dark'
                        ? 'bg-gradient-to-br from-indigo-500 to-purple-600'
                        : 'bg-gradient-to-br from-indigo-400 to-purple-500'
                    }`}>
                      <span className="text-white font-semibold text-sm">
                        {getInitials(thread.sender_user?.username)}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className={`text-sm font-semibold truncate ${
                        theme === 'dark' ? 'text-slate-100' : 'text-gray-800'
                      }`}>
                        {getParticipantDisplay(thread)}
                      </p>
                      <span className={`text-xs flex-shrink-0 ml-2 ${
                        theme === 'dark' ? 'text-slate-400' : 'text-gray-500'
                      }`}>
                        {formatTime(thread.last_message?.created_at)}
                      </span>
                    </div>
                    <p className={`text-sm truncate mb-2 ${
                      theme === 'dark' ? 'text-slate-300' : 'text-gray-600'
                    }`}>
                      {thread.last_message?.content || 'No messages yet'}
                    </p>
                    {thread.unread_count > 0 && (
                      <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium shadow-lg ${
                        theme === 'dark'
                          ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white'
                          : 'bg-gradient-to-r from-indigo-400 to-purple-500 text-white'
                      }`}>
                        {thread.unread_count} new
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className={`
        relative z-10 flex-1 flex flex-col
        ${isMobileView && !selectedThread ? 'hidden' : 'flex'}
        ${theme === 'dark' ? 'bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950' : 'bg-white/90'}
      `}>
        {selectedThread ? (
          <>
            {/* Chat Header */}
            <div className={`px-4 sm:px-6 py-4 border-b shadow-lg backdrop-blur-xl ${
              theme === 'dark' ? 'bg-slate-800/50 border-slate-700/60' : 'bg-white/90 border-gray-200'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {isMobileView && (
                    <button
                      onClick={() => setSelectedThread(null)}
                      className={`p-2 rounded-full transition-all duration-200 ${
                        theme === 'dark' 
                          ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-700' 
                          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg ${
                    theme === 'dark'
                      ? 'bg-gradient-to-br from-indigo-500 to-purple-600'
                      : 'bg-gradient-to-br from-indigo-400 to-purple-500'
                  }`}>
                    <span className="text-white font-semibold text-sm">
                      {getInitials(selectedThread.sender_user?.username)}
                    </span>
                  </div>
                  <div>
                    <h2 className={`font-semibold ${
                      theme === 'dark' ? 'text-slate-100' : 'text-gray-800'
                    }`}>
                      {getParticipantDisplay(selectedThread)}
                    </h2>
                    <p className="text-sm">
                      <span className={`bg-clip-text text-transparent bg-gradient-to-r ${
                        theme === 'dark' ? 'from-indigo-400 via-purple-400 to-pink-400' : 'from-indigo-500 via-purple-500 to-pink-500'
                      }`}>
                        Active now
                      </span>
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={handleRefreshMessages}
                  disabled={refreshingMessages}
                  className={`
                    p-2 rounded-full transition-all duration-300
                    ${refreshingMessages 
                      ? theme === 'dark' ? 'text-indigo-400 bg-indigo-500/20' : 'text-indigo-600 bg-indigo-100/50'
                      : theme === 'dark' 
                        ? 'text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/20'
                        : 'text-gray-500 hover:text-indigo-600 hover:bg-indigo-100/50'
                    }
                  `}
                  title="Refresh messages"
                >
                  <RefreshCw className={`w-5 h-5 ${refreshingMessages ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              {loadingMessages ? (
                <div className="flex items-center justify-center h-full">
                  <div className="flex items-center space-x-3">
                    <div className={`animate-spin rounded-full h-6 w-6 border-2 ${
                      theme === 'dark' ? 'border-indigo-500 border-t-transparent' : 'border-indigo-600 border-t-transparent'
                    }`}></div>
                    <span className={theme === 'dark' ? 'text-slate-300' : 'text-gray-600'}>Loading messages...</span>
                  </div>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-lg ${
                    theme === 'dark' ? 'bg-slate-800' : 'bg-gray-100'
                  }`}>
                    <MessageCircle className={`w-8 h-8 ${theme === 'dark' ? 'text-slate-400' : 'text-gray-400'}`} />
                  </div>
                  <p className={`font-medium mb-1 ${theme === 'dark' ? 'text-slate-200' : 'text-gray-800'}`}>
                    No messages yet
                  </p>
                  <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>
                    Send a message to start the conversation
                  </p>
                </div>
              ) : (
                <>
                  {messages.map((msg, index) => {
                    const isCurrentUser = msg.sender === user?.id;
                    const showAvatar = index === 0 || messages[index - 1]?.sender !== msg.sender;
                    
                    return (
                      <div
                        key={msg.id}
                        className={`flex items-end space-x-2 ${isCurrentUser ? 'flex-row-reverse space-x-reverse' : ''}`}
                      >
                        <div className={`flex-shrink-0 ${showAvatar ? 'visible' : 'invisible'}`}>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-lg ${
                            theme === 'dark'
                              ? 'bg-gradient-to-br from-slate-600 to-slate-700'
                              : 'bg-gradient-to-br from-gray-200 to-gray-300'
                          }`}>
                            <span className={`font-semibold text-xs ${
                              theme === 'dark' ? 'text-slate-200' : 'text-gray-700'
                            }`}>
                              {getInitials(msg.sender_name)}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-end space-y-1">
                          <div className={`
                            max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-lg backdrop-blur-sm
                            ${isCurrentUser 
                              ? theme === 'dark'
                                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-indigo-500/25'
                                : 'bg-gradient-to-r from-indigo-400 to-purple-500 text-white shadow-indigo-400/25'
                              : theme === 'dark'
                                ? 'bg-slate-800/80 text-slate-100 border border-slate-700/50 shadow-slate-800/50'
                                : 'bg-white/80 text-gray-900 border border-gray-200/50 shadow-gray-200/50'
                            }
                          `}>
                            <p className="text-sm leading-relaxed">{msg.content}</p>
                            <div className={`
                              flex items-center justify-between mt-2
                              ${isCurrentUser 
                                ? theme === 'dark' ? 'text-indigo-100' : 'text-indigo-200'
                                : theme === 'dark' ? 'text-slate-400' : 'text-gray-500'
                              }
                            `}>
                              <span className="text-xs">
                                {formatTime(msg.created_at)}
                              </span>
                              {isCurrentUser && msg.is_read && (
                                <Check className={`w-3 h-3 ml-2 ${
                                  theme === 'dark' ? 'text-indigo-200' : 'text-indigo-300'
                                }`} />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Message Input */}
            <div className={`p-4 border-t ${
              theme === 'dark' ? 'bg-slate-800/50 border-slate-700/60' : 'bg-white/90 border-gray-200'
            } backdrop-blur-xl`}>
              {error && (
                <div className={`mb-3 p-3 rounded-xl backdrop-blur-sm animate-fadeIn ${
                  theme === 'dark' ? 'bg-red-500/10 border-red-500/30' : 'bg-red-50/80 border-red-200'
                }`}>
                  <div className="flex items-center">
                    <AlertCircle className={`w-4 h-4 mr-2 ${
                      theme === 'dark' ? 'text-red-400' : 'text-red-600'
                    }`} />
                    <p className={`text-sm ${theme === 'dark' ? 'text-red-300' : 'text-red-800'}`}>
                      {error}
                    </p>
                  </div>
                </div>
              )}
              
              <form onSubmit={handleSendMessage} className="flex items-end space-x-3">
                <div className="flex-1">
                  <input
                    ref={inputRef}
                    type="text"
                    value={newMessage}
                    onChange={(e) => {
                      if (e.target.value.length <= 1000) {
                        setNewMessage(e.target.value);
                        setError(null);
                      } else {
                        setError('Message cannot exceed 1000 characters');
                      }
                    }}
                    placeholder="Type your message..."
                    disabled={sending}
                    className={`w-full px-4 py-3 rounded-2xl text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent backdrop-blur-xl transition-all duration-200 ${
                      theme === 'dark'
                        ? 'bg-slate-700/50 border-slate-600/50 text-slate-100 placeholder-slate-400 hover:bg-slate-700/70 disabled:bg-slate-700/30'
                        : 'bg-white/70 border-gray-200/50 text-gray-900 placeholder-gray-400 hover:bg-white/90 disabled:bg-gray-100/50'
                    }`}
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={sending || !newMessage.trim()}
                  className={`
                    p-3 rounded-2xl transition-all duration-300 transform shadow-lg
                    ${sending || !newMessage.trim()
                      ? theme === 'dark'
                        ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : theme === 'dark'
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white hover:scale-105 shadow-indigo-500/25'
                        : 'bg-gradient-to-r from-indigo-400 to-purple-500 hover:from-indigo-500 hover:to-purple-600 text-white hover:scale-105 shadow-indigo-400/25'
                    }
                  `}
                >
                  {sending ? (
                    <div className={`animate-spin rounded-full h-5 w-5 border-2 ${
                      theme === 'dark' ? 'border-white border-t-transparent' : 'border-white border-t-transparent'
                    }`}></div>
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-6 shadow-2xl ${
              theme === 'dark'
                ? 'bg-gradient-to-br from-indigo-500 to-purple-600 shadow-indigo-500/25'
                : 'bg-gradient-to-br from-indigo-400 to-purple-500 shadow-indigo-400/25'
            }`}>
              <MessageCircle className="w-10 h-10 text-white" />
            </div>
            <h3 className={`text-xl sm:text-2xl font-bold mb-2 ${
              theme === 'dark' ? 'text-slate-200' : 'text-gray-800'
            }`}>
              <span className={`bg-clip-text text-transparent bg-gradient-to-r ${
                theme === 'dark' ? 'from-indigo-400 via-purple-400 to-pink-400' : 'from-indigo-500 via-purple-500 to-pink-500'
              }`}>
                Welcome to Messages
              </span>
            </h3>
            <p className={`mb-4 ${theme === 'dark' ? 'text-slate-300' : 'text-gray-600'}`}>
              Select a conversation from the sidebar to start chatting
            </p>
            {!isMobileView && (
              <div className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>
                Choose from your existing conversations or start a new one
              </div>
            )}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        
        * {
          word-wrap: break-word;
          overflow-wrap: break-word;
        }
        
        ::-webkit-scrollbar {
          width: 4px;
        }
        ::-webkit-scrollbar-track {
          background: ${theme === 'dark' ? 'rgba(51, 65, 85, 0.3)' : 'rgba(229, 231, 235, 0.3)'};
        }
        ::-webkit-scrollbar-thumb {
          background: ${theme === 'dark' ? 'rgba(99, 102, 241, 0.5)' : 'rgba(79, 70, 229, 0.5)'};
          border-radius: 2px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: ${theme === 'dark' ? 'rgba(99, 102, 241, 0.7)' : 'rgba(79, 70, 229, 0.7)'};
        }
      `}</style>
    </div>
  );
};

export default Messages;