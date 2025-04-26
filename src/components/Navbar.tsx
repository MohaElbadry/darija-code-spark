
import React, { useEffect, useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Bell, ChevronDown, LogOut } from 'lucide-react';
import { Button } from './ui/button';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

const Navbar: React.FC = () => {
  const { t, language, setLanguage } = useLanguage();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  return (
    <header className="w-full border-b bg-white shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <img 
            src="/lovable-uploads/c1a690d0-2bbc-48da-acef-49803b92983e.png" 
            alt="DarijaCode Hub Logo" 
            className="h-8 w-8"
          />
          <span className="text-xl font-semibold">{t('app.title')}</span>
        </div>
        
        <nav className="hidden md:flex">
          <ul className="flex space-x-6">
            <li>
              <a href="#" className="text-gray-800 hover:text-darija-primary transition duration-200">
                {t('nav.home')}
              </a>
            </li>
            <li>
              <a href="#" className="text-gray-800 hover:text-darija-primary transition duration-200">
                {t('nav.learn')}
              </a>
            </li>
            <li>
              <a href="#" className="text-gray-800 hover:text-darija-primary transition duration-200">
                {t('nav.community')}
              </a>
            </li>
            <li>
              <a href="#" className="text-gray-800 hover:text-darija-primary transition duration-200">
                {t('nav.assistant')}
              </a>
            </li>
            <li>
              <a href="#" className="text-gray-800 hover:text-darija-primary transition duration-200">
                {t('nav.projects')}
              </a>
            </li>
          </ul>
        </nav>
        
        <div className="flex items-center space-x-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-1 border rounded-lg">
                {language === 'ar' || language === 'darija' ? 'العربية' : language === 'fr' ? 'Français' : 'English'}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setLanguage('en')}>
                English
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLanguage('ar')}>
                العربية
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLanguage('fr')}>
                Français
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLanguage('darija')}>
                الدارجة
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          {user ? (
            <>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-darija-primary"></span>
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="relative cursor-pointer">
                    <img 
                      src="https://randomuser.me/api/portraits/men/32.jpg" 
                      alt="User Profile" 
                      className="h-8 w-8 rounded-full border-2 border-white shadow-sm"
                    />
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Button onClick={() => navigate('/auth')}>
              Sign In
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
