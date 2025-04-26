
import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Code, Smartphone, Database } from 'lucide-react';

const LearningPaths: React.FC = () => {
  const { t, language } = useLanguage();
  const isRtl = language === 'ar' || language === 'darija';
  
  return (
    <div className={`bg-white rounded-lg p-4 shadow ${isRtl ? 'rtl' : 'ltr'}`}>
      <h2 className="text-lg font-semibold mb-4">{t('section.paths')}</h2>
      
      <ul className="space-y-3">
        <li>
          <a href="#" className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-50 transition duration-200">
            <div className="flex-shrink-0 w-8 h-8 rounded-md bg-blue-100 flex items-center justify-center">
              <Code className="h-5 w-5 text-darija-secondary" />
            </div>
            <span>{t('path.web')}</span>
          </a>
        </li>
        
        <li>
          <a href="#" className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-50 transition duration-200">
            <div className="flex-shrink-0 w-8 h-8 rounded-md bg-green-100 flex items-center justify-center">
              <Smartphone className="h-5 w-5 text-green-600" />
            </div>
            <span>{t('path.mobile')}</span>
          </a>
        </li>
        
        <li>
          <a href="#" className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-50 transition duration-200">
            <div className="flex-shrink-0 w-8 h-8 rounded-md bg-purple-100 flex items-center justify-center">
              <Database className="h-5 w-5 text-purple-600" />
            </div>
            <span>{t('path.data')}</span>
          </a>
        </li>
      </ul>
      
      <div className="mt-4">
        <h3 className="text-lg font-semibold mb-3">{t('section.community')}</h3>
        
        <ul className="space-y-2">
          <li>
            <a href="#" className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-50 transition duration-200">
              <span>{t('community.discussions')}</span>
            </a>
          </li>
          
          <li>
            <a href="#" className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-50 transition duration-200">
              <span>{t('community.mentorship')}</span>
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default LearningPaths;
