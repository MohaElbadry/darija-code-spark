import React from 'react';
import Navbar from '../components/Navbar';
import AIAssistant from '../components/AIAssistant';
import { useLanguage } from '../contexts/LanguageContext';

const Assistant: React.FC = () => {
  const { t } = useLanguage();
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <main className="flex-1 p-4 md:p-6 container mx-auto flex flex-col">
        <h1 className="text-2xl font-bold mb-6">{t('section.assistant')}</h1>
        <p className="text-muted-foreground mb-6">
          {t('assistant.description') || 'Select your preferred language to chat with the AI assistant in Darija, Arabic, French, or English.'}
        </p>
        <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col">
          <AIAssistant />
        </div>
      </main>
    </div>
  );
};

export default Assistant; 