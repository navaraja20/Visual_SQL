import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useTheme } from '@/contexts/ThemeContext';

const SQLEditor = dynamic(() => import('@/components/SQLEditor'), { ssr: false });

interface Exercise {
  id: string;
  moduleId: string;
  type: 'write-query' | 'multiple-choice' | 'predict-result';
  title: string;
  description: string;
  difficulty: string;
  schema: string;
  question: string;
  options?: Array<{ id: string; text: string }>;
  hints?: string[];
}

export default function PracticePage() {
  const { themeId, toggleTheme } = useTheme();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [answer, setAnswer] = useState('');
  const [selectedOption, setSelectedOption] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [showHints, setShowHints] = useState(false);

  useEffect(() => {
    fetchExercises();
  }, []);

  const fetchExercises = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/exercises`);
      const data = await response.json();
      setExercises(data);
    } catch (error) {
      console.error('Error fetching exercises:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectExercise = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    setAnswer('');
    setSelectedOption('');
    setResult(null);
    setShowHints(false);
  };

  const submitAnswer = async () => {
    if (!selectedExercise) return;

    const submittedAnswer = selectedExercise.type === 'write-query' ? answer : selectedOption;
    if (!submittedAnswer.trim()) {
      alert('Please provide an answer');
      return;
    }

    setSubmitting(true);
    setResult(null);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/exercises/${selectedExercise.id}/submit`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ answer: submittedAnswer }),
        }
      );

      const data = await response.json();
      setResult(data);
    } catch (error: any) {
      alert(`Error submitting answer: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const getProgress = () => {
    if (typeof window === 'undefined') return {};
    const stored = localStorage.getItem('visualsql-progress');
    return stored ? JSON.parse(stored) : {};
  };

  const saveProgress = (exerciseId: string, isCorrect: boolean) => {
    if (typeof window === 'undefined') return;
    const progress = getProgress();
    progress[exerciseId] = { completed: isCorrect, timestamp: Date.now() };
    localStorage.setItem('visualsql-progress', JSON.stringify(progress));
  };

  useEffect(() => {
    if (result && selectedExercise) {
      saveProgress(selectedExercise.id, result.isCorrect);
    }
  }, [result, selectedExercise]);

  const progress = getProgress();
  const completedCount = Object.values(progress).filter((p: any) => p.completed).length;

  return (
    <>
      <Head>
        <title>Practice Exercises - VisualSQL</title>
      </Head>

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <header className="bg-white dark:bg-gray-800 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link href="/" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                </Link>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Practice Exercises</h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Progress: {completedCount} / {exercises.length} completed
                  </p>
                </div>
              </div>
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
                title={`Switch to ${themeId === 'light' ? 'dark' : 'light'} mode`}
              >
                {themeId === 'light' ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Exercise List */}
            <div className="lg:col-span-1 space-y-3">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">All Exercises</h2>
              {loading ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                exercises.map((exercise) => {
                  const isCompleted = progress[exercise.id]?.completed;
                  const isSelected = selectedExercise?.id === exercise.id;

                  return (
                    <button
                      key={exercise.id}
                      onClick={() => selectExercise(exercise)}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-1">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                          exercise.difficulty === 'easy' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                          exercise.difficulty === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' :
                          'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                        }`}>
                          {exercise.difficulty}
                        </span>
                        {isCompleted && (
                          <span className="text-green-600 dark:text-green-400">✓</span>
                        )}
                      </div>
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm mb-1">{exercise.title}</h3>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{exercise.type.replace('-', ' ')}</p>
                    </button>
                  );
                })
              )}
            </div>

            {/* Exercise Detail */}
            <div className="lg:col-span-2">
              {!selectedExercise ? (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-12 text-center">
                  <p className="text-gray-500 dark:text-gray-400">Select an exercise to begin</p>
                </div>
              ) : (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">{selectedExercise.title}</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">{selectedExercise.description}</p>
                    <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 dark:border-blue-700 p-4 rounded">
                      <p className="text-sm font-medium text-blue-900 dark:text-blue-200">{selectedExercise.question}</p>
                    </div>
                  </div>

                  {/* Answer Section */}
                  {selectedExercise.type === 'write-query' && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Your SQL Query:
                      </label>
                      <SQLEditor value={answer} onChange={setAnswer} height="150px" />
                    </div>
                  )}

                  {selectedExercise.type === 'multiple-choice' && (
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Choose your answer:
                      </label>
                      {selectedExercise.options?.map((option) => (
                        <button
                          key={option.id}
                          onClick={() => setSelectedOption(option.id)}
                          className={`w-full text-left p-4 rounded-lg border-2 transition-all text-gray-900 dark:text-gray-100 ${
                            selectedOption === option.id
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                          }`}
                        >
                          <span className="font-semibold mr-2">{option.id.toUpperCase()}.</span>
                          {option.text}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Hints */}
                  {selectedExercise.hints && selectedExercise.hints.length > 0 && (
                    <div>
                      <button
                        onClick={() => setShowHints(!showHints)}
                        className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        {showHints ? 'Hide' : 'Show'} Hints
                      </button>
                      {showHints && (
                        <div className="mt-2 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 dark:border-yellow-700 p-4 rounded">
                          <ul className="list-disc list-inside space-y-1">
                            {selectedExercise.hints.map((hint, idx) => (
                              <li key={idx} className="text-sm text-yellow-900 dark:text-yellow-200">{hint}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    onClick={submitAnswer}
                    disabled={submitting || (!answer.trim() && !selectedOption)}
                    className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Checking...' : 'Submit Answer'}
                  </button>

                  {/* Result */}
                  {result && (
                    <div className={`p-4 rounded-lg border-l-4 ${
                      result.isCorrect
                        ? 'bg-green-50 dark:bg-green-900/20 border-green-500 dark:border-green-700'
                        : 'bg-red-50 dark:bg-red-900/20 border-red-500 dark:border-red-700'
                    }`}>
                      <h3 className={`font-semibold mb-2 ${
                        result.isCorrect ? 'text-green-900 dark:text-green-200' : 'text-red-900 dark:text-red-200'
                      }`}>
                        {result.isCorrect ? '✓ Correct!' : '✗ Incorrect'}
                      </h3>
                      <p className={`text-sm ${
                        result.isCorrect ? 'text-green-800 dark:text-green-300' : 'text-red-800 dark:text-red-300'
                      }`}>
                        {result.feedback}
                      </p>

                      {!result.isCorrect && result.expectedResult && (
                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Expected Result:</p>
                          <div className="overflow-x-auto text-xs">
                            <pre className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-2 rounded">
                              {JSON.stringify(result.expectedResult.rows, null, 2)}
                            </pre>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
