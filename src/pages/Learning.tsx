import React, { useState, useEffect } from "react";
import { Search, Book, ArrowRight, Check } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface LearningTopic {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  language: string;
}

const Learning = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [topics, setTopics] = useState<LearningTopic[]>([
    {
      id: "html-basics",
      title: "HTML Basics",
      description: "Learn the fundamentals of HTML to create web pages.",
      category: "web",
      tags: ["html", "beginner"],
      language: "en"
    },
    {
      id: "css-styling",
      title: "CSS Styling",
      description: "Learn how to style your web pages with CSS.",
      category: "web",
      tags: ["css", "beginner"],
      language: "en"
    },
    {
      id: "javascript-intro",
      title: "JavaScript Introduction",
      description: "Get started with JavaScript programming.",
      category: "web",
      tags: ["javascript", "beginner"],
      language: "en"
    },
    {
      id: "python-basics",
      title: "Python Basics",
      description: "Start your Python programming journey.",
      category: "programming",
      tags: ["python", "beginner"],
      language: "en"
    },
    {
      id: "react-intro",
      title: "React Introduction",
      description: "Learn the basics of React library for building user interfaces.",
      category: "web",
      tags: ["react", "javascript", "intermediate"],
      language: "en"
    },
    {
      id: "git-basics",
      title: "Git Basics",
      description: "Master the essential Git commands for version control.",
      category: "tools",
      tags: ["git", "beginner"],
      language: "en"
    },
    {
      id: "database-intro",
      title: "Database Introduction",
      description: "Understand the basics of databases and SQL.",
      category: "database",
      tags: ["sql", "database", "beginner"],
      language: "en"
    },
    {
      id: "html-basics-fr",
      title: "Bases de HTML",
      description: "Apprendre les fondamentaux de HTML pour créer des pages web.",
      category: "web",
      tags: ["html", "beginner"],
      language: "fr"
    },
    {
      id: "python-basics-ar",
      title: "أساسيات بايثون",
      description: "ابدأ رحلتك في برمجة بايثون.",
      category: "programming",
      tags: ["python", "beginner"],
      language: "ar"
    },
    {
      id: "javascript-intro-darija",
      title: "Mouqadima JavaScript",
      description: "Bda t3llem JavaScript mn louwel.",
      category: "web",
      tags: ["javascript", "beginner"],
      language: "darija"
    }
  ]);

  const [selectedTopic, setSelectedTopic] = useState<LearningTopic | null>(null);
  const [topicContent, setTopicContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [completedLessons, setCompletedLessons] = useState<string[]>(() => {
    const saved = localStorage.getItem("completedLessons");
    return saved ? JSON.parse(saved) : [];
  });

  // Add light/dark mode state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // Listen for system preference changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = (e: MediaQueryListEvent) => setIsDarkMode(e.matches);
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    }
  }, []);

  const categories = [
    { id: "all", name: "All" },
    { id: "web", name: "Web Development" },
    { id: "programming", name: "Programming" },
    { id: "database", name: "Databases" },
    { id: "tools", name: "Tools" },
  ];

  const languages = [
    { id: "all", name: "All Languages" },
    { id: "en", name: "English" },
    { id: "fr", name: "Français" },
    { id: "ar", name: "العربية" },
    { id: "darija", name: "دارجة" }
  ];

  const filteredTopics = topics.filter((topic) => {
    const matchesSearch = topic.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          topic.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          topic.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === "all" || topic.category === selectedCategory;
    
    const matchesLanguage = selectedLanguage === "all" || topic.language === selectedLanguage;
    
    return matchesSearch && matchesCategory && matchesLanguage;
  });

  const handleTopicSelect = async (topic: LearningTopic) => {
    setSelectedTopic(topic);
    setIsLoading(true);
    setTopicContent(null);
    
    try {
      // Create system prompt based on selected language
      let systemPrompt = "You are DarijaCode Hub's learning assistant, helping Moroccan developers learn to code. ";
      
      switch (topic.language) {
        case "darija":
          systemPrompt += "Please respond in Moroccan Darija using Latin script. Use Moroccan cultural references when explaining coding concepts.";
          break;
        case "ar":
          systemPrompt += "Please respond in Arabic. Use Moroccan or Arab cultural references when explaining coding concepts.";
          break;
        case "fr":
          systemPrompt += "Veuillez répondre en français. Utilisez des références culturelles marocaines pour expliquer les concepts de programmation.";
          break;
        default:
          systemPrompt += "Please respond in English. Feel free to use Moroccan cultural references when explaining coding concepts.";
      }

      // Use GROQ API for learning content
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${import.meta.env.VITE_GROQ_API_KEY || "PLACEHOLDER_API_KEY"}`
        },
        body: JSON.stringify({
          model: "llama3-70b-8192",
          messages: [
            { role: "system", content: systemPrompt },
            { 
              role: "user", 
              content: `Teach me about ${topic.title}. Include: 1) An introduction, 2) Key concepts, 3) Code examples, 4) Practice exercises, 5) Additional resources. Format with markdown headings and sections.`
            }
          ],
          max_tokens: 2048,
          temperature: 0.5,
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      setTopicContent(data.choices[0]?.message?.content || "Sorry, I couldn't generate content for this topic.");
      
    } catch (error) {
      console.error("Error generating learning content:", error);
      setTopicContent("Sorry, there was an error generating the learning content. Please make sure your API key is set up correctly.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToTopics = () => {
    setSelectedTopic(null);
    setTopicContent(null);
  };

  const toggleCompletedLesson = (topicId: string) => {
    const newCompletedLessons = completedLessons.includes(topicId)
      ? completedLessons.filter(id => id !== topicId)
      : [...completedLessons, topicId];
    
    setCompletedLessons(newCompletedLessons);
    localStorage.setItem("completedLessons", JSON.stringify(newCompletedLessons));
  };

  // Custom renderer components for ReactMarkdown
  const renderers = {
    h1: ({node, ...props}) => (
      <h1 className="text-3xl font-bold mt-8 mb-4 text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2" {...props} />
    ),
    h2: ({node, ...props}) => (
      <h2 className="text-2xl font-bold mt-6 mb-3 text-gray-900 dark:text-white" {...props} />
    ),
    h3: ({node, ...props}) => (
      <h3 className="text-xl font-semibold mt-5 mb-2 text-gray-800 dark:text-gray-100" {...props} />
    ),
    h4: ({node, ...props}) => (
      <h4 className="text-lg font-semibold mt-4 mb-2 text-gray-800 dark:text-gray-100" {...props} />
    ),
    p: ({node, ...props}) => (
      <p className="my-3 text-gray-700 dark:text-gray-300 leading-relaxed" {...props} />
    ),
    ul: ({node, ...props}) => (
      <ul className="list-disc pl-6 my-4 space-y-2 text-gray-700 dark:text-gray-300" {...props} />
    ),
    ol: ({node, ...props}) => (
      <ol className="list-decimal pl-6 my-4 space-y-2 text-gray-700 dark:text-gray-300" {...props} />
    ),
    li: ({node, ...props}) => (
      <li className="mb-1" {...props} />
    ),
    blockquote: ({node, ...props}) => (
      <blockquote className="border-l-4 border-morocco-blue pl-4 py-1 my-4 bg-blue-50 dark:bg-gray-700/30 italic text-gray-700 dark:text-gray-300" {...props} />
    ),
    code: ({node, inline, className, children, ...props}) => {
      const match = /language-(\w+)/.exec(className || '');
      const language = match ? match[1] : '';
      
      return !inline ? (
        <div className="my-4 rounded-md overflow-hidden">
          <div className="bg-gray-800 dark:bg-gray-900 px-4 py-2 text-xs text-gray-200 flex items-center justify-between">
            <span>{language || 'code'}</span>
          </div>
          <SyntaxHighlighter
            style={oneDark}
            language={language}
            PreTag="div"
            className="rounded-b-md"
            showLineNumbers
            wrapLines
          >
            {String(children).replace(/\n$/, '')}
          </SyntaxHighlighter>
        </div>
      ) : (
        <code className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-gray-800 dark:text-gray-200 font-mono text-sm" {...props}>
          {children}
        </code>
      );
    },
    a: ({node, ...props}) => (
      <a className="text-morocco-blue dark:text-morocco-mint hover:underline" {...props} />
    ),
    table: ({node, ...props}) => (
      <div className="overflow-x-auto my-6">
        <table className="min-w-full border-collapse border border-gray-300 dark:border-gray-700" {...props} />
      </div>
    ),
    thead: ({node, ...props}) => (
      <thead className="bg-gray-100 dark:bg-gray-800" {...props} />
    ),
    th: ({node, ...props}) => (
      <th className="border border-gray-300 dark:border-gray-700 px-4 py-2 text-left text-sm font-semibold text-gray-900 dark:text-white" {...props} />
    ),
    td: ({node, ...props}) => (
      <td className="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300" {...props} />
    ),
    hr: ({node, ...props}) => (
      <hr className="my-6 border-gray-300 dark:border-gray-700" {...props} />
    ),
    img: ({node, ...props}) => (
      <img className="max-w-full h-auto rounded-md my-4" {...props} />
    ),
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {!selectedTopic ? (
        <>
          <h1 className="text-3xl font-bold mb-6 text-center text-gray-900 dark:text-white">
            Learning Center
          </h1>
          <p className="text-center text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            Explore programming topics and get detailed AI-generated explanations tailored to Moroccan developers.
          </p>
          
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={18} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search topics..."
                  className="pl-10 w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-morocco-blue focus:border-morocco-blue bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
              </div>
              
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-morocco-blue focus:border-morocco-blue bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-morocco-blue focus:border-morocco-blue bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              >
                {languages.map((language) => (
                  <option key={language.id} value={language.id}>
                    {language.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {filteredTopics.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-600 dark:text-gray-400">No topics found matching your criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTopics.map((topic) => (
                <div
                  key={topic.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-morocco-blue/10 dark:bg-morocco-blue/20 flex items-center justify-center mr-3">
                          <Book size={20} className="text-morocco-blue" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {topic.title}
                        </h3>
                      </div>
                      <button
                        onClick={() => toggleCompletedLesson(topic.id)}
                        className={`w-6 h-6 rounded-full flex items-center justify-center ${
                          completedLessons.includes(topic.id)
                            ? "bg-morocco-blue text-white"
                            : "bg-gray-200 dark:bg-gray-700"
                        }`}
                      >
                        {completedLessons.includes(topic.id) && <Check size={14} />}
                      </button>
                    </div>
                    <p className="mt-2 text-gray-600 dark:text-gray-300">{topic.description}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {topic.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          topic.language === "en" 
                            ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                            : topic.language === "fr"
                            ? "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
                            : topic.language === "ar"
                            ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                            : "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300"
                        }`}
                      >
                        {topic.language === "en" 
                          ? "English" 
                          : topic.language === "fr" 
                          ? "Français" 
                          : topic.language === "ar" 
                          ? "العربية" 
                          : "دارجة"}
                      </span>
                    </div>
                    <button
                      onClick={() => handleTopicSelect(topic)}
                      className="mt-4 flex items-center text-morocco-blue dark:text-morocco-mint hover:underline"
                    >
                      Learn More <ArrowRight size={16} className="ml-1" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="max-w-4xl mx-auto">
          <button
            onClick={handleBackToTopics}
            className="mb-6 flex items-center text-morocco-blue dark:text-morocco-mint hover:underline"
          >
            <ArrowRight size={16} className="transform rotate-180 mr-1" /> Back to Topics
          </button>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {selectedTopic.title}
              </h2>
              <button
                onClick={() => toggleCompletedLesson(selectedTopic.id)}
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  completedLessons.includes(selectedTopic.id)
                    ? "bg-morocco-blue text-white"
                    : "bg-gray-200 dark:bg-gray-700"
                }`}
              >
                {completedLessons.includes(selectedTopic.id) && <Check size={16} />}
              </button>
            </div>
            
            {isLoading ? (
              <div className="py-20 flex flex-col items-center justify-center">
                <div className="w-16 h-16 border-4 border-morocco-blue/20 border-t-morocco-blue rounded-full animate-spin"></div>
                <p className="mt-4 text-gray-600 dark:text-gray-300">Generating learning content...</p>
              </div>
            ) : topicContent ? (
              <div className="learning-content">
                <ReactMarkdown
                  components={renderers}
                >
                  {topicContent}
                </ReactMarkdown>
              </div>
            ) : (
              <p className="text-gray-600 dark:text-gray-300">Failed to load content. Please try again.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Learning;