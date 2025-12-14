import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';

interface KeyboardShortcutsProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Shortcut {
  keys: string[];
  description: string;
}

interface ShortcutCategory {
  category: string;
  shortcuts: Shortcut[];
}

const shortcuts: ShortcutCategory[] = [
  {
    category: 'Query Execution',
    shortcuts: [
      { keys: ['Ctrl', 'Enter'], description: 'Execute query' },
      { keys: ['Ctrl', 'Shift', 'Enter'], description: 'Execute and save to history' },
      { keys: ['Esc'], description: 'Stop execution / Close modals' },
    ],
  },
  {
    category: 'Editor',
    shortcuts: [
      { keys: ['Ctrl', 'Shift', 'F'], description: 'Format SQL query' },
      { keys: ['Ctrl', 'Z'], description: 'Undo' },
      { keys: ['Ctrl', 'Y'], description: 'Redo' },
      { keys: ['Ctrl', 'A'], description: 'Select all' },
      { keys: ['Ctrl', 'C'], description: 'Copy' },
      { keys: ['Ctrl', 'V'], description: 'Paste' },
      { keys: ['Ctrl', 'X'], description: 'Cut' },
    ],
  },
  {
    category: 'Visualization',
    shortcuts: [
      { keys: ['Space'], description: 'Play/pause visualization' },
      { keys: ['←'], description: 'Previous step' },
      { keys: ['→'], description: 'Next step' },
      { keys: ['Home'], description: 'First step' },
      { keys: ['End'], description: 'Last step' },
    ],
  },
  {
    category: 'Navigation',
    shortcuts: [
      { keys: ['Ctrl', 'H'], description: 'Toggle query history' },
      { keys: ['Ctrl', 'T'], description: 'Toggle query templates' },
      { keys: ['Ctrl', 'B'], description: 'Toggle schema browser' },
      { keys: ['Ctrl', 'M'], description: 'Toggle module content' },
      { keys: ['Ctrl', 'D'], description: 'Toggle dark mode' },
    ],
  },
  {
    category: 'Export & Data',
    shortcuts: [
      { keys: ['Ctrl', 'E'], description: 'Export results as CSV' },
      { keys: ['Ctrl', 'Shift', 'E'], description: 'Export results as JSON' },
      { keys: ['Ctrl', 'R'], description: 'Get row count' },
    ],
  },
  {
    category: 'Help',
    shortcuts: [
      { keys: ['?'], description: 'Show this help panel' },
      { keys: ['Ctrl', '/'], description: 'Show keyboard shortcuts' },
    ],
  },
];

export default function KeyboardShortcuts({ isOpen, onClose }: KeyboardShortcutsProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 pointer-events-none"
          >
            <div
              className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] sm:max-h-[85vh] overflow-hidden pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="bg-white/20 rounded-lg p-1.5 sm:p-2">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-white">Keyboard Shortcuts</h2>
                    <p className="text-indigo-100 text-xs sm:text-sm hidden sm:block">Master VisualSQL with these shortcuts</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="text-white hover:bg-white/20 rounded-lg p-1.5 sm:p-2 transition-colors"
                  aria-label="Close"
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Content */}
              <div className="overflow-y-auto max-h-[calc(90vh-80px)] sm:max-h-[calc(85vh-80px)] p-3 sm:p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-6">
                  {shortcuts.map((category, idx) => (
                    <motion.div
                      key={category.category}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 sm:p-4"
                    >
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2 sm:mb-3 flex items-center gap-2">
                        <span className="w-1 h-5 sm:h-6 bg-indigo-500 rounded"></span>
                        {category.category}
                      </h3>
                      <div className="space-y-1.5 sm:space-y-2">
                        {category.shortcuts.map((shortcut, sIdx) => (
                          <div
                            key={sIdx}
                            className="flex items-center justify-between gap-2 sm:gap-3 py-1.5 sm:py-2 border-b border-gray-200 dark:border-gray-600 last:border-0"
                          >
                            <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 flex-1">
                              {shortcut.description}
                            </span>
                            <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
                              {shortcut.keys.map((key, kIdx) => (
                                <span key={kIdx} className="flex items-center">
                                  <kbd className="px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs font-semibold text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded shadow-sm">
                                    {key}
                                  </kbd>
                                  {kIdx < shortcut.keys.length - 1 && (
                                    <span className="mx-0.5 sm:mx-1 text-gray-400 text-xs">+</span>
                                  )}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Footer tip */}
                <div className="mt-4 sm:mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 sm:p-4">
                  <div className="flex items-start gap-2 sm:gap-3">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <div className="flex-1">
                      <p className="text-xs sm:text-sm font-medium text-blue-900 dark:text-blue-100">Pro Tip</p>
                      <p className="text-xs sm:text-sm text-blue-800 dark:text-blue-200 mt-1">
                        Press <kbd className="px-1 sm:px-1.5 py-0.5 text-xs font-semibold bg-white dark:bg-gray-800 border border-blue-300 dark:border-blue-700 rounded\">?</kbd> or{' '}
                        <kbd className="px-1 sm:px-1.5 py-0.5 text-xs font-semibold bg-white dark:bg-gray-800 border border-blue-300 dark:border-blue-700 rounded\">Ctrl</kbd>
                        {' + '}
                        <kbd className="px-1 sm:px-1.5 py-0.5 text-xs font-semibold bg-white dark:bg-gray-800 border border-blue-300 dark:border-blue-700 rounded\">/</kbd>
                        {' '}anytime to view these shortcuts.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
