
import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Mic, Send, Maximize2 } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';

const AIAssistant: React.FC = () => {
  const { t, language } = useLanguage();
  const isRtl = language === 'ar' || language === 'darija';
  
  return (
    <div className={`bg-white rounded-lg shadow overflow-hidden flex flex-col h-[420px] ${isRtl ? 'rtl' : 'ltr'}`}>
      <div className="p-4 border-b flex justify-between items-center">
        <h2 className="text-lg font-semibold flex items-center">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-darija-tertiary flex items-center justify-center mr-2">
            <span className="text-white text-sm">AI</span>
          </div>
          {t('section.assistant')}
        </h2>
        <Button variant="ghost" size="icon">
          <Maximize2 className="h-5 w-5" />
        </Button>
      </div>
      
      <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-2">
            <div className="w-8 h-8 rounded-full bg-darija-tertiary flex items-center justify-center shrink-0">
              <span className="text-white text-sm">AI</span>
            </div>
            <div className="bg-white p-3 rounded-lg shadow-sm max-w-[80%]">
              <p className={`text-sm ${isRtl ? 'text-right' : 'text-left'}`}>
                {language === 'darija' || language === 'ar' ? 'مرحبا كيف يمكنني مساعدتك اليوم؟' : 
                 language === 'fr' ? 'Bonjour, comment puis-je vous aider aujourd\'hui ?' : 
                 'Hello, how can I help you today?'}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="p-3 border-t bg-white">
        <div className="relative flex">
          <Button variant="ghost" size="icon" className="absolute left-1 top-1/2 transform -translate-y-1/2">
            <Mic className="h-5 w-5 text-gray-500" />
          </Button>
          
          <Input
            placeholder={t('assistant.placeholder')}
            className="w-full pl-10 pr-10 py-2 rounded-full border border-gray-300"
          />
          
          <Button size="icon" className="absolute right-1 top-1/2 transform -translate-y-1/2 rounded-full bg-darija-secondary w-8 h-8 p-0">
            <Send className="h-4 w-4 text-white" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
