import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useLanguage, LanguageProvider } from '../contexts/LanguageContext';
import { supabase } from '../integrations/supabase/client';
import Navbar from '../components/Navbar';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../components/ui/card';
import { Separator } from '../components/ui/separator';
import { Progress } from '../components/ui/progress';
import { useToast } from '../components/ui/use-toast';
import { CheckCircle, Clock, ArrowLeft, PenLine, CheckCircle2, LucideLoader2, Edit, Link as LinkIcon, Info, BarChart } from 'lucide-react';
import { Badge } from '../components/ui/badge';

type RoadmapStep = {
  id: string;
  roadmap_id: string;
  title: string;
  description: string;
  order_index: number;
  estimated_time: string;
  keywords?: string[];
  status?: string;
  notes?: string;
};

type Roadmap = {
  id: string;
  path_id: string;
  title: string;
  description: string;
  level: string;
  language: string;
  ai_generated: boolean;
  created_at: string;
  path_name?: string;
};

const stripMarkdown = (text: string) => {
  if (!text) return '';
  // Replace markdown headings, bold, italic, links, code blocks, and lists with plain text
  return text
    .replace(/#{1,6}\s/g, '') // Remove headings
    .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
    .replace(/\*(.*?)\*/g, '$1') // Remove italic
    .replace(/\_\_(.*?)\_\_/g, '$1') // Remove underscores bold
    .replace(/\_(.*?)\_/g, '$1') // Remove underscores italic
    .replace(/\[(.*?)\]\((.*?)\)/g, '$1') // Replace links with just text
    .replace(/`{1,3}([\s\S]*?)`{1,3}/g, '$1') // Remove code blocks
    .replace(/^\s*[-*+]\s/gm, '• ') // Replace bullet lists with simple bullet points
    .replace(/^\s*\d+\.\s/gm, '$1. ') // Keep numbered lists
    .replace(/\n\s*\n/g, '\n\n') // Normalize line breaks
    .trim(); // Remove extra whitespace
};

const RoadmapViewContent: React.FC = () => {
  const { t } = useLanguage();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [savingProgress, setSavingProgress] = useState<string | null>(null);
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [steps, setSteps] = useState<RoadmapStep[]>([]);
  const [progress, setProgress] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchUserAndRoadmap = async () => {
      try {
        // Check if user is authenticated
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          navigate('/auth');
          return;
        }
        
        setUserId(user.id);
        
        if (!id) {
          navigate('/');
          return;
        }
        
        // Fetch roadmap details
        const { data: roadmapData, error: roadmapError } = await supabase
          .from('roadmaps')
          .select('*, learning_paths(name)')
          .eq('id', id)
          .single();
          
        if (roadmapError) throw roadmapError;
        
        if (!roadmapData) {
          navigate('/');
          return;
        }
        
        // Format the roadmap data
        const formattedRoadmap: Roadmap = {
          ...roadmapData,
          path_name: roadmapData.learning_paths?.name,
        };
        
        setRoadmap(formattedRoadmap);
        
        // Fetch steps for this roadmap
        const { data: stepsData, error: stepsError } = await supabase
          .from('roadmap_steps')
          .select('*')
          .eq('roadmap_id', id)
          .order('order_index', { ascending: true });
          
        if (stepsError) throw stepsError;
        
        if (!stepsData || stepsData.length === 0) {
          toast({
            title: 'No steps found',
            description: 'This roadmap has no steps defined.',
            variant: 'destructive',
          });
          return;
        }
        
        // Fetch user progress for this roadmap
        const { data: progressData, error: progressError } = await supabase
          .from('user_progress')
          .select('*')
          .eq('user_id', user.id)
          .in('step_id', stepsData.map(step => step.id));
          
        if (progressError) throw progressError;
        
        // Merge steps with progress data
        const stepsWithProgress = stepsData.map(step => {
          const userProgress = progressData?.find(p => p.step_id === step.id);
          return {
            ...step,
            status: userProgress?.status || 'pending',
            notes: userProgress?.notes || '',
          };
        });
        
        setSteps(stepsWithProgress);
        
        // Calculate overall progress
        const completedSteps = stepsWithProgress.filter(step => step.status === 'completed').length;
        const progressPercentage = Math.round((completedSteps / stepsWithProgress.length) * 100);
        setProgress(progressPercentage);
      } catch (error) {
        console.error('Error fetching roadmap:', error);
        toast({
          title: 'Error',
          description: 'Failed to load the roadmap',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserAndRoadmap();
  }, [id, navigate, toast]);
  
  const updateStepStatus = async (stepId: string, status: string) => {
    if (!userId) return;
    
    setSavingProgress(stepId);
    const originalSteps = [...steps];
    
    try {
      // Optimistic UI update
      const updatedSteps = steps.map(step => 
        step.id === stepId ? { ...step, status } : step
      );
      setSteps(updatedSteps);
      
      // Calculate new progress
      const completedSteps = updatedSteps.filter(step => step.status === 'completed').length;
      const progressPercentage = Math.round((completedSteps / updatedSteps.length) * 100);
      setProgress(progressPercentage);
      
      // Update the database
      const { error } = await supabase
        .from('user_progress')
        .upsert({
          user_id: userId,
          step_id: stepId,
          status,
        }, { onConflict: 'user_id, step_id' });
        
      if (error) throw error;
      
    } catch (error) {
      console.error('Error updating progress:', error);
      toast({
        title: 'Error',
        description: 'Failed to update your progress',
        variant: 'destructive',
      });
      
      // Revert the UI change if there was an error
      fetchSteps();
    } finally {
      setSavingProgress(null);
    }
  };
  
  const fetchSteps = async () => {
    if (!userId || !id) return;
    
    try {
      // Fetch steps for this roadmap
      const { data: stepsData, error: stepsError } = await supabase
        .from('roadmap_steps')
        .select('*')
        .eq('roadmap_id', id)
        .order('order_index', { ascending: true });
        
      if (stepsError) throw stepsError;
      
      // Fetch user progress for this roadmap
      const { data: progressData, error: progressError } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', userId)
        .in('step_id', stepsData?.map(step => step.id) || []);
        
      if (progressError) throw progressError;
      
      // Merge steps with progress data
      const stepsWithProgress = stepsData?.map(step => {
        const userProgress = progressData?.find(p => p.step_id === step.id);
        return {
          ...step,
          status: userProgress?.status || 'pending',
          notes: userProgress?.notes || '',
        };
      });
      
      setSteps(stepsWithProgress || []);
      
      // Calculate overall progress
      const completedSteps = stepsWithProgress?.filter(step => step.status === 'completed').length || 0;
      const progressPercentage = Math.round((completedSteps / (stepsWithProgress?.length || 1)) * 100);
      setProgress(progressPercentage);
    } catch (error) {
      console.error('Error fetching steps:', error);
    }
  };
  
  const updateStepNotes = async (stepId: string, notes: string) => {
    if (!userId) return;
    
    try {
      // Update the notes in the UI
      const updatedSteps = steps.map(step => 
        step.id === stepId ? { ...step, notes } : step
      );
      setSteps(updatedSteps);
      
      // Update the database
      const { error } = await supabase
        .from('user_progress')
        .upsert({
          user_id: userId,
          step_id: stepId,
          notes,
          status: updatedSteps.find(step => step.id === stepId)?.status || 'pending',
        }, { onConflict: 'user_id, step_id' });
        
      if (error) throw error;
    } catch (error) {
      console.error('Error updating notes:', error);
      toast({
        title: 'Error',
        description: 'Failed to save your notes',
        variant: 'destructive',
      });
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto py-10 px-4 text-center">
          <LucideLoader2 className="h-10 w-10 animate-spin mx-auto" />
          <p className="mt-4">Loading your roadmap...</p>
        </div>
      </div>
    );
  }
  
  if (!roadmap) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto py-10 px-4 text-center">
          <h1 className="text-2xl font-bold mb-4">Roadmap Not Found</h1>
          <Button onClick={() => navigate('/')}>Return Home</Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-10 px-4">
        <Button 
          variant="ghost" 
          className="mb-6 flex items-center gap-2"
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Button>
        
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold">{roadmap.title}</h1>
            <p className="text-gray-600 mt-2">{roadmap.description}</p>
            <div className="flex items-center gap-2 mt-4">
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                {roadmap.path_name}
              </span>
              <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                {roadmap.level.charAt(0).toUpperCase() + roadmap.level.slice(1)}
              </span>
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                {roadmap.language.charAt(0).toUpperCase() + roadmap.language.slice(1)}
              </span>
            </div>
          </div>
          
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => navigate(`/roadmap/edit/${id}`)}
          >
            <Edit className="h-4 w-4" />
            Edit Roadmap
          </Button>
        </div>
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg">Your Progress</CardTitle>
            <CardDescription>
              {progress}% complete ({steps.filter(step => step.status === 'completed').length} of {steps.length} steps)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={progress} className="h-3" />
          </CardContent>
        </Card>
        
        <h2 className="text-2xl font-bold mb-6">Learning Steps</h2>
        
        <div className="space-y-6">
          {steps.map((step, index) => (
            <Card key={step.id} className={`border-l-4 ${
              step.status === 'completed' 
                ? 'border-l-green-500' 
                : step.status === 'in_progress' 
                  ? 'border-l-blue-500' 
                  : 'border-l-gray-300'
            }`}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-start gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-200 text-gray-700 text-sm font-medium">
                    {index + 1}
                  </span>
                  <span className="mt-1">{step.title}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4 whitespace-pre-line font-normal leading-relaxed">
                  {stripMarkdown(step.description)}
                </p>
                
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  {step.keywords && step.keywords.length > 0 && 
                    step.keywords.map((keyword, kidx) => (
                      <Badge key={kidx} variant="outline" className="bg-gray-50">
                        {keyword}
                      </Badge>
                    ))
                  }
                </div>
                
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
                  {step.estimated_time && (
                    <div className="flex items-center text-gray-700 text-sm font-medium bg-gray-100 px-3 py-1 rounded-full">
                      <Clock className="h-4 w-4 mr-1 text-darija-primary" />
                      <span>Estimated: {step.estimated_time}</span>
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <Button
                      variant={step.status === 'pending' ? 'secondary' : 'outline'}
                      size="sm"
                      onClick={() => updateStepStatus(step.id, 'pending')}
                      disabled={savingProgress === step.id}
                      className="text-sm"
                    >
                      Not Started
                    </Button>
                    <Button
                      variant={step.status === 'in_progress' ? 'secondary' : 'outline'}
                      size="sm"
                      onClick={() => updateStepStatus(step.id, 'in_progress')}
                      disabled={savingProgress === step.id}
                      className="text-sm"
                    >
                      In Progress
                    </Button>
                    <Button
                      variant={step.status === 'completed' ? 'secondary' : 'outline'}
                      size="sm"
                      onClick={() => updateStepStatus(step.id, 'completed')}
                      disabled={savingProgress === step.id}
                      className="text-sm flex items-center gap-1"
                    >
                      {step.status === 'completed' && <CheckCircle2 className="h-3 w-3" />}
                      Completed
                    </Button>
                  </div>
                </div>
                
                <Separator className="my-4" />
                
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <PenLine className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium">Your Notes</span>
                  </div>
                  <textarea
                    value={step.notes || ''}
                    onChange={(e) => {
                      const updatedSteps = steps.map(s => 
                        s.id === step.id ? { ...s, notes: e.target.value } : s
                      );
                      setSteps(updatedSteps);
                    }}
                    onBlur={(e) => updateStepNotes(step.id, e.target.value)}
                    placeholder="Add your notes here..."
                    className="w-full p-3 border rounded-md text-sm min-h-24"
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

const RoadmapView: React.FC = () => {
  return <RoadmapViewContent />;
};

export default RoadmapView; 