import React, { useEffect } from 'react';
import HeroSection from '../components/HeroSection';
import LearningPaths from '../components/LearningPaths';
import AIAssistant from '../components/AIAssistant';
import ActiveMembers from '../components/ActiveMembers';
import CodeEditor from '../components/CodeEditor';

const Index: React.FC = () => {
  useEffect(() => {
    document.documentElement.classList.remove('dark');
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <HeroSection />
      
      <div className="container mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-3">
            <LearningPaths />
          </div>
          
          <div className="md:col-span-6">
            <AIAssistant />
            <CodeEditor />
          </div>
          
          <div className="md:col-span-3">
            <ActiveMembers />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
