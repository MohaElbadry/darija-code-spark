import React from 'react';
import Navbar from '../components/Navbar';
import AIAssistant from '../components/AIAssistant';
import { LanguageProvider } from '../contexts/LanguageContext';

const Assistant: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <main className="flex-1 p-4 md:p-6 container mx-auto flex flex-col">
        <h1 className="text-2xl font-bold mb-6">AI Programming Assistant</h1>
        <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col">
          <AIAssistant />
        </div>
      </main>
    </div>
  );
};

export default Assistant; 