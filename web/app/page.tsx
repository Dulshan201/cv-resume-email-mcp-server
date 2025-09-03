'use client';

import { useState } from 'react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface EmailData {
  recipient: string;
  subject: string;
  body: string;
}

export default function HomePage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [emailData, setEmailData] = useState<EmailData>({
    recipient: '',
    subject: '',
    body: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const addMessage = (role: 'user' | 'assistant', content: string) => {
    const message: Message = {
      id: Date.now().toString(),
      role,
      content,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, message]);
  };

  const handleCVUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setCvFile(file);
    setIsLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/mcp/load-cv', {
        method: 'POST',
        body: formData
      });
      
      const result = await response.json();
      if (response.ok) {
        addMessage('assistant', `CV loaded successfully: ${result.message}`);
      } else {
        addMessage('assistant', `Error loading CV: ${result.error}`);
      }
    } catch (error) {
      addMessage('assistant', `Error loading CV: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCVQuery = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    addMessage('user', userMessage);
    setIsLoading(true);

    try {
      const response = await fetch('/api/mcp/query-cv', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ question: userMessage })
      });

      const result = await response.json();
      if (response.ok) {
        addMessage('assistant', result.answer);
      } else {
        addMessage('assistant', `Error: ${result.error}`);
      }
    } catch (error) {
      addMessage('assistant', `Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendEmail = async () => {
    if (!emailData.recipient || !emailData.subject || !emailData.body) {
      alert('Please fill in all email fields');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/mcp/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(emailData)
      });

      const result = await response.json();
      if (response.ok) {
        addMessage('assistant', `Email sent successfully: ${result.message}`);
        setEmailData({ recipient: '', subject: '', body: '' });
      } else {
        addMessage('assistant', `Error sending email: ${result.error}`);
      }
    } catch (error) {
      addMessage('assistant', `Error sending email: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          CV & Email MCP Server Playground
        </h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* CV Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">CV Parser</h2>
            
            {/* CV Upload */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Upload CV (PDF)
              </label>
              <input
                type="file"
                accept=".pdf"
                onChange={handleCVUpload}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {cvFile && (
                <p className="text-sm text-green-600 mt-1">
                  Loaded: {cvFile.name}
                </p>
              )}
            </div>

            {/* CV Query */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Ask about your CV
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleCVQuery()}
                  placeholder="e.g., What was my last position?"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isLoading}
                />
                <button
                  onClick={handleCVQuery}
                  disabled={isLoading || !input.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Ask
                </button>
              </div>
            </div>
          </div>

          {/* Email Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">Email Sender</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Recipient
                </label>
                <input
                  type="email"
                  value={emailData.recipient}
                  onChange={(e) => setEmailData(prev => ({ ...prev, recipient: e.target.value }))}
                  placeholder="recipient@example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Subject
                </label>
                <input
                  type="text"
                  value={emailData.subject}
                  onChange={(e) => setEmailData(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder="Email subject"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Body
                </label>
                <textarea
                  value={emailData.body}
                  onChange={(e) => setEmailData(prev => ({ ...prev, body: e.target.value }))}
                  placeholder="Email content..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <button
                onClick={handleSendEmail}
                disabled={isLoading}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Send Email
              </button>
            </div>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="mt-6 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Activity Log</h2>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {messages.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No activity yet. Upload a CV or send an email to get started.
              </p>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`p-3 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-blue-100 ml-8'
                      : 'bg-gray-100 mr-8'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-medium text-sm text-gray-600">
                      {message.role === 'user' ? 'You' : 'Assistant'}
                    </span>
                    <span className="text-xs text-gray-400">
                      {message.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-gray-800">{message.content}</p>
                </div>
              ))
            )}
            {isLoading && (
              <div className="bg-gray-100 mr-8 p-3 rounded-lg">
                <p className="text-gray-600">Processing...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
