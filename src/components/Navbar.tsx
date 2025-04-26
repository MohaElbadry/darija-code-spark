import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../integrations/supabase/client';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { Menu, BookOpen, LogOut, Settings, User, HelpCircle, BarChart, Globe, Bot, Sun, Moon, Info, CoffeeIcon, ProjectorIcon, GroupIcon, Home } from 'lucide-react';
import { ModeToggle } from './ui/mode-toggle';
import logo from '../assets/logo.png';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuSeparator,
} from "./ui/dropdown-menu";

// Translations for navbar items
const translations = {
  english: {
    home: "Home",
    learn: "Learn",
    aiAssistant: "AI Assistant",
    coffeeAndCode: "Coffee and Code",
    projects: "Projects",
    community: "Community",
    profile: "Profile",
    settings: "Settings",
    appearance: "Appearance",
    light: "Light",
    dark: "Dark",
    system: "System",
    info: "Info",
    signOut: "Sign Out",
    signIn: "Sign In",
    language: "Language",
    dashboard: "Dashboard"
  },
  arabic: {
    home: "الرئيسية",
    learn: "تعلم",
    aiAssistant: "المساعد الذكي",
    coffeeAndCode: "القهوة والبرمجة",
    projects: "المشاريع",
    community: "المجتمع",
    profile: "الملف الشخصي",
    settings: "الإعدادات",
    appearance: "المظهر",
    light: "فاتح",
    dark: "داكن",
    system: "النظام",
    info: "معلومات",
    signOut: "تسجيل الخروج",
    signIn: "تسجيل الدخول",
    language: "اللغة",
    dashboard: "لوحة التحكم"
  },
  french: {
    home: "Accueil",
    learn: "Apprendre",
    aiAssistant: "Assistant IA",
    coffeeAndCode: "Café et Code",
    projects: "Projets",
    community: "Communauté",
    profile: "Profil",
    settings: "Paramètres",
    appearance: "Apparence",
    light: "Clair",
    dark: "Sombre",
    system: "Système",
    info: "Informations",
    signOut: "Déconnexion",
    signIn: "Connexion",
    language: "Langue",
    dashboard: "Tableau de bord"
  },
  darija: {
    home: "الصفحة الرئيسية",
    learn: "تعلم",
    aiAssistant: "المساعد الذكي",
    coffeeAndCode: "القهوة والبرمجة",
    projects: "المشاريع",
    community: "المجتمع",
    profile: "البروفايل",
    settings: "الإعدادات",
    appearance: "المظهر",
    light: "نور",
    dark: "غامق",
    system: "النظام",
    info: "المعلومات",
    signOut: "خرج",
    signIn: "دخل",
    language: "اللغة",
    dashboard: "لوحة التحكم"
  }
};

const Navbar: React.FC = () => {
  const { language, setLanguage } = useLanguage();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [isOpen, setIsOpen] = useState(false);

  // Language options with typed values and flags
  const languages = [
    { code: 'english' as const, label: 'English', flag: '🇬🇧' },
    { code: 'arabic' as const, label: 'العربية', flag: '🇸🇦' },
    { code: 'french' as const, label: 'Français', flag: '🇫🇷' },
    { code: 'darija' as const, label: 'الدارجة', flag: '🇲🇦' }
  ];

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        fetchProfile(user.id);
      }
    };
    fetchUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('username, avatar_url, full_name')
        .eq('id', userId)
        .single();
      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
    setIsOpen(false);
  };

  const getInitials = (name: string | null): string => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const t = (key: keyof typeof translations.english) => {
    return translations[language][key] || translations.english[key];
  };

  const getLanguageLabel = (lang: string) => {
    switch (lang) {
      case 'english':
        return 'English';
      case 'arabic':
        return 'العربية';
      case 'french':
        return 'Français';
      case 'darija':
        return 'الدارجة';
      default:
        return 'English';
    }
  };

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="Logo" className="h-8 w-auto" />
            <span className="text-xl font-bold text-gray-800 dark:text-white">DarijaCode Hub</span>
          </Link>

          <div className="hidden md:flex items-center space-x-6">
            <Button variant="ghost" size="sm" className="flex items-center gap-1.5" onClick={() => navigate('/')}>
              <Home className="h-4 w-4" />
              {t('home')}
            </Button>
            <Button variant="ghost" size="sm" className="flex items-center gap-1.5" onClick={() => navigate('/learning-setup')}>
              <BookOpen className="h-4 w-4" />
              {t('learn')}
            </Button>
            
            <Button variant="ghost" size="sm" className="flex items-center gap-1.5" onClick={() => navigate('/assistant')}>
              <Bot className="h-4 w-4" />
              {t('aiAssistant')}
            </Button>
            
            <Button variant="ghost" size="sm" className="flex items-center gap-1.5" onClick={() => navigate('/coffee-and-code')}>
              <CoffeeIcon className="h-4 w-4" />
              {t('coffeeAndCode')}
            </Button>

            <Button variant="ghost" size="sm" className="flex items-center gap-1.5" onClick={() => navigate('/projects')}>
              <ProjectorIcon className="h-4 w-4" />
              {t('projects')}
            </Button>

            <Button variant="ghost" size="sm" className="flex items-center gap-1.5" onClick={() => navigate('/community')}>
              <GroupIcon className="h-4 w-4" />
              {t('community')}
            </Button>

            {/* Language Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center gap-1.5">
                  <Globe className="h-4 w-4" />
                  <span>{getLanguageLabel(language)}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {languages.map((lang) => (
                  <DropdownMenuItem 
                    key={lang.code}
                    onClick={() => setLanguage(lang.code)}
                    className={language === lang.code ? "bg-gray-100 font-medium" : ""}
                  >
                    <span className="mr-2">{lang.flag}</span>
                    {lang.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={profile?.avatar_url} alt={profile?.username || user.email} />
                      <AvatarFallback>{getInitials(profile?.full_name || profile?.username || user.email)}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      {profile?.full_name && <p className="font-medium">{profile.full_name}</p>}
                      {profile?.username && <p className="text-sm text-muted-foreground">@{profile.username}</p>}
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    <User className="mr-2 h-4 w-4" />
                    {t('profile')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/settings')}>
                    <Settings className="mr-2 h-4 w-4" />
                    {t('settings')}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                      <Sun className="mr-2 h-4 w-4" />
                      {t('appearance')}
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                      <DropdownMenuItem onClick={() => document.documentElement.classList.remove('dark')}>
                        <Sun className="mr-2 h-4 w-4" />
                        {t('light')}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => document.documentElement.classList.add('dark')}>
                        <Moon className="mr-2 h-4 w-4" />
                        {t('dark')}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => {
                        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                          document.documentElement.classList.add('dark');
                        } else {
                          document.documentElement.classList.remove('dark');
                        }
                      }}>
                        <Globe className="mr-2 h-4 w-4" />
                        {t('system')}
                      </DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                  <DropdownMenuItem>
                    <Info className="mr-2 h-4 w-4" />
                    {t('info')}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    {t('signOut')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button onClick={() => navigate('/auth')} variant="ghost" size="sm">
                <User className="h-4 w-4" />
              </Button>
            )}
          </div>

          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[250px] sm:w-[300px]">
                <div className="flex flex-col space-y-4 p-4">
                  <Link to="/" onClick={() => setIsOpen(false)} className="font-medium hover:text-darija-primary">{t('dashboard')}</Link>
                  <Link to="/learning-setup" onClick={() => setIsOpen(false)} className="font-medium hover:text-darija-primary">{t('learn')}</Link>
                  <Link to="/assistant" onClick={() => setIsOpen(false)} className="font-medium hover:text-darija-primary">{t('aiAssistant')}</Link>
                  <Link to="/coffee-and-code" onClick={() => setIsOpen(false)} className="font-medium hover:text-darija-primary">{t('coffeeAndCode')}</Link>
                  <Link to="/projects" onClick={() => setIsOpen(false)} className="font-medium hover:text-darija-primary">{t('projects')}</Link>
                  <Link to="/community" onClick={() => setIsOpen(false)} className="font-medium hover:text-darija-primary">{t('community')}</Link>
                  {user && <Link to="/profile" onClick={() => setIsOpen(false)} className="font-medium hover:text-darija-primary">{t('profile')}</Link>}
                  
                  {/* Mobile Language Selector */}
                  <div className="space-y-2">
                    <div className="font-medium">{t('language')}</div>
                    <div className="grid grid-cols-2 gap-2">
                      {languages.map((lang) => (
                        <Button 
                          key={lang.code}
                          variant={language === lang.code ? "default" : "outline"}
                          size="sm"
                          onClick={() => {
                            setLanguage(lang.code);
                          }}
                        >
                          <span className="mr-2">{lang.flag}</span>
                          {lang.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="font-medium">{t('settings')}</div>
                    <Button variant="ghost" className="w-full justify-start">
                      <Info className="h-4 w-4 mr-2" />
                      {t('info')}
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="w-full justify-start">
                          <Sun className="h-4 w-4 mr-2" />
                          {t('appearance')}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => document.documentElement.classList.remove('dark')}>
                          <Sun className="h-4 w-4 mr-2" />
                          {t('light')}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => document.documentElement.classList.add('dark')}>
                          <Moon className="h-4 w-4 mr-2" />
                          {t('dark')}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {
                          if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                            document.documentElement.classList.add('dark');
                          } else {
                            document.documentElement.classList.remove('dark');
                          }
                        }}>
                          <Globe className="h-4 w-4 mr-2" />
                          {t('system')}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  
                  {user ? (
                    <Button onClick={handleSignOut} variant="destructive" size="sm">
                      <LogOut className="h-4 w-4 mr-2" />
                      {t('signOut')}
                    </Button>
                  ) : (
                    <Button onClick={() => { navigate('/auth'); setIsOpen(false); }} size="sm">
                      <User className="h-4 w-4 mr-2" />
                      {t('signIn')}
                    </Button>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
