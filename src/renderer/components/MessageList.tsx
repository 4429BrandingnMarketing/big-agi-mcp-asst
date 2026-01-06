import React, { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import '../styles/MessageList.css';
import { Message } from '../App';

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
}

const MessageList: React.FC<MessageListProps> = ({ messages, isLoading }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  if (messages.length === 0) {
    return (
      <div className="message-list empty">
        <div className="welcome-message">
          <h2>👋 Welcome to Big AGI MCP Assistant</h2>
          <p>Start a conversation by typing a message below.</p>
          <div className="suggestions">
            <h3>Try asking:</h3>
            <ul>
              <li>"What tools are available?"</li>
              <li>"Help me get started"</li>
              <li>"What can you do?"</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="message-list">
      {messages.map((message) => (
        <div key={message.id} className={`message ${message.role}`}>
          <div className="message-header">
            <span className="message-role">
              {message.role === 'user' ? '👤 You' : '🤖 Assistant'}
            </span>
            <span className="message-time">
              {message.timestamp.toLocaleTimeString()}
            </span>
          </div>
          <div className="message-content">
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
        </div>
      ))}
      {isLoading && (
        <div className="message assistant loading">
          <div className="message-header">
            <span className="message-role">🤖 Assistant</span>
          </div>
          <div className="message-content">
            <div className="loading-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
