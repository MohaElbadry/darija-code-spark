import React from 'react';
import AIAssistant from '../components/AIAssistant';
import { LanguageProvider } from '../contexts/LanguageContext';

const Assistant: React.FC = () => {
  return (
    <LanguageProvider>
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <main className="flex-1 flex justify-center items-center">
          <div className="w-full max-w-5xl p-2 md:p-10">
            <div className="h-[90vh] min-h-[600px] w-full min-w-[350px] overflow-y-auto rounded-xl shadow-lg bg-white/80 dark:bg-gray-800/80 p-6 md:p-10">
              <AIAssistant />
            </div>
          </div>
        </main>
      </div>
    </LanguageProvider>
  );
};

export default Assistant; 