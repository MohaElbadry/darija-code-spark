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
  const [path, setPath] = useState<any>(null);
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
  }, [pathId, navigate]);

  const fetchPathData = async () => {
    try {
      const { data, error } = await supabase
        .from('learning_paths')
        .select('*')
        .eq('id', pathId)
        .single();

      if (error) throw error;
      if (!data) {
        navigate('/learning-setup');
        return;
      }

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

    } catch (error: any) {
      console.error('Error generating roadmap:', error);
      toast({
        title: t('roadmap.error_generation'),
        description: error.message || t('roadmap.error_try_again'),
        variant: 'destructive',
      });
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