import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Mic, Send, Maximize2, Loader2, MessageSquare, SendHorizontal, Globe } from 'lucide-react';

// UI Components
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Card } from './ui/card';
import { Avatar } from './ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

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

  const handleSendMessage = async () => {
    if (!input.trim()) return;
    
    // Add user message to chat
    const userMessage: Message = {
      id: generateUniqueId(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Call AI service (Supabase Edge Function)
      const { data, error } = await supabase.functions.invoke('ai-assistant', {
        body: {
          message: input,
          language: aiLanguage, // Use AI-specific language
          chatHistory: messages.map(m => ({ role: m.role, content: m.content })),
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

  // Mock speech recognition function
  const handleVoiceInput = () => {
    alert('Voice input is not implemented yet.');
  };

  return (
    <div className="flex flex-col h-full max-w-3xl mx-auto p-4">
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-6 w-6" />
          <h2 className="text-xl font-bold">المساعد الذكي</h2>
        </div>
        
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-muted-foreground" />
          <Select
            value={aiLanguage}
            onValueChange={(value) => setAILanguage(value as AILanguage)}
          >
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              {languageOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card className="flex-1 overflow-auto mb-4 p-4">
        <div className="flex flex-col gap-4">
          {messages.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              أهلا! أنا هنا لمساعدتك في تعلم البرمجة. ما هو سؤالك؟
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
                  <Avatar>
                    <MessageSquare className="h-5 w-5" />
                  </Avatar>
                )}
                <div
                  className={`rounded-lg p-3 max-w-[80%] ${
                    msg.role === 'assistant'
                      ? 'bg-muted'
                      : 'bg-primary text-primary-foreground'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
                {msg.role === 'user' && (
                  <Avatar>
                    <div className="bg-primary text-primary-foreground rounded-full h-full w-full flex items-center justify-center">
                      U
                    </div>
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
      }} className="flex gap-2">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={aiLanguage === 'darija' ? 'كتب سؤالك هنا...' : 
                       aiLanguage === 'arabic' ? 'اكتب سؤالك هنا...' : 
                       aiLanguage === 'french' ? 'Écrivez votre question ici...' :
                       'Type your question here...'}
          className="flex-1 resize-none"
          rows={2}
          disabled={isLoading}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
        />
        <Button type="submit" disabled={isLoading || !input.trim()}>
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <SendHorizontal className="h-4 w-4" />
          )}
        </Button>
      </form>
    </div>
  );
};

export default AIAssistant;
