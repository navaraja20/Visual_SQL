import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface AIQueryAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  currentQuery: string;
  moduleContext?: string;
  onInsertQuery: (query: string) => void;
}

const GEMINI_API_KEY = 'AIzaSyDVCv9DFCy4lg9B8phV6ZePmlskSQD2QNA';

export default function AIQueryAssistant({
  isOpen,
  onClose,
  currentQuery,
  moduleContext = '',
  onInsertQuery,
}: AIQueryAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<'chat' | 'explain' | 'optimize' | 'convert'>('chat');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [genAI, setGenAI] = useState<GoogleGenerativeAI | null>(null);

  useEffect(() => {
    if (isOpen && !genAI) {
      try {
        const ai = new GoogleGenerativeAI(GEMINI_API_KEY);
        setGenAI(ai);
      } catch (error) {
        console.error('Failed to initialize Gemini AI:', error);
      }
    }
  }, [isOpen, genAI]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getSystemPrompt = () => {
    let basePrompt = `You are an expert SQL tutor helping students learn SQL. Be concise, clear, and educational.`;
    
    if (moduleContext) {
      basePrompt += ` Current module context: ${moduleContext}`;
    }

    switch (mode) {
      case 'explain':
        return `${basePrompt} Explain SQL queries in simple terms, breaking down each clause and what it does.`;
      case 'optimize':
        return `${basePrompt} Analyze SQL queries for performance and suggest optimizations with clear explanations.`;
      case 'convert':
        return `${basePrompt} Convert natural language requests into SQL queries. Only output the SQL query without explanations unless asked.`;
      default:
        return `${basePrompt} Answer questions about SQL, help debug queries, and provide learning guidance.`;
    }
  };

  const sendMessage = async (messageText?: string) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() || !genAI) return;

    const userMessage: Message = {
      role: 'user',
      content: textToSend,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
      
      // Build conversation history
      const conversationHistory = messages.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }],
      }));

      // Add system context as first user message if this is the first message
      if (messages.length === 0) {
        conversationHistory.unshift({
          role: 'user',
          parts: [{ text: getSystemPrompt() }],
        });
      }

      // Add current query context if available
      let contextualMessage = textToSend;
      if (currentQuery && (mode === 'explain' || mode === 'optimize')) {
        contextualMessage = `Current SQL query:\n\`\`\`sql\n${currentQuery}\n\`\`\`\n\nUser question: ${textToSend}`;
      }

      const chat = model.startChat({
        history: conversationHistory,
        generationConfig: {
          maxOutputTokens: 1000,
          temperature: 0.7,
        },
      });

      const result = await chat.sendMessage(contextualMessage);
      const response = await result.response;
      const text = response.text();

      const assistantMessage: Message = {
        role: 'assistant',
        content: text,
        timestamp: Date.now(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickActions = [
    { label: 'Explain my query', action: () => sendMessage('Explain this SQL query in simple terms') },
    { label: 'Find errors', action: () => sendMessage('Check this query for errors or issues') },
    { label: 'Optimize query', action: () => sendMessage('How can I optimize this query for better performance?') },
    { label: 'Suggest improvements', action: () => sendMessage('What improvements can I make to this query?') },
  ];

  const examplePrompts = {
    chat: [
      'What is the difference between INNER JOIN and LEFT JOIN?',
      'How do I use GROUP BY with HAVING?',
      'Explain subqueries vs CTEs',
    ],
    explain: [
      'Explain this query step by step',
      'What does each clause do?',
      'Break down the execution order',
    ],
    optimize: [
      'How can I make this faster?',
      'Should I add an index?',
      'Is there a better way to write this?',
    ],
    convert: [
      'Get all employees earning more than 50000',
      'Find customers who placed orders in 2024',
      'Show average salary by department',
    ],
  };

  const extractSQLFromResponse = (text: string) => {
    const sqlMatch = text.match(/```sql\n([\s\S]*?)\n```/);
    return sqlMatch ? sqlMatch[1].trim() : null;
  };

  const clearConversation = () => {
    setMessages([]);
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold">AI Query Assistant</h2>
                <p className="text-purple-100 text-sm">Powered by Google Gemini</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Mode Selector */}
          <div className="flex items-center gap-2 mt-4 flex-wrap">
            {[
              { id: 'chat', label: 'Chat', icon: '💬' },
              { id: 'explain', label: 'Explain', icon: '📖' },
              { id: 'optimize', label: 'Optimize', icon: '⚡' },
              { id: 'convert', label: 'Convert', icon: '🔄' },
            ].map(m => (
              <button
                key={m.id}
                onClick={() => setMode(m.id as any)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  mode === m.id
                    ? 'bg-white text-purple-600'
                    : 'bg-white/20 hover:bg-white/30'
                }`}
              >
                {m.icon} {m.label}
              </button>
            ))}
            {messages.length > 0 && (
              <button
                onClick={clearConversation}
                className="px-3 py-1.5 rounded-lg text-sm font-medium bg-white/20 hover:bg-white/30 transition-colors ml-auto"
              >
                🗑️ Clear
              </button>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                How can I help you today?
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                {mode === 'chat' && 'Ask me anything about SQL!'}
                {mode === 'explain' && 'I\'ll explain your query in simple terms'}
                {mode === 'optimize' && 'I\'ll analyze your query for performance'}
                {mode === 'convert' && 'Describe what you want in plain English'}
              </p>

              {/* Example Prompts */}
              <div className="max-w-md mx-auto space-y-2">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                  Try asking:
                </p>
                {examplePrompts[mode].map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => setInput(prompt)}
                    className="w-full text-left px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 transition-colors"
                  >
                    "{prompt}"
                  </button>
                ))}
              </div>

              {/* Quick Actions */}
              {currentQuery && mode !== 'convert' && (
                <div className="max-w-md mx-auto mt-6">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                    Quick actions:
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {quickActions.map((action, idx) => (
                      <button
                        key={idx}
                        onClick={action.action}
                        className="px-3 py-2 bg-purple-100 dark:bg-purple-900/30 hover:bg-purple-200 dark:hover:bg-purple-900/50 text-purple-700 dark:text-purple-400 rounded-lg text-sm font-medium transition-colors"
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              {messages.map((message, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-4 ${
                      message.role === 'user'
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                    }`}
                  >
                    <div className="flex items-start gap-2 mb-1">
                      {message.role === 'assistant' && (
                        <div className="w-6 h-6 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                          <svg className="w-4 h-4 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                          </svg>
                        </div>
                      )}
                      <div className="flex-1 whitespace-pre-wrap break-words">
                        {message.content}
                      </div>
                    </div>
                    
                    {/* Extract and show SQL code if present */}
                    {message.role === 'assistant' && (() => {
                      const sql = extractSQLFromResponse(message.content);
                      return sql ? (
                        <button
                          onClick={() => onInsertQuery(sql)}
                          className="mt-2 px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm"
                        >
                          Insert Query
                        </button>
                      ) : null;
                    })()}
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4 flex-shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                mode === 'chat' ? 'Ask me anything about SQL...' :
                mode === 'explain' ? 'Ask me to explain the query...' :
                mode === 'optimize' ? 'Ask me to optimize the query...' :
                'Describe what you want to do...'
              }
              className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              Send
            </button>
          </form>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
            Powered by Google Gemini • Free tier
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
