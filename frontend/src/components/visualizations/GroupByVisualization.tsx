import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import TableView from './TableView';

interface GroupByVisualizationProps {
  step: {
    table: any;
    groupKeys: string[];
    groups: Array<{
      key: Record<string, any>;
      rowIds: number[];
      aggregates: Record<string, any>;
    }>;
    resultTable: any;
    description: string;
  };
}

export default function GroupByVisualization({ step }: GroupByVisualizationProps) {
  const [visibleGroups, setVisibleGroups] = useState<number>(0);
  const [showResult, setShowResult] = useState(false);
  
  const colors = [
    { bg: 'bg-blue-100', border: 'border-blue-400', text: 'text-blue-700' },
    { bg: 'bg-green-100', border: 'border-green-400', text: 'text-green-700' },
    { bg: 'bg-purple-100', border: 'border-purple-400', text: 'text-purple-700' },
    { bg: 'bg-orange-100', border: 'border-orange-400', text: 'text-orange-700' },
    { bg: 'bg-pink-100', border: 'border-pink-400', text: 'text-pink-700' },
  ];

  useEffect(() => {
    setVisibleGroups(0);
    setShowResult(false);
    
    // Animate groups one by one
    const animateGroups = async () => {
      for (let i = 0; i <= step.groups.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 600));
        setVisibleGroups(i);
      }
      setTimeout(() => setShowResult(true), 300);
    };
    
    animateGroups();
  }, [step.groups.length]);

  return (
    <div className="space-y-6">
      {/* Group By Keys Banner */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10 border-2 border-green-300 dark:border-green-700 p-4 rounded-lg shadow-lg"
      >
        <div className="flex items-start gap-3">
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-2 rounded-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </motion.div>
          <div className="flex-1">
            <p className="text-xs font-bold text-green-700 dark:text-green-400 uppercase tracking-wide mb-1">Group By Columns</p>
            <div className="flex items-center gap-2 flex-wrap">
              {step.groupKeys.map((key, idx) => (
                <motion.code
                  key={idx}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2 + idx * 0.1, type: 'spring' }}
                  className="text-sm font-mono font-semibold text-green-900 dark:text-green-200 bg-white dark:bg-gray-800 px-3 py-1 rounded border border-green-200 dark:border-green-700"
                >
                  {key}
                </motion.code>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Progress Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-gray-50 p-4 rounded-lg"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-gray-700">Forming Groups</span>
          <span className="text-sm text-gray-600">{visibleGroups} / {step.groups.length}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <motion.div
            className="bg-indigo-600 h-full"
            initial={{ width: 0 }}
            animate={{ width: `${(visibleGroups / step.groups.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </motion.div>

      {/* Animated Groups */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-3">
          Rows Grouped Together
        </h4>
        <div className="space-y-4">
          <AnimatePresence>
            {step.groups.slice(0, visibleGroups).map((group, groupIdx) => {
              const color = colors[groupIdx % colors.length];
              
              return (
                <motion.div
                  key={groupIdx}
                  initial={{ opacity: 0, x: -30, scale: 0.9 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ 
                    duration: 0.4,
                    type: 'spring',
                    stiffness: 100,
                  }}
                  className={`p-4 rounded-lg border-2 ${color.bg} ${color.border} shadow-sm hover:shadow-md transition-shadow`}
                >
                  {/* Group Header */}
                  <motion.div 
                    className="mb-3 flex items-center justify-between"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <div>
                      <span className={`text-sm font-bold ${color.text}`}>
                        Group {groupIdx + 1}
                      </span>
                      <div className="text-sm text-gray-700 mt-1">
                        {Object.entries(group.key).map(([key, value], idx) => (
                          <span key={idx}>
                            <span className="font-medium">{key}</span> = <strong>{String(value)}</strong>
                            {idx < Object.entries(group.key).length - 1 && ', '}
                          </span>
                        ))}
                      </div>
                    </div>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.3, type: 'spring' }}
                      className={`px-3 py-1 rounded-full ${color.bg} ${color.border} border`}
                    >
                      <span className={`text-xs font-semibold ${color.text}`}>
                        {group.rowIds.length} rows
                      </span>
                    </motion.div>
                  </motion.div>
                  
                  {/* Group Data */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <TableView
                      table={{
                        name: 'group',
                        rows: group.rowIds.map(rowId => step.table.rows[rowId]),
                      }}
                    />
                  </motion.div>

                  {/* Aggregate Info */}
                  {Object.keys(group.aggregates).length > 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      className="mt-3 pt-3 border-t border-gray-300"
                    >
                      <div className="text-xs text-gray-600 space-x-3">
                        {Object.entries(group.aggregates).map(([key, value], idx) => (
                          <span key={idx} className="inline-flex items-center">
                            <span className="font-semibold">{key}:</span>
                            <span className="ml-1">{String(value)}</span>
                          </span>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* Aggregated Result */}
      <AnimatePresence>
        {showResult && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, type: 'spring' }}
          >
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-lg border-2 border-indigo-200">
              <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                <span className="mr-2 text-indigo-600">🎯</span>
                Aggregated Result
              </h4>
              <TableView table={step.resultTable} />
              <p className="text-xs text-gray-600 mt-2">
                {step.groups.length} group(s) aggregated into {step.resultTable.rows.length} result row(s)
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
