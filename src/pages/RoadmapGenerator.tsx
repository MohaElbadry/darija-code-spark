import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useLanguage, LanguageProvider } from '../contexts/LanguageContext';
import { supabase } from '../integrations/supabase/client';
import Navbar from '../components/Navbar';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Separator } from '../components/ui/separator';
import { Textarea } from '../components/ui/textarea';
import { useToast } from '../components/ui/use-toast';
import { Loader2, Brain, Save, CheckCircle, RefreshCw } from 'lucide-react';

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
      
      const defaultTitle = `${data.name} - ${level.charAt(0).toUpperCase() + level.slice(1)} Roadmap`;
      const defaultDescription = `A comprehensive roadmap for learning ${data.name} at a ${level} level, tailored for ${language} speakers.`;
      
      setRoadmapTitle(defaultTitle);
      setRoadmapDescription(defaultDescription);
      
      await generateRoadmap(); 
      
    } catch (error) {
      console.error('Error fetching path data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load learning path data',
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
      
      // Enhanced prompt to ensure better descriptions and time estimates
      const enhancedPrompt = customPrompt || 
        `Create a detailed roadmap for ${path.name} at ${level} level in ${language}. 
        For each step:
        1. Provide a descriptive title
        2. Include a detailed description (at least 2-3 sentences) explaining what to learn and why it's important
        3. Add a realistic estimated time (e.g., "2 hours", "3 days") for each step
        4. Include 2-3 relevant keywords`;
      
      // ** Backend Call - Updated to call Supabase Function **
      const response = await supabase.functions.invoke('generate-roadmap', {
        body: JSON.stringify({
          pathName: path.name,
          level,
          language,
          customPrompt: enhancedPrompt, 
        }),
      });

      // Handle Supabase Function invocation errors
      if (response.error) {
        console.error("Supabase Function Error:", response.error);
        throw new Error(response.error.message || 'Failed to invoke roadmap generation function.');
      }

      // Expecting JSON response from the function: { title: string, description: string, steps: RoadmapStep[] }
      const data = response.data; 
      
      console.log("Received roadmap data from Supabase function:", data);

      if (!data || !data.steps || !Array.isArray(data.steps) || data.steps.length === 0) {
        console.warn("Generated roadmap has no steps or is invalid.");
        throw new Error("Generated roadmap was empty or invalid.");
      }

      // Ensure each step has a description and estimated time
      const completeSteps = data.steps.map((step, index) => ({
        ...step,
        description: step.description || `This step focuses on learning ${step.title}. Take your time to understand the concepts thoroughly.`,
        estimated_time: step.estimated_time || (level === 'beginner' ? '1-2 hours' : level === 'intermediate' ? '3-4 hours' : '5-6 hours'),
        keywords: step.keywords || [`${path.name}`, `${level}`],
      }));

      setRoadmapTitle(data.title || roadmapTitle); 
      setRoadmapDescription(data.description || roadmapDescription); 
      setSteps(completeSteps);
      setRoadmapId(null); 
      
      toast({
        title: 'Roadmap Generated (Draft)',
        description: 'Your AI-powered learning roadmap is ready!',
      });

    } catch (error: any) {
      console.error('Error generating roadmap:', error);
      toast({
        title: 'Generation Failed',
        description: error.message || 'Could not generate roadmap. Please try again.',
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
        // TODO: Add 'keywords TEXT[]' column to roadmap_steps table in Supabase
        // keywords: step.keywords 
      }));
      
      console.log("Inserting steps:", stepsToInsert);
      const { error: stepsError } = await supabase
        .from('roadmap_steps')
        .insert(stepsToInsert);
        
      if (stepsError) throw stepsError;
      
      toast({
        title: 'Roadmap Saved',
        description: 'Your learning roadmap has been saved successfully.',
      });
      
      navigate(`/roadmap/${newRoadmapId}`);

    } catch (error: any) {
      console.error('Error saving roadmap:', error);
      toast({
        title: 'Error Saving Roadmap',
        description: error.message || 'Failed to save roadmap. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto py-10 px-4 text-center">
          <Loader2 className="h-10 w-10 animate-spin mx-auto" />
          <p className="mt-4">Loading preferences...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto py-10 px-4">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Learning Roadmap Generator</span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={generateRoadmap} 
                disabled={generating || !path} 
                className="flex items-center gap-2"
              >
                {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                Regenerate with AI
              </Button>
            </CardTitle>
            <CardDescription>
              {path ? `Customize your AI-generated learning path for ${path.name}` : 'Loading path details...'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium block mb-1">Roadmap Title</label>
                <input
                  type="text"
                  value={roadmapTitle}
                  onChange={(e) => setRoadmapTitle(e.target.value)}
                  className="w-full p-2 border rounded"
                  placeholder="e.g., Intermediate HTML Study Plan"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium block mb-1">Roadmap Description</label>
                <Textarea
                  value={roadmapDescription}
                  onChange={(e) => setRoadmapDescription(e.target.value)}
                  className="mt-1"
                  rows={2}
                  placeholder="A brief description of this learning plan."
                />
              </div>
              
              <div>
                <label className="text-sm font-medium block mb-1">Refine with Custom Prompt (Optional)</label>
                <Textarea
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder={`Example: Create a 6-step roadmap for ${path?.name || 'selected topic'} (${level}) focusing on practical projects. Include estimated time and 2-3 keywords per step.`}
                  className="mt-1"
                  rows={3}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              onClick={() => navigate('/learning-setup')}
              variant="outline"
            >
              Back to Setup
            </Button>
            <Button
              onClick={saveRoadmap}
              disabled={saving || generating || steps.length === 0}
              className="flex items-center gap-2"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {saving ? 'Saving...' : 'Save Roadmap'}
            </Button>
          </CardFooter>
        </Card>
        
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Brain className="h-6 w-6 text-darija-primary" />
          Edit Your Learning Steps
          {generating && <Loader2 className="h-5 w-5 animate-spin ml-2 text-gray-500" />}
        </h2>
        
        <div className="space-y-4 mb-8">
          {steps.map((step, index) => (
            <Card key={index} className="border border-gray-200 shadow-sm">
              <CardHeader className="pb-2 bg-gray-50 rounded-t-lg">
                <CardTitle className="text-lg flex items-start gap-3">
                  <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-darija-primary text-white text-sm font-semibold mt-1">
                    {index + 1}
                  </span>
                  <input 
                    type="text" 
                    value={step.title}
                    onChange={(e) => {
                      const newSteps = [...steps];
                      newSteps[index].title = e.target.value;
                      setSteps(newSteps);
                    }}
                    placeholder="Step Title" 
                    className="flex-1 border-b border-transparent hover:border-gray-300 focus:border-darija-primary focus:outline-none p-1 text-lg font-medium"
                  />
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 pb-4">
                <Textarea
                  value={step.description}
                  onChange={(e) => {
                    const newSteps = [...steps];
                    newSteps[index].description = e.target.value;
                    setSteps(newSteps);
                  }}
                  className="mt-1 min-h-20 text-sm"
                  placeholder="Step description..."
                />
                <div className="mt-3 grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-gray-600 block mb-1">Estimated time:</label>
                      <input
                        type="text"
                        value={step.estimated_time}
                        onChange={(e) => {
                          const newSteps = [...steps];
                          newSteps[index].estimated_time = e.target.value;
                          setSteps(newSteps);
                        }}
                        placeholder="e.g., 2 hours" 
                        className="text-sm border-b border-transparent hover:border-gray-300 focus:border-darija-primary focus:outline-none p-1 w-full"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600 block mb-1">Keywords (comma-separated):</label>
                      <input
                        type="text"
                        value={(step.keywords || []).join(', ')}
                        onChange={(e) => {
                          const newSteps = [...steps];
                          newSteps[index].keywords = e.target.value.split(',').map(k => k.trim()).filter(Boolean);
                          setSteps(newSteps);
                        }}
                        placeholder="e.g., forms, input types" 
                        className="text-sm border-b border-transparent hover:border-gray-300 focus:border-darija-primary focus:outline-none p-1 w-full"
                      />
                    </div>
                </div>
              </CardContent>
              <CardFooter className="pt-2 pb-3 flex justify-between bg-gray-50 rounded-b-lg border-t">
                 <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const newSteps = [...steps];
                    newSteps.splice(index, 1);
                    setSteps(newSteps);
                  }}
                  className="text-red-600 hover:text-red-700 hover:bg-red-100 text-xs px-2 py-1"
                >
                  Remove Step
                </Button>
                <div className='flex gap-1'>
                 {index > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const newSteps = [...steps];
                      [newSteps[index - 1], newSteps[index]] = [newSteps[index], newSteps[index - 1]];
                      setSteps(newSteps);
                    }}
                    className="text-gray-500 hover:bg-gray-200 text-xs px-2 py-1"
                  >
                    Move Up
                  </Button>
                )}
                
                {index < steps.length - 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const newSteps = [...steps];
                      [newSteps[index], newSteps[index + 1]] = [newSteps[index + 1], newSteps[index]];
                      setSteps(newSteps);
                    }}
                    className="text-gray-500 hover:bg-gray-200 text-xs px-2 py-1"
                  >
                    Move Down
                  </Button>
                )}
                </div>
              </CardFooter>
            </Card>
          ))}
          
          <Button
            className="w-full py-3 border-dashed bg-white hover:bg-gray-50 text-gray-600 flex items-center justify-center gap-2"
            variant="outline"
            onClick={() => {
              setSteps([
                ...steps,
                {
                  title: `New Step ${steps.length + 1}`,
                  description: '',
                  order_index: steps.length, 
                  estimated_time: '1 hour',
                  keywords: [],
                },
              ]);
            }}
            disabled={generating}
          >
            + Add another step
          </Button>
        </div>
        
        <div className="flex justify-end gap-4 mt-8">
          <Button
            variant="outline"
            onClick={() => navigate('/learning-setup')}
          >
            Cancel
          </Button>
          <Button
            onClick={saveRoadmap}
            disabled={saving || generating || steps.length === 0}
            className="flex items-center gap-2"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
            {saving ? 'Saving...' : 'Save & Start Learning'}
          </Button>
        </div>
      </div>
    </div>
  );
};

const RoadmapGenerator: React.FC = () => {
  return (
    <LanguageProvider>
      <RoadmapGeneratorContent />
    </LanguageProvider>
  );
};

export default RoadmapGenerator; 