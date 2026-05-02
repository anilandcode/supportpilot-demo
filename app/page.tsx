'use client';
// v1.0.1 - Triggering new build

import { useChat } from 'ai/react';

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit } = useChat();
  return (
    <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
      <h1 className="text-2xl font-bold mb-4 text-center">SupportPilot Demo</h1>
      {messages.map(m => (
        <div key={m.id} className="whitespace-pre-wrap mb-4">
          <span className="font-bold">{m.role === 'user' ? 'User: ' : 'AI: '}</span>
          {m.content}
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
