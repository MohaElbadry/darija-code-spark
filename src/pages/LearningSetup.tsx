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
import { Loader2, BookOpen, BarChart2, Globe, Target, Rocket, Book } from 'lucide-react';
import { AlertCircle } from 'lucide-react';

console.log('--- Loading LearningSetup.tsx --- '); // Log file load

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
      const { error: prefError } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          preferred_language: language,
          preferred_level: level,
          learning_goal: goal,
        }, { onConflict: 'user_id' });

      if (prefError) {
        console.error('Error saving preferences:', prefError);
        throw prefError;
      }
      
      console.log('Preferences saved, navigating to roadmap generator');

      // Navigate to roadmap page with the selected learning path
      navigate(`/roadmap/generate?path=${pathId}&level=${level}&language=${language}`);
    } catch (error: any) {

      console.error('Error saving preferences:', error);
      setError(t('learning.error_saving'));
      toast({
        title: t('learning.error'),
        description: t('learning.error_saving'),
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
                    {Array.isArray(paths) && paths.length > 0 ? (
                      paths.map((path) => (
                        <SelectItem key={path.id} value={path.id} className="hover:bg-blue-50 dark:hover:bg-gray-600 text-base">
                          {path.name}
                        </SelectItem>
                      ))
                    ) : (
                      <p className="p-4 text-sm text-gray-500 dark:text-gray-400">No learning paths found.</p>
                    )}
                  </SelectContent>
                </Select>
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
                    <SelectItem value="beginner" className="hover:bg-blue-50 dark:hover:bg-gray-600 text-base">Beginner</SelectItem>
                    <SelectItem value="intermediate" className="hover:bg-blue-50 dark:hover:bg-gray-600 text-base">Intermediate</SelectItem>
                    <SelectItem value="advanced" className="hover:bg-blue-50 dark:hover:bg-gray-600 text-base">Advanced</SelectItem>
                  </SelectContent>
                </Select>
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
                    <SelectItem value="english" className="hover:bg-blue-50 dark:hover:bg-gray-600 text-base">English</SelectItem>
                    <SelectItem value="darija" className="hover:bg-blue-50 dark:hover:bg-gray-600 text-base">Darija</SelectItem>
                    <SelectItem value="arabic" className="hover:bg-blue-50 dark:hover:bg-gray-600 text-base">Arabic</SelectItem>
                    <SelectItem value="french" className="hover:bg-blue-50 dark:hover:bg-gray-600 text-base">French</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label htmlFor="goal" className="font-semibold text-gray-800 dark:text-white text-base flex items-center gap-2">
                  <Target className="h-4 w-4 text-blue-500" />
                  Learning Goal
                </Label>
                <Textarea 
                  id="goal" 
                  placeholder="Describe your learning goal..."
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  rows={4}
                  className="rounded-lg border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-400 text-base min-h-[120px] bg-white dark:bg-gray-700"
                />
              </div>
            </CardContent>
            <CardFooter className="px-8 pb-8 pt-0">
              <Button 
                type="submit" 
                className="w-full h-12 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold text-base rounded-lg shadow hover:from-blue-600 hover:to-indigo-600 transition transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2" 
                disabled={loading || paths.length === 0}
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