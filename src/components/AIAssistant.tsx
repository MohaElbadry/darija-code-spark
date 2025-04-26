import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Mic, Send, Maximize2, Loader2, MessageSquare, SendHorizontal, Bot, User, Sparkles, Image, MicOff } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';


// UI Components
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Card } from './ui/card';


// Supabase client
import { supabase } from '../integrations/supabase/client';

// Define message type
type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
};

// Language options
const languageOptions = [
  { value: 'darija', label: 'الدارجة' },
  { value: 'arabic', label: 'العربية' },
  { value: 'french', label: 'Français' },
  { value: 'english', label: 'English' },
];

type AILanguage = 'english' | 'arabic' | 'french' | 'darija';

const AIAssistant: React.FC = () => {
  const { t, language } = useLanguage();
  const isRtl = language === 'arabic' || language === 'darija';
  
  // Separate language state for AI responses
  const [aiLanguage, setAILanguage] = useState<AILanguage>('darija');
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: aiLanguage === 'darija' ? 'مرحبا، كيفاش نقدر نعاونك اليوم؟' : 
               aiLanguage === 'arabic' ? 'مرحبا كيف يمكنني مساعدتك اليوم؟' : 
               aiLanguage === 'french' ? 'Bonjour, comment puis-je vous aider aujourd\'hui ?' : 
               'Hello, how can I help you today?',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [chatHistory, setChatHistory] = useState<Message[]>([]);

  // Update welcome message when AI language changes
  useEffect(() => {
    // Reset chat with new welcome message when language changes
    setMessages([
      {
        id: '1',
        role: 'assistant',
        content: aiLanguage === 'darija' ? 'مرحبا، كيفاش نقدر نعاونك اليوم؟' : 
                 aiLanguage === 'arabic' ? 'مرحبا كيف يمكنني مساعدتك اليوم؟' : 
                 aiLanguage === 'french' ? 'Bonjour, comment puis-je vous aider aujourd\'hui ?' : 
                 'Hello, how can I help you today?',
        timestamp: new Date()
      }
    ]);
  }, [aiLanguage]);

  // Scroll to bottom of messages whenever messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const generateUniqueId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  };

  const handleVoiceInput = () => {
    if (!isListening) {
      // Start voice recognition
      setIsListening(true);
      // TODO: Implement actual voice recognition
      alert('Voice recognition is not implemented yet.');
    } else {
      // Stop voice recognition
      setIsListening(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() && !selectedImage) return;
    
    // Add user message to chat
    const userMessage: Message = {
      id: generateUniqueId(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setSelectedImage(null);
    setIsLoading(true);

    try {
      // Call AI service (Supabase Edge Function)
      const { data, error } = await supabase.functions.invoke('ai-assistant', {
        body: {
          message: input,
          language: aiLanguage, // Use AI-specific language
          chatHistory: messages.map(m => ({ role: m.role, content: m.content })),
          image: selectedImage ? await convertImageToBase64(selectedImage) : null,
        },
      });

      if (error) throw error;

      // If we don't have a proper response, use a fallback
      let responseText = data?.reply || getFallbackResponse(aiLanguage);

      // Add assistant message to chat
      const assistantMessage: Message = {
        id: generateUniqueId(),
        role: 'assistant',
        content: responseText,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      
      // Add error message
      const errorMessage: Message = {
        id: generateUniqueId(),
        role: 'assistant',
        content: getErrorMessage(aiLanguage),
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const convertImageToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      handleSendMessage();
    }
  };

  // Fallback responses in different languages
  const getFallbackResponse = (lang: string): string => {
    switch (lang) {
      case 'darija':
        return 'نعتذر، كاين شي مشكل فالنظام دالذكاء الاصطناعي. غادي نحاولو نحلو هاد المشكل قريبا.';
      case 'arabic':
        return 'آسف، هناك مشكلة في نظام الذكاء الاصطناعي. سنحاول حل هذه المشكلة قريبًا.';
      case 'french':
        return 'Désolé, il y a un problème avec le système d\'IA. Nous essaierons de résoudre ce problème bientôt.';
      default:
        return 'I\'m sorry, there seems to be an issue with the AI system. We\'ll try to fix this soon.';
    }
  };

  // Error messages in different languages
  const getErrorMessage = (lang: string): string => {
    switch (lang) {
      case 'darija':
        return 'عفوا، كاين مشكل فالاتصال. عاود جرب من بعد.';
      case 'arabic':
        return 'عذرًا، هناك مشكلة في الاتصال. يرجى المحاولة مرة أخرى لاحقًا.';
      case 'french':
        return 'Désolé, il y a un problème de connexion. Veuillez réessayer plus tard.';
      default:
        return 'Sorry, there was a connection issue. Please try again later.';
    }
  };

  return (
    <div className="flex flex-col h-full max-w-3xl mx-auto p-4 bg-gradient-to-br from-background/50 to-muted/20 rounded-lg">
      <div className="flex items-center gap-3 mb-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg shadow-sm">
        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full animate-pulse">
          <Sparkles className="h-6 w-6 text-blue-600 dark:text-blue-400" />
        </div>
        <h2 className="text-xl font-bold flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          <Bot className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          {language === 'darija' ? 'المساعد الذكي' : 
           language === 'arabic' ? 'المساعد الذكي' : 
           language === 'french' ? 'Assistant IA' : 
           'AI Assistant'}
        </h2>

      </div>

      <Card className="flex-1 overflow-auto mb-4 p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg">
        <div className="flex flex-col gap-4">
          {messages.length === 0 ? (
            <div className="text-center text-muted-foreground py-8 flex flex-col items-center gap-2">
              <div className="p-4 bg-blue-100 dark:bg-blue-900/20 rounded-full animate-bounce">
                <Sparkles className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="text-lg font-medium">
                {language === 'darija' ? 'أهلا! أنا هنا لمساعدتك في تعلم البرمجة. ما هو سؤالك؟' :
                 language === 'arabic' ? 'أهلا! أنا هنا لمساعدتك في تعلم البرمجة. ما هو سؤالك؟' :
                 language === 'french' ? 'Bonjour! Je suis là pour vous aider à apprendre la programmation. Quelle est votre question?' :
                 'Hello! I\'m here to help you learn programming. What\'s your question?'}
              </p>
            </div>
          ) : (
            messages.map((msg, index) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${
                  msg.role === 'assistant' ? 'justify-start' : 'justify-end'
                }`}
              >
                {msg.role === 'assistant' && (
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full shadow-sm">
                    <Bot className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                )}
                <div
                  className={`rounded-lg p-3 max-w-[80%] shadow-sm transition-all duration-200 hover:shadow-md ${
                    msg.role === 'assistant'
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-900 dark:text-blue-100'
                      : 'bg-purple-600 text-white'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  <span className={`text-xs mt-1 block ${
                    msg.role === 'assistant' 
                      ? 'text-blue-600/70 dark:text-blue-400/70' 
                      : 'text-purple-200/70'
                  }`}>
                    {msg.timestamp.toLocaleTimeString()}
                  </span>
                </div>
                {msg.role === 'user' && (
                  <Avatar className="h-8 w-8 border-2 border-purple-500 shadow-sm hover:shadow-md transition-all duration-200">
                    <AvatarImage src="/default-avatar.png" />
                    <AvatarFallback className="bg-purple-500 text-white">
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </Card>

      <form onSubmit={(e) => {
        e.preventDefault();
        handleSendMessage();
      }} className="flex gap-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-3 rounded-lg shadow-lg border border-gray-200/50 dark:border-gray-700/50">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageSelect}
          accept="image/*"
          className="hidden"
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => fileInputRef.current?.click()}
          className="hover:bg-purple-100 dark:hover:bg-purple-900/30"
        >
          <Image className="h-4 w-4 text-purple-600" />
        </Button>
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            language === 'darija' ? 'اكتب سؤالك هنا...' :
            language === 'arabic' ? 'اكتب سؤالك هنا...' :
            language === 'french' ? 'Écrivez votre question ici...' :
            'Type your question here...'
          }
          className="flex-1 resize-none bg-white/50 dark:bg-gray-800/50 border-none focus:ring-2 focus:ring-purple-500/20"

          rows={2}
          disabled={isLoading}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
        />
        <div className="flex gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleVoiceInput}
            className={`hover:bg-purple-100 dark:hover:bg-purple-900/30 ${
              isListening ? 'text-red-500' : 'text-purple-600'
            }`}
          >
            {isListening ? (
              <MicOff className="h-4 w-4 animate-pulse" />
            ) : (
              <Mic className="h-4 w-4" />
            )}
          </Button>
          <Button 
            type="submit" 
            disabled={isLoading || (!input.trim() && !selectedImage)}
            className="bg-purple-600 hover:bg-purple-700 shadow-sm hover:shadow-md transition-all duration-200"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <SendHorizontal className="h-4 w-4" />
            )}
          </Button>
        </div>
      </form>
      {selectedImage && (
        <div className="mt-2 flex items-center gap-2 bg-white/50 dark:bg-gray-800/50 p-2 rounded-lg">
          <Image className="h-4 w-4 text-purple-600" />
          <span className="text-sm text-gray-600 dark:text-gray-300 truncate">
            {selectedImage.name}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setSelectedImage(null)}
            className="ml-auto h-6 w-6 hover:bg-red-100 dark:hover:bg-red-900/30"
          >
            <span className="text-red-500">×</span>
          </Button>
        </div>
      )}
    </div>
  );
};

export default AIAssistant;
