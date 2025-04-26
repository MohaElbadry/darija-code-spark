import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../integrations/supabase/client';
import Navbar from '../components/Navbar';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Separator } from '../components/ui/separator';
import { Textarea } from '../components/ui/textarea';
import { useToast } from '../components/ui/use-toast';
import { Loader2, Brain, Save, CheckCircle, RefreshCw } from 'lucide-react';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';

// Define the structure for a step, including keywords
type RoadmapStep = {
  id?: string;
  title: string;
  description: string;
  order_index: number;
  estimated_time: string; // e.g., "1-2 hours", "3 days"
  keywords?: string[];    // e.g., ["HTML structure", "HTML elements"]
};

const RoadmapGeneratorContent: React.FC = () => {
  const { t, language: userLanguage } = useLanguage(); // Language for UI elements
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  // --- Preferences from URL ---
  const pathId = searchParams.get('path') || '';
  const level = searchParams.get('level') || '';
  const language = searchParams.get('language') || 'english'; // Language for roadmap content
  const customPrompt = searchParams.get('goal') || ''; // Optional goal

  // --- Component State ---
  const [loading, setLoading] = useState(true); // Initial data loading
  const [generating, setGenerating] = useState(false); // AI generation in progress
  const [saving, setSaving] = useState(false); // Saving roadmap in progress
  const [path, setPath] = useState<{ name: string; id: string; }>({ name: '', id: '' });
  const [roadmapTitle, setRoadmapTitle] = useState('');
  const [roadmapDescription, setRoadmapDescription] = useState('');
  const [steps, setSteps] = useState<RoadmapStep[]>([]);
  const [roadmapId, setRoadmapId] = useState<string | null>(null);
  const [apiError, setApiError] = useState<boolean>(false); // Track if AI generation failed

  // --- Effects ---

  // 1. Fetch Learning Path details when component mounts or pathId changes
  useEffect(() => {
    if (!pathId) {
      console.warn('No pathId found in URL, redirecting to setup.');
      navigate('/learning-setup');
      return;
    }
    console.log(`[Effect 1] pathId changed to: ${pathId}. Fetching path data...`);
    fetchPathData();
  }, [pathId, navigate]); // Rerun if pathId changes

  // 2. Trigger initial roadmap generation *after* path data is successfully loaded
  useEffect(() => {
    // Only run if path has been loaded (id and name exist) AND steps haven't been loaded yet
    if (path.id && path.name && steps.length === 0 && !loading && !generating) {
      console.log(`[Effect 2] Path data loaded for '${path.name}'. Triggering initial roadmap generation...`);
      generateRoadmap(); // Call the function that uses AI
    }
  }, [path, loading, generating]); // Rerun if path, loading, or generating status changes

  // --- Data Fetching and Generation ---

  // Fetches the details of the selected learning path
  const fetchPathData = async () => {
    setLoading(true);
    setPath({ name: '', id: '' }); // Reset path data
    setSteps([]); // Clear existing steps
    setApiError(false); // Reset error state
    console.log(`Fetching details for path ID: ${pathId}`);
    try {
      const { data, error } = await supabase
        .from('learning_paths')
        .select('*')
        .eq('id', pathId)
        .single();

      if (error) throw error;
      if (!data) {
        console.error(`Learning path with ID ${pathId} not found.`);
        toast({ title: 'Error', description: 'Learning path not found.', variant: 'destructive' });
        navigate('/learning-setup');
        return;
      }

      console.log(`Successfully fetched path data: ${data.name}`);
      // Set path state - the useEffect above will trigger generation
      setPath(data);
      
      const defaultTitle = t('roadmap.default_title', { 
        path: data.name,
        level: level.charAt(0).toUpperCase() + level.slice(1)
      });
      const defaultDescription = t('roadmap.default_description', {
        path: data.name,
        level,
        language
      });
      
      setRoadmapTitle(defaultTitle);
      setRoadmapDescription(defaultDescription);
      
      await generateRoadmap();
      
    } catch (error) {
      console.error('Error fetching path data:', error);
      toast({
        title: t('roadmap.error'),
        description: t('roadmap.error_loading_path'),
        variant: 'destructive',
      });
      setLoading(false);

    }
  };

  // Generates the roadmap using the Supabase AI function
  const generateRoadmap = async () => {
    if (!path) {
      console.log("Path data not yet available for generation.");
      setLoading(false);
      return;

    }

    setGenerating(true);
    setLoading(false);
    
    try {
      console.log("Generating roadmap with preferences:", { pathName: path.name, level, language });
      
      const enhancedPrompt = customPrompt || 
        t('roadmap.generation_prompt', {
          path: path.name,
          level,
          language
        });
      
      const response = await supabase.functions.invoke('generate-roadmap', {
        body: JSON.stringify({
          pathName: path.name,
          level,
          language,
          customPrompt: enhancedPrompt,
        }),
      });

      if (response.error) {
        console.error("Supabase Function Error:", response.error);
        throw new Error(response.error.message || t('roadmap.error_generation'));
      }

      const data = response.data;
      
      console.log("Received roadmap data from Supabase function:", data);

      if (!data || !data.steps || !Array.isArray(data.steps) || data.steps.length === 0) {
        console.warn("Generated roadmap has no steps or is invalid.");
        throw new Error(t('roadmap.error_empty'));

      }
       if (data.steps.length === 0) {
           // Check if it's the specific fallback response from the function
           if (data.title === "Default Roadmap" || data.description?.includes("Could not parse AI response")) {
                console.warn("AI function returned default/fallback roadmap.");
                throw new Error("AI could not generate a roadmap. Using fallback.");
           } else {
               console.warn("AI generated an empty steps array.");
               throw new Error("AI generated a roadmap with no steps.");
           }
      }
      // --- End Response Validation ---


      console.log(`AI function successful. Received ${data.steps.length} steps.`);

      const completeSteps = data.steps.map((step, index) => ({
        ...step,
        description: step.description || t('roadmap.default_step_description', { title: step.title }),
        estimated_time: step.estimated_time || (level === 'beginner' ? t('roadmap.time_beginner') : 
                                              level === 'intermediate' ? t('roadmap.time_intermediate') : 
                                              t('roadmap.time_advanced')),
        keywords: step.keywords || [`${path.name}`, `${level}`],
      }));

      setRoadmapTitle(data.title || roadmapTitle);
      setRoadmapDescription(data.description || roadmapDescription);
      setSteps(completeSteps);
      setRoadmapId(null);
      
      toast({
        title: t('roadmap.generated'),
        description: t('roadmap.generated_description'),

      });

    } catch (error: unknown) {
      console.error('Error during roadmap generation process:', error);
      setApiError(true); // Set error flag
      toast({
        title: t('roadmap.error_generation'),
        description: error.message || t('roadmap.error_try_again'),

        variant: 'destructive',
      });
      // Provide fallback steps if AI fails completely
      setSteps(getDefaultSteps(path.name, level, language)); // Use static templates as fallback
      setRoadmapTitle(`${path.name} - Fallback Roadmap`);
      setRoadmapDescription(`Failed to generate AI roadmap. Using standard ${level} template.`);

    } finally {
      setGenerating(false); // Stop generating indicator
      // Loading indicator for the page should have stopped in fetchPathData
    }
  };

  // --- Localization Helpers ---

  // Gets a localized description string
  const getLocalizedDescription = (pathName: string, userLevel: string, lang: string): string => {
      // (Keep the existing implementation of this function)
      switch(lang) {
        case 'arabic':
          return `خطة شاملة لتعلم ${pathName} بمستوى ${getArabicLevel(userLevel)} مصممة للمتحدثين باللغة العربية.`;
        case 'darija':
          return `خطة متكاملة باش تعلم ${pathName} ف المستوى ${getDarijaLevel(userLevel)} مخصصة للناس اللي كيهضرو بالدارجة.`;
        case 'french':
          return `Un plan d\'apprentissage complet pour ${pathName} au niveau ${getFrenchLevel(userLevel)}, adapté aux francophones.`;
        default: // english
          return `A comprehensive roadmap for learning ${pathName} at a ${userLevel} level, tailored for English speakers.`;
      }
      
      let roadmapRecord;
      
      console.log("Saving new roadmap...");
      const { data: newRoadmapData, error: insertRoadmapError } = await supabase
        .from('roadmaps')
        .insert({
          path_id: pathId,
          title: roadmapTitle,
          description: roadmapDescription,
          level,
          language,
          ai_generated: true,
        })
        .select()
        .single();
          
      if (insertRoadmapError) throw insertRoadmapError;
      roadmapRecord = newRoadmapData;
      const newRoadmapId = roadmapRecord.id;
      console.log("Created roadmap record:", newRoadmapId);
      
      const stepsToInsert = steps.map((step, index) => ({
        roadmap_id: newRoadmapId,
        title: step.title,
        description: step.description,
        order_index: index,
        estimated_time: step.estimated_time,
      }));
      
      console.log("Inserting steps:", stepsToInsert);
      const { error: stepsError } = await supabase
        .from('roadmap_steps')
        .insert(stepsToInsert);
        
      if (stepsError) throw stepsError;
      
      toast({
        title: t('roadmap.saved'),
        description: t('roadmap.saved_description'),
      });
      
      navigate(`/roadmap/${newRoadmapId}`);

    } catch (error: any) {
      console.error('Error saving roadmap:', error);
      toast({
        title: t('roadmap.error_saving'),
        description: error.message || t('roadmap.error_try_again'),
        variant: 'destructive',
      });
    } finally {
      setSaving(false);

    }

    // Absolute fallback (should ideally not be reached if English is default)
    return Array.from({ length: defaultStepCount }, (_, i) => ({
         title: `Step ${i + 1}: Generic Title`,
         description: 'Generic step description.',
         order_index: i,
         estimated_time: '2-4 weeks',
         keywords: defaultKeywords
     }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto py-10 px-4 text-center">
          <Loader2 className="h-10 w-10 animate-spin mx-auto" />
          <p className="mt-4">{t('roadmap.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-10 px-4">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{t('roadmap.generator')}</span>
              <Button 
                variant="outline" 
                onClick={generateRoadmap}
                disabled={generating}
              >
                {generating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('roadmap.generating')}
                  </>
                ) : (
                  <>
                    <Brain className="mr-2 h-4 w-4" />
                    {t('roadmap.regenerate')}
                  </>
                )}
              </Button>
            </CardTitle>
            <CardDescription>
              {t('roadmap.generator_description')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">{t('roadmap.title')}</Label>
              <Input
                id="title"
                value={roadmapTitle}
                onChange={(e) => setRoadmapTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">{t('roadmap.description')}</Label>
              <Textarea
                id="description"
                value={roadmapDescription}
                onChange={(e) => setRoadmapDescription(e.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customPrompt">{t('roadmap.custom_prompt')}</Label>
              <Textarea
                id="customPrompt"
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder={t('roadmap.prompt_placeholder')}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {steps.map((step, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-gray-500">#{index + 1}</span>
                    {step.title}
                  </CardTitle>
                  <Badge variant="outline">{step.estimated_time}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">{step.description}</p>
                {step.keywords && step.keywords.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {step.keywords.map((keyword, i) => (
                      <Badge key={i} variant="secondary">{keyword}</Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 flex justify-end">
          <Button 
            onClick={saveRoadmap}
            disabled={saving || steps.length === 0}
            className="flex items-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {t('roadmap.saving')}
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                {t('roadmap.save_roadmap')}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );

};

const RoadmapGenerator: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <RoadmapGeneratorContent />
    </div>
  );
};

export default RoadmapGenerator; 