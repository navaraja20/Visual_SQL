import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import TableView from './TableView';

interface JoinVisualizationProps {
  step: {
    leftTable: any;
    rightTable: any;
    joinType: string;
    condition: string;
    matchedPairs: Array<[number, number]>;
    unmatchedLeft: number[];
    unmatchedRight: number[];
    resultTable: any;
    description: string;
  };
}

export default function JoinVisualization({ step }: JoinVisualizationProps) {
  const [animatedPairs, setAnimatedPairs] = useState<number>(0);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    // Animate matches one by one
    setAnimatedPairs(0);
    setShowResult(false);
    
    const animateMatches = async () => {
      for (let i = 0; i <= step.matchedPairs.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 600));
        setAnimatedPairs(i);
      }
      // Show result after all matches are animated
      setTimeout(() => setShowResult(true), 300);
    };
    
    animateMatches();
  }, [step.matchedPairs.length]);

  return (
    <div className="space-y-6">
      {/* Join Type and Condition Banner */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/10 dark:to-pink-900/10 border-2 border-purple-300 dark:border-purple-700 p-4 rounded-lg shadow-lg"
      >
        <div className="flex items-start gap-3">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-2 rounded-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          </motion.div>
          <div className="flex-1">
            <p className="text-xs font-bold text-purple-700 dark:text-purple-400 uppercase tracking-wide mb-1">Join Operation</p>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-bold text-purple-900 dark:text-purple-200 bg-white dark:bg-gray-800 px-3 py-1 rounded-full border border-purple-200 dark:border-purple-700">
                {step.joinType}
              </span>
              <span className="text-xs text-purple-700 dark:text-purple-400">on</span>
              <code className="text-sm font-mono font-semibold text-purple-900 dark:text-purple-200 bg-white dark:bg-gray-800 px-3 py-1 rounded border border-purple-200 dark:border-purple-700">
                {step.condition}
              </code>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Side by Side Tables with Connections */}
      <div className="relative">
        <div className="grid grid-cols-2 gap-12">
          {/* Left Table */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="relative"
          >
            <h4 className="text-sm font-semibold text-gray-700 mb-2">
              Left Table: {step.leftTable.name}
            </h4>
            <TableView
              table={{
                ...step.leftTable,
                highlightRows: step.matchedPairs.slice(0, animatedPairs).map(p => p[0]),
                dimRows: step.unmatchedLeft,
              }}
            />
          </motion.div>

          {/* Right Table */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h4 className="text-sm font-semibold text-gray-700 mb-2">
              Right Table: {step.rightTable.name}
            </h4>
            <TableView
              table={{
                ...step.rightTable,
                highlightRows: step.matchedPairs.slice(0, animatedPairs).map(p => p[1]),
                dimRows: step.unmatchedRight,
              }}
            />
          </motion.div>
        </div>

        {/* Animated Connection Lines */}
        <svg className="absolute top-0 left-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
          <AnimatePresence>
            {step.matchedPairs.slice(0, animatedPairs).map((pair, idx) => {
              const leftY = 80 + pair[0] * 35; // Approximate row height
              const rightY = 80 + pair[1] * 35;
              const midX = '50%';
              
              return (
                <motion.g key={idx}>
                  {/* Connection Line */}
                  <motion.path
                    d={`M 45% ${leftY} Q ${midX} ${leftY}, ${midX} ${(leftY + rightY) / 2} Q ${midX} ${rightY}, 55% ${rightY}`}
                    stroke="#10b981"
                    strokeWidth="2"
                    fill="none"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 0.6 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5, delay: idx * 0.1 }}
                  />
                  {/* Animated Circle */}
                  <motion.circle
                    r="4"
                    fill="#10b981"
                    initial={{ offsetDistance: '0%' }}
                    animate={{ offsetDistance: '100%' }}
                    transition={{ duration: 0.5, delay: idx * 0.1 }}
                  >
                    <animateMotion
                      dur="0.5s"
                      begin={`${idx * 0.1}s`}
                      fill="freeze"
                    >
                      <mpath href={`#path-${idx}`} />
                    </animateMotion>
                  </motion.circle>
                  <path
                    id={`path-${idx}`}
                    d={`M 45% ${leftY} Q ${midX} ${leftY}, ${midX} ${(leftY + rightY) / 2} Q ${midX} ${rightY}, 55% ${rightY}`}
                    fill="none"
                  />
                </motion.g>
              );
            })}
          </AnimatePresence>
        </svg>
      </div>

      {/* Match Statistics */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-gray-50 p-4 rounded-lg"
      >
        <h4 className="text-sm font-semibold text-gray-700 mb-2">Join Statistics</h4>
        <div className="space-y-2">
          {step.matchedPairs.length > 0 ? (
            <>
              <motion.p 
                className="text-sm text-green-700 flex items-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
              >
                <span className="mr-2">✓</span>
                <span>{animatedPairs} / {step.matchedPairs.length} matching row pair(s)</span>
              </motion.p>
              {step.joinType === 'LEFT' && step.unmatchedLeft.length > 0 && (
                <motion.p 
                  className="text-sm text-yellow-700 flex items-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.2 }}
                >
                  <span className="mr-2">⚠</span>
                  <span>{step.unmatchedLeft.length} left row(s) without match (included with NULLs)</span>
                </motion.p>
              )}
            </>
          ) : (
            <p className="text-sm text-red-700 flex items-center">
              <span className="mr-2">✗</span>
              <span>No matching rows found</span>
            </p>
          )}
        </div>
      </motion.div>

      {/* Result Table */}
      <AnimatePresence>
        {showResult && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg border-2 border-green-200">
              <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                <span className="mr-2 text-green-600">🎯</span>
                Join Result
              </h4>
              <TableView table={step.resultTable} />
              <p className="text-xs text-gray-600 mt-2">
                {step.resultTable.rows.length} row(s) in final result
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
