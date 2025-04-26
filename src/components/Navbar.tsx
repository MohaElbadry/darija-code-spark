import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../integrations/supabase/client';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { Menu, BookOpen, LogOut, Settings, User, HelpCircle, BarChart, Globe, Bot } from 'lucide-react';
import { ModeToggle } from './ui/mode-toggle';
import { GraduationCap } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

const Navbar: React.FC = () => {
  const { t, setLanguage, language } = useLanguage();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [isOpen, setIsOpen] = useState(false);

  // Language options with typed values
  const languages = [
    { code: 'english' as const, label: 'English' },
    { code: 'arabic' as const, label: 'العربية' },
    { code: 'darija' as const, label: 'الدارجة' },
    { code: 'french' as const, label: 'Français' },
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

  // Get current language label
  const getCurrentLanguageLabel = () => {
    const currentLang = languages.find(lang => lang.code === language);
    return currentLang ? currentLang.label : 'English';
  };

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-2 text-xl font-bold text-gray-800 dark:text-white">
            <GraduationCap className="h-6 w-6 text-darija-primary" />
            <span>Study Dashboard</span> 
          </Link>

          <div className="hidden md:flex items-center space-x-4">
            <Button variant="ghost" size="sm" className="flex items-center gap-1">
              <BookOpen className="h-4 w-4" />
              Manage Study Plans
            </Button>
            
            <Button variant="ghost" size="sm" className="flex items-center gap-1" onClick={() => navigate('/assistant')}>
              <Bot className="h-4 w-4" />
              AI Assistant
            </Button>
            
            {/* Language Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center gap-1">
                  <Globe className="h-4 w-4" />
                  <span>{getCurrentLanguageLabel()}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {languages.map((lang) => (
                  <DropdownMenuItem 
                    key={lang.code}
                    onClick={() => setLanguage(lang.code)}
                    className={language === lang.code ? "bg-gray-100 font-medium" : ""}
                  >
                    {lang.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            
             <ModeToggle /> 
             <HelpCircle className="h-5 w-5 text-gray-500 cursor-pointer hover:text-gray-700" /> 
             <Settings className="h-5 w-5 text-gray-500 cursor-pointer hover:text-gray-700" /> 
            
            {user ? (
              <div className="flex items-center space-x-3">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                   {profile?.full_name || profile?.username || user.email}
                 </span>
                <Button onClick={handleSignOut} variant="outline" size="sm">Sign Out</Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Button onClick={() => navigate('/auth')} variant="ghost" size="sm">Sign In</Button>
              </div>
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
                   <Link to="/" onClick={() => setIsOpen(false)} className="font-medium hover:text-darija-primary">Dashboard</Link>
                   <Link to="/manage-plans" onClick={() => setIsOpen(false)} className="font-medium hover:text-darija-primary">Manage Plans</Link>
                   <Link to="/assistant" onClick={() => setIsOpen(false)} className="font-medium hover:text-darija-primary">AI Assistant</Link>
                   {user && <Link to="/profile" onClick={() => setIsOpen(false)} className="font-medium hover:text-darija-primary">Profile</Link>}
                   
                   {/* Mobile Language Selector */}
                   <div className="space-y-2">
                     <div className="font-medium">Language</div>
                     <div className="grid grid-cols-2 gap-2">
                       {languages.map((lang) => (
                         <Button 
                           key={lang.code}
                           variant={language === lang.code ? "default" : "outline"}
                           size="sm"
                           onClick={() => {
                             setLanguage(lang.code);
                             // Don't close menu to allow multiple settings changes
                           }}
                         >
                           {lang.label}
                         </Button>
                       ))}
                     </div>
                   </div>
                   
                   <ModeToggle />
                   {user ? (
                     <Button onClick={handleSignOut} variant="destructive" size="sm">Sign Out</Button>
                   ) : (
                     <Button onClick={() => { navigate('/auth'); setIsOpen(false); }} size="sm">Sign In</Button>
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
