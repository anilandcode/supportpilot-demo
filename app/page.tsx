'use client';
// v1.0.2 - Fix UseChat type errors

import { useChat } from '@ai-sdk/react';
import { useState } from 'react';

export default function Chat() {
  const { messages, sendMessage } = useChat();
  const [input, setInput] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) return;
    sendMessage({ text: input });
    setInput('');
  };

  return (
    <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
      <h1 className="text-2xl font-bold mb-4 text-center">SupportPilot Demo</h1>
      {messages.map(m => (
        <div key={m.id || Math.random().toString()} className="whitespace-pre-wrap mb-4">
          <span className="font-bold">{m.role === 'user' ? 'User: ' : 'AI: '}</span>
          {m.parts?.map((part, index) => (
            part.type === 'text' ? <span key={index}>{part.text}</span> : null
          ))}
        </div>
      ))}

      <form onSubmit={handleSubmit} className="fixed bottom-0 w-full max-w-md p-2 mb-8 border border-gray-300 rounded shadow-xl bg-white dark:bg-zinc-900">
        <input
          className="w-full p-2"
          value={input}
          placeholder="Say something..."
          onChange={handleInputChange}
        />
      </form>
    </div>
  );
}
