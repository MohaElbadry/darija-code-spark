import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Plus, Search, MessageSquare, Users, Clock, ThumbsUp, Bookmark, Share2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";

interface Thread {
  id: string;
  title: string;
  content: string;
  author: {
    name: string;
    avatar: string;
  };
  category: string;
  replies: number;
  views: number;
  likes: number;
  isBookmarked: boolean;
  lastActivity: string;
  tags: string[];
}

const Community: React.FC = () => {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<string>('recent');

  // Sample threads data
  const threads: Thread[] = [
    {
      id: '1',
      title: t('community.threads.darija_resources.title'),
      content: t('community.threads.darija_resources.content'),
      author: {
        name: 'Sarah Johnson',
        avatar: 'https://github.com/shadcn.png',
      },
      category: t('community.categories.learning_resources'),
      replies: 24,
      views: 156,
      likes: 45,
      isBookmarked: true,
      lastActivity: '2 hours ago',
      tags: ['resources', 'beginner', 'darija'],
    },
    {
      id: '2',
      title: t('community.threads.cultural_exchange.title'),
      content: t('community.threads.cultural_exchange.content'),
      author: {
        name: 'Ahmed Benali',
        avatar: 'https://github.com/shadcn.png',
      },
      category: t('community.categories.cultural_exchange'),
      replies: 18,
      views: 89,
      likes: 32,
      isBookmarked: false,
      lastActivity: '5 hours ago',
      tags: ['culture', 'traditions', 'exchange'],
    },
    {
      id: '3',
      title: t('community.threads.language_partner.title'),
      content: t('community.threads.language_partner.content'),
      author: {
        name: 'Maria Garcia',
        avatar: 'https://github.com/shadcn.png',
      },
      category: t('community.categories.language_practice'),
      replies: 42,
      views: 203,
      likes: 67,
      isBookmarked: true,
      lastActivity: '1 day ago',
      tags: ['practice', 'partner', 'conversation'],
    },
  ];

  const filteredThreads = threads.filter(thread => {
    const matchesSearch = thread.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         thread.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || thread.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const sortedThreads = [...filteredThreads].sort((a, b) => {
    if (activeTab === 'recent') {
      return new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime();
    }
    if (activeTab === 'popular') {
      return (b.views + b.replies) - (a.views + a.replies);
    }
    return 0;
  });

  const categories = ['all', 'Learning Resources', 'Cultural Exchange', 'Language Practice', 'Questions', 'Announcements'];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">{t('community.forum')}</h1>
          <p className="text-muted-foreground">{t('community.join_conversation')}</p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          {t('community.new_thread')}
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('community.search_threads')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={t('community.filter_category')} />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(t('community.categories')).map(([key, value]) => (
              <SelectItem key={key} value={key}>
                {value}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList>
          <TabsTrigger value="recent">{t('community.recent')}</TabsTrigger>
          <TabsTrigger value="popular">{t('community.popular')}</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="space-y-4">
        {sortedThreads.map((thread) => (
          <Card key={thread.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={thread.author.avatar} alt={thread.author.name} />
                      <AvatarFallback>{thread.author.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{thread.author.name}</p>
                      <p className="text-sm text-muted-foreground">{thread.lastActivity}</p>
                    </div>
                  </div>
                  <CardTitle className="text-xl mb-2">{thread.title}</CardTitle>
                  <CardDescription className="line-clamp-2">{thread.content}</CardDescription>
                </div>
                <Badge variant="outline">{thread.category}</Badge>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {thread.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">{tag}</Badge>
                ))}
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <MessageSquare className="h-4 w-4" />
                  {t('community.replies', { count: thread.replies })}
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {t('community.views', { count: thread.views })}
                </div>
                <div className="flex items-center gap-1">
                  <ThumbsUp className="h-4 w-4" />
                  {t('community.likes', { count: thread.likes })}
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="ghost" size="sm">
                <MessageSquare className="mr-2 h-4 w-4" />
                {t('community.reply')}
              </Button>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm">
                  <ThumbsUp className="mr-2 h-4 w-4" />
                  {t('community.like')}
                </Button>
                <Button variant="ghost" size="sm">
                  <Bookmark className="mr-2 h-4 w-4" />
                  {thread.isBookmarked ? t('community.unbookmark') : t('community.bookmark')}
                </Button>
                <Button variant="ghost" size="sm">
                  <Share2 className="mr-2 h-4 w-4" />
                  {t('community.share')}
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Community; 