import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { BookOpen, Clock, Award, GraduationCap, Star, Users, TrendingUp, Bookmark, ChevronDown, ChevronUp } from 'lucide-react';

const LearningPaths: React.FC = () => {
  const { t, language } = useLanguage();
  const isRtl = language === 'arabic' || language === 'darija';
  
  const [openSections, setOpenSections] = useState({
    progress: true,
    learningPaths: true,
    community: true,
    studyGroups: true
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg p-4 shadow ${isRtl ? 'rtl' : 'ltr'}`}>
      <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">{t('Overview')}</h2>
      
      {/* Progress Section */}
      <div className="mb-6">
        <button 
          onClick={() => toggleSection('progress')}
          className="w-full flex items-center justify-between text-md font-semibold mb-3 text-gray-800 dark:text-white hover:text-darija-primary transition-colors"
        >
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            My Progress
          </div>
          {openSections.progress ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        {openSections.progress && (
          <div className="bg-gray-50 dark:bg-gray-700 rounded-md p-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-800 dark:text-white">Web Development Fundamentals</p>
              <span className="text-xs text-gray-500 dark:text-gray-400">65%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
              <div className="bg-darija-primary h-2 rounded-full" style={{ width: '65%' }}></div>
            </div>
            <div className="flex items-center gap-2 mt-2 text-sm text-gray-500 dark:text-gray-400">
              <Clock className="h-3 w-3" />
              <span>5 of 8 weeks completed</span>
            </div>
          </div>
        )}
      </div>

      {/* Learning Paths */}
      <div className="mb-6">
        <button 
          onClick={() => toggleSection('learningPaths')}
          className="w-full flex items-center justify-between text-md font-semibold mb-3 text-gray-800 dark:text-white hover:text-darija-primary transition-colors"
        >
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Learning Paths
          </div>
          {openSections.learningPaths ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        {openSections.learningPaths && (
          <div className="space-y-4">
            <div className="border dark:border-gray-700 rounded-md p-3 hover:border-darija-secondary transition duration-200 bg-blue-50 dark:bg-blue-900/20">
              <div className="flex items-center gap-2 mb-1">
                <BookOpen className="h-4 w-4 text-blue-500" />
                <p className="font-semibold text-gray-800 dark:text-white">Web Development Fundamentals</p>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <Clock className="h-3 w-3" />
                <span>8 weeks</span>
                <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  Beginner
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                Learn HTML, CSS, and JavaScript basics to build your first website.
              </p>
            </div>

            <div className="border dark:border-gray-700 rounded-md p-3 hover:border-darija-secondary transition duration-200 bg-purple-50 dark:bg-purple-900/20">
              <div className="flex items-center gap-2 mb-1">
                <Award className="h-4 w-4 text-purple-500" />
                <p className="font-semibold text-gray-800 dark:text-white">Advanced React Development</p>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <Clock className="h-3 w-3" />
                <span>12 weeks</span>
                <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                  Intermediate
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                Master React hooks, context API, and advanced state management.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Community Projects & Blogs */}
      <div className="mb-6">
        <button 
          onClick={() => toggleSection('community')}
          className="w-full flex items-center justify-between text-md font-semibold mb-3 text-gray-800 dark:text-white hover:text-darija-primary transition-colors"
        >
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4" />
            Community Highlights
          </div>
          {openSections.community ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        {openSections.community && (
          <div className="space-y-3">
            <div className="border dark:border-gray-700 rounded-md p-3 hover:border-darija-secondary transition duration-200">
              <div className="flex items-center gap-2 mb-1">
                <Bookmark className="h-4 w-4 text-amber-500" />
                <p className="font-semibold text-gray-800 dark:text-white">Building a Todo App with React</p>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">By Ahmed • 2 days ago</p>
              <div className="flex items-center gap-2 mt-2 text-sm text-gray-500 dark:text-gray-400">
                <Star className="h-3 w-3 text-amber-500" />
                <span>24 stars</span>
              </div>
            </div>
            <div className="border dark:border-gray-700 rounded-md p-3 hover:border-darija-secondary transition duration-200">
              <div className="flex items-center gap-2 mb-1">
                <Bookmark className="h-4 w-4 text-amber-500" />
                <p className="font-semibold text-gray-800 dark:text-white">Darija Code Best Practices</p>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">By Fatima • 1 week ago</p>
              <div className="flex items-center gap-2 mt-2 text-sm text-gray-500 dark:text-gray-400">
                <Star className="h-3 w-3 text-amber-500" />
                <span>18 stars</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Study Groups */}
      <div>
        <button 
          onClick={() => toggleSection('studyGroups')}
          className="w-full flex items-center justify-between text-md font-semibold mb-3 text-gray-800 dark:text-white hover:text-darija-primary transition-colors"
        >
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Study Groups
          </div>
          {openSections.studyGroups ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        {openSections.studyGroups && (
          <div className="space-y-3">
            <div className="border dark:border-gray-700 rounded-md p-3 hover:border-darija-secondary transition duration-200">
              <div className="flex items-center gap-2 mb-1">
                <Users className="h-4 w-4 text-green-500" />
                <p className="font-semibold text-gray-800 dark:text-white">React Study Group</p>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">Weekly meetings • 12 members</p>
              <div className="flex items-center gap-2 mt-2 text-sm text-gray-500 dark:text-gray-400">
                <Clock className="h-3 w-3" />
                <span>Next meeting: Tomorrow, 19:00</span>
              </div>
            </div>
            <div className="border dark:border-gray-700 rounded-md p-3 hover:border-darija-secondary transition duration-200">
              <div className="flex items-center gap-2 mb-1">
                <Users className="h-4 w-4 text-green-500" />
                <p className="font-semibold text-gray-800 dark:text-white">JavaScript Fundamentals</p>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">Bi-weekly sessions • 8 members</p>
              <div className="flex items-center gap-2 mt-2 text-sm text-gray-500 dark:text-gray-400">
                <Clock className="h-3 w-3" />
                <span>Next meeting: Friday, 18:00</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LearningPaths; 