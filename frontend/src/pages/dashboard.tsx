import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTheme } from '@/contexts/ThemeContext';
import ThemeSelector from '@/components/ThemeSelector';

interface ModuleProgress {
  moduleId: string;
  moduleName: string;
  category: string;
  completed: boolean;
  lastVisited: number;
  timeSpent: number;
  queriesExecuted: number;
  successfulQueries: number;
  errorCount: number;
}

interface LearningStats {
  totalModulesCompleted: number;
  totalTimeSpent: number;
  totalQueriesExecuted: number;
  successRate: number;
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string;
}

export default function Dashboard() {
  const { themeId, setThemeId, toggleTheme, showThemeSelector, setShowThemeSelector } = useTheme();
  const [moduleProgress, setModuleProgress] = useState<ModuleProgress[]>([]);
  const [stats, setStats] = useState<LearningStats>({
    totalModulesCompleted: 0,
    totalTimeSpent: 0,
    totalQueriesExecuted: 0,
    successRate: 0,
    currentStreak: 0,
    longestStreak: 0,
    lastActiveDate: '',
  });

  useEffect(() => {
    loadProgress();
    calculateStats();
  }, []);

  const loadProgress = () => {
    const saved = localStorage.getItem('moduleProgress');
    if (saved) {
      setModuleProgress(JSON.parse(saved));
    }
  };

  const calculateStats = () => {
    const saved = localStorage.getItem('moduleProgress');
    if (!saved) return;

    const progress: ModuleProgress[] = JSON.parse(saved);
    
    const totalCompleted = progress.filter(p => p.completed).length;
    const totalTime = progress.reduce((sum, p) => sum + p.timeSpent, 0);
    const totalQueries = progress.reduce((sum, p) => sum + p.queriesExecuted, 0);
    const successfulQueries = progress.reduce((sum, p) => sum + p.successfulQueries, 0);
    const successRate = totalQueries > 0 ? (successfulQueries / totalQueries) * 100 : 0;

    // Calculate streak
    const activityDates = progress
      .filter(p => p.lastVisited)
      .map(p => new Date(p.lastVisited).toDateString())
      .sort();
    
    const uniqueDates = [...new Set(activityDates)];
    let currentStreak = 0;
    let longestStreak = 0;
    let streak = 0;

    const today = new Date().toDateString();
    for (let i = uniqueDates.length - 1; i >= 0; i--) {
      const date = new Date(uniqueDates[i]);
      const expectedDate = new Date();
      expectedDate.setDate(expectedDate.getDate() - streak);
      
      if (date.toDateString() === expectedDate.toDateString()) {
        streak++;
        if (uniqueDates[i] === today) {
          currentStreak = streak;
        }
      } else {
        break;
      }
      longestStreak = Math.max(longestStreak, streak);
    }

    setStats({
      totalModulesCompleted: totalCompleted,
      totalTimeSpent: totalTime,
      totalQueriesExecuted: totalQueries,
      successRate: Math.round(successRate),
      currentStreak,
      longestStreak,
      lastActiveDate: progress.length > 0 ? new Date(Math.max(...progress.map(p => p.lastVisited))).toLocaleDateString() : 'N/A',
    });
  };

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      basics: 'from-blue-500 to-cyan-500',
      filtering: 'from-orange-500 to-red-500',
      joins: 'from-purple-500 to-pink-500',
      aggregation: 'from-green-500 to-emerald-500',
      advanced: 'from-indigo-500 to-violet-500',
    };
    return colors[category] || 'from-gray-500 to-slate-500';
  };

  const getStrengthWeakness = () => {
    if (moduleProgress.length === 0) return { strengths: [], weaknesses: [] };

    const byCategory = moduleProgress.reduce((acc, module) => {
      if (!acc[module.category]) {
        acc[module.category] = { successRate: 0, count: 0, total: 0 };
      }
      if (module.queriesExecuted > 0) {
        acc[module.category].successRate += (module.successfulQueries / module.queriesExecuted) * 100;
        acc[module.category].count++;
        acc[module.category].total += module.queriesExecuted;
      }
      return acc;
    }, {} as Record<string, { successRate: number; count: number; total: number }>);

    const categories = Object.entries(byCategory)
      .filter(([_, data]) => data.count > 0)
      .map(([name, data]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        avgSuccessRate: data.successRate / data.count,
        queriesExecuted: data.total,
      }))
      .sort((a, b) => b.avgSuccessRate - a.avgSuccessRate);

    return {
      strengths: categories.slice(0, 2),
      weaknesses: categories.slice(-2).reverse(),
    };
  };

  const analysis = getStrengthWeakness();

  return (
    <>
      <Head>
        <title>Learning Dashboard - VisualSQL</title>
      </Head>

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  VisualSQL
                </Link>
                <nav className="flex items-center space-x-4">
                  <Link href="/modules" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
                    Modules
                  </Link>
                  <Link href="/dashboard" className="text-blue-600 dark:text-blue-400 font-semibold">
                    Dashboard
                  </Link>
                </nav>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowThemeSelector(true)}
                  className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600"
                  title="Choose Theme"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                  </svg>
                </button>
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200"
                >
                  {themeId === 'light' ? '🌙' : '☀️'}
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Page Title */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Your Learning Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Track your progress and improve your SQL skills
            </p>
          </motion.div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl p-6 text-white shadow-lg"
            >
              <div className="flex items-center justify-between mb-2">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-3xl font-bold">{stats.totalModulesCompleted}</span>
              </div>
              <h3 className="text-sm font-semibold opacity-90">Modules Completed</h3>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl p-6 text-white shadow-lg"
            >
              <div className="flex items-center justify-between mb-2">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span className="text-3xl font-bold">{stats.totalQueriesExecuted}</span>
              </div>
              <h3 className="text-sm font-semibold opacity-90">Queries Executed</h3>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl p-6 text-white shadow-lg"
            >
              <div className="flex items-center justify-between mb-2">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span className="text-3xl font-bold">{stats.successRate}%</span>
              </div>
              <h3 className="text-sm font-semibold opacity-90">Success Rate</h3>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gradient-to-br from-orange-500 to-red-500 rounded-xl p-6 text-white shadow-lg"
            >
              <div className="flex items-center justify-between mb-2">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
                </svg>
                <span className="text-3xl font-bold">{stats.currentStreak}</span>
              </div>
              <h3 className="text-sm font-semibold opacity-90">Day Streak 🔥</h3>
            </motion.div>
          </div>

          {/* Progress and Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Strengths & Weaknesses */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
            >
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Performance Analysis
              </h2>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-green-600 dark:text-green-400 mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Strengths
                  </h3>
                  {analysis.strengths.length > 0 ? (
                    analysis.strengths.map((category, idx) => (
                      <div key={idx} className="flex items-center justify-between mb-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <span className="font-medium text-gray-900 dark:text-gray-100">{category.name}</span>
                        <span className="text-green-600 dark:text-green-400 font-bold">{Math.round(category.avgSuccessRate)}%</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 text-sm">No data yet. Start practicing!</p>
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-orange-600 dark:text-orange-400 mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    Areas to Improve
                  </h3>
                  {analysis.weaknesses.length > 0 ? (
                    analysis.weaknesses.map((category, idx) => (
                      <div key={idx} className="flex items-center justify-between mb-2 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                        <span className="font-medium text-gray-900 dark:text-gray-100">{category.name}</span>
                        <span className="text-orange-600 dark:text-orange-400 font-bold">{Math.round(category.avgSuccessRate)}%</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 text-sm">No weaknesses detected yet!</p>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Activity Summary */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
            >
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Activity Summary
              </h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Total Time Spent</p>
                      <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{formatTime(stats.totalTimeSpent)}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Last Active</p>
                      <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{stats.lastActiveDate}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Longest Streak</p>
                      <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{stats.longestStreak} days 🏆</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Module Progress List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Module Progress
            </h2>

            {moduleProgress.length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-700 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">No progress yet</p>
                <p className="text-gray-400 dark:text-gray-500 text-sm mb-4">Start learning to track your progress!</p>
                <Link href="/modules" className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all inline-block">
                  Browse Modules
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {moduleProgress
                  .sort((a, b) => b.lastVisited - a.lastVisited)
                  .map((module, idx) => (
                    <Link key={idx} href={`/modules/${module.moduleId}`}>
                      <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md hover:border-blue-500 dark:hover:border-blue-500 transition-all cursor-pointer">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <div className={`w-2 h-2 rounded-full ${module.completed ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`} />
                              <h3 className="font-bold text-gray-900 dark:text-gray-100">{module.moduleName}</h3>
                              <span className={`text-xs px-2 py-1 rounded-full bg-gradient-to-r ${getCategoryColor(module.category)} text-white`}>
                                {module.category}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 ml-5">
                              <span className="flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                {module.queriesExecuted} queries
                              </span>
                              <span className="flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {formatTime(module.timeSpent)}
                              </span>
                              {module.queriesExecuted > 0 && (
                                <span className={`font-semibold ${
                                  (module.successfulQueries / module.queriesExecuted) * 100 >= 70
                                    ? 'text-green-600 dark:text-green-400'
                                    : 'text-orange-600 dark:text-orange-400'
                                }`}>
                                  {Math.round((module.successfulQueries / module.queriesExecuted) * 100)}% success
                                </span>
                              )}
                            </div>
                          </div>
                          {module.completed && (
                            <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* Theme Selector */}
        <ThemeSelector
          isOpen={showThemeSelector}
          onClose={() => setShowThemeSelector(false)}
          currentTheme={themeId}
          onThemeChange={setThemeId}
        />
      </div>
    </>
  );
}
