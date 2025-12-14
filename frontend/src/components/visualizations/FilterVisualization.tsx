import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import TableView from './TableView';

interface FilterVisualizationProps {
  step: {
    table: any;
    condition: string;
    keptRows: number[];
    filteredOutRows: number[];
    resultTable: any;
    description: string;
  };
}

export default function FilterVisualization({ step }: FilterVisualizationProps) {
  const [evaluatedRows, setEvaluatedRows] = useState<number>(0);
  const [showResult, setShowResult] = useState(false);
  const totalRows = step.table.rows.length;

  useEffect(() => {
    setEvaluatedRows(0);
    setShowResult(false);
    
    // Animate row-by-row evaluation
    const animateEvaluation = async () => {
      for (let i = 0; i <= totalRows; i++) {
        await new Promise(resolve => setTimeout(resolve, 300));
        setEvaluatedRows(i);
      }
      setTimeout(() => setShowResult(true), 200);
    };
    
    animateEvaluation();
  }, [totalRows]);

  return (
    <div className="space-y-6">
      {/* Condition Banner with Icon */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/10 dark:to-red-900/10 border-2 border-orange-300 dark:border-orange-700 p-4 rounded-lg shadow-lg"
      >
        <div className="flex items-start gap-3">
          <motion.div
            animate={{ rotate: [0, 10, 0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="bg-orange-500 text-white p-2 rounded-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
          </motion.div>
          <div className="flex-1">
            <p className="text-xs font-bold text-orange-700 dark:text-orange-400 uppercase tracking-wide mb-1">Filter Condition</p>
            <code className="block text-sm font-mono font-semibold text-orange-900 dark:text-orange-200 bg-white dark:bg-gray-800 px-3 py-2 rounded border border-orange-200 dark:border-orange-700">
              {step.condition}
            </code>
          </div>
        </div>
      </motion.div>

      {/* Evaluation Progress */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-gray-50 p-4 rounded-lg"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-gray-700">Evaluating Rows</span>
          <span className="text-sm text-gray-600">{evaluatedRows} / {totalRows}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <motion.div
            className="bg-blue-600 h-full"
            initial={{ width: 0 }}
            animate={{ width: `${(evaluatedRows / totalRows) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </motion.div>

      {/* Table with Row-by-Row Highlighting */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h4 className="text-sm font-semibold text-gray-700 mb-2">
          Evaluating Each Row
        </h4>
        <div className="overflow-hidden rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  #
                </th>
                {step.table.rows[0] && Object.keys(step.table.rows[0]).map((key: string) => (
                  <th key={key} className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    {key}
                  </th>
                ))}
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Result
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {step.table.rows.map((row: any, idx: number) => {
                const isEvaluated = idx < evaluatedRows;
                const isKept = step.keptRows.includes(idx);
                const isFiltered = step.filteredOutRows.includes(idx);
                
                return (
                  <motion.tr
                    key={idx}
                    initial={{ backgroundColor: '#ffffff' }}
                    animate={{
                      backgroundColor: isEvaluated
                        ? isKept
                          ? '#d1fae5'
                          : '#fee2e2'
                        : '#ffffff',
                    }}
                    transition={{ duration: 0.3 }}
                    className={!isEvaluated ? 'opacity-50' : ''}
                  >
                    <td className="px-3 py-2 text-sm text-gray-900">{idx + 1}</td>
                    {Object.values(row).map((value: any, cellIdx: number) => (
                      <td key={cellIdx} className="px-3 py-2 text-sm text-gray-900">
                        {value !== null && value !== undefined ? String(value) : 'NULL'}
                      </td>
                    ))}
                    <td className="px-3 py-2 text-sm font-semibold">
                      {isEvaluated && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className={isKept ? 'text-green-600' : 'text-red-600'}
                        >
                          {isKept ? '✓ Keep' : '✗ Filter'}
                        </motion.span>
                      )}
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        <motion.div 
          className="mt-3 flex items-center space-x-4 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <span className="text-green-700 flex items-center">
            <span className="mr-1">✓</span>
            {step.keptRows.length} row(s) match
          </span>
          <span className="text-red-700 flex items-center">
            <span className="mr-1">✗</span>
            {step.filteredOutRows.length} row(s) filtered out
          </span>
        </motion.div>
      </motion.div>

      {/* Result Table */}
      <AnimatePresence>
        {showResult && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg border-2 border-green-200">
              <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                <span className="mr-2 text-green-600">🎯</span>
                Filtered Result
              </h4>
              <TableView table={step.resultTable} />
              <p className="text-xs text-gray-600 mt-2">
                {step.resultTable.rows.length} row(s) remain after filtering
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
