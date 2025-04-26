import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Coffee, Users, Calendar, Clock, MapPin, Video, Search, Star, MessageSquare, Code2, Globe } from 'lucide-react';
import { Input } from '../components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { useLanguage } from '../contexts/LanguageContext';

const CoffeeAndCode: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <main className="flex-1 p-4 md:p-6 container mx-auto">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <Coffee className="h-8 w-8 text-amber-600" />
            <h1 className="text-3xl font-bold">{t('coffee.sessions')}</h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Upcoming Sessions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  {t('coffee.upcoming_sessions')}
                </CardTitle>
                <CardDescription>
                  {t('coffee.join_description')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">{t('coffee.python_intro')}</h3>
                    <span className="text-sm text-muted-foreground">{t('coffee.today_7pm')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{t('coffee.participants_count', { count: 12 })}</span>
                    <MapPin className="h-4 w-4 ml-2" />
                    <span>{t('coffee.virtual')}</span>
                  </div>
                  <Button className="w-full mt-3" variant="outline">
                    <Video className="h-4 w-4 mr-2" />
                    {t('coffee.join_session')}
                  </Button>
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">{t('coffee.web_dev_basics')}</h3>
                    <span className="text-sm text-muted-foreground">{t('coffee.tomorrow_6pm')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{t('coffee.participants_count', { count: 8 })}</span>
                    <MapPin className="h-4 w-4 ml-2" />
                    <span>{t('coffee.virtual')}</span>
                  </div>
                  <Button className="w-full mt-3" variant="outline">
                    <Video className="h-4 w-4 mr-2" />
                    {t('coffee.join_session')}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Session Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  {t('coffee.session_details')}
                </CardTitle>
                <CardDescription>
                  {t('coffee.session_expectations')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h3 className="font-semibold">{t('coffee.format')}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t('coffee.format_description')}
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold">{t('coffee.requirements')}</h3>
                  <ul className="text-sm text-muted-foreground list-disc list-inside">
                    <li>{t('coffee.requirement_basic')}</li>
                    <li>{t('coffee.requirement_laptop')}</li>
                    <li>{t('coffee.requirement_internet')}</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold">{t('coffee.benefits')}</h3>
                  <ul className="text-sm text-muted-foreground list-disc list-inside">
                    <li>{t('coffee.benefit_learn')}</li>
                    <li>{t('coffee.benefit_feedback')}</li>
                    <li>{t('coffee.benefit_network')}</li>
                    <li>{t('coffee.benefit_practice')}</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Mentors Section */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                {t('coffee.find_mentor')}
              </CardTitle>
              <CardDescription>
                {t('coffee.mentor_description')}
              </CardDescription>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t('coffee.search_mentors')}
                  className="pl-10"
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Mentor Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Mentor 1 */}
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src="https://github.com/shadcn.png" />
                      <AvatarFallback>JD</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">{t('coffee.mentor_john')}</h3>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span className="text-sm">4.9</span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{t('coffee.mentor_john_title')}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Code2 className="h-4 w-4" />
                        <span className="text-sm">{t('coffee.mentor_john_skills')}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Globe className="h-4 w-4" />
                        <span className="text-sm">{t('coffee.mentor_john_languages')}</span>
                      </div>
                      <Button className="w-full mt-3" variant="outline">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        {t('coffee.contact_mentor')}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Mentor 2 */}
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src="https://github.com/shadcn.png" />
                      <AvatarFallback>SA</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">{t('coffee.mentor_sarah')}</h3>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span className="text-sm">4.8</span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{t('coffee.mentor_sarah_title')}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Code2 className="h-4 w-4" />
                        <span className="text-sm">{t('coffee.mentor_sarah_skills')}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Globe className="h-4 w-4" />
                        <span className="text-sm">{t('coffee.mentor_sarah_languages')}</span>
                      </div>
                      <Button className="w-full mt-3" variant="outline">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        {t('coffee.contact_mentor')}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default CoffeeAndCode; 