import React, { useState, useEffect } from 'react';
import { PaperAirplaneIcon, XIcon } from '@heroicons/react/outline';
import { format, isValid } from 'date-fns';
import { useAuth } from '../AuthContext';

const Messages = () => {
  const [threads, setThreads] = useState([]);
  const [selectedThread, setSelectedThread] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingThreads, setLoadingThreads] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const { apiFetch } = useAuth()

  // Fetch threads on mount
  useEffect(() => {
    loadThreads();
  }, []);

  // Fetch messages when a thread is selected
  useEffect(() => {
    if (selectedThread) {
      loadMessages(selectedThread.id);
    }
  }, [selectedThread]);

  const loadThreads = async () => {
    try {
      setLoadingThreads(true);
      setError(null);
      const response = await apiFetch('/messages/threads/', {
        method: 'GET',
      });
      if (!response.ok) {
        throw new Error(`Failed to load threads: ${response.status}`);
      }
      const data = await response.json();
      setThreads(data);
    } catch (err) {
      setError('Failed to load threads');
      alert('Failed to load threads');
      setThreads([]);
    } finally {
      setLoadingThreads(false);
    }
  };

  const loadMessages = async (threadId) => {
    try {
      setLoadingMessages(true);
      setError(null);
      const response = await apiFetch(`/messages/threads/${threadId}/messages/`, {
        method: 'GET',
      });
      if (!response.ok) {
        throw new Error(`Failed to load messages: ${response.status}`);
      }
      const data = await response.json();
      setMessages(data);
      // Mark unread messages as read
      data.forEach((msg) => {
        if (!msg.is_read) {
          markMessageRead(msg.id);
        }
      });
    } catch (err) {
      setError('Failed to load messages');
      alert('Failed to load messages');
      setMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  };

  const markMessageRead = async (messageId) => {
    try {
      const response = await apiFetch(`/messages/messages/${messageId}/read/`, {
        method: 'POST',
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
    if (!newMessage.trim() || !selectedThread) return;

    try {
      setSending(true);
      setError(null);
      const payload = {
        thread_id: selectedThread.id,
        content: newMessage.trim(),
      };
      const response = await apiFetch('/messages/messages/send/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        throw new Error(`Failed to send message: ${response.status}`);
      }
      await response.json();
      setNewMessage('');
      await loadMessages(selectedThread.id);
    } catch (err) {
      setError('Failed to send message');
      alert('Failed to send message');
      if (process.env.NODE_ENV === 'development') {
        console.log('❌ Error sending message:', err);
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row h-full max-h-[400px] bg-white rounded-lg shadow border border-gray-200">
      {/* Thread List */}
      <div className="w-full sm:w-1/3 border-r border-gray-200 overflow-y-auto">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Conversations</h2>
        </div>
        {loadingThreads ? (
          <div className="p-4 flex justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
          </div>
        ) : threads.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <p className="text-sm">No conversations found</p>
          </div>
        ) : (
          <div>
            {threads.map((thread) => (
              <div
                key={thread.id}
                className={`p-4 cursor-pointer hover:bg-gray-100 ${
                  selectedThread?.id === thread.id ? 'bg-indigo-50' : ''
                }`}
                onClick={() => setSelectedThread(thread)}
              >
                <div className="font-medium text-gray-900">
                  {thread.participants.join(', ')}
                </div>
                <div className="text-sm text-gray-600 truncate">{thread.last_message || 'No messages'}</div>
                <div className="text-xs text-gray-500">
                  {thread.last_message_time && isValid(new Date(thread.last_message_time))
                    ? format(new Date(thread.last_message_time), 'MM/dd/yyyy HH:mm')
                    : 'N/A'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Messages Area */}
      <div className="flex-1 flex flex-col">
        {selectedThread ? (
          <>
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">
                {selectedThread.participants.join(', ')}
              </h2>
              <button
                onClick={() => setSelectedThread(null)}
                className="text-gray-600 hover:text-gray-900 sm:hidden"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 p-4 overflow-y-auto max-h-[400px]">
              {loadingMessages ? (
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                </div>
              ) : messages.length === 0 ? (
                <div className="text-gray-500 text-center">No messages yet.</div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className="mb-3 p-3 bg-gray-100 rounded-lg"
                  >
                    <div className="font-bold text-gray-900 mb-1">{msg.sender || 'Anonymous'}</div>
                    <div className="text-gray-700">{msg.content}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {msg.timestamp && isValid(new Date(msg.timestamp))
                        ? format(new Date(msg.timestamp), 'MM/dd/yyyy HH:mm')
                        : 'N/A'}
                    </div>
                  </div>
                ))
              )}
            </div>
            <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-2 mb-2">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  disabled={sending}
                  className="flex-1 rounded-lg border-gray-300 text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm disabled:bg-gray-100"
                />
                <button
                  type="submit"
                  disabled={sending || !newMessage.trim()}
                  className={`px-4 py-2 rounded-lg ${
                    sending || !newMessage.trim()
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700'
                  }`}
                >
                  <PaperAirplaneIcon className="w-5 h-5" />
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <p className="text-sm">Select a conversation to view messages</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;