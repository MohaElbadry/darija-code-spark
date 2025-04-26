
import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const ActiveMembers: React.FC = () => {
  const { t, language } = useLanguage();
  const isRtl = language === 'ar' || language === 'darija';
  
  return (
    <div className={`bg-white rounded-lg p-4 shadow ${isRtl ? 'rtl' : 'ltr'}`}>
      <h2 className="text-lg font-semibold mb-4">{t('section.members')}</h2>
      
      <ul className="space-y-4">
        <li className="flex items-center gap-3">
          <img 
            src="https://randomuser.me/api/portraits/women/32.jpg" 
            alt="Fatima" 
            className="h-8 w-8 rounded-full border-2 border-white shadow-sm"
          />
          <div>
            <p className="font-semibold">Fatima</p>
            <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
          </div>
        </li>
        
        <li className="flex items-center gap-3">
          <img 
            src="https://randomuser.me/api/portraits/men/45.jpg" 
            alt="Karim" 
            className="h-8 w-8 rounded-full border-2 border-white shadow-sm"
          />
          <div>
            <p className="font-semibold">Karim</p>
            <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
          </div>
        </li>
      </ul>
      
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-3">{t('section.sessions')}</h3>
        
        <div className="space-y-3">
          <div className="border rounded-md p-3 hover:border-darija-secondary transition duration-200">
            <p className="font-semibold">React Basics</p>
            <p className="text-sm text-gray-500">Tomorrow, 15:00</p>
          </div>
          
          <div className="border rounded-md p-3 hover:border-darija-secondary transition duration-200">
            <p className="font-semibold">API Design</p>
            <p className="text-sm text-gray-500">Friday, 16:00</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActiveMembers;
