import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Plus, Search, Filter, ArrowRight, Star, Users, Clock, StarOff, Eye, SortDesc } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";

interface Project {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'completed' | 'archived';
  members: number;
  lastUpdated: string;
  isFavorite: boolean;
}

const Projects: React.FC = () => {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed' | 'archived'>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'favorite'>('recent');

  // Sample projects data
  const projects: Project[] = [
    {
      id: '1',
      title: t('projects.darija.title'),
      description: t('projects.darija.description'),
      status: 'active',
      members: 12,
      lastUpdated: '2024-03-20',
      isFavorite: true,
    },
    {
      id: '2',
      title: t('projects.exchange.title'),
      description: t('projects.exchange.description'),
      status: 'completed',
      members: 8,
      lastUpdated: '2024-03-18',
      isFavorite: false,
    },
    {
      id: '3',
      title: t('projects.culture.title'),
      description: t('projects.culture.description'),
      status: 'archived',
      members: 5,
      lastUpdated: '2024-03-15',
      isFavorite: true,
    },
  ];

  const filteredProjects = projects
    .filter(project => 
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter(project => statusFilter === 'all' ? true : project.status === statusFilter)
    .sort((a, b) => {
      if (sortBy === 'favorite') {
        return (b.isFavorite ? 1 : 0) - (a.isFavorite ? 1 : 0);
      }
      return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
    });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'completed': return 'bg-blue-500';
      case 'archived': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">{t('projects.title')}</h1>
          <p className="text-gray-600 dark:text-gray-400">{t('projects.subtitle')}</p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          {t('projects.new')}
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <Input
            className="pl-10"
            placeholder={t('projects.search.placeholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <select
              className="pl-10 pr-4 py-2 border rounded-md bg-background"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
            >
              <option value="all">{t('projects.filter.all')}</option>
              <option value="active">{t('projects.filter.active')}</option>
              <option value="completed">{t('projects.filter.completed')}</option>
              <option value="archived">{t('projects.filter.archived')}</option>
            </select>
          </div>
          <div className="relative">
            <SortDesc className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <select
              className="pl-10 pr-4 py-2 border rounded-md bg-background"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
            >
              <option value="recent">{t('projects.sort.recent')}</option>
              <option value="favorite">{t('projects.sort.favorite')}</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project) => (
          <Card key={project.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {project.title}
                    {project.isFavorite && (
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    )}
                  </CardTitle>
                  <CardDescription>{project.description}</CardDescription>
                </div>
                <Badge className={getStatusColor(project.status)}>
                  {t(`projects.status.${project.status}`)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {t('projects.members', { count: project.members })}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {new Date(project.lastUpdated).toLocaleDateString()}
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="ghost" size="sm">
                <Eye className="mr-2" size={16} />
                {t('projects.actions.view')}
              </Button>
              <Button variant="outline" size="sm">
                {project.isFavorite ? t('projects.actions.unfavorite') : t('projects.actions.favorite')}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Projects; 