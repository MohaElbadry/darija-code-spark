import React, { useEffect, useState } from 'react';
import { Star, Users, Award, GitBranch, User, Zap, BookOpen, Github, Twitter, Linkedin, Mail } from 'lucide-react';

const contributionData = [4, 2, 0, 3, 5, 1, 0, 2, 4, 3, 5, 2, 1, 0, 3, 4, 2, 5, 1, 0, 2, 3, 4, 1, 0, 2, 5, 3, 1, 4];

const pinnedProjects = [
  {
    name: 'Darija Dictionary',
    description: 'A collaborative open-source Darija dictionary for developers.',
    stars: 120,
    forks: 30,
    language: 'TypeScript',
    color: 'bg-blue-500',
    url: '#',
  },
  {
    name: 'Code Spark Blog',
    description: 'A blog platform for sharing coding tips in Darija.',
    stars: 85,
    forks: 18,
    language: 'JavaScript',
    color: 'bg-yellow-400',
    url: '#',
  },
  {
    name: 'AI Mentor Bot',
    description: 'An AI-powered mentor for code review and advice.',
    stars: 99,
    forks: 22,
    language: 'Python',
    color: 'bg-green-500',
    url: '#',
  },
];

const badges = [
  { label: 'Top Contributor', icon: <Zap className="h-4 w-4" />, color: 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200' },
  { label: 'Blogger', icon: <BookOpen className="h-4 w-4" />, color: 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200' },
  { label: 'Open Source', icon: <GitBranch className="h-4 w-4" />, color: 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200' },
];

const Profile: React.FC = () => {
  const [tab, setTab] = useState<'overview' | 'repositories' | 'achievements'>('overview');

  useEffect(() => {
    document.documentElement.classList.remove('dark');
  }, []);

  return (
    <div className="max-w-3xl mx-auto mt-10">
      {/* Tabs */}
      <div className="flex gap-2 mb-4 border-b border-gray-200 dark:border-gray-700">
        <button
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab === 'overview' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-blue-600'}`}
          onClick={() => setTab('overview')}
        >
          Overview
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab === 'repositories' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-blue-600'}`}
          onClick={() => setTab('repositories')}
        >
          Repositories
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab === 'achievements' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-blue-600'}`}
          onClick={() => setTab('achievements')}
        >
          Achievements
        </button>
      </div>

      {/* Main Card */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow border border-gray-200 dark:border-gray-700">
        {/* Avatar, Username, Bio */}
        <div className="flex items-center gap-6 mb-6">
          <img
            src="https://randomuser.me/api/portraits/men/32.jpg"
            alt="User Avatar"
            className="w-20 h-20 rounded-full border border-gray-300 dark:border-gray-700"
          />
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              Karim El Dev
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">@karimdev</p>
            <p className="mt-2 text-gray-700 dark:text-gray-300 text-sm">
              Building tools for the Darija dev community. Love open source, coffee, and memes.
            </p>
            <div className="flex gap-2 mt-2">
              <a href="https://github.com/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-900 dark:hover:text-white"><Github className="h-4 w-4" /></a>
              <a href="https://twitter.com/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-400"><Twitter className="h-4 w-4" /></a>
              <a href="https://linkedin.com/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-700"><Linkedin className="h-4 w-4" /></a>
              <a href="mailto:karim@dev.com" className="text-gray-400 hover:text-pink-500"><Mail className="h-4 w-4" /></a>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="flex gap-6 mb-6 text-xs text-gray-600 dark:text-gray-300">
          <div className="flex items-center gap-1"><Users className="h-4 w-4" /> <span>1.2k followers</span></div>
          <div className="flex items-center gap-1"><Users className="h-4 w-4" /> <span>320 following</span></div>
          <div className="flex items-center gap-1"><Star className="h-4 w-4" /> <span>28 stars</span></div>
          <div className="flex items-center gap-1"><Award className="h-4 w-4" /> <span>42 contributions</span></div>
        </div>

        {/* Tab Content */}
        {tab === 'overview' && (
          <>
            <div className="mb-6">
              <h2 className="text-base font-semibold mb-2 text-gray-900 dark:text-white">Contribution Activity</h2>
              <div className="flex gap-1 flex-wrap bg-gray-50 dark:bg-gray-900/30 p-3 rounded border border-gray-200 dark:border-gray-700">
                {contributionData.map((val, idx) => (
                  <div
                    key={idx}
                    className={`w-4 h-4 rounded ${val === 0 ? 'bg-gray-300 dark:bg-gray-700' : val === 1 ? 'bg-green-200' : val === 2 ? 'bg-green-400' : val === 3 ? 'bg-green-500' : val === 4 ? 'bg-green-600' : 'bg-green-800'} transition-all`}
                    title={`${val} contributions`}
                  ></div>
                ))}
              </div>
              <div className="flex gap-2 mt-2 text-xs text-gray-400">
                <span className="flex items-center gap-1"><span className="w-3 h-3 bg-gray-300 dark:bg-gray-700 rounded"></span>0</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 bg-green-200 rounded"></span>1</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 bg-green-400 rounded"></span>2</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 bg-green-500 rounded"></span>3</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 bg-green-600 rounded"></span>4</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 bg-green-800 rounded"></span>5+</span>
              </div>
            </div>
            <div className="mb-2">
              <h2 className="text-base font-semibold mb-2 text-gray-900 dark:text-white">Badges</h2>
              <div className="flex gap-2 flex-wrap">
                {badges.map((badge, idx) => (
                  <span key={idx} className={`inline-flex items-center gap-1 px-3 py-1 rounded text-xs font-medium ${badge.color}`}>{badge.icon} {badge.label}</span>
                ))}
              </div>
            </div>
          </>
        )}
        {tab === 'repositories' && (
          <div>
            <h2 className="text-base font-semibold mb-2 text-gray-900 dark:text-white flex items-center gap-2"><GitBranch className="h-4 w-4 text-blue-500" /> Repositories</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pinnedProjects.map((project, idx) => (
                <a key={idx} href={project.url} target="_blank" rel="noopener noreferrer" className="border border-gray-200 dark:border-gray-700 rounded p-3 bg-gray-50 dark:bg-gray-900/30 hover:border-blue-400 transition flex flex-col gap-1 group">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`w-2 h-2 rounded-full ${project.color}`}></span>
                    <span className="font-semibold text-sm group-hover:text-blue-600 transition-colors">{project.name}</span>
                  </div>
                  <p className="mb-1 text-xs text-gray-600 dark:text-gray-300">{project.description}</p>
                  <div className="flex gap-3 text-xs">
                    <span className="flex items-center gap-1 text-amber-600"><Star className="h-3 w-3" />{project.stars}</span>
                    <span className="flex items-center gap-1 text-indigo-600"><GitBranch className="h-3 w-3" />{project.forks}</span>
                    <span className="flex items-center gap-1 text-gray-500 dark:text-gray-300">{project.language}</span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
        {tab === 'achievements' && (
          <div>
            <h2 className="text-base font-semibold mb-2 text-gray-900 dark:text-white flex items-center gap-2"><Award className="h-4 w-4 text-blue-500" /> Achievements</h2>
            <div className="flex gap-2 flex-wrap mb-4">
              {badges.map((badge, idx) => (
                <span key={idx} className={`inline-flex items-center gap-1 px-3 py-1 rounded text-xs font-medium ${badge.color}`}>{badge.icon} {badge.label}</span>
              ))}
            </div>
            <div className="flex gap-6 text-xs text-gray-600 dark:text-gray-300">
              <div className="flex items-center gap-1"><Users className="h-4 w-4" /> <span>1.2k followers</span></div>
              <div className="flex items-center gap-1"><Users className="h-4 w-4" /> <span>320 following</span></div>
              <div className="flex items-center gap-1"><Star className="h-4 w-4" /> <span>28 stars</span></div>
              <div className="flex items-center gap-1"><Award className="h-4 w-4" /> <span>42 contributions</span></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile; 