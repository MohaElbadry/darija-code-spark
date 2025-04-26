import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'english' | 'arabic' | 'french' | 'darija';

interface TranslationParams {
  [key: string]: string | number;
}

interface TranslationObject {
  [key: string]: string | TranslationObject;
}

interface Translations {
  [language: string]: TranslationObject;
}

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
};

// Translations
const translations: Translations = {
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
    'section.sessions': 'Coffee & Code Sessions',
    'section.assistant': 'AI Assistant',
    'assistant.placeholder': 'Type your question or use voice input...',
    'section.editor': 'Code Editor',
    'editor.html': 'HTML',
    'editor.css': 'CSS',
    'editor.js': 'JavaScript',
    coffee: {
      sessions: 'Coffee & Code Sessions',
      upcoming_sessions: 'Upcoming Sessions',
      join_description: 'Join our live coding sessions and learn with the community',
      python_intro: 'Python Introduction',
      today_7pm: 'Today, 7:00 PM',
      participants_count: '{count} participants',
      virtual: 'Virtual Session',
      join_session: 'Join Session',
      web_dev_basics: 'Web Development Basics',
      tomorrow_6pm: 'Tomorrow, 6:00 PM',
      session_details: 'Session Details',
      session_expectations: 'What to expect in our sessions',
      format: 'Format',
      format_description: 'Live coding sessions with interactive Q&A',
      requirements: 'Requirements',
      requirement_basic: 'Basic programming knowledge',
      requirement_laptop: 'Laptop with internet access',
      requirement_internet: 'Stable internet connection',
      benefits: 'Benefits',
      benefit_learn: 'Learn from experienced developers',
      benefit_feedback: 'Get real-time feedback',
      benefit_network: 'Network with other learners',
      benefit_practice: 'Practice coding in a supportive environment',
      find_mentor: 'Find a Mentor',
      mentor_description: 'Connect with experienced developers for guidance',
      search_mentors: 'Search mentors...',
      mentor_john: 'John Doe',
      mentor_john_title: 'Senior Full Stack Developer',
      mentor_john_skills: 'JavaScript, Python, React',
      mentor_john_languages: 'English, French, Darija',
      mentor_sarah: 'Sarah Smith',
      mentor_sarah_title: 'Frontend Developer',
      mentor_sarah_skills: 'React, TypeScript, CSS',
      mentor_sarah_languages: 'English, Arabic',
      contact_mentor: 'Contact Mentor'
    },
    projects: {
      title: 'Projects',
      subtitle: 'Browse and contribute to community projects',
      new: 'New Project',
      search: {
        placeholder: 'Search projects...'
      },
      filter: {
        all: 'All Projects',
        active: 'Active',
        completed: 'Completed',
        archived: 'Archived'
      },
      sort: {
        recent: 'Most Recent',
        favorite: 'Most Favorited'
      },
      status: {
        active: 'Active',
        completed: 'Completed',
        archived: 'Archived'
      },
      members: '{count} members',
      actions: {
        view: 'View Project',
        favorite: 'Favorite',
        unfavorite: 'Unfavorite'
      },
      darija: {
        title: 'Darija Learning App',
        description: 'Interactive app for learning Moroccan Arabic'
      },
      exchange: {
        title: 'Language Exchange Platform',
        description: 'Connect with native speakers for language practice'
      },
      culture: {
        title: 'Cultural Guide',
        description: 'Explore Moroccan culture and traditions'
      }
    },
    community: {
      forum: 'Community Forum',
      join_conversation: 'Join the conversation and connect with other learners',
      new_thread: 'New Thread',
      search_threads: 'Search threads...',
      filter_category: 'Filter by category',
      recent: 'Recent',
      popular: 'Popular',
      replies: '{count} replies',
      views: '{count} views',
      likes: '{count} likes',
      reply: 'Reply',
      like: 'Like',
      bookmark: 'Bookmark',
      unbookmark: 'Unbookmark',
      share: 'Share',
      categories: {
        all: 'All Categories',
        learning_resources: 'Learning Resources',
        cultural_exchange: 'Cultural Exchange',
        language_practice: 'Language Practice',
        questions: 'Questions',
        announcements: 'Announcements'
      },
      threads: {
        darija_resources: {
          title: 'Best Resources for Learning Darija',
          content: 'I\'ve been learning Darija for a few months and wanted to share some of the best resources I\'ve found...'
        },
        cultural_exchange: {
          title: 'Cultural Exchange: Moroccan Traditions',
          content: 'Let\'s discuss and share our experiences with Moroccan traditions and customs...'
        },
        language_partner: {
          title: 'Language Practice Partner Thread',
          content: 'Looking for someone to practice Darija with? Post here and find a language partner!'
        }
      }
    },
    roadmap: {
      default_title: '{path} - {level} Roadmap',
      default_description: 'A comprehensive roadmap for learning {path} at a {level} level, tailored for {language} speakers.',
      web_dev_title: 'Web Development - {level} Roadmap',
      web_dev_description: 'A comprehensive roadmap for learning web development at a {level} level, including HTML, CSS, JavaScript, and modern frameworks. Tailored for {language} speakers.',
      mobile_dev_title: 'Mobile Development - {level} Roadmap',
      mobile_dev_description: 'A comprehensive roadmap for learning mobile app development at a {level} level, covering native and cross-platform development. Tailored for {language} speakers.',
      error: 'Error',
      error_loading_path: 'Failed to load learning path data',
      error_generation: 'Failed to generate roadmap',
      error_empty: 'Generated roadmap was empty or invalid',
      error_saving: 'Error Saving Roadmap',
      error_try_again: 'Please try again',
      generated: 'Roadmap Generated (Draft)',
      generated_description: 'Your AI-powered learning roadmap is ready!',
      saved: 'Roadmap Saved',
      saved_description: 'Your learning roadmap has been saved successfully.',
      loading: 'Loading preferences...',
      generator: 'Learning Roadmap Generator',
      generator_description: 'Customize your AI-generated learning path',
      title: 'Roadmap Title',
      description: 'Roadmap Description',
      custom_prompt: 'Refine with Custom Prompt (Optional)',
      prompt_placeholder: 'Example: Create a 6-step roadmap focusing on practical projects. Include estimated time and 2-3 keywords per step.',
      generating: 'Generating...',
      regenerate: 'Regenerate with AI',
      saving: 'Saving...',
      save_roadmap: 'Save & Start Learning',
      default_step_description: 'This step focuses on learning {title}. Take your time to understand the concepts thoroughly.',
      time_beginner: '1-2 hours',
      time_intermediate: '3-4 hours',
      time_advanced: '5-6 hours',
      view: {
        back: 'Back to Roadmaps',
        progress: 'Overall Progress',
        steps: 'Learning Steps',
        step: {
          status: {
            pending: 'Pending',
            in_progress: 'In Progress',
            completed: 'Completed'
          },
          estimated_time: 'Estimated Time',
          keywords: 'Keywords',
          notes: 'Notes',
          add_notes: 'Add Notes',
          update_notes: 'Update Notes',
          mark_complete: 'Mark as Complete',
          mark_in_progress: 'Mark as In Progress',
          mark_pending: 'Mark as Pending'
        },
        error: {
          loading: 'Error loading roadmap',
          no_steps: 'No steps found for this roadmap',
          update_progress: 'Failed to update progress',
          update_notes: 'Failed to update notes'
        }
      }
    }
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
    'section.editor': 'محرر الكود',
    'editor.html': 'HTML',
    'editor.css': 'CSS',
    'editor.js': 'جافاسكريبت',
    coffee: {
      sessions: 'جلسات قهوة و كود',
      upcoming_sessions: 'الجلسات القادمة',
      join_description: 'انضم إلى جلسات البرمجة المباشرة وتعلم مع المجتمع',
      python_intro: 'مقدمة في بايثون',
      today_7pm: 'اليوم، الساعة 7:00 مساءً',
      participants_count: '{count} مشارك',
      virtual: 'جلسة افتراضية',
      join_session: 'انضم إلى الجلسة',
      web_dev_basics: 'أساسيات تطوير الويب',
      tomorrow_6pm: 'غداً، الساعة 6:00 مساءً',
      session_details: 'تفاصيل الجلسة',
      session_expectations: 'ما يمكن توقعه في جلساتنا',
      format: 'التنسيق',
      format_description: 'جلسات برمجة مباشرة مع أسئلة وأجوبة تفاعلية',
      requirements: 'المتطلبات',
      requirement_basic: 'معرفة أساسية بالبرمجة',
      requirement_laptop: 'حاسوب محمول مع اتصال بالإنترنت',
      requirement_internet: 'اتصال إنترنت مستقر',
      benefits: 'الفوائد',
      benefit_learn: 'تعلم من المطورين ذوي الخبرة',
      benefit_feedback: 'احصل على تعليقات فورية',
      benefit_network: 'تواصل مع المتعلمين الآخرين',
      benefit_practice: 'مارس البرمجة في بيئة داعمة',
      find_mentor: 'ابحث عن مرشد',
      mentor_description: 'تواصل مع المطورين ذوي الخبرة للحصول على التوجيه',
      search_mentors: 'ابحث عن المرشدين...',
      mentor_john: 'جون دو',
      mentor_john_title: 'مطور كامل الخبرة',
      mentor_john_skills: 'جافاسكريبت، بايثون، رياكت',
      mentor_john_languages: 'الإنجليزية، الفرنسية، الدارجة',
      mentor_sarah: 'سارة سميث',
      mentor_sarah_title: 'مطورة واجهة أمامية',
      mentor_sarah_skills: 'رياكت، تايبسكريبت، CSS',
      mentor_sarah_languages: 'الإنجليزية، العربية',
      contact_mentor: 'اتصل بالمرشد'
    },
    projects: {
      title: 'المشاريع',
      subtitle: 'تصفح وساهم في مشاريع المجتمع',
      new: 'مشروع جديد',
      search: {
        placeholder: 'ابحث عن المشاريع...'
      },
      filter: {
        all: 'جميع المشاريع',
        active: 'نشط',
        completed: 'مكتمل',
        archived: 'مؤرشف'
      },
      sort: {
        recent: 'الأحدث',
        favorite: 'الأكثر تفضيلاً'
      },
      status: {
        active: 'نشط',
        completed: 'مكتمل',
        archived: 'مؤرشف'
      },
      members: '{count} عضو',
      actions: {
        view: 'عرض المشروع',
        favorite: 'إضافة للمفضلة',
        unfavorite: 'إزالة من المفضلة'
      },
      darija: {
        title: 'تطبيق تعلم الدارجة',
        description: 'تطبيق تفاعلي لتعلم اللهجة المغربية'
      },
      exchange: {
        title: 'منصة تبادل اللغات',
        description: 'تواصل مع الناطقين الأصليين لممارسة اللغة'
      },
      culture: {
        title: 'دليل ثقافي',
        description: 'استكشف الثقافة والتقاليد المغربية'
      }
    },
    community: {
      forum: 'منتدى المجتمع',
      join_conversation: 'انضم إلى المحادثة وتواصل مع المتعلمين الآخرين',
      new_thread: 'موضوع جديد',
      search_threads: 'البحث في المواضيع...',
      filter_category: 'تصفية حسب الفئة',
      recent: 'الأحدث',
      popular: 'الأكثر شعبية',
      replies: '{count} رد',
      views: '{count} مشاهدة',
      likes: '{count} إعجاب',
      reply: 'رد',
      like: 'إعجاب',
      bookmark: 'حفظ',
      unbookmark: 'إلغاء الحفظ',
      share: 'مشاركة',
      categories: {
        all: 'جميع الفئات',
        learning_resources: 'موارد التعلم',
        cultural_exchange: 'تبادل ثقافي',
        language_practice: 'ممارسة اللغة',
        questions: 'أسئلة',
        announcements: 'إعلانات'
      },
      threads: {
        darija_resources: {
          title: 'أفضل الموارد لتعلم الدارجة',
          content: 'كنت أتعلم الدارجة منذ بضعة أشهر وأردت مشاركة بعض من أفضل الموارد التي وجدتها...'
        },
        cultural_exchange: {
          title: 'تبادل ثقافي: التقاليد المغربية',
          content: 'دعونا نناقش ونشارك تجاربنا مع التقاليد والعادات المغربية...'
        },
        language_partner: {
          title: 'موضوع شريك ممارسة اللغة',
          content: 'تبحث عن شخص لممارسة الدارجة معه؟ انشر هنا واعثر على شريك لغة!'
        }
      }
    },
    roadmap: {
      default_title: '{path} - خارطة طريق {level}',
      default_description: 'خارطة طريق شاملة لتعلم {path} بمستوى {level}، مصممة لمتحدثي {language}',
      error: 'خطأ',
      error_loading_path: 'فشل تحميل بيانات مسار التعلم',
      error_generation: 'فشل إنشاء خارطة الطريق',
      error_empty: 'خارطة الطريق المولدة فارغة أو غير صالحة',
      error_saving: 'خطأ في حفظ خارطة الطريق',
      error_try_again: 'يرجى المحاولة مرة أخرى',
      generated: 'تم إنشاء خارطة الطريق (مسودة)',
      generated_description: 'خارطة طريق التعلم المدعومة بالذكاء الاصطناعي جاهزة!',
      saved: 'تم حفظ خارطة الطريق',
      saved_description: 'تم حفظ خارطة طريق التعلم بنجاح',
      loading: 'جاري التحميل...',
      generator: 'منشئ خارطة طريق التعلم',
      generator_description: 'قم بتخصيص مسار التعلم المولد بالذكاء الاصطناعي',
      title: 'عنوان خارطة الطريق',
      description: 'وصف خارطة الطريق',
      custom_prompt: 'تحسين باستخدام توجيه مخصص (اختياري)',
      prompt_placeholder: 'مثال: أنشئ خارطة طريق من 6 خطوات تركز على المشاريع العملية. أضف وقتًا مقدرًا و2-3 كلمات مفتاحية لكل خطوة.',
      generating: 'جاري الإنشاء...',
      regenerate: 'إعادة الإنشاء بالذكاء الاصطناعي',
      saving: 'جاري الحفظ...',
      save_roadmap: 'حفظ وبدء التعلم',
      default_step_description: 'هذه الخطوة تركز على تعلم {title}. خذ وقتك لفهم المفاهيم بشكل جيد.',
      time_beginner: '1-2 ساعة',
      time_intermediate: '3-4 ساعات',
      time_advanced: '5-6 ساعات',
      view: {
        back: 'العودة إلى خرائط الطريق',
        progress: 'التقدم العام',
        steps: 'خطوات التعلم',
        step: {
          status: {
            pending: 'قيد الانتظار',
            in_progress: 'قيد التنفيذ',
            completed: 'مكتمل'
          },
          estimated_time: 'الوقت المقدر',
          keywords: 'الكلمات الرئيسية',
          notes: 'الملاحظات',
          add_notes: 'إضافة ملاحظات',
          update_notes: 'تحديث الملاحظات',
          mark_complete: 'وضع علامة مكتمل',
          mark_in_progress: 'وضع علامة قيد التنفيذ',
          mark_pending: 'وضع علامة قيد الانتظار'
        },
        error: {
          loading: 'خطأ في تحميل خارطة الطريق',
          no_steps: 'لم يتم العثور على خطوات لهذه خارطة الطريق',
          update_progress: 'فشل تحديث التقدم',
          update_notes: 'فشل تحديث الملاحظات'
        }
      }
    }
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
    'section.editor': 'Éditeur de Code',
    'editor.html': 'HTML',
    'editor.css': 'CSS',
    'editor.js': 'JavaScript',
    coffee: {
      sessions: 'Sessions Café et Code',
      upcoming_sessions: 'Sessions à venir',
      join_description: 'Rejoignez nos sessions de codage en direct et apprenez avec la communauté',
      python_intro: 'Introduction à Python',
      today_7pm: 'Aujourd\'hui, 19h00',
      participants_count: '{count} participants',
      virtual: 'Session virtuelle',
      join_session: 'Rejoindre la session',
      web_dev_basics: 'Bases du développement web',
      tomorrow_6pm: 'Demain, 18h00',
      session_details: 'Détails de la session',
      session_expectations: 'Ce à quoi s\'attendre dans nos sessions',
      format: 'Format',
      format_description: 'Sessions de codage en direct avec Q&R interactives',
      requirements: 'Prérequis',
      requirement_basic: 'Connaissances de base en programmation',
      requirement_laptop: 'Ordinateur portable avec accès internet',
      requirement_internet: 'Connexion internet stable',
      benefits: 'Avantages',
      benefit_learn: 'Apprenez des développeurs expérimentés',
      benefit_feedback: 'Obtenez des retours en temps réel',
      benefit_network: 'Réseautez avec d\'autres apprenants',
      benefit_practice: 'Pratiquez le codage dans un environnement favorable',
      find_mentor: 'Trouver un mentor',
      mentor_description: 'Connectez-vous avec des développeurs expérimentés pour obtenir des conseils',
      search_mentors: 'Rechercher des mentors...',
      mentor_john: 'John Doe',
      mentor_john_title: 'Développeur Full Stack Senior',
      mentor_john_skills: 'JavaScript, Python, React',
      mentor_john_languages: 'Anglais, Français, Darija',
      mentor_sarah: 'Sarah Smith',
      mentor_sarah_title: 'Développeuse Frontend',
      mentor_sarah_skills: 'React, TypeScript, CSS',
      mentor_sarah_languages: 'Anglais, Arabe',
      contact_mentor: 'Contacter le mentor'
    },
    projects: {
      title: 'Projets',
      subtitle: 'Parcourez et contribuez aux projets communautaires',
      new: 'Nouveau projet',
      search: {
        placeholder: 'Rechercher des projets...'
      },
      filter: {
        all: 'Tous les projets',
        active: 'Actif',
        completed: 'Terminé',
        archived: 'Archivé'
      },
      sort: {
        recent: 'Plus récent',
        favorite: 'Plus favorisé'
      },
      status: {
        active: 'Actif',
        completed: 'Terminé',
        archived: 'Archivé'
      },
      members: '{count} membres',
      actions: {
        view: 'Voir le projet',
        favorite: 'Favori',
        unfavorite: 'Retirer des favoris'
      },
      darija: {
        title: 'Application d\'apprentissage du Darija',
        description: 'Application interactive pour apprendre l\'arabe marocain'
      },
      exchange: {
        title: 'Plateforme d\'échange linguistique',
        description: 'Connectez-vous avec des locuteurs natifs pour pratiquer la langue'
      },
      culture: {
        title: 'Guide culturel',
        description: 'Explorez la culture et les traditions marocaines'
      }
    },
    community: {
      forum: 'Forum communautaire',
      join_conversation: 'Rejoignez la conversation et connectez-vous avec d\'autres apprenants',
      new_thread: 'Nouveau sujet',
      search_threads: 'Rechercher des sujets...',
      filter_category: 'Filtrer par catégorie',
      recent: 'Récent',
      popular: 'Populaire',
      replies: '{count} réponses',
      views: '{count} vues',
      likes: '{count} j\'aime',
      reply: 'Répondre',
      like: 'J\'aime',
      bookmark: 'Enregistrer',
      unbookmark: 'Désenregistrer',
      share: 'Partager',
      categories: {
        all: 'Toutes les catégories',
        learning_resources: 'Ressources d\'apprentissage',
        cultural_exchange: 'Échange culturel',
        language_practice: 'Pratique de la langue',
        questions: 'Questions',
        announcements: 'Annonces'
      },
      threads: {
        darija_resources: {
          title: 'Meilleures ressources pour apprendre le Darija',
          content: 'J\'apprends le Darija depuis quelques mois et je voulais partager certaines des meilleures ressources que j\'ai trouvées...'
        },
        cultural_exchange: {
          title: 'Échange culturel : Traditions marocaines',
          content: 'Discutons et partageons nos expériences avec les traditions et coutumes marocaines...'
        },
        language_partner: {
          title: 'Fil de discussion pour partenaire de langue',
          content: 'Vous cherchez quelqu\'un pour pratiquer le Darija ? Postez ici et trouvez un partenaire de langue !'
        }
      }
    },
    roadmap: {
      default_title: '{path} - Feuille de route {level}',
      default_description: 'Une feuille de route complète pour apprendre {path} au niveau {level}, adaptée aux locuteurs de {language}',
      error: 'Erreur',
      error_loading_path: 'Échec du chargement des données du parcours d\'apprentissage',
      error_generation: 'Échec de la génération de la feuille de route',
      error_empty: 'La feuille de route générée est vide ou invalide',
      error_saving: 'Erreur lors de la sauvegarde de la feuille de route',
      error_try_again: 'Veuillez réessayer',
      generated: 'Feuille de route générée (Brouillon)',
      generated_description: 'Votre feuille de route d\'apprentissage assistée par IA est prête !',
      saved: 'Feuille de route sauvegardée',
      saved_description: 'Votre feuille de route d\'apprentissage a été sauvegardée avec succès',
      loading: 'Chargement en cours...',
      generator: 'Générateur de feuille de route d\'apprentissage',
      generator_description: 'Personnalisez votre parcours d\'apprentissage généré par IA',
      title: 'Titre de la feuille de route',
      description: 'Description de la feuille de route',
      custom_prompt: 'Affiner avec un prompt personnalisé (Optionnel)',
      prompt_placeholder: 'Exemple : Créez une feuille de route de 6 étapes axée sur des projets pratiques. Incluez le temps estimé et 2-3 mots-clés par étape.',
      generating: 'Génération en cours...',
      regenerate: 'Régénérer avec l\'IA',
      saving: 'Sauvegarde en cours...',
      save_roadmap: 'Sauvegarder et commencer l\'apprentissage',
      default_step_description: 'Cette étape se concentre sur l\'apprentissage de {title}. Prenez votre temps pour bien comprendre les concepts.',
      time_beginner: '1-2 heures',
      time_intermediate: '3-4 heures',
      time_advanced: '5-6 heures',
      view: {
        back: 'Retour aux feuilles de route',
        progress: 'Progression globale',
        steps: 'Étapes d\'apprentissage',
        step: {
          status: {
            pending: 'En attente',
            in_progress: 'En cours',
            completed: 'Terminé'
          },
          estimated_time: 'Temps estimé',
          keywords: 'Mots-clés',
          notes: 'Notes',
          add_notes: 'Ajouter des notes',
          update_notes: 'Mettre à jour les notes',
          mark_complete: 'Marquer comme terminé',
          mark_in_progress: 'Marquer comme en cours',
          mark_pending: 'Marquer comme en attente'
        },
        error: {
          loading: 'Erreur lors du chargement de la feuille de route',
          no_steps: 'Aucune étape trouvée pour cette feuille de route',
          update_progress: 'Échec de la mise à jour de la progression',
          update_notes: 'Échec de la mise à jour des notes'
        }
      }
    }
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
    'section.sessions': 'Sessions dyal Qahwa w Code',
    'section.assistant': 'المساعد الذكي',
    'assistant.placeholder': 'كتب سؤالك ولا استعمل الصوت...',
    'section.editor': 'محرر الكود',
    'editor.html': 'HTML',
    'editor.css': 'CSS',
    'editor.js': 'جافاسكريبت',
    coffee: {
      sessions: 'Sessions dyal Qahwa w Code',
      upcoming_sessions: 'Sessions li jayin',
      join_description: 'Dkhel l sessions dyalna w 3lem m3a ljama3a',
      python_intro: 'Introduction l Python',
      today_7pm: 'Lyoum, 7:00 l3chiya',
      participants_count: '{count} mcha3rin',
      virtual: 'Session virtuelle',
      join_session: 'Dkhel l session',
      web_dev_basics: 'Les bases dyal web development',
      tomorrow_6pm: 'Ghedda, 6:00 l3chiya',
      session_details: 'Tfassil dyal session',
      session_expectations: 'Shno t9der t9der f sessions dyalna',
      format: 'Format',
      format_description: 'Sessions dyal code m3a questions w jawabat',
      requirements: 'Les requirements',
      requirement_basic: 'Ma3rifa dyal base f programming',
      requirement_laptop: 'Laptop m3a internet',
      requirement_internet: 'Internet stable',
      benefits: 'Les avantages',
      benefit_learn: '3lem mn developers m3a tajriba',
      benefit_feedback: 'Khod feedback f wa9t l7a9i9i',
      benefit_network: 'T3arfo m3a mot3almin khor',
      benefit_practice: 'T9awd f coding f environnement mzyan',
      find_mentor: 'L9a mentor',
      mentor_description: 'T3arfo m3a developers m3a tajriba bach tkhod conseils',
      search_mentors: '9elleb 3la mentors...',
      mentor_john: 'John Doe',
      mentor_john_title: 'Senior Full Stack Developer',
      mentor_john_skills: 'JavaScript, Python, React',
      mentor_john_languages: 'English, French, Darija',
      mentor_sarah: 'Sarah Smith',
      mentor_sarah_title: 'Frontend Developer',
      mentor_sarah_skills: 'React, TypeScript, CSS',
      mentor_sarah_languages: 'English, Arabic',
      contact_mentor: 'Contacti l mentor'
    },
    projects: {
      title: 'Projects',
      subtitle: '9elleb w s3ed f projects dyal ljama3a',
      new: 'Project jdid',
      search: {
        placeholder: '9elleb 3la projects...'
      },
      filter: {
        all: 'Kol projects',
        active: 'Active',
        completed: 'Kml',
        archived: 'Archivé'
      },
      sort: {
        recent: 'L7dith',
        favorite: 'L2ksar favorite'
      },
      status: {
        active: 'Active',
        completed: 'Kml',
        archived: 'Archivé'
      },
      members: '{count} members',
      actions: {
        view: 'Chouf project',
        favorite: 'Favorite',
        unfavorite: 'Mashi favorite'
      },
      darija: {
        title: 'App dyal t3lem darija',
        description: 'App interactive bach t3lem darija'
      },
      exchange: {
        title: 'Platform dyal tbadl loughat',
        description: 'T3arfo m3a nass li 3endhom darija bach t9awd'
      },
      culture: {
        title: 'Guide th9afi',
        description: 'T3ref 3la th9afa w l3adat dyal lmaghrib'
      }
    },
    community: {
      forum: 'Forum dyal ljama3a',
      join_conversation: 'Dkhel f conversation w t3arfo m3a mot3almin khor',
      new_thread: 'Mawdo3 jdid',
      search_threads: '9elleb 3la mawadi3...',
      filter_category: 'Saffi 3la category',
      recent: 'L7dith',
      popular: 'L2ksar mchhour',
      replies: '{count} jawabat',
      views: '{count} chouf',
      likes: '{count} 3jabni',
      reply: 'Jawb',
      like: '3jabni',
      bookmark: '7fed',
      unbookmark: 'Mashi 7fed',
      share: 'Partaji',
      categories: {
        all: 'Kol categories',
        learning_resources: 'Resources dyal t3lem',
        cultural_exchange: 'Tbadl th9afi',
        language_practice: 'T9awd lougha',
        questions: 'S2alat',
        announcements: 'I3lanat'
      },
      threads: {
        darija_resources: {
          title: 'A7san resources bach t3lem darija',
          content: 'Kont kat3lem darija mn chhar w bghit npartaji m3akom resources li l9it...'
        },
        cultural_exchange: {
          title: 'Tbadl th9afi: L3adat lmaghribiya',
          content: 'Yalla n7ddo w npartajiw tajribatna m3a l3adat w l9anun dyal lmaghrib...'
        },
        language_partner: {
          title: 'Mawdo3 bach t9awd m3a ch7s',
          content: 'Kat9elleb 3la ch7s bach t9awd m3ah darija? 7ot hna w l9a ch7s!'
        }
      }
    },
    roadmap: {
      default_title: '{path} - Khartat tari9 {level}',
      default_description: 'Khartat tari9 kamla bach t3lem {path} b niveau {level}, m3addat l les locuteurs dyal {language}.',
      error: 'Ghalta',
      error_loading_path: 'M3a9ba f t7mil dyal les données dyal tari9 t3lem',
      error_generation: 'M3a9ba f tawlid dyal khartat tari9',
      error_empty: 'Khartat tari9 li tawlidat kanet khawya wla ghir sa7i7a',
      error_saving: 'Ghalta f 7fz dyal khartat tari9',
      error_try_again: '3awed jreb',
      generated: 'Khartat tari9 tawlidat (Brouillon)',
      generated_description: 'Khartat tari9 dyal t3lem b IA dyalek 7adra!',
      saved: 'Khartat tari9 7fzat',
      saved_description: 'Khartat tari9 dyal t3lem dyalek 7fzat b najah.',
      loading: 'T7mil dyal les préférences...',
      generator: 'Générateur dyal khartat tari9 t3lem',
      generator_description: 'Personnalisez tari9 t3lem dyalek li tawlid b IA',
      title: '3onwan dyal khartat tari9',
      description: 'Description dyal khartat tari9',
      custom_prompt: 'Affiner b prompt personnalisé (Optionnel)',
      prompt_placeholder: 'Exemple: Khli9 khartat tari9 b 6 étapes li tkon mra9za 3la projets pratiques. Zid wa9t estimé w 2-3 mots-clés l kol étape.',
      generating: 'Tawlid...',
      regenerate: '3awed tawlid b IA',
      saving: '7fz...',
      save_roadmap: '7fz w bda t3lem',
      default_step_description: 'Had l étape tkon mra9za 3la t3lem dyal {title}. Khod wa9tek bach tfehm les concepts b 7sen tari9a.',
      time_beginner: '1-2 sa3at',
      time_intermediate: '3-4 sa3at',
      time_advanced: '5-6 sa3at',
      view: {
        back: 'Rje3 l khartat tari9',
        progress: 'Progression globale',
        steps: 'Étapes dyal t3lem',
        step: {
          status: {
            pending: 'En attente',
            in_progress: 'En cours',
            completed: 'Terminé'
          },
          estimated_time: 'Wa9t estimé',
          keywords: 'Mots-clés',
          notes: 'Notes',
          add_notes: 'Zid notes',
          update_notes: 'Update notes',
          mark_complete: 'Mark bach terminer',
          mark_in_progress: 'Mark bach en cours',
          mark_pending: 'Mark bach en attente'
        },
        error: {
          loading: 'Ghalta f t7mil dyal khartat tari9',
          no_steps: 'Ma l9ina walo dyal étapes l hadi khartat tari9',
          update_progress: 'M3a9ba f update dyal progression',
          update_notes: 'M3a9ba f update dyal notes'
        }
      }
    }
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const savedLanguage = localStorage.getItem('language');
    return (savedLanguage as Language) || 'english';
  });

  const t = (key: string, params?: Record<string, string | number>): string => {
    const translation = translations[language];

    // First, try direct key lookup
    if (translation[key]) {
      let result = translation[key] as string;
      if (params) {
        result = Object.entries(params).reduce(
          (acc, [k, v]) => acc.replace(`{${k}}`, String(v)),
          result
        );
      }
      return result;
    }

    // Fallback: try nested lookup
    const getNestedTranslation = (obj: TranslationObject, keys: string[]): string | TranslationObject => {
      const [currentKey, ...remainingKeys] = keys;
      const value = obj[currentKey];
      if (remainingKeys.length === 0) {
        return value;
      }
      if (typeof value === 'object') {
        return getNestedTranslation(value, remainingKeys);
      }
      return value;
    };

    const keys = key.split('.');
    const result = getNestedTranslation(translation, keys);

    if (typeof result !== 'string') {
      return key;
    }

    if (params) {
      return Object.entries(params).reduce(
        (acc, [k, v]) => acc.replace(`{${k}}`, String(v)),
        result
      );
    }

    return result;
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
