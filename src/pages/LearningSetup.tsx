import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../integrations/supabase/client';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import { useToast } from '../components/ui/use-toast';
import seedLearningPaths from '../lib/seed-learning-paths';
import { Loader2, BookOpen, BarChart2, Globe, Target, Rocket, Book, Info } from 'lucide-react';
import { AlertCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../components/ui/tooltip';

console.log('--- Loading LearningSetup.tsx --- '); // Log file load

// Level descriptions
const levelDescriptions = {
  beginner: {
    title: "Beginner",
    description: "New to programming or the specific technology. Looking to build a solid foundation."
  },
  intermediate: {
    title: "Intermediate",
    description: "Has basic knowledge and experience. Looking to deepen understanding and build more complex applications."
  },
  advanced: {
    title: "Advanced",
    description: "Experienced developer. Looking to master advanced concepts and best practices."
  }
};

// Language descriptions
const languageDescriptions = {
  english: {
    title: "English",
    description: "Learn in English with comprehensive documentation and resources."
  },
  darija: {
    title: "Darija",
    description: "Learn in Moroccan Arabic with local context and examples."
  },
  arabic: {
    title: "Arabic",
    description: "Learn in Modern Standard Arabic with formal technical terminology."
  },
  french: {
    title: "French",
    description: "Learn in French with access to French technical resources."
  }
};

// Goal suggestions
const goalSuggestions = [
  "Build a personal website",
  "Create a mobile app",
  "Learn web development",
  "Start a career in tech",
  "Build a portfolio",
  "Learn data science",
  "Master a specific framework",
  "Prepare for a job interview"
];

const LearningSetupContent: React.FC = () => {
  console.log('--- Rendering LearningSetup component --- '); // Log component render start
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true); // Start in loading state
  const [error, setError] = useState<string | null>(null);
  const [pathId, setPathId] = useState<string>('');
  const [level, setLevel] = useState<string>('');
  const [language, setLanguage] = useState<string>('');
  const [goal, setGoal] = useState<string>('');
  const [paths, setPaths] = useState<any[]>([]);
  const [selectedPath, setSelectedPath] = useState<any>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Fetch learning paths on component mount
  useEffect(() => {
    console.log('[useEffect] Running for LearningSetup');
    
    const fetchPaths = async () => {
      setLoading(true); // Ensure loading state is true
      setError(null);
      try {
        console.log('[useEffect] Seeding learning paths...');
        await seedLearningPaths(); // Ensure paths exist (runs check internally)
        console.log('[useEffect] Seed check complete. Fetching paths from Supabase...');
        
        const { data, error: dbError } = await supabase
          .from('learning_paths')
          .select('*');

        if (dbError) {
          console.error('[useEffect] Supabase error fetching paths:', dbError);
          throw dbError; // Throw to be caught below
        }
        
        console.log('[useEffect] Fetched paths data:', data);
        
        if (!data || data.length === 0) {
          console.warn('[useEffect] No learning paths found in database.');
          // Don't set an error here, maybe the user needs to add some? 
          // Or the seed failed silently. Let's allow rendering an empty list.
          setPaths([]); 
        } else {
          setPaths(data);
        }
      } catch (err: any) {
        console.error('[useEffect] Error in fetchPaths:', err);
        setError(`Failed to load learning paths: ${err.message || 'Unknown error'}`);
        setPaths([]); // Ensure paths is an empty array on error
        toast({
          title: t('learning.error_loading'),
          description: t('learning.error_description'),
          variant: 'destructive',
        });
      } finally {
        console.log('[useEffect] Setting loading to false.');
        setLoading(false); // Stop loading regardless of outcome
      }
    };

    fetchPaths();
  }, [toast, t]); // Dependency array

  // Update selected path when pathId changes
  useEffect(() => {
    if (pathId && paths.length > 0) {
      const path = paths.find(p => p.id === pathId);
      setSelectedPath(path);
    } else {
      setSelectedPath(null);
    }
  }, [pathId, paths]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!pathId || !level || !language || !goal) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('Submitting form with:', { pathId, level, language, goal });
      
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error('Error getting user:', userError);
        throw userError;
      }
      
      if (!user) {
        console.log('No user found, redirecting to auth');
        navigate('/auth');
        return;
      }
      
      console.log('User authenticated:', user.id);

      // Save user preferences
      const preferencesData = {
        user_id: user.id,
        preferred_language: language,
        preferred_level: level,
        learning_goal: goal,
      };
      
      console.log('Attempting to save preferences:', preferencesData);
      
      const { error: prefError } = await supabase
        .from('user_preferences')
        .upsert(preferencesData, { onConflict: 'user_id' });

      if (prefError) {
        console.error('Error saving preferences:', prefError);
        console.error('Error details:', {
          code: prefError.code,
          message: prefError.message,
          details: prefError.details,
          hint: prefError.hint
        });
        throw prefError;
      }
      
      console.log('Preferences saved successfully, navigating to roadmap generator');

      // Navigate to roadmap page with the selected learning path
      navigate(`/roadmap/generate?path=${pathId}&level=${level}&language=${language}`);
    } catch (error: any) {
      console.error('Error in handleSubmit:', error);
      console.error('Full error object:', error);
      setError(t('learning.error_saving'));
      toast({
        title: t('learning.error'),
        description: error.message || t('learning.error_saving'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  console.log('--- LearningSetup: Before return statement --- ', { loading, error, pathsLength: paths.length });

  // Return Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="container mx-auto py-10 px-4 text-center">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-lg max-w-md mx-auto">
            <div className="flex items-center justify-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              <div className="text-left">
                <p className="text-lg font-semibold text-gray-800 dark:text-white">Loading learning paths...</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Please wait while we prepare your learning experience</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Return Main Content
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="w-full max-w-2xl mx-auto px-4 py-10">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 text-red-700 dark:text-red-200 p-4 rounded-lg mb-6 shadow-sm max-w-2xl mx-auto">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              <p className="font-medium">{error}</p>
            </div>
          </div>
        )}
        <Card className="shadow-lg rounded-lg border-0 bg-white dark:bg-gray-800 overflow-hidden max-w-2xl mx-auto">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-500 rounded-t-lg p-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/10 rounded-full">
                <BookOpen className="h-7 w-7 text-white" />
              </div>
              <div>
                <CardTitle className="text-white text-2xl font-bold">Learning Preferences</CardTitle>
                <CardDescription className="text-blue-100 mt-2 text-base">
                  Set your learning preferences to get a personalized roadmap.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-8 p-8">
              <div className="space-y-3">
                <Label htmlFor="path" className="font-semibold text-gray-800 dark:text-white text-base flex items-center gap-2">
                  <Book className="h-4 w-4 text-blue-500" />
                  What do you want to learn?
                </Label>
                <Select value={pathId} onValueChange={setPathId} required>
                  <SelectTrigger id="path" className="h-11 rounded-lg border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-400 text-base bg-white dark:bg-gray-700">
                    <SelectValue placeholder="Select a learning path" />
                  </SelectTrigger>
                  <SelectContent className="rounded-lg shadow-lg bg-white dark:bg-gray-700">
                    {paths.map((path) => (
                      <SelectItem key={path.id} value={path.id} className="hover:bg-blue-50 dark:hover:bg-gray-600 text-base">
                        {path.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedPath && (
                  <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-sm text-blue-700 dark:text-blue-300">{selectedPath.description}</p>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <Label htmlFor="level" className="font-semibold text-gray-800 dark:text-white text-base flex items-center gap-2">
                  <BarChart2 className="h-4 w-4 text-blue-500" />
                  Current Level
                </Label>
                <Select value={level} onValueChange={setLevel} required>
                  <SelectTrigger id="level" className="h-11 rounded-lg border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-400 text-base bg-white dark:bg-gray-700">
                    <SelectValue placeholder="Select your level" />
                  </SelectTrigger>
                  <SelectContent className="rounded-lg shadow-lg bg-white dark:bg-gray-700">
                    {Object.entries(levelDescriptions).map(([key, { title }]) => (
                      <SelectItem key={key} value={key} className="hover:bg-blue-50 dark:hover:bg-gray-600 text-base">
                        {title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {level && (
                  <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-sm text-blue-700 dark:text-blue-300">{levelDescriptions[level as keyof typeof levelDescriptions].description}</p>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <Label htmlFor="language" className="font-semibold text-gray-800 dark:text-white text-base flex items-center gap-2">
                  <Globe className="h-4 w-4 text-blue-500" />
                  Preferred Language
                </Label>
                <Select value={language} onValueChange={setLanguage} required>
                  <SelectTrigger id="language" className="h-11 rounded-lg border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-400 text-base bg-white dark:bg-gray-700">
                    <SelectValue placeholder="Select a language" />
                  </SelectTrigger>
                  <SelectContent className="rounded-lg shadow-lg bg-white dark:bg-gray-700">
                    {Object.entries(languageDescriptions).map(([key, { title }]) => (
                      <SelectItem key={key} value={key} className="hover:bg-blue-50 dark:hover:bg-gray-600 text-base">
                        {title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {language && (
                  <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-sm text-blue-700 dark:text-blue-300">{languageDescriptions[language as keyof typeof languageDescriptions].description}</p>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <Label htmlFor="goal" className="font-semibold text-gray-800 dark:text-white text-base flex items-center gap-2">
                  <Target className="h-4 w-4 text-blue-500" />
                  Learning Goal
                </Label>
                <div className="relative">
                  <Textarea
                    id="goal"
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    placeholder="Describe your learning goal..."
                    className="min-h-[100px] rounded-lg border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-400 text-base bg-white dark:bg-gray-700"
                  />
                  {showSuggestions && (
                    <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                      <div className="p-2">
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Common goals:</p>
                        <div className="flex flex-wrap gap-2">
                          {goalSuggestions.map((suggestion, index) => (
                            <button
                              key={index}
                              type="button"
                              onMouseDown={(e) => {
                                e.preventDefault(); // Prevent blur from firing before click
                                setGoal(suggestion);
                                setShowSuggestions(false);
                              }}
                              className="text-sm px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                            >
                              {suggestion}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
            <CardFooter className="px-8 pb-8 pt-0">
              <Button 
                type="submit" 
                className="w-full h-12 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold text-base rounded-lg shadow hover:from-blue-600 hover:to-indigo-600 transition transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2" 
                disabled={loading || !pathId || !level || !language || !goal}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Rocket className="h-4 w-4" />
                    Generate Roadmap
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
        
        {/* Debug info */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 p-4 bg-gray-100 rounded text-xs">
            <h3 className="font-bold mb-2 text-blue-900">Debug Info</h3>
            <p>Paths loaded: {paths.length}</p>
            <p>Selected path: {pathId}</p>
            <p>Selected level: {level}</p>
            <p>Selected language: {language}</p>
          </div>
        )}
      </div>
    </div>
  );
};

const LearningSetup: React.FC = () => {
  return <LearningSetupContent />;
};

export default LearningSetup; 