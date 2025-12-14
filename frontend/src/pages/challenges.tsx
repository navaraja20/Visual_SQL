import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/contexts/ThemeContext';
import ThemeSelector from '@/components/ThemeSelector';
import dynamic from 'next/dynamic';
import { API_ENDPOINTS } from '@/config/api';

const SQLEditor = dynamic(() => import('@/components/SQLEditor'), { ssr: false });

interface Challenge {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  timeLimit: number; // seconds
  points: number;
  schema: string;
  expectedResult: any;
  hints: string[];
  correctQuery: string;
}

interface ChallengeAttempt {
  challengeId: string;
  completed: boolean;
  timeSpent: number;
  attempts: number;
  score: number;
  timestamp: number;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: number;
}

const CHALLENGES: Challenge[] = [
  {
    id: 'select-basic-1',
    title: 'First Steps',
    description: 'Select all employees from the employees table',
    difficulty: 'easy',
    category: 'SELECT',
    timeLimit: 60,
    points: 100,
    schema: 'employees',
    expectedResult: { rowCount: 'ANY', columns: ['id', 'name', 'position', 'salary', 'department'] },
    hints: ['Use SELECT * to get all columns', 'FROM specifies the table'],
    correctQuery: 'SELECT * FROM employees'
  },
  {
    id: 'where-filter-1',
    title: 'Filtering Data',
    description: 'Find all employees with salary greater than 70000',
    difficulty: 'easy',
    category: 'WHERE',
    timeLimit: 90,
    points: 150,
    schema: 'employees',
    expectedResult: { condition: 'salary > 70000' },
    hints: ['Use WHERE clause for filtering', 'salary > 70000'],
    correctQuery: 'SELECT * FROM employees WHERE salary > 70000'
  },
  {
    id: 'join-basic-1',
    title: 'Combining Tables',
    description: 'Join employees with departments to show employee names and their department names',
    difficulty: 'medium',
    category: 'JOIN',
    timeLimit: 180,
    points: 300,
    schema: 'employees',
    expectedResult: { hasJoin: true, columns: ['name', 'department_name'] },
    hints: ['Use INNER JOIN to combine tables', 'Match employee.department_id with department.id'],
    correctQuery: 'SELECT e.name, d.name as department_name FROM employees e INNER JOIN departments d ON e.department_id = d.id'
  },
  {
    id: 'groupby-agg-1',
    title: 'Aggregation Master',
    description: 'Count the number of employees in each department',
    difficulty: 'medium',
    category: 'GROUP BY',
    timeLimit: 150,
    points: 250,
    schema: 'employees',
    expectedResult: { hasGroupBy: true, hasCount: true },
    hints: ['Use GROUP BY with department', 'Use COUNT() to count employees'],
    correctQuery: 'SELECT department, COUNT(*) as employee_count FROM employees GROUP BY department'
  },
  {
    id: 'subquery-1',
    title: 'Subquery Challenge',
    description: 'Find employees whose salary is above the average salary',
    difficulty: 'hard',
    category: 'SUBQUERY',
    timeLimit: 240,
    points: 400,
    schema: 'employees',
    expectedResult: { hasSubquery: true },
    hints: ['Use a subquery to calculate AVG(salary)', 'WHERE salary > (SELECT AVG(salary) FROM employees)'],
    correctQuery: 'SELECT * FROM employees WHERE salary > (SELECT AVG(salary) FROM employees)'
  },
  {
    id: 'advanced-join-1',
    title: 'Multi-Table Master',
    description: 'Join employees, departments, and projects. Show employee name, department name, and project name',
    difficulty: 'hard',
    category: 'JOIN',
    timeLimit: 300,
    points: 500,
    schema: 'employees',
    expectedResult: { joinCount: 2 },
    hints: ['You need two JOIN operations', 'Link employees → departments → projects'],
    correctQuery: 'SELECT e.name, d.name as dept, p.name as project FROM employees e INNER JOIN departments d ON e.department_id = d.id INNER JOIN projects p ON d.id = p.department_id'
  }
];

const ACHIEVEMENTS: Achievement[] = [
  { id: 'first-query', title: 'First Query', description: 'Complete your first challenge', icon: '🚀', unlocked: false },
  { id: 'speed-demon', title: 'Speed Demon', description: 'Complete a challenge in under 30 seconds', icon: '⚡', unlocked: false },
  { id: 'perfect-score', title: 'Perfect Score', description: 'Complete a challenge on first attempt', icon: '💯', unlocked: false },
  { id: 'hard-mode', title: 'Hard Mode', description: 'Complete a hard difficulty challenge', icon: '🔥', unlocked: false },
  { id: 'sql-master', title: 'SQL Master', description: 'Complete all challenges', icon: '👑', unlocked: false },
  { id: 'streak-3', title: '3-Day Streak', description: 'Complete challenges on 3 consecutive days', icon: '📅', unlocked: false },
  { id: 'join-expert', title: 'Join Expert', description: 'Complete all JOIN challenges', icon: '🔗', unlocked: false },
  { id: 'speedster', title: 'Speedster', description: 'Complete 5 challenges in under 60 seconds each', icon: '🏃', unlocked: false },
];

export default function Challenges() {
  const { themeId, setThemeId, showThemeSelector, setShowThemeSelector } = useTheme();
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [query, setQuery] = useState('');
  const [executing, setExecuting] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [startTime, setStartTime] = useState(0);
  const [result, setResult] = useState<any>(null);
  const [attempts, setAttempts] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [hintIndex, setHintIndex] = useState(0);
  const [challengeAttempts, setChallengeAttempts] = useState<ChallengeAttempt[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>(ACHIEVEMENTS);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [newAchievement, setNewAchievement] = useState<Achievement | null>(null);

  useEffect(() => {
    loadProgress();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setTimerActive(false);
            handleTimeout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive, timeRemaining]);

  const loadProgress = () => {
    const saved = localStorage.getItem('challengeAttempts');
    if (saved) {
      setChallengeAttempts(JSON.parse(saved));
    }

    const savedAchievements = localStorage.getItem('achievements');
    if (savedAchievements) {
      setAchievements(JSON.parse(savedAchievements));
    }
  };

  const saveProgress = (newAttempts: ChallengeAttempt[]) => {
    localStorage.setItem('challengeAttempts', JSON.stringify(newAttempts));
    setChallengeAttempts(newAttempts);
  };

  const startChallenge = (challenge: Challenge) => {
    setSelectedChallenge(challenge);
    setQuery('');
    setTimeRemaining(challenge.timeLimit);
    setTimerActive(true);
    setStartTime(Date.now());
    setAttempts(0);
    setResult(null);
    setShowHint(false);
    setHintIndex(0);
  };

  const handleTimeout = () => {
    alert('Time\'s up! Challenge failed.');
    setSelectedChallenge(null);
  };

  const executeQuery = async () => {
    if (!selectedChallenge || executing) return;

    setExecuting(true);
    setAttempts(prev => prev + 1);

    try {
      const response = await fetch(API_ENDPOINTS.query, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: query.trim(),
          schema: selectedChallenge.schema,
        }),
      });

      const data = await response.json();

      if (data.error) {
        setResult({ success: false, error: data.error });
        return;
      }

      // Check if query is correct
      const isCorrect = validateQuery(data, selectedChallenge);

      if (isCorrect) {
        const timeSpent = Math.floor((Date.now() - startTime) / 1000);
        const speedBonus = Math.max(0, selectedChallenge.timeLimit - timeSpent);
        const attemptPenalty = Math.max(0, (attempts - 1) * 50);
        const finalScore = Math.max(50, selectedChallenge.points + speedBonus - attemptPenalty);

        setResult({
          success: true,
          score: finalScore,
          timeSpent,
          attempts: attempts + 1,
        });

        setTimerActive(false);
        saveAttempt(selectedChallenge.id, true, timeSpent, attempts + 1, finalScore);
        checkAchievements(selectedChallenge, timeSpent, attempts + 1);
      } else {
        setResult({ success: false, error: 'Query result doesn\'t match expected output. Try again!' });
      }
    } catch (error) {
      setResult({ success: false, error: 'Failed to execute query' });
    } finally {
      setExecuting(false);
    }
  };

  const validateQuery = (data: any, challenge: Challenge): boolean => {
    // Simple validation logic - can be enhanced
    const lastStep = data.steps[data.steps.length - 1];
    const rows = lastStep?.resultTable?.rows || [];

    if (challenge.expectedResult.rowCount && challenge.expectedResult.rowCount !== 'ANY') {
      if (rows.length !== challenge.expectedResult.rowCount) return false;
    }

    if (challenge.expectedResult.hasJoin) {
      const queryUpper = query.toUpperCase();
      if (!queryUpper.includes('JOIN')) return false;
    }

    if (challenge.expectedResult.hasGroupBy) {
      const queryUpper = query.toUpperCase();
      if (!queryUpper.includes('GROUP BY')) return false;
    }

    if (challenge.expectedResult.hasSubquery) {
      const queryUpper = query.toUpperCase();
      const matches = queryUpper.match(/\(/g);
      if (!matches || matches.length < 2) return false;
    }

    return true;
  };

  const saveAttempt = (challengeId: string, completed: boolean, timeSpent: number, attempts: number, score: number) => {
    const existing = challengeAttempts.find(a => a.challengeId === challengeId);
    
    if (existing) {
      if (!existing.completed || score > existing.score) {
        const updated = challengeAttempts.map(a =>
          a.challengeId === challengeId
            ? { ...a, completed, timeSpent, attempts, score, timestamp: Date.now() }
            : a
        );
        saveProgress(updated);
      }
    } else {
      const newAttempt: ChallengeAttempt = {
        challengeId,
        completed,
        timeSpent,
        attempts,
        score,
        timestamp: Date.now(),
      };
      saveProgress([...challengeAttempts, newAttempt]);
    }
  };

  const checkAchievements = (challenge: Challenge, timeSpent: number, attemptCount: number) => {
    const newUnlocked: Achievement[] = [];

    // First Query
    if (!achievements.find(a => a.id === 'first-query')?.unlocked && challengeAttempts.length === 0) {
      unlockAchievement('first-query');
      newUnlocked.push(achievements.find(a => a.id === 'first-query')!);
    }

    // Speed Demon
    if (!achievements.find(a => a.id === 'speed-demon')?.unlocked && timeSpent < 30) {
      unlockAchievement('speed-demon');
      newUnlocked.push(achievements.find(a => a.id === 'speed-demon')!);
    }

    // Perfect Score
    if (!achievements.find(a => a.id === 'perfect-score')?.unlocked && attemptCount === 1) {
      unlockAchievement('perfect-score');
      newUnlocked.push(achievements.find(a => a.id === 'perfect-score')!);
    }

    // Hard Mode
    if (!achievements.find(a => a.id === 'hard-mode')?.unlocked && challenge.difficulty === 'hard') {
      unlockAchievement('hard-mode');
      newUnlocked.push(achievements.find(a => a.id === 'hard-mode')!);
    }

    // SQL Master
    const completedCount = challengeAttempts.filter(a => a.completed).length + 1;
    if (!achievements.find(a => a.id === 'sql-master')?.unlocked && completedCount === CHALLENGES.length) {
      unlockAchievement('sql-master');
      newUnlocked.push(achievements.find(a => a.id === 'sql-master')!);
    }

    if (newUnlocked.length > 0) {
      setNewAchievement(newUnlocked[0]);
      setTimeout(() => setNewAchievement(null), 5000);
    }
  };

  const unlockAchievement = (achievementId: string) => {
    const updated = achievements.map(a =>
      a.id === achievementId
        ? { ...a, unlocked: true, unlockedAt: Date.now() }
        : a
    );
    setAchievements(updated);
    localStorage.setItem('achievements', JSON.stringify(updated));
  };

  const getTotalScore = () => {
    return challengeAttempts.reduce((sum, a) => sum + (a.completed ? a.score : 0), 0);
  };

  const getCompletedCount = () => {
    return challengeAttempts.filter(a => a.completed).length;
  };

  const getChallengeStatus = (challengeId: string) => {
    return challengeAttempts.find(a => a.challengeId === challengeId);
  };

  const difficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400';
      case 'medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'hard': return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400';
      default: return '';
    }
  };

  return (
    <>
      <Head>
        <title>SQL Challenges - VisualSQL</title>
      </Head>

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link href="/" className="flex items-center gap-3">
                  <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    VisualSQL
                  </span>
                </Link>
                <nav className="flex items-center space-x-4">
                  <Link href="/modules" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
                    Modules
                  </Link>
                  <Link href="/dashboard" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
                    Dashboard
                  </Link>
                  <Link href="/challenges" className="text-blue-600 dark:text-blue-400 font-semibold">
                    Challenges
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
              </div>
            </div>
          </div>
        </header>

        {/* Achievement Notification */}
        <AnimatePresence>
          {newAchievement && (
            <motion.div
              initial={{ opacity: 0, y: -100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -100 }}
              className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50"
            >
              <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-8 py-4 rounded-full shadow-2xl flex items-center gap-3">
                <span className="text-3xl">{newAchievement.icon}</span>
                <div>
                  <div className="font-bold">Achievement Unlocked!</div>
                  <div className="text-sm">{newAchievement.title}</div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Stats Bar */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
          >
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{getCompletedCount()}/{CHALLENGES.length}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Completed</div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{getTotalScore()}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Total Points</div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{achievements.filter(a => a.unlocked).length}/{achievements.length}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Achievements</div>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowLeaderboard(!showLeaderboard)}
              className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white rounded-xl p-6 shadow-sm transition-all"
            >
              <div className="flex items-center gap-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
                <div className="text-left">
                  <div className="font-bold">Leaderboard</div>
                  <div className="text-sm opacity-90">View Rankings</div>
                </div>
              </div>
            </button>
          </motion.div>

          {/* Challenge View or List */}
          {selectedChallenge ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{selectedChallenge.title}</h2>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${difficultyColor(selectedChallenge.difficulty)}`}>
                      {selectedChallenge.difficulty}
                    </span>
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400">
                      {selectedChallenge.points} pts
                    </span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">{selectedChallenge.description}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className={`text-3xl font-bold ${timeRemaining < 30 ? 'text-red-600' : 'text-blue-600 dark:text-blue-400'}`}>
                      {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Time Left</div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedChallenge(null);
                      setTimerActive(false);
                    }}
                    className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
                    title="Exit Challenge"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Editor */}
              <div className="mb-4">
                <SQLEditor value={query} onChange={setQuery} />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 mb-4">
                <button
                  onClick={executeQuery}
                  disabled={executing || !query.trim()}
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-lg hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {executing ? 'Running...' : 'Submit Solution'}
                </button>
                <button
                  onClick={() => {
                    setShowHint(true);
                    if (hintIndex < selectedChallenge.hints.length - 1) {
                      setHintIndex(prev => prev + 1);
                    }
                  }}
                  className="px-6 py-3 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-lg hover:bg-yellow-200 dark:hover:bg-yellow-900/50"
                  disabled={hintIndex >= selectedChallenge.hints.length}
                >
                  Show Hint ({hintIndex + 1}/{selectedChallenge.hints.length})
                </button>
                <div className="flex-1 text-right">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Attempts: {attempts}
                  </span>
                </div>
              </div>

              {/* Hints */}
              {showHint && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 rounded"
                >
                  <div className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">{selectedChallenge.hints[hintIndex]}</p>
                  </div>
                </motion.div>
              )}

              {/* Result */}
              {result && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`p-6 rounded-lg ${
                    result.success
                      ? 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-500'
                      : 'bg-red-50 dark:bg-red-900/20 border-2 border-red-500'
                  }`}
                >
                  {result.success ? (
                    <div className="text-center">
                      <div className="text-6xl mb-4">🎉</div>
                      <h3 className="text-2xl font-bold text-green-700 dark:text-green-400 mb-2">
                        Challenge Complete!
                      </h3>
                      <div className="text-4xl font-bold text-green-600 dark:text-green-300 mb-4">
                        +{result.score} Points
                      </div>
                      <div className="flex items-center justify-center gap-8 text-sm text-gray-700 dark:text-gray-300">
                        <div>
                          <div className="font-semibold">Time</div>
                          <div>{result.timeSpent}s</div>
                        </div>
                        <div>
                          <div className="font-semibold">Attempts</div>
                          <div>{result.attempts}</div>
                        </div>
                      </div>
                      <button
                        onClick={() => setSelectedChallenge(null)}
                        className="mt-6 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-purple-700"
                      >
                        Continue
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-start gap-2">
                        <svg className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                          <h4 className="font-bold text-red-700 dark:text-red-400 mb-1">Incorrect</h4>
                          <p className="text-sm text-red-600 dark:text-red-300">{result.error}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </motion.div>
          ) : (
            <>
              {/* Challenge List */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
              >
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Available Challenges</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {CHALLENGES.map((challenge) => {
                    const status = getChallengeStatus(challenge.id);
                    return (
                      <motion.div
                        key={challenge.id}
                        whileHover={{ scale: 1.02 }}
                        className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border-2 transition-all ${
                          status?.completed
                            ? 'border-green-500'
                            : 'border-transparent hover:border-blue-500'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-1">
                              {challenge.title}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                              {challenge.description}
                            </p>
                          </div>
                          {status?.completed && (
                            <svg className="w-6 h-6 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          )}
                        </div>

                        <div className="flex items-center gap-2 mb-4">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${difficultyColor(challenge.difficulty)}`}>
                            {challenge.difficulty}
                          </span>
                          <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                            {challenge.category}
                          </span>
                          <span className="px-2 py-1 rounded text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400">
                            {challenge.points} pts
                          </span>
                        </div>

                        {status?.completed && (
                          <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                            <div>Score: {status.score} pts</div>
                            <div>Time: {status.timeSpent}s</div>
                          </div>
                        )}

                        <button
                          onClick={() => startChallenge(challenge)}
                          className="w-full px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-purple-700"
                        >
                          {status?.completed ? 'Retry' : 'Start Challenge'}
                        </button>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>

              {/* Achievements */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Achievements</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {achievements.map((achievement) => (
                    <motion.div
                      key={achievement.id}
                      whileHover={{ scale: achievement.unlocked ? 1.05 : 1 }}
                      className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 text-center ${
                        achievement.unlocked
                          ? 'border-2 border-yellow-500'
                          : 'opacity-50 grayscale'
                      }`}
                    >
                      <div className="text-4xl mb-2">{achievement.icon}</div>
                      <h4 className="font-bold text-sm text-gray-900 dark:text-gray-100 mb-1">
                        {achievement.title}
                      </h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {achievement.description}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </>
          )}
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
