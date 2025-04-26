import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'english' | 'arabic' | 'french' | 'darija';

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
};

// Translations
const translations: Record<Language, Record<string, string>> = {
  english: {
    'app.title': 'DarijaCode Hub',
    'nav.home': 'Home',
    'nav.learn': 'Learn',
    'nav.community': 'Community',
    'nav.assistant': 'AI Assistant',
    'nav.projects': 'Projects',
    'hero.title': 'Learn programming in your native language',
    'hero.subtitle': 'Learn coding in your native language with AI-powered assistance',
    'hero.search': 'Search for tutorials, courses, or ask a question...',
    'cta.start': 'Start Learning',
    'cta.join': 'Join Community',
    'cta.try': 'Try AI Assistant',
    'section.paths': 'Learning Paths',
    'path.web': 'Web Development',
    'path.mobile': 'Mobile Apps',
    'path.data': 'Data Science',
    'section.community': 'Community',
    'community.discussions': 'Discussions',
    'community.mentorship': 'Mentorship',
    'section.members': 'Active Members',
    'section.sessions': 'قهوة و كود Sessions',
    'section.assistant': 'AI Assistant',
    'assistant.placeholder': 'Type your question or use voice input...',
    'assistant.description': 'Select your preferred language to chat with the AI assistant in Darija, Arabic, French, or English.',
    'section.editor': 'Code Editor',
    'editor.html': 'HTML',
    'editor.css': 'CSS',
    'editor.js': 'JavaScript',
  },
  arabic: {
    'app.title': 'دريجة كود هب',
    'nav.home': 'الرئيسية',
    'nav.learn': 'تعلم',
    'nav.community': 'المجتمع',
    'nav.assistant': 'مساعد الذكاء',
    'nav.projects': 'المشاريع',
    'hero.title': 'تعلم البرمجة بلغتك الأم',
    'hero.subtitle': 'تعلم البرمجة بلغتك الأم مع مساعدة بالذكاء الاصطناعي',
    'hero.search': 'ابحث عن دروس، دورات، أو اطرح سؤالاً...',
    'cta.start': 'ابدأ التعلم',
    'cta.join': 'انضم للمجتمع',
    'cta.try': 'جرب مساعد الذكاء',
    'section.paths': 'مسارات التعلم',
    'path.web': 'تطوير الويب',
    'path.mobile': 'تطبيقات الموبايل',
    'path.data': 'علم البيانات',
    'section.community': 'المجتمع',
    'community.discussions': 'المناقشات',
    'community.mentorship': 'التوجيه',
    'section.members': 'الأعضاء النشطون',
    'section.sessions': 'جلسات قهوة و كود',
    'section.assistant': 'مساعد الذكاء',
    'assistant.placeholder': 'اكتب سؤالك أو استخدم التسجيل الصوتي...',
    'assistant.description': 'اختر لغتك المفضلة للدردشة مع المساعد الذكي بالدارجة أو العربية أو الفرنسية أو الإنجليزية.',
    'section.editor': 'محرر الكود',
    'editor.html': 'HTML',
    'editor.css': 'CSS',
    'editor.js': 'جافاسكريبت',
  },
  french: {
    'app.title': 'DarijaCode Hub',
    'nav.home': 'Accueil',
    'nav.learn': 'Apprendre',
    'nav.community': 'Communauté',
    'nav.assistant': 'Assistant IA',
    'nav.projects': 'Projets',
    'hero.title': 'Apprendre la programmation dans votre langue natale',
    'hero.subtitle': 'Apprenez le codage dans votre langue avec assistance IA',
    'hero.search': 'Rechercher des tutoriels, des cours ou poser une question...',
    'cta.start': 'Commencer',
    'cta.join': 'Rejoindre',
    'cta.try': 'Essayer IA',
    'section.paths': 'Parcours d\'Apprentissage',
    'path.web': 'Développement Web',
    'path.mobile': 'Applications Mobiles',
    'path.data': 'Science des Données',
    'section.community': 'Communauté',
    'community.discussions': 'Discussions',
    'community.mentorship': 'Mentorat',
    'section.members': 'Membres Actifs',
    'section.sessions': 'Sessions Café et Code',
    'section.assistant': 'Assistant IA',
    'assistant.placeholder': 'Tapez votre question ou utilisez l\'entrée vocale...',
    'assistant.description': 'Sélectionnez votre langue préférée pour discuter avec l\'assistant IA en Darija, Arabe, Français ou Anglais.',
    'section.editor': 'Éditeur de Code',
    'editor.html': 'HTML',
    'editor.css': 'CSS',
    'editor.js': 'JavaScript',
  },
  darija: {
    'app.title': 'دريجة كود هب',
    'nav.home': 'الصفحة الرئيسية',
    'nav.learn': 'تعلم',
    'nav.community': 'المجتمع',
    'nav.assistant': 'المساعد الذكي',
    'nav.projects': 'المشاريع',
    'hero.title': 'تعلم البرمجة بلغتك الأم',
    'hero.subtitle': 'تعلم الكود بلغتك مع مساعدة بالذكاء الاصطناعي',
    'hero.search': 'قلب على دروس، كورسات، ولا طرح سؤال...',
    'cta.start': 'بدا التعلم',
    'cta.join': 'دخل للمجتمع',
    'cta.try': 'جرب المساعد',
    'section.paths': 'طرق التعلم',
    'path.web': 'برمجة المواقع',
    'path.mobile': 'تطبيقات الهاتف',
    'path.data': 'علم البيانات',
    'section.community': 'المجتمع',
    'community.discussions': 'نقاشات',
    'community.mentorship': 'توجيه',
    'section.members': 'الأعضاء النشيطين',
    'section.sessions': 'جلسات قهوة و كود',
    'section.assistant': 'المساعد الذكي',
    'assistant.placeholder': 'كتب سؤالك ولا استعمل الصوت...',
    'assistant.description': 'اختار اللغة اللي بغيتي باش تدردش مع المساعد الذكي، بالدارجة، العربية، الفرنسية ولا الانجليزية.',
    'section.editor': 'محرر الكود',
    'editor.html': 'HTML',
    'editor.css': 'CSS',
    'editor.js': 'جافاسكريبت',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('english');

  const t = (key: string): string => {
    // Handle missing languages gracefully
    if (!translations[language]) {
      console.warn(`Missing language: ${language}`);
      return key;
    }
    
    // Handle missing translation keys gracefully
    const translatedText = translations[language][key];
    if (!translatedText) {
      console.warn(`Missing translation key: ${key} for language: ${language}`);
      
      // Try to find the key in English as fallback
      if (language !== 'english' && translations['english'] && translations['english'][key]) {
        return translations['english'][key];
      }
      
      return key;
    }
    
    return translatedText;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
