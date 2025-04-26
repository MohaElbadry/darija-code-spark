import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Mic, GraduationCap, Users, Sparkles } from 'lucide-react';

const HeroSection: React.FC = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const isRtl = language === 'arabic' || language === 'darija';
  
  console.log('Current language:', language);
  console.log('Translation result:', t('hero.title'));
  
  const handleStartLearning = () => {
    console.log('Navigating to learning setup');
    navigate('/learning-setup');
  };

  const handleJoinCommunity = () => {
    console.log('Navigating to community');
    navigate('/community');
  };

  const handleTryAI = () => {
    console.log('Navigating to AI assistant');
    navigate('/assistant');
  };
  
  return (
    <section className="py-16 text-center">
      <div className="container mx-auto px-4">
        <h1 
          className={`text-4xl font-bold mb-4 text-gray-900 dark:text-white ${isRtl ? 'rtl' : 'ltr'}`}
          style={{ fontFamily: isRtl ? 'Arial, sans-serif' : 'inherit' }}
        >
          {t('hero.title')}
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">{t('hero.subtitle')}</p>
        
        <div className="mx-auto max-w-xl mb-10">
          <div className="relative">
            <Input
              type="text"
              placeholder={t('hero.search')}
              className="w-full rounded-full pl-4 pr-10 py-3 border border-gray-300 dark:border-gray-700 focus:border-darija-secondary dark:bg-gray-800 dark:text-white"
            />
            <button className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <Mic className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button 
            className="bg-darija-primary hover:bg-red-700 rounded-full px-8 py-2 flex items-center gap-2"
            onClick={handleStartLearning}
          >
            <GraduationCap className="h-5 w-5" />
            {t('cta.start')}
          </Button>
          <Button 
            className="bg-darija-secondary hover:bg-blue-700 rounded-full px-8 py-2 flex items-center gap-2"
            onClick={handleJoinCommunity}
          >
            <Users className="h-5 w-5" />
            {t('cta.join')}
          </Button>
          <Button 
            className="bg-darija-tertiary hover:bg-amber-600 rounded-full px-8 py-2 flex items-center gap-2"
            onClick={handleTryAI}
          >
            <Sparkles className="h-5 w-5" />
            {t('cta.try')}
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
