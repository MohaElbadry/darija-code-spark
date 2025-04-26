import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage, LanguageProvider } from '../contexts/LanguageContext';
import { supabase } from '../integrations/supabase/client';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import { useToast } from '../components/ui/use-toast';
import Navbar from '../components/Navbar';
import seedLearningPaths from '../lib/seed-learning-paths';
import { Loader2 } from 'lucide-react';

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
          title: 'Error Loading Data',
          description: 'Could not fetch learning paths. Please check console.',
          variant: 'destructive',
        });
      } finally {
        console.log('[useEffect] Setting loading to false.');
        setLoading(false); // Stop loading regardless of outcome
      }
    };

    fetchPaths();
  }, [toast]); // Dependency array

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
      const urlParams = new URLSearchParams({
        path: pathId,
        level: level,
        language: language
      });
      if (goal) {
        urlParams.set('goal', goal);
      }
      navigate(`/roadmap/generate?${urlParams.toString()}`);
    } catch (error) {
      console.error('Error saving preferences:', error);
      setError('Failed to save your preferences. Please try again.');
      toast({
        title: 'Error',
        description: 'Failed to save your preferences',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  console.log('--- LearningSetup: Before return statement --- ', { loading, error, pathsLength: paths.length });

  // Return Loading State
  if (loading) {
    console.log('--- LearningSetup: Rendering Loading State ---');
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto py-10 px-4 text-center">
          <Loader2 className="h-10 w-10 animate-spin mx-auto" />
          <p className="mt-4">Loading Learning Paths...</p>
        </div>
      </div>
    );
  }

  // Return Main Content
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto py-10 px-4">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p>{error}</p>
          </div>
        )}
        
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Learning Preferences</CardTitle>
            <CardDescription>
              Tell us what you want to learn and we'll create a personalized roadmap for you
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="path">What do you want to learn?</Label>
                <Select value={pathId} onValueChange={setPathId} required>
                  <SelectTrigger id="path">
                    <SelectValue placeholder="Select a learning path" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.isArray(paths) && paths.length > 0 ? (
                      paths.map((path) => (
                        <SelectItem key={path.id} value={path.id}>
                          {path.name}
                        </SelectItem>
                      ))
                    ) : (
                      <p className="p-4 text-sm text-gray-500">No learning paths available.</p> 
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="level">Your current level</Label>
                <Select value={level} onValueChange={setLevel} required>
                  <SelectTrigger id="level">
                    <SelectValue placeholder="Select your level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="language">Preferred language</Label>
                <Select value={language} onValueChange={setLanguage} required>
                  <SelectTrigger id="language">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="english">English</SelectItem>
                    <SelectItem value="darija">Darija</SelectItem>
                    <SelectItem value="arabic">Arabic</SelectItem>
                    <SelectItem value="french">French</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="goal">Your learning goal (optional)</Label>
                <Textarea 
                  id="goal" 
                  placeholder="What do you want to achieve with this learning path?"
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={loading || paths.length === 0}>
                {loading ? 'Loading...' : 'Generate My Roadmap'}
              </Button>
            </CardFooter>
          </form>
        </Card>
        
        {/* Debug info */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 p-4 bg-gray-100 rounded text-xs">
            <h3 className="font-bold mb-2">Debug Info:</h3>
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

// Wrap the component with LanguageProvider
const LearningSetup: React.FC = () => {
  return (
    <LanguageProvider>
      <LearningSetupContent />
    </LanguageProvider>
  );
};

export default LearningSetup; 