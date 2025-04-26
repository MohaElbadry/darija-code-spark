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
import { Loader2, Brain, Save, CheckCircle, RefreshCw, ArrowLeft, BookOpen, Target, Clock } from 'lucide-react';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';

// Import stripMarkdown function
const stripMarkdown = (text: string) => {
  if (!text) return '';
  
  // Special case for titles that might begin with ## or other header markers
  let cleaned = text;
  
  // First handle titles that specifically start with ## or other header markers
  if (cleaned.startsWith('##')) {
    cleaned = cleaned.replace(/^##\s*/, '');
  } else if (cleaned.startsWith('#')) {
    cleaned = cleaned.replace(/^#\s*/, '');
  }
  
  // Then apply all other Markdown cleaning
  cleaned = cleaned
    // Handle headings - specifically target strings starting with ## at beginning of string or line
    .replace(/^##\s+(.+)$/gm, '$1') // Level 2 heading at start of a line
    .replace(/^#{1,6}\s+(.+)$/gm, '$1') // Any level heading at start of a line
    // Handle bold and italic, even across multiple lines using [\s\S] instead of .
    .replace(/\*\*([\s\S]*?)\*\*/g, '$1') // Remove bold
    .replace(/\*([\s\S]*?)\*/g, '$1') // Remove italic
    .replace(/__([\s\S]*?)__/g, '$1') // Remove underscores bold
    .replace(/_([\s\S]*?)_/g, '$1') // Remove underscores italic
    .replace(/\[([\s\S]*?)\]\(([\s\S]*?)\)/g, '$1') // Replace links with just text
    .replace(/`{1,3}([\s\S]*?)`{1,3}/g, '$1') // Remove code blocks
    .replace(/^\s*[-*+]\s/gm, '') // Remove bullet list markers completely
    .replace(/^\s*\d+\.\s/gm, '') // Remove numbered list markers completely
    .replace(/\n\s*\n/g, '\n\n') // Normalize line breaks
    .trim(); // Remove extra whitespace
  
  return cleaned;
};

// Define the structure for a step, including keywords
type RoadmapStep = {
  id?: string;
  title: string;
  description: string;
  order_index: number;
  estimated_time: string; // e.g., "1-2 hours", "3 days"
  keywords?: string[];    // e.g., ["HTML structure", "HTML elements"]
};

// Add this type declaration for error handling
interface ErrorWithMessage {
  message?: string;
}

const RoadmapGeneratorContent: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  
  const pathId = searchParams.get('path') || '';
  const level = searchParams.get('level') || '';
  const language = searchParams.get('language') || '';
  
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [path, setPath] = useState<{id: string, name: string}>({id: '', name: ''});
  const [roadmapTitle, setRoadmapTitle] = useState('');
  const [roadmapDescription, setRoadmapDescription] = useState('');
  const [steps, setSteps] = useState<RoadmapStep[]>([]);
  const [customPrompt, setCustomPrompt] = useState('');
  const [roadmapId, setRoadmapId] = useState<string | null>(null);

  useEffect(() => {
    if (!pathId) {
      navigate('/learning-setup');
      return;
    }
    fetchPathData();
  }, [pathId, navigate, t]);

  const fetchPathData = async () => {
    try {
      if (!pathId) {
        console.error("No path ID provided");
        toast({
          title: t('roadmap.error'),
          description: t('roadmap.error_missing_path'),
          variant: 'destructive',
        });
        navigate('/learning-setup');
        return;
      }

      const { data, error } = await supabase
        .from('learning_paths')
        .select('*')
        .eq('id', pathId)
        .single();

      if (error) {
        console.error("Error fetching path data:", error);
        toast({
          title: t('roadmap.error'),
          description: t('roadmap.error_loading_path'),
          variant: 'destructive',
        });
        navigate('/learning-setup');
        return;
      }
      
      if (!data) {
        console.error("No path data found for ID:", pathId);
        toast({
          title: t('roadmap.error'),
          description: t('roadmap.error_path_not_found'),
          variant: 'destructive',
        });
        navigate('/learning-setup');
        return;
      }

      if (!data.name || data.name.trim() === '') {
        console.error("Path data exists but name is empty:", pathId);
        toast({
          title: t('roadmap.error'),
          description: t('roadmap.error_invalid_path_data'),
          variant: 'destructive',
        });
        navigate('/learning-setup');
        return;
      }

      // Only set path data and continue if we have a valid path name
      setPath(data);
      
      // Customize title and description based on the selected path
      let defaultTitle = '';
      let defaultDescription = '';
      
      switch (data.name.toLowerCase()) {
        case 'web development':
          defaultTitle = t('roadmap.web_dev_title', { 
            level: level.charAt(0).toUpperCase() + level.slice(1)
          });
          defaultDescription = t('roadmap.web_dev_description', {
            level,
            language
          });
          break;
        case 'mobile development':
          defaultTitle = t('roadmap.mobile_dev_title', { 
            level: level.charAt(0).toUpperCase() + level.slice(1)
          });
          defaultDescription = t('roadmap.mobile_dev_description', {
            level,
            language
          });
          break;
        default:
          defaultTitle = t('roadmap.default_title', { 
            path: data.name,
            level: level.charAt(0).toUpperCase() + level.slice(1)
          });
          defaultDescription = t('roadmap.default_description', {
            path: data.name,
            level,
            language
          });
      }
      
      setRoadmapTitle(defaultTitle);
      setRoadmapDescription(defaultDescription);
      
      // Now that we have valid path data, generate the roadmap
      // Only call generateRoadmap if we have valid path data with a non-empty name
      if (data && data.name && data.name.trim() !== '') {
        await generateRoadmap(data);
      } else {
        console.error("Cannot generate roadmap with invalid path data");
        toast({
          title: t('roadmap.error'),
          description: t('roadmap.error_invalid_path_data'),
          variant: 'destructive',
        });
      }
      
    } catch (error: unknown) {
      console.error('Error fetching path data:', error);
      toast({
        title: t('roadmap.error'),
        description: error instanceof Error ? error.message : t('roadmap.error_loading_path'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const generateRoadmap = async (pathData = path) => {
    if (!pathData || !pathData.name || pathData.name.trim() === '') {
      console.error("Path data not yet available or invalid for generation.");
      toast({
        title: t('roadmap.error'),
        description: t('roadmap.error_invalid_path'),
        variant: 'destructive',
      });
      setLoading(false);
      return;
    }
    
    setGenerating(true);
    setLoading(false);
    
    try {
      console.log("Generating roadmap with preferences:", { pathName: pathData.name, level, language });
      
      const enhancedPrompt = customPrompt || 
        t('roadmap.generation_prompt', {
          path: pathData.name,
          level,
          language
        });
      
      const response = await supabase.functions.invoke('generate-roadmap', {
        body: JSON.stringify({
          pathName: pathData.name,
          level,
          language,
          customPrompt: enhancedPrompt,
        }),
      });

      if (response.error) {
        console.error("Supabase Function Error:", response.error);
        throw new Error(response.error.message || t('roadmap.error_generation'));
      }

      if (!response.data) {
        throw new Error(t('roadmap.error_empty'));
      }

      const data = response.data;
      
      console.log("Received roadmap data from Supabase function:", data);

      if (!data.steps || !Array.isArray(data.steps) || data.steps.length === 0) {
        console.warn("Generated roadmap has no steps or is invalid.");
        throw new Error(t('roadmap.error_empty'));
      }

      // Apply stripMarkdown to all the text fields
      const cleanTitle = stripMarkdown(data.title) || roadmapTitle;
      const cleanDescription = stripMarkdown(data.description) || roadmapDescription;
      
      const completeSteps = data.steps.map((step, index) => ({
        ...step,
        title: stripMarkdown(step.title || ''),
        description: stripMarkdown(step.description) || t('roadmap.default_step_description', { title: stripMarkdown(step.title) }),
        estimated_time: step.estimated_time || (level === 'beginner' ? t('roadmap.time_beginner') : 
                                              level === 'intermediate' ? t('roadmap.time_intermediate') : 
                                              t('roadmap.time_advanced')),
        keywords: step.keywords || [`${pathData.name}`, `${level}`],
      }));

      setRoadmapTitle(cleanTitle);
      setRoadmapDescription(cleanDescription);
      setSteps(completeSteps);
      setRoadmapId(null);
      
      toast({
        title: t('roadmap.generated'),
        description: t('roadmap.generated_description'),
      });

    } catch (error: unknown) {
      console.error('Error generating roadmap:', error);
      toast({
        title: t('roadmap.error_generation'),
        description: error instanceof Error ? error.message : t('roadmap.error_try_again'),
        variant: 'destructive',
      });
      setSteps([]); // Clear steps on error
    } finally {
      setGenerating(false);
    }
  };

  const saveRoadmap = async () => {
    setSaving(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }
      
      console.log("Saving new roadmap...");
      const { data: newRoadmapData, error: insertRoadmapError } = await supabase
        .from('roadmaps')
        .insert({
          path_id: pathId,
          title: stripMarkdown(roadmapTitle),
          description: stripMarkdown(roadmapDescription),
          level,
          language,
          ai_generated: true,
        })
        .select()
        .single();
          
      if (insertRoadmapError) throw insertRoadmapError;
      const roadmapRecord = newRoadmapData;
      const newRoadmapId = roadmapRecord.id;
      console.log("Created roadmap record:", newRoadmapId);
      
      const stepsToInsert = steps.map((step, index) => ({
        roadmap_id: newRoadmapId,
        title: stripMarkdown(step.title),
        description: stripMarkdown(step.description),
        order_index: index,
        estimated_time: step.estimated_time,
        keywords: step.keywords
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

    } catch (error: unknown) {
      console.error('Error saving roadmap:', error);
      toast({
        title: t('roadmap.error_saving'),
        description: error instanceof Error ? error.message : t('roadmap.error_try_again'),
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="container mx-auto py-10 px-4 text-center">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-lg max-w-md mx-auto">
            <div className="flex items-center justify-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              <div className="text-left">
                <p className="text-lg font-semibold text-gray-800 dark:text-white">Loading roadmap...</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Please wait while we prepare your learning journey</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto py-10 px-4">
        <Button 
          variant="ghost" 
          className="mb-6 flex items-center gap-2"
          onClick={() => navigate('/learning-setup')}
          disabled={loading || generating}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Setup
        </Button>

        <Card className="shadow-lg rounded-lg border-0 bg-white dark:bg-gray-800 overflow-hidden max-w-4xl mx-auto">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-500 rounded-t-lg p-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/10 rounded-full">
                <Brain className="h-7 w-7 text-white" />
              </div>
              <div>
                <CardTitle className="text-white text-2xl font-bold">Roadmap Generator</CardTitle>
                <CardDescription className="text-blue-100 mt-2 text-base">
                  Customize and generate your personalized learning roadmap
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-8 p-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-blue-500" />
                <Label className="font-semibold text-gray-800 dark:text-white text-base">
                  Learning Path: {path?.name || 'Loading...'}
                </Label>
              </div>
              
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-blue-500" />
                <Label className="font-semibold text-gray-800 dark:text-white text-base">
                  Level: {level ? level.charAt(0).toUpperCase() + level.slice(1) : 'Loading...'}
                </Label>
              </div>
              
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-500" />
                <Label className="font-semibold text-gray-800 dark:text-white text-base">
                  Language: {language ? language.charAt(0).toUpperCase() + language.slice(1) : 'Loading...'}
                </Label>
              </div>
            </div>

            <div className="space-y-4">
              <Label className="font-semibold text-gray-800 dark:text-white text-base">Roadmap Title</Label>
              <Input
                value={stripMarkdown(roadmapTitle)}
                onChange={(e) => setRoadmapTitle(e.target.value)}
                placeholder={t('roadmap.title_placeholder')}
              />
            </div>

            <div className="space-y-4">
              <Label className="font-semibold text-gray-800 dark:text-white text-base">Description</Label>
              <Textarea
                value={stripMarkdown(roadmapDescription)}
                onChange={(e) => setRoadmapDescription(e.target.value)}
                placeholder={t('roadmap.description_placeholder')}
                className="h-24"
              />
            </div>

            <div className="space-y-4">
              <Label className="font-semibold text-gray-800 dark:text-white text-base">Custom Instructions (Optional)</Label>
              <Textarea
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="Add any specific requirements or preferences for your roadmap..."
                className="min-h-[120px] rounded-lg border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-400 text-base bg-white dark:bg-gray-700"
                disabled={loading || generating}
              />
            </div>

            <div className="space-y-6">
              {steps.map((step, index) => (
                <Card key={index} className="border-l-4 border-blue-500">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-800 text-sm font-medium">
                          {index + 1}
                        </span>
                        <h3 className="font-medium text-gray-800 dark:text-white">
                          {stripMarkdown(step.title)}
                        </h3>
                      </CardTitle>
                      <Badge variant="outline" className="bg-blue-50 text-blue-800">
                        {step.estimated_time}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 dark:text-gray-300 my-2 whitespace-pre-line text-sm">
                      {stripMarkdown(step.description)}
                    </p>
                    {step.keywords && step.keywords.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-4">
                        {step.keywords.map((keyword, i) => (
                          <Badge key={i} variant="secondary" className="bg-gray-100 dark:bg-gray-700">
                            {keyword.replace(/[*_`]/g, '').trim()}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>

          <CardFooter className="px-8 pb-8 pt-0">
            <div className="flex gap-4 w-full">
              <Button
                onClick={generateRoadmap}
                disabled={loading || generating}
                className="flex-1 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold text-base rounded-lg shadow hover:from-blue-600 hover:to-indigo-600 transition transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {generating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Regenerating...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4" />
                    Regenerate Roadmap
                  </>
                )}
              </Button>

              <Button
                onClick={saveRoadmap}
                disabled={loading || saving || steps.length === 0}
                className="flex-1 h-12 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold text-base rounded-lg shadow hover:from-green-600 hover:to-emerald-600 transition transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Roadmap
                  </>
                )}
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

const RoadmapGenerator: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <RoadmapGeneratorContent />
    </div>
  );
};

export default RoadmapGenerator; 