import { motion, AnimatePresence } from 'framer-motion';

interface HintsPanelProps {
  hints: string[];
  revealedCount: number;
  onRevealNext: () => void;
  onReset: () => void;
}

export default function HintsPanel({ hints, revealedCount, onRevealNext, onReset }: HintsPanelProps) {
  const hasMore = revealedCount < hints.length;
  const progress = (revealedCount / hints.length) * 100;

  return (
    <div className="bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/10 dark:to-amber-900/10 border-2 border-yellow-300 dark:border-yellow-700 rounded-lg p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="bg-yellow-400 dark:bg-yellow-600 rounded-lg p-2">
            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-yellow-900 dark:text-yellow-100">Progressive Hints</h3>
            <p className="text-xs sm:text-sm text-yellow-700 dark:text-yellow-300">
              {revealedCount} of {hints.length} hints revealed
            </p>
          </div>
        </div>
        {revealedCount > 0 && (
          <button
            onClick={onReset}
            className="text-xs sm:text-sm text-yellow-700 dark:text-yellow-300 hover:text-yellow-900 dark:hover:text-yellow-100 font-medium underline"
          >
            Reset
          </button>
        )}
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="h-2 bg-yellow-200 dark:bg-yellow-800/30 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-yellow-400 to-amber-500"
          />
        </div>
      </div>

      {/* Hints List */}
      <div className="space-y-3 mb-4">
        <AnimatePresence>
          {hints.slice(0, revealedCount).map((hint, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20, height: 0 }}
              animate={{ opacity: 1, x: 0, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 border border-yellow-200 dark:border-yellow-700 rounded-lg p-3 sm:p-4"
            >
              <div className="flex items-start gap-2 sm:gap-3">
                <div className="bg-yellow-100 dark:bg-yellow-900/30 rounded-full p-1.5 sm:p-2 flex-shrink-0">
                  <span className="text-xs sm:text-sm font-bold text-yellow-700 dark:text-yellow-300">
                    {index + 1}
                  </span>
                </div>
                <p className="text-sm sm:text-base text-gray-800 dark:text-gray-200 flex-1 mt-0.5">
                  {hint}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {revealedCount === 0 && (
          <div className="text-center py-8">
            <svg className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-yellow-300 dark:text-yellow-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <p className="text-sm sm:text-base text-yellow-700 dark:text-yellow-300 font-medium">
              Click "Reveal Hint" below to get started!
            </p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
        {hasMore ? (
          <button
            onClick={onRevealNext}
            className="flex-1 px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-yellow-400 to-amber-500 text-white font-semibold rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            Reveal Next Hint ({revealedCount + 1}/{hints.length})
          </button>
        ) : (
          <div className="flex-1 px-4 sm:px-6 py-2 sm:py-3 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 font-semibold rounded-lg flex items-center justify-center gap-2 text-sm sm:text-base">
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            All Hints Revealed!
          </div>
        )}
      </div>

      {/* Info Footer */}
      <div className="mt-4 pt-4 border-t border-yellow-200 dark:border-yellow-700">
        <p className="text-xs text-yellow-700 dark:text-yellow-400 flex items-center gap-2">
          <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <span>Hints are revealed progressively to help you learn without giving away the solution.</span>
        </p>
      </div>
    </div>
  );
}
