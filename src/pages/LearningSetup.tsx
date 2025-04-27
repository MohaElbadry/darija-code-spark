import React, { useState, useEffect } from "react";
import { Check, ArrowRight, Award, Calendar, Globe } from "lucide-react";

interface PathStep {
  id: string;
  title: string;
  description: string;
  resources: { title: string; url: string }[];
  estimatedTime: string;
  completed: boolean;
}

interface LearningPath {
  id: string;
  title: string;
  description: string;
  level: "beginner" | "intermediate" | "advanced";
  category: string;
  steps: PathStep[];
}

type Language = "english" | "arabic" | "french" | "darija";

const DEFAULT_PATH_GOAL = "I want to become a full-stack web developer";

const languageOptions = [
  { value: "english", label: "English" },
  { value: "arabic", label: "العربية" },
  { value: "french", label: "Français" },
  { value: "darija", label: "الدارجة المغربية" },
];

const languagePrompts = {
  english: "Create a detailed coding learning path for me to",
  arabic: "قم بإنشاء مسار تعليمي مفصل للبرمجة لمساعدتي على",
  french: "Créez un parcours d'apprentissage détaillé de codage pour m'aider à",
  darija: "دير ليا واحد المسار ديال التعلم ديال البرمجة باش نقدر"
};

const interfaceText = {
  english: {
    title: "Learning Path Generator",
    subtitle: "Set your coding goal and get a personalized AI-generated learning path to achieve it.",
    goalLabel: "What do you want to learn?",
    generateButton: "Generate Path",
    generating: "Generating...",
    progress: "Progress",
    completed: "Completed",
    markComplete: "Mark Complete",
    estimatedTime: "Estimated time:",
    resources: "Resources:",
    languageSelector: "Select language:",
    errorEmpty: "Please enter a learning goal",
    errorParsing: "Failed to parse the generated learning path. Please try again.",
    errorGeneral: "An error occurred while generating the learning path. Please check your API key and try again."
  },
  arabic: {
    title: "منشئ مسار التعلم",
    subtitle: "حدد هدف البرمجة الخاص بك واحصل على مسار تعلم مخصص تم إنشاؤه بواسطة الذكاء الاصطناعي لتحقيقه.",
    goalLabel: "ماذا تريد أن تتعلم؟",
    generateButton: "إنشاء المسار",
    generating: "جاري الإنشاء...",
    progress: "التقدم",
    completed: "مكتمل",
    markComplete: "وضع علامة اكتمال",
    estimatedTime: "الوقت المقدر:",
    resources: "الموارد:",
    languageSelector: "اختر اللغة:",
    errorEmpty: "الرجاء إدخال هدف التعلم",
    errorParsing: "فشل في تحليل مسار التعلم المنشأ. يرجى المحاولة مرة أخرى.",
    errorGeneral: "حدث خطأ أثناء إنشاء مسار التعلم. يرجى التحقق من مفتاح API الخاص بك والمحاولة مرة أخرى."
  },
  french: {
    title: "Générateur de Parcours d'Apprentissage",
    subtitle: "Définissez votre objectif de codage et obtenez un parcours d'apprentissage personnalisé généré par IA pour l'atteindre.",
    goalLabel: "Que voulez-vous apprendre ?",
    generateButton: "Générer le Parcours",
    generating: "Génération en cours...",
    progress: "Progrès",
    completed: "Terminé",
    markComplete: "Marquer comme Terminé",
    estimatedTime: "Temps estimé :",
    resources: "Ressources :",
    languageSelector: "Sélectionner la langue :",
    errorEmpty: "Veuillez entrer un objectif d'apprentissage",
    errorParsing: "Échec de l'analyse du parcours d'apprentissage généré. Veuillez réessayer.",
    errorGeneral: "Une erreur s'est produite lors de la génération du parcours d'apprentissage. Veuillez vérifier votre clé API et réessayer."
  },
  darija: {
    title: "مولد مسار التعلم",
    subtitle: "حدد هدف البرمجة ديالك وحصل على مسار تعلم مخصص تم إنشاؤه بالذكاء الاصطناعي باش توصل ليه.",
    goalLabel: "شنو بغيتي تعلم؟",
    generateButton: "صاوب المسار",
    generating: "كنصاوب...",
    progress: "التقدم",
    completed: "مكمل",
    markComplete: "علم بلي كملتي",
    estimatedTime: "الوقت المقدر:",
    resources: "الموارد:",
    languageSelector: "ختار اللغة:",
    errorEmpty: "دخل هدف التعلم ديالك عافاك",
    errorParsing: "ماقدرناش نحللو مسار التعلم. عاود جرب.",
    errorGeneral: "وقع مشكل فإنشاء مسار التعلم. تحقق من مفتاح API ديالك وعاود جرب."
  }
};

const LearningPath = () => {
  const [pathGoal, setPathGoal] = useState(() => {
    return localStorage.getItem("pathGoal") || DEFAULT_PATH_GOAL;
  });
  
  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem("language") as Language) || "english";
  });
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  
  const [learningPath, setLearningPath] = useState<LearningPath | null>(() => {
    const savedPath = localStorage.getItem("learningPath");
    return savedPath ? JSON.parse(savedPath) : null;
  });
  
  const text = interfaceText[language];
  
  useEffect(() => {
    localStorage.setItem("language", language);
  }, [language]);
  
  const updatePathInLocalStorage = (path: LearningPath) => {
    localStorage.setItem("learningPath", JSON.stringify(path));
  };
  
  const toggleStepCompletion = (stepId: string) => {
    if (!learningPath) return;
    
    const updatedPath = {
      ...learningPath,
      steps: learningPath.steps.map(step => {
        if (step.id === stepId) {
          return { ...step, completed: !step.completed };
        }
        return step;
      })
    };
    
    setLearningPath(updatedPath);
    updatePathInLocalStorage(updatedPath);
  };
  
  const calculateProgress = () => {
    if (!learningPath || learningPath.steps.length === 0) return 0;
    
    const completedSteps = learningPath.steps.filter(step => step.completed).length;
    return Math.round((completedSteps / learningPath.steps.length) * 100);
  };
  
  const generateLearningPath = async () => {
    if (pathGoal.trim() === "") {
      setGenerationError(text.errorEmpty);
      return;
    }
    
    setIsGenerating(true);
    setGenerationError(null);
    
    try {
      const prompt = `${languagePrompts[language]} ${pathGoal}, using Moroccan references if possible. Return it as a JSON object only, with no explanation. Make sure it's a valid JSON that can be parsed. The response should be in ${language}.`;
      
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${import.meta.env.VITE_GROQ_API_KEY || "PLACEHOLDER_API_KEY"}`
        },
        body: JSON.stringify({
          model: "llama3-70b-8192",
          messages: [
            {
              role: "system",
              content: `You are DarijaCode Hub's learning path assistant, helping Moroccan developers create structured learning plans. When responding, format your output as valid JSON that can be parsed. The response should include a learning path with steps that have the following structure: {id, title, description, level, category, steps: [{id, title, description, resources: [{title, url}], estimatedTime, completed: false}]}. Respond in ${language}.`
            },
            {
              role: "user",
              content: prompt
            }
          ],
          max_tokens: 2048,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content || "";
      
      try {
        // Extract JSON from the response
        const jsonMatch = content.match(/```json([\s\S]*?)```/) || 
                         content.match(/```([\s\S]*?)```/) || 
                         [null, content];
        
        const jsonContent = jsonMatch[1] || content;
        const pathData = JSON.parse(jsonContent);
        
        // Ensure the path has the correct structure
        const validatedPath = {
          id: pathData.id || `path-${Date.now()}`,
          title: pathData.title || pathGoal,
          description: pathData.description || "Custom learning path",
          level: pathData.level || "beginner",
          category: pathData.category || "web development",
          steps: Array.isArray(pathData.steps) ? pathData.steps.map((step: any, index: number) => ({
            id: step.id || `step-${index + 1}`,
            title: step.title || `Step ${index + 1}`,
            description: step.description || "",
            resources: Array.isArray(step.resources) ? step.resources : [],
            estimatedTime: step.estimatedTime || "Unknown",
            completed: false
          })) : []
        };
        
        setLearningPath(validatedPath);
        updatePathInLocalStorage(validatedPath);
        localStorage.setItem("pathGoal", pathGoal);
      } catch (parseError) {
        console.error("Error parsing learning path JSON:", parseError);
        setGenerationError(text.errorParsing);
      }
    } catch (error) {
      console.error("Error generating learning path:", error);
      setGenerationError(text.errorGeneral);
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value as Language);
  };
  
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-900 dark:text-white">
        {text.title}
      </h1>
      
      <p className="text-center text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
        {text.subtitle}
      </p>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <div className="flex justify-end mb-4">
          <div className="flex items-center">
            <Globe size={16} className="mr-2 text-gray-500 dark:text-gray-400" />
            <label htmlFor="language-selector" className="text-sm text-gray-500 dark:text-gray-400 mr-2">
              {text.languageSelector}
            </label>
            <select
              id="language-selector"
              value={language}
              onChange={handleLanguageChange}
              className="text-sm border border-gray-300 dark:border-gray-600 rounded-md py-1 px-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            >
              {languageOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
          {text.goalLabel}
        </h2>
        
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <input
            type="text"
            value={pathGoal}
            onChange={(e) => setPathGoal(e.target.value)}
            placeholder={DEFAULT_PATH_GOAL}
            className="flex-grow px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-morocco-blue focus:border-morocco-blue bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            dir={language === "arabic" || language === "darija" ? "rtl" : "ltr"}
          />
          
          <button
            onClick={generateLearningPath}
            disabled={isGenerating}
            className="px-6 py-2 bg-morocco-blue hover:bg-morocco-blue/90 text-white rounded-lg flex items-center justify-center"
          >
            {isGenerating ? (
              <>
                <div className="mr-2 w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                {text.generating}
              </>
            ) : (
              text.generateButton
            )}
          </button>
        </div>
        
        {generationError && (
          <div className="mb-6 p-3 bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded-lg">
            {generationError}
          </div>
        )}
        
        {learningPath && (
          <div className="mt-8" dir={language === "arabic" || language === "darija" ? "rtl" : "ltr"}>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {learningPath.title}
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mt-1">
                  {learningPath.description}
                </p>
              </div>
              
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-morocco-blue/10 dark:bg-morocco-blue/20 flex items-center justify-center mr-3">
                  <Award size={24} className="text-morocco-blue" />
                </div>
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{text.progress}</div>
                  <div className="text-lg font-semibold text-morocco-blue dark:text-morocco-mint">
                    {calculateProgress()}%
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative mb-6">
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                <div 
                  className="h-2 bg-morocco-blue rounded-full" 
                  style={{ width: `${calculateProgress()}%` }}
                ></div>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-6">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                learningPath.level === "beginner" ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300" :
                learningPath.level === "intermediate" ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300" :
                "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300"
              }`}>
                {learningPath.level.charAt(0).toUpperCase() + learningPath.level.slice(1)}
              </span>
              
              <span className="px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 text-sm font-medium">
                {learningPath.category}
              </span>
            </div>
            
            <div className="space-y-6">
              {learningPath.steps.map((step, index) => (
                <div 
                  key={step.id}
                  className={`p-5 rounded-lg border ${
                    step.completed 
                      ? "border-morocco-blue/30 bg-morocco-blue/5 dark:border-morocco-blue/50 dark:bg-morocco-blue/10" 
                      : "border-gray-200 dark:border-gray-700"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-start">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-4 ${
                        step.completed 
                          ? "bg-morocco-blue text-white" 
                          : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                      }`}>
                        {step.completed ? <Check size={16} /> : index + 1}
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">{step.title}</h3>
                        <p className="text-gray-600 dark:text-gray-300 mt-1">{step.description}</p>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => toggleStepCompletion(step.id)}
                      className={`px-3 py-1 rounded-md text-sm font-medium ${
                        step.completed
                          ? "bg-morocco-blue/20 text-morocco-blue dark:bg-morocco-blue/30 dark:text-morocco-mint hover:bg-morocco-blue/30"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                      }`}
                    >
                      {step.completed ? text.completed : text.markComplete}
                    </button>
                  </div>
                  
                  {step.estimatedTime && (
                    <div className="flex items-center mt-4 text-sm text-gray-500 dark:text-gray-400">
                      <Calendar size={14} className="mr-1" />
                      {text.estimatedTime} {step.estimatedTime}
                    </div>
                  )}
                  
                  {step.resources && step.resources.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">{text.resources}</h4>
                      <ul className="space-y-1 text-sm">
                        {step.resources.map((resource, idx) => (
                          <li key={idx}>
                            <a 
                              href={resource.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-morocco-blue dark:text-morocco-mint hover:underline flex items-center"
                            >
                              {resource.title} 
                              <ArrowRight size={12} className={language === "arabic" || language === "darija" ? "mr-1 rotate-180" : "ml-1"} />
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LearningPath;