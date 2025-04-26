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

      // Set initial title/description (these might be overwritten by AI response)
      const defaultTitle = `${data.name} - ${level.charAt(0).toUpperCase() + level.slice(1)} Roadmap`;
      const defaultDescription = getLocalizedDescription(data.name, level, language); // Use helper for initial description
      setRoadmapTitle(defaultTitle);
      setRoadmapDescription(defaultDescription);

    } catch (error) {
      console.error('Error fetching path data:', error);
      toast({ title: 'Error', description: 'Failed to load learning path data.', variant: 'destructive' });
      setApiError(true); // Indicate an error occurred
    } finally {
       setLoading(false); // Stop loading indicator for path fetch
       // Note: Generating state is handled separately in generateRoadmap
    }
  };

  // Generates the roadmap using the Supabase AI function
  const generateRoadmap = async () => {
    if (!path || !path.id || !path.name) {
      console.warn("generateRoadmap called without valid path data.");
      return; // Should not happen if called from useEffect correctly
    }

    setGenerating(true);
    setApiError(false); // Reset error state before trying
    setSteps([]); // Clear previous steps before generating new ones
    console.log("Attempting to generate roadmap via Supabase function...");

    try {
      const payload = {
        pathName: path.name,
        level,
        language,
        customPrompt, // Pass the goal/custom prompt from URL
      };
      console.log("Calling Supabase function 'generate-roadmap' with payload:", payload);

      // *** Call the Supabase Edge Function ***
      const { data, error: functionError } = await supabase.functions.invoke('generate-roadmap', {
        body: JSON.stringify(payload),
      });

      if (functionError) {
        console.error("Supabase Function invocation error:", functionError);
        setApiError(true);
        throw new Error(functionError.message || 'Failed to invoke roadmap generation function.');
      }

      console.log("Received raw data from Supabase function:", data);

      // --- Response Validation ---
      if (!data) {
          throw new Error("Received no data from the AI function.");
      }
      if (typeof data !== 'object') {
          throw new Error(`Expected object response from AI, got ${typeof data}`);
      }
       if (!data.steps || !Array.isArray(data.steps)) {
          console.warn("AI response missing 'steps' array:", data);
          throw new Error("AI response is missing the 'steps' data.");
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

      // Process the steps from the AI response
      const completeSteps = data.steps.map((step: any, index: number): RoadmapStep => ({
        id: step.id || undefined, // Include ID if provided by AI/function
        title: step.title || `Step ${index + 1}`,
        description: step.description || `Details for step ${index + 1}.`,
        order_index: index, // Ensure order_index is set sequentially
        estimated_time: step.estimated_time || 'N/A', // Use AI time or fallback
        keywords: Array.isArray(step.keywords) ? step.keywords : [], // Ensure keywords is an array
      }));

      // Update state with AI-generated content
      setRoadmapTitle(data.title || `${path.name} - ${level}`);
      setRoadmapDescription(data.description || getLocalizedDescription(path.name, level, language));
      setSteps(completeSteps);
      setRoadmapId(null); // Ensure we know this isn't a saved roadmap yet

      toast({
        title: t('roadmap.generated') || 'Roadmap Generated',
        description: t('roadmap.generated.description.ai') || 'Your AI-powered learning roadmap is ready!',
      });

    } catch (error: unknown) {
      console.error('Error during roadmap generation process:', error);
      setApiError(true); // Set error flag
      toast({
        title: t('roadmap.generation.failed') || 'Generation Failed',
        description: (error as Error)?.message || 'Could not generate roadmap. Please check logs or try again.',
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
  };

  // Translates level names to Arabic
  const getArabicLevel = (level: string): string => {
      // (Keep the existing implementation of this function)
      switch(level) {
        case 'beginner': return 'مبتدئ';
        case 'intermediate': return 'متوسط';
        case 'advanced': return 'متقدم';
        default: return level;
      }
  };

  // Translates level names to Darija
  const getDarijaLevel = (level: string): string => {
      // (Keep the existing implementation of this function)
       switch(level) {
         case 'beginner': return 'مبتدئ';
         case 'intermediate': return 'متوسط';
         case 'advanced': return 'متقدم';
         default: return level;
       }
  };

  // Translates level names to French
  const getFrenchLevel = (level: string): string => {
     // (Keep the existing implementation of this function)
      switch(level) {
        case 'beginner': return 'débutant';
        case 'intermediate': return 'intermédiaire';
        case 'advanced': return 'avancé';
        default: return level;
      }
  };

  // --- Fallback Step Generation (Used if AI fails) ---

  // Helper function to get default steps based on path and level
  const getDefaultSteps = (pathName: string, userLevel: string, lang: string): RoadmapStep[] => {
    // (Keep the existing implementation of this function, including all language templates)
    const defaultStepCount = userLevel === 'beginner' ? 5 : userLevel === 'intermediate' ? 6 : 7;
    const defaultKeywords = [`${pathName.toLowerCase()}`, userLevel, 'learning'];

    // English language templates
    if (lang === 'english') {
       // Web Development path
       if (pathName.toLowerCase().includes('web')) {
         return [
           { title: 'HTML & CSS Fundamentals', description: `Master the building blocks of web development...`, order_index: 0, estimated_time: '2-3 weeks', keywords: ['HTML', 'CSS'] },
           { title: 'JavaScript Essentials', description: `Build a strong foundation in JavaScript...`, order_index: 1, estimated_time: '3-4 weeks', keywords: ['JavaScript', 'programming'] },
           { title: 'Responsive Design', description: `Create websites that work on any device...`, order_index: 2, estimated_time: '2 weeks', keywords: ['responsive', 'mobile-first'] },
           { title: 'Frontend Frameworks', description: `Explore modern JavaScript frameworks like React...`, order_index: 3, estimated_time: '4-6 weeks', keywords: ['frameworks', 'React'] },
           { title: 'Backend Basics', description: `Understand server-side development with Node.js...`, order_index: 4, estimated_time: '3-4 weeks', keywords: ['backend', 'server'] }
         ];
       }
       // Data Science path
       else if (pathName.toLowerCase().includes('data')) {
          return [
              { title: 'Python Foundations', description: 'Master Python programming for data analysis...', order_index: 0, estimated_time: '3-4 weeks', keywords: ['Python', 'basics'] },
              { title: 'Data Analysis with Pandas', description: 'Explore data manipulation and analysis using Pandas...', order_index: 1, estimated_time: '2-3 weeks', keywords: ['Pandas', 'analysis'] },
              { title: 'Data Visualization', description: 'Create compelling visualizations with Matplotlib/Seaborn...', order_index: 2, estimated_time: '2 weeks', keywords: ['visualization', 'charts'] },
              { title: 'Statistical Analysis', description: 'Understand fundamental statistical concepts...', order_index: 3, estimated_time: '3-4 weeks', keywords: ['statistics', 'inference'] },
              { title: 'Machine Learning Fundamentals', description: 'Build a foundation in machine learning algorithms...', order_index: 4, estimated_time: '4-6 weeks', keywords: ['machine learning', 'models'] }
          ];
       }
       // Mobile App Development path
       else if (pathName.toLowerCase().includes('mobile')) {
            return [
                { title: 'Mobile Development Fundamentals', description: 'Understand the basics of mobile app development...', order_index: 0, estimated_time: '2 weeks', keywords: ['mobile', 'platforms'] },
                { title: 'React Native / Flutter Basics', description: 'Learn cross-platform development using frameworks...', order_index: 1, estimated_time: '3-4 weeks', keywords: ['React Native', 'Flutter'] },
                { title: 'UI/UX for Mobile', description: 'Master mobile interface design principles...', order_index: 2, estimated_time: '2-3 weeks', keywords: ['UI/UX', 'mobile design'] },
                { title: 'Data Management & APIs', description: 'Implement data persistence and API communication...', order_index: 3, estimated_time: '2-3 weeks', keywords: ['APIs', 'storage'] },
                { title: 'Publishing & Deployment', description: 'Prepare your app for release to app stores...', order_index: 4, estimated_time: '1-2 weeks', keywords: ['publishing', 'deployment'] }
            ];
       }
       // UI/UX Design path
       else if (pathName.toLowerCase().includes('ui') || pathName.toLowerCase().includes('ux') || pathName.toLowerCase().includes('design')) {
            return [
                 { title: 'Design Principles & Theory', description: 'Master fundamental design principles...', order_index: 0, estimated_time: '2-3 weeks', keywords: ['design principles', 'theory'] },
                 { title: 'User Research Methods', description: 'Learn techniques for understanding user needs...', order_index: 1, estimated_time: '2-3 weeks', keywords: ['user research', 'personas'] },
                 { title: 'Wireframing & Prototyping', description: 'Create effective wireframes and interactive prototypes...', order_index: 2, estimated_time: '3-4 weeks', keywords: ['wireframing', 'prototyping'] },
                 { title: 'UI Design Systems', description: 'Develop cohesive design systems with reusable components...', order_index: 3, estimated_time: '3-4 weeks', keywords: ['design systems', 'components'] },
                 { title: 'Advanced Interaction Design', description: 'Master advanced UI animations and micro-interactions...', order_index: 4, estimated_time: '3-4 weeks', keywords: ['interaction design', 'animations'] }
             ];
       }
        // Cloud Computing path
        else if (pathName.toLowerCase().includes('cloud')) {
             return [
                 { title: 'Cloud Concepts & Services', description: 'Understand fundamental cloud computing concepts...', order_index: 0, estimated_time: '2-3 weeks', keywords: ['cloud basics', 'providers'] },
                 { title: 'Infrastructure as Code', description: 'Master automated infrastructure provisioning...', order_index: 1, estimated_time: '3-4 weeks', keywords: ['IaC', 'Terraform'] },
                 { title: 'Containerization & Orchestration', description: 'Explore Docker containers and Kubernetes...', order_index: 2, estimated_time: '3-4 weeks', keywords: ['Docker', 'Kubernetes'] },
                 { title: 'Cloud Security & Compliance', description: 'Implement robust security practices for cloud...', order_index: 3, estimated_time: '2-3 weeks', keywords: ['security', 'compliance'] },
                 { title: 'Serverless Architecture', description: 'Build applications using serverless computing models...', order_index: 4, estimated_time: '3-4 weeks', keywords: ['serverless', 'Lambda'] }
             ];
       }
        // Generic fallback for English
       else {
            return Array.from({ length: defaultStepCount }, (_, i) => ({
                 title: `Step ${i + 1}: ${getGenericStepTitle(i, pathName)}`,
                 description: getGenericStepDescription(i, pathName, userLevel),
                 order_index: i,
                 estimated_time: getGenericTimeEstimate(i, userLevel),
                 keywords: [...defaultKeywords, getGenericKeyword(i)]
             }));
       }
    }
     // Arabic language templates
     else if (lang === 'arabic') {
        // Web Development in Arabic
        if (pathName.toLowerCase().includes('web')) {
            return [
                 { title: 'أساسيات HTML و CSS', description: 'اتقن اللبنات الأساسية لتطوير الويب...', order_index: 0, estimated_time: '2-3 أسابيع', keywords: ['HTML', 'CSS'] },
                 { title: 'أساسيات جافاسكريبت', description: 'بناء أساس قوي في برمجة جافاسكريبت...', order_index: 1, estimated_time: '3-4 أسابيع', keywords: ['جافاسكريبت', 'برمجة'] },
                 { title: 'تصميم متجاوب', description: 'إنشاء مواقع ويب تعمل على أي جهاز...', order_index: 2, estimated_time: 'أسبوعين', keywords: ['تصميم متجاوب', 'الجوال أولاً'] },
                 { title: 'أطر عمل الواجهة الأمامية', description: 'استكشاف أطر عمل جافاسكريبت الحديثة...', order_index: 3, estimated_time: '4-6 أسابيع', keywords: ['أطر عمل', 'React'] },
                 { title: 'أساسيات الخلفية', description: 'فهم تطوير الخادم باستخدام Node.js...', order_index: 4, estimated_time: '3-4 أسابيع', keywords: ['خلفية', 'خادم'] }
             ];
        }
        // Data Science in Arabic
       else if (pathName.toLowerCase().includes('data')) {
           return [
                { title: 'أساسيات بايثون', description: 'إتقان برمجة بايثون لتحليل البيانات...', order_index: 0, estimated_time: '3-4 أسابيع', keywords: ['بايثون', 'برمجة'] },
                { title: 'تحليل البيانات باستخدام Pandas', description: 'استكشاف معالجة وتحليل البيانات باستخدام Pandas...', order_index: 1, estimated_time: '2-3 أسابيع', keywords: ['Pandas', 'تحليل البيانات'] },
                { title: 'تصور البيانات', description: 'إنشاء تصورات مقنعة باستخدام مكتبات...', order_index: 2, estimated_time: 'أسبوعين', keywords: ['تصور', 'Matplotlib'] },
                { title: 'التحليل الإحصائي', description: 'فهم المفاهيم والأساليب الإحصائية الأساسية...', order_index: 3, estimated_time: '3-4 أسابيع', keywords: ['إحصاء', 'احتمالية'] },
                { title: 'أساسيات تعلم الآلة', description: 'بناء أساس في خوارزميات وتقنيات تعلم الآلة...', order_index: 4, estimated_time: '4-6 أسابيع', keywords: ['تعلم الآلة', 'نماذج'] }
            ];
       }
        // Generic fallback for Arabic
       else {
           return Array.from({ length: defaultStepCount }, (_, i) => ({
               title: `الخطوة ${i + 1}: ${getGenericStepTitle(i, pathName)}`, // Needs Arabic generic title helper
               description: `الوصف للخطوة ${i + 1} باللغة العربية.`, // Needs Arabic generic desc helper
               order_index: i,
               estimated_time: `${2 + i}-${4 + i} أسابيع`,
               keywords: defaultKeywords
           }));
       }
    }
    // Darija language templates
    else if (lang === 'darija') {
        // Generic template in Darija - for all paths
       return Array.from({ length: defaultStepCount }, (_, i) => ({
            title: getDarijaStepTitle(i, pathName),
            description: getDarijaStepDescription(i, pathName, userLevel),
            order_index: i,
            estimated_time: `${2 + i}-${4 + i} سيمانات`,
            keywords: [...defaultKeywords, getGenericKeyword(i)]
        }));
    }
     // French language templates
     else if (lang === 'french') {
        // Web Development in French
        if (pathName.toLowerCase().includes('web')) {
             return [
                 { title: 'Fondamentaux HTML & CSS', description: 'Maîtrisez les éléments de base du développement web...', order_index: 0, estimated_time: '2-3 semaines', keywords: ['HTML', 'CSS'] },
                 { title: 'Fondamentaux JavaScript', description: 'Construisez une base solide en programmation JavaScript...', order_index: 1, estimated_time: '3-4 semaines', keywords: ['JavaScript', 'programmation'] },
                 { title: 'Design Responsive', description: 'Créez des sites web qui fonctionnent sur n\'importe quel appareil...', order_index: 2, estimated_time: '2 semaines', keywords: ['responsive', 'mobile-first'] },
                 { title: 'Frameworks Frontend', description: 'Explorez les frameworks JavaScript modernes comme React...', order_index: 3, estimated_time: '4-6 semaines', keywords: ['frameworks', 'React'] },
                 { title: 'Bases du Backend', description: 'Comprenez le développement côté serveur avec Node.js...', order_index: 4, estimated_time: '3-4 semaines', keywords: ['backend', 'serveur'] }
             ];
        }
        // Generic fallback for French
       else {
             return Array.from({ length: defaultStepCount }, (_, i) => ({
                 title: `Étape ${i + 1}: ${getGenericStepTitle(i, pathName)}`, // Needs French generic title helper
                 description: `Description de l'étape ${i + 1} en français.`, // Needs French generic desc helper
                 order_index: i,
                 estimated_time: `${2 + i}-${4 + i} semaines`,
                 keywords: defaultKeywords
             }));
       }
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

  // Helper functions for Darija step titles and descriptions
  const getDarijaStepTitle = (index: number, pathName: string): string => {
    // (Keep the existing implementation of this function)
     const titles = [
       `أساسيات ${pathName}`,
       `مفاهيم أساسية في ${pathName}`,
       `تطبيقات عملية في ${pathName}`,
       `تقنيات متقدمة في ${pathName}`,
       `مشاريع ${pathName}`,
       `تخصص في ${pathName}`,
       `إتقان ${pathName}`
     ];
     return titles[Math.min(index, titles.length - 1)];
  };

  const getDarijaStepDescription = (index: number, pathName: string, level: string): string => {
    // (Keep the existing implementation of this function)
      const descriptions = [
        `بني أساس قوي في مفاهيم ${pathName}...`,
        `عمق فهمك للمفاهيم الأساسية ديال ${pathName}...`,
        `طبق اللي تعلمتي من خلال التطبيق العملي...`,
        `استكشف مواضيع متقدمة في ${pathName}...`,
        `قم بمشاريع مهمة لإظهار قدراتك...`,
        `ركز على مجال محدد داخل ${pathName}...`,
        `صقل وأتقن مهاراتك في ${pathName}...`
      ];
      return descriptions[Math.min(index, descriptions.length - 1)];
  };

  // Helper functions for generating generic step content (used in fallbacks)
  const getGenericStepTitle = (index: number, pathName: string): string => {
     // (Keep the existing implementation of this function)
     const titles = [
       `${pathName} Foundations`, `Core ${pathName} Concepts`, `Practical ${pathName} Skills`,
       `Advanced ${pathName} Techniques`, `${pathName} Projects`, `${pathName} Specialization`, `${pathName} Mastery`
     ];
     return titles[Math.min(index, titles.length - 1)];
  };

  const getGenericStepDescription = (index: number, pathName: string, level: string): string => {
     // (Keep the existing implementation of this function)
      const descriptions = [
        `Build a strong foundation in ${pathName} fundamentals...`,
        `Deepen your understanding of core ${pathName} concepts...`,
        `Apply your knowledge through hands-on practice...`,
        `Explore more advanced topics in ${pathName}...`,
        `Undertake substantial projects to demonstrate your abilities...`,
        `Focus on a specific area within ${pathName}...`,
        `Refine and perfect your ${pathName} skills...`
      ];
      return descriptions[Math.min(index, descriptions.length - 1)];
  };

  const getGenericTimeEstimate = (index: number, level: string): string => {
     // (Keep the existing implementation of this function)
     const baseTime = level === 'beginner' ? 2 : level === 'intermediate' ? 3 : 4;
     return `${baseTime + Math.floor(index/2)}-${baseTime + Math.floor(index/2) + 2} weeks`;
  };

  const getGenericKeyword = (index: number): string => {
     // (Keep the existing implementation of this function)
      const keywords = ['fundamentals', 'concepts', 'practical', 'advanced', 'projects', 'specialization', 'mastery'];
      return keywords[Math.min(index, keywords.length - 1)];
  };

  // --- Saving Logic ---

  const saveRoadmap = async () => {
    // (Keep the existing implementation of this function)
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
           title: roadmapTitle,
           description: roadmapDescription,
           level,
           language: language, // Save language used for generation
           ai_generated: !apiError, // Mark as AI generated only if API call succeeded
         })
         .select()
         .single();

       if (insertRoadmapError) throw insertRoadmapError;
       const roadmapRecord = newRoadmapData;
       const newRoadmapId = roadmapRecord.id;
       console.log("Created roadmap record:", newRoadmapId);

       const stepsToInsert = steps.map((step, index) => ({
         roadmap_id: newRoadmapId,
         title: step.title,
         description: step.description,
         order_index: index,
         estimated_time: step.estimated_time,
         keywords: step.keywords
       }));

       console.log("Inserting steps:", stepsToInsert.length);
       const { error: stepsError } = await supabase
         .from('roadmap_steps')
         .insert(stepsToInsert);

       if (stepsError) throw stepsError;

       toast({
         title: t('roadmap.saved') || 'Roadmap Saved',
         description: t('roadmap.saved.description') || 'Your learning roadmap has been saved successfully.',
       });
       navigate(`/roadmap/${newRoadmapId}`);

     } catch (error: unknown) {
       console.error('Error saving roadmap:', error);
       toast({
         title: t('roadmap.save.error') || 'Error Saving Roadmap',
         description: (error as Error)?.message || 'Failed to save roadmap. Please try again.',
         variant: 'destructive',
       });
     } finally {
       setSaving(false);
     }
  };

   // --- Render Logic ---

   if (loading) {
     return (
       <div className="min-h-screen bg-gray-50">
         <Navbar />
         <div className="container mx-auto py-10 px-4 text-center">
           <Loader2 className="h-10 w-10 animate-spin mx-auto" />
           <p className="mt-4">Loading Learning Path...</p>
         </div>
       </div>
     );
   }

   return (
     <div className="min-h-screen bg-gray-50">
       <Navbar />
       <div className="container mx-auto py-10 px-4">
         {/* --- Top Card for Info & Regeneration --- */}
         <Card className="mb-8">
           <CardHeader>
             <CardTitle className="flex items-center justify-between">
               <span>{roadmapTitle || 'Learning Roadmap Generator'}</span>
               {/* Allow regeneration even if initial generation failed */}
               <Button
                 variant="outline"
                 size="sm"
                 onClick={generateRoadmap}
                 disabled={generating || !path.id} // Disable if generating or path not loaded
                 className="flex items-center gap-2"
               >
                 {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                 {t('roadmap.regenerate', { defaultValue: 'Regenerate with AI' })}
               </Button>
             </CardTitle>
             <CardDescription>
               {roadmapDescription || `Customize your learning path for ${path.name}.`}
               {apiError && <span className="text-red-500 block mt-2">AI generation failed. Showing fallback roadmap. You can edit it or try regenerating.</span>}
             </CardDescription>
           </CardHeader>
           {/* Removed Content & Footer from this card as they weren't used for AI gen */}
         </Card>

         {/* --- Roadmap Steps Section --- */}
         <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
           <Brain className="h-6 w-6 text-darija-primary" />
           {t('roadmap.edit.title', { defaultValue: 'Edit Your Learning Steps' })}
           {generating && <Loader2 className="h-5 w-5 animate-spin ml-2 text-gray-500" />}
         </h2>

         <div className="space-y-4 mb-8">
           {/* Display steps if available, otherwise show message */}
           {steps.length > 0 ? (
             steps.map((step, index) => (
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
                       placeholder={t('roadmap.step.title.placeholder', { defaultValue: 'Step Title' })}
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
                     placeholder={t('roadmap.step.desc.placeholder', { defaultValue: 'Step description...' })}
                   />
                   <div className="mt-3 grid grid-cols-2 gap-4">
                     <div>
                       <label className="text-xs font-medium text-gray-600 block mb-1">
                         {t('roadmap.step.time.label', { defaultValue: 'Estimated time:' })}
                       </label>
                       <input
                         type="text"
                         value={step.estimated_time}
                         onChange={(e) => {
                           const newSteps = [...steps];
                           newSteps[index].estimated_time = e.target.value;
                           setSteps(newSteps);
                         }}
                         placeholder={t('roadmap.step.time.placeholder', { defaultValue: 'e.g., 2 hours' })}
                         className="text-sm border-b border-transparent hover:border-gray-300 focus:border-darija-primary focus:outline-none p-1 w-full"
                       />
                     </div>
                     <div>
                       <label className="text-xs font-medium text-gray-600 block mb-1">
                         {t('roadmap.step.keywords.label', { defaultValue: 'Keywords (comma-separated):' })}
                       </label>
                       <input
                         type="text"
                         value={(step.keywords || []).join(', ')}
                         onChange={(e) => {
                           const newSteps = [...steps];
                           newSteps[index].keywords = e.target.value.split(',').map(k => k.trim()).filter(Boolean);
                           setSteps(newSteps);
                         }}
                         placeholder={t('roadmap.step.keywords.placeholder', { defaultValue: 'e.g., forms, input types' })}
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
                       const newSteps = steps.filter((_, i) => i !== index);
                       // Re-index after removal
                       setSteps(newSteps.map((s, idx) => ({ ...s, order_index: idx })));
                     }}
                     className="text-red-600 hover:text-red-700 hover:bg-red-100 text-xs px-2 py-1"
                     disabled={generating || saving}
                   >
                     {t('roadmap.step.remove', { defaultValue: 'Remove Step' })}
                   </Button>
                   <div className='flex gap-1'>
                     {index > 0 && (
                       <Button
                         variant="ghost"
                         size="sm"
                         onClick={() => {
                           const newSteps = [...steps];
                           [newSteps[index - 1], newSteps[index]] = [newSteps[index], newSteps[index - 1]];
                           // Re-index after move
                           setSteps(newSteps.map((s, idx) => ({ ...s, order_index: idx })));
                         }}
                         className="text-gray-500 hover:bg-gray-200 text-xs px-2 py-1"
                         disabled={generating || saving}
                       >
                         {t('roadmap.step.move.up', { defaultValue: 'Move Up' })}
                       </Button>
                     )}
                     {index < steps.length - 1 && (
                       <Button
                         variant="ghost"
                         size="sm"
                         onClick={() => {
                           const newSteps = [...steps];
                           [newSteps[index], newSteps[index + 1]] = [newSteps[index + 1], newSteps[index]];
                           // Re-index after move
                            setSteps(newSteps.map((s, idx) => ({ ...s, order_index: idx })));
                         }}
                         className="text-gray-500 hover:bg-gray-200 text-xs px-2 py-1"
                         disabled={generating || saving}
                       >
                         {t('roadmap.step.move.down', { defaultValue: 'Move Down' })}
                       </Button>
                     )}
                   </div>
                 </CardFooter>
               </Card>
             ))
           ) : (
             // Show message if no steps and not generating
             !generating && (
                <Card className="text-center p-6 border-dashed">
                  <CardDescription>
                    {apiError
                      ? t('roadmap.error.no_steps', { defaultValue: 'AI generation failed. Please try regenerating or check logs.' })
                      : t('roadmap.generating', { defaultValue: 'Generating your roadmap...' })
                    }
                  </CardDescription>
                </Card>
             )
           )}

           {/* Add Step Button */}
           {steps.length > 0 && ( // Only show if steps exist
             <Button
               className="w-full py-3 border-dashed bg-white hover:bg-gray-50 text-gray-600 flex items-center justify-center gap-2"
               variant="outline"
               onClick={() => {
                 const newStep: RoadmapStep = {
                   title: `New Step ${steps.length + 1}`,
                   description: '',
                   order_index: steps.length,
                   estimated_time: '1 hour', // Default time
                   keywords: [],
                 };
                 setSteps([...steps, newStep]);
               }}
               disabled={generating || saving}
             >
               + {t('roadmap.add.step', { defaultValue: 'Add another step' })}
             </Button>
           )}
         </div>

         {/* --- Bottom Action Buttons --- */}
         <div className="flex justify-end gap-4 mt-8">
           <Button
             variant="outline"
             onClick={() => navigate('/learning-setup')}
             disabled={generating || saving}
           >
             {t('roadmap.cancel', { defaultValue: 'Cancel / Back to Setup' })}
           </Button>
           {/* Show Save button only if there are steps */}
           {steps.length > 0 && (
             <Button
               onClick={saveRoadmap}
               disabled={saving || generating}
               className="flex items-center gap-2"
             >
               {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
               {saving ? t('roadmap.saving', { defaultValue: 'Saving...' }) : t('roadmap.save.start', { defaultValue: 'Save & Start Learning' })}
             </Button>
           )}
           {/* Show Generate button only if there are no steps and not loading/generating */}
            {steps.length === 0 && !loading && !generating && (
              <Button
                 onClick={generateRoadmap}
                 disabled={!path.id} // Disable only if path isn't loaded
                 className="flex items-center gap-2"
               >
                 <Brain className="h-4 w-4" />
                 {t('roadmap.generate.initial', { defaultValue: 'Generate Roadmap with AI' })}
               </Button>
            )}
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