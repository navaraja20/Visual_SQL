import Link from 'next/link';
import { useEffect, useState } from 'react';
import Head from 'next/head';
import { motion } from 'framer-motion';
import { useTheme } from '@/contexts/ThemeContext';

interface Module {
  id: string;
  title: string;
  category: string;
  difficulty: string;
  order: number;
  description: string;
}

export default function HomePage() {
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const { themeId, toggleTheme } = useTheme();

  useEffect(() => {
    fetchModules();
  }, []);

  const fetchModules = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/modules`);
      const data = await response.json();
      setModules(data);
    } catch (error) {
      console.error('Error fetching modules:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryModules = (category: string) => {
    return modules.filter(m => m.category === category).sort((a, b) => a.order - b.order);
  };

  const categories = [
    { id: 'basics', name: 'SQL Basics', color: 'bg-blue-500' },
    { id: 'filtering', name: 'Filtering & Conditions', color: 'bg-green-500' },
    { id: 'joins', name: 'Joins', color: 'bg-purple-500' },
    { id: 'aggregation', name: 'Aggregation', color: 'bg-orange-500' },
    { id: 'subqueries', name: 'Subqueries', color: 'bg-red-500' },
    { id: 'advanced', name: 'Advanced Topics', color: 'bg-indigo-500' },
  ];

  return (
    <>
      <Head>
        <title>VisualSQL - Learn SQL Through Interactive Visualizations</title>
        <meta name="description" content="Master SQL from beginner to advanced with step-by-step visual animations" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg sm:text-xl">VS</span>
                </div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
                  VisualSQL
                </h1>
              </div>
              <nav className="flex items-center gap-2 sm:space-x-4">
                <Link href="/" className="text-sm sm:text-base text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium hidden sm:inline">
                  Home
                </Link>
                <Link href="/modules" className="text-sm sm:text-base text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium">
                  <span className="hidden sm:inline">Modules</span>
                  <span className="sm:hidden">Learn</span>
                </Link>
                <Link href="/practice" className="text-sm sm:text-base text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium">
                  Practice
                </Link>
                <button
                  onClick={toggleTheme}
                  className="p-1.5 sm:p-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
                  title={`Switch to ${themeId === 'light' ? 'dark' : 'light'} mode`}
                >
                  {themeId === 'light' ? (
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  )}
                </button>
              </nav>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-8 sm:py-12 lg:py-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-gray-100 mb-4 sm:mb-6">
              Learn SQL Through
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                Interactive Visualizations
              </span>
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-300 mb-6 sm:mb-8 max-w-3xl mx-auto px-4">
              Master SQL from absolute beginner to advanced with step-by-step visual animations. 
              See exactly how queries execute, understand joins, aggregations, and more.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 px-4">
              <Link
                href="/modules"
                className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all text-sm sm:text-base"
              >
                Start Learning
              </Link>
              <Link
                href="/practice"
                className="px-6 sm:px-8 py-3 sm:py-4 bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all border-2 border-blue-600 dark:border-blue-500 text-sm sm:text-base"
              >
                Practice Problems
              </Link>
            </div>
          </motion.div>
        </section>

        {/* Features */}
        <section className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-8 sm:py-12 lg:py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            <motion.div
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Visual Learning</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Watch step-by-step animations showing exactly how SQL queries execute, making complex concepts crystal clear.
              </p>
            </motion.div>

            <motion.div
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Interactive Playground</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Write and execute real SQL queries on sample databases. Experiment freely and learn by doing.
              </p>
            </motion.div>

            <motion.div
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Practice & Master</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Test your knowledge with exercises and quizzes. Get instant feedback and track your progress.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Module Categories Preview */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8 text-center">Learning Path</h2>
          
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="space-y-6">
              {categories.map((category, idx) => {
                const categoryModules = getCategoryModules(category.id);
                if (categoryModules.length === 0) return null;
                
                return (
                  <motion.div
                    key={category.id}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <div className="flex items-center mb-4">
                      <div className={`w-3 h-3 ${category.color} rounded-full mr-3`}></div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{category.name}</h3>
                      <span className="ml-auto text-sm text-gray-500 dark:text-gray-400">{categoryModules.length} modules</span>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {categoryModules.map((module) => (
                        <Link
                          key={module.id}
                          href={`/modules/${module.id}`}
                          className="block p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-md transition-all"
                        >
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">{module.title}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{module.description}</p>
                          <div className="mt-2">
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              module.difficulty === 'beginner' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                              module.difficulty === 'intermediate' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' :
                              'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                            }`}>
                              {module.difficulty}
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-white mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-2">VisualSQL</h3>
              <p className="text-gray-400 mb-4">Learn SQL through interactive visualizations</p>
              <p className="text-sm text-gray-500">© 2024 VisualSQL. Educational platform for SQL learning.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
