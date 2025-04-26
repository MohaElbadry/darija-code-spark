import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Clock, Calendar, AlertCircle, CheckCircle2 } from 'lucide-react';

const ActiveMembers: React.FC = () => {
  const { t, language } = useLanguage();
  const isRtl = language === 'arabic' || language === 'darija';
  
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg p-4 shadow ${isRtl ? 'rtl' : 'ltr'}`}>
      <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">{t('section.members')}</h2>
      
      <ul className="space-y-4">
        <li className="flex items-center gap-3">
          <div className="relative">
            <img 
              src="https://randomuser.me/api/portraits/women/32.jpg" 
              alt="Fatima" 
              className="h-8 w-8 rounded-full border-2 border-white shadow-sm"
            />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white"></span>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="font-semibold text-gray-800 dark:text-white">Fatima</p>
              <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                Available
              </span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Interested in group discussion</p>
          </div>
        </li>
        
        <li className="flex items-center gap-3">
          <div className="relative">
            <img 
              src="https://randomuser.me/api/portraits/men/45.jpg" 
              alt="Karim" 
              className="h-8 w-8 rounded-full border-2 border-white shadow-sm"
            />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white"></span>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="font-semibold text-gray-800 dark:text-white">Karim</p>
              <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                Busy
              </span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Available for 1:1 mentoring</p>
          </div>
        </li>
      </ul>
      
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white">{t('section.sessions')}</h3>
        
        <div className="space-y-3">
          <div className="border dark:border-gray-700 rounded-md p-3 hover:border-darija-secondary transition duration-200 bg-red-50 dark:bg-red-900/20">
            <div className="flex items-center gap-2 mb-1">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <p className="font-semibold text-gray-800 dark:text-white">React Basics</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <Clock className="h-3 w-3" />
              <span>Tomorrow, 15:00</span>
              <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                Urgent
              </span>
            </div>
          </div>
          
          <div className="border dark:border-gray-700 rounded-md p-3 hover:border-darija-secondary transition duration-200 bg-blue-50 dark:bg-blue-900/20">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="h-4 w-4 text-blue-500" />
              <p className="font-semibold text-gray-800 dark:text-white">API Design</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <Clock className="h-3 w-3" />
              <span>Friday, 16:00</span>
              <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                Scheduled
              </span>
            </div>
          </div>

          <div className="border dark:border-gray-700 rounded-md p-3 hover:border-darija-secondary transition duration-200 bg-green-50 dark:bg-green-900/20">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <p className="font-semibold text-gray-800 dark:text-white">JavaScript Fundamentals</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <Clock className="h-3 w-3" />
              <span>Next Week, 14:00</span>
              <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                Confirmed
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActiveMembers;
