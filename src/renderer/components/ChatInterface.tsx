import React, { useState, useRef, useEffect } from 'react';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import '../styles/ChatInterface.css';
import { Message } from '../App';

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (content: string) => void;
  isLoading: boolean;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ messages, onSendMessage, isLoading }) => {
  return (
    <div className="chat-interface">
      <div className="chat-header">
        <h1>Big AGI MCP Assistant</h1>
        <p>AI Assistant with Model Context Protocol Support</p>
      </div>
      <MessageList messages={messages} isLoading={isLoading} />
      <MessageInput onSendMessage={onSendMessage} isLoading={isLoading} />
    </div>
  );
};

export default ChatInterface;
